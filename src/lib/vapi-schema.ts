export const assistantSchema = {
    name: "Agent Name",
    firstMessage: "Greeting",
    voice: {
        provider: "11labs",
        voiceId: "rachel",
    },
    model: {
        provider: "openai",
        model: "gpt-4",
        messages: [
            {
                role: "system",
                content: "System prompt here",
            }
        ],
    },
    recordingEnabled: true,
    interruptible: true,
};
