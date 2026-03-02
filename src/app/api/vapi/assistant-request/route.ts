import { db } from "@/lib/db";
import { agent as agentTable } from "@/db/schema";
import { eq, or } from "drizzle-orm";
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

        // Vapi sends the message type at the top level
        const messageType = body.message?.type || body.type;

        // This is called by Vapi when looking for an assistant for an inbound call
        if (messageType !== "assistant-request") {
            const phoneNumber = body.message?.phoneNumber?.number || body.phoneNumber?.number;
            console.log(`Received ${messageType} message for ${phoneNumber}`);
            return NextResponse.json({ received: true });
        }

        // Extract the phone number being called - try multiple locations
        const phoneNumber =
            body.message?.phoneNumber?.number ||
            body.phoneNumber?.number ||
            body.message?.call?.phoneNumber?.number ||
            body.call?.phoneNumber?.number ||
            body.message?.to ||
            body.to;

        if (!phoneNumber) {
            console.error("No phone number in assistant request");
            return NextResponse.json({
                error: "Phone number not found"
            }, { status: 400 });
        }

        // Find the agent associated with this phone number
        const currentAgent = await db.query.agent.findFirst({
            where: (agentTable, { eq, or }) => or(
                eq(agentTable.phoneNumber, phoneNumber),
                // Handle cases where number might have formatting differences
                eq(agentTable.phoneNumber, phoneNumber.replace(/^\+/, "")),
                eq(agentTable.phoneNumber, `+${phoneNumber.replace(/^\+/, "")}`),
                agentTable.vapiPhoneNumberId ? eq(agentTable.vapiPhoneNumberId, body.message?.phoneNumber?.id || "unknown") : undefined
            )
        });

        if (!currentAgent) {
            console.error(`No agent found for phone number: ${phoneNumber}`);
            return NextResponse.json({
                error: "No agent configured for this number"
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
