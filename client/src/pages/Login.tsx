import React from "react";
import { Link } from "react-router-dom";

const Login = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-lg">

        <h1 className="text-3xl font-bold text-center mb-2">
          Welcome Back
        </h1>

        <p className="text-center text-gray-500 mb-6">
          Login to your EventHub account
        </p>

        {/* Login As */}
        <label className="block font-semibold mb-2">
          Login As
        </label>

        <div className="flex gap-4 mb-6">
          <button className="w-1/2 bg-black text-white py-2 rounded-lg">
            Attendee
          </button>

          <button className="w-1/2 border border-gray-300 py-2 rounded-lg">
            Organizer
          </button>
        </div>

        {/* Email */}
        <label className="block font-semibold mb-2">
          Email
        </label>

        <input
          type="email"
          placeholder="Enter your email"
          className="w-full border border-gray-300 rounded-lg p-3 mb-4"
        />

        {/* Password */}
        <label className="block font-semibold mb-2">
          Password
        </label>

        <input
          type="password"
          placeholder="Enter your password"
          className="w-full border border-gray-300 rounded-lg p-3 mb-6"
        />

        {/* Login Button */}
        <button className="w-full bg-black text-white py-3 rounded-lg hover:bg-gray-800">
          Login
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