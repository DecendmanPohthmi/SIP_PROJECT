import React from "react";
import {
  BsClockHistory,
  BsBroadcast,
  BsCheckCircleFill,
  BsXCircleFill,
  BsCheckCircle,
  BsXCircle,
  BsTrash,
  BsCashStack,
  BsBarChartFill,
  BsMusicNoteBeamed,
  BsLaptop,
  BsPalette,
  BsTrophy,
} from "react-icons/bs";

const AdminEvents = () => {
  return (
    <div className="max-w-7xl mx-auto mt-8 px-6 pb-16">

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800">Events</h1>
        <p className="text-slate-500 mt-1">Review, monitor, and manage all events on the platform.</p>
      </div>

      {/* Top Earning Categories */}
      <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-6 mb-8">
        <div className="flex items-center gap-2 mb-5">
          <BsBarChartFill className="text-indigo-500" size={18} />
          <h2 className="text-lg font-bold text-slate-800">Top Earning Categories</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="flex items-center gap-4 p-4 rounded-xl bg-indigo-50 border border-indigo-100">
            <div className="w-11 h-11 rounded-full bg-indigo-600 text-white flex items-center justify-center">
              <BsMusicNoteBeamed size={18} />
            </div>
            <div>
              <p className="font-bold text-slate-800">Music</p>
              <p className="text-sm text-slate-500">₹2,14,800 earned</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100">
            <div className="w-11 h-11 rounded-full bg-slate-500 text-white flex items-center justify-center">
              <BsLaptop size={18} />
            </div>
            <div>
              <p className="font-bold text-slate-800">Technology</p>
              <p className="text-sm text-slate-500">₹1,48,300 earned</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100">
            <div className="w-11 h-11 rounded-full bg-rose-400 text-white flex items-center justify-center">
              <BsPalette size={18} />
            </div>
            <div>
              <p className="font-bold text-slate-800">Arts & Culture</p>
              <p className="text-sm text-slate-500">₹67,900 earned</p>
            </div>
          </div>
        </div>
      </div>

      {/* Status Tabs */}
      <div className="flex gap-2 mb-6 border-b border-slate-200 flex-wrap">
        <button className="flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 border-black text-black">
          <BsClockHistory size={16} />
          Pending
          <span className="bg-slate-100 text-slate-600 text-xs font-bold px-2 py-0.5 rounded-full">3</span>
        </button>

        <button className="flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 border-transparent text-slate-500 hover:text-slate-800">
          <BsBroadcast size={16} className="text-emerald-500" />
          Live
          <span className="bg-slate-100 text-slate-600 text-xs font-bold px-2 py-0.5 rounded-full">18</span>
        </button>

        <button className="flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 border-transparent text-slate-500 hover:text-slate-800">
          <BsCheckCircleFill size={16} className="text-indigo-500" />
          Completed
          <span className="bg-slate-100 text-slate-600 text-xs font-bold px-2 py-0.5 rounded-full">42</span>
        </button>

        <button className="flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 border-transparent text-slate-500 hover:text-slate-800">
          <BsXCircleFill size={16} className="text-red-500" />
          Rejected
          <span className="bg-slate-100 text-slate-600 text-xs font-bold px-2 py-0.5 rounded-full">5</span>
        </button>
      </div>

      {/* Pending Events */}
      <div className="space-y-4 mb-10">

        <div className="bg-white border border-slate-100 rounded-xl shadow-sm p-5 flex items-center justify-between flex-wrap gap-4">
          <div>
            <p className="font-bold text-slate-800">Tech Conference 2026</p>
            <p className="text-sm text-slate-500">15 August 2026 · Convention Hall, Shillong</p>
            <p className="text-sm text-slate-400">by Shillong Events Co.</p>
          </div>
          <div className="flex gap-2">
            <button className="flex items-center gap-1.5 bg-emerald-50 text-emerald-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-100">
              <BsCheckCircle size={14} /> Approve
            </button>
            <button className="flex items-center gap-1.5 bg-red-50 text-red-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-100">
              <BsXCircle size={14} /> Reject
            </button>
          </div>
        </div>

        <div className="bg-white border border-slate-100 rounded-xl shadow-sm p-5 flex items-center justify-between flex-wrap gap-4">
          <div>
            <p className="font-bold text-slate-800">Music Festival</p>
            <p className="text-sm text-slate-500">20 October 2026 · Shillong Stadium, Shillong</p>
            <p className="text-sm text-slate-400">by Northeast Music Fest</p>
          </div>
          <div className="flex gap-2">
            <button className="flex items-center gap-1.5 bg-emerald-50 text-emerald-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-100">
              <BsCheckCircle size={14} /> Approve
            </button>
            <button className="flex items-center gap-1.5 bg-red-50 text-red-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-100">
              <BsXCircle size={14} /> Reject
            </button>
          </div>
        </div>

      </div>

      {/* Rejected Events (with delete option) */}
      <div className="mb-4">
        <h2 className="text-lg font-bold text-slate-800 mb-4">Rejected Events</h2>
      </div>

      <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden mb-10">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-500 uppercase text-xs tracking-wide">
            <tr>
              <th className="px-5 py-3">Event</th>
              <th className="px-5 py-3">Organiser</th>
              <th className="px-5 py-3">Rejection Reason</th>
              <th className="px-5 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            <tr>
              <td className="px-5 py-4 font-semibold text-slate-800">Underground Rave Night</td>
              <td className="px-5 py-4 text-slate-500">Party Central</td>
              <td className="px-5 py-4 text-slate-500">Missing venue safety permit</td>
              <td className="px-5 py-4 text-right">
                <button className="text-red-500 hover:text-red-700">
                  <BsTrash size={16} />
                </button>
              </td>
            </tr>

            <tr>
              <td className="px-5 py-4 font-semibold text-slate-800">Crypto Investment Seminar</td>
              <td className="px-5 py-4 text-slate-500">FinGrow Events</td>
              <td className="px-5 py-4 text-slate-500">Flagged as potential scam content</td>
              <td className="px-5 py-4 text-right">
                <button className="text-red-500 hover:text-red-700">
                  <BsTrash size={16} />
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Live / Completed Events Table (earnings per event) */}
      <div className="mb-4">
        <h2 className="text-lg font-bold text-slate-800 mb-4">All Live & Completed Events</h2>
      </div>

      <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-500 uppercase text-xs tracking-wide">
            <tr>
              <th className="px-5 py-3">Event</th>
              <th className="px-5 py-3">Category</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3">Tickets Sold</th>
              <th className="px-5 py-3">Earnings</th>
              <th className="px-5 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            <tr>
              <td className="px-5 py-4 font-semibold text-slate-800">Winter Beats Live</td>
              <td className="px-5 py-4 text-slate-500">Music</td>
              <td className="px-5 py-4">
                <span className="bg-emerald-50 text-emerald-700 text-xs font-semibold px-2.5 py-1 rounded-full">Live</span>
              </td>
              <td className="px-5 py-4 text-slate-500">840 / 1000</td>
              <td className="px-5 py-4 font-semibold text-emerald-600 flex items-center gap-1">
                <BsCashStack size={14} /> ₹84,000
              </td>
              <td className="px-5 py-4 text-right">
                <button className="text-red-500 hover:text-red-700">
                  <BsTrash size={16} />
                </button>
              </td>
            </tr>

            <tr>
              <td className="px-5 py-4 font-semibold text-slate-800">AI & Future Tech Summit</td>
              <td className="px-5 py-4 text-slate-500">Technology</td>
              <td className="px-5 py-4">
                <span className="bg-indigo-50 text-indigo-700 text-xs font-semibold px-2.5 py-1 rounded-full">Completed</span>
              </td>
              <td className="px-5 py-4 text-slate-500">500 / 500</td>
              <td className="px-5 py-4 font-semibold text-emerald-600 flex items-center gap-1">
                <BsCashStack size={14} /> ₹1,00,000
              </td>
              <td className="px-5 py-4 text-right">
                <button className="text-red-500 hover:text-red-700">
                  <BsTrash size={16} />
                </button>
              </td>
            </tr>

            <tr>
              <td className="px-5 py-4 font-semibold text-slate-800">Local Art Walk</td>
              <td className="px-5 py-4 text-slate-500">Arts & Culture</td>
              <td className="px-5 py-4">
                <span className="bg-indigo-50 text-indigo-700 text-xs font-semibold px-2.5 py-1 rounded-full">Completed</span>
              </td>
              <td className="px-5 py-4 text-slate-500">220 / 250</td>
              <td className="px-5 py-4 font-semibold text-emerald-600 flex items-center gap-1">
                <BsCashStack size={14} /> ₹22,000
              </td>
              <td className="px-5 py-4 text-right">
                <button className="text-red-500 hover:text-red-700">
                  <BsTrash size={16} />
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

    </div>
  );
};

export default AdminEvents;