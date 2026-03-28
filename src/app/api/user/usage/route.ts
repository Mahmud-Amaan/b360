import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { subscription, subscriptionUsage, chatbot } from "@/db/schema";
import { eq, and, count } from "drizzle-orm";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const currentDate = new Date();
    const currentPeriod = `${currentDate.getFullYear()}-${String(
      currentDate.getMonth() + 1
    ).padStart(2, "0")}`;

    // Get user's current plan
    const userSubscription = await db
      .select()
      .from(subscription)
      .where(eq(subscription.userId, userId))
      .orderBy(subscription.createdAt)
      .limit(1);

    const currentPlan = userSubscription[0]?.plan || "free";

    // Default plan limits
    const defaultLimits: Record<string, { messages: number; chatbots: number }> =
    {
      free: { messages: 20, chatbots: 1 },
      pro: { messages: 1000, chatbots: 10 },
    };

    const planLimits = defaultLimits[currentPlan] || defaultLimits.free;

    // Get usage for current period
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

    // Get actual chatbot count
    const chatbotCountResult = await db
      .select({ count: count() })
      .from(chatbot)
      .where(eq(chatbot.userId, userId));

    const actualChatbotCount = chatbotCountResult[0]?.count || 0;

    // // Get messages count from analytics for current month
    // const startOfMonth = new Date(
    //   currentDate.getFullYear(),
    //   currentDate.getMonth(),
    //   1
    // );
    // const endOfMonth = new Date(
    //   currentDate.getFullYear(),
    //   currentDate.getMonth() + 1,
    //   0
    // );

    // const messageAnalytics = await db
    //     .select({ count: count() })
    //     .from(analytics)
    //     .innerJoin(chatbot, eq(analytics.chatbotId, chatbot.id))
    //     .where(
    //         and(
    //             eq(chatbot.userId, userId),
    //             eq(analytics.eventType, 'message_sent'),
    //             sql`${analytics.createdAt} >= ${startOfMonth}`,
    //             sql`${analytics.createdAt} <= ${endOfMonth}`
    //         )
    //     );

    // const actualMessageCount = messageAnalytics[0]?.count || 0;
    const actualMessageCount = 0; // TODO: Implement analytics properly

    // Update usage record with actual counts
    if (usageRecord.length > 0) {
      await db
        .update(subscriptionUsage)
        .set({
          messageCount: actualMessageCount,
          chatbotCount: actualChatbotCount,
          updatedAt: new Date(),
        })
        .where(eq(subscriptionUsage.id, usageRecord[0].id));
    } else {
      // Create new usage record
      await db.insert(subscriptionUsage).values({
        userId,
        period: currentPeriod,
        messageCount: actualMessageCount,
        chatbotCount: actualChatbotCount,
      });
    }

    // Calculate reset date (first day of next month)
    const resetDate = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() + 1,
      1
    );

    const response = {
      usage: {
        messageCount: actualMessageCount,
        chatbotCount: actualChatbotCount,
        period: currentPeriod,
        limits: planLimits,
        resetDate,
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching usage data:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { type, increment = 1 } = body;

    if (!["messages", "chatbots"].includes(type)) {
      return NextResponse.json(
        { error: "Invalid usage type" },
        { status: 400 }
      );
    }

    const userId = session.user.id;
    const currentDate = new Date();
    const currentPeriod = `${currentDate.getFullYear()}-${String(
      currentDate.getMonth() + 1
    ).padStart(2, "0")}`;

    // Get or create usage record
    let usageRecord = await db
      .select()
      .from(subscriptionUsage)
      .where(
        and(
          eq(subscriptionUsage.userId, userId),
          eq(subscriptionUsage.period, currentPeriod)
        )
      )
      .limit(1);

    if (usageRecord.length === 0) {
      await db.insert(subscriptionUsage).values({
        userId,
        period: currentPeriod,
        messageCount: 0,
        chatbotCount: 0,
      });

      usageRecord = await db
        .select()
        .from(subscriptionUsage)
        .where(
          and(
            eq(subscriptionUsage.userId, userId),
            eq(subscriptionUsage.period, currentPeriod)
          )
        )
        .limit(1);
    }

    // Update the appropriate counter
    const updateField = type === "messages" ? "messageCount" : "chatbotCount";
    const currentValue =
      type === "messages"
        ? usageRecord[0].messageCount
        : usageRecord[0].chatbotCount;

    await db
      .update(subscriptionUsage)
      .set({
        [updateField]: currentValue + increment,
        updatedAt: new Date(),
      })
      .where(eq(subscriptionUsage.id, usageRecord[0].id));

    return NextResponse.json({
      success: true,
      newCount: currentValue + increment,
    });
  } catch (error) {
    console.error("Error updating usage:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
