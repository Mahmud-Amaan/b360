
import { db } from "./db";
import { subscription, user } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { stripe, createStripeCustomer } from "./stripe-server";
import type Stripe from "stripe";

// Helper to safely convert Stripe timestamp to Date
function SAFE_DATE(timestamp: number | null | undefined): Date | null {
  if (!timestamp) return null;
  const date = new Date(timestamp * 1000);
  return isNaN(date.getTime()) ? null : date;
}

export interface SubscriptionData {
  id: string;
  userId: string;
  plan: string;
  status: string;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  stripePriceId: string | null;
  currentPeriodStart: Date | null;
  currentPeriodEnd: Date | null;
  cancelAtPeriodEnd: boolean;
}

// Get user's subscription
export async function getUserSubscription(
  userId: string
): Promise<SubscriptionData | null> {
  const [userSubscription] = await db
    .select()
    .from(subscription)
    .where(eq(subscription.userId, userId))
    .limit(1);

  return userSubscription || null;
}

// Create default free subscription for new users
export async function createFreeSubscription(userId: string): Promise<SubscriptionData> {
  const subscriptionData = {
    userId,
    plan: "free",
    status: "active",
    stripeCustomerId: null,
    stripeSubscriptionId: null,
    stripePriceId: null,
    currentPeriodStart: null,
    currentPeriodEnd: null,
    cancelAtPeriodEnd: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const [newSubscription] = await db
    .insert(subscription)
    .values(subscriptionData)
    .returning();

  return newSubscription;
}

// Get or create user subscription (ensures every user has a subscription)
export async function getOrCreateUserSubscription(
  userId: string
): Promise<SubscriptionData> {
  let userSubscription = await getUserSubscription(userId);

  if (!userSubscription) {
    userSubscription = await createFreeSubscription(userId);
  }

  return userSubscription;
}

// Create or update subscription from Stripe webhook
export async function upsertSubscription(
  userId: string,
  stripeSubscription: Stripe.Subscription
): Promise<SubscriptionData> {
  // Ensure priceId is a string, handle if it's an object (though usually expanded only if requested)
  // Casting 'stripeSubscription' to any because sometimes types from Stripe SDK can be tricky with expansions
  const subAny = stripeSubscription as any;
  const priceId =
    typeof subAny.items.data[0]?.price === "string"
      ? subAny.items.data[0]?.price
      : subAny.items.data[0]?.price?.id;
  const plan = priceId === process.env.NEXT_PUBLIC_STRIPE_PRICE_ID ? "pro" : "free";

  const currentPeriodStart = SAFE_DATE(subAny.current_period_start) || new Date();
  const currentPeriodEnd = SAFE_DATE(subAny.current_period_end) || new Date();

  console.log(`[upsertSubscription] Dates for ${stripeSubscription.id}: Start = ${currentPeriodStart.toISOString()}, End = ${currentPeriodEnd.toISOString()} `);

  const subscriptionData = {
    userId,
    plan,
    status: stripeSubscription.status,
    stripeCustomerId: stripeSubscription.customer as string,
    stripeSubscriptionId: stripeSubscription.id,
    stripePriceId: priceId || null,
    currentPeriodStart,
    currentPeriodEnd,
    cancelAtPeriodEnd: subAny.cancel_at_period_end || false,
    updatedAt: new Date(),
  };

  // Check if subscription already exists
  // Priority 1: Check by Stripe Subscription ID (Most specific)
  let [existingSubscription] = await db
    .select()
    .from(subscription)
    .where(eq(subscription.stripeSubscriptionId, stripeSubscription.id))
    .limit(1);

  // Priority 2: Check by Stripe Customer ID (Next specific)
  if (!existingSubscription) {
    [existingSubscription] = await db
      .select()
      .from(subscription)
      .where(eq(subscription.stripeCustomerId, stripeSubscription.customer as string))
      .limit(1);
  }

  // Priority 3: Check by User ID (Fallback for fresh upgrades)
  // Only do this if we didn't find a "Pro" record already.
  // This prevents us from grabbing a "Free" row and trying to update it
  // with a Customer ID that already exists on a "Pro" row (hidden duplicate).
  if (!existingSubscription) {
    [existingSubscription] = await db
      .select()
      .from(subscription)
      .where(eq(subscription.userId, userId))
      .limit(1);
  }

  if (existingSubscription) {
    // Update existing subscription
    try {
      const [updatedSubscription] = await db
        .update(subscription)
        .set(subscriptionData)
        .where(eq(subscription.id, existingSubscription.id))
        .returning();
      return updatedSubscription;
    } catch (error: any) {
      // Handle race condition where unique constraint is violated
      if (error.code === '23505' && error.constraint === 'subscription_stripe_customer_id_unique') {
        console.log(`[upsertSubscription] Race condition detected: Customer ID ${stripeSubscription.customer} already exists on another row.`);
        // Fetch the row that won the race
        const [winner] = await db
          .select()
          .from(subscription)
          .where(eq(subscription.stripeCustomerId, stripeSubscription.customer as string))
          .limit(1);
        return winner;
      }
      throw error;
    }
  } else {
    // Create new subscription
    try {
      const [newSubscription] = await db
        .insert(subscription)
        .values({
          ...subscriptionData,
          createdAt: new Date(),
        })
        .returning();
      return newSubscription;
    } catch (error: any) {
      // Handle race condition where unique constraint is violated (another thread inserted first)
      if (error.code === '23505' && error.constraint === 'subscription_stripe_customer_id_unique') {
        console.log(`[upsertSubscription] Insert Race condition detected: Customer ID ${stripeSubscription.customer} already exists.`);
        const [winner] = await db
          .select()
          .from(subscription)
          .where(eq(subscription.stripeCustomerId, stripeSubscription.customer as string))
          .limit(1);
        return winner;
      }
      throw error;
    }
  }
}

// Cancel subscription
export async function cancelUserSubscription(
  userId: string,
  cancelAtPeriodEnd: boolean = true
): Promise<SubscriptionData | null> {
  const userSubscription = await getUserSubscription(userId);

  if (!userSubscription?.stripeSubscriptionId) {
    throw new Error("No active subscription found");
  }

  // Cancel in Stripe
  await stripe.subscriptions.update(userSubscription.stripeSubscriptionId, {
    cancel_at_period_end: cancelAtPeriodEnd,
  });

  // Update in database
  const [updatedSubscription] = await db
    .update(subscription)
    .set({
      cancelAtPeriodEnd,
      updatedAt: new Date(),
    })
    .where(eq(subscription.userId, userId))
    .returning();

  return updatedSubscription;
}

// Reactivate subscription
export async function reactivateUserSubscription(
  userId: string
): Promise<SubscriptionData | null> {
  const userSubscription = await getUserSubscription(userId);

  if (!userSubscription?.stripeSubscriptionId) {
    throw new Error("No subscription found");
  }

  // Reactivate in Stripe
  await stripe.subscriptions.update(userSubscription.stripeSubscriptionId, {
    cancel_at_period_end: false,
  });

  // Update in database
  const [updatedSubscription] = await db
    .update(subscription)
    .set({
      cancelAtPeriodEnd: false,
      updatedAt: new Date(),
    })
    .where(eq(subscription.userId, userId))
    .returning();

  return updatedSubscription;
}

// Get or create Stripe customer for user
export async function getOrCreateStripeCustomer(
  userId: string
): Promise<string> {
  // Get user data
  const [userData] = await db
    .select()
    .from(user)
    .where(eq(user.id, userId))
    .limit(1);

  if (!userData) {
    throw new Error("User not found");
  }

  // Check if user already has a subscription with Stripe customer ID
  const userSubscription = await getUserSubscription(userId);

  if (userSubscription?.stripeCustomerId) {
    return userSubscription.stripeCustomerId;
  }

  // Create new Stripe customer
  const stripeCustomer = await createStripeCustomer(
    userData.email!,
    userData.name || undefined
  );

  return stripeCustomer.id;
}

// Check if user has active subscription
export async function hasActiveSubscription(userId: string): Promise<boolean> {
  const userSubscription = await getOrCreateUserSubscription(userId);

  if (!userSubscription) {
    return false;
  }

  // Free plan is always considered "not active" for upgrade purposes
  // But should show as active for general status
  if (userSubscription.plan === "free") {
    return false; // Free plan users don't have "active" paid subscription
  }

  // For paid plans, check if subscription is active and not canceled
  const now = new Date();
  const isActive = userSubscription.status === "active" || userSubscription.status === "past_due";

  // If subscription is cancelled and we're past the end date, it's not active
  if (userSubscription.cancelAtPeriodEnd && userSubscription.currentPeriodEnd) {
    return userSubscription.currentPeriodEnd > now && isActive;
  }

  // For non-cancelled subscriptions, check if they're in active status
  return isActive;
}

// Get subscription status for display
export function getSubscriptionStatus(
  subscriptionData: SubscriptionData | null
): {
  status: "free" | "active" | "canceled" | "past_due" | "unpaid";
  label: string;
  description: string;
} {
  if (!subscriptionData) {
    return {
      status: "free",
      label: "Free Plan",
      description: "You are currently on the free plan.",
    };
  }

  if (subscriptionData.status === "active") {
    if (subscriptionData.cancelAtPeriodEnd) {
      return {
        status: "canceled",
        label: "Canceled",
        description: subscriptionData.currentPeriodEnd
          ? `Your subscription will end on ${subscriptionData.currentPeriodEnd.toLocaleDateString()}.`
          : "Your subscription has been cancelled.",
      };
    }
    return {
      status: "active",
      label: "Pro Plan",
      description: subscriptionData.currentPeriodEnd
        ? `Your subscription renews on ${subscriptionData.currentPeriodEnd.toLocaleDateString()}.`
        : "Your subscription is active.",
    };
  }

  if (subscriptionData.status === "past_due") {
    return {
      status: "past_due",
      label: "Past Due",
      description:
        "Your payment is past due. Please update your payment method.",
    };
  }

  if (subscriptionData.status === "unpaid") {
    return {
      status: "unpaid",
      label: "Unpaid",
      description:
        "Your subscription is unpaid. Please update your payment method.",
    };
  }

  return {
    status: "free",
    label: "Free Plan",
    description: "You are currently on the free plan.",
  };
}
