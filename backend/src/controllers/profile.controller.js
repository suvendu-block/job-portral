import Profile from '../models/Profile.js';
import AppError from '../utils/AppError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

/**
 * GET /api/profile/me
 * Returns the logged-in user's profile, creating an empty one if needed.
 */
export const getMyProfile = asyncHandler(async (req, res) => {
  let profile = await Profile.findOne({ user: req.user._id }).populate('user', 'name email role');

  // Auto-create an empty profile on first visit
  if (!profile) {
    profile = await Profile.create({ user: req.user._id });
    await profile.populate('user', 'name email role');
  }

  res.json({ success: true, profile });
});

/**
 * GET /api/profile/:userId
 * Public endpoint — returns a user's profile for display on job postings.
 */
export const getPublicProfile = asyncHandler(async (req, res) => {
  const profile = await Profile.findOne({ user: req.params.userId }).populate('user', 'name email role');

  if (!profile) {
    throw new AppError(404, 'Profile not found', 'PROFILE_NOT_FOUND');
  }

  res.json({ success: true, profile });
});

/**
 * PUT /api/profile
 * Full update (create or replace) of the logged-in user's profile.
 */
export const updateProfile = asyncHandler(async (req, res) => {
  const { bio, skills, experience, education, links } = req.body ?? {};

  const update = {};
  if (bio !== undefined) update.bio = bio;
  if (skills !== undefined) update.skills = skills;
  if (experience !== undefined) update.experience = experience;
  if (education !== undefined) update.education = education;
  if (links !== undefined) update.links = links;

  const profile = await Profile.findOneAndUpdate(
    { user: req.user._id },
    { $set: update },
    { new: true, upsert: true, runValidators: true },
  ).populate('user', 'name email role');

  res.json({ success: true, profile });
});
