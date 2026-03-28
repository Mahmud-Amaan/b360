import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { chatbot } from "@/db/schema";
import { eq } from "drizzle-orm";
import { trackUsage } from "@/lib/middleware/usage";
import { ensureUserExists } from "@/lib/user-utils";

// GET - Fetch user's chatbots
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Ensure user exists in database
    await ensureUserExists({
      id: session.user.id,
      email: session.user.email || "",
      name: session.user.name || "",
      image: session.user.image || null,
    });

    const userChatbots = await db
      .select()
      .from(chatbot)
      .where(eq(chatbot.userId, session.user.id))
      .orderBy(chatbot.createdAt);

    return NextResponse.json({ chatbots: userChatbots });
  } catch (error) {
    console.error("Error fetching chatbots:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST - Create new chatbot
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    // Ensure user exists in database
    await ensureUserExists({
      id: userId,
      email: session.user.email || "",
      name: session.user.name || "",
      image: session.user.image || null,
    });

    const body = await request.json();
    const {
      name,
      position = "bottom-right",
      primaryColor = "#6366F1",
      productName,
      description,
      chatbotTitle = "Chat with us",
      welcomeMessage = "Hi! How can I help you today?",
      isActive = true,
      iconType = "default",
      iconEmoji,
      customIcon,
      adminEmail,
    } = body;

    // Validate required fields
    if (!name) {
      return NextResponse.json(
        { error: "Chatbot name is required" },
        { status: 400 }
      );
    }

    if (!productName) {
      return NextResponse.json(
        { error: "Product name is required" },
        { status: 400 }
      );
    }

    if (!description) {
      return NextResponse.json(
        { error: "Description is required" },
        { status: 400 }
      );
    }

    // Create the chatbot
    const newChatbot = await db
      .insert(chatbot)
      .values({
        userId,
        name,
        position,
        primaryColor,
        productName,
        description,
        chatbotTitle,
        welcomeMessage,
        isActive,
        iconType,
        iconEmoji,
        customIcon,
        adminEmail,
      })
      .returning();

    // Track the chatbot creation in usage
    await trackUsage(userId, "chatbot");

    return NextResponse.json(
      {
        chatbot: newChatbot[0],
        message: "Chatbot created successfully",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating chatbot:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
