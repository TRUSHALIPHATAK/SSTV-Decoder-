// src/pages/ResetPassword.jsx
import React, { useState, useContext } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { NotificationContext } from "../pages/NotificationContext";

const ResetPassword = () => {
  const location = useLocation();
  const [form, setForm] = useState({
    email: location.state?.email || "", // Pre-fill email if coming from forgot password
    code: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const { addNotification } = useContext(NotificationContext);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!form.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = "Invalid email format";
    }

    if (!form.code.trim()) {
      newErrors.code = "Reset code is required";
    } else if (!/^\d{6}$/.test(form.code)) {
      newErrors.code = "Code must be 6 digits";
    }

    if (!form.newPassword) {
      newErrors.newPassword = "New password is required";
    } else if (form.newPassword.length < 6) {
      newErrors.newPassword = "Password must be at least 6 characters";
    }

    if (!form.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (form.newPassword !== form.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      addNotification("Please fix the errors in the form", "error", 4000);
      return;
    }

    try {
      setIsLoading(true);
      console.log("Resetting password with:", {
        email: form.email,
        code: form.code,
      });

      const res = await axios.post("http://localhost:5000/api/auth/reset-password", {
        email: form.email,
        code: form.code,
        newPassword: form.newPassword,
      });

      console.log("Password reset successful:", res.data);

      addNotification("Password reset successful! Please login with your new password.", "success", 5000);

      // Redirect to login after 2 seconds
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err) {
      console.error("Password reset failed:", err.response?.data || err.message);
      const errorMsg = err.response?.data?.msg || "Password reset failed!";
      addNotification(errorMsg, "error", 5000);
      setErrors({ submit: errorMsg });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 text-white p-4">
      <div className="bg-black/40 p-8 rounded-2xl shadow-lg w-full max-w-md border border-gray-700/50">
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold mb-2">Reset Your Password</h2>
          <p className="text-gray-400 text-sm">
            Enter the 6-digit code sent to your email and create a new password.
          </p>
        </div>

        {errors.submit && (
          <div className="mb-4 p-3 bg-red-900/30 border border-red-600 rounded">
            <p className="text-red-300 text-sm">{errors.submit}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Email */}
          <div>
            <label className="text-gray-300 text-sm mb-2 block">Email</label>
            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              value={form.email}
              onChange={handleChange}
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

          {/* 6-Digit Code */}
          <div>
            <label className="text-gray-300 text-sm mb-2 block">6-Digit Code</label>
            <input
              type="text"
              name="code"
              placeholder="Enter 6-digit code"
              value={form.code}
              onChange={handleChange}
              maxLength={6}
              className={`w-full p-3 rounded bg-gray-800 border focus:outline-none transition text-center text-2xl tracking-widest ${
                errors.code
                  ? "border-red-500 focus:border-red-500"
                  : "border-gray-700 focus:border-blue-500"
              }`}
              required
            />
            {errors.code && (
              <p className="text-red-400 text-xs mt-1">{errors.code}</p>
            )}
          </div>

          {/* New Password */}
          <div>
            <label className="text-gray-300 text-sm mb-2 block">New Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="newPassword"
                placeholder="Enter new password"
                value={form.newPassword}
                onChange={handleChange}
                className={`w-full p-3 rounded bg-gray-800 border focus:outline-none transition pr-10 ${
                  errors.newPassword
                    ? "border-red-500 focus:border-red-500"
                    : "border-gray-700 focus:border-blue-500"
                }`}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-gray-400 hover:text-gray-200 text-lg"
              >
                {showPassword ? "👁️" : "👁️‍🗨️"}
              </button>
            </div>
            {errors.newPassword && (
              <p className="text-red-400 text-xs mt-1">{errors.newPassword}</p>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label className="text-gray-300 text-sm mb-2 block">Confirm Password</label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                placeholder="Confirm new password"
                value={form.confirmPassword}
                onChange={handleChange}
                className={`w-full p-3 rounded bg-gray-800 border focus:outline-none transition pr-10 ${
                  errors.confirmPassword
                    ? "border-red-500 focus:border-red-500"
                    : "border-gray-700 focus:border-blue-500"
                }`}
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-3 text-gray-400 hover:text-gray-200 text-lg"
              >
                {showConfirmPassword ? "👁️" : "👁️‍🗨️"}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-red-400 text-xs mt-1">{errors.confirmPassword}</p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-3 rounded-lg font-bold transition mt-2 ${
              isLoading
                ? "bg-gray-600 cursor-not-allowed opacity-50"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {isLoading ? "Resetting Password..." : "Reset Password"}
          </button>
        </form>

        {/* Info Box */}
        <div className="mt-6 p-4 bg-blue-900/20 border border-blue-700/50 rounded-lg">
          <p className="text-xs text-gray-300">
            💡 <strong>Didn't receive a code?</strong> Check your spam folder or{" "}
            <Link to="/forgot-password" className="text-blue-400 hover:underline">
              request a new one
            </Link>
            .
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

export default ResetPassword;