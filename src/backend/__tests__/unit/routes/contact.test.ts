import request from 'supertest';
import express, { Express } from 'express';
import contactRoutes from '../../../routes/contact';
import * as mailService from '../../../services/mail';

jest.mock('../../../services/mail');

describe('POST /contact', () => {
  let app: Express;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use(contactRoutes);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should send email successfully with valid data', async () => {
    const mockResult = {
      status: 'sent' as const,
      messageId: 'test-message-id',
      timestamp: '2025-01-09T10:30:00Z',
    };

    (mailService.sendEmail as jest.Mock).mockResolvedValue(mockResult);

    const response = await request(app)
      .post('/contact')
      .send({
        name: 'John Doe',
        email: 'john@example.com',
        message: 'Test message',
      });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('status', 'sent');
    expect(response.body).toHaveProperty('message', 'Email sent successfully');
    expect(response.body).toHaveProperty('timestamp');
    expect(mailService.sendEmail).toHaveBeenCalledWith({
      name: 'John Doe',
      email: 'john@example.com',
      message: 'Test message',
    });
  });

  it('should return 400 when name is missing', async () => {
    const response = await request(app)
      .post('/contact')
      .send({
        email: 'john@example.com',
        message: 'Test message',
      });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('status', 'error');
    expect(response.body).toHaveProperty('error', 'Missing required fields: name, email, message');
    expect(mailService.sendEmail).not.toHaveBeenCalled();
  });

  it('should return 400 when email is missing', async () => {
    const response = await request(app)
      .post('/contact')
      .send({
        name: 'John Doe',
        message: 'Test message',
      });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('status', 'error');
    expect(response.body).toHaveProperty('error', 'Missing required fields: name, email, message');
    expect(mailService.sendEmail).not.toHaveBeenCalled();
  });

  it('should return 400 when message is missing', async () => {
    const response = await request(app)
      .post('/contact')
      .send({
        name: 'John Doe',
        email: 'john@example.com',
      });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('status', 'error');
    expect(response.body).toHaveProperty('error', 'Missing required fields: name, email, message');
    expect(mailService.sendEmail).not.toHaveBeenCalled();
  });

  it('should return 400 when email format is invalid', async () => {
    const response = await request(app)
      .post('/contact')
      .send({
        name: 'John Doe',
        email: 'invalid-email',
        message: 'Test message',
      });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('status', 'error');
    expect(response.body).toHaveProperty('error', 'Invalid email format');
    expect(mailService.sendEmail).not.toHaveBeenCalled();
  });

  it('should return 500 when email sending fails', async () => {
    const mockError = new Error('SMTP connection failed');

    (mailService.sendEmail as jest.Mock).mockRejectedValue(mockError);

    const response = await request(app)
      .post('/contact')
      .send({
        name: 'John Doe',
        email: 'john@example.com',
        message: 'Test message',
      });

    expect(response.status).toBe(500);
    expect(response.body).toHaveProperty('status', 'error');
    expect(response.body).toHaveProperty('error', 'SMTP connection failed');
    expect(response.body).toHaveProperty('timestamp');
  });
});
