// Runs prisma/seed.js ONLY when the database is still empty (no users yet).
// Safe to keep in the Vercel build: on later deploys the seed is skipped,
// so seeded papers/quizzes are never duplicated.
import { PrismaClient } from '@prisma/client';
import { execFileSync } from 'node:child_process';

const prisma = new PrismaClient();
try {
  const users = await prisma.user.count();
  if (users > 0) {
    console.log(`[vercel-seed] ${users} users already exist — skipping seed.`);
  } else {
    console.log('[vercel-seed] Empty database — running seed once...');
    execFileSync('node', ['prisma/seed.js'], { stdio: 'inherit' });
    console.log('[vercel-seed] Seed complete.');
  }
} finally {
  await prisma.$disconnect();
}
