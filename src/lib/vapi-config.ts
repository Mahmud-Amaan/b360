import { createBookingTool, endCallTool } from "./vapi-tools";

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
        businessContext,
        businessType,
        availabilityContext,
        voice,
        baseUrl,
        agentId
    } = options;

    const selectedVoice = (voice?.toLowerCase() === "male") ? "Elliot" : "Lily";
    const bookingTool = createBookingTool(baseUrl, agentId);


    const assistant: Record<string, any> = {
        name: name,
        firstMessage: welcomeMessage || "Hello! How can I help you today?",
        transcriber: {
            provider: "deepgram",
            model: "nova-2",
            language: "en-US",
            smartFormat: true,
        },
        voice: {
            provider: "vapi",
            voiceId: selectedVoice,
        },
        backchannelingEnabled: false,
        model: {
            provider: "groq",
            model: "llama-3.3-70b-versatile",
            temperature: 0.5,
            tools: [bookingTool, endCallTool],
            messages: [
                {
                    role: "system",
                    content: generateSystemPrompt(options)
                }
            ],
        },
        analysis: {
            summaryPrompt: `You are an expert note-taker. Your goal is to summarize the call clearly and structuredly for the business owner.
            
            Please try to follow this format for your summary:
            
            [brief 1-2 sentences overview of the call]

            **Booking Made:** (Or "No Booking Made")

            **Name:** [User Name]
            **Email:** [User Email]
            **Service/Purpose:** [Reason for call/booking]
            **Date & Time:** [Appointment Date/Time]
            **Outcome:** [Brief detailed explanation of what happened, if booking was successful, and how the call ended.]
            `
        },
        serverUrl: `${baseUrl}/api/vapi/webhook`,
        interruptionsEnabled: true,
        numWordsToInterruptAssistant: 1,
        silenceTimeoutSeconds: 60,
        maxDurationSeconds: 600,
        backgroundSound: "office",
        endCallMessage: "Thank you for calling! Have a wonderful day. Goodbye!",
        metadata: {
            agentId: agentId,
        }
    };

    // Add provider credentials from env variables
    const credentials: Array<{ provider: string; apiKey: string }> = [];
    if (process.env.GROQ_API_KEY) {
        credentials.push({ provider: "groq", apiKey: process.env.GROQ_API_KEY });
    }
    if (process.env.DEEPGRAM_API_KEY) {
        credentials.push({ provider: "deepgram", apiKey: process.env.DEEPGRAM_API_KEY });
    }

    if (credentials.length > 0) {
        assistant.credentials = credentials;
    }

    return assistant;
}

function generateSystemPrompt(options: AssistantConfigOptions) {
    return `You are a professional and friendly AI Voice Assistant for ${options.name}. Your primary goal is to assist callers efficiently while strictly adhering to the provided business information.

## CRITICAL KNOWLEDGE ENFORCEMENT
1. **ABSOLUTE SOURCE OF TRUTH**: usage of external knowledge or "common sense" assumptions about the business type or name is STRICTLY FORBIDDEN. You effectively know NOTHING about the business other than what is explicitly written in the "About the Business" section below.
2. **NO HALLUCINATIONS**: If the "About the Business" section does not mention a specific service, price, person, location, or policy, IT DOES NOT EXIST. Do not invent it.
3. **HANDLING UNKNOWN INFO**: If a user asks for information not present in the context below, you MUST say: "I don't have that specific information right now, but I can note down your question and have a team member contact you." Do NOT try to answer based on what typical businesses of this type do.

## About the Business
${options.businessContext || "No specific business details provided. Please treat this as a general answering service and offer to take messages."}

## Business Type
${options.businessType || "General Inquiry"}

## Availability
${options.availabilityContext || "Standard business hours."}

## Current Date and Time
Today is ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}. 
The current local time is ${new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}. 
Use this ONLY for understanding relative dates (e.g., "tomorrow"). DO NOT use this to assume the user wants to book "right now".

## Booking Process (STRICT FLOW)
You MUST follow these steps in order:
1. **Ask for Date and Time**: "When would you like to come in?" or "What date and time works best for you?"
2. **Confirm Service/Reason**: "What is this appointment for?" (Only if not already clear)
3. **Ask for Name**: "May I have your full name?"
4. **Ask for Email**: "What is the best email address to send the confirmation to?"
   - **Capture E-mail Carefully**: Ask them to spell it out if unclear.
   - **Example**: spell this mahmud.hasan.amaan848@gmail.com to this instead M A H M U D dot H A S A N dot A M A A N 8 4 8 (just spell @gmail.com normally)
5. **VERBAL CONFIRMATION (REQUIRED)**:
   - YOU MUST READ BACK THE DETAILS: "Let me double check that. I have a booking for [Name] at [Email] on [Date] at [Time] for [Service]. Is that correct?"
   - **WAIT** for the user to say "Yes" or similar.
   - If they say "No", ask which part needs correction.
    - But Remember Don't Repeat Yourself Too Much, Don't annoy the user.
6. **Execute Booking**: ONLY after a clear "Yes", call the 'book_appointment' tool.
7. **Important**: If the tool returns an error saying the email is invalid, you MUST ask the user to spell it again carefully.

## Ending Calls
- **Wait for the customer to finish.** Do not end the call unless they explicitly say they are done or say "goodbye".
- If the customer says "bye", "goodbye", "that's all", "I'm done", or similar, then use the end_call tool.
- After completing a booking, ask: "Is there anything else I can help you with today?"
- **ONLY** use the end_call tool after the customer confirms they have no more questions.
- Always be polite: "Thank you for calling! Have a great day. Goodbye."

## Communication Guidelines
- Speak naturally and conversationally
- Be warm, professional, and helpful
- Keep responses concise - this is a phone call
- Confirm important details by repeating them back`;
}
