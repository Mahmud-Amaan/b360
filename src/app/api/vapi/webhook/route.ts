import { db } from "@/lib/db";
import { callLogs, bookings, agent } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { sendBookingNotification } from "@/lib/email";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { message } = body;

        // Only handle end-of-call-report
        if (message?.type !== "end-of-call-report") {
            return NextResponse.json({ received: true });
        }

        const { call, artifact, analysis, customer } = message;

        // Try to get agentId from multiple possible locations
        const metadata = call?.metadata || {};
        const assistantMetadata = call?.assistant?.metadata || {};
        const messageAssistantMetadata = message?.assistant?.metadata || {};

        const agentId = metadata.agentId ||
            assistantMetadata.agentId ||
            messageAssistantMetadata.agentId ||
            call?.assistantId;

        if (!agentId) {
            console.warn(`Webhook received for call ${call?.id} without agentId`);
            return NextResponse.json({ received: true, warning: "Missing agentId" });
        }

        // Fetch agent details
        const currentAgent = await db.query.agent.findFirst({
            where: eq(agent.id, agentId),
        });

        if (!currentAgent) {
            console.error(`Agent not found: ${agentId}`);
            return NextResponse.json({ error: "Agent not found" }, { status: 404 });
        }

        // Calculate duration - try multiple sources
        let duration = call?.duration || call?.durationSeconds || 0;
        if (!duration && call?.startedAt && call?.endedAt) {
            try {
                const startDate = new Date(call.startedAt);
                const endDate = new Date(call.endedAt);
                if (!isNaN(startDate.getTime()) && !isNaN(endDate.getTime())) {
                    duration = Math.round((endDate.getTime() - startDate.getTime()) / 1000);
                }
            } catch {
                console.warn("Failed to parse call start/end times");
            }
        }
        // Fallback: estimate ~3 seconds per message exchange
        if (!duration && artifact?.messages?.length) {
            duration = Math.round(artifact.messages.length * 3);
        }

        // Check if call log already exists (created during tool-calls)
        const existingLog = call?.id
            ? await db.query.callLogs.findFirst({
                where: eq(callLogs.vapiCallId, call.id),
            })
            : null;

        let savedCallLog;
        if (existingLog) {
            // Update existing log with final details
            const [updated] = await db
                .update(callLogs)
                .set({
                    callSid: call?.twilioCallSid || existingLog.callSid,
                    duration: duration || existingLog.duration,
                    summary: analysis?.summary || existingLog.summary,
                    transcript: artifact?.transcript || existingLog.transcript,
                    recordingUrl: null,
                })
                .where(eq(callLogs.id, existingLog.id))
                .returning();
            savedCallLog = updated;
        } else {
            // Create new call log
            const [created] = await db
                .insert(callLogs)
                .values({
                    agentId: agentId,
                    callSid: call?.twilioCallSid || null,
                    vapiCallId: call?.id,
                    callerNumber: customer?.number || null,
                    duration: duration,
                    summary: analysis?.summary || null,
                    transcript: artifact?.transcript || null,
                    recordingUrl: null,
                })
                .returning();
            savedCallLog = created;
        }

        // Extract and save booking if present in structuredData (fallback)
        const structuredData = analysis?.structuredData;
        if (structuredData && (structuredData.bookingDate || structuredData.booking_date || structuredData.customer_name || structuredData.customerName)) {

            // detailed checking for existing booking - DO THIS FIRST
            const existingBooking = await db.query.bookings.findFirst({
                where: eq(bookings.callLogId, savedCallLog.id),
            });

            if (existingBooking) {
                console.log("Booking already exists for call log, skipping structured data fallback.");
            } else {
                // Parse booking date safely
                let bookingDate: Date | null = null;
                const rawDate = structuredData.bookingDate || structuredData.booking_date;
                if (rawDate) {
                    const parsed = new Date(rawDate);
                    // Check if the date is valid
                    if (!isNaN(parsed.getTime())) {
                        bookingDate = parsed;
                    } else {
                        console.warn(`Invalid booking date received: ${rawDate}`);
                    }
                }

                const bookingData = {
                    customerName: structuredData.customerName || structuredData.customer_name || null,
                    customerEmail: structuredData.customerEmail || structuredData.customer_email || null,
                    customerPhone: customer?.number || structuredData.customerPhone || structuredData.customer_phone || null,
                    bookingDate: bookingDate,
                    serviceDetails: structuredData.serviceDetails || structuredData.service_details || null,
                };

                await db.insert(bookings).values({
                    agentId: agentId,
                    callLogId: savedCallLog.id,
                    ...bookingData,
                    status: "confirmed",
                });

                // Send email notification
                // Send email notification - DISABLED to prevent duplicates (Tool calls already send email)
                /* 
                if (currentAgent.adminEmail) {
                    await sendBookingNotification(currentAgent.adminEmail, {
                        ...bookingData,
                        agentName: currentAgent.name,
                    });
                }
                */
            }
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error in Vapi webhook:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
