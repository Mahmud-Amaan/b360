// lib/vapi.ts
// Vapi API service for managing phone numbers and assistants

interface VapiPhoneNumberConfig {
    number: string;           // E.164 format phone number
    name?: string;            // Display name for the number
    serverUrl: string;        // Webhook URL for assistant-request
    twilioAccountSid: string;
    twilioAuthToken: string;
}

interface VapiPhoneNumber {
    id: string;
    provider: string;
    number: string;
    name?: string;
    status: string;
    createdAt: string;
    updatedAt: string;
}

interface VapiError {
    message: string | string[];
    error: string;
    statusCode: number;
}

/**
 * Import a Twilio phone number to Vapi for inbound call handling
 * This is required for multi-tenant phone call routing
 */
export async function importPhoneNumberToVapi(
    config: VapiPhoneNumberConfig
): Promise<{ success: boolean; phoneNumberId?: string; error?: string }> {
    const apiKey = process.env.VAPI_PRIVATE_API_KEY;

    if (!apiKey) {
        return { success: false, error: "VAPI_PRIVATE_API_KEY not configured" };
    }

    try {
        // Use the correct Vapi endpoint for importing Twilio numbers
        const response = await fetch("https://api.vapi.ai/phone-number/import/twilio", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                twilioPhoneNumber: config.number,  // E.164 format
                twilioAccountSid: config.twilioAccountSid,
                twilioAuthToken: config.twilioAuthToken,
                name: config.name || `Tenant Number ${config.number}`,
                // Configure the server URL for assistant-request webhook
                serverUrl: config.serverUrl,
                serverUrlSecret: process.env.VAPI_WEBHOOK_SECRET || undefined,
            }),
        });

        if (!response.ok) {
            const errorData = await response.json() as VapiError;
            console.error("Vapi import phone number error:", errorData);

            // Handle specific errors
            if (Array.isArray(errorData.message)) {
                return { success: false, error: errorData.message.join(", ") };
            }
            return { success: false, error: errorData.message || errorData.error };
        }

        const data = await response.json() as VapiPhoneNumber;
        console.log(`Phone number ${config.number} imported to Vapi with ID: ${data.id}`);

        return { success: true, phoneNumberId: data.id };
    } catch (error) {
        console.error("Failed to import phone number to Vapi:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Unknown error"
        };
    }
}

/**
 * Update an existing Vapi phone number configuration
 */
export async function updateVapiPhoneNumber(
    phoneNumberId: string,
    updates: Partial<{
        name: string;
        serverUrl: string;
        assistantId: string | null;
    }>
): Promise<{ success: boolean; error?: string }> {
    const apiKey = process.env.VAPI_PRIVATE_API_KEY;

    if (!apiKey) {
        return { success: false, error: "VAPI_PRIVATE_API_KEY not configured" };
    }

    try {
        const body: Record<string, unknown> = {};
        if (updates.name) body.name = updates.name;
        if (updates.serverUrl) {
            body.server = { url: updates.serverUrl, timeoutSeconds: 20 };
        }
        if (updates.assistantId !== undefined) {
            body.assistantId = updates.assistantId;
        }

        const response = await fetch(`https://api.vapi.ai/phone-number/${phoneNumberId}`, {
            method: "PATCH",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(body),
        });

        if (!response.ok) {
            const errorData = await response.json() as VapiError;
            console.error("Vapi update phone number error:", errorData);
            return { success: false, error: errorData.message?.toString() || errorData.error };
        }

        return { success: true };
    } catch (error) {
        console.error("Failed to update Vapi phone number:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Unknown error"
        };
    }
}

/**
 * Delete a phone number from Vapi
 */
export async function deleteVapiPhoneNumber(
    phoneNumberId: string
): Promise<{ success: boolean; error?: string }> {
    const apiKey = process.env.VAPI_PRIVATE_API_KEY;

    if (!apiKey) {
        return { success: false, error: "VAPI_PRIVATE_API_KEY not configured" };
    }

    try {
        const response = await fetch(`https://api.vapi.ai/phone-number/${phoneNumberId}`, {
            method: "DELETE",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
            },
        });

        if (!response.ok) {
            const errorData = await response.json() as VapiError;
            console.error("Vapi delete phone number error:", errorData);
            return { success: false, error: errorData.message?.toString() || errorData.error };
        }

        return { success: true };
    } catch (error) {
        console.error("Failed to delete Vapi phone number:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Unknown error"
        };
    }
}

/**
 * List all phone numbers from Vapi
 */
export async function listVapiPhoneNumbers(): Promise<{
    success: boolean;
    phoneNumbers?: VapiPhoneNumber[];
    error?: string
}> {
    const apiKey = process.env.VAPI_PRIVATE_API_KEY;

    if (!apiKey) {
        return { success: false, error: "VAPI_PRIVATE_API_KEY not configured" };
    }

    try {
        const response = await fetch("https://api.vapi.ai/phone-number", {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
            },
        });

        if (!response.ok) {
            const errorData = await response.json() as VapiError;
            return { success: false, error: errorData.message?.toString() || errorData.error };
        }

        const data = await response.json() as VapiPhoneNumber[];
        return { success: true, phoneNumbers: data };
    } catch (error) {
        console.error("Failed to list Vapi phone numbers:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Unknown error"
        };
    }
}

/**
 * Find a Vapi phone number by its E.164 number
 */
export async function findVapiPhoneNumber(
    phoneNumber: string
): Promise<{ success: boolean; phoneNumberId?: string; error?: string }> {
    const result = await listVapiPhoneNumbers();

    if (!result.success || !result.phoneNumbers) {
        return { success: false, error: result.error };
    }

    const found = result.phoneNumbers.find(pn => pn.number === phoneNumber);

    if (found) {
        return { success: true, phoneNumberId: found.id };
    }

    return { success: false, error: "Phone number not found in Vapi" };
}
