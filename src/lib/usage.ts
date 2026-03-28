import { db } from "@/lib/db";
import {
  subscriptionUsage,
  subscription,
  widget,
  widgetAnalytics,
  user,
} from "@/db/schema";
import { eq, and, count, sql } from "drizzle-orm";
import { userExists } from "@/lib/user-utils";
import { getBillingPeriodKey } from "@/lib/billing";

export interface PlanLimits {
  messages: number;
  chatbot: number;
}

export const PLAN_LIMITS: Record<string, PlanLimits> = {
  free: { messages: 20, chatbot: 1 },
  pro: { messages: 1000, chatbot: 10 },
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
          widgetCount: 0,
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
    widgetId: string,
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

      // Update widget analytics
      const existingWidgetAnalytics = await db
        .select()
        .from(widgetAnalytics)
        .where(eq(widgetAnalytics.widgetId, widgetId))
        .limit(1);

      if (existingWidgetAnalytics.length > 0) {
        await db
          .update(widgetAnalytics)
          .set({
            messageCount: sql`${widgetAnalytics.messageCount} + ${count}`,
            updatedAt: new Date(),
          })
          .where(eq(widgetAnalytics.widgetId, widgetId));
      } else {
        await db.insert(widgetAnalytics).values({
          widgetId,
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
   * Sync widget count with actual widget count
   */
  static async syncWidgetCount(userId: string): Promise<boolean> {
    const currentPeriod = await this.getCurrentPeriod(userId);
    await this.initializeUsageRecord(userId, currentPeriod);

    try {
      // Get actual widget count
      const widgetCountResult = await db
        .select({ count: count() })
        .from(widget)
        .where(eq(widget.userId, userId));

      const actualWidgetCount = widgetCountResult[0]?.count || 0;

      // Update usage record
      await db
        .update(subscriptionUsage)
        .set({
          widgetCount: actualWidgetCount,
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
      console.error("Error syncing widget count:", error);
      return false;
    }
  }

  /**
   * Check if user can perform action based on usage limits
   */
  static async canPerformAction(
    userId: string,
    action: "message" | "widget"
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
      case "widget":
        return usage.widgetCount < limits.chatbot;
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

    // Sync widget count to ensure accuracy
    await this.syncWidgetCount(userId);

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
      widgetCount: 0,
      period: currentPeriod,
    };

    // Calculate reset date (first day of next month)
    const now = new Date();
    const resetDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);

    return {
      messageCount: usage.messageCount,
      widgetCount: usage.widgetCount,
      period: currentPeriod,
      limits,
      resetDate,
      canSendMessage: usage.messageCount < limits.messages,
      canCreateWidget: usage.widgetCount < limits.chatbot,
      remainingMessages: Math.max(0, limits.messages - usage.messageCount),
      remainingChatbot: Math.max(0, limits.chatbot - usage.widgetCount),
      usagePercentage: {
        messages: Math.min(100, (usage.messageCount / limits.messages) * 100),
        chatbot: Math.min(100, (usage.widgetCount / limits.chatbot) * 100),
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
      widgetCount: record.widgetCount,
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
