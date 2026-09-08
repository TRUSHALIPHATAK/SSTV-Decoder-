// src/pages/VerifyLogin.jsx
import React, { useEffect, useState, useContext } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import axios from "axios";
import { NotificationContext } from "../pages/NotificationContext";

const VerifyLogin = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState("verifying"); // verifying, success, error
  const [message, setMessage] = useState("Verifying your login link...");
  
  const navigate = useNavigate();
  const { addNotification } = useContext(NotificationContext);

  useEffect(() => {
    const verifyMagicLink = async () => {
      const token = searchParams.get("token");

      if (!token) {
        setStatus("error");
        setMessage("Invalid magic link. No token provided.");
        addNotification("Invalid magic link", "error", 5000);
        return;
      }

      try {
        console.log("Verifying magic link with token:", token);

        const res = await axios.get(
          `http://localhost:5000/api/auth/verify-magic-link/${token}`
        );

        console.log("Magic link verified:", res.data);

        // Store token and user info
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("user", JSON.stringify(res.data.user));

        setStatus("success");
        setMessage(`Welcome back, ${res.data.user.username}!`);
        addNotification(`Login successful! Welcome, ${res.data.user.username}`, "success", 3000);

        // Redirect to dashboard after 2 seconds
        setTimeout(() => {
          navigate("/dashboard");
        }, 2000);
      } catch (err) {
        console.error("Magic link verification failed:", err.response?.data || err.message);
        const errorMsg = err.response?.data?.msg || "Invalid or expired magic link";
        
        setStatus("error");
        setMessage(errorMsg);
        addNotification(errorMsg, "error", 5000);
      }
    };

    verifyMagicLink();
  }, [searchParams, navigate, addNotification]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 text-white p-4">
      <div className="bg-black/40 p-8 rounded-2xl shadow-lg w-full max-w-md border border-gray-700/50 text-center">
        {/* Loading State */}
        {status === "verifying" && (
          <>
            <div className="flex justify-center mb-6">
              <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
            </div>
            <h2 className="text-2xl font-bold mb-4">Verifying...</h2>
            <p className="text-gray-400">{message}</p>
          </>
        )}

        {/* Success State */}
        {status === "success" && (
          <>
            <div className="flex justify-center mb-6">
              <div className="bg-green-500 rounded-full p-4">
                <svg
                  className="w-12 h-12 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
            </div>
            <h2 className="text-2xl font-bold mb-4 text-green-400">Login Successful! ✅</h2>
            <p className="text-gray-300 mb-4">{message}</p>
            <p className="text-gray-400 text-sm">Redirecting to dashboard...</p>
          </>
        )}

        {/* Error State */}
        {status === "error" && (
          <>
            <div className="flex justify-center mb-6">
              <div className="bg-red-500 rounded-full p-4">
                <svg
                  className="w-12 h-12 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </div>
            </div>
            <h2 className="text-2xl font-bold mb-4 text-red-400">Verification Failed ❌</h2>
            <p className="text-gray-300 mb-6">{message}</p>

            <div className="space-y-3">
              <Link
                to="/forgot-password"
                className="block w-full py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-bold transition"
              >
                Request New Magic Link
              </Link>
              <Link
                to="/login"
                className="block w-full py-3 bg-gray-700 hover:bg-gray-600 rounded-lg font-bold transition"
              >
                Back to Login
              </Link>
            </div>

            <div className="mt-6 p-4 bg-yellow-900/20 border border-yellow-700/50 rounded-lg">
              <p className="text-xs text-gray-300">
                💡 <strong>Common issues:</strong>
              </p>
              <ul className="text-xs text-gray-400 mt-2 space-y-1 text-left">
                <li>• Magic links expire after 15 minutes</li>
                <li>• Links can only be used once</li>
                <li>• Make sure you're using the latest link from your email</li>
              </ul>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default VerifyLogin;