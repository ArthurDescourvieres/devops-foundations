import request from 'supertest';
import express, { Express } from 'express';
import cacheRoutes from '../../../routes/cache';
import * as cacheService from '../../../services/cache';

jest.mock('../../../services/cache');

describe('GET /cache', () => {
  let app: Express;

  beforeAll(() => {
    app = express();
    app.use(cacheRoutes);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return cache status and visits count when connected', async () => {
    const mockResult = {
      status: 'connected' as const,
      visits: 5,
      timestamp: '2025-01-09T10:30:00Z',
    };

    (cacheService.incrementVisits as jest.Mock).mockResolvedValue(mockResult);

    const response = await request(app).get('/cache');

    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockResult);
    expect(cacheService.incrementVisits).toHaveBeenCalledTimes(1);
  });

  it('should return error when cache connection fails', async () => {
    const mockError = new Error('Redis connection failed');

    (cacheService.incrementVisits as jest.Mock).mockRejectedValue(mockError);

    const response = await request(app).get('/cache');

    expect(response.status).toBe(500);
    expect(response.body).toHaveProperty('status', 'disconnected');
    expect(response.body).toHaveProperty('error', 'Redis connection failed');
    expect(response.body).toHaveProperty('timestamp');
  });
});
