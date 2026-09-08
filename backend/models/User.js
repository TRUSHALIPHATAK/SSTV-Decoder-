import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: false }, // ✅ Made optional for Google OAuth users
    callSign: { type: String, default: "" },
    latitude: { type: Number, default: null },
    longitude: { type: Number, default: null },
    
    // ✅ Google OAuth
    googleId: { type: String, default: null, unique: true, sparse: true },
    
    // ✅ Email verification
    isEmailVerified: { type: Boolean, default: false },
    
    // ✅ Magic link login
    loginToken: { type: String, default: null },
    loginTokenExpiry: { type: Date, default: null },
    
    // ✅ Password reset (6-digit code)
    resetPasswordCode: { type: String, default: null },
    resetPasswordCodeExpiry: { type: Date, default: null },
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  
  // Skip hashing if password is not provided (Google OAuth users)
  if (!this.password) return next();
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Match entered password with hashed one
userSchema.methods.matchPassword = async function (enteredPassword) {
  if (!this.password) return false; // Google OAuth users don't have passwords
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model("User", userSchema);
export default User;