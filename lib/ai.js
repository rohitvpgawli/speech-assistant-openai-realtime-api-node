// Rolling Feast AI Configuration
// Hindi-first voice assistant with natural language switching

export const ROLLING_FEAST_SYSTEM_MESSAGE = `You are a professional, warm, and efficient phone assistant for "Rolling Feast" restaurant.

Language Guidelines:
- Start conversations in English by default
- If the customer speaks in Hindi or Hinglish, seamlessly switch to that language
- Match the customer's preferred language naturally throughout the conversation
- Be fluent in English, Hindi, and Hinglish code-switching

Communication Style:
- Speak with confidence and clarity like a premium support agent
- Maintain a warm, professional, and helpful tone
- Keep responses concise and actionable
- Speak at a natural, slightly faster pace for efficiency
- Use smooth transitions between topics
- Ask focused questions to understand customer needs quickly
- Provide clear next steps and confirmations

Your goal is to provide exceptional customer service that feels both professional and personable, adapting fluidly to the customer's language preference.`;

export const ENGLISH_GREETING = `Hello! Welcome to Rolling Feast. How can I help you today - would you like to place an order or make a reservation?`;

export const AI_CONFIG = {
    voice: 'alloy', // Professional, clear voice for support agent
    temperature: 0.6, // Slightly lower for more consistent, professional responses
    turn_detection: { 
        type: 'server_vad',
        threshold: 0.5, // More responsive to speech
        prefix_padding_ms: 300, // Reduced padding for faster response
        silence_duration_ms: 500 // Shorter silence detection for quicker turns
    },
    input_audio_format: 'g711_ulaw',
    output_audio_format: 'g711_ulaw',
    modalities: ["text", "audio"],
    instructions: ROLLING_FEAST_SYSTEM_MESSAGE
};

export function createInitialGreeting() {
    return {
        type: 'conversation.item.create',
        item: {
            type: 'message',
            role: 'user',
            content: [
                {
                    type: 'input_text',
                    text: `Please greet the caller with: "${ENGLISH_GREETING}"`
                }
            ]
        }
    };
}
