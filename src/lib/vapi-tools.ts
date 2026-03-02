import { getBaseUrl } from "@/lib/utils";

export const createBookingTool = (baseUrl: string, agentId: string) => ({
    type: "function",
    async: false, // Synchronous execution to maintain voice context
    function: {
        name: "book_appointment",
        description: "Book an appointment or schedule a meeting for the customer. Use this when the customer wants to make a reservation or schedule a service.",
        parameters: {
            type: "object",
            properties: {
                customer_name: {
                    type: "string",
                    description: "The customer's full name"
                },
                customer_email: {
                    type: "string",
                    description: "The customer's email address for confirmation"
                },
                booking_date: {
                    type: "string",
                    description: "The date and time for the appointment (e.g., 'tomorrow at 2pm', 'next Monday at 10am', '2024-01-15 14:00')"
                },
                service_details: {
                    type: "string",
                    description: "Description of the service or reason for the appointment"
                }
            },
            required: ["customer_name", "booking_date", "customer_email"]
        }
    },
    server: {
        url: `${baseUrl}/api/vapi/tool-calls`,
        timeoutSeconds: 30,
        secret: agentId // Used for agentId extraction
    }
});

export const endCallTool = {
    type: "endCall",
    // Messages are handled by endCallMessage in assistant config
};
