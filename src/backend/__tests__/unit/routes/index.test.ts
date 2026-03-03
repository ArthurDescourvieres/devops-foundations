import request from 'supertest';
import express, { Express } from 'express';
import indexRoutes from '../../../routes/index';

describe('GET /', () => {
  let app: Express;

  beforeAll(() => {
    app = express();
    app.use(indexRoutes);
  });

  it('should return API information', async () => {
    const response = await request(app).get('/');

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('message');
    expect(response.body).toHaveProperty('version');
    expect(response.body).toHaveProperty('timestamp');
    expect(response.body.message).toBe('DevOps Foundations API');
  });
});
