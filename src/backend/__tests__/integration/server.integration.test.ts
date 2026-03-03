import request from 'supertest';
import express, { Express } from 'express';
import healthRoutes from '../../routes/health';
import indexRoutes from '../../routes/index';

describe('Server Integration Tests', () => {
  let app: Express;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use(healthRoutes);
    app.use(indexRoutes);
  });

  it('should start server and respond to health check', async () => {
    const response = await request(app).get('/health');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      status: 'ok',
      service: 'backend',
    });
  });

  it('should return API information on root route', async () => {
    const response = await request(app).get('/');

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('message');
    expect(response.body).toHaveProperty('version');
    expect(response.body).toHaveProperty('timestamp');
  });
});
