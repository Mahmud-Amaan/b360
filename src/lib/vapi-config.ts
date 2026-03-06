import { createBookingTool } from "./vapi-tools";

export interface AssistantConfigOptions {
    name: string;
    welcomeMessage?: string | null;
    businessContext?: string | null;
    businessType?: string | null;
    availabilityContext?: string | null;
    voice?: string | null;
    baseUrl: string;
    agentId: string;
}

export function generateVapiAssistantConfig(options: AssistantConfigOptions) {
    const {
        name,
        welcomeMessage,
        voice,
        baseUrl,
        agentId
    } = options;

    const bookingTool = createBookingTool(baseUrl, agentId);

    // Latest Vapi V2 Schema
    const assistant: Record<string, any> = {
        name: name,
        firstMessage: welcomeMessage || "Hello! How can I help you today?",
        model: {
            provider: "groq",
            model: "llama3-70b-8192", // More standard Groq model ID for Vapi
            temperature: 0.7,
            messages: [
                {
                    role: "system",
                    content: generateSystemPrompt(options)
                }
            ],
        },
        voice: {
            provider: "vapi",
            voiceId: (voice?.toLowerCase() === "male") ? "Elliot" : "Lily",
        },
        transcriber: {
            provider: "deepgram",
            model: "nova-2",
            language: "en-US",
        },
        // Correct V2 structure for the server URL
        server: {
            url: `${baseUrl}/api/vapi/webhook`,
            timeoutSeconds: 20
        },
        // Top-level tools array
        tools: [bookingTool],
        // Safety settings
        endCallFunctionEnabled: true,
        silenceTimeoutSeconds: 30,
        maxDurationSeconds: 600,
        backgroundSound: "office"
    };

    return assistant;
}

function generateSystemPrompt(options: AssistantConfigOptions) {
    return `You are a professional AI Voice Assistant for ${options.name}.
    
## Context
About the Business: ${options.businessContext || "General Inquiry"}
Business Type: ${options.businessType || "Not specified"}
Availability: ${options.availabilityContext || "Standard hours"}

## Instructions
- Be concise. This is a phone call.
- Follow the sequence: 1. Confirm time -> 2. Name -> 3. Email -> 4. Summary -> 5. Book.
- Only call 'book_appointment' AFTER the user explicitly confirms the recap.
- If you don't know something, offer to take a message.`;
}
