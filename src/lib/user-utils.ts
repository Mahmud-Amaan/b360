import { db } from "@/lib/db";
import { user } from "@/db/schema";
import { eq, and, count } from "drizzle-orm";
import { createFreeSubscription } from "./subscription";

export interface UserData {
  id: string;
  email: string;
  name: string;
  image?: string | null;
}

/**
 * Ensures a user exists in the database, creating them if they don't exist
 */
export async function ensureUserExists(userData: UserData): Promise<boolean> {
  try {
    // Check if user exists
    const existingUser = await db
      .select({ id: user.id })
      .from(user)
      .where(eq(user.id, userData.id))
      .limit(1);

    if (existingUser.length === 0) {
      // User doesn't exist, create them
      await db.insert(user).values({
        id: userData.id,
        email: userData.email,
        name: userData.name,
        image: userData.image || null,
      });
      console.log(`Created user record for ${userData.email}`);

      // Create a default free subscription for the new user
      try {
        await createFreeSubscription(userData.id);
        console.log(`Created free subscription for new user: ${userData.id}`);
      } catch (subscriptionError) {
        console.error(`Failed to create subscription for user ${userData.id}:`, subscriptionError);
        // Don't throw here - user creation should still succeed even if subscription fails
      }
    }

    return true;
  } catch (error) {
    console.error("Error ensuring user exists:", error);
    return false;
  }
}

/**
 * Checks if a user exists in the database
 */
export async function userExists(userId: string): Promise<boolean> {
  try {
    const existingUser = await db
      .select({ id: user.id })
      .from(user)
      .where(eq(user.id, userId))
      .limit(1);

    return existingUser.length > 0;
  } catch (error) {
    console.error("Error checking if user exists:", error);
    return false;
  }
}

import { getServerSession } from "next-auth";
import { authOptions } from "./auth";
import { chatbot, subscriptionUsage, agent } from "@/db/schema";
import { getCurrentBillingPeriod } from "@/lib/billing";

export async function getDashboardAnalytics() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return null;
    }

    const userId = session.user.id;

    // Get user creation date for billing period calculation
    const [currentUser] = await db
      .select({ createdAt: user.createdAt })
      .from(user)
      .where(eq(user.id, userId));

    if (!currentUser) {
      return null;
    }

    const { periodKey } = getCurrentBillingPeriod(currentUser.createdAt);

    // Use subscriptionUsage table to get total messages for the current period
    const [totalMessages] = await db
      .select({ messageCount: subscriptionUsage.messageCount })
      .from(subscriptionUsage)
      .where(
        and(
          eq(subscriptionUsage.userId, userId),
          eq(subscriptionUsage.period, periodKey)
        )
      );

    const [activeChatbots] = await db
      .select({ count: count() })
      .from(chatbot)
      .where(and(eq(chatbot.userId, userId), eq(chatbot.isActive, true)));

    const [activeCallAgents] = await db
      .select({ count: count() })
      .from(agent)
      .where(and(eq(agent.userId, userId), eq(agent.isActive, true)));

    return {
      stats: {
        totalMessages: totalMessages?.messageCount || 0,
        activeChatbots: activeChatbots.count || 0,
        activeCallAgents: activeCallAgents.count || 0,
      },
    };
  } catch (error) {
    console.error("Dashboard analytics error:", error);
    return null;
  }
}
