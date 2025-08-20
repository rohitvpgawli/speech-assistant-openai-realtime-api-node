# Rolling Feast Voice Assistant: Technical Documentation

This document provides a comprehensive overview of the application architecture, voice agent capabilities, and the technology stack used to power the Rolling Feast real-time voice assistant.

---

## 1. Application Overview

The application is a sophisticated, real-time voice AI agent designed to handle customer calls for the "Rolling Feast" restaurant. It can understand customer requests, answer questions, and perform tasks like taking food orders or making table reservations. The system is built to be highly responsive, providing a natural and fluid conversational experience. At the end of each call, it automatically generates and emails a summary of the conversation.

---

## 2. Voice Agent Core Features

The voice agent is engineered for a premium user experience with the following key features:

*   **High-Quality, Natural Voice:** Utilizes OpenAI's `alloy` voice model for a clear, professional, and warm tone suitable for a high-quality support agent.
*   **Fast, Low-Latency Responses:** Optimized for real-time interaction with minimal delay. The agent can interrupt and be interrupted, creating a natural conversational flow similar to human interaction.
*   **Multilingual Capability:**
    *   **English-First:** Initiates conversations in English.
    *   **Seamless Language Switching:** Automatically detects and switches to Hindi or Hinglish if the customer uses these languages, providing a fluid, bilingual experience.
*   **Intelligent Conversation Handling:**
    *   **System Prompt:** Guided by a detailed system prompt that defines its persona, communication style, and language handling rules.
    *   **Turn Detection:** Employs server-side Voice Activity Detection (VAD) to intelligently manage conversational turns.
*   **Automated Post-Call Summaries:** After each call, the agent summarizes the transcript and sends a detailed email to a designated address, perfect for order fulfillment or record-keeping.

---

## 3. Technology Stack & Architecture

The application leverages a modern, robust tech stack to handle real-time audio processing and AI-driven conversation.

### **Backend & Server**
*   **Runtime:** **Node.js**
*   **Framework:** **Fastify** - A high-performance, low-overhead web framework used to handle HTTP requests and WebSocket connections.
*   **Dependencies:**
    *   `@fastify/websocket`: For managing WebSocket connections.
    *   `@fastify/static`: For serving static files (like this documentation).
    *   `dotenv`: For managing environment variables securely.

### **AI & Voice Processing**
*   **Core AI Engine:** **OpenAI Realtime API**
    *   **Model:** `gpt-4o-realtime-preview-2024-10-01`
    *   **Functionality:** Handles real-time speech-to-text, natural language understanding (NLU), and text-to-speech synthesis in a single, integrated stream.
*   **Audio Formats:** Uses `g711_ulaw` for both input and output audio streams, which is a standard for telephony.

### **Telephony & Communication**
*   **Provider:** **Twilio**
    *   **Functionality:** Manages incoming phone calls and establishes a bi-directional media stream (`<Stream>`) over a WebSocket connection to our Fastify server.
*   **Real-time Protocol:** **WebSockets (WSS)** are used to pipe the raw audio data from Twilio to the OpenAI Realtime API and stream the AI's audio response back to Twilio.

### **Email Service**
*   **Provider:** **Resend**
    *   **Functionality:** Used to send the final call summary emails.

---

## 4. Project File Structure

The codebase is organized into logical modules for maintainability:

*   **`index.js`**: The main application entry point. It initializes the Fastify server, sets up routes, and manages the primary WebSocket logic for orchestrating the flow between Twilio and OpenAI.
*   **`lib/ai.js`**: Contains all AI-related configurations. This includes the system prompt, voice model selection (`alloy`), and parameters that control the agent's behavior (e.g., temperature, turn detection settings).
*   **`lib/email.js`**: Handles the logic for sending call summaries via the Resend API.
*   **`lib/summarize.js`**: Contains the function responsible for processing the final call transcript and generating a concise summary.
*   **`public/`**: A directory for serving static frontend assets and documentation, including `index.html` and `tech.md`.
*   **`.env`**: Stores sensitive credentials and configuration variables, such as API keys for OpenAI, Twilio, and Resend.
*   **`package.json`**: Defines project metadata and lists all Node.js dependencies.
