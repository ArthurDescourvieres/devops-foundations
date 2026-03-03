const mockRedis = {
  incr: jest.fn(),
  get: jest.fn(),
  set: jest.fn(),
  on: jest.fn(),
} as any;

export default mockRedis;
