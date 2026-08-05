import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const API = (import.meta as any).env?.VITE_API_URL || "http://localhost:4000";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [role, setRole] = useState<"attendee" | "organizer">("attendee");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please fill in all required fields.");
      return;
    }

    const endpoint =
      role === "attendee"
        ? `${API}/api/user/login`
        : `${API}/api/organiser/login`;

    try {
      setLoading(true);

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!data.success) {
        throw new Error(data.message || "Login failed");
      }

      const storedRole = role === "attendee" ? "attendee" : "organiser";
      login(data.token, storedRole);

      navigate("/");
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-8 sm:py-12 bg-gray-50 sm:bg-gray-100">
      <div className="w-full max-w-md bg-white p-6 sm:p-8 rounded-2xl shadow-sm sm:shadow-lg border border-slate-100">

        <h1 className="text-2xl sm:text-3xl font-bold text-center text-slate-800 mb-1">
          Welcome Back
        </h1>

        <p className="text-center text-slate-500 text-sm sm:text-base mb-6">
          Login to your EventHub account
        </p>

        <form onSubmit={handleLogin}>
          <label className="block font-semibold mb-2 text-slate-700 text-sm sm:text-base">
            Login As
          </label>

          <div className="flex gap-3 sm:gap-4 mb-5">
            <button
              type="button"
              onClick={() => setRole("attendee")}
              className={`w-1/2 py-2.5 rounded-lg border font-medium text-sm sm:text-base transition-colors ${
                role === "attendee"
                  ? "bg-black text-white border-black"
                  : "border-gray-300 text-gray-700"
              }`}
            >
              Attendee
            </button>

            <button
              type="button"
              onClick={() => setRole("organizer")}
              className={`w-1/2 py-2.5 rounded-lg border font-medium text-sm sm:text-base transition-colors ${
                role === "organizer"
                  ? "bg-black text-white border-black"
                  : "border-gray-300 text-gray-700"
              }`}
            >
              Organizer
            </button>
          </div>

          <label className="block font-semibold mb-2 text-slate-700 text-sm sm:text-base">
            Email
          </label>

          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            className="w-full border border-gray-300 rounded-lg p-3 text-sm sm:text-base mb-4 focus:outline-none focus:border-slate-800"
          />

          <label className="block font-semibold mb-2 text-slate-700 text-sm sm:text-base">
            Password
          </label>

          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            className="w-full border border-gray-300 rounded-lg p-3 text-sm sm:text-base mb-2 focus:outline-none focus:border-slate-800"
          />

          {error && (
            <p className="text-red-500 text-xs sm:text-sm my-2">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white py-3 sm:py-3.5 rounded-lg font-semibold text-sm sm:text-base hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors mt-4"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="text-center text-xs sm:text-sm text-slate-600 mt-6">
          Don't have an account?{" "}
          <Link
            to="/register"
            className="text-blue-600 font-semibold hover:underline"
          >
            Sign Up
          </Link>
        </p>

      </div>
    </div>
  );
};

export default Login;