import React from "react";
import { Link } from "react-router-dom";

const Register = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
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

          <button className="w-1/2 bg-black text-white py-2 rounded-lg">
            Attendee
          </button>

          <button className="w-1/2 border border-gray-300 py-2 rounded-lg">
            Organizer
          </button>

        </div>

        {/* Full Name */}

        <label className="block font-semibold mb-2">
          Full Name
        </label>

        <input
          type="text"
          placeholder="Enter your full name"
          className="w-full border border-gray-300 rounded-lg p-3 mb-4"
        />

        {/* Email */}

        <label className="block font-semibold mb-2">
          Email
        </label>

        <input
          type="email"
          placeholder="Enter your email"
          className="w-full border border-gray-300 rounded-lg p-3 mb-4"
        />

        {/* Phone */}

        <label className="block font-semibold mb-2">
          Phone Number
        </label>

        <input
          type="text"
          placeholder="Enter your phone number"
          className="w-full border border-gray-300 rounded-lg p-3 mb-4"
        />

        {/* Password */}

        <label className="block font-semibold mb-2">
          Password
        </label>

        <input
          type="password"
          placeholder="Create a password"
          className="w-full border border-gray-300 rounded-lg p-3 mb-4"
        />

        {/* Confirm Password */}

        <label className="block font-semibold mb-2">
          Confirm Password
        </label>

        <input
          type="password"
          placeholder="Confirm your password"
          className="w-full border border-gray-300 rounded-lg p-3 mb-6"
        />

        {/* Sign Up Button */}

        <button className="w-full bg-black text-white py-3 rounded-lg hover:bg-gray-800">
          Sign Up
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