import request from 'supertest';
import express, { Express } from 'express';
import dbRoutes from '../../../routes/db';
import * as databaseService from '../../../services/database';

jest.mock('../../../services/database');

describe('GET /db', () => {
  let app: Express;

  beforeAll(() => {
    app = express();
    app.use(dbRoutes);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return database connection status when connected', async () => {
    const mockResult = {
      status: 'connected' as const,
      database: 'devops_db',
      timestamp: '2025-01-09T10:30:00Z',
    };

    (databaseService.testConnection as jest.Mock).mockResolvedValue(mockResult);

    const response = await request(app).get('/db');

    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockResult);
    expect(databaseService.testConnection).toHaveBeenCalledTimes(1);
  });

  it('should return error when database connection fails', async () => {
    const mockError = new Error('Connection failed');

    (databaseService.testConnection as jest.Mock).mockRejectedValue(mockError);

    const response = await request(app).get('/db');

    expect(response.status).toBe(500);
    expect(response.body).toHaveProperty('status', 'disconnected');
    expect(response.body).toHaveProperty('error', 'Connection failed');
    expect(response.body).toHaveProperty('timestamp');
  });
});
