import pool from '../config/database';
import { DatabaseConnectionResult } from '../interfaces/service.interface';

export async function testConnection(): Promise<DatabaseConnectionResult> {
  const client = await pool.connect();
  try {
    const result = await client.query('SELECT current_database() AS db, NOW() AS time');
    return {
      status: 'connected',
      database: result.rows[0].db as string,
      timestamp: result.rows[0].time as string,
    };
  } finally {
    client.release();
  }
}
