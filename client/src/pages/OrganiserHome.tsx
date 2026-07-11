import React from "react";
import { Link } from "react-router-dom";
import {
  BsCashStack,
  BsGraphUpArrow,
  BsShieldCheck,
  BsSpeedometer2,
  BsMegaphone,
  BsCheckCircleFill,
  BsArrowRight,
} from "react-icons/bs";

const OrganiserHome = () => {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50/50">

      {/* Hero Section */}
      <div className="relative m-6 bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 text-white rounded-2xl overflow-hidden shadow-lg border border-slate-800">
        <div className="relative p-8 md:p-16 text-center flex flex-col items-center z-10">
          <span className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-3 py-1 rounded-full text-xs font-bold tracking-widest uppercase mb-4 shadow-md">
            For Organisers
          </span>

          <h1 className="text-3xl md:text-5xl font-black mb-4 leading-tight tracking-tight">
            Host Events That <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
              Actually Fill Up
            </span>
          </h1>

          <p className="text-slate-300 text-base md:text-lg mb-8 max-w-xl mx-auto font-light leading-relaxed">
            From ticketing to check-ins, EventNest gives you everything you need to plan, promote, and profit from your events.
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            <Link
              to="/register"
              className="bg-white text-slate-900 px-8 py-3 rounded-full font-semibold hover:bg-slate-100 transition-colors flex items-center gap-2"
            >
              Start Hosting <BsArrowRight size={16} />
            </Link>
            <Link
              to="/login"
              className="border border-slate-600 text-white px-8 py-3 rounded-full font-semibold hover:bg-white/5 transition-colors"
            >
              I Already Have an Account
            </Link>
          </div>
        </div>
      </div>

      {/* Why Host With Us */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mx-6 mb-14">

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col items-center text-center hover:-translate-y-1 hover:shadow-md transition-all duration-300">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center text-lg mb-4 shadow-md bg-emerald-500 text-white shadow-emerald-200">
            <BsCashStack />
          </div>
          <h3 className="text-lg font-bold text-slate-800 mb-2">Get Paid Fast</h3>
          <p className="text-slate-500 text-sm leading-relaxed">Track every ticket sale in real time and see your earnings roll in as your event fills up.</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col items-center text-center hover:-translate-y-1 hover:shadow-md transition-all duration-300">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center text-lg mb-4 shadow-md bg-indigo-600 text-white shadow-indigo-200">
            <BsSpeedometer2 />
          </div>
          <h3 className="text-lg font-bold text-slate-800 mb-2">Simple Dashboard</h3>
          <p className="text-slate-500 text-sm leading-relaxed">Manage every event, ticket, and attendee from one clean dashboard — no spreadsheets needed.</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col items-center text-center hover:-translate-y-1 hover:shadow-md transition-all duration-300">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center text-lg mb-4 shadow-md bg-amber-500 text-white shadow-amber-200">
            <BsMegaphone />
          </div>
          <h3 className="text-lg font-bold text-slate-800 mb-2">Built-In Reach</h3>
          <p className="text-slate-500 text-sm leading-relaxed">Your event gets listed where people are already searching for things to do nearby.</p>
        </div>

      </div>

      {/* How It Works */}
      <div className="mx-6 mb-14">
        <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight mb-6 text-center">
          How It Works
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">

          <div className="text-center">
            <div className="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold mx-auto mb-3">
              1
            </div>
            <p className="font-semibold text-slate-800 mb-1">Sign Up</p>
            <p className="text-sm text-slate-500">Register as an organiser in under two minutes.</p>
          </div>

          <div className="text-center">
            <div className="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold mx-auto mb-3">
              2
            </div>
            <p className="font-semibold text-slate-800 mb-1">Get Verified</p>
            <p className="text-sm text-slate-500">Our team reviews your application, usually within 24 hours.</p>
          </div>

          <div className="text-center">
            <div className="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold mx-auto mb-3">
              3
            </div>
            <p className="font-semibold text-slate-800 mb-1">Create Your Event</p>
            <p className="text-sm text-slate-500">Add details, set capacity, and publish for approval.</p>
          </div>

          <div className="text-center">
            <div className="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold mx-auto mb-3">
              4
            </div>
            <p className="font-semibold text-slate-800 mb-1">Start Selling</p>
            <p className="text-sm text-slate-500">Once approved, your event goes live for attendees to book.</p>
          </div>

        </div>
      </div>

      {/* Trust / Stats Strip */}
      <div className="bg-slate-900 text-white mx-6 rounded-2xl p-8 mb-14">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div>
            <p className="text-3xl font-black">27+</p>
            <p className="text-sm text-slate-400">Active Organisers</p>
          </div>
          <div>
            <p className="text-3xl font-black">180+</p>
            <p className="text-sm text-slate-400">Events Hosted</p>
          </div>
          <div>
            <p className="text-3xl font-black">₹4.8L+</p>
            <p className="text-sm text-slate-400">Paid Out To Organisers</p>
          </div>
          <div>
            <p className="text-3xl font-black">3,200+</p>
            <p className="text-sm text-slate-400">Tickets Sold</p>
          </div>
        </div>
      </div>

      {/* What You Get */}
      <div className="mx-6 mb-14 bg-white border border-slate-100 rounded-2xl shadow-sm p-8">
        <h2 className="text-xl font-bold text-slate-800 mb-6">Everything included, no hidden fees</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex items-center gap-3">
            <BsCheckCircleFill className="text-emerald-500 flex-shrink-0" />
            <span className="text-slate-600 text-sm">Real-time ticket sales tracking</span>
          </div>
          <div className="flex items-center gap-3">
            <BsCheckCircleFill className="text-emerald-500 flex-shrink-0" />
            <span className="text-slate-600 text-sm">Automated email confirmations</span>
          </div>
          <div className="flex items-center gap-3">
            <BsCheckCircleFill className="text-emerald-500 flex-shrink-0" />
            <span className="text-slate-600 text-sm">Capacity & seat management</span>
          </div>
          <div className="flex items-center gap-3">
            <BsCheckCircleFill className="text-emerald-500 flex-shrink-0" />
            <span className="text-slate-600 text-sm">Event performance analytics</span>
          </div>
          <div className="flex items-center gap-3">
            <BsCheckCircleFill className="text-emerald-500 flex-shrink-0" />
            <span className="text-slate-600 text-sm">Verified organiser badge</span>
          </div>
          <div className="flex items-center gap-3">
            <BsCheckCircleFill className="text-emerald-500 flex-shrink-0" />
            <span className="text-slate-600 text-sm">Priority support</span>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="mx-6 mb-16 text-center bg-gradient-to-br from-indigo-900 via-purple-900 to-violet-950 text-white rounded-2xl p-10">
        <BsShieldCheck size={32} className="mx-auto mb-4 text-indigo-300" />
        <h2 className="text-2xl font-bold mb-3">Ready to host your first event?</h2>
        <p className="text-indigo-200 mb-6 max-w-md mx-auto">
          Join organisers already growing their audience through EventNest.
        </p>
        <Link
          to="/register"
          className="inline-flex items-center gap-2 bg-white text-slate-900 px-8 py-3 rounded-full font-semibold hover:bg-slate-100 transition-colors"
        >
          Become an Organiser <BsArrowRight size={16} />
        </Link>
      </div>

    </div>
  );
};

export default OrganiserHome;