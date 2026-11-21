const request = require('supertest');
const app = require('../src/server');

describe('IA Integration Test', () => {
  test('should return 200 on health check', async () => {
    const response = await request(app).get('/api/ia/status');
    expect(response.statusCode).toBe(200);
  });
});