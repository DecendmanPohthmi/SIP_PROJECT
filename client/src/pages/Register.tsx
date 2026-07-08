import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

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

  const handleRegister = async () => {
    setError("");

    if (!fullName || !email || !phone || !password || !confirmPassword) {
      setError("Please fill in all required fields.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    const endpoint =
      role === "attendee"
        ? "http://localhost:4000/api/user/register"
        : "http://localhost:4000/api/organiser/register";

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

      navigate("/verify-otp", { state: { email, role } });
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 py-10">
      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-lg">

        <h1 className="text-3xl font-bold text-center mb-2">
          Create Account
        </h1>

        <p className="text-center text-gray-500 mb-6">
          Join EventHub today
        </p>

        {/* Register As */}
        <label className="block font-semibold mb-2">
          Register As
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

        {/* Full Name */}
        <label className="block font-semibold mb-2">
          Full Name
        </label>

        <input
          type="text"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="Enter your full name"
          className="w-full border border-gray-300 rounded-lg p-3 mb-4"
        />

        {/* Organisation Name — only for organizer */}
        {role === "organizer" && (
          <>
            <label className="block font-semibold mb-2">
              Organisation Name
            </label>

            <input
              type="text"
              value={organisationName}
              onChange={(e) => setOrganisationName(e.target.value)}
              placeholder="Enter your organisation name"
              className="w-full border border-gray-300 rounded-lg p-3 mb-4"
            />
          </>
        )}

        {/* Email */}
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

        {/* Phone */}
        <label className="block font-semibold mb-2">
          Phone Number
        </label>

        <input
          type="text"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="Enter your phone number"
          className="w-full border border-gray-300 rounded-lg p-3 mb-4"
        />

        {/* Password */}
        <label className="block font-semibold mb-2">
          Password
        </label>

        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Create a password"
          className="w-full border border-gray-300 rounded-lg p-3 mb-4"
        />

        {/* Confirm Password */}
        <label className="block font-semibold mb-2">
          Confirm Password
        </label>

        <input
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Confirm your password"
          className="w-full border border-gray-300 rounded-lg p-3 mb-2"
        />

        <p className="text-xs text-gray-400 mb-4">
          Must be 8+ characters with uppercase, lowercase, number & symbol.
        </p>

        {error && (
          <p className="text-red-500 text-sm mb-4">{error}</p>
        )}

        {/* Sign Up Button */}
        <button
          onClick={handleRegister}
          disabled={loading}
          className="w-full bg-black text-white py-3 rounded-lg hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {loading ? "Sending OTP..." : "Sign Up"}
        </button>

        <p className="text-center mt-6">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-blue-600 font-semibold"
          >
            Login
          </Link>
        </p>

      </div>
    </div>
  );
};

export default Register;