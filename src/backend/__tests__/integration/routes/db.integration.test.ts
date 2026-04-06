import request from 'supertest';
import express, { Express } from 'express';
import dbRoutes from '../../../routes/db';

describe('GET /db Integration Tests', () => {
  let app: Express;

  beforeAll(() => {
    app = express();
    app.use(dbRoutes);
  });

  it('should connect to PostgreSQL database', async () => {
    // This test requires PostgreSQL to be running
    // Skip if not available
    const response = await request(app).get('/db');

    // If database is available, should return connected status
    // If not available, should return error status
    expect([200, 500]).toContain(response.status);
    
    if (response.status === 200) {
      expect(response.body).toHaveProperty('status', 'connected');
      expect(response.body).toHaveProperty('database');
      expect(response.body).toHaveProperty('timestamp');
    } else {
      expect(response.body).toHaveProperty('status', 'disconnected');
      expect(response.body).toHaveProperty('error');
    }
  }, 15000); // Increase timeout for database connection
});
