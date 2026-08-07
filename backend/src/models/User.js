import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

/**
 * User model — one document per account.
 *
 * `role` decides what the user can do:
 *   - 'seeker'   : browse jobs, apply
 *   - 'recruiter': post jobs, review applicants
 */
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [3, 'Name must be at least 3 characters'],
      maxlength: [80, 'Name must be at most 80 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true, // creates a unique index — duplicate emails are rejected by the DB
      lowercase: true,
      trim: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please provide a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false, // never include the hash in query results by default
    },
    role: {
      type: String,
      enum: {
        values: ['seeker', 'recruiter'],
        message: 'Role must be either "seeker" or "recruiter"',
      },
      default: 'seeker',
    },
  },
  {
    timestamps: true, // adds createdAt / updatedAt automatically
    toJSON: {
      // Control what leaves the server: strip password hash + __v (Mongoose version key)
      transform(_doc, ret) {
        delete ret.password;
        delete ret.__v;
        return ret;
      },
    },
  },
);

// --- Pre-save hook: hash the password before it touches the DB ------------
// Runs on every save(). We only re-hash when the password actually changed,
// otherwise saving e.g. a name update would double-hash the hash.
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10); // 10 salt rounds
  next();
});

// --- Instance method: compare a plain-text password to the hash -----
userSchema.methods.comparePassword = function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

export default mongoose.model('User', userSchema);
