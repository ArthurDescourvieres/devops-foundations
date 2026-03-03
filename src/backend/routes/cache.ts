import { Router, Request, Response } from 'express';
import { incrementVisits } from '../services/cache';

const router = Router();

router.get('/cache', async (_req: Request, res: Response) => {
  try {
    const result = await incrementVisits();
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
