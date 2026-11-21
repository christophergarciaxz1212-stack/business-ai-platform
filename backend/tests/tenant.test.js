const request = require('supertest');
const app = require('../src/server');
const { prisma } = require('../src/db');

beforeEach(async () => {
  await prisma.tenantMember.deleteMany();
  await prisma.tenant.deleteMany();
  await prisma.user.deleteMany();
});

afterAll(async () => {
  await prisma.$disconnect();
});

async function registerAndGetToken(email, companyName) {
  const res = await request(app).post('/api/auth/register').send({
    email, password: 'password123', name: 'User', companyName,
  });
  return { token: res.body.accessToken, tenantId: res.body.tenant.id };
}

describe('Tenant', () => {
  it('gets own tenant profile', async () => {
    const { token } = await registerAndGetToken('a@test.com', 'Acme');
    const res = await request(app).get('/api/tenants/me').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.companyName).toBe('Acme');
  });

  it('updates tenant profile', async () => {
    const { token } = await registerAndGetToken('a@test.com', 'Acme');
    const res = await request(app).patch('/api/tenants/me')
      .set('Authorization', `Bearer ${token}`)
      .send({ companyName: 'Acme 2', timezone: 'Europe/Lisbon' });
    expect(res.status).toBe(200);
    expect(res.body.companyName).toBe('Acme 2');
    expect(res.body.timezone).toBe('Europe/Lisbon');
  });

  it('rejects unauthenticated request', async () => {
    const res = await request(app).get('/api/tenants/me');
    expect(res.status).toBe(401);
  });

  it('isolates tenants: user A cannot see tenant B data', async () => {
    const a = await registerAndGetToken('a@test.com', 'Acme A');
    const b = await registerAndGetToken('b@test.com', 'Acme B');
    // user A tries to access; should only see own
    const res = await request(app).get('/api/tenants/me').set('Authorization', `Bearer ${a.token}`);
    expect(res.status).toBe(200);
    expect(res.body.companyName).toBe('Acme A');
    // ensure B's data not leaked via direct id (no endpoint exposes by id in MVP)
  });
});