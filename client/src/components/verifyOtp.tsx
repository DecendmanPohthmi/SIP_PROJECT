import React from "react";
import { useLocation, Link } from "react-router-dom";
import { BsCheckCircleFill, BsHourglassSplit, BsArrowRight } from "react-icons/bs";

const OtpValidator = () => {
  const location = useLocation();

  // Passed from Register.tsx via navigate("/verify", { state: { email, role } })
  const state = location.state as {
    email?: string;
    role?: "attendee" | "organizer" | "organiser";
  } | null;
  
  const role = state?.role || "attendee";
  const isOrganizer = role === "organizer" || role === "organiser";

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 py-8">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-lg border border-slate-100 text-center">
        
        {isOrganizer ? (
          <>
            <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center text-2xl mx-auto mb-5 shadow-sm">
              <BsHourglassSplit />
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 mb-2">
              Application Under Review
            </h1>

            <p className="text-sm text-slate-500 mb-8 leading-relaxed">
              Thank you for registering as an organizer on <span className="font-semibold text-slate-700">EventNest</span>. Our admin team will review and approve your profile shortly. You will be able to log in once approved.
            </p>

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-8 text-xs text-amber-800 text-left">
              <span className="font-bold block mb-1">What happens next?</span>
              Once our team verifies your credentials, your dashboard access will be unlocked.
            </div>
          </>
        ) : (
          <>
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-3xl mx-auto mb-5 shadow-sm">
              <BsCheckCircleFill />
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 mb-2">
              Welcome to EventNest!
            </h1>

            <p className="text-sm text-slate-500 mb-8 leading-relaxed">
              Your account has been successfully created. You can now explore, book, and enjoy amazing events near you.
            </p>
          </>
        )}

        <Link
          to="/login"
          className="w-full inline-flex items-center justify-center gap-2 bg-slate-900 text-white py-3 rounded-xl text-sm font-semibold hover:bg-slate-800 transition-all shadow-md"
        >
          Proceed to Login <BsArrowRight size={16} />
        </Link>

        <div className="mt-6">
          <Link
            to="/register"
            className="text-xs text-slate-400 hover:text-slate-600 transition-colors"
          >
            Back to Register
          </Link>
        </div>

      </div>
    </div>
  );
};

export default OtpValidator;