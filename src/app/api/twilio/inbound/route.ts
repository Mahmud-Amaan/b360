// app/api/twilio/inbound/route.ts
//
// ============================================================================
// MULTI-TENANT PHONE CALLS - SETUP INSTRUCTIONS
// ============================================================================
//
// For inbound phone calls to work with your AI voice agents, you need to
// configure your Twilio numbers in Vapi. Here's how:
//
// OPTION A: Import Twilio Numbers to Vapi (Recommended for Multi-Tenant)
// -----------------------------------------------------------------------
// 1. Go to https://dashboard.vapi.ai/phone-numbers
// 2. Click "Import" → Select "Twilio"
// 3. Enter your Twilio Account SID and Auth Token
// 4. Import your phone number(s)
// 5. For each number, configure:
//    - Server URL: https://your-domain.com/api/vapi/assistant-request
//    - Leave "Assistant" empty (the webhook will provide it dynamically)
//
// When a call comes in:
// 1. Vapi receives the call on the imported Twilio number
// 2. Vapi calls your /api/vapi/assistant-request endpoint
// 3. Your endpoint looks up which tenant owns that phone number
// 4. You return a transient assistant configuration for that tenant
// 5. The call proceeds with that tenant's AI agent!
//
// OPTION B: Direct Twilio Webhook (This file - for fallback/testing)
// -----------------------------------------------------------------------
// This route handles direct Twilio webhooks but cannot fully integrate
// with Vapi for voice AI. It's mainly for:
// - Browser-based client calls (client:xxx format)
// - Fallback when Vapi isn't configured
//
// ============================================================================

import { NextResponse } from "next/server";
import VoiceResponse from "twilio/lib/twiml/VoiceResponse";
import { db } from "@/lib/db";
import { agent as agentTable } from "@/db/schema";
import { eq } from "drizzle-orm";

// Handle GET request (Twilio can send webhooks as GET)
export async function GET(req: Request) {
    const url = new URL(req.url);
    const params = url.searchParams;
    return handleInboundCall(params);
}

// Handle POST request
export async function POST(req: Request) {
    const formData = await req.text();
    const params = new URLSearchParams(formData);
    return handleInboundCall(params);
}

// Shared handler for both GET and POST
async function handleInboundCall(params: URLSearchParams) {
    try {
        const from = params.get("From");
        const to = params.get("To");

        let tenantIdentifier: string | null = null;
        if (to && to.startsWith("client:")) tenantIdentifier = to;
        else if (to) tenantIdentifier = to;
        else if (from) tenantIdentifier = from;

        if (!tenantIdentifier) {
            return new NextResponse("Missing destination identifier", { status: 400 });
        }

        const currentAgent = await db.query.agent.findFirst({
            where: tenantIdentifier.startsWith("client:")
                ? eq(agentTable.clientId, tenantIdentifier)
                : eq(agentTable.phoneNumber, tenantIdentifier),
        });

        const twiml = new VoiceResponse();

        if (!currentAgent || !currentAgent.isActive) {
            twiml.say({ voice: "alice" }, "We are sorry, this service is currently unavailable. Goodbye.");
            return new NextResponse(twiml.toString(), {
                headers: { "Content-Type": "text/xml" },
            });
        }

        // For browser client calls (Web SDK handles this via Vapi directly)
        if (tenantIdentifier.startsWith("client:")) {
            twiml.say({ voice: "alice" }, "Connecting you now.");
            twiml.pause({ length: 30 });
            return new NextResponse(twiml.toString(), {
                headers: { "Content-Type": "text/xml" },
            });
        }

        // For direct phone calls - these should be handled by Vapi
        // If we're here, it means the number isn't imported to Vapi yet
        console.log(`Direct Twilio call to ${to} - Number should be imported to Vapi`);

        twiml.say({ voice: "alice" },
            `Thank you for calling ${currentAgent.name}. ` +
            `Please hold while we connect you to our assistant.`
        );

        // Provide helpful message - in production, import to Vapi
        twiml.say({ voice: "alice" },
            `We apologize, but our voice assistant is being configured. ` +
            `Please try again shortly or visit our website. Thank you for your patience.`
        );

        twiml.hangup();

        return new NextResponse(twiml.toString(), {
            headers: { "Content-Type": "text/xml" },
        });
    } catch (error) {
        console.error("Error in Twilio inbound route:", error);
        const twiml = new VoiceResponse();
        twiml.say({ voice: "alice" }, "We're sorry, an error occurred. Please try again later.");
        return new NextResponse(twiml.toString(), {
            headers: { "Content-Type": "text/xml" },
        });
    }
}
