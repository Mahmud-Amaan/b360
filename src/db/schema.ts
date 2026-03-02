import {
  timestamp,
  pgTable,
  text,
  primaryKey,
  integer,
  serial,
  boolean,
  json,
  decimal,
  uuid,
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { AdapterAccount } from "next-auth/adapters";

export const user = pgTable("user", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: text("email").notNull().unique(),
  emailVerified: timestamp("emailVerified", { mode: "date" }),
  name: text("name"),
  image: text("image"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const userRelations = relations(user, ({ many }) => ({
  widgets: many(widget),
  subscriptions: many(subscription),
  payments: many(payment),
  subscriptionUsage: many(subscriptionUsage),
}));

export const account = pgTable(
  "account",
  {
    userId: uuid("userId")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    type: text("type").$type<AdapterAccount["type"]>().notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("providerAccountId").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (account) => ({
    compoundKey: primaryKey({
      columns: [account.provider, account.providerAccountId],
    }),
  })
);

export const sessions = pgTable("session", {
  sessionToken: text("sessionToken").primaryKey(),
  userId: uuid("userId")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

export const verificationTokens = pgTable(
  "verificationToken",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (vt) => ({
    compoundKey: primaryKey({ columns: [vt.identifier, vt.token] }),
  })
);

export const widget = pgTable("widget", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .references(() => user.id)
    .notNull(),
  name: text("name").notNull(),
  position: text("position").notNull().default("bottom-right"),
  primaryColor: text("primary_color").default("#6366F1").notNull(),
  productName: text("product_name").notNull(),
  description: text("description").notNull(),
  widgetTitle: text("widget_title").default("Chat with us").notNull(),
  welcomeMessage: text("welcome_message")
    .default("Hi! How can I help you today?")
    .notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  customIcon: text("custom_icon"),
  iconEmoji: text("icon_emoji"),
  iconType: text("icon_type").default("default").notNull(),
  adminEmail: text("admin_email"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const widgetRelations = relations(widget, ({ one }) => ({
  user: one(user, { fields: [widget.userId], references: [user.id] }),
  analytics: one(widgetAnalytics, {
    fields: [widget.id],
    references: [widgetAnalytics.widgetId],
  }),
}));

// Leads captured from widget chats (email collection)
export const widgetLead = pgTable("widget_lead", {
  id: uuid("id").defaultRandom().primaryKey(),
  widgetId: uuid("widget_id")
    .references(() => widget.id)
    .notNull(),
  email: text("email").notNull(),
  message: text("message"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const widgetAnalytics = pgTable("widget_analytics", {
  id: uuid("id").defaultRandom().primaryKey(),
  widgetId: uuid("widget_id")
    .references(() => widget.id)
    .notNull()
    .unique(), // Added .unique()
  messageCount: integer("message_count").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const widgetAnalyticsRelations = relations(
  widgetAnalytics,
  ({ one }) => ({
    widget: one(widget, {
      fields: [widgetAnalytics.widgetId],
      references: [widget.id],
    }),
  })
);

export const subscription = pgTable("subscription", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .references(() => user.id)
    .notNull(),
  plan: text("plan").notNull().default("free"), // 'free', 'pro'
  status: text("status").notNull().default("active"), // 'active', 'canceled', 'past_due', 'unpaid'
  stripeCustomerId: text("stripe_customer_id").unique(),
  stripeSubscriptionId: text("stripe_subscription_id").unique(),
  stripePriceId: text("stripe_price_id"),
  currentPeriodStart: timestamp("current_period_start"),
  currentPeriodEnd: timestamp("current_period_end"),
  billingCycleDay: integer("billing_cycle_day").notNull().default(1), // Day of month for billing (1-31)
  cancelAtPeriodEnd: boolean("cancel_at_period_end").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const subscriptionRelations = relations(
  subscription,
  ({ one, many }) => ({
    user: one(user, { fields: [subscription.userId], references: [user.id] }),
    payments: many(payment),
  })
);

export const payment = pgTable("payment", {
  id: serial("id").primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  subscriptionId: uuid("subscription_id").references(() => subscription.id),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  currency: text("currency").notNull().default("USD"),
  status: text("status").notNull(), // 'succeeded', 'failed', 'pending'
  stripePaymentId: text("stripe_payment_id").unique(),
  stripeInvoiceId: text("stripe_invoice_id"),
  stripePaymentIntentId: text("stripe_payment_intent_id"),
  metadata: json("metadata"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const paymentRelations = relations(payment, ({ one }) => ({
  user: one(user, { fields: [payment.userId], references: [user.id] }),
  subscription: one(subscription, {
    fields: [payment.subscriptionId],
    references: [subscription.id],
  }),
}));

export const subscriptionUsage = pgTable("subscription_usage", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .references(() => user.id)
    .notNull(),
  period: text("period").notNull(), // Format: 'YYYY-MM'
  messageCount: integer("message_count").default(0).notNull(),
  widgetCount: integer("widget_count").default(0).notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const subscriptionUsageRelations = relations(
  subscriptionUsage,
  ({ one }) => ({
    user: one(user, {
      fields: [subscriptionUsage.userId],
      references: [user.id],
    }),
  })
);

export const testimonial = pgTable("testimonial", {
  id: uuid("id").defaultRandom().primaryKey(),
  quote: text("quote").notNull(),
  name: text("name").notNull(),
  designation: text("designation").notNull(),
  image: text("image").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const testimonialRelations = relations(testimonial, ({ }) => ({
  // No relations for testimonial
}));

export const agent = pgTable("agent", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .references(() => user.id)
    .notNull(),
  name: text("name").notNull(),
  description: text("description"),
  phoneNumber: text("phone_number").unique(),
  phoneSid: text("phone_sid"), // Twilio SID
  vapiPhoneNumberId: text("vapi_phone_number_id"), // Vapi phone number ID for inbound call routing
  clientId: text("client_id").unique(), // Twilio Client identity (e.g., client:name)
  voice: text("voice").default("female"),
  welcomeMessage: text("welcome_message"),
  businessContext: text("business_context"),
  businessType: text("business_type"),
  availabilityContext: text("availability_context"),
  adminEmail: text("admin_email"),
  zapierWebhookUrl: text("zapier_webhook_url"),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const agentRelations = relations(agent, ({ one, many }) => ({
  user: one(user, { fields: [agent.userId], references: [user.id] }),
  callLogs: many(callLogs),
}));

export const callLogs = pgTable("call_logs", {
  id: uuid("id").defaultRandom().primaryKey(),
  agentId: uuid("agent_id")
    .references(() => agent.id, { onDelete: "cascade" })
    .notNull(),
  callSid: text("call_sid").unique(), // Twilio Call SID
  vapiCallId: text("vapi_call_id").unique(), // Vapi Call ID
  callerNumber: text("caller_number"),
  duration: integer("duration"), // in seconds
  summary: text("summary"),
  transcript: text("transcript"),
  recordingUrl: text("recording_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => {
  return {
    agentIdIdx: index("call_logs_agent_id_idx").on(table.agentId),
    vapiCallIdIdx: index("call_logs_vapi_call_id_idx").on(table.vapiCallId),
    createdAtIdx: index("call_logs_created_at_idx").on(table.createdAt),
  };
});

export const callLogsRelations = relations(callLogs, ({ one, many }) => ({
  agent: one(agent, { fields: [callLogs.agentId], references: [agent.id] }),
  bookings: many(bookings),
}));

export const bookings = pgTable("bookings", {
  id: uuid("id").defaultRandom().primaryKey(),
  agentId: uuid("agent_id")
    .references(() => agent.id, { onDelete: "cascade" })
    .notNull(),
  callLogId: uuid("call_log_id")
    .references(() => callLogs.id, { onDelete: "cascade" })
    .notNull(),
  customerName: text("customer_name"),
  customerEmail: text("customer_email"),
  customerPhone: text("customer_phone"),
  bookingDate: timestamp("booking_date"),
  serviceDetails: text("service_details"),
  status: text("status").default("confirmed").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => {
  return {
    bookingsAgentIdIdx: index("bookings_agent_id_idx").on(table.agentId),
    bookingsCallLogIdIdx: index("bookings_call_log_id_idx").on(table.callLogId),
  };
});

export const bookingsRelations = relations(bookings, ({ one }) => ({
  agent: one(agent, { fields: [bookings.agentId], references: [agent.id] }),
  callLog: one(callLogs, {
    fields: [bookings.callLogId],
    references: [callLogs.id],
  }),
}));
