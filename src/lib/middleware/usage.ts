import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { UsageService } from '@/lib/usage';

export interface UsageCheckOptions {
    action: 'message' | 'chatbot';
    requireAuth?: boolean;
}

/**
 * Middleware to check usage limits before allowing actions
 */
export async function withUsageCheck(
    request: NextRequest,
    options: UsageCheckOptions,
    handler: (request: NextRequest) => Promise<NextResponse>
): Promise<NextResponse> {
    try {
        // Check authentication if required
        if (options.requireAuth !== false) {
            const session = await getServerSession(authOptions);

            if (!session?.user?.id) {
                return NextResponse.json(
                    { error: 'Unauthorized' },
                    { status: 401 }
                );
            }

            const userId = session.user.id;

            // Check if user can perform the action
            const canPerform = await UsageService.canPerformAction(userId, options.action);

            if (!canPerform) {
                const userPlan = await UsageService.getUserPlan(userId);
                const limits = UsageService.getPlanLimits(userPlan);

                return NextResponse.json(
                    {
                        error: 'Usage limit exceeded',
                        message: `You have reached your ${options.action} limit for this month.`,
                        limits: {
                            [options.action]: options.action === 'message' ? limits.messages : limits.chatbots
                        },
                        upgrade: userPlan === 'free' ? 'Upgrade to Pro for higher limits' : null
                    },
                    { status: 429 }
                );
            }
        }

        // Proceed with the original handler
        return await handler(request);

    } catch (error) {
        console.error('Usage check middleware error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

/**
 * Decorator function for API routes that need usage checking
 */
export function withUsageLimits(options: UsageCheckOptions) {
    return function (handler: (request: NextRequest) => Promise<NextResponse>) {
        return async function (request: NextRequest): Promise<NextResponse> {
            return withUsageCheck(request, options, handler);
        };
    };
}

/**
 * Helper to increment usage after successful action
 */
export async function trackUsage(
    userId: string,
    action: 'message' | 'chatbot',
    count: number = 1,
    chatbotId?: string
): Promise<boolean> {
    try {
        if (action === 'message') {
            if (!chatbotId) {
                throw new Error('chatbotId is required for message tracking');
            }
            return await UsageService.incrementMessageUsage(userId, chatbotId, count);
        } else if (action === 'chatbot') {
            return await UsageService.syncChatbotCount(userId);
        }
        return false;
    } catch (error) {
        console.error('Error tracking usage:', error);
        return false;
    }
}
