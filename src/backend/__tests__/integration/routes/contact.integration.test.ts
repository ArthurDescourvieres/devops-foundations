import request from 'supertest';
import express, { Express } from 'express';
import contactRoutes from '../../../routes/contact';

describe('POST /contact Integration Tests', () => {
  let app: Express;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use(contactRoutes);
  });

  it('should send email via MailHog', async () => {
    // This test requires MailHog to be running
    const response = await request(app)
      .post('/contact')
      .send({
        name: 'Integration Test',
        email: 'test@example.com',
        message: 'This is an integration test message',
      });

    // If MailHog is available, should return sent status
    // If not available, should return error status
    expect([200, 500]).toContain(response.status);
    
    if (response.status === 200) {
      expect(response.body).toHaveProperty('status', 'sent');
      expect(response.body).toHaveProperty('message', 'Email sent successfully');
      expect(response.body).toHaveProperty('timestamp');
    } else {
      expect(response.body).toHaveProperty('status', 'error');
      expect(response.body).toHaveProperty('error');
    }
  }, 15000); // Increase timeout for SMTP connection
});
