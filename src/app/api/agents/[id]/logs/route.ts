import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { callLogs, bookings, agent } from "@/db/schema";
import { eq, desc, sql, and } from "drizzle-orm";

export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: agentId } = await params;
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Check if agent belongs to user
        const currentAgent = await db.query.agent.findFirst({
            where: and(eq(agent.id, agentId), eq(agent.userId, session.user.id))
        });

        if (!currentAgent) {
            return NextResponse.json({ error: "Agent not found" }, { status: 404 });
        }

        // Fetch logs - load all for client-side filtering/pagination
        const logs = await db.query.callLogs.findMany({
            where: eq(callLogs.agentId, agentId),
            orderBy: [desc(callLogs.createdAt)],
        });

        // Fetch bookings
        const agentBookings = await db.query.bookings.findMany({
            where: eq(bookings.agentId, agentId),
            orderBy: [desc(bookings.createdAt)],
        });

        // Calculate stats
        const statsResult = await db
            .select({
                totalCalls: sql<number>`count(*)`,
                avgDuration: sql<number>`avg(${callLogs.duration})`,
            })
            .from(callLogs)
            .where(eq(callLogs.agentId, agentId));

        const stats = {
            totalCalls: Number(statsResult[0]?.totalCalls || 0),
            avgDuration: Math.round(Number(statsResult[0]?.avgDuration || 0)),
            totalBookings: agentBookings.length,
        };

        return NextResponse.json({
            logs,
            bookings: agentBookings,
            stats,
        });
    } catch (error) {
        console.error("Error fetching agent logs:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
