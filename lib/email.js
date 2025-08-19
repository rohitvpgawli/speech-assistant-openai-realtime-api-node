// Resend Email Integration for Rolling Feast
import { Resend } from 'resend';

// Initialize Resend only if API key is provided
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export async function sendCallSummary(summary, language = 'hindi') {
    try {
        // Check if Resend is configured
        if (!resend) {
            console.log('📧 Email summary (Resend not configured):', summary);
            return { message: 'Email service not configured, summary logged to console' };
        }

        if (!process.env.ORDERS_EMAIL_TO) {
            console.log('📧 Email summary (no recipient configured):', summary);
            return { message: 'No email recipient configured, summary logged to console' };
        }

        const subject = language === 'english' ? 
            'Rolling Feast - Call Summary' : 
            'Rolling Feast - कॉल सारांश';

        const emailContent = `
        <h2>${subject}</h2>
        <p><strong>Call Summary:</strong></p>
        <p>${summary}</p>
        <p><em>Generated at: ${new Date().toLocaleString()}</em></p>
        `;

        const data = await resend.emails.send({
            from: 'Rolling Feast <noreply@rollingfeast.com>',
            to: [process.env.ORDERS_EMAIL_TO],
            subject: subject,
            html: emailContent,
        });

        console.log('📧 Email sent successfully:', data);
        return data;
    } catch (error) {
        console.error('❌ Error sending email:', error);
        console.log('📧 Email summary (fallback to console):', summary);
        return { error: error.message, summary };
    }
}
