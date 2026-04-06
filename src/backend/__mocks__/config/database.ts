import { Pool } from 'pg';

const mockPool = {
  connect: jest.fn(),
  query: jest.fn(),
  end: jest.fn(),
} as unknown as Pool;

export default mockPool;
