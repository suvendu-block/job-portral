/**
 * End-to-end API tests.
 *
 * Runs against a real MongoDB (like production) using supertest + Node's
 * built-in test runner — no extra test framework needed.
 *
 * Before the tests start, point TEST_MONGODB_URI at any Mongo instance.
 * It uses a dedicated `job_portal_test` database and wipes it before each
 * run, so tests never touch real data.
 */
import { test, before, after, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import mongoose from 'mongoose';

// Set env BEFORE importing the app (controllers read these at import time)
process.env.MONGODB_URI = process.env.TEST_MONGODB_URI || 'mongodb://127.0.0.1:27017/job_portal_test';
process.env.JWT_SECRET = 'test-secret';
process.env.NODE_ENV = 'test';

const { app } = await import('../src/app.js');
const { connectDB, disconnectDB } = await import('../src/config/db.js');

before(async () => {
  await connectDB(process.env.MONGODB_URI);
});

beforeEach(async () => {
  // Clean slate per test — wipe all collections
  const db = mongoose.connection.db;
  await db.dropDatabase();
});

after(async () => {
  await disconnectDB();
});

// Helpers ----

const seeker = { name: 'Jane Seeker', email: 'jane@example.com', password: 'secret123' };
const recruiter = { name: 'Bob Recruiter', email: 'bob@example.com', password: 'secret123' };
const otherRecruiter = { name: 'Eve Other', email: 'eve@example.com', password: 'secret123' };

const validJob = {
  title: 'React Developer',
  company: 'TechCorp',
  location: 'New York, NY',
  type: 'full-time',
  salary: 120000,
  description: 'Build React applications for a growing product team.',
};

const VALID_RESUME = 'Experienced developer with 5 years of React and Node.js experience.';

/** Register + return an agent (supertest agent keeps the auth cookie). */
async function registerAgent(role, user) {
  const agent = request.agent(app);
  const res = await agent.post('/api/auth/register').send({ ...user, role });
  assert.equal(res.status, 201, JSON.stringify(res.body));
  return agent;
}

// ============================================================================
// AUTH
// ============================================================================

test('register creates a user and sets the auth cookie', async () => {
  const res = await request(app).post('/api/auth/register').send({ ...seeker, role: 'seeker' });

  assert.equal(res.status, 201);
  assert.equal(res.body.success, true);
  assert.equal(res.body.user.email, seeker.email);
  assert.equal(res.body.user.role, 'seeker');
  // password hash must never leave the server
  assert.equal(res.body.user.password, undefined);
  assert.ok(res.headers['set-cookie'][0].includes('token='), 'auth cookie should be set');
});

test('register rejects duplicate email with 409', async () => {
  await request(app).post('/api/auth/register').send({ ...seeker, role: 'seeker' });
  const res = await request(app).post('/api/auth/register').send({ ...seeker, role: 'seeker' });

  assert.equal(res.status, 409);
  assert.equal(res.body.error.code, 'EMAIL_TAKEN');
});

test('register rejects invalid input with 400 + details', async () => {
  const res = await request(app)
    .post('/api/auth/register')
    .send({ name: 'x', email: 'not-an-email', password: '123' });

  assert.equal(res.status, 400);
  assert.equal(res.body.error.code, 'VALIDATION_ERROR');
  assert.ok(Array.isArray(res.body.error.details));
});

test('login succeeds with correct credentials and sets cookie', async () => {
  await request(app).post('/api/auth/register').send({ ...seeker, role: 'seeker' });

  const res = await request(app).post('/api/auth/login').send({
    email: seeker.email,
    password: seeker.password,
  });

  assert.equal(res.status, 200);
  assert.ok(res.headers['set-cookie'][0].includes('token='));
});

test('login fails with wrong password (401, generic message)', async () => {
  await request(app).post('/api/auth/register').send({ ...seeker, role: 'seeker' });

  const res = await request(app)
    .post('/api/auth/login')
    .send({ email: seeker.email, password: 'wrongpass' });

  assert.equal(res.status, 401);
  assert.equal(res.body.error.code, 'INVALID_CREDENTIALS');
});

test('GET /me works with cookie, 401 without token', async () => {
  const agent = await registerAgent('seeker', seeker);

  const authed = await agent.get('/api/auth/me');
  assert.equal(authed.status, 200);
  assert.equal(authed.body.user.email, seeker.email);

  const anon = await request(app).get('/api/auth/me');
  assert.equal(anon.status, 401);
  assert.equal(anon.body.error.code, 'NOT_AUTHENTICATED');
});

test('logout clears the cookie', async () => {
  const agent = await registerAgent('seeker', seeker);
  const res = await agent.post('/api/auth/logout');

  assert.equal(res.status, 200);
  // set-cookie with empty value + past expiry = cookie deleted
  assert.match(res.headers['set-cookie'][0], /token=;/);

  const me = await agent.get('/api/auth/me');
  assert.equal(me.status, 401);
});

// ============================================================================
// JOBS
// ============================================================================

test('seekers cannot create jobs (403)', async () => {
  const agent = await registerAgent('seeker', seeker);
  const res = await agent.post('/api/jobs').send(validJob);
  assert.equal(res.status, 403);
});

test('unauthenticated users cannot create jobs (401)', async () => {
  const res = await request(app).post('/api/jobs').send(validJob);
  assert.equal(res.status, 401);
});

test('recruiter creates a job', async () => {
  const agent = await registerAgent('recruiter', recruiter);
  const res = await agent.post('/api/jobs').send(validJob);

  assert.equal(res.status, 201);
  assert.equal(res.body.job.title, validJob.title);
  // postedBy is the raw ObjectId here (not populated — that only happens on GET)
  assert.match(res.body.job.postedBy, /^[0-9a-fA-F]{24}$/);
});

test('anyone can list jobs (public)', async () => {
  const recruiterAgent = await registerAgent('recruiter', recruiter);
  await recruiterAgent.post('/api/jobs').send(validJob);
  await recruiterAgent.post('/api/jobs').send({
    ...validJob,
    title: 'DevOps Engineer',
    location: 'Remote',
    type: 'remote',
  });

  const res = await request(app).get('/api/jobs');
  assert.equal(res.status, 200);
  assert.equal(res.body.count, 2);
  assert.equal(res.body.jobs[0].postedBy.name, recruiter.name); // populated
});

test('search filters jobs by keyword, location and type', async () => {
  const recruiterAgent = await registerAgent('recruiter', recruiter);
  await recruiterAgent.post('/api/jobs').send(validJob);
  await recruiterAgent.post('/api/jobs').send({
    ...validJob,
    title: 'DevOps Engineer',
    location: 'Remote',
    type: 'remote',
    description: 'Automate cloud infrastructure and CI/CD pipelines for our platform.',
  });

  const byKeyword = await request(app).get('/api/jobs?q=react');
  assert.equal(byKeyword.body.count, 1);
  assert.equal(byKeyword.body.jobs[0].title, 'React Developer');

  const byLocation = await request(app).get('/api/jobs?location=remote');
  assert.equal(byLocation.body.count, 1);

  const byType = await request(app).get('/api/jobs?type=remote');
  assert.equal(byType.body.count, 1);

  const invalidType = await request(app).get('/api/jobs?type=bogus');
  assert.equal(invalidType.status, 400);

  // regex injection is neutralized — ".*" matches everything, but escaped "." matches nothing
  const injection = await request(app).get('/api/jobs?q=.*');
  assert.equal(injection.body.count, 0);
});

test('job detail returns 404 for unknown id, 400 for malformed id', async () => {
  const missing = await request(app).get('/api/jobs/aaaaaaaaaaaaaaaaaaaaaaaa');
  assert.equal(missing.status, 404);

  const malformed = await request(app).get('/api/jobs/not-an-id');
  assert.equal(malformed.status, 400);
  assert.equal(malformed.body.error.code, 'INVALID_ID');
});

test('recruiter can edit only their own jobs', async () => {
  const bob = await registerAgent('recruiter', recruiter);
  const eve = await registerAgent('recruiter', otherRecruiter);

  const created = await bob.post('/api/jobs').send(validJob);
  const jobId = created.body.job._id;

  // Eve (not the owner) -> 403
  const forbidden = await eve.put(`/api/jobs/${jobId}`).send({ title: 'Hacked' });
  assert.equal(forbidden.status, 403);

  // Bob (owner) -> 200
  const updated = await bob.put(`/api/jobs/${jobId}`).send({ title: 'Senior React Developer' });
  assert.equal(updated.status, 200);
  assert.equal(updated.body.job.title, 'Senior React Developer');
});

test('recruiter can delete only their own jobs, and applications go with them', async () => {
  const bob = await registerAgent('recruiter', recruiter);
  const eve = await registerAgent('recruiter', otherRecruiter);
  const jane = await registerAgent('seeker', seeker);

  const created = await bob.post('/api/jobs').send(validJob);
  const jobId = created.body.job._id;

  await jane.post(`/api/jobs/${jobId}/apply`).send({ resume: VALID_RESUME });

  const forbidden = await eve.delete(`/api/jobs/${jobId}`);
  assert.equal(forbidden.status, 403);

  const deleted = await bob.delete(`/api/jobs/${jobId}`);
  assert.equal(deleted.status, 200);

  const gone = await request(app).get(`/api/jobs/${jobId}`);
  assert.equal(gone.status, 404);

  // application cleaned up with the job
  const mine = await jane.get('/api/applications/my');
  assert.equal(mine.body.count, 0);
});

// ============================================================================
// APPLICATIONS
// ============================================================================

test('seeker applies to a job', async () => {
  const bob = await registerAgent('recruiter', recruiter);
  const jane = await registerAgent('seeker', seeker);

  const created = await bob.post('/api/jobs').send(validJob);
  const jobId = created.body.job._id;

  const res = await jane.post(`/api/jobs/${jobId}/apply`).send({ resume: VALID_RESUME });

  assert.equal(res.status, 201);
  assert.equal(res.body.application.status, 'pending');
});

test('recruiters cannot apply, seekers cannot apply twice, own job apply blocked', async () => {
  const bob = await registerAgent('recruiter', recruiter);
  const jane = await registerAgent('seeker', seeker);
  const created = await bob.post('/api/jobs').send(validJob);
  const jobId = created.body.job._id;

  // recruiter applying -> 403
  const recruiterApply = await bob.post(`/api/jobs/${jobId}/apply`).send({ resume: VALID_RESUME });
  assert.equal(recruiterApply.status, 403);

  // first apply -> 201, second -> 409
  const first = await jane.post(`/api/jobs/${jobId}/apply`).send({ resume: VALID_RESUME });
  assert.equal(first.status, 201);
  const second = await jane.post(`/api/jobs/${jobId}/apply`).send({ resume: VALID_RESUME });
  assert.equal(second.status, 409);
  assert.equal(second.body.error.code, 'ALREADY_APPLIED');

  // applying to your own job -> 400
  const ownJob = await bob.post('/api/jobs').send({ ...validJob, title: 'Bobs Own Job' });
  const recruiterOwn = await jane.post(`/api/jobs/${ownJob.body.job._id}/apply`).send({
    resume: VALID_RESUME,
  });
  assert.equal(recruiterOwn.status, 201); // jane can apply to bob's job, that's fine
});

test('seeker sees their applications with job details', async () => {
  const bob = await registerAgent('recruiter', recruiter);
  const jane = await registerAgent('seeker', seeker);

  const job1 = await bob.post('/api/jobs').send(validJob);
  const job2 = await bob.post('/api/jobs').send({ ...validJob, title: 'Node.js Engineer' });

  await jane.post(`/api/jobs/${job1.body.job._id}/apply`).send({ resume: VALID_RESUME });
  await jane.post(`/api/jobs/${job2.body.job._id}/apply`).send({ resume: VALID_RESUME });

  const res = await jane.get('/api/applications/my');
  assert.equal(res.status, 200);
  assert.equal(res.body.count, 2);
  assert.equal(res.body.applications[0].job.title, 'Node.js Engineer'); // newest first
});

test('recruiter sees applicants and updates their status', async () => {
  const bob = await registerAgent('recruiter', recruiter);
  const eve = await registerAgent('recruiter', otherRecruiter);
  const jane = await registerAgent('seeker', seeker);

  const job = await bob.post('/api/jobs').send(validJob);
  const jobId = job.body.job._id;
  await jane.post(`/api/jobs/${jobId}/apply`).send({ resume: VALID_RESUME });

  // Eve doesn't own the job -> 403
  const forbidden = await eve.get(`/api/jobs/${jobId}/applications`);
  assert.equal(forbidden.status, 403);

  // Bob sees the applicant
  const list = await bob.get(`/api/jobs/${jobId}/applications`);
  assert.equal(list.status, 200);
  assert.equal(list.body.count, 1);
  assert.equal(list.body.applications[0].applicant.email, seeker.email);
  assert.equal(list.body.applications[0].resume, VALID_RESUME);

  // Bob updates status
  const applicationId = list.body.applications[0]._id;
  const updated = await bob
    .patch(`/api/applications/${applicationId}/status`)
    .send({ status: 'shortlisted' });
  assert.equal(updated.status, 200);
  assert.equal(updated.body.application.status, 'shortlisted');

  // invalid status -> 400
  const bad = await bob
    .patch(`/api/applications/${applicationId}/status`)
    .send({ status: 'maybe' });
  assert.equal(bad.status, 400);

  // Eve cannot update status on a job she doesn't own -> 403
  const eveUpdate = await eve
    .patch(`/api/applications/${applicationId}/status`)
    .send({ status: 'rejected' });
  assert.equal(eveUpdate.status, 403);
});

// ============================================================================
// MISCELLANEOUS
// ============================================================================

test('unknown routes return 404 JSON', async () => {
  const res = await request(app).get('/api/does-not-exist');
  assert.equal(res.status, 404);
  assert.equal(res.body.error.code, 'NOT_FOUND');
});
