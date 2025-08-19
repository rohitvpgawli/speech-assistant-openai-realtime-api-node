# Rolling Feast Voice AI Assistant

## Project Overview
Building a Hindi-first Voice AI Assistant for "Rolling Feast" (Indo-Chinese restaurant) that uses:
- **Twilio Voice** for phone call handling and media streams
- **OpenAI Realtime API** for real-time Hindi/English conversation
- **Node.js** backend with WebSocket connections
- **Resend** for email summaries
- **Natural Hindi-English code-mixing support**

## Architecture
```
Phone Call → Twilio → WebSocket → Node.js Server → OpenAI Realtime API
                                      ↓
                              Web Interface (Testing)
```

## Rolling Feast Requirements

### Environment Variables (.env)
```
OPENAI_API_KEY=sk-proj-xxx
TWILIO_ACCOUNT_SID=ACxxx
TWILIO_AUTH_TOKEN=xxx
TWILIO_VOICE_NUMBER=+17867861482
RESEND_API_KEY=re_xxx
ORDERS_EMAIL_TO=orders@rollingfeast.com
PORT=5050
```

### API Keys & Accounts Needed
- **OpenAI API Key** - Realtime API access required
- **Twilio Account** - Phone number: +17867861482
- **Resend API Key** - For email summaries
- **ngrok** - For local development webhook tunneling

## Rolling Feast Features

### Core Functionality
- **Hindi-first greeting**: "नमस्ते! Rolling Feast में आपका स्वागत है। क्या आप ऑर्डर देना चाहेंगे या टेबल बुक करना?"
- **Natural language switching**: Hindi ↔ English ↔ Hinglish
- **Female voice**: Warm, conversational tone
- **Transcript recording**: All caller + assistant interactions
- **Smart summarization**: 2-4 sentences in conversation language
- **Email delivery**: Summary sent via Resend

### File Structure
```
rolling-feast-voice/
├── index.js              # Express app, /incoming-call handler
├── lib/
│   ├── ai.js            # Realtime session (Hindi-first)
│   ├── email.js         # Resend email helper
│   └── summarize.js     # Transcript summarization
├── .env                # Environment variables (you create this)
└── README.md
```

## Technical Implementation

### System Prompt (Hindi-first)
```
आप "Rolling Feast" रेस्टोरेंट की महिला-आवाज़ वाली फोन असिस्टेंट हैं।
बातचीत की शुरुआत हमेशा हिंदी में करें।
यदि ग्राहक अंग्रेज़ी या हिंग्लिश में बात करे, तो उसी भाषा में स्वाभाविक रूप से जवाब दें।
हमेशा गर्मजोशी और स्वाभाविक प्रवाह रखें। जवाब छोटे और मानवीय लगें।
ग्राहक की ज़रूरत समझने के लिए छोटे-छोटे सवाल पूछें।
```

### Server Configuration
- **Port**: 5050
- **Voice Model**: GPT-4o Realtime Preview
- **Voice**: Female (shimmer/nova)
- **Audio Format**: G.711 μ-law
- **Languages**: Hindi (primary), English, Hinglish

### API Endpoints
- `POST /incoming-call` - Twilio webhook entry point
- `WS /media-stream` - WebSocket for audio streaming

### Dependencies
- `express` - Web server
- `openai` - Realtime API client
- `twilio` - TwiML responses
- `resend` - Email delivery

## Acceptance Testing

### Phone Call Flow
1. **Setup**: `ngrok http 5050` → Configure Twilio webhook
2. **Call**: Dial +17867861482
3. **Greeting**: Hear Hindi female greeting within ~3 seconds
4. **Hindi conversation**: Talk in Hindi → AI responds naturally in Hindi
5. **Language switch**: Switch to English → AI continues smoothly in English
6. **Hinglish**: Mix languages → AI handles code-mixing naturally
7. **Call end**: Hang up → Receive email summary in conversation language

### Expected Behavior
- **Response time**: < 3 seconds for initial greeting
- **Language detection**: Automatic Hindi/English/Hinglish switching
- **Voice quality**: Clear female voice, warm tone
- **Summary**: 2-4 sentences, matches conversation language
- **Email delivery**: Summary arrives within 30 seconds

## Error Handling

### Fallback Response
If any error occurs, return TwiML:
```xml
<Response>
  <Say language="hi-IN">क्षमा कीजिए, अभी तकनीकी समस्या आ रही है।</Say>
</Response>
```

### Common Issues
- **ngrok URL changes**: Update Twilio webhook
- **OpenAI API limits**: Monitor usage and billing
- **Language detection**: Ensure proper Hindi font support
- **Email delivery**: Verify Resend API key and recipient

## Setup Instructions

1. **Install dependencies**: `npm install`
2. **Configure environment**: Create `.env` file with your API keys
3. **Start server**: `npm start`
4. **Expose webhook**: `ngrok http 5050`
5. **Configure Twilio**: Set webhook URL in Twilio Console
6. **Test**: Call +17867861482

## Deliverables
- ✅ Complete source files
- ✅ Minimal dependencies (express, openai, twilio, resend)
- ✅ README with setup instructions
- ✅ Hindi-first conversation flow
- ✅ Email summary integration
