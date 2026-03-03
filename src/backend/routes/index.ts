import { Router, Request, Response } from 'express';

const router = Router();

router.get('/', (_req: Request, res: Response) => {
  res.json({
    message: 'DevOps Foundations API',
    version: process.env.VERSION || '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

export default router;
