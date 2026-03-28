/**
 * Billing utilities for handling monthly subscription cycles
 */

/**
 * Calculate the next billing date based on signup date
 * Handles edge cases like February 29th, 30th, 31st
 */
export function calculateNextBillingDate(
  signupDate: Date,
  currentDate: Date = new Date()
): Date {
  const signupDay = signupDate.getDate();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();
  const currentDay = currentDate.getDate();

  // Start with current month if we haven't reached the billing day, otherwise next month
  let nextBillingYear = currentYear;
  let nextBillingMonth = currentMonth;

  // If we've already passed the billing day this month, move to next month
  if (currentDay >= signupDay) {
    nextBillingMonth++;
  }

  // Handle year rollover
  if (nextBillingMonth > 11) {
    nextBillingMonth = 0;
    nextBillingYear++;
  }

  // Get the last day of the target month
  const lastDayOfMonth = new Date(
    nextBillingYear,
    nextBillingMonth + 1,
    0
  ).getDate();

  // Use the signup day or the last day of the month, whichever is smaller
  const billingDay = Math.min(signupDay, lastDayOfMonth);

  return new Date(nextBillingYear, nextBillingMonth, billingDay);
}

/**
 * Calculate the current billing period for a user based on their signup date
 */
export function getCurrentBillingPeriod(
  signupDate: Date,
  currentDate: Date = new Date()
): {
  periodStart: Date;
  periodEnd: Date;
  periodKey: string; // Format: YYYY-MM-DD for unique identification
} {
  const signupDay = signupDate.getDate();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();
  const currentDay = currentDate.getDate();

  let periodStartYear = currentYear;
  let periodStartMonth = currentMonth;

  // If we haven't reached the billing day this month, use previous month
  if (currentDay < signupDay) {
    periodStartMonth--;
    if (periodStartMonth < 0) {
      periodStartMonth = 11;
      periodStartYear--;
    }
  }

  // Calculate period start
  const lastDayOfStartMonth = new Date(
    periodStartYear,
    periodStartMonth + 1,
    0
  ).getDate();
  const periodStartDay = Math.min(signupDay, lastDayOfStartMonth);
  const periodStart = new Date(
    periodStartYear,
    periodStartMonth,
    periodStartDay
  );

  // Calculate period end (next billing date minus 1 day)
  const nextBilling = calculateNextBillingDate(signupDate, periodStart);
  const periodEnd = new Date(nextBilling.getTime() - 24 * 60 * 60 * 1000);

  // Create a unique period key
  const periodKey = `${periodStart.getFullYear()}-${String(
    periodStart.getMonth() + 1
  ).padStart(2, "0")}-${String(periodStart.getDate()).padStart(2, "0")}`;

  return {
    periodStart,
    periodEnd,
    periodKey,
  };
}

/**
 * Check if a date falls within a billing period
 */
export function isDateInBillingPeriod(
  date: Date,
  periodStart: Date,
  periodEnd: Date
): boolean {
  return date >= periodStart && date <= periodEnd;
}

/**
 * Get the billing period key for usage tracking
 * This replaces the simple YYYY-MM format with a more accurate period tracking
 */
export function getBillingPeriodKey(
  signupDate: Date,
  currentDate: Date = new Date()
): string {
  const { periodKey } = getCurrentBillingPeriod(signupDate, currentDate);
  return periodKey;
}

/**
 * Calculate subscription renewal date based on signup date
 * Handles edge cases for months with different numbers of days
 */
export function calculateRenewalDate(
  signupDate: Date,
  monthsToAdd: number = 1
): Date {
  const signupDay = signupDate.getDate();
  const targetYear = signupDate.getFullYear();
  const targetMonth = signupDate.getMonth() + monthsToAdd;

  // Handle year and month overflow
  const finalYear = targetYear + Math.floor(targetMonth / 12);
  const finalMonth = targetMonth % 12;

  // Get the last day of the target month
  const lastDayOfMonth = new Date(finalYear, finalMonth + 1, 0).getDate();

  // Use the signup day or the last day of the month, whichever is smaller
  const renewalDay = Math.min(signupDay, lastDayOfMonth);

  return new Date(finalYear, finalMonth, renewalDay);
}

/**
 * Format billing period for display
 */
export function formatBillingPeriod(
  periodStart: Date,
  periodEnd: Date
): string {
  const startStr = periodStart.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  const endStr = periodEnd.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return `${startStr} - ${endStr}`;
}

import { getServerSession } from "next-auth";
import { authOptions } from "./auth";
import { db } from "./db";
import {
  user,
  subscription,
  subscriptionUsage as usageTable,
} from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { plans } from "@/lib/config/plans";

export async function getUserPlan() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return null;
  }

  const [userPlan] = await db
    .select({
      plan: subscription.plan,
      status: subscription.status,
      currentPeriodEnd: subscription.currentPeriodEnd,
    })
    .from(subscription)
    .where(eq(subscription.userId, session.user.id));

  return userPlan || { plan: "free", status: "active", currentPeriodEnd: null };
}

export async function getUserUsage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return null;
  }

  const [currentUser] = await db
    .select({ createdAt: user.createdAt })
    .from(user)
    .where(eq(user.id, session.user.id));

  if (!currentUser) {
    return null;
  }

  const { periodEnd } = getCurrentBillingPeriod(currentUser.createdAt);

  const [usage] = await db
    .select({
      messageCount: usageTable.messageCount,
      widgetCount: usageTable.widgetCount,
    })
    .from(usageTable)
    .where(
      and(
        eq(usageTable.userId, session.user.id),
        eq(usageTable.period, getBillingPeriodKey(currentUser.createdAt))
      )
    );

  const userPlan = await getUserPlan();
  const planName = userPlan?.plan || "free";
  const planConfig = plans[planName as keyof typeof plans];

  return {
    messageCount: usage?.messageCount || 0,
    widgetCount: usage?.widgetCount || 0,
    limits: {
      messages: planConfig.limits.messages,
      chatbot: planConfig.limits.chatbot,
    },
    resetDate: periodEnd,
  };
}
