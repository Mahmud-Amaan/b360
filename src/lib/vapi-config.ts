import { createBookingTool } from "./vapi-tools";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface AssistantConfigOptions {
    /** Display name of the business / assistant */
    name: string;
    /** Opening message the assistant says when a call connects */
    welcomeMessage?: string | null;
    /** Free-text description of the business, services, hours, pricing, etc. */
    businessContext?: string | null;
    /** High-level category, e.g. "Dental Clinic", "Law Firm" */
    businessType?: string | null;
    /** Human-readable availability windows, e.g. "Mon-Fri 9 AM – 6 PM EST" */
    availabilityContext?: string | null;
    /** "male" → Elliot  |  anything else → Lily */
    voice?: string | null;
    /** Base URL of your server, e.g. "https://myapp.com" (no trailing slash) */
    baseUrl: string;
    /** Unique identifier for this agent in your system */
    agentId: string;
    /** Optional: BCP-47 language tag for transcription, defaults to "en-US" */
    language?: string | null;
    /** Optional: override the LLM model string */
    model?: string | null;
    /** Optional: LLM temperature 0-1, defaults to 0.5 */
    temperature?: number | null;
    /** Optional: max call duration in seconds, defaults to 600 */
    maxDurationSeconds?: number | null;
    /** Optional: silence timeout in seconds, defaults to 60 */
    silenceTimeoutSeconds?: number | null;
}

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

const DEFAULTS = {
    WELCOME_MESSAGE: "Hello! How can I help you today?",
    END_CALL_MESSAGE: "Thank you for calling! Have a wonderful day. Goodbye!",
    BACKGROUND_SOUND: "office",
    LANGUAGE: "en-US",
    MODEL: "llama-3.3-70b-versatile",
    MODEL_PROVIDER: "groq",
    TRANSCRIBER_MODEL: "nova-2",
    TRANSCRIBER_PROVIDER: "deepgram",
    VOICE_PROVIDER: "vapi",
    VOICE_MALE: "Elliot",
    VOICE_FEMALE: "Lily",
    TEMPERATURE: 0.5,
    MAX_DURATION_SECONDS: 600,
    SILENCE_TIMEOUT_SECONDS: 60,
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

/** Strips a trailing slash from a URL so concatenation is always consistent. */
function normalizeBaseUrl(url: string): string {
    return url.replace(/\/+$/, "");
}

/** Returns a locale-aware date string suitable for the system prompt. */
function getFormattedDateTime(): { date: string; time: string } {
    const now = new Date();
    return {
        date: now.toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
        }),
        time: now.toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
        }),
    };
}

/** Resolves the Vapi voice ID from the user-supplied voice preference. */
function resolveVoiceId(voice?: string | null): string {
    return voice?.toLowerCase() === "male"
        ? DEFAULTS.VOICE_MALE
        : DEFAULTS.VOICE_FEMALE;
}

/** Clamps a number between min and max (inclusive). */
function clamp(value: number, min: number, max: number): number {
    return Math.min(Math.max(value, min), max);
}

// ─────────────────────────────────────────────────────────────────────────────
// System-prompt builder
// ─────────────────────────────────────────────────────────────────────────────

function generateSystemPrompt(options: AssistantConfigOptions): string {
    const { date, time } = getFormattedDateTime();

    const businessContext =
        options.businessContext?.trim() ||
        "No specific business details provided. Please treat this as a general answering service and offer to take messages.";

    const businessType = options.businessType?.trim() || "General Inquiry";

    const availabilityContext =
        options.availabilityContext?.trim() || "Standard business hours.";

    return `You are a professional and friendly AI Voice Assistant for ${options.name}. Your primary goal is to assist callers efficiently while strictly adhering to the provided business information.

## CRITICAL KNOWLEDGE ENFORCEMENT
1. **ABSOLUTE SOURCE OF TRUTH**: Using external knowledge or making "common sense" assumptions about the business is STRICTLY FORBIDDEN. You know NOTHING about the business beyond what is explicitly written in the "About the Business" section below.
2. **NO HALLUCINATIONS**: If a specific service, price, person, location, or policy is not mentioned in the "About the Business" section, it does NOT exist. Do not invent it.
3. **HANDLING UNKNOWN INFORMATION**: If a caller asks for information not present in the context below, respond with: "I don't have that specific information right now, but I can note down your question and have a team member contact you." Do NOT answer based on assumptions about typical businesses of this type.

## About the Business
${businessContext}

## Business Type
${businessType}

## Availability
${availabilityContext}

## Current Date and Time
Today is ${date}.
The current local time is ${time}.
Use this ONLY to interpret relative references like "tomorrow" or "next week". Do NOT assume the caller wants to book immediately.

## Booking Process (FOLLOW THIS EXACT ORDER)
You MUST follow these steps sequentially — do not skip or reorder them:

**Step 1 — Date & Time**
Ask: "When would you like to come in?" or "What date and time works best for you?"

**Step 2 — Service / Reason** (only if not already clear)
Ask: "What is this appointment for?"

**Step 3 — Full Name**
Ask: "May I have your full name?"

**Step 4 — Email Address**
Ask: "What is the best email address to send the confirmation to?"
- If the address sounds ambiguous, ask them to spell it out.
- When spelling is requested, guide them: spell each character individually for the local part, then say the domain normally.
  Example: mahmud.hasan.amaan848@gmail.com → "M – A – H – M – U – D – dot – H – A – S – A – N – dot – A – M – A – A – N – 8 – 4 – 8 – at gmail dot com"

**Step 5 — Verbal Confirmation (REQUIRED)**
Read back ALL details exactly once:
"Let me confirm — I have a booking for [Full Name] at [Email] on [Date] at [Time] for [Service]. Is that correct?"
- Wait for a clear "Yes" (or equivalent) before proceeding.
- If they say "No", ask which part needs correction, then fix it and re-confirm.
- Do not repeat the confirmation more than once if they already said yes.

**Step 6 — Execute Booking**
ONLY after receiving a clear "Yes" in Step 5, call the \`book_appointment\` tool with all confirmed details.

**Step 7 — Handle Errors**
- If the tool returns an error stating the email is invalid, apologize briefly and ask the caller to spell out the email address again from the beginning.
- If the tool returns any other error, inform the caller politely and offer to try again or have a team member follow up.

## After Booking
Once the booking is confirmed, always ask: "Is there anything else I can help you with today?"
Only end the call after the caller confirms they have no further questions.

## Ending Calls
- Never end the call unilaterally unless the caller explicitly signals they are done (e.g., "bye", "goodbye", "that's all", "I'm done", "no, thanks").
- Always close politely: "Thank you for calling! Have a great day. Goodbye."

## Communication Guidelines
- Speak naturally and conversationally — this is a phone call, not a form.
- Be warm, professional, and patient.
- Keep individual responses concise; avoid long monologues.
- Confirm important details by repeating them back, but never repeat yourself unnecessarily.
- Never read out internal step numbers or section headings to the caller.`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Main config builder
// ─────────────────────────────────────────────────────────────────────────────

export function generateVapiAssistantConfig(
    options: AssistantConfigOptions,
) {
    if (!options.name?.trim()) {
        throw new Error("AssistantConfigOptions.name is required.");
    }
    if (!options.baseUrl?.trim()) {
        throw new Error("AssistantConfigOptions.baseUrl is required.");
    }
    if (!options.agentId?.trim()) {
        throw new Error("AssistantConfigOptions.agentId is required.");
    }

    const baseUrl = normalizeBaseUrl(options.baseUrl);
    const bookingTool = createBookingTool(baseUrl, options.agentId);

    const temperature = options.temperature != null
        ? clamp(options.temperature, 0, 1)
        : DEFAULTS.TEMPERATURE;

    const maxDurationSeconds = options.maxDurationSeconds != null
        ? Math.max(1, options.maxDurationSeconds)
        : DEFAULTS.MAX_DURATION_SECONDS;

    const silenceTimeoutSeconds = options.silenceTimeoutSeconds != null
        ? Math.max(1, options.silenceTimeoutSeconds)
        : DEFAULTS.SILENCE_TIMEOUT_SECONDS;

    /**
     * PASSING CREDENTIALS INLINE
     * Allows using Groq/Deepgram without the Vapi dashboard keys.
     */
    const credentials: any[] = [];
    if (process.env.GROQ_API_KEY) {
        credentials.push({ provider: "groq", apiKey: process.env.GROQ_API_KEY });
    }
    if (process.env.DEEPGRAM_API_KEY) {
        credentials.push({ provider: "deepgram", apiKey: process.env.DEEPGRAM_API_KEY });
    }

    return {
        firstMessage: options.welcomeMessage?.trim() || DEFAULTS.WELCOME_MESSAGE,

        model: {
            provider: DEFAULTS.MODEL_PROVIDER,
            model: options.model?.trim() || DEFAULTS.MODEL,
            temperature,
            messages: [
                {
                    role: "system",
                    content: generateSystemPrompt(options),
                },
            ],
            // FIXED: Tools belong inside the model object
            tools: [bookingTool],
        },

        voice: {
            provider: DEFAULTS.VOICE_PROVIDER,
            voiceId: resolveVoiceId(options.voice),
        },

        transcriber: {
            provider: DEFAULTS.TRANSCRIBER_PROVIDER,
            model: DEFAULTS.TRANSCRIBER_MODEL,
            language: options.language?.trim() || DEFAULTS.LANGUAGE,
        },

        credentials, // Inline credentials restored
        silenceTimeoutSeconds,
        maxDurationSeconds,
        backgroundSound: DEFAULTS.BACKGROUND_SOUND,
        endCallFunctionEnabled: true,
        endCallMessage: DEFAULTS.END_CALL_MESSAGE,

        serverUrl: `${baseUrl}/api/vapi/webhook`,

        metadata: {
            agentId: options.agentId,
        },
    };
}