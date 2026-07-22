import React, { useState, useRef } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";

// Declare API globally for the component
const API = (import.meta as any).env?.VITE_API_URL || "http://localhost:4000";

const OtpValidator = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Passed from Register.tsx via navigate("/verify-otp", { state: { email, role } })
  const state = location.state as {
    email?: string;
    role?: "attendee" | "organizer";
  } | null;
  const email = state?.email || "";
  const role = state?.role || "attendee";

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (index: number, value: string) => {
    if (!/^[0-9]?$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    setError("");

    const otpCode = otp.join("");

    if (otpCode.length !== 6) {
      setError("Please enter the full 6-digit code.");
      return;
    }

    if (!email) {
      setError("Missing email. Please register again.");
      return;
    }

    const endpoint =
      role === "attendee"
        ? `${API}/api/user/verify`
        : `${API}/api/organiser/verify`;

    try {
      setLoading(true);

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp: otpCode }),
      });

      const data = await res.json();

      if (!data.success) {
        throw new Error(data.message || "Verification failed");
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("role", role === "attendee" ? "user" : "organiser");

      navigate(role === "attendee" ? "/" : "/dashboard");
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError("");

    if (!email) {
      setError("Missing email. Please register again.");
      return;
    }

    const endpoint =
      role === "attendee"
        ? `${API}/api/user/register`
        : `${API}/api/organiser/register`;

    try {
      setResending(true);

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!data.success) {
        throw new Error(data.message || "Could not resend OTP");
      }

      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } catch (err: any) {
      setError(err.message || "Something went wrong while resending.");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-lg">
        <h1 className="text-3xl font-bold text-center mb-2">
          Verify Your Email
        </h1>

        <p className="text-center text-gray-500 mb-8">
          Enter the 6-digit code sent to{" "}
          <span className="font-medium text-gray-700">
            {email || "your email"}
          </span>
        </p>

        {/* OTP Boxes */}
        <div className="flex justify-center gap-3 mb-6">
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={(el) => {
                inputRefs.current[index] = el;
              }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              className="w-12 h-14 text-center text-xl font-bold border border-gray-300 rounded-lg focus:outline-none focus:border-black"
            />
          ))}
        </div>

        {error && (
          <p className="text-red-500 text-sm text-center mb-4">{error}</p>
        )}

        {/* Verify Button */}
        <button
          onClick={handleVerify}
          disabled={loading}
          className="w-full bg-black text-white py-3 rounded-lg hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {loading ? "Verifying..." : "Verify & Continue"}
        </button>

        <p className="text-center mt-6 text-sm text-gray-500">
          Didn't get the code?{" "}
          <button
            onClick={handleResend}
            disabled={resending}
            className="text-blue-600 font-semibold disabled:text-gray-400"
          >
            {resending ? "Resending..." : "Resend OTP"}
          </button>
        </p>

        <p className="text-center mt-4">
          <Link
            to="/register"
            className="text-gray-500 text-sm hover:underline"
          >
            Back to Register
          </Link>
        </p>
      </div>
    </div>
  );
};

export default OtpValidator;