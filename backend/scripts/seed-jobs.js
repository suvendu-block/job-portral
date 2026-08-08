/**
 * Seed script — fills the database with 110+ realistic demo jobs
 * across a handful of recruiter accounts, plus the demo seekers.
 *
 * Idempotent: runs can be repeated safely. Jobs are matched by
 * (title + company); existing ones are skipped, so the script only
 * ever adds what's missing.
 *
 * Usage:
 *   npm run seed
 *
 * Demo logins (all passwords: secret123):
 *   recruiters — alex@northwind.dev, mara@vertexhealth.io, ...
 *   seekers    — priya@example.com, tom@example.com
 */
import mongoose from 'mongoose';
import { env, validateEnv } from '../src/config/env.js';
import { connectDB, disconnectDB } from '../src/config/db.js';
import User from '../src/models/User.js';
import Job from '../src/models/Job.js';
import Application from '../src/models/Application.js';

validateEnv();

// ---------------------------------------------------------------------------
// Data pools (kept deterministic so re-runs produce the same dataset)
// ---------------------------------------------------------------------------

const RECRUITERS = [
  { name: 'Alex Morgan', email: 'alex@northwind.dev' },
  { name: 'Mara Chen', email: 'mara@vertexhealth.io' },
  { name: 'Diego Torres', email: 'diego@quarrylabs.co' },
  { name: 'Sofia Lindqvist', email: 'sofia@redwoodenergy.se' },
  { name: 'Kenji Watanabe', email: 'kenji@ferndev.io' },
  { name: 'Amara Okafor', email: 'amara@halcyonbio.com' },
  { name: 'Lucas Meyer', email: 'lucas@summitmobility.de' },
  { name: 'Elena Petrova', email: 'elena@driftwoodgames.dev' },
];

const SEEKERS = [
  { name: 'Priya Sharma', email: 'priya@example.com' },
  { name: 'Tom Becker', email: 'tom@example.com' },
  { name: 'Ines Duarte', email: 'ines@example.com' },
];

// [company, domain] — recruiters are assigned round-robin by company index
const COMPANIES = [
  ['Northwind Studio', 'northwind.dev'],
  ['Meridian Labs', 'meridianlabs.io'],
  ['Harbor & Finch', 'harborfinch.com'],
  ['Vertex Health', 'vertexhealth.io'],
  ['Quarry Labs', 'quarrylabs.co'],
  ['Redwood Energy', 'redwoodenergy.se'],
  ['Fernware', 'ferndev.io'],
  ['Halcyon Biotech', 'halcyonbio.com'],
  ['Summit Mobility', 'summitmobility.de'],
  ['Driftwood Games', 'driftwoodgames.dev'],
  ['Luna Capital', 'lunacap.finance'],
  ['Ironclad Logistics', 'ironcladlogistics.co'],
  ['Polaris Media', 'polarismedia.tv'],
  ['Atlas Foods', 'atlasfoods.com'],
  ['Blueglass Insurance', 'blueglass.io'],
  ['Argon Analytics', 'argonanalytics.ai'],
  ['Willow & Ward', 'willowward.co'],
  ['Copernic Systems', 'copernic.dev'],
  ['Skyline Robotics', 'skylinerobotics.io'],
  ['Bramble & Co', 'brambleco.com'],
  ['Everest Research', 'everestresearch.org'],
  ['Sable Studio', 'sablestudio.design'],
];

// [title, salary range (annual USD)]
const ROLES = [
  ['Frontend Engineer', [110000, 180000]],
  ['Backend Engineer', [115000, 190000]],
  ['Full-Stack Engineer', [110000, 185000]],
  ['Senior Software Engineer', [140000, 220000]],
  ['DevOps Engineer', [120000, 180000]],
  ['Site Reliability Engineer', [130000, 200000]],
  ['Data Analyst', [85000, 130000]],
  ['Data Scientist', [110000, 170000]],
  ['Machine Learning Engineer', [130000, 210000]],
  ['Product Designer', [90000, 150000]],
  ['UX Researcher', [85000, 135000]],
  ['Product Manager', [105000, 170000]],
  ['Technical Program Manager', [110000, 170000]],
  ['QA Engineer', [80000, 125000]],
  ['Security Engineer', [125000, 185000]],
  ['iOS Engineer', [115000, 175000]],
  ['Android Engineer', [110000, 170000]],
  ['Cloud Architect', [140000, 210000]],
  ['Sales Engineer', [95000, 150000]],
  ['Account Executive', [70000, 130000]],
  ['Marketing Manager', [75000, 120000]],
  ['Content Strategist', [65000, 105000]],
  ['People Operations Partner', [65000, 105000]],
  ['Technical Recruiter', [65000, 110000]],
  ['Customer Success Manager', [60000, 100000]],
  ['Support Engineer', [50000, 85000]],
  ['Finance Analyst', [75000, 120000]],
  ['Growth Marketing Lead', [90000, 145000]],
  ['Solutions Architect', [130000, 195000]],
  ['Engineering Manager', [150000, 230000]],
];

const LOCATIONS = [
  'Remote',
  'New York, NY',
  'San Francisco, CA',
  'Austin, TX',
  'Seattle, WA',
  'Boston, MA',
  'Chicago, IL',
  'Denver, CO',
  'London, UK',
  'Berlin, DE',
  'Amsterdam, NL',
  'Paris, FR',
  'Toronto, CA',
  'Bangalore, IN',
  'Singapore',
  'Sydney, AU',
  'Lisbon, PT',
  'Stockholm, SE',
];

const TYPES = ['full-time', 'contract', 'part-time', 'internship', 'remote'];

const DESCRIPTIONS = [
  (t, c) =>
    `We are looking for a ${t} to join ${c}, a fast-growing team working on products used by thousands of customers every day. You will own meaningful pieces of work end to end, collaborate closely with a small senior team, and have a direct hand in the roadmap. If you care about craft, clarity, and shipping things that last, we would love to hear from you.`,
  (t, c) =>
    `The ${t} role at ${c} sits at the centre of our most ambitious projects this year. You will work alongside product and engineering leadership, set the bar for quality in your area, and mentor teammates as the team grows. We are a remote-friendly company with a strong culture of written communication and async work.`,
  (t, c) =>
    `${c} is hiring a ${t} for a newly formed team. This is a chance to define the role rather than fit an existing mould. Day to day you will work in small cross-functional squads, ship regularly, and get real ownership over outcomes rather than just tasks.`,
  (t, c) =>
    `Join ${c} as a ${t} and help us scale a product our customers depend on. You will be responsible for the full lifecycle of your work: discovery, delivery, and iteration based on real feedback. We offer competitive pay, meaningful equity, and a serious commitment to work-life balance.`,
  (t, c) =>
    `We are a small, profitable company looking for a ${t} who wants impact without the noise. At ${c}, you will work directly with the founders on problems that matter, move fast, and see the results of your work quickly. No busywork, no endless process, just good work with good people.`,
  (t, c) =>
    `As a ${t} at ${c}, you will help define what we build and how we build it. The team values simple solutions over clever ones and honest feedback over office politics. If that sounds like your style, this role will fit you well.`,
  (t, c) =>
    `${c} is expanding and needs a ${t} to lead the work in this area. You will have a high degree of autonomy, a clear mandate, and the support of a team that knows how to deliver. We are particularly interested in people who communicate clearly and raise the bar around them.`,
  (t, c) =>
    `The team at ${c} is looking for a ${t}. You will join a group of people who take the work seriously but not themselves, and who believe great results come from great collaboration. We invest in our people with real budgets for learning and growth.`,
];

const RESUME_TEMPLATE =
  'Experienced professional with a track record of shipping high-quality work and collaborating across teams. Strong communication, a bias for action, and a habit of leaving things better than I found them.';

const COVER_TEMPLATE =
  'I have been following this team for a while and would welcome the chance to contribute. I believe my background fits the role well, and I am happy to walk through specifics in an interview.';

// ---------------------------------------------------------------------------
// Deterministic helpers
// ---------------------------------------------------------------------------

/** Pseudo-random-ish but reproducible: same input -> same output. */
function pick(seed, arr) {
  return arr[Math.floor(Math.abs(Math.sin(seed) * 10000)) % arr.length];
}

function salaryFor(seed, [min, max]) {
  const span = max - min;
  return min + ((seed * 7919) % span);
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  await connectDB(env.MONGODB_URI);
  const db = mongoose.connection.name;

  console.log(`[seed] database: ${db}`);

  // 1. Ensure demo users exist (upsert, never touch existing)
  const createdRecruiters = [];
  for (const r of RECRUITERS) {
    let user = await User.findOne({ email: r.email });
    if (!user) {
      user = await User.create({ ...r, password: 'secret123', role: 'recruiter' });
    }
    createdRecruiters.push(user);
  }
  for (const s of SEEKERS) {
    const existing = await User.findOne({ email: s.email });
    if (!existing) {
      await User.create({ ...s, password: 'secret123', role: 'seeker' });
    }
  }

  // 2. Generate jobs: 120 total, spread across companies and roles
  const TARGET = 120;
  let created = 0;
  let skipped = 0;

  for (let i = 0; i < TARGET; i += 1) {
    const [company, domain] = COMPANIES[i % COMPANIES.length];
    const [title, range] = ROLES[(i * 3 + Math.floor(i / COMPANIES.length)) % ROLES.length];
    const location = LOCATIONS[(i * 7 + 3) % LOCATIONS.length];
    const type = TYPES[i % 5 === 4 ? 4 : i % 4]; // every 5th job is type "remote"
    const seed = i * 2654435761; // large odd multiplier keeps variety
    const recruiter = createdRecruiters[i % createdRecruiters.length];

    const exists = await Job.exists({ title, company });
    if (exists) {
      skipped += 1;
      continue;
    }

    await Job.create({
      title,
      company,
      location,
      type,
      salary: salaryFor(seed, range),
      description: pick(seed, DESCRIPTIONS)(title, company),
      postedBy: recruiter._id,
    });
    created += 1;
  }

  // 3. Ensure the demo seekers have at least one application each
  const jobs = await Job.find().lean();
  const priya = await User.findOne({ email: 'priya@example.com' });
  const tom = await User.findOne({ email: 'tom@example.com' });
  for (const [seeker, offset] of [[priya, 0], [tom, 5]]) {
    if (!seeker) continue;
    for (const job of jobs.slice(offset, offset + 2)) {
      const exists = await Application.exists({ job: job._id, applicant: seeker._id });
      if (!exists) {
        await Application.create({
          job: job._id,
          applicant: seeker._id,
          resume: RESUME_TEMPLATE,
          coverLetter: COVER_TEMPLATE,
        });
      }
    }
  }

  const total = await Job.countDocuments();
  console.log(`[seed] jobs created: ${created}, skipped (already exist): ${skipped}`);
  console.log(`[seed] total jobs in database: ${total}`);
  console.log(`[seed] users: ${await User.countDocuments()}, applications: ${await Application.countDocuments()}`);
  console.log('[seed] demo logins (password: secret123):');
  console.log('  recruiters:', RECRUITERS.map((r) => r.email).join(', '));
  console.log('  seekers   :', SEEKERS.map((s) => s.email).join(', '));

  await disconnectDB();
  process.exit(0);
}

main().catch((err) => {
  console.error('[seed] failed:', err);
  process.exit(1);
});
