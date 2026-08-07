import { Router } from 'express';
import { getJobs, getJob, createJob, updateJob, deleteJob } from '../controllers/job.controller.js';
import { protect, requireRole } from '../middlewares/auth.middleware.js';

const router = Router();

// Public: anyone can browse jobs
router.get('/', getJobs);
router.get('/:id', getJob);

// Recruiters only: create, edit, delete
router.post('/', protect, requireRole('recruiter'), createJob);
router.put('/:id', protect, requireRole('recruiter'), updateJob);
router.delete('/:id', protect, requireRole('recruiter'), deleteJob);

export default router;
