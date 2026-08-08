import Job from '../models/Job.js';
import Application from '../models/Application.js';
import AppError from '../utils/AppError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const JOB_TYPES = ['full-time', 'part-time', 'contract', 'internship', 'remote'];

/**
 * Escapes regex special characters in user input.
 * Without this, searching "a." would match "aX" too (and ".*" would match
 * EVERYTHING) — a classic injection bug.
 */
const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const isObjectId = (id) => /^[0-9a-fA-F]{24}$/.test(id);

/** Shared lookup helper: 400 on malformed id, 404 when missing. */
async function findJobOr404(id) {
  if (!isObjectId(id)) throw new AppError(400, 'Invalid job id format', 'INVALID_ID');
  const job = await Job.findById(id);
  if (!job) throw new AppError(404, 'Job not found', 'JOB_NOT_FOUND');
  return job;
}

/**
 * Ownership check. postedBy can be a raw ObjectId (findById) or a populated
 * User document (after .populate()), so normalize before comparing.
 */
function isOwner(job, user) {
  const ownerId = job.postedBy?._id ?? job.postedBy;
  return String(ownerId) === String(user._id);
}

// --- GET /api/jobs  (public — anyone can browse jobs) -------
// Supports search: ?q=react&location=remote&type=contract
// Supports pagination: ?page=2&limit=10 (defaults: page=1, limit=10, max 50)
export const getJobs = asyncHandler(async (req, res) => {
  const { q, location, type } = req.query;

  // Sanitize pagination params (also rejects NaN from parseInt)
  const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
  const limit = Math.min(50, Math.max(1, Number.parseInt(req.query.limit, 10) || 10));
  const skip = (page - 1) * limit;

  const filter = {};

  // Keyword search: match against title, company OR description
  if (q) {
    const pattern = new RegExp(escapeRegex(q), 'i'); // 'i' = case-insensitive
    filter.$or = [{ title: pattern }, { company: pattern }, { description: pattern }];
  }

  // Location: partial match ("New York" matches "New York, NY")
  if (location) {
    filter.location = new RegExp(escapeRegex(location), 'i');
  }

  // Job type: exact match on the enum
  if (type) {
    if (!JOB_TYPES.includes(type)) {
      throw new AppError(
        400,
        `type must be one of: ${JOB_TYPES.join(', ')}`,
        'VALIDATION_ERROR',
      );
    }
    filter.type = type;
  }

  // Run the page query and the total count in parallel
  const [jobs, total] = await Promise.all([
    Job.find(filter)
      .sort({ createdAt: -1 }) // newest first
      .skip(skip)
      .limit(limit)
      .populate('postedBy', 'name email') // include the poster's name/email
      .lean(), // plain objects — faster, no need to mutate documents
    Job.countDocuments(filter),
  ]);

  res.json({
    success: true,
    count: jobs.length, // how many came back on this page
    total, // how many matched overall
    page,
    pages: Math.max(1, Math.ceil(total / limit)),
    jobs,
  });
});

// --- GET /api/jobs/:id  (public) --------
export const getJob = asyncHandler(async (req, res) => {
  const job = await findJobOr404(req.params.id);
  await job.populate('postedBy', 'name email');
  res.json({ success: true, job });
});

// --- POST /api/jobs  (recruiter only) -----
export const createJob = asyncHandler(async (req, res) => {
  const { title, company, location, type, salary, description } = req.body ?? {};

  const errors = [];
  if (!title || title.trim().length < 2) errors.push('Title is required (min 2 characters)');
  if (!company || company.trim().length < 1) errors.push('Company is required');
  if (!location || location.trim().length < 1) errors.push('Location is required');
  if (type && !JOB_TYPES.includes(type)) errors.push(`Type must be one of: ${JOB_TYPES.join(', ')}`);
  if (salary !== undefined && (typeof salary !== 'number' || salary < 0)) {
    errors.push('Salary must be a positive number');
  }
  if (!description || description.trim().length < 10) {
    errors.push('Description is required (min 10 characters)');
  }
  if (errors.length > 0) {
    throw new AppError(400, 'Validation failed', 'VALIDATION_ERROR', errors);
  }

  const job = await Job.create({
    title: title.trim(),
    company: company.trim(),
    location: location.trim(),
    type: type || 'full-time',
    salary,
    description: description.trim(),
    postedBy: req.user._id, // comes from the protect middleware
  });

  res.status(201).json({ success: true, job });
});

// --- PUT /api/jobs/:id  (recruiter, own jobs only) ----
export const updateJob = asyncHandler(async (req, res) => {
  const job = await findJobOr404(req.params.id);
  if (!isOwner(job, req.user)) {
    throw new AppError(403, 'You can only edit jobs you posted', 'FORBIDDEN');
  }

  // Whitelist: only these fields may be updated — everything else is ignored
  const allowedFields = ['title', 'company', 'location', 'type', 'salary', 'description'];
  for (const field of allowedFields) {
    if (req.body[field] !== undefined) job[field] = req.body[field];
  }

  // Re-validate what changed (schema validators run on save())
  if (req.body.type && !JOB_TYPES.includes(req.body.type)) {
    throw new AppError(400, `Type must be one of: ${JOB_TYPES.join(', ')}`, 'VALIDATION_ERROR');
  }

  await job.save();
  res.json({ success: true, job });
});

// --- DELETE /api/jobs/:id  (recruiter, own jobs only) ------
export const deleteJob = asyncHandler(async (req, res) => {
  const job = await findJobOr404(req.params.id);
  if (!isOwner(job, req.user)) {
    throw new AppError(403, 'You can only delete jobs you posted', 'FORBIDDEN');
  }

  await Job.deleteOne({ _id: job._id });
  // Clean up: applications pointing at a deleted job would be orphaned.
  // (In a bigger app this might be a cascade or a "disabled" flag instead.)
  await Application.deleteMany({ job: job._id });

  res.json({ success: true, message: 'Job deleted' });
});
