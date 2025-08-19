// Resend Email Integration for Rolling Feast
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendCallSummary(summary, language = 'hindi') {
    try {
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

        console.log('Email sent successfully:', data);
        return data;
    } catch (error) {
        console.error('Error sending email:', error);
        throw error;
    }
}
