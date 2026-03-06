import { db } from "@/lib/db";
import { agent as agentTable } from "@/db/schema";
import { eq, or, sql } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getBaseUrl } from "@/lib/utils";
import { generateVapiAssistantConfig } from "@/lib/vapi-config";

export async function POST(req: Request) {
    try {
        const text = await req.text();
        if (!text) {
            return NextResponse.json({ message: "Empty body" }, { status: 200 });
        }
        const body = JSON.parse(text);
        console.log("Vapi request body:", JSON.stringify(body, null, 2));

        // Vapi sends the message type at the top level
        const messageType = body.message?.type || body.type;

        // This is called by Vapi when looking for an assistant for an inbound call
        if (messageType !== "assistant-request") {
            const phoneNumber = body.message?.phoneNumber?.number || body.phoneNumber?.number;
            console.log(`Received ${messageType} message for ${phoneNumber}`);
            return NextResponse.json({ received: true });
        }

        // Extract the phone number being called - exhaustive list of fields
        const phoneNumber =
            body.message?.call?.to || // Most common for inbound calls
            body.message?.phoneNumber?.number ||
            body.message?.to ||
            body.phoneNumber?.number ||
            body.message?.call?.phoneNumber?.number ||
            body.call?.phoneNumber?.number ||
            body.to;

        if (!phoneNumber) {
            console.error("❌ No destination phone number found in request body:", JSON.stringify(body));
            return NextResponse.json({
                error: "Phone number not found in request"
            }, { status: 400 });
        }

        console.log(`Searching for agent with phone number: ${phoneNumber}`);

        // Helper to strip non-digits for comparison
        const stripChars = (num: string) => num.replace(/\D/g, "");
        const cleanIncoming = stripChars(phoneNumber);

        console.log(`Clean incoming: ${cleanIncoming}`);

        // Find the agent associated with this phone number
        const currentAgent = await db.query.agent.findFirst({
            where: (agent, { eq, or, sql }) => {
                const conditions = [
                    eq(agent.phoneNumber, phoneNumber),
                    eq(agent.phoneNumber, cleanIncoming),
                    eq(agent.phoneNumber, `+${cleanIncoming}`),
                    sql`REGEXP_REPLACE(${agent.phoneNumber}, '\D', '', 'g') = ${cleanIncoming}`
                ];

                // If Vapi sent a phone number ID, try to match that too
                const vapiPhoneId = body.message?.phoneNumber?.id || body.phoneNumber?.id;
                if (vapiPhoneId) {
                    conditions.push(eq(agent.vapiPhoneNumberId, vapiPhoneId));
                }

                return or(...conditions);
            }
        });

        if (!currentAgent) {
            console.error(`❌ No agent found for phone number: ${phoneNumber}. Check your dashboard to ensure this number is assigned to an agent.`);
            console.log("Current body was:", JSON.stringify(body, null, 2));
            return NextResponse.json({
                error: "No agent configured for this number",
                details: `Looked for: ${phoneNumber} or ${cleanIncoming}`
            }, { status: 404 });
        }

        const baseUrl = getBaseUrl(req);

        // Generate assistant config using shared utility
        const assistant = generateVapiAssistantConfig({
            name: currentAgent.name,
            welcomeMessage: currentAgent.welcomeMessage,
            businessContext: currentAgent.businessContext,
            businessType: currentAgent.businessType,
            availabilityContext: currentAgent.availabilityContext,
            voice: currentAgent.voice,
            baseUrl,
            agentId: currentAgent.id
        });

        // Create the final response payload (wrapped for Vapi)
        const assistantResponse = {
            assistant: assistant,
            server: {
                url: `${baseUrl}/api/vapi/webhook`,
                timeoutSeconds: 30,
            }
        };

        console.log(`✅ Transient assistant delivered for: ${currentAgent.name}`);

        return NextResponse.json(assistantResponse);
    } catch (error) {
        console.error("❌ Error in assistant-request webhook:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
