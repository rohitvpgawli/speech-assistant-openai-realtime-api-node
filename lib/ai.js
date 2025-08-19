// Rolling Feast AI Configuration
// Hindi-first voice assistant with natural language switching

export const ROLLING_FEAST_SYSTEM_MESSAGE = `आप "Rolling Feast" रेस्टोरेंट की महिला-आवाज़ वाली फोन असिस्टेंट हैं।
बातचीत की शुरुआत हमेशा हिंदी में करें।
यदि ग्राहक अंग्रेज़ी या हिंग्लिश में बात करे, तो उसी भाषा में स्वाभाविक रूप से जवाब दें।
हमेशा गर्मजोशी और स्वाभाविक प्रवाह रखें। जवाब छोटे और मानवीय लगें।
ग्राहक की ज़रूरत समझने के लिए छोटे-छोटे सवाल पूछें।

You are a female voice phone assistant for "Rolling Feast" restaurant.
Always start conversations in Hindi.
If the customer speaks in English or Hinglish, respond naturally in the same language.
Always maintain warmth and natural flow. Keep responses short and human-like.
Ask small questions to understand the customer's needs.`;

export const HINDI_GREETING = `नमस्ते! Rolling Feast में आपका स्वागत है। क्या आप ऑर्डर देना चाहेंगे या टेबल बुक करना?`;

export const AI_CONFIG = {
    voice: 'shimmer', // Female voice
    temperature: 0.7,
    turn_detection: { type: 'server_vad' },
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
                    text: `Please greet the caller with: "${HINDI_GREETING}"`
                }
            ]
        }
    };
}
