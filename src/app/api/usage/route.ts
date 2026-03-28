import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/db";
import { user, chatbot, subscriptionUsage } from "@/db/schema";
import { eq, and, count } from "drizzle-orm";
import { getCurrentBillingPeriod } from "@/lib/billing";
import { plans } from "@/lib/config/plans";
import { getOrCreateUserSubscription, hasActiveSubscription } from "@/lib/subscription";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    // Get user creation date for billing period calculation
    const [currentUser] = await db
      .select({ createdAt: user.createdAt })
      .from(user)
      .where(eq(user.id, userId));

    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { periodKey } = getCurrentBillingPeriod(currentUser.createdAt);

    // Get usage data from subscriptionUsage table
    const [usageRecord] = await db
      .select({
        messageCount: subscriptionUsage.messageCount,
        chatbotCount: subscriptionUsage.chatbotCount,
      })
      .from(subscriptionUsage)
      .where(
        and(
          eq(subscriptionUsage.userId, userId),
          eq(subscriptionUsage.period, periodKey)
        )
      );

    // Get active chatbots count
    const [activeChatbots] = await db
      .select({ count: count() })
      .from(chatbot)
      .where(and(eq(chatbot.userId, userId), eq(chatbot.isActive, true)));

    // Get user's subscription to determine their plan
    const userSubscription = await getOrCreateUserSubscription(userId);
    const hasActivePaidSubscription = await hasActiveSubscription(userId);

    // Determine the plan based on subscription status
    const plan = hasActivePaidSubscription && userSubscription.plan === "pro" ? "pro" : "free";
    const planLimits = plans[plan].limits;

    const usage = {
      messages: {
        used: usageRecord?.messageCount || 0,
        limit: planLimits.messages,
      },
      chatbots: {
        used: activeChatbots.count || 0,
        limit: planLimits.chatbots,
      },
      plan,
    };

    return NextResponse.json(usage);
  } catch (error) {
    console.error("Error fetching usage:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
