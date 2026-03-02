import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { agent } from "@/db/schema";
import { eq } from "drizzle-orm";
import { ensureUserExists } from "@/lib/user-utils";
import { twilioClient } from "@/lib/twilio";
import { importPhoneNumberToVapi } from "@/lib/vapi";
import { getBaseUrl } from "@/lib/utils";

// GET - Fetch user's agents
export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await ensureUserExists({
            id: session.user.id,
            email: session.user.email || "",
            name: session.user.name || "",
            image: session.user.image || null,
        });

        const userAgents = await db
            .select()
            .from(agent)
            .where(eq(agent.userId, session.user.id))
            .orderBy(agent.createdAt);

        return NextResponse.json({ agents: userAgents });
    } catch (error) {
        console.error("Error fetching agents:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

// POST - Create new agent
export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const userId = session.user.id;

        await ensureUserExists({
            id: userId,
            email: session.user.email || "",
            name: session.user.name || "",
            image: session.user.image || null,
        });

        const body = await request.json();

        // Get base URL for webhooks - use env var or auto-detect from request headers
        const baseUrl = getBaseUrl(request);

        const {
            name,
            description,
            phoneNumber,
            phoneSid,
            clientId,
            voice = "female",
            welcomeMessage = "Hi! How can I help you today?",
            businessContext,
            businessType,
            availabilityContext,
            adminEmail,
            isActive = true,
        } = body;

        // Validate required fields
        if (!name) {
            return NextResponse.json(
                { error: "Agent name is required" },
                { status: 400 }
            );
        }

        // If phoneSid is missing, it means we need to purchase the number now
        let finalPhoneNumber = phoneNumber;
        let finalPhoneSid = phoneSid;
        let vapiPhoneNumberId: string | undefined;

        if (!finalPhoneSid && finalPhoneNumber) {
            try {
                // Purchase the number from Twilio
                const purchasedNumber = await twilioClient.incomingPhoneNumbers.create({
                    phoneNumber: finalPhoneNumber,
                    voiceUrl: `${baseUrl}/api/twilio/inbound`,
                    voiceMethod: 'POST'
                });

                finalPhoneNumber = purchasedNumber.phoneNumber;
                finalPhoneSid = purchasedNumber.sid;
                console.log(`Purchased Twilio number ${finalPhoneNumber} (SID: ${finalPhoneSid})`);

                // Import the number to Vapi for AI voice handling
                const vapiResult = await importPhoneNumberToVapi({
                    number: finalPhoneNumber,
                    name: `${name} - Voice Agent`,
                    serverUrl: `${baseUrl}/api/vapi/assistant-request`,
                    twilioAccountSid: process.env.TWILIO_ACCOUNT_SID!,
                    twilioAuthToken: process.env.TWILIO_AUTH_TOKEN!,
                });

                if (vapiResult.success) {
                    vapiPhoneNumberId = vapiResult.phoneNumberId;
                    console.log(`Imported to Vapi with ID: ${vapiPhoneNumberId} `);
                } else {
                    // Log the error but don't fail - Vapi import can be retried
                    console.warn(`Vapi import failed: ${vapiResult.error} `);
                }
            } catch (error: unknown) {
                console.error("Twilio Purchase Error:", error);

                // Check for specific Twilio errors
                const twilioError = error as { code?: number; message?: string };

                if (twilioError.code === 21631) {
                    // Address requirement error
                    return NextResponse.json(
                        {
                            error: "This phone number requires a registered business address. Please select a US phone number, or contact support to register an address for international numbers.",
                            code: "ADDRESS_REQUIRED"
                        },
                        { status: 400 }
                    );
                }

                return NextResponse.json(
                    { error: "Failed to purchase the selected phone number. Please try a different one." },
                    { status: 500 }
                );
            }
        }

        // Generate a clientId if missing (needed for browser calls)
        let finalClientId = clientId;
        if (!finalClientId) {
            finalClientId = `client:${name.toLowerCase().replace(/\s+/g, '-')} -${Math.random().toString(36).substring(2, 7)} `;
        }

        // Create the agent
        const newAgent = await db
            .insert(agent)
            .values({
                userId,
                name,
                description,
                phoneNumber: finalPhoneNumber,
                phoneSid: finalPhoneSid,
                clientId: finalClientId,
                voice,
                welcomeMessage,
                businessContext,
                businessType,
                availabilityContext,
                adminEmail,
                isActive,
                // Store Vapi phone number ID for later management
                vapiPhoneNumberId: vapiPhoneNumberId || null,
            })
            .returning();

        return NextResponse.json(
            {
                agent: newAgent[0],
                message: "Agent created successfully",
                vapiImported: !!vapiPhoneNumberId,
            },
            { status: 201 }
        );
    } catch (error) {
        console.error("Error creating agent:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
