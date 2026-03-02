import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { agent } from "@/db/schema";

// Public endpoint for test tools to list agents
export async function GET() {
    try {
        const allAgents = await db
            .select({
                id: agent.id,
                name: agent.name,
                phoneNumber: agent.phoneNumber
            })
            .from(agent);

        return NextResponse.json({ agents: allAgents });
    } catch (error) {
        console.error("Error listing agents:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
