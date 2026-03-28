"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Layers, TrendingUp } from "lucide-react";
import { plans } from "@/lib/config/plans";

interface UsageData {
  messages: {
    used: number;
    limit: number;
  };
  chatbots: {
    used: number;
    limit: number;
  };
  plan: "free" | "pro";
}

export function UsageTracker() {
  const [usage, setUsage] = useState<UsageData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsage();
  }, []);

  const fetchUsage = async () => {
    try {
      const response = await fetch("/api/usage");
      if (!response.ok) {
        throw new Error("Failed to fetch usage data");
      }
      const usageData = await response.json();
      setUsage(usageData);
    } catch (error) {
      console.error("Error fetching usage:", error);
      // Set default empty usage on error
      setUsage({
        messages: { used: 0, limit: plans.free.limits.messages },
        chatbots: { used: 0, limit: plans.free.limits.chatbots },
        plan: "free",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading || !usage) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Usage Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-2 bg-gray-200 rounded"></div>
            </div>
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-2 bg-gray-200 rounded"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const currentPlan = plans[usage.plan];

  const getUsagePercentage = (used: number, limit: number) => {
    return Math.min((used / limit) * 100, 100);
  };

  const getUsageColor = (percentage: number) => {
    if (percentage >= 90) return "text-red-600";
    if (percentage >= 75) return "text-yellow-600";
    return "text-green-600";
  };

  const messagesPercentage = getUsagePercentage(
    usage.messages.used,
    usage.messages.limit
  );
  const chatbotsPercentage = getUsagePercentage(
    usage.chatbots.used,
    usage.chatbots.limit
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          Usage Overview
          <Badge variant="outline" className="ml-auto">
            {currentPlan.name} Plan
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Messages Usage */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-blue-500" />
              <span className="font-medium">Messages</span>
            </div>
            <span
              className={`text-sm font-medium ${getUsageColor(
                messagesPercentage
              )}`}
            >
              {usage.messages.used} / {usage.messages.limit}
            </span>
          </div>
          <Progress value={messagesPercentage} className="h-2" />
          <p className="text-xs text-gray-500">
            {usage.messages.limit - usage.messages.used} messages remaining this
            month
          </p>
        </div>

        {/* Chatbots Usage */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-purple-500" />
              <span className="font-medium">Chatbots</span>
            </div>
            <span
              className={`text-sm font-medium ${getUsageColor(
                chatbotsPercentage
              )}`}
            >
              {usage.chatbots.used} / {usage.chatbots.limit}
            </span>
          </div>
          <Progress value={chatbotsPercentage} className="h-2" />
          <p className="text-xs text-gray-500">
            {usage.chatbots.limit - usage.chatbots.used} chatbots available
          </p>
        </div>

        {/* Usage Warnings */}
        {(messagesPercentage >= 75 || chatbotsPercentage >= 75) && (
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start gap-2">
              <TrendingUp className="w-4 h-4 text-yellow-600 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-yellow-800">Usage Alert</p>
                <p className="text-yellow-700">
                  You&apos;re approaching your plan limits. Consider upgrading
                  to avoid service interruption.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Upgrade Suggestion for Free Plan */}
        {usage.plan === "free" && messagesPercentage >= 50 && (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start gap-2">
              <TrendingUp className="w-4 h-4 text-blue-600 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-blue-800">Upgrade Suggestion</p>
                <p className="text-blue-700">
                  Upgrade to Pro for 1,000 messages/month and 10 chatbots for
                  just $9/month.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Plan Comparison */}
        <div className="pt-4 border-t">
          <h4 className="font-medium mb-3">Plan Comparison</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <p className="font-medium text-gray-600">Free Plan</p>
              <div className="space-y-1 text-gray-500">
                <p>• {plans.free.limits.messages} messages/month</p>
                <p>• {plans.free.limits.chatbots} chatbot</p>
                <p>• Basic analytics</p>
              </div>
            </div>
            <div className="space-y-2">
              <p className="font-medium text-gray-600">Pro Plan</p>
              <div className="space-y-1 text-gray-500">
                <p>• {plans.pro.limits.messages} messages/month</p>
                <p>• {plans.pro.limits.chatbots} chatbots</p>
                <p>• Advanced analytics</p>
                <p>• Priority support</p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
