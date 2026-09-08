// backend/routes/auth.js
import authMiddleware from "../middleware/authMiddleware.js";
import express from "express";
import User from "../models/User.js";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { sendMagicLink, sendPasswordResetCode, sendWelcomeEmail } from "../utils/emailService.js";


const router = express.Router();

// ==================== REGISTER USER ====================
router.post("/register", async (req, res) => {
  const { username, email, password, callSign } = req.body;

  console.log("🛰️ Registration data received:", req.body);

  try {
    // Validate required fields
    if (!username || !email || !password) {
      return res.status(400).json({ msg: "Please fill all required fields" });
    }

    if (password.length < 6) {
      return res.status(400).json({ msg: "Password must be at least 6 characters" });
    }

    // Normalize email
    const emailNormalized = email.toLowerCase();

    // Check if user already exists
    const existingUser = await User.findOne({ email: emailNormalized });
    if (existingUser) return res.status(400).json({ msg: "User already exists" });

    // Create new user (Mongoose will hash password automatically)
    const newUser = new User({
      username,
      email: emailNormalized,
      password, // plain password, hashing is done in User.js pre-save hook
      callSign: callSign || "", // optional
      isEmailVerified: true, // Set to true by default, or implement email verification
    });

    await newUser.save();

    // Send welcome email (optional, won't block registration)
    sendWelcomeEmail(emailNormalized, username).catch(err => 
      console.error("Failed to send welcome email:", err)
    );

    // Generate JWT
    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    // Respond
    res.status(201).json({
      token,
      user: {
        id: newUser._id,
        username: newUser.username,
        email: newUser.email,
        callSign: newUser.callSign,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error", error: err.message });
  }
});

// ==================== LOGIN USER (PASSWORD) ====================
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  console.log("🛰️ Login data received:", req.body);

  try {
    // Normalize email
    const emailNormalized = email.toLowerCase();

    // Find user
    const user = await User.findOne({ email: emailNormalized });
    if (!user) return res.status(400).json({ msg: "User not found" });

    // Check if user registered with Google (no password)
    if (!user.password && user.googleId) {
      return res.status(400).json({ msg: "This account uses Google login. Please sign in with Google." });
    }

    console.log("🔐 Password entered:", password);
    console.log("🔒 Hashed password in DB:", user.password);

    // Use mongoose method to compare password
    const isMatch = await user.matchPassword(password);
    console.log("✅ Password match:", isMatch);

    if (!isMatch) return res.status(400).json({ msg: "Invalid credentials" });

    // Generate JWT
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    // Respond
    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        callSign: user.callSign,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error", error: err.message });
  }
});

// ==================== REQUEST MAGIC LINK LOGIN ====================
router.post("/request-magic-link", async (req, res) => {
  const { email } = req.body;

  try {
    if (!email) {
      return res.status(400).json({ msg: "Email is required" });
    }

    const emailNormalized = email.toLowerCase();
    const user = await User.findOne({ email: emailNormalized });

    if (!user) {
      return res.status(400).json({ msg: "User not found" });
    }

    // Generate secure random token
    const loginToken = crypto.randomBytes(32).toString("hex");
    const loginTokenExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    // Save token to user
    user.loginToken = loginToken;
    user.loginTokenExpiry = loginTokenExpiry;
    await user.save();

    // Send magic link email
    const result = await sendMagicLink(emailNormalized, loginToken);

    if (!result.success) {
      return res.status(500).json({ msg: "Failed to send magic link email" });
    }

    res.json({ msg: "Magic link sent to your email. Please check your inbox." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error", error: err.message });
  }
});

// ==================== VERIFY MAGIC LINK ====================
router.get("/verify-magic-link/:token", async (req, res) => {
  const { token } = req.params;

  try {
    // Find user with valid token
    const user = await User.findOne({
      loginToken: token,
      loginTokenExpiry: { $gt: Date.now() }, // Token not expired
    });

    if (!user) {
      return res.status(400).json({ msg: "Invalid or expired magic link" });
    }

    // Clear token after successful login
    user.loginToken = null;
    user.loginTokenExpiry = null;
    await user.save();

    // Generate JWT
    const jwtToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    res.json({
      token: jwtToken,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        callSign: user.callSign,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error", error: err.message });
  }
});

// ==================== REQUEST PASSWORD RESET ====================
router.post("/request-password-reset", async (req, res) => {
  const { email } = req.body;

  try {
    if (!email) {
      return res.status(400).json({ msg: "Email is required" });
    }

    const emailNormalized = email.toLowerCase();
    const user = await User.findOne({ email: emailNormalized });

    if (!user) {
      // Don't reveal if user exists or not (security best practice)
      return res.json({ msg: "If the email exists, a reset code has been sent." });
    }

    // Check if user registered with Google (no password to reset)
    if (!user.password && user.googleId) {
      return res.status(400).json({ msg: "This account uses Google login. Password reset is not available." });
    }

    // Generate 6-digit code
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    const resetCodeExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    // Save code to user
    user.resetPasswordCode = resetCode;
    user.resetPasswordCodeExpiry = resetCodeExpiry;
    await user.save();

    // Send reset code email
    const result = await sendPasswordResetCode(emailNormalized, resetCode);

    if (!result.success) {
      return res.status(500).json({ msg: "Failed to send reset code email" });
    }

    res.json({ msg: "If the email exists, a reset code has been sent." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error", error: err.message });
  }
});

// ==================== VERIFY RESET CODE & RESET PASSWORD ====================
router.post("/reset-password", async (req, res) => {
  const { email, code, newPassword } = req.body;

  try {
    if (!email || !code || !newPassword) {
      return res.status(400).json({ msg: "Email, code, and new password are required" });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ msg: "Password must be at least 6 characters" });
    }

    const emailNormalized = email.toLowerCase();

    // Find user with valid reset code
    const user = await User.findOne({
      email: emailNormalized,
      resetPasswordCode: code,
      resetPasswordCodeExpiry: { $gt: Date.now() }, // Code not expired
    });

    if (!user) {
      return res.status(400).json({ msg: "Invalid or expired reset code" });
    }

    // Update password (pre-save hook will hash it)
    user.password = newPassword;
    user.resetPasswordCode = null;
    user.resetPasswordCodeExpiry = null;
    await user.save();

    res.json({ msg: "Password reset successful. You can now login with your new password." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error", error: err.message });
  }
});

// ==================== GOOGLE OAUTH CALLBACK ====================
router.post("/google", async (req, res) => {
  const { googleId, email, username, profilePicture } = req.body;

  try {
    if (!googleId || !email) {
      return res.status(400).json({ msg: "Google ID and email are required" });
    }

    const emailNormalized = email.toLowerCase();

    // Check if user exists with this Google ID
    let user = await User.findOne({ googleId });

    if (!user) {
      // Check if email already exists (user might have registered with password)
      user = await User.findOne({ email: emailNormalized });

      if (user) {
        // Link Google account to existing user
        user.googleId = googleId;
        await user.save();
      } else {
        // Create new user with Google
        user = new User({
          username: username || email.split("@")[0],
          email: emailNormalized,
          googleId,
          isEmailVerified: true, // Google emails are pre-verified
          password: null, // No password for Google users
        });
        await user.save();

        // Send welcome email
        sendWelcomeEmail(emailNormalized, user.username).catch(err =>
          console.error("Failed to send welcome email:", err)
        );
      }
    }

    // Generate JWT
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        callSign: user.callSign,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error", error: err.message });
  }
});

// ==================== GET CURRENT USER ====================
router.get("/me", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password -__v");
    if (!user) return res.status(404).json({ msg: "User not found" });
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error", error: err.message });
  }
});

// ==================== UPDATE PROFILE ====================
router.put("/update", authMiddleware, async (req, res) => {
  try {
    const { username, callSign, latitude, longitude } = req.body;
    const updated = await User.findByIdAndUpdate(
      req.user.id,
      { username, callSign, latitude, longitude },
      { new: true, runValidators: true }
    ).select("-password -__v");
    res.json({ user: updated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error", error: err.message });
  }
});

export default router;