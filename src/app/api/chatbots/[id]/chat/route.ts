import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { chatbot, chatbotLead } from "@/db/schema";
import { eq } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import { generateAIResponse } from "@/lib/ai";
import { UsageService } from "@/lib/usage";
import nodemailer from "nodemailer";

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

// POST - Handle chat messages for a specific chatbot (public endpoint)
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const body = await request.json();
    const { message } = body;

    // Validate required fields
    if (!message) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400, headers: corsHeaders }
      );
    }

    // Verify chatbot exists and is active
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

    // Check usage limits before processing
    const canSendMessage = await UsageService.canPerformAction(
      chatbotData.userId,
      "message"
    );

    if (!canSendMessage) {
      return NextResponse.json(
        {
          error: "Message limit reached for this month.",
          response:
            "Sorry, but I can't reply. The message limit for this chatbot has been reached.",
        },
        { status: 429, headers: corsHeaders }
      );
    }

    // Check if the user provided an email in this message
    const emailMatch =
      typeof message === "string"
        ? message.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i)
        : null;

    if (emailMatch && emailMatch[0]) {
      const userEmail = emailMatch[0];

      try {
        // Store lead in database
        try {
          await db.insert(chatbotLead).values({
            chatbotId: chatbotData.id,
            email: userEmail,
            message: String(message),
          });
        } catch (leadErr) {
          console.error("Error saving chatbot lead:", leadErr);
        }

        // Setup Nodemailer transporter (Gmail SMTP by default)
        const transporter = nodemailer.createTransport({
          host: "smtp.gmail.com",
          port: 465,
          secure: true,
          auth: {
            user: process.env.EMAIL_SERVER_USER,
            pass: process.env.EMAIL_SERVER_PASSWORD,
          },
        });

        const fromAddress = process.env.EMAIL_FROM || process.env.EMAIL_SERVER_USER || "no-reply@example.com";
        const adminAddress = chatbotData.adminEmail || process.env.EMAIL_TO;

        // Send acknowledgement to the user
        await transporter.sendMail({
          from: fromAddress,
          to: userEmail,
          subject: `We received your request regarding ${chatbotData.productName || "our product"}`,
          html: `
            <div style="font-family: Arial, sans-serif;">
              <p>Hi there,</p>
              <p>Thanks for sharing your email. Our team will review your question and get back to you soon.</p>
              <p>— ${chatbotData.productName || "Support Team"}</p>
            </div>
          `,
        });

        // Notify admin
        if (adminAddress) {
          await transporter.sendMail({
            from: fromAddress,
            to: adminAddress,
            subject: `New customer help request for ${chatbotData.productName || "your chatbot"}`,
            html: `
              <div style="font-family: Arial, sans-serif;">
                <p>A user has requested help and provided an email.</p>
                <p><strong>User Email:</strong> ${userEmail}</p>
                <p><strong>Latest Message:</strong> ${String(message)}</p>
                <p><strong>Chatbot:</strong> ${chatbotData.name} (${chatbotData.id})</p>
              </div>
            `,
          });
        }
      } catch (mailError) {
        console.error("Error sending emails:", mailError);
        // Don't fail the request if email sending fails
      }

      // Generate a session ID for tracking
      const sessionId = uuidv4();

      // Track usage for the chatbot owner
      try {
        const { trackUsage } = await import("@/lib/middleware/usage");
        await trackUsage(chatbotData.userId, "message", 1, params.id);
      } catch (usageError) {
        console.error("Error tracking usage:", usageError);
      }

      return NextResponse.json(
        {
          response:
            "Thanks! We received your email and our team will follow up shortly. You can continue chatting here in the meantime.",
          sessionId,
        },
        { headers: corsHeaders }
      );
    }

    // Generate AI response for non-email messages
    const aiResponse = await generateAIResponse(message, chatbotData as any);

    // Generate a session ID for tracking
    const sessionId = uuidv4();

    // Track usage for the chatbot owner
    try {
      const { trackUsage } = await import("@/lib/middleware/usage");
      await trackUsage(chatbotData.userId, "message", 1, params.id);
    } catch (usageError) {
      console.error("Error tracking usage:", usageError);
      // Don't fail the request if usage tracking fails
    }

    return NextResponse.json(
      {
        response: aiResponse,
        sessionId,
      },
      { headers: corsHeaders }
    );
  } catch (error) {
    console.error("Error processing chatbot chat message:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500, headers: corsHeaders }
    );
  }
}
