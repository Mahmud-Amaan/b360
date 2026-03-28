export const plans = {
  free: {
    name: "Free",
    price: 0,
    currency: "usd",
    interval: null,
    limits: {
      messages: 20,
      chatbot: 1,
    },
    features: [
      "20 messages per month",
      "1 widget",
      "Basic analytics",
      "Community support",
    ],
  },
  pro: {
    name: "Pro",
    price: 900, // $9.00 in cents
    currency: "usd",
    interval: "month",
    limits: {
      messages: 1000,
      chatbot: 10,
    },
    features: [
      "1,000 messages per month",
      "10 chatbot",
      "Advanced analytics",
      "Priority support",
      "Custom branding",
      "API access",
    ],
  },
} as const;

export type PlanType = keyof typeof plans;
