import React from "react";
import { Link } from "react-router-dom";
import {
  BsPeople,
  BsCalendarCheck,
  BsArrowRight,
  BsShieldCheck,
  BsHourglassSplit,
} from "react-icons/bs";

const AdminHome = () => {
  return (
    <div className="min-h-screen bg-slate-50/50">
      {/* Hero */}
      <div className="relative m-6 bg-gradient-to-br from-indigo-900 via-purple-900 to-violet-950 text-white rounded-2xl overflow-hidden shadow-lg border border-indigo-950/40">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_top_right,white,transparent_60%)]" />

        <div className="relative p-8 md:p-12 z-10">
          <span className="bg-white/10 text-indigo-200 px-3 py-1 rounded-full text-xs font-bold tracking-widest uppercase mb-4 inline-flex items-center gap-1.5">
            <BsShieldCheck size={13} />
            Admin Control Room
          </span>
          <h1 className="text-3xl md:text-4xl font-black mb-3 leading-tight tracking-tight">
            Keep EventNest Trustworthy
          </h1>
          <p className="text-indigo-200 text-base max-w-xl leading-relaxed">
            Every organiser and every event passes through you before it
            reaches the public. Here's what's waiting on your review.
          </p>
        </div>
      </div>

      {/* Pending overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mx-6 mb-10">
        <Link
          to="/admin/dashboard"
          className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between hover:-translate-y-0.5 hover:shadow-md transition-all duration-300"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-xl">
              <BsPeople />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800">—</p>
              <p className="text-sm text-slate-500">Organisers awaiting review</p>
            </div>
          </div>
          <BsArrowRight className="text-slate-300" size={20} />
        </Link>

        <Link
          to="/admin/dashboard"
          className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between hover:-translate-y-0.5 hover:shadow-md transition-all duration-300"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center text-xl">
              <BsCalendarCheck />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800">—</p>
              <p className="text-sm text-slate-500">Events awaiting review</p>
            </div>
          </div>
          <BsArrowRight className="text-slate-300" size={20} />
        </Link>
      </div>

      {/* Guidance */}
      <div className="mx-6 mb-14 bg-white border border-slate-100 rounded-2xl shadow-sm p-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center">
            <BsHourglassSplit size={18} />
          </div>
          <h2 className="text-lg font-bold text-slate-800">How review works</h2>
        </div>
        <ol className="text-sm text-slate-500 leading-relaxed space-y-2 list-decimal list-inside">
          <li>New organisers register and sit as pending until you approve them.</li>
          <li>Approved organisers can submit events, which also start pending.</li>
          <li>Rejecting either asks for a reason, which is shown to the applicant.</li>
        </ol>
        <Link
          to="/admin/dashboard"
          className="inline-flex items-center gap-2 mt-6 bg-[#49557E] text-white text-sm font-semibold px-6 py-2.5 rounded-full hover:bg-[#3c4768] transition-colors"
        >
          Go to Dashboard
          <BsArrowRight size={15} />
        </Link>
      </div>
    </div>
  );
};

export default AdminHome;