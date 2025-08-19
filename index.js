import Fastify from 'fastify';
import WebSocket from 'ws';
import dotenv from 'dotenv';
import fastifyFormBody from '@fastify/formbody';
import fastifyWs from '@fastify/websocket';
import { AI_CONFIG, createInitialGreeting } from './lib/ai.js';
import { sendCallSummary } from './lib/email.js';
import { summarizeTranscript } from './lib/summarize.js';

// Load environment variables from .env file
dotenv.config();

// Retrieve environment variables
const { 
    OPENAI_API_KEY, 
    TWILIO_ACCOUNT_SID, 
    TWILIO_AUTH_TOKEN, 
    RESEND_API_KEY, 
    ORDERS_EMAIL_TO 
} = process.env;

if (!OPENAI_API_KEY) {
    console.error('Missing OpenAI API key. Please set it in the .env file.');
    process.exit(1);
}

if (!RESEND_API_KEY) {
    console.error('Missing Resend API key. Please set RESEND_API_KEY in the .env file.');
    process.exit(1);
}

if (!ORDERS_EMAIL_TO) {
    console.error('Missing email recipient. Please set ORDERS_EMAIL_TO in the .env file.');
    process.exit(1);
}

// Initialize Fastify
const fastify = Fastify();
fastify.register(fastifyFormBody);
fastify.register(fastifyWs);

// Constants
const PORT = process.env.PORT || 5050;

// List of Event Types to log to the console. See the OpenAI Realtime API Documentation: https://platform.openai.com/docs/api-reference/realtime
const LOG_EVENT_TYPES = [
    'error',
    'response.content.done',
    'rate_limits.updated',
    'response.done',
    'input_audio_buffer.committed',
    'input_audio_buffer.speech_stopped',
    'input_audio_buffer.speech_started',
    'session.created'
];

// Show AI response elapsed timing calculations
const SHOW_TIMING_MATH = false;

// Serve static files
fastify.register(import('@fastify/static'), {
    root: new URL('./public', import.meta.url).pathname,
    prefix: '/public/',
});

// Root Route - Serve landing page
fastify.get('/', async (request, reply) => {
    return reply.sendFile('index.html');
});

// Test page route
fastify.get('/test', async (request, reply) => {
    return reply.sendFile('test.html');
});

// API status endpoint
fastify.get('/api/status', async (request, reply) => {
    reply.send({ 
        status: 'running',
        timestamp: new Date().toISOString(),
        openai_configured: !!OPENAI_API_KEY
    });
});

// Route for Twilio to handle incoming calls - Rolling Feast
fastify.all('/incoming-call', async (request, reply) => {
    try {
        const twimlResponse = `<?xml version="1.0" encoding="UTF-8"?>
                              <Response>
                                  <Connect>
                                      <Stream url="wss://${request.headers.host}/media-stream" />
                                  </Connect>
                              </Response>`;

        reply.type('text/xml').send(twimlResponse);
    } catch (error) {
        console.error('Error in /incoming-call:', error);
        const errorResponse = `<?xml version="1.0" encoding="UTF-8"?>
                              <Response>
                                  <Say language="hi-IN">क्षमा कीजिए, अभी तकनीकी समस्या आ रही है।</Say>
                              </Response>`;
        reply.type('text/xml').send(errorResponse);
    }
});

// WebSocket route for media-stream
fastify.register(async (fastify) => {
    fastify.get('/media-stream', { websocket: true }, (connection, req) => {
        console.log('Client connected');

        // Connection-specific state
        let streamSid = null;
        let latestMediaTimestamp = 0;
        let lastAssistantItem = null;
        let markQueue = [];
        let responseStartTimestampTwilio = null;
        
        // Rolling Feast specific state
        let transcript = [];
        let callStartTime = new Date();

        const openAiWs = new WebSocket('wss://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview-2024-10-01', {
            headers: {
                Authorization: `Bearer ${OPENAI_API_KEY}`,
                "OpenAI-Beta": "realtime=v1"
            }
        });

        // Control initial session with OpenAI - Rolling Feast Configuration
        const initializeSession = () => {
            const sessionUpdate = {
                type: 'session.update',
                session: AI_CONFIG
            };

            console.log('Sending Rolling Feast session update');
            openAiWs.send(JSON.stringify(sessionUpdate));

            // Send Hindi greeting immediately
            setTimeout(() => {
                sendInitialConversationItem();
            }, 100);
        };

        // Send initial Hindi greeting for Rolling Feast
        const sendInitialConversationItem = () => {
            const initialConversationItem = createInitialGreeting();

            console.log('Sending Rolling Feast Hindi greeting');
            openAiWs.send(JSON.stringify(initialConversationItem));
            openAiWs.send(JSON.stringify({ type: 'response.create' }));
            
            // Add greeting to transcript
            transcript.push({
                role: 'assistant',
                content: 'नमस्ते! Rolling Feast में आपका स्वागत है। क्या आप ऑर्डर देना चाहेंगे या टेबल बुक करना?',
                timestamp: new Date().toISOString()
            });
        };

        // Handle interruption when the caller's speech starts
        const handleSpeechStartedEvent = () => {
            if (markQueue.length > 0 && responseStartTimestampTwilio != null) {
                const elapsedTime = latestMediaTimestamp - responseStartTimestampTwilio;
                if (SHOW_TIMING_MATH) console.log(`Calculating elapsed time for truncation: ${latestMediaTimestamp} - ${responseStartTimestampTwilio} = ${elapsedTime}ms`);

                if (lastAssistantItem) {
                    const truncateEvent = {
                        type: 'conversation.item.truncate',
                        item_id: lastAssistantItem,
                        content_index: 0,
                        audio_end_ms: elapsedTime
                    };
                    if (SHOW_TIMING_MATH) console.log('Sending truncation event:', JSON.stringify(truncateEvent));
                    openAiWs.send(JSON.stringify(truncateEvent));
                }

                connection.send(JSON.stringify({
                    event: 'clear',
                    streamSid: streamSid
                }));

                // Reset
                markQueue = [];
                lastAssistantItem = null;
                responseStartTimestampTwilio = null;
            }
        };

        // Send mark messages to Media Streams so we know if and when AI response playback is finished
        const sendMark = (connection, streamSid) => {
            if (streamSid) {
                const markEvent = {
                    event: 'mark',
                    streamSid: streamSid,
                    mark: { name: 'responsePart' }
                };
                connection.send(JSON.stringify(markEvent));
                markQueue.push('responsePart');
            }
        };

        // Open event for OpenAI WebSocket
        openAiWs.on('open', () => {
            console.log('Connected to the OpenAI Realtime API');
            setTimeout(initializeSession, 100);
        });

        // Listen for messages from the OpenAI WebSocket (and send to Twilio if necessary)
        openAiWs.on('message', (data) => {
            try {
                const response = JSON.parse(data);

                if (LOG_EVENT_TYPES.includes(response.type)) {
                    console.log(`Received event: ${response.type}`, response);
                }

                if (response.type === 'response.audio.delta' && response.delta) {
                    const audioDelta = {
                        event: 'media',
                        streamSid: streamSid,
                        media: { payload: response.delta }
                    };
                    connection.send(JSON.stringify(audioDelta));

                    // First delta from a new response starts the elapsed time counter
                    if (!responseStartTimestampTwilio) {
                        responseStartTimestampTwilio = latestMediaTimestamp;
                        if (SHOW_TIMING_MATH) console.log(`Setting start timestamp for new response: ${responseStartTimestampTwilio}ms`);
                    }

                    if (response.item_id) {
                        lastAssistantItem = response.item_id;
                    }
                    
                    sendMark(connection, streamSid);
                }

                // Capture assistant responses for transcript
                if (response.type === 'response.content.done' && response.content) {
                    const assistantMessage = response.content
                        .filter(item => item.type === 'text')
                        .map(item => item.text)
                        .join(' ');
                    
                    if (assistantMessage) {
                        transcript.push({
                            role: 'assistant',
                            content: assistantMessage,
                            timestamp: new Date().toISOString()
                        });
                    }
                }

                // Capture user input for transcript
                if (response.type === 'conversation.item.input_audio_transcription.completed') {
                    if (response.transcript) {
                        transcript.push({
                            role: 'user',
                            content: response.transcript,
                            timestamp: new Date().toISOString()
                        });
                    }
                }

                if (response.type === 'input_audio_buffer.speech_started') {
                    handleSpeechStartedEvent();
                }
            } catch (error) {
                console.error('Error processing OpenAI message:', error, 'Raw message:', data);
            }
        });

        // Handle incoming messages from Twilio
        connection.on('message', (message) => {
            try {
                const data = JSON.parse(message);

                switch (data.event) {
                    case 'media':
                        latestMediaTimestamp = data.media.timestamp;
                        if (SHOW_TIMING_MATH) console.log(`Received media message with timestamp: ${latestMediaTimestamp}ms`);
                        if (openAiWs.readyState === WebSocket.OPEN) {
                            const audioAppend = {
                                type: 'input_audio_buffer.append',
                                audio: data.media.payload
                            };
                            openAiWs.send(JSON.stringify(audioAppend));
                        }
                        break;
                    case 'start':
                        streamSid = data.start.streamSid;
                        console.log('Incoming stream has started', streamSid);

                        // Reset start and media timestamp on a new stream
                        responseStartTimestampTwilio = null; 
                        latestMediaTimestamp = 0;
                        break;
                    case 'mark':
                        if (markQueue.length > 0) {
                            markQueue.shift();
                        }
                        break;
                    default:
                        console.log('Received non-media event:', data.event);
                        break;
                }
            } catch (error) {
                console.error('Error parsing message:', error, 'Message:', message);
            }
        });

        // Handle connection close - Send email summary
        connection.on('close', async () => {
            if (openAiWs.readyState === WebSocket.OPEN) openAiWs.close();
            console.log('Client disconnected.');
            
            // Generate and send email summary
            try {
                if (transcript.length > 1) { // More than just the greeting
                    const summaryData = summarizeTranscript(transcript);
                    await sendCallSummary(summaryData.summary, summaryData.language);
                    console.log('Call summary sent via email:', summaryData.summary);
                } else {
                    console.log('No meaningful conversation to summarize');
                }
            } catch (error) {
                console.error('Error sending call summary:', error);
            }
        });

        // Handle WebSocket close and errors
        openAiWs.on('close', () => {
            console.log('Disconnected from the OpenAI Realtime API');
        });

        openAiWs.on('error', (error) => {
            console.error('Error in the OpenAI WebSocket:', error);
        });
    });
});

fastify.listen({ port: PORT }, (err) => {
    if (err) {
        console.error(err);
        process.exit(1);
    }
    console.log(`🍜 Rolling Feast Voice Assistant is listening on port ${PORT}`);
    console.log(`📞 Ready to handle calls with Hindi-first greeting`);
    console.log(`📧 Email summaries will be sent to: ${ORDERS_EMAIL_TO}`);
});
