import { db } from "@/lib/db";
import { bookings, agent, callLogs } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { sendBookingNotification } from "@/lib/email";

export async function POST(req: Request) {
    try {
        const body = await req.json();

        // Vapi can send the data in different structures
        const message = body.message || body;
        const messageType = message?.type;

        // Handle tool-calls message type
        if (messageType !== "tool-calls") {
            return NextResponse.json({ received: true });
        }

        // Extract tool calls - can be in different locations
        const toolCallList = message.toolCallList || message.toolCallsList || [];

        // Extract metadata - try multiple locations including the secret header
        const callData = message.call || body.call || {};
        const metadata = callData.metadata || {};
        const assistantMetadata = callData.assistant?.metadata || message.assistant?.metadata || {};

        // The server.secret in tool config is sent via x-vapi-secret header
        const secretHeader = req.headers.get("x-vapi-secret");

        const agentId = metadata.agentId ||
            assistantMetadata.agentId ||
            callData.assistantId ||
            body.metadata?.agentId ||
            secretHeader; // Fallback to secret which contains agentId

        const customerPhone = message.customer?.number || body.customer?.number || null;

        if (!agentId) {
            console.error("Tool call received without agentId");
            return NextResponse.json({
                results: toolCallList.map((tc: { id: string }) => ({
                    toolCallId: tc.id,
                    result: "I apologize, but I encountered a technical issue. Please try again."
                }))
            });
        }

        // Get the agent details
        const currentAgent = await db.query.agent.findFirst({
            where: eq(agent.id, agentId),
        });

        if (!currentAgent) {
            console.error(`Agent not found: ${agentId}`);
            return NextResponse.json({
                results: toolCallList.map((tc: { id: string }) => ({
                    toolCallId: tc.id,
                    result: "I apologize, but I couldn't complete your booking. Please contact us directly."
                }))
            });
        }

        // Process each tool call
        const results: Array<{ toolCallId: string; result: string }> = [];

        for (const toolCall of toolCallList) {
            // Tool name can be at top level OR nested in function object
            const toolName = toolCall.name || toolCall.function?.name;
            const toolCallId = toolCall.id;

            // Arguments can be a string (JSON) or already parsed object
            let args: Record<string, unknown> = {};
            const rawArgs = toolCall.arguments || toolCall.function?.arguments;

            if (typeof rawArgs === "string") {
                try {
                    args = JSON.parse(rawArgs);
                } catch {
                    args = {};
                }
            } else if (rawArgs && typeof rawArgs === "object") {
                args = rawArgs as Record<string, unknown>;
            }

            if (toolName === "book_appointment") {
                const bookingArgs = args as {
                    customer_name?: string;
                    customer_email?: string;
                    customer_phone?: string;
                    booking_date?: string;
                    service_details?: string;
                };

                try {
                    // 1. Validate Input Data strictly
                    const email = bookingArgs.customer_email?.trim();
                    const name = bookingArgs.customer_name?.trim();

                    // Basic email validation regex
                    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

                    if (!email || !emailRegex.test(email)) {
                        results.push({
                            toolCallId: toolCallId,
                            result: "Error: The email address is invalid or missing. Please ask the customer to spell their email address again, character by character."
                        });
                        continue;
                    }

                    if (!name || name.length < 2) {
                        results.push({
                            toolCallId: toolCallId,
                            result: "Error: A valid customer name is required. Please ask for their full name."
                        });
                        continue;
                    }

                    // Find or create a call log entry for this booking
                    let callLogId: string | null = null;
                    const vapiCallId = callData.id || message.call?.id || body.call?.id;

                    if (vapiCallId) {
                        const existingLog = await db.query.callLogs.findFirst({
                            where: eq(callLogs.vapiCallId, vapiCallId),
                        });
                        callLogId = existingLog?.id || null;
                    }

                    // If no call log exists yet, create a placeholder
                    if (!callLogId) {
                        const [newLog] = await db
                            .insert(callLogs)
                            .values({
                                agentId: agentId,
                                vapiCallId: vapiCallId || `tool-${Date.now()}`,
                                callerNumber: customerPhone,
                            })
                            .returning();
                        callLogId = newLog.id;
                    }

                    // Parse booking date
                    let bookingDate: Date | null = null;
                    if (bookingArgs.booking_date) {
                        bookingDate = new Date(bookingArgs.booking_date);
                        // If parse failed, try relative parsing
                        if (isNaN(bookingDate.getTime())) {
                            bookingDate = parseRelativeDate(bookingArgs.booking_date);
                        }
                    }

                    // Save booking to database
                    const [savedBooking] = await db
                        .insert(bookings)
                        .values({
                            agentId: agentId,
                            callLogId: callLogId,
                            customerName: bookingArgs.customer_name || null,
                            customerEmail: bookingArgs.customer_email || null,
                            customerPhone: customerPhone || bookingArgs.customer_phone,
                            bookingDate: bookingDate,
                            serviceDetails: bookingArgs.service_details || null,
                            status: "confirmed",
                        })
                        .returning();

                    console.log("Booking saved:", savedBooking.id);

                    // Send email notification to admin if configured
                    if (currentAgent.adminEmail) {
                        sendBookingNotification(
                            currentAgent.adminEmail,
                            {
                                customerName: bookingArgs.customer_name || null,
                                customerEmail: bookingArgs.customer_email || null,
                                customerPhone: customerPhone || bookingArgs.customer_phone,
                                bookingDate: bookingDate,
                                serviceDetails: bookingArgs.service_details || null,
                                agentName: currentAgent.name,
                            }
                        ).catch(err => console.error("Email notification error:", err));
                    }

                    const dateStr = bookingDate
                        ? bookingDate.toLocaleDateString('en-US', {
                            weekday: 'long',
                            month: 'long',
                            day: 'numeric',
                            hour: 'numeric',
                            minute: '2-digit'
                        })
                        : "your requested date";

                    // Build confirmation message based on contact info provided
                    let confirmationMsg = `Great news! I've successfully booked your appointment for ${bookingArgs.customer_name || "you"} on ${dateStr}.`;
                    if (bookingArgs.service_details) {
                        confirmationMsg += ` Service: ${bookingArgs.service_details}.`;
                    }
                    if (bookingArgs.customer_phone || customerPhone) {
                        confirmationMsg += ` We'll send you a confirmation text or give you a call to confirm.`;
                    } else if (bookingArgs.customer_email) {
                        confirmationMsg += ` We'll send you an email confirmation shortly.`;
                    } else {
                        confirmationMsg += ` Your booking is confirmed!`;
                    }

                    results.push({
                        toolCallId: toolCallId,
                        result: confirmationMsg,
                    });
                } catch (dbError) {
                    console.error("Database error saving booking:", dbError);
                    results.push({
                        toolCallId: toolCallId,
                        result: "I apologize, but I encountered an issue while saving your booking. Please try again.",
                    });
                }
            } else {
                console.warn(`Unknown tool: ${toolName}`);
                results.push({
                    toolCallId: toolCallId,
                    result: "I'm sorry, this action is not available at the moment.",
                });
            }
        }

        return NextResponse.json({ results });
    } catch (error) {
        console.error("Error in tool-calls webhook:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}

/**
 * Parse relative date strings like "tomorrow at 2pm", "next Monday at 10am"
 */
function parseRelativeDate(dateStr: string): Date | null {
    const now = new Date();
    const lower = dateStr.toLowerCase();

    // Extract time if present
    const timeMatch = lower.match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/i);
    let hours = 9;
    let minutes = 0;

    if (timeMatch) {
        hours = parseInt(timeMatch[1]);
        minutes = parseInt(timeMatch[2] || "0");
        if (timeMatch[3]?.toLowerCase() === "pm" && hours < 12) {
            hours += 12;
        } else if (timeMatch[3]?.toLowerCase() === "am" && hours === 12) {
            hours = 0;
        }
    }

    let targetDate = new Date(now);

    if (lower.includes("tomorrow")) {
        targetDate.setDate(targetDate.getDate() + 1);
    } else if (lower.includes("today")) {
        // Keep same day
    } else if (lower.includes("next week")) {
        targetDate.setDate(targetDate.getDate() + 7);
    } else if (lower.includes("monday")) {
        targetDate = getNextDayOfWeek(now, 1);
    } else if (lower.includes("tuesday")) {
        targetDate = getNextDayOfWeek(now, 2);
    } else if (lower.includes("wednesday")) {
        targetDate = getNextDayOfWeek(now, 3);
    } else if (lower.includes("thursday")) {
        targetDate = getNextDayOfWeek(now, 4);
    } else if (lower.includes("friday")) {
        targetDate = getNextDayOfWeek(now, 5);
    } else if (lower.includes("saturday")) {
        targetDate = getNextDayOfWeek(now, 6);
    } else if (lower.includes("sunday")) {
        targetDate = getNextDayOfWeek(now, 0);
    }

    targetDate.setHours(hours, minutes, 0, 0);
    return targetDate;
}

function getNextDayOfWeek(date: Date, dayOfWeek: number): Date {
    const result = new Date(date);
    const currentDay = result.getDay();
    const daysUntil = (dayOfWeek - currentDay + 7) % 7 || 7;
    result.setDate(result.getDate() + daysUntil);
    return result;
}
