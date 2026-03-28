"use client";

import React, { createContext, useContext, useState } from "react";
import { useSession } from "next-auth/react";
import { useUserSettings } from "@/store/useUserSettings";

interface UsageContextType {
  // Usage data
  messageCount: number;
  widgetCount: number;
  limits: {
    messages: number;
    chatbot: number;
  };

  // Permissions
  canSendMessage: boolean;
  canCreateWidget: boolean;

  // Remaining quotas
  remainingMessages: number;
  remainingChatbot: number;

  // Usage percentages
  usagePercentage: {
    messages: number;
    chatbot: number;
  };

  // Plan info
  plan: string;
  isProUser: boolean;

  // Actions
  trackMessage: (count?: number) => Promise<void>;
  trackWidget: () => Promise<void>;
  refreshUsage: () => Promise<void>;

  // State
  isLoading: boolean;
  error: string | null;
}

const UsageContext = createContext<UsageContextType | undefined>(undefined);

interface UsageProviderProps {
  children: React.ReactNode;
}

export function UsageProvider({ children }: UsageProviderProps) {
  const { data: session } = useSession();
  const {
    plan,
    usage,
    isLoading,
    error,
    canCreateWidget,
    canSendMessage,
    remainingMessages,
    remainingChatbot,
    usagePercentage,
    refreshUsage: refreshUserSettings,
  } = useUserSettings();

  const [isTracking, setIsTracking] = useState(false);

  // Track message usage
  const trackMessage = async (count: number = 1) => {
    if (!session?.user?.id || isTracking) return;

    setIsTracking(true);
    try {
      const response = await fetch("/api/user/usage", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: "messages",
          increment: count,
        }),
      });

      if (response.ok) {
        // Refresh usage data after tracking
        await refreshUserSettings();
      } else {
        console.error("Failed to track message usage");
      }
    } catch (error) {
      console.error("Error tracking message usage:", error);
    } finally {
      setIsTracking(false);
    }
  };

  // Track widget creation/update
  const trackWidget = async () => {
    if (!session?.user?.id || isTracking) return;

    setIsTracking(true);
    try {
      const response = await fetch("/api/user/usage", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: "chatbot",
          increment: 0, // This will trigger a sync with actual widget count
        }),
      });

      if (response.ok) {
        await refreshUserSettings();
      } else {
        console.error("Failed to sync widget usage");
      }
    } catch (error) {
      console.error("Error syncing widget usage:", error);
    } finally {
      setIsTracking(false);
    }
  };

  const contextValue: UsageContextType = {
    // Usage data
    messageCount: usage?.messageCount || 0,
    widgetCount: usage?.widgetCount || 0,
    limits: usage?.limits || { messages: 20, chatbot: 1 },

    // Permissions
    canSendMessage,
    canCreateWidget,

    // Remaining quotas
    remainingMessages,
    remainingChatbot,

    // Usage percentages
    usagePercentage,

    // Plan info
    plan: plan?.plan || "free",
    isProUser: plan?.plan === "pro",

    // Actions
    trackMessage,
    trackWidget,
    refreshUsage: refreshUserSettings,

    // State
    isLoading: isLoading || isTracking,
    error,
  };

  return (
    <UsageContext.Provider value={contextValue}>
      {children}
    </UsageContext.Provider>
  );
}

export function useUsage() {
  const context = useContext(UsageContext);
  if (context === undefined) {
    throw new Error("useUsage must be used within a UsageProvider");
  }
  return context;
}

// Higher-order component for components that need usage checking
export function withUsageCheck<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  requiredAction: "message" | "widget"
) {
  return function UsageCheckedComponent(props: P) {
    const { canSendMessage, canCreateWidget, plan, isLoading } = useUsage();

    const canPerform =
      requiredAction === "message" ? canSendMessage : canCreateWidget;

    if (isLoading) {
      return <div>Loading usage information...</div>;
    }

    if (!canPerform) {
      return (
        <div className="p-4 border border-yellow-200 bg-yellow-50 rounded-lg">
          <h3 className="font-medium text-yellow-800 mb-2">
            {requiredAction === "message"
              ? "Message Limit Reached"
              : "Widget Limit Reached"}
          </h3>
          <p className="text-sm text-yellow-700 mb-3">
            You&apos;ve reached your monthly {requiredAction} limit.
            {plan === "free"
              ? " Upgrade to Pro for higher limits."
              : " Please wait until next month."}
          </p>
          {plan === "free" && (
            <a
              href="/dashboard/credits"
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-yellow-800 bg-yellow-200 hover:bg-yellow-300"
            >
              Upgrade to Pro
            </a>
          )}
        </div>
      );
    }

    return <WrappedComponent {...props} />;
  };
}
