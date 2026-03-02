import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { constructWebhookEvent, stripe } from "@/lib/stripe-server";
import { upsertSubscription } from "@/lib/subscription";
import { db } from "@/lib/db";
import { payment, subscription } from "@/db/schema";
import { eq } from "drizzle-orm";
import type Stripe from "stripe";

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const headersList = await headers();
    const signature = headersList.get("stripe-signature");

    if (!signature) {
      console.error("[Stripe Webhook] Error: No signature found");
      return NextResponse.json(
        { error: "No signature found" },
        { status: 400 }
      );
    }

    // Read the body as a buffer (or arrayBuffer) to ensure we get exactly what was signed
    const arrayBuffer = await request.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const body = buffer.toString("utf-8");

    console.log(`[Stripe Webhook] Received request. Body length: ${body.length}, Signature: Present`);

    // Construct the webhook event
    let event: Stripe.Event;
    try {
      event = constructWebhookEvent(buffer, signature);
    } catch (err: any) {
      console.error(`[Stripe Webhook] Error constructing event: ${err.message}`);
      return NextResponse.json(
        { error: `Webhook signature verification failed: ${err.message}` },
        { status: 400 }
      );
    }

    console.log(`[Stripe Webhook] Processing event: ${event.type} | ID: ${event.id}`);

    // Handle the event
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        console.log(`[Stripe Webhook] Checkout session completed: ${session.id}`, {
          mode: session.mode,
          payment_status: session.payment_status,
          userId: session.metadata?.userId,
          subscription: session.subscription
        });

        if (session.mode === "subscription" && session.subscription) {
          const userId = session.metadata?.userId;

          if (!userId) {
            console.error(`[Stripe Webhook] CRITICAL: No userId found in checkout session metadata for session ${session.id}`);
            return NextResponse.json({ error: "Missing userId in metadata" }, { status: 400 });
          }

          if (session.payment_status !== "paid") {
            console.log(`[Stripe Webhook] Checkout session payment status not paid: ${session.payment_status}`);
            return NextResponse.json({ received: true, status: "pending_payment" });
          }

          // Get the subscription details
          console.log(`[Stripe Webhook] Retrieving subscription: ${session.subscription}`);
          const stripeSubscription = await stripe.subscriptions.retrieve(
            session.subscription as string
          );

          // Create or update subscription in database
          console.log(`[Stripe Webhook] Upserting subscription for user: ${userId}`);
          try {
            const subscriptionData = await upsertSubscription(userId, stripeSubscription);
            console.log(`[Stripe Webhook] Subscription activated for user: ${userId}. DB ID: ${subscriptionData.id}`);

            // Record the initial payment from the session
            if (session.invoice) {
              console.log(`[Stripe Webhook] Processing initial invoice: ${session.invoice}`);
              const [existingPayment] = await db
                .select()
                .from(payment)
                .where(eq(payment.stripeInvoiceId, session.invoice as string))
                .limit(1);

              if (!existingPayment) {
                await db.insert(payment).values({
                  userId,
                  subscriptionId: subscriptionData.id,
                  amount: ((session.amount_total || 0) / 100).toString(),
                  currency: session.currency || "usd",
                  status: "succeeded",
                  stripePaymentId: session.payment_intent as string,
                  stripeInvoiceId: session.invoice as string,
                  metadata: {
                    sessionId: session.id,
                    invoiceId: session.invoice as string,
                  },
                  createdAt: new Date(),
                });
                console.log(`[Stripe Webhook] Initial payment recorded for user: ${userId}`);
              } else {
                console.log(`[Stripe Webhook] Payment already exists for invoice: ${session.invoice}`);
              }
            } else {
              console.log(`[Stripe Webhook] No invoice attached to session.`);
            }
          } catch (dbError) {
            console.error(`[Stripe Webhook] Database Error in checkout.session.completed:`, dbError);
            throw dbError; // Rethrow to trigger the outer catch block
          }
        } else {
          console.log(`[Stripe Webhook] Not a subscription checkout or no subscription ID. Mode: ${session.mode}`);
        }
        break;
      }

      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const stripeSubscription = event.data.object as Stripe.Subscription;
        console.log(`[Stripe Webhook] Processing subscription event: ${event.type}`, {
          subscriptionId: stripeSubscription.id,
          customer: stripeSubscription.customer,
          status: stripeSubscription.status,
        });

        // Find user by Stripe customer ID
        const [existingSubscription] = await db
          .select()
          .from(subscription)
          .where(
            eq(
              subscription.stripeCustomerId,
              stripeSubscription.customer as string
            )
          )
          .limit(1);

        if (existingSubscription) {
          console.log(`[Stripe Webhook] Found existing subscription for user ${existingSubscription.userId}. Updating...`);
          const result = await upsertSubscription(
            existingSubscription.userId,
            stripeSubscription
          );
          console.log(
            "[Stripe Webhook] Subscription created/updated for user:",
            existingSubscription.userId,
            result
          );
        } else {
          // Try to find user by checking recent checkout sessions
          console.log(
            "[Stripe Webhook] No existing subscription found via customer ID, checking recent sessions..."
          );

          // Get recent checkout sessions for this customer
          const sessions = await stripe.checkout.sessions.list({
            customer: stripeSubscription.customer as string,
            limit: 10,
          });

          console.log(`[Stripe Webhook] Found ${sessions.data.length} sessions for customer ${stripeSubscription.customer}`);

          // Find a session with userId in metadata
          const sessionWithUser = sessions.data.find(
            (session) => session.metadata?.userId
          );

          if (sessionWithUser?.metadata?.userId) {
            console.log(
              "[Stripe Webhook] Found userId from prior session:",
              sessionWithUser.metadata.userId
            );
            const result = await upsertSubscription(
              sessionWithUser.metadata.userId,
              stripeSubscription
            );
            console.log("[Stripe Webhook] Subscription created for user from session:", result);
          } else {
            console.error(
              "[Stripe Webhook] No user found for customer:",
              stripeSubscription.customer,
              "Sessions checked (IDs):",
              sessions.data.map((s) => s.id)
            );
          }
        }
        break;
      }

      case "customer.subscription.deleted": {
        const stripeSubscription = event.data.object as Stripe.Subscription;
        console.log(`[Stripe Webhook] Subscription deleted: ${stripeSubscription.id}`);

        // Update subscription status to canceled
        const result = await db
          .update(subscription)
          .set({
            status: "canceled",
            updatedAt: new Date(),
          })
          .where(
            eq(
              subscription.stripeCustomerId,
              stripeSubscription.customer as string
            )
          )
          .returning();

        if (result.length > 0) {
          console.log(
            "[Stripe Webhook] Subscription marked canceled for customer:",
            stripeSubscription.customer
          );
        } else {
          console.warn(`[Stripe Webhook] Handling customer.subscription.deleted: No local subscription found for customer ${stripeSubscription.customer}`);
        }

        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;
        const subscriptionId = (invoice as any).subscription;
        console.log(`[Stripe Webhook] Invoice payment succeeded: ${invoice.id}, Subscription: ${subscriptionId}`);

        if (subscriptionId) {
          // Record successful payment
          const [existingSubscription] = await db
            .select()
            .from(subscription)
            .where(
              eq(subscription.stripeSubscriptionId, subscriptionId as string)
            )
            .limit(1);

          if (existingSubscription) {
            await db.insert(payment).values({
              userId: existingSubscription.userId,
              subscriptionId: existingSubscription.id,
              amount: (invoice.amount_paid / 100).toString(),
              currency: invoice.currency,
              status: "succeeded",
              stripePaymentId: (invoice as any).payment_intent as string,
              stripeInvoiceId: invoice.id,
              metadata: {
                invoiceNumber: invoice.number,
                invoiceUrl: invoice.hosted_invoice_url,
              },
              createdAt: new Date(),
            });

            console.log(
              "[Stripe Webhook] Payment recorded for user:",
              existingSubscription.userId
            );
          } else {
            console.warn(`[Stripe Webhook] Invoice payment succeeded but no subscription found for Stripe sub ID: ${subscriptionId}`);
          }
        }
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const subscriptionId = (invoice as any).subscription;
        console.log(`[Stripe Webhook] Invoice payment failed: ${invoice.id}, Subscription: ${subscriptionId}`);

        if (subscriptionId) {
          // Record failed payment
          const [existingSubscription] = await db
            .select()
            .from(subscription)
            .where(
              eq(subscription.stripeSubscriptionId, subscriptionId as string)
            )
            .limit(1);

          if (existingSubscription) {
            await db.insert(payment).values({
              userId: existingSubscription.userId,
              subscriptionId: existingSubscription.id,
              amount: (invoice.amount_due / 100).toString(),
              currency: invoice.currency,
              status: "failed",
              stripeInvoiceId: invoice.id,
              metadata: {
                invoiceNumber: invoice.number,
                failureReason: "Payment failed",
              },
              createdAt: new Date(),
            });

            console.log(
              "[Stripe Webhook] Failed payment recorded for user:",
              existingSubscription.userId
            );
          } else {
            console.warn(`[Stripe Webhook] Invoice payment failed but no subscription found for Stripe sub ID: ${subscriptionId}`);
          }
        }
        break;
      }

      default:
        console.log("[Stripe Webhook] Unhandled event type:", event.type);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("[Stripe Webhook] Webhook handler failed with error:", error);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 400 }
    );
  }
}
