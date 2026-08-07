import mongoose from 'mongoose';

/**
 * Application model — a job seeker applying to a job.
 *
 * `job`      -> the Job being applied to
 * `applicant`-> the User who applied
 * `status`   -> lifecycle controlled by the recruiter:
 *               pending -> reviewed -> shortlisted -> accepted (or rejected)
 */
const applicationSchema = new mongoose.Schema(
  {
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
      required: true,
    },
    applicant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    resume: {
      type: String,
      required: [true, 'Resume is required'],
      trim: true,
      minlength: [20, 'Resume must be at least 20 characters'],
      // For now the resume is pasted text. Swapping to a real file upload
      // (e.g. Cloudinary/Multer) later only changes this field.
    },
    coverLetter: {
      type: String,
      trim: true,
      maxlength: [2000, 'Cover letter must be at most 2000 characters'],
    },
    status: {
      type: String,
      enum: {
        values: ['pending', 'reviewed', 'shortlisted', 'rejected', 'accepted'],
        message: 'Invalid status',
      },
      default: 'pending',
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret) {
        delete ret.__v;
        return ret;
      },
    },
  },
);

// Indexes:
// - unique (job, applicant): DB-level guarantee that one user can't
//   apply to the same job twice (we also check in the controller to
//   return a friendly 409 instead of a raw duplicate-key error)
// - (applicant, createdAt): fast "my applications" list
applicationSchema.index({ job: 1, applicant: 1 }, { unique: true });
applicationSchema.index({ applicant: 1, createdAt: -1 });

export default mongoose.model('Application', applicationSchema);
