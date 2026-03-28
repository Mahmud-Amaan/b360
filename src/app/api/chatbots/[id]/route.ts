import { NextResponse } from "next/server";

import { db } from "@/lib/db";
import { user, chatbot } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// CORS headers for chatbot embedding
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers":
    "Content-Type, Authorization, X-Requested-With",
  "Access-Control-Allow-Credentials": "false",
};

// Get a specific chatbot (public access for chatbot loading)
export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const chatbotData = await db.query.chatbot.findFirst({
      where: eq(chatbot.id, params.id),
    });

    if (!chatbotData) {
      return NextResponse.json(
        { error: "Chatbot not found" },
        { status: 404, headers: corsHeaders }
      );
    }

    if (!chatbotData.isActive) {
      return NextResponse.json(
        { error: "Chatbot is not active" },
        { status: 400, headers: corsHeaders }
      );
    }

    // Return only public chatbot configuration (no sensitive data)
    const publicChatbot = {
      id: chatbotData.id,
      position: chatbotData.position,
      primaryColor: chatbotData.primaryColor,
      productName: chatbotData.productName,
      description: chatbotData.description,
      chatbotTitle: chatbotData.chatbotTitle,
      welcomeMessage: chatbotData.welcomeMessage,
      iconType: chatbotData.iconType,
      iconEmoji: chatbotData.iconEmoji,
      customIcon: chatbotData.customIcon,
    };

    return NextResponse.json(
      { chatbot: publicChatbot },
      { headers: corsHeaders }
    );
  } catch (error) {
    console.error("Error fetching chatbot:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500, headers: corsHeaders }
    );
  }
}

// Handle preflight requests
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}

// Update a chatbot
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

    const [updatedChatbot] = await db
      .update(chatbot)
      .set({
        ...body,
        updatedAt: now,
      })
      .where(and(eq(chatbot.id, params.id), eq(chatbot.userId, userData.id)))
      .returning();

    if (!updatedChatbot) {
      return NextResponse.json({ error: "Chatbot not found" }, { status: 404 });
    }

    return NextResponse.json({ chatbot: updatedChatbot });
  } catch (error) {
    console.error("Error updating chatbot:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Delete a chatbot
export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params; // Get the params from the context
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

    const [deletedChatbot] = await db
      .delete(chatbot)
      .where(and(eq(chatbot.id, params.id), eq(chatbot.userId, userData.id)))
      .returning();

    if (!deletedChatbot) {
      return NextResponse.json({ error: "Chatbot not found" }, { status: 404 });
    }

    return NextResponse.json({ chatbot: deletedChatbot });
  } catch (error) {
    console.error("Error deleting chatbot:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
