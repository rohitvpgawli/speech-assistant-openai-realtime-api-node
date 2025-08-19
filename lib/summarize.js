// Transcript Summarization for Rolling Feast
// Detects language and creates appropriate summary

export function detectLanguage(transcript) {
    const text = transcript.map(entry => entry.content).join(' ').toLowerCase();
    
    // Count Hindi/Devanagari characters
    const hindiChars = (text.match(/[\u0900-\u097F]/g) || []).length;
    
    // Count English words
    const englishWords = (text.match(/[a-z]+/g) || []).length;
    
    // Simple heuristic for language detection
    if (hindiChars > englishWords * 0.3) {
        return englishWords > hindiChars * 0.5 ? 'mixed' : 'hindi';
    } else if (englishWords > 0) {
        return 'english';
    }
    
    return 'hindi'; // Default to Hindi
}

export function summarizeTranscript(transcript) {
    if (!transcript || transcript.length === 0) {
        return {
            summary: 'कोई बातचीत रिकॉर्ड नहीं हुई।',
            language: 'hindi'
        };
    }

    const language = detectLanguage(transcript);
    
    // Extract key information from transcript
    const customerMessages = transcript.filter(entry => entry.role === 'user');
    const assistantMessages = transcript.filter(entry => entry.role === 'assistant');
    
    // Create summary based on detected language
    let summary;
    
    if (language === 'hindi') {
        summary = createHindiSummary(customerMessages, assistantMessages);
    } else if (language === 'english') {
        summary = createEnglishSummary(customerMessages, assistantMessages);
    } else {
        summary = createMixedSummary(customerMessages, assistantMessages);
    }
    
    return {
        summary,
        language,
        duration: transcript.length,
        timestamp: new Date().toISOString()
    };
}

function createHindiSummary(customerMessages, assistantMessages) {
    const topics = extractTopics(customerMessages);
    
    if (topics.includes('order') || topics.includes('ऑर्डर')) {
        return `ग्राहक ने Rolling Feast से ऑर्डर के बारे में पूछताछ की। ${customerMessages.length} संदेश आदान-प्रदान हुए। ग्राहक की मुख्य रुचि खाना ऑर्डर करने में थी।`;
    } else if (topics.includes('table') || topics.includes('टेबल')) {
        return `ग्राहक ने टेबल बुकिंग के लिए संपर्क किया। बातचीत में ${customerMessages.length} मुख्य बिंदु थे। रेस्टोरेंट की जानकारी साझा की गई।`;
    } else {
        return `Rolling Feast के साथ ${customerMessages.length} संदेशों की बातचीत हुई। ग्राहक ने रेस्टोरेंट की सेवाओं के बारे में जानकारी ली।`;
    }
}

function createEnglishSummary(customerMessages, assistantMessages) {
    const topics = extractTopics(customerMessages);
    
    if (topics.includes('order')) {
        return `Customer inquired about placing an order at Rolling Feast. ${customerMessages.length} messages were exchanged. Main interest was in food ordering.`;
    } else if (topics.includes('table') || topics.includes('booking')) {
        return `Customer contacted for table booking. Conversation had ${customerMessages.length} main points. Restaurant information was shared.`;
    } else {
        return `${customerMessages.length} message conversation with Rolling Feast. Customer inquired about restaurant services and information.`;
    }
}

function createMixedSummary(customerMessages, assistantMessages) {
    return `Rolling Feast के साथ mixed language conversation हुई। ${customerMessages.length} messages exchange हुए। Customer ने restaurant services के बारे में inquire किया।`;
}

function extractTopics(messages) {
    const text = messages.map(msg => msg.content).join(' ').toLowerCase();
    const topics = [];
    
    // Common keywords for topic detection
    if (text.includes('order') || text.includes('ऑर्डर')) topics.push('order');
    if (text.includes('table') || text.includes('टेबल') || text.includes('booking')) topics.push('table');
    if (text.includes('menu') || text.includes('मेन्यू')) topics.push('menu');
    if (text.includes('price') || text.includes('कीमत')) topics.push('price');
    
    return topics;
}
