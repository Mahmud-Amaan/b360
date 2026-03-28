import { Groq } from "groq-sdk";

if (!process.env.GROQ_API_KEY) {
  throw new Error("GROQ_API_KEY is not set");
}

export const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export const AI_MODEL = "llama3-70b-8192";

// Define the chatbot type based on your database schema
// Note: Nullable fields in the database return null, not undefined
type ChatbotData = {
  id: string;
  userId: string;
  name: string;
  position: string;
  primaryColor: string;
  productName: string;
  description: string;
  chatbotTitle: string;
  welcomeMessage: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export async function generateAIResponse(
  message: string,
  chatbotData: ChatbotData
) {
  try {
    // Build context from chatbot data
    let context = "";

    if (chatbotData.productName) {
      context += `Product: ${chatbotData.productName}\n`;
    }

    if (chatbotData.description) {
      context += `Product Description: ${chatbotData.description}\n`;
    }

    const systemPrompt = `You are a helpful AI assistant for ${chatbotData.productName || "this product"
      }'s customer support chatbot.
You should provide helpful, accurate, and friendly responses to customer inquiries.

${context
        ? `Here is important information about the product/service:\n${context}`
        : ""
      }

Guidelines:
- Be helpful and professional
- If you don't know something specific about the product, be honest about it
- For complex issues, suggest contacting customer support
- Keep responses concise but informative
- Always maintain a friendly and supportive tone
- IMPORTANT: If you are unsure or cannot confidently answer the user's question based on the context, politely ask the user for their email so a human can follow up. Example: "I'm not fully sure about that. Could you share your email so our team can follow up with a precise answer?"`;

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: message,
        },
      ],
      model: AI_MODEL,
      temperature: 0.7,
      max_tokens: 1024,
    });

    const response = completion.choices[0]?.message?.content;

    if (!response) {
      console.error("No response content from AI model");
      return "I apologize, but I'm having trouble generating a response right now. Please try again or contact our support team for assistance.";
    }

    return response;
  } catch (error) {
    console.error("Error generating AI response:", error);

    // Return a helpful fallback message
    return `Thank you for your message! I'm currently experiencing some technical difficulties, but I'd be happy to help you. For immediate assistance, please contact our support team.`;
  }
}
