import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { chatbot } from "@/db/schema";
import { eq } from "drizzle-orm";

// CORS headers for chatbot embedding
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers":
    "Content-Type, Authorization, X-Requested-With",
  "Access-Control-Allow-Credentials": "false",
};

// Handle preflight OPTIONS requests
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: corsHeaders,
  });
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: "Chatbot ID is required" },
        { status: 400, headers: corsHeaders }
      );
    }

    // Get chatbot status
    const [chatbotData] = await db
      .select({
        isActive: chatbot.isActive,
      })
      .from(chatbot)
      .where(eq(chatbot.id, id))
      .limit(1);

    if (!chatbotData) {
      return NextResponse.json(
        { error: "Chatbot not found" },
        { status: 404, headers: corsHeaders }
      );
    }

    return NextResponse.json(
      {
        isActive: chatbotData.isActive,
      },
      { headers: corsHeaders }
    );
  } catch (error) {
    console.error("Error fetching chatbot status:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500, headers: corsHeaders }
    );
  }
}
