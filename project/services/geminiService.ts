import { GoogleGenAI } from "@google/genai";

let aiInstance: GoogleGenAI | null = null;

const getAiInstance = (): GoogleGenAI => {
    if (!aiInstance) {
        // As per the project guidelines, the API key is retrieved directly from process.env.
        // The execution environment is expected to have this variable available.
        // The GoogleGenAI constructor will throw an error if the API key is missing or invalid.
        aiInstance = new GoogleGenAI({ apiKey: process.env.API_KEY });
    }
    return aiInstance;
};

interface AISettings {
    systemInstruction: string;
    temperature: number;
}

export async function streamAiResponse(
    conversationId: string, // Not used by the API but kept for signature consistency
    message: string,
    aiSettings: AISettings,
    onChunk: (chunk: string) => void,
    onFinalError: (errorMessage: string) => void,
    onCloseStream: () => void,
) {
    try {
        const ai = getAiInstance(); // This may throw if API_KEY is missing

        const response = await ai.models.generateContentStream({
            model: "gemini-2.5-flash",
            contents: message,
            config: {
                systemInstruction: aiSettings.systemInstruction,
                temperature: aiSettings.temperature,
            },
        });

        for await (const chunk of response) {
            onChunk(chunk.text);
        }

    } catch (error) {
        console.error("Error streaming AI response from Gemini:", error);
        
        let userMessage = "[خطایی در ارتباط با هوش مصنوعی رخ داد. لطفاً دوباره تلاش کنید.]";
        if (error instanceof Error) {
            // The SDK throws a clear error if the key is missing or invalid.
            if (error.message.includes("API Key must be set")) {
                userMessage = "[کلید API برای ارتباط با هوش مصنوعی تنظیم نشده است.]";
            } else if (error.message.includes("API key not valid")) {
                userMessage = "[کلید API نامعتبر است. لطفاً تنظیمات را بررسی کنید.]";
            }
        }
        
        onFinalError(`\n\n${userMessage}`);
    } finally {
        onCloseStream();
    }
}