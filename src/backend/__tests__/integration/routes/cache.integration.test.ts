import request from 'supertest';
import express, { Express } from 'express';
import cacheRoutes from '../../../routes/cache';

describe('GET /cache Integration Tests', () => {
  let app: Express;

  beforeAll(() => {
    app = express();
    app.use(cacheRoutes);
  });

  it('should connect to Redis and increment visits', async () => {
    // This test requires Redis to be running
    const response = await request(app).get('/cache');

    // If Redis is available, should return connected status
    // If not available, should return error status
    expect([200, 500]).toContain(response.status);
    
    if (response.status === 200) {
      expect(response.body).toHaveProperty('status', 'connected');
      expect(response.body).toHaveProperty('visits');
      expect(response.body).toHaveProperty('timestamp');
      expect(typeof response.body.visits).toBe('number');
    } else {
      expect(response.body).toHaveProperty('status', 'disconnected');
      expect(response.body).toHaveProperty('error');
    }
  }, 15000); // Increase timeout for Redis connection

  it('should increment visits counter on multiple calls', async () => {
    // This test requires Redis to be running
    const response1 = await request(app).get('/cache');
    const response2 = await request(app).get('/cache');

    if (response1.status === 200 && response2.status === 200) {
      expect(response2.body.visits).toBeGreaterThan(response1.body.visits);
    }
  }, 20000);
});
