import { Router, Request, Response } from 'express';
import { testConnection } from '../services/database';

const router = Router();

router.get('/db', async (_req: Request, res: Response) => {
  try {
    const result = await testConnection();
    res.json(result);
  } catch (err) {
    const error = err as Error;
    res.status(500).json({
      status: 'disconnected',
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

export default router;
