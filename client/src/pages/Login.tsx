import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [role, setRole] = useState<"attendee" | "organizer">("attendee");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setError("");

    if (!email || !password) {
      setError("Please fill in all required fields.");
      return;
    }

    const endpoint =
      role === "attendee"
        ? "http://localhost:4000/api/user/login"
        : "http://localhost:4000/api/organiser/login";

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

      const storedRole = role === "attendee" ? "user" : "organiser";
      login(data.token, storedRole);

      navigate(storedRole === "user" ? "/" : "/");
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-lg">

        <h1 className="text-3xl font-bold text-center mb-2">
          Welcome Back
        </h1>

        <p className="text-center text-gray-500 mb-6">
          Login to your EventHub account
        </p>

        <label className="block font-semibold mb-2">
          Login As
        </label>

        <div className="flex gap-4 mb-6">
          <button
            type="button"
            onClick={() => setRole("attendee")}
            className={`w-1/2 py-2 rounded-lg border transition-colors ${
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
            className={`w-1/2 py-2 rounded-lg border transition-colors ${
              role === "organizer"
                ? "bg-black text-white border-black"
                : "border-gray-300 text-gray-700"
            }`}
          >
            Organizer
          </button>
        </div>

        <label className="block font-semibold mb-2">
          Email
        </label>

        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          className="w-full border border-gray-300 rounded-lg p-3 mb-4"
        />

        <label className="block font-semibold mb-2">
          Password
        </label>

        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter your password"
          className="w-full border border-gray-300 rounded-lg p-3 mb-2"
        />

        {error && (
          <p className="text-red-500 text-sm mb-4">{error}</p>
        )}

        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full bg-black text-white py-3 rounded-lg hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed mt-4"
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        <p className="text-center mt-6">
          Don't have an account?{" "}
          <Link
            to="/register"
            className="text-blue-600 font-semibold"
          >
            Sign Up
          </Link>
        </p>

      </div>
    </div>
  );
};

export default Login;