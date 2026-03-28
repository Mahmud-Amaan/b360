import { db } from "@/lib/db";
import {
  subscriptionUsage,
  subscription,
  chatbot,
  chatbotAnalytics,
  user,
} from "@/db/schema";
import { eq, and, count, sql } from "drizzle-orm";
import { userExists } from "@/lib/user-utils";
import { getBillingPeriodKey } from "@/lib/billing";

export interface PlanLimits {
  messages: number;
  chatbots: number;
}

export const PLAN_LIMITS: Record<string, PlanLimits> = {
  free: { messages: 20, chatbots: 1 },
  pro: { messages: 1000, chatbots: 10 },
};

export class UsageService {
  /**
   * Get current period string based on user's billing cycle
   */
  static async getCurrentPeriod(userId: string): Promise<string> {
    // Get user signup date
    const userRecord = await db
      .select({ createdAt: user.createdAt })
      .from(user)
      .where(eq(user.id, userId))
      .limit(1);

    if (userRecord.length === 0) {
      // Fallback to calendar month if user not found
      const now = new Date();
      return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(
        2,
        "0"
      )}`;
    }

    const signupDate = userRecord[0].createdAt || new Date();
    return getBillingPeriodKey(signupDate);
  }

  /**
   * Get user's current plan
   */
  static async getUserPlan(userId: string): Promise<string> {
    const userSubscription = await db
      .select({ plan: subscription.plan })
      .from(subscription)
      .where(eq(subscription.userId, userId))
      .orderBy(subscription.createdAt)
      .limit(1);

    return userSubscription[0]?.plan || "free";
  }

  /**
   * Get plan limits for a given plan
   */
  static getPlanLimits(plan: string): PlanLimits {
    return PLAN_LIMITS[plan] || PLAN_LIMITS.free;
  }

  /**
   * Initialize usage record for user and period
   */
  static async initializeUsageRecord(
    userId: string,
    period?: string
  ): Promise<void> {
    const currentPeriod = period || (await this.getCurrentPeriod(userId));

    // Check if user exists in database first
    const userExistsInDb = await userExists(userId);
    if (!userExistsInDb) {
      // User doesn't exist, skip creating usage record
      console.warn(
        `User ${userId} not found in database, skipping usage record creation`
      );
      return;
    }

    const existingRecord = await db
      .select({ id: subscriptionUsage.id })
      .from(subscriptionUsage)
      .where(
        and(
          eq(subscriptionUsage.userId, userId),
          eq(subscriptionUsage.period, currentPeriod)
        )
      )
      .limit(1);

    if (existingRecord.length === 0) {
      try {
        await db.insert(subscriptionUsage).values({
          userId,
          period: currentPeriod,
          messageCount: 0,
          chatbotCount: 0,
        });
      } catch (error) {
        console.error(`Error creating usage record for user ${userId}:`, error);
        // Don't throw error, just log it
      }
    }
  }

  /**
   * Increment message usage for user
   */
  static async incrementMessageUsage(
    userId: string,
    chatbotId: string,
    count: number = 1
  ): Promise<boolean> {
    const currentPeriod = await this.getCurrentPeriod(userId);
    await this.initializeUsageRecord(userId, currentPeriod);

    try {
      // Update subscription usage
      await db
        .update(subscriptionUsage)
        .set({
          messageCount: sql`${subscriptionUsage.messageCount} + ${count}`,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(subscriptionUsage.userId, userId),
            eq(subscriptionUsage.period, currentPeriod)
          )
        );

      // Update chatbot analytics
      const existingChatbotAnalytics = await db
        .select()
        .from(chatbotAnalytics)
        .where(eq(chatbotAnalytics.chatbotId, chatbotId))
        .limit(1);

      if (existingChatbotAnalytics.length > 0) {
        await db
          .update(chatbotAnalytics)
          .set({
            messageCount: sql`${chatbotAnalytics.messageCount} + ${count}`,
            updatedAt: new Date(),
          })
          .where(eq(chatbotAnalytics.chatbotId, chatbotId));
      } else {
        await db.insert(chatbotAnalytics).values({
          chatbotId,
          messageCount: count,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }

      return true;
    } catch (error) {
      console.error("Error incrementing message usage:", error);
      return false;
    }
  }

  /**
   * Sync chatbot count with actual chatbot count
   */
  static async syncChatbotCount(userId: string): Promise<boolean> {
    const currentPeriod = await this.getCurrentPeriod(userId);
    await this.initializeUsageRecord(userId, currentPeriod);

    try {
      // Get actual chatbot count
      const chatbotCountResult = await db
        .select({ count: count() })
        .from(chatbot)
        .where(eq(chatbot.userId, userId));

      const actualChatbotCount = chatbotCountResult[0]?.count || 0;

      // Update usage record
      await db
        .update(subscriptionUsage)
        .set({
          chatbotCount: actualChatbotCount,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(subscriptionUsage.userId, userId),
            eq(subscriptionUsage.period, currentPeriod)
          )
        );

      return true;
    } catch (error) {
      console.error("Error syncing chatbot count:", error);
      return false;
    }
  }

  /**
   * Check if user can perform action based on usage limits
   */
  static async canPerformAction(
    userId: string,
    action: "message" | "chatbot"
  ): Promise<boolean> {
    console.log(userId, action);
    const currentPeriod = await this.getCurrentPeriod(userId);
    const userPlan = await this.getUserPlan(userId);
    const limits = this.getPlanLimits(userPlan);

    await this.initializeUsageRecord(userId, currentPeriod);

    const usageRecord = await db
      .select()
      .from(subscriptionUsage)
      .where(
        and(
          eq(subscriptionUsage.userId, userId),
          eq(subscriptionUsage.period, currentPeriod)
        )
      )
      .limit(1);

    if (usageRecord.length === 0) return true;

    const usage = usageRecord[0];

    switch (action) {
      case "message":
        return usage.messageCount < limits.messages;
      case "chatbot":
        return usage.chatbotCount < limits.chatbots;
      default:
        return false;
    }
  }

  /**
   * Get comprehensive usage data for user
   */
  static async getUserUsageData(userId: string) {
    const currentPeriod = await this.getCurrentPeriod(userId);
    const userPlan = await this.getUserPlan(userId);
    const limits = this.getPlanLimits(userPlan);

    await this.initializeUsageRecord(userId, currentPeriod);

    // Sync chatbot count to ensure accuracy
    await this.syncChatbotCount(userId);

    // Get updated usage record after sync
    const updatedUsageRecord = await db
      .select()
      .from(subscriptionUsage)
      .where(
        and(
          eq(subscriptionUsage.userId, userId),
          eq(subscriptionUsage.period, currentPeriod)
        )
      )
      .limit(1);

    const usage = updatedUsageRecord[0] || {
      messageCount: 0,
      chatbotCount: 0,
      period: currentPeriod,
    };

    // Calculate reset date (first day of next month)
    const now = new Date();
    const resetDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);

    return {
      messageCount: usage.messageCount,
      chatbotCount: usage.chatbotCount,
      period: currentPeriod,
      limits,
      resetDate,
      canSendMessage: usage.messageCount < limits.messages,
      canCreateChatbot: usage.chatbotCount < limits.chatbots,
      remainingMessages: Math.max(0, limits.messages - usage.messageCount),
      remainingChatbots: Math.max(0, limits.chatbots - usage.chatbotCount),
      usagePercentage: {
        messages: Math.min(100, (usage.messageCount / limits.messages) * 100),
        chatbots: Math.min(100, (usage.chatbotCount / limits.chatbots) * 100),
      },
    };
  }

  /**
   * Get usage history for user (last 6 months)
   */
  static async getUserUsageHistory(userId: string) {
    const now = new Date();
    const periods = [];

    // Generate last 6 months periods
    for (let i = 0; i < 6; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      periods.push(
        `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
      );
    }

    const usageHistory = await db
      .select()
      .from(subscriptionUsage)
      .where(
        and(
          eq(subscriptionUsage.userId, userId),
          sql`${subscriptionUsage.period} IN (${periods
            .map((p) => `'${p}'`)
            .join(",")})`
        )
      )
      .orderBy(subscriptionUsage.period);

    return usageHistory.map((record) => ({
      period: record.period,
      messageCount: record.messageCount,
      chatbotCount: record.chatbotCount,
      updatedAt: record.updatedAt,
    }));
  }

  /**
   * Clean up old usage records (older than 12 months)
   */
  static async cleanupOldUsageRecords(): Promise<void> {
    const cutoffDate = new Date();
    cutoffDate.setMonth(cutoffDate.getMonth() - 12);
    const cutoffPeriod = `${cutoffDate.getFullYear()}-${String(
      cutoffDate.getMonth() + 1
    ).padStart(2, "0")}`;

    try {
      await db
        .delete(subscriptionUsage)
        .where(sql`${subscriptionUsage.period} < ${cutoffPeriod}`);
    } catch (error) {
      console.error("Error cleaning up old usage records:", error);
    }
  }
}
