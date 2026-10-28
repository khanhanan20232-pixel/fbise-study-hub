#!/usr/bin/env node
/**
 * import-quizzes.mjs — Import the full quiz bank into a RUNNING FBISE Study Hub.
 *
 * What it does:
 *   1. Reads the seeded ADMIN credentials from prisma/seed.js (never printed).
 *   2. Logs in via POST /api/auth/login and keeps the session cookie.
 *   3. Fetches existing quizzes from GET /api/quizzes.
 *   4. POSTs only the MISSING quizzes from src/data/quizzes-data.json to
 *      POST /api/quizzes (admin only), using the exact payload shape that
 *      route (and the Admin Panel's create-quiz form) accepts.
 *
 * Usage:
 *   SITE_URL=https://your-site.example node scripts/import-quizzes.mjs
 *   (SITE_URL defaults to http://localhost:3000)
 *
 * Safe to re-run: quizzes that already exist (same classGrade + subject)
 * are skipped.
 */

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const SITE_URL = (process.env.SITE_URL || 'http://localhost:3000').replace(/\/+$/, '');
const rootDir = join(dirname(fileURLToPath(import.meta.url)), '..');

// ---- 1. Read quiz data -------------------------------------------------------
const quizzesData = JSON.parse(
  readFileSync(join(rootDir, 'src', 'data', 'quizzes-data.json'), 'utf8')
);

// ---- 2. Read seeded admin credentials from prisma/seed.js --------------------
// The admin account is created in seed.js with a bcrypt.hash('<password>')
// call directly above the admin upsert. We extract that literal here; the
// password is only ever sent to the site's own login endpoint, never logged.
function readAdminCredentials() {
  const seed = readFileSync(join(rootDir, 'prisma', 'seed.js'), 'utf8');
  const emailMatch = seed.match(/email:\s*'(admin@[^']+)'/);
  const hashMatch = seed.match(/bcrypt\.hash\('([^']+)',\s*10\)/);
  if (!emailMatch || !hashMatch) {
    throw new Error('Could not locate seeded admin credentials in prisma/seed.js');
  }
  return { email: emailMatch[1], password: hashMatch[1] };
}

// ---- Helpers ------------------------------------------------------------------
function cookieHeaderFrom(res) {
  const setCookies =
    typeof res.headers.getSetCookie === 'function'
      ? res.headers.getSetCookie()
      : [res.headers.get('set-cookie')].filter(Boolean);
  return setCookies.map((c) => c.split(';')[0]).join('; ');
}

async function main() {
  console.log(`Target site: ${SITE_URL}`);
  console.log(`Quiz bank:   ${quizzesData.length} quizzes in src/data/quizzes-data.json`);

  const { email, password } = readAdminCredentials();

  // ---- 3. Login as admin ------------------------------------------------------
  const loginRes = await fetch(`${SITE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!loginRes.ok) {
    const body = await loginRes.text();
    throw new Error(`Admin login failed (${loginRes.status}): ${body.slice(0, 200)}`);
  }
  const loginData = await loginRes.json();
  if (!loginData.user || loginData.user.role !== 'ADMIN') {
    throw new Error('Logged in, but the account is not an ADMIN account.');
  }
  const cookie = cookieHeaderFrom(loginRes);
  if (!cookie) throw new Error('Login succeeded but no session cookie was returned.');
  console.log(`Logged in as admin (${loginData.user.email}).`);

  // ---- 4. Fetch existing quizzes ---------------------------------------------
  const listRes = await fetch(`${SITE_URL}/api/quizzes`, { headers: { Cookie: cookie } });
  if (!listRes.ok) throw new Error(`Could not fetch existing quizzes (${listRes.status})`);
  const { quizzes: existing } = await listRes.json();
  const existingKeys = new Set(existing.map((q) => `${q.classGrade}|${q.subject}`));
  console.log(`Existing quizzes on site: ${existing.length}`);

  // ---- 5. Create only the missing ones ----------------------------------------
  let created = 0;
  let skipped = 0;
  let failed = 0;

  for (const quiz of quizzesData) {
    const key = `${quiz.classGrade}|${quiz.subject}`;
    if (existingKeys.has(key)) {
      skipped++;
      continue;
    }
    const payload = {
      title: quiz.title,
      classGrade: quiz.classGrade,
      subject: quiz.subject,
      chapter: quiz.chapter,
      timeLimit: quiz.timeLimit || 600,
      isDaily: quiz.isDaily !== false,
      questions: quiz.questions.map((q) => ({
        question: q.question,
        optionA: q.optionA,
        optionB: q.optionB,
        optionC: q.optionC,
        optionD: q.optionD,
        correctOption: q.correctOption,
        explanation: q.explanation,
        marks: q.marks || 1,
      })),
    };

    const res = await fetch(`${SITE_URL}/api/quizzes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Cookie: cookie },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      created++;
      existingKeys.add(key);
      console.log(`  + Created: Class ${quiz.classGrade} ${quiz.subject} (${quiz.questions.length} questions)`);
    } else {
      failed++;
      const body = await res.text();
      console.error(`  ! FAILED: Class ${quiz.classGrade} ${quiz.subject} -> ${res.status} ${body.slice(0, 160)}`);
    }
  }

  console.log(`\nDone. Created: ${created}, Skipped (already existed): ${skipped}, Failed: ${failed}`);

  // ---- 6. Verify coverage -------------------------------------------------------
  const verifyRes = await fetch(`${SITE_URL}/api/quizzes`, { headers: { Cookie: cookie } });
  const { quizzes: all } = await verifyRes.json();
  const byGrade = {};
  for (const q of all) {
    byGrade[q.classGrade] = byGrade[q.classGrade] || new Set();
    byGrade[q.classGrade].add(q.subject);
  }
  console.log('\nCoverage now on site:');
  for (const grade of Object.keys(byGrade).sort()) {
    console.log(`  Class ${grade}: ${byGrade[grade].size} subjects -> ${[...byGrade[grade]].sort().join(', ')}`);
  }
  if (failed > 0) process.exitCode = 1;
}

main().catch((err) => {
  console.error('Import error:', err.message);
  process.exit(1);
});
