// src/pages/ForgotPassword.jsx
import React, { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { NotificationContext } from "../pages/NotificationContext";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isMagicLinkLoading, setIsMagicLinkLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const navigate = useNavigate();
  const { addNotification } = useContext(NotificationContext);

  const validateEmail = () => {
    const newErrors = {};
    
    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Invalid email format";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ==================== REQUEST PASSWORD RESET CODE ====================
  const handleRequestResetCode = async (e) => {
    e.preventDefault();

    if (!validateEmail()) {
      addNotification("Please enter a valid email", "error", 4000);
      return;
    }

    try {
      setIsLoading(true);
      console.log("Requesting password reset for:", email);

      const res = await axios.post("http://localhost:5000/api/auth/request-password-reset", {
        email,
      });

      console.log("Reset code requested:", res.data);

      addNotification("Reset code sent! Check your email.", "success", 5000);

      // Navigate to reset password page with email pre-filled
      setTimeout(() => {
        navigate("/reset-password", { state: { email } });
      }, 2000);
    } catch (err) {
      console.error("Reset request failed:", err.response?.data || err.message);
      const errorMsg = err.response?.data?.msg || "Failed to send reset code";
      addNotification(errorMsg, "error", 5000);
    } finally {
      setIsLoading(false);
    }
  };

  // ==================== REQUEST MAGIC LINK ====================
  const handleRequestMagicLink = async () => {
    if (!validateEmail()) {
      addNotification("Please enter a valid email", "error", 4000);
      return;
    }

    try {
      setIsMagicLinkLoading(true);
      console.log("Requesting magic link for:", email);

      const res = await axios.post("http://localhost:5000/api/auth/request-magic-link", {
        email,
      });

      console.log("Magic link requested:", res.data);

      addNotification("Magic link sent! Check your email to login.", "success", 6000);
    } catch (err) {
      console.error("Magic link request failed:", err.response?.data || err.message);
      const errorMsg = err.response?.data?.msg || "Failed to send magic link";
      addNotification(errorMsg, "error", 5000);
    } finally {
      setIsMagicLinkLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 text-white p-4">
      <div className="bg-black/40 p-8 rounded-2xl shadow-lg w-full max-w-md border border-gray-700/50">
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold mb-2">Forgot Password?</h2>
          <p className="text-gray-400 text-sm">
            No worries! Choose an option below to regain access to your account.
          </p>
        </div>

        <form onSubmit={handleRequestResetCode} className="flex flex-col gap-4">
          {/* Email Input */}
          <div>
            <label className="text-gray-300 text-sm mb-2 block">Email Address</label>
            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errors.email) setErrors({});
              }}
              className={`w-full p-3 rounded bg-gray-800 border focus:outline-none transition ${
                errors.email
                  ? "border-red-500 focus:border-red-500"
                  : "border-gray-700 focus:border-blue-500"
              }`}
              required
            />
            {errors.email && (
              <p className="text-red-400 text-xs mt-1">{errors.email}</p>
            )}
          </div>

          {/* Reset Password Button */}
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-3 rounded-lg font-bold transition ${
              isLoading
                ? "bg-gray-600 cursor-not-allowed opacity-50"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {isLoading ? "Sending Code..." : "🔒 Reset Password with Code"}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center my-6">
          <div className="flex-1 border-t border-gray-600"></div>
          <span className="px-4 text-gray-400 text-sm">OR</span>
          <div className="flex-1 border-t border-gray-600"></div>
        </div>

        {/* Magic Link Button */}
        <button
          onClick={handleRequestMagicLink}
          disabled={isMagicLinkLoading}
          className={`w-full py-3 rounded-lg font-bold transition ${
            isMagicLinkLoading
              ? "bg-gray-600 cursor-not-allowed opacity-50"
              : "bg-purple-600 hover:bg-purple-700"
          }`}
        >
          {isMagicLinkLoading ? "Sending Link..." : "✉️ Send Magic Link to Login"}
        </button>

        {/* Info Text */}
        <div className="mt-6 p-4 bg-blue-900/20 border border-blue-700/50 rounded-lg">
          <p className="text-xs text-gray-300">
            <strong>Reset Password:</strong> You'll receive a 6-digit code via email to reset your password.
          </p>
          <p className="text-xs text-gray-300 mt-2">
            <strong>Magic Link:</strong> You'll receive a link via email to instantly log in without a password.
          </p>
        </div>

        {/* Back to Login Link */}
        <div className="mt-6 text-center">
          <Link to="/login" className="text-blue-400 hover:underline text-sm">
            ← Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;