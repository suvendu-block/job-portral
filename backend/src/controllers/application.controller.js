import Application from '../models/Application.js';
import Job from '../models/Job.js';
import AppError from '../utils/AppError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const STATUSES = ['pending', 'reviewed', 'shortlisted', 'rejected', 'accepted'];

/**
 * Shared owner check for a job (recruiters can only touch applications
 * of jobs they posted).
 */
async function assertJobOwnership(jobId, user) {
  const job = await Job.findById(jobId);
  if (!job) throw new AppError(404, 'Job not found', 'JOB_NOT_FOUND');
  const ownerId = job.postedBy?._id ?? job.postedBy;
  if (String(ownerId) !== String(user._id)) {
    throw new AppError(403, 'You can only manage applications for your own jobs', 'FORBIDDEN');
  }
  return job;
}

// --- POST /api/jobs/:id/apply  (seeker only) ---------
export const applyToJob = asyncHandler(async (req, res) => {
  const { resume, coverLetter } = req.body ?? {};

  const job = await Job.findById(req.params.id);
  if (!job) throw new AppError(404, 'Job not found', 'JOB_NOT_FOUND');

  // Recruiters shouldn't apply to their own postings
  const ownerId = job.postedBy?._id ?? job.postedBy;
  if (String(ownerId) === String(req.user._id)) {
    throw new AppError(400, 'You cannot apply to a job you posted', 'OWN_JOB');
  }

  if (!resume || resume.trim().length < 20) {
    throw new AppError(400, 'Resume is required (at least 20 characters)', 'VALIDATION_ERROR');
  }

  // Friendly duplicate check — the unique index is the real guarantee
  const alreadyApplied = await Application.findOne({ job: job._id, applicant: req.user._id });
  if (alreadyApplied) {
    throw new AppError(409, 'You have already applied to this job', 'ALREADY_APPLIED');
  }

  const application = await Application.create({
    job: job._id,
    applicant: req.user._id,
    resume: resume.trim(),
    coverLetter: coverLetter?.trim() || undefined,
  });

  res.status(201).json({ success: true, application });
});

// --- GET /api/applications/my  (seeker only) ----------
// "My applications" dashboard: every job I applied to + its status.
export const myApplications = asyncHandler(async (req, res) => {
  const applications = await Application.find({ applicant: req.user._id })
    .sort({ createdAt: -1 })
    .populate('job', 'title company location type salary')
    .lean();

  res.json({ success: true, count: applications.length, applications });
});

// --- GET /api/jobs/:id/applications  (recruiter, own job only) -------
// Recruiter dashboard: all applicants for one of my jobs.
export const jobApplications = asyncHandler(async (req, res) => {
  await assertJobOwnership(req.params.id, req.user);

  const applications = await Application.find({ job: req.params.id })
    .sort({ createdAt: -1 })
    .populate('applicant', 'name email')
    .lean();

  res.json({ success: true, count: applications.length, applications });
});

// --- PATCH /api/applications/:applicationId/status  (recruiter, own job only) ------
// Move an application through the pipeline: pending -> reviewed -> shortlisted -> accepted
export const updateStatus = asyncHandler(async (req, res) => {
  const { status } = req.body ?? {};

  if (!STATUSES.includes(status)) {
    throw new AppError(400, `status must be one of: ${STATUSES.join(', ')}`, 'VALIDATION_ERROR');
  }

  const application = await Application.findById(req.params.applicationId);
  if (!application) {
    throw new AppError(404, 'Application not found', 'APPLICATION_NOT_FOUND');
  }

  // The recruiter must own the job this application belongs to
  await assertJobOwnership(application.job, req.user);

  application.status = status;
  await application.save();

  res.json({ success: true, application });
});
