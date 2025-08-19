# 🍜 Rolling Feast Voice AI Assistant

**Hindi-first Voice AI Assistant for Rolling Feast Indo-Chinese Restaurant**

This application provides a natural, conversational phone assistant that:
- **Greets callers in Hindi** with a warm female voice
- **Switches languages naturally** between Hindi, English, and Hinglish
- **Records conversation transcripts** for every call
- **Sends email summaries** after each call using Resend
- **Handles orders and table bookings** with human-like responses

Built with Node.js, Twilio Voice, OpenAI Realtime API, and Resend for email delivery.

## 🎯 Features

### Hindi-First Conversation
- **Initial Greeting**: "नमस्ते! Rolling Feast में आपका स्वागत है। क्या आप ऑर्डर देना चाहेंगे या टेबल बुक करना?"
- **Female Voice**: Warm, conversational tone using OpenAI's shimmer voice
- **Natural Flow**: Short, human-like responses (3-8 seconds each)

### Smart Language Switching
- **Hindi Default**: Always starts in Hindi
- **English Support**: Switches to English if caller uses English
- **Hinglish Handling**: Natural code-mixing support
- **Context Aware**: Maintains language preference throughout call

### Call Management
- **Real-time Transcription**: Records all caller + assistant interactions
- **Smart Summarization**: 2-4 sentence summary in conversation language
- **Email Delivery**: Automatic summary via Resend after call ends
- **Error Handling**: Hindi fallback messages for technical issues

## 📋 Prerequisites

### Required Accounts & API Keys
- **OpenAI API Key** - [Get here](https://platform.openai.com/) (Realtime API access required)
- **Twilio Account** - [Sign up here](https://www.twilio.com/try-twilio)
- **Twilio Phone Number** - With Voice capabilities
- **Resend API Key** - [Get here](https://resend.com/) for email summaries
- **Node.js 18+** - [Download here](https://nodejs.org/)

## 🚀 Quick Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Configuration
Create your environment file:
```bash
touch .env
```

Add your API keys to `.env`:
```env
OPENAI_API_KEY=sk-proj-your-openai-api-key-here
TWILIO_ACCOUNT_SID=ACyour-twilio-account-sid-here
TWILIO_AUTH_TOKEN=your-twilio-auth-token-here
TWILIO_VOICE_NUMBER=+17867861482
RESEND_API_KEY=re_your-resend-api-key-here
ORDERS_EMAIL_TO=orders@rollingfeast.com
PORT=5050
```

### 3. Start the Server
```bash
npm start
```

### 4. Expose Local Server (Development)
Open a new terminal and run:
```bash
ngrok http 5050
```
Copy the forwarding URL (e.g., `https://abc123.ngrok.app`)

### 5. Configure Twilio Webhook
1. Go to [Twilio Console](https://console.twilio.com/)
2. Navigate to **Phone Numbers** > **Manage** > **Active Numbers**
3. Click on your phone number
4. Set **A call comes in** to **Webhook**
5. Enter: `https://your-ngrok-url.ngrok.app/incoming-call`
6. Click **Save configuration**

## 🧪 Testing the Assistant

### Acceptance Test Checklist
1. **Call Setup**: Dial your Twilio number
2. **Hindi Greeting**: Hear female Hindi greeting within ~3 seconds
3. **Hindi Conversation**: Talk in Hindi → AI responds naturally in Hindi
4. **Language Switch**: Switch to English → AI continues smoothly in English
5. **Hinglish Support**: Mix languages → AI handles code-mixing naturally
6. **Call Summary**: Hang up → Receive email summary in conversation language

### Expected Behavior
- **Response Time**: < 3 seconds for initial greeting
- **Voice Quality**: Clear female voice, warm tone
- **Language Detection**: Automatic Hindi/English/Hinglish switching
- **Email Delivery**: Summary arrives within 30 seconds

## 📁 Project Structure

```
rolling-feast-voice/
├── index.js              # Main Express server & Twilio webhook handler
├── lib/
│   ├── ai.js            # OpenAI Realtime session (Hindi-first config)
│   ├── email.js         # Resend email integration
│   └── summarize.js     # Transcript summarization & language detection
├── .env                 # Environment variables (create this file)
├── package.json         # Dependencies & scripts
└── README.md           # This file
```

## 🔧 Technical Details

### System Prompt
The AI uses a bilingual system prompt that:
- Starts conversations in Hindi
- Switches to English/Hinglish naturally
- Maintains warm, conversational tone
- Keeps responses short and human-like

### Error Handling
If any error occurs, the system returns:
```xml
<Response>
  <Say language="hi-IN">क्षमा कीजिए, अभी तकनीकी समस्या आ रही है।</Say>
</Response>
```

### Dependencies
- `express` - Web server framework
- `openai` - Realtime API client
- `twilio` - TwiML responses
- `resend` - Email delivery service
- `ws` - WebSocket connections

## 🚨 Troubleshooting

- **ngrok URL changes**: Update Twilio webhook configuration
- **OpenAI API limits**: Check usage and billing
- **Hindi font issues**: Ensure proper UTF-8 encoding
- **Email not received**: Verify Resend API key and recipient email
- **No greeting**: Check OpenAI Realtime API access

## 📞 Production Deployment

For production use:
1. Deploy to a cloud service (Heroku, Railway, etc.)
2. Use environment variables for all secrets
3. Set up proper logging and monitoring
4. Configure rate limiting
5. Update Twilio webhook to production URL

---

**Rolling Feast Voice Assistant** - Bringing the warmth of Hindi hospitality to every call! 🍜📞
