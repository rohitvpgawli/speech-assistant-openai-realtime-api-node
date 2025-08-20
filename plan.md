# Rolling Feast Voice AI Assistant - Project Plan

## Project Overview
Building an **English-first, multilingual Voice AI Assistant** for "Rolling Feast" restaurant that provides a fast, professional, and seamless customer experience. It uses:
- **Twilio Voice** for phone call handling and media streams.
- **OpenAI Realtime API** for low-latency, real-time conversation.
- **Node.js & Fastify** for a high-performance backend.
- **Resend** for automated email summaries.
- **Seamless English-Hindi-Hinglish** code-mixing support.

## Architecture
```
Phone Call → Twilio → WebSocket → Fastify Server → OpenAI Realtime API
```

## Core Features & Requirements

### High-Performance Conversation
- **English-first Greeting**: "Hello! Welcome to Rolling Feast. How can I help you today - would you like to place an order or make a reservation?"
- **Natural Language Switching**: English ↔ Hindi ↔ Hinglish.
- **Professional Voice**: Clear, warm, and efficient tone (`alloy` voice model).
- **Low Latency**: Optimized for fast, fluid conversational turns.

### Backend & Call Management
- **Transcript Recording**: Captures all caller and assistant interactions.
- **Smart Summarization**: Generates a concise summary in the conversation's language.
- **Email Delivery**: Automatically sends the summary via Resend after each call.

### File Structure
```
rolling-feast-voice/
├── index.js              # Main Fastify server & WebSocket logic
├── lib/
│   ├── ai.js            # OpenAI Realtime session (English-first, multilingual config)
│   ├── email.js         # Resend email integration
│   └── summarize.js     # Transcript summarization
├── public/
│   ├── index.html       # Basic HTML page
│   └── tech.md          # Technical documentation
├── .env                 # Environment variables
└── README.md
```

## Technical Implementation

### System Prompt (English-first, Multilingual)
```
You are a professional, warm, and efficient phone assistant for "Rolling Feast" restaurant.

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
```

### Server Configuration
- **Framework**: Fastify
- **Port**: 5050
- **AI Model**: `gpt-4o-realtime-preview-2024-10-01`
- **Voice**: `alloy` (professional, clear)
- **Audio Format**: G.711 μ-law
- **Languages**: English (primary), Hindi, Hinglish

### API Endpoints
- `POST /incoming-call` - Twilio webhook entry point.
- `WS /media-stream` - WebSocket for bi-directional audio streaming.

## Acceptance Testing

### Phone Call Flow
1. **Setup**: `ngrok http 5050` → Configure Twilio webhook.
2. **Call**: Dial the Twilio number.
3. **Greeting**: Hear the English greeting in a clear, professional voice (<3 seconds).
4. **English Conversation**: Converse in English; AI responds quickly and naturally.
5. **Language Switch**: Switch to Hindi; AI continues smoothly in Hindi.
6. **Hinglish Support**: Mix languages; AI handles code-mixing without issues.
7. **Call End**: Hang up; receive an email summary in the correct language.

### Expected Behavior
- **Response Time**: Fast, with minimal conversational lag.
- **Voice Quality**: Clear, professional `alloy` voice.
- **Language Detection**: Flawless switching between English, Hindi, and Hinglish.
- **Email Delivery**: Summary arrives within 30 seconds of call completion.

## Final Deliverables
- ✅ **V1 (Hindi-first):** Completed.
- ✅ **V2 (English-first, High-Performance):** Completed.
- ✅ Complete source files for the final version.
- ✅ Updated `README.md` with new features and setup instructions.
- ✅ New `public/tech.md` file with technical documentation.
- ✅ All features (multilingual support, email summaries) are fully functional.
