import redis from '../config/redis';
import { CacheResult } from '../interfaces/service.interface';

const VISITS_KEY = 'visits:counter';

export async function incrementVisits(): Promise<CacheResult> {
  const visits = await redis.incr(VISITS_KEY);
  return {
    status: 'connected',
    visits,
    timestamp: new Date().toISOString(),
  };
}
