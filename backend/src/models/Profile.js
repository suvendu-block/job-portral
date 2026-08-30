import mongoose from 'mongoose';

/**
 * Profile model — one document per user, linked via `user` field.
 * Stores extended info that doesn't belong on the auth record:
 * bio, skills, experience, education, links.
 */
const profileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true, // one profile per user
    },
    bio: {
      type: String,
      trim: true,
      maxlength: [1000, 'Bio must be at most 1000 characters'],
      default: '',
    },
    skills: {
      type: [String],
      trim: true,
      default: [],
    },
    experience: [
      {
        title: { type: String, required: true, trim: true },
        company: { type: String, required: true, trim: true },
        location: { type: String, trim: true, default: '' },
        from: { type: String, trim: true }, // "Jan 2023"
        to: { type: String, trim: true }, // "Dec 2024" or "Present"
        description: { type: String, trim: true, maxlength: 500, default: '' },
      },
    ],
    education: [
      {
        school: { type: String, required: true, trim: true },
        degree: { type: String, trim: true, default: '' },
        field: { type: String, trim: true, default: '' },
        from: { type: String, trim: true },
        to: { type: String, trim: true },
      },
    ],
    links: {
      website: { type: String, trim: true, default: '' },
      linkedin: { type: String, trim: true, default: '' },
      github: { type: String, trim: true, default: '' },
    },
  },
  {
    timestamps: true,
  },
);

profileSchema.index({ user: 1 });

export default mongoose.model('Profile', profileSchema);
