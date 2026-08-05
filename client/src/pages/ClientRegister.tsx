import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const API = (import.meta as any).env?.VITE_API_URL || "http://localhost:4000";

const Register = () => {
  const navigate = useNavigate();

  const [role, setRole] = useState<"attendee" | "organizer">("attendee");
  const [fullName, setFullName] = useState("");
  const [organisationName, setOrganisationName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError("");

    if (!fullName || !email || !phone || !password || !confirmPassword) {
      setError("Please fill in all required fields.");
      return;
    }

    if (role === "organizer" && !organisationName) {
      setError("Please enter your organisation name.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    const endpoint =
      role === "attendee"
        ? `${API}/api/user/register`
        : `${API}/api/organiser/register`;

    const body =
      role === "attendee"
        ? { full_name: fullName, email, phone, password }
        : { full_name: fullName, organisation_name: organisationName, email, phone, password };

    try {
      setLoading(true);

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!data.success) {
        throw new Error(data.message || "Registration failed");
      }

      const storedRole = role === "attendee" ? "attendee" : "organiser";
      navigate("/verify", { state: { email, role: storedRole } });
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4 py-6 sm:py-12">
      <div className="w-full max-w-md bg-white p-5 sm:p-8 rounded-xl shadow-lg border border-slate-100">

        <h1 className="text-2xl sm:text-3xl font-bold text-center mb-1 sm:mb-2 text-slate-800">
          Create Account
        </h1>

        <p className="text-center text-xs sm:text-sm text-gray-500 mb-5 sm:mb-6">
          Join EventNest today
        </p>

        <form onSubmit={handleRegister}>
          <label className="block text-xs sm:text-sm font-semibold mb-2 text-slate-700">
            Register As
          </label>

          <div className="flex gap-3 sm:gap-4 mb-5 sm:mb-6">
            <button
              type="button"
              onClick={() => setRole("attendee")}
              className={`w-1/2 py-2.5 rounded-lg border text-xs sm:text-sm font-medium transition-colors ${
                role === "attendee"
                  ? "bg-black text-white border-black"
                  : "border-gray-300 text-gray-700 hover:bg-gray-50"
              }`}
            >
              Attendee
            </button>

            <button
              type="button"
              onClick={() => setRole("organizer")}
              className={`w-1/2 py-2.5 rounded-lg border text-xs sm:text-sm font-medium transition-colors ${
                role === "organizer"
                  ? "bg-black text-white border-black"
                  : "border-gray-300 text-gray-700 hover:bg-gray-50"
              }`}
            >
              Organizer
            </button>
          </div>

          <label className="block text-xs sm:text-sm font-semibold mb-1.5 text-slate-700">
            Full Name
          </label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Enter your full name"
            autoComplete="name"
            className="w-full border border-gray-300 rounded-lg p-2.5 sm:p-3 mb-4 text-xs sm:text-sm outline-none focus:border-black"
          />

          {role === "organizer" && (
            <>
              <label className="block text-xs sm:text-sm font-semibold mb-1.5 text-slate-700">
                Organisation Name
              </label>
              <input
                type="text"
                value={organisationName}
                onChange={(e) => setOrganisationName(e.target.value)}
                placeholder="Enter your organisation name"
                className="w-full border border-gray-300 rounded-lg p-2.5 sm:p-3 mb-4 text-xs sm:text-sm outline-none focus:border-black"
              />
            </>
          )}

          <label className="block text-xs sm:text-sm font-semibold mb-1.5 text-slate-700">
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            autoComplete="email"
            className="w-full border border-gray-300 rounded-lg p-2.5 sm:p-3 mb-4 text-xs sm:text-sm outline-none focus:border-black"
          />

          <label className="block text-xs sm:text-sm font-semibold mb-1.5 text-slate-700">
            Phone Number
          </label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Enter your phone number"
            autoComplete="tel"
            className="w-full border border-gray-300 rounded-lg p-2.5 sm:p-3 mb-4 text-xs sm:text-sm outline-none focus:border-black"
          />

          <label className="block text-xs sm:text-sm font-semibold mb-1.5 text-slate-700">
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Create a password"
            autoComplete="new-password"
            className="w-full border border-gray-300 rounded-lg p-2.5 sm:p-3 mb-4 text-xs sm:text-sm outline-none focus:border-black"
          />

          <label className="block text-xs sm:text-sm font-semibold mb-1.5 text-slate-700">
            Confirm Password
          </label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm your password"
            autoComplete="new-password"
            className="w-full border border-gray-300 rounded-lg p-2.5 sm:p-3 mb-2 text-xs sm:text-sm outline-none focus:border-black"
          />

          <p className="text-[11px] sm:text-xs text-gray-400 mb-4">
            Must be 8+ characters with uppercase, lowercase, number & symbol.
          </p>

          {error && (
            <p className="text-red-500 text-xs sm:text-sm mb-4">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white py-2.5 sm:py-3 rounded-lg text-xs sm:text-sm font-semibold hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? "Creating Account..." : "Sign Up"}
          </button>
        </form>

        <p className="text-center text-xs sm:text-sm text-gray-600 mt-5 sm:mt-6">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-blue-600 font-semibold hover:underline"
          >
            Login
          </Link>
        </p>

      </div>
    </div>
  );
};

export default Register;