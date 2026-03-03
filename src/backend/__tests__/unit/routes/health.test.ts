import request from 'supertest';
import express, { Express } from 'express';
import healthRoutes from '../../../routes/health';

describe('GET /health', () => {
  let app: Express;

  beforeAll(() => {
    app = express();
    app.use(healthRoutes);
  });

  it('should return health status', async () => {
    const response = await request(app).get('/health');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      status: 'ok',
      service: 'backend',
    });
  });
});
