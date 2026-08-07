import { Router } from 'express';
import {
  applyToJob,
  myApplications,
  jobApplications,
  updateStatus,
} from '../controllers/application.controller.js';
import { protect, requireRole } from '../middlewares/auth.middleware.js';

// Mounted at /api (see app.js), so paths below are relative to that.
const router = Router();

// Seeker: apply to a job, view my applications
router.post('/jobs/:id/apply', protect, requireRole('seeker'), applyToJob);
router.get('/applications/my', protect, requireRole('seeker'), myApplications);

// Recruiter: see applicants for one of my jobs, update their status
router.get('/jobs/:id/applications', protect, requireRole('recruiter'), jobApplications);
router.patch(
  '/applications/:applicationId/status',
  protect,
  requireRole('recruiter'),
  updateStatus,
);

export default router;
