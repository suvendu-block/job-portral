import mongoose from 'mongoose';

/**
 * Job model — a job posting created by a recruiter.
 *
 * `postedBy` links the job to the User who created it.
 * `type` is a fixed set of values so the frontend can filter reliably.
 */
const jobSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      minlength: [2, 'Title must be at least 2 characters'],
      maxlength: [100, 'Title must be at most 100 characters'],
    },
    company: {
      type: String,
      required: [true, 'Company is required'],
      trim: true,
      maxlength: [100, 'Company name must be at most 100 characters'],
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
      trim: true,
      maxlength: [100, 'Location must be at most 100 characters'],
    },
    type: {
      type: String,
      enum: {
        values: ['full-time', 'part-time', 'contract', 'internship', 'remote'],
        message: 'Type must be one of: full-time, part-time, contract, internship, remote',
      },
      default: 'full-time',
    },
    salary: {
      type: Number,
      min: [0, 'Salary cannot be negative'],
      // optional — annual salary in USD
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      minlength: [10, 'Description must be at least 10 characters'],
    },
    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
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

// Indexes for the query patterns we use:
// - list "jobs posted by me" (recruiter dashboard)
// - search by text fields (covered with $or regex in the controller)
jobSchema.index({ postedBy: 1, createdAt: -1 });

export default mongoose.model('Job', jobSchema);
