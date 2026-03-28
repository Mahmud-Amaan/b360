import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';

export interface UserPlan {
    id: string;
    plan: 'free' | 'pro';
    status: 'active' | 'cancelled' | 'past_due';
    currentPeriodStart: Date;
    currentPeriodEnd: Date;
    billingCycleDay: number;
    cancelAtPeriodEnd: boolean;
}

export interface UsageStats {
    messageCount: number;
    widgetCount: number;
    period: string; // Billing period key format
    limits: {
        messages: number;
        chatbot: number;
    };
    resetDate: Date;
    billingPeriodStart?: Date;
    billingPeriodEnd?: Date;
}

export interface UserSettings {
    plan: UserPlan | null;
    usage: UsageStats | null;
    isLoading: boolean;
    error: string | null;
}

interface UseUserSettingsReturn extends UserSettings {
    fetchUserSettings: () => Promise<void>;
    refreshUsage: () => Promise<void>;
    canCreateWidget: boolean;
    canSendMessage: boolean;
    remainingMessages: number;
    remainingChatbot: number;
    usagePercentage: {
        messages: number;
        chatbot: number;
    };
}

export const useUserSettings = (): UseUserSettingsReturn => {
    const { data: session } = useSession();
    const [plan, setPlan] = useState<UserPlan | null>(null);
    const [usage, setUsage] = useState<UsageStats | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchUserSettings = useCallback(async () => {
        if (!session?.user) return;

        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch('/api/user/plan');

            if (!response.ok) {
                throw new Error('Failed to fetch user settings');
            }

            const data = await response.json();
            setPlan(data.plan);
            setUsage(data.usage);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
            console.error('Error fetching user settings:', err);
        } finally {
            setIsLoading(false);
        }
    }, [session?.user]);

    const refreshUsage = useCallback(async () => {
        if (!session?.user) return;

        try {
            const response = await fetch('/api/user/usage');

            if (!response.ok) {
                throw new Error('Failed to refresh usage');
            }

            const data = await response.json();
            setUsage(data.usage);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to refresh usage');
            console.error('Error refreshing usage:', err);
        }
    }, [session?.user]);

    // Fetch settings on mount and when session changes
    useEffect(() => {
        if (session?.user) {
            fetchUserSettings();
        }
    }, [session?.user, fetchUserSettings]);

    // Calculate derived values
    const canCreateWidget = usage ? usage.widgetCount < usage.limits.chatbot : false;
    const canSendMessage = usage ? usage.messageCount < usage.limits.messages : false;
    const remainingMessages = usage ? Math.max(0, usage.limits.messages - usage.messageCount) : 0;
    const remainingChatbot = usage ? Math.max(0, usage.limits.chatbot - usage.widgetCount) : 0;

    const usagePercentage = usage ? {
        messages: Math.min(100, (usage.messageCount / usage.limits.messages) * 100),
        chatbot: Math.min(100, (usage.widgetCount / usage.limits.chatbot) * 100),
    } : { messages: 0, chatbot: 0 };

    return {
        plan,
        usage,
        isLoading,
        error,
        fetchUserSettings,
        refreshUsage,
        canCreateWidget,
        canSendMessage,
        remainingMessages,
        remainingChatbot,
        usagePercentage,
    };
}; 