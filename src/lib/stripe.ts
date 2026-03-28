// Client-side Stripe configuration (safe for client)
export const STRIPE_CONFIG = {
  publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!,
  currency: "usd",
  amount: 900, // $9.00 in cents
} as const;

// Product configuration
export const PRODUCT_CONFIG = {
  name: "B360 Pro Plan",
  description: "Professional customer support with AI-powered chatbot",
  features: [
    "1,000 messages per month",
    "10 chatbot",
    "Advanced analytics",
    "Priority support",
    "Custom branding",
  ],
  price: {
    amount: 900, // $9.00 in cents
    currency: "usd",
    interval: "month",
  },
} as const;

// Helper function to format price (client-safe)
export function formatPrice(amount: number, currency: string = "usd"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(amount / 100);
}
