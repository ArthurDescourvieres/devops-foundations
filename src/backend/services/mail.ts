import transporter from '../config/mail';
import { MailResult } from '../interfaces/service.interface';
import { ContactRequestBody } from '../interfaces/contact.interface';

export async function sendEmail({ name, email, message }: ContactRequestBody): Promise<MailResult> {
  const info = await transporter.sendMail({
    from: `"${name}" <${email}>`,
    to: 'contact@devops-foundations.local',
    subject: `Contact from ${name}`,
    text: message,
    html: `<p><strong>From:</strong> ${name} (${email})</p><p>${message}</p>`,
  });

  return {
    status: 'sent',
    messageId: info.messageId,
    timestamp: new Date().toISOString(),
  };
}
