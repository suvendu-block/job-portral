import { Router } from 'express';
import { getMyProfile, getPublicProfile, updateProfile } from '../controllers/profile.controller.js';
import { protect } from '../middlewares/auth.middleware.js';

const router = Router();

// Own profile (read + write)
router.get('/me', protect, getMyProfile);
router.put('/', protect, updateProfile);

// Public profile (anyone can view)
router.get('/:userId', getPublicProfile);

export default router;
