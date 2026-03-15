import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { user, agent } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { twilioClient } from "@/lib/twilio";
import { deleteVapiPhoneNumber } from "@/lib/vapi";

// Get a specific agent
export async function GET(
    req: Request,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const params = await context.params;
        const session = await getServerSession(authOptions);

        if (!session?.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const userData = await db.query.user.findFirst({
            where: eq(user.email, session.user.email),
        });

        if (!userData) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        const agentData = await db.query.agent.findFirst({
            where: and(eq(agent.id, params.id), eq(agent.userId, userData.id)),
        });

        if (!agentData) {
            return NextResponse.json({ error: "Agent not found" }, { status: 404 });
        }

        return NextResponse.json({ agent: agentData });
    } catch (error) {
        console.error("Error fetching agent:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

// Update an agent
export async function PATCH(
    req: Request,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const params = await context.params;
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const userData = await db.query.user.findFirst({
            where: eq(user.email, session.user.email),
        });

        if (!userData) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        const body = await req.json();
        const now = new Date();

        const [updatedAgent] = await db
            .update(agent)
            .set({
                ...body,
                updatedAt: now,
            })
            .where(and(eq(agent.id, params.id), eq(agent.userId, userData.id)))
            .returning();

        if (!updatedAgent) {
            return NextResponse.json({ error: "Agent not found" }, { status: 404 });
        }

        return NextResponse.json({ agent: updatedAgent });
    } catch (error) {
        console.error("Error updating agent:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

// Delete an agent
export async function DELETE(
    req: Request,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const params = await context.params;
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const userData = await db.query.user.findFirst({
            where: eq(user.email, session.user.email),
        });

        if (!userData) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        const agentData = await db.query.agent.findFirst({
            where: and(eq(agent.id, params.id), eq(agent.userId, userData.id)),
        });

        if (!agentData) {
            return NextResponse.json({ error: "Agent not found" }, { status: 404 });
        }

        // Clean up Vapi phone number if it exists
        if (agentData.vapiPhoneNumberId) {
            try {
                await deleteVapiPhoneNumber(agentData.vapiPhoneNumberId);
                console.log(`Deleted Vapi phone number ${agentData.vapiPhoneNumberId}`);
            } catch (error) {
                console.error("Error deleting Vapi phone number:", error);
            }
        }

        // Clean up Twilio phone number if it exists
        if (agentData.phoneSid && agentData.phoneSid !== "existing-trial") {
            try {
                await twilioClient.incomingPhoneNumbers(agentData.phoneSid).remove();
                console.log(`Deleted Twilio phone number ${agentData.phoneSid}`);
            } catch (error) {
                console.error("Error deleting Twilio phone number:", error);
            }
        }

        const [deletedAgent] = await db
            .delete(agent)
            .where(and(eq(agent.id, params.id), eq(agent.userId, userData.id)))
            .returning();

        if (!deletedAgent) {
            return NextResponse.json({ error: "Agent not found" }, { status: 404 });
        }

        return NextResponse.json({ agent: deletedAgent });
    } catch (error) {
        console.error("Error deleting agent:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
