import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { agent } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getBaseUrl } from "@/lib/utils";
import { generateVapiAssistantConfig } from "@/lib/vapi-config";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { agentId } = body;

        if (!agentId) {
            return NextResponse.json({ error: "Agent ID is required" }, { status: 400 });
        }

        // Get the agent details
        const currentAgent = await db.query.agent.findFirst({
            where: eq(agent.id, agentId),
            with: {
                user: true
            }
        });

        if (!currentAgent) {
            return NextResponse.json({ error: "Agent not found" }, { status: 404 });
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

        console.log(`🚀 Generated Assistant Config for ${currentAgent.name}`);

        return NextResponse.json(assistant);
    } catch (error) {
        console.error("Error generating assistant config:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
