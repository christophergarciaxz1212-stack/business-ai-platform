const request = require('supertest');
const app = require('../src/server');
const { prisma } = require('../src/db');

beforeEach(async () => {
  await prisma.message.deleteMany();
  await prisma.conversation.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.knowledgeChunk.deleteMany();
  await prisma.knowledgeDoc.deleteMany();
  await prisma.aiConfig.deleteMany();
  await prisma.whatsAppConfig && await prisma.whatsAppConfig.deleteMany().catch(() => {});
  await prisma.tenantMember.deleteMany();
  await prisma.tenant.deleteMany();
  await prisma.user.deleteMany();
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe('Auth', () => {
  it('registers a new user and creates a tenant', async () => {
    const res = await request(app).post('/api/auth/register').send({
      email: 'a@test.com', password: 'password123', name: 'Alice', companyName: 'Acme',
    });
    expect(res.status).toBe(201);
    expect(res.body.user.email).toBe('a@test.com');
    expect(res.body.tenant.companyName).toBe('Acme');
    expect(res.body.accessToken).toBeTruthy();
    expect(res.headers['set-cookie']).toBeTruthy();
  });

  it('rejects duplicate email with 409', async () => {
    await request(app).post('/api/auth/register').send({ email: 'a@test.com', password: 'password123', name: 'Alice' });
    const res = await request(app).post('/api/auth/register').send({ email: 'a@test.com', password: 'password123', name: 'Alice' });
    expect(res.status).toBe(409);
  });

  it('logs in with valid credentials', async () => {
    await request(app).post('/api/auth/register').send({ email: 'a@test.com', password: 'password123', name: 'Alice' });
    const res = await request(app).post('/api/auth/login').send({ email: 'a@test.com', password: 'password123' });
    expect(res.status).toBe(200);
    expect(res.body.accessToken).toBeTruthy();
  });

  it('rejects invalid password with 401', async () => {
    await request(app).post('/api/auth/register').send({ email: 'a@test.com', password: 'password123', name: 'Alice' });
    const res = await request(app).post('/api/auth/login').send({ email: 'a@test.com', password: 'wrong' });
    expect(res.status).toBe(401);
  });

  it('refreshes access token', async () => {
    const reg = await request(app).post('/api/auth/register').send({ email: 'a@test.com', password: 'password123', name: 'Alice' });
    const cookie = reg.headers['set-cookie'];
    const res = await request(app).post('/api/auth/refresh').set('Cookie', cookie);
    expect(res.status).toBe(200);
    expect(res.body.accessToken).toBeTruthy();
  });

  it('returns 401 for invalid refresh', async () => {
    const res = await request(app).post('/api/auth/refresh').set('Cookie', 'refreshToken=invalid');
    expect(res.status).toBe(401);
  });

  it('health check works', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });
});