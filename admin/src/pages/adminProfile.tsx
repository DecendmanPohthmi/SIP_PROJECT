import React from "react";
import { Link } from "react-router-dom";
import {
  BsPerson,
  BsGrid,
  BsBoxArrowRight,
  BsPencilSquare,
  BsEnvelope,
  BsShieldLock,
  BsPeople,
  BsCalendarCheck,
} from "react-icons/bs";

const AdminProfile = () => {
  return (
    <div className="min-h-screen bg-slate-50/50">
      <div className="max-w-7xl mx-auto mt-8 px-6 pb-16 grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Main content */}
        <div className="md:col-span-3 space-y-6">
          {/* Header card */}
          <div className="bg-slate-950 rounded-2xl shadow-sm p-8 flex items-center justify-between flex-wrap gap-6">
            <div className="flex items-center gap-5">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-900 via-purple-900 to-violet-950 flex items-center justify-center text-white text-2xl font-bold">
                <BsShieldLock size={28} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Admin Account</h1>
                <p className="text-sm text-slate-400">Administrator · EventNest</p>
              </div>
            </div>

            <button className="flex items-center gap-2 border border-slate-700 text-slate-200 px-5 py-2.5 rounded-full text-sm font-medium hover:bg-white/5 transition-colors">
              <BsPencilSquare size={16} />
              Edit Profile
            </button>
          </div>

          {/* Quick stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-6 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-xl">
                <BsPeople />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-800">—</p>
                <p className="text-sm text-slate-500">Organisers Approved</p>
              </div>
            </div>

            <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-6 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-xl">
                <BsCalendarCheck />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-800">—</p>
                <p className="text-sm text-slate-500">Events Approved</p>
              </div>
            </div>
          </div>

          {/* Account details */}
          <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-8">
            <h2 className="text-lg font-bold text-slate-800 mb-6">Account Details</h2>

            <div className="space-y-5">
              <div className="flex items-center gap-4 pb-5 border-b border-slate-100">
                <div className="w-10 h-10 rounded-lg bg-slate-50 text-[#49557E] flex items-center justify-center">
                  <BsPerson size={18} />
                </div>
                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-wide">Full Name</p>
                  <p className="text-base text-slate-800 font-medium">Admin User</p>
                </div>
              </div>

              <div className="flex items-center gap-4 pb-5 border-b border-slate-100">
                <div className="w-10 h-10 rounded-lg bg-slate-50 text-[#49557E] flex items-center justify-center">
                  <BsEnvelope size={18} />
                </div>
                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-wide">Email Address</p>
                  <p className="text-base text-slate-800 font-medium">admin@eventnest.com</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-slate-50 text-[#49557E] flex items-center justify-center">
                  <BsShieldLock size={18} />
                </div>
                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-wide">Role</p>
                  <p className="text-base text-slate-800 font-medium">Administrator</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="md:col-span-1 bg-white border border-slate-100 rounded-2xl shadow-sm p-4 h-fit">
          <nav className="flex flex-col gap-1">
            <Link
              to="/admin/dashboard"
              className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm text-[#49557E] hover:bg-slate-50 transition-colors"
            >
              <BsGrid size={18} />
              Dashboard
            </Link>

            <Link
              to="/admin/profile"
              className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm bg-[#fff4f2] text-[#FF4C24] font-semibold transition-colors"
            >
              <BsPerson size={18} />
              My Profile
            </Link>

            <hr className="my-2 border-slate-100" />

            <button
              onClick={() => {}}
              className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm text-red-500 hover:bg-red-50 transition-colors"
            >
              <BsBoxArrowRight size={18} />
              Logout
            </button>
          </nav>
        </div>
      </div>
    </div>
  );
};

export default AdminProfile;