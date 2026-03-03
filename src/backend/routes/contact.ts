import { Router, Request, Response } from 'express';
import { sendEmail } from '../services/mail';
import { ContactRequestBody } from '../interfaces/contact.interface';

const router = Router();

router.post('/contact', async (req: Request, res: Response) => {
  const { name, email, message } = req.body as ContactRequestBody;

  if (!name || !email || !message) {
    return res.status(400).json({
      status: 'error',
      error: 'Missing required fields: name, email, message',
      timestamp: new Date().toISOString(),
    });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({
      status: 'error',
      error: 'Invalid email format',
      timestamp: new Date().toISOString(),
    });
  }

  try {
    await sendEmail({ name, email, message });
    return res.json({
      status: 'sent',
      message: 'Email sent successfully',
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    const error = err as Error;
    return res.status(500).json({
      status: 'error',
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

export default router;
