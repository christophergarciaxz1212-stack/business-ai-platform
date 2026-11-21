const { execSync } = require('child_process');
const { prisma } = require('../src/db');

beforeAll(async () => {
  // Ensure schema is up to date (migrations applied externally)
});

afterAll(async () => {
  await prisma.$disconnect();
});