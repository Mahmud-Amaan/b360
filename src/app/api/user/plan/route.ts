import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { user, subscription, subscriptionUsage, chatbot } from '@/db/schema';
import { eq, and, count } from 'drizzle-orm';
import { ensureUserExists } from '@/lib/user-utils';
import { getCurrentBillingPeriod, getBillingPeriodKey } from '@/lib/billing';

export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const userId = session.user.id;
        const currentDate = new Date();

        // Ensure user exists in database
        await ensureUserExists({
            id: userId,
            email: session.user.email || '',
            name: session.user.name || '',
            image: session.user.image || null,
        });

        // Get user record for signup date
        const userRecord = await db
            .select({ createdAt: user.createdAt })
            .from(user)
            .where(eq(user.id, userId))
            .limit(1);

        // Fetch user subscription
        const userSubscription = await db
            .select()
            .from(subscription)
            .where(eq(subscription.userId, userId))
            .orderBy(subscription.createdAt)
            .limit(1);

        // Default plan limits
        const defaultLimits: Record<string, { messages: number; chatbots: number }> = {
            free: { messages: 20, chatbots: 1 },
            pro: { messages: 1000, chatbots: 10 }
        };

        // Get user signup date for billing cycle calculation
        const userSignupDate = userRecord[0]?.createdAt || new Date();

        // Calculate current billing period based on user signup date
        const billingPeriod = getCurrentBillingPeriod(userSignupDate, currentDate);
        const currentPeriodKey = getBillingPeriodKey(userSignupDate, currentDate);

        const currentPlan = userSubscription[0] || {
            plan: 'free' as const,
            status: 'active' as const,
            currentPeriodStart: billingPeriod.periodStart,
            currentPeriodEnd: billingPeriod.periodEnd,
            billingCycleDay: userSignupDate.getDate(),
            cancelAtPeriodEnd: false
        };

        // Fetch or create usage record for current billing period
        let usageRecord = await db
            .select()
            .from(subscriptionUsage)
            .where(
                and(
                    eq(subscriptionUsage.userId, userId),
                    eq(subscriptionUsage.period, currentPeriodKey)
                )
            )
            .limit(1);

        if (usageRecord.length === 0) {
            // Create usage record for current billing period
            await db.insert(subscriptionUsage).values({
                userId,
                period: currentPeriodKey,
                messageCount: 0,
                chatbotCount: 0,
            });

            usageRecord = [{
                id: '',
                userId,
                period: currentPeriodKey,
                messageCount: 0,
                chatbotCount: 0,
                updatedAt: new Date()
            }];
        }

        // Get actual chatbot count for the user
        const chatbotCountResult = await db
            .select({ count: count() })
            .from(chatbot)
            .where(eq(chatbot.userId, userId));

        const actualChatbotCount = chatbotCountResult[0]?.count || 0;

        // Update chatbot count in usage if it's different
        if (actualChatbotCount !== usageRecord[0].chatbotCount) {
            await db
                .update(subscriptionUsage)
                .set({
                    chatbotCount: actualChatbotCount,
                    updatedAt: new Date()
                })
                .where(
                    and(
                        eq(subscriptionUsage.userId, userId),
                        eq(subscriptionUsage.period, currentPeriodKey)
                    )
                );

            usageRecord[0].chatbotCount = actualChatbotCount;
        }

        const planLimits = defaultLimits[currentPlan.plan] || defaultLimits.free;

        const response = {
            plan: {
                id: userSubscription[0]?.id || '',
                plan: currentPlan.plan,
                status: currentPlan.status,
                currentPeriodStart: currentPlan.currentPeriodStart,
                currentPeriodEnd: currentPlan.currentPeriodEnd,
                billingCycleDay: currentPlan.billingCycleDay,
                cancelAtPeriodEnd: currentPlan.cancelAtPeriodEnd,
            },
            usage: {
                messageCount: usageRecord[0].messageCount,
                chatbotCount: usageRecord[0].chatbotCount,
                period: currentPeriodKey,
                limits: planLimits,
                resetDate: billingPeriod.periodEnd,
                billingPeriodStart: billingPeriod.periodStart,
                billingPeriodEnd: billingPeriod.periodEnd,
            }
        };

        return NextResponse.json(response);

    } catch (error) {
        console.error('Error fetching user settings:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function PUT(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { action, data } = body;

        switch (action) {
            case 'increment_messages': {
                const userId = session.user.id;
                const currentDate = new Date();
                const currentPeriod = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;

                // Increment message count
                await db
                    .update(subscriptionUsage)
                    .set({
                        messageCount: subscriptionUsage.messageCount + (data.count || 1),
                        updatedAt: new Date()
                    })
                    .where(
                        and(
                            eq(subscriptionUsage.userId, userId),
                            eq(subscriptionUsage.period, currentPeriod)
                        )
                    );

                return NextResponse.json({ success: true });
            }

            default:
                return NextResponse.json(
                    { error: 'Invalid action' },
                    { status: 400 }
                );
        }

    } catch (error) {
        console.error('Error updating user settings:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
} 