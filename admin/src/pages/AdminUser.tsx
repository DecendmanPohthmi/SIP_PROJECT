import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import {
  BsPerson,
  BsTrophy,
  BsEnvelope,
  BsTelephone,
  BsTicketPerforated,
  BsSearch,
  BsPeopleFill,
  BsArrowRepeat,
  BsCheckCircle,
  BsXCircle,
} from "react-icons/bs";

type User = {
  user_id: number;
  full_name: string;
  email: string;
  phone: string;
  created_at: string;
  booking_count: number;
  total_spent: number;
};

type Stats = {
  total_users: number;
  total_bookings: number;
  total_spent: number;
};

const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || "http://localhost:4000";

const getInitials = (name: string) =>
  name
    ? name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "U";

const AdminUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [topUsers, setTopUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<Stats>({
    total_users: 0,
    total_bookings: 0,
    total_spent: 0,
  });

  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bannerMessage, setBannerMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const showBanner = (type: "success" | "error", text: string) => {
    setBannerMessage({ type, text });
    setTimeout(() => setBannerMessage(null), 4000);
  };

  const fetchDashboardData = useCallback(async (searchQuery: string = "", isBackground = false) => {
    try {
      if (!isBackground) setLoading(true);
      else setRefreshing(true);
      setError(null);

      const token = localStorage.getItem("token");

      const response = await axios.get(`${API_BASE_URL}/api/user/admin/users`, {
        params: { search: searchQuery },
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
        },
      });

      console.log("Admin Dashboard API Response:", response.data);

      if (response.data.success) {
        setUsers(response.data.users || []);
        setTopUsers(response.data.top_users || []);
        setStats(
          response.data.stats || {
            total_users: 0,
            total_bookings: 0,
            total_spent: 0,
          }
        );
      }
    } catch (err: any) {
      console.error("Error fetching admin users:", err);
      if (err.response) {
        console.error("Error Status:", err.response.status);
        console.error("Error Data:", err.response.data);
        const errMsg = err.response.data?.message || `Server Error (${err.response.status})`;
        setError(errMsg);
        if (isBackground) showBanner("error", errMsg);
      } else {
        const netMsg = "Unable to connect to the backend server.";
        setError(netMsg);
        if (isBackground) showBanner("error", netMsg);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData(search, false);

    const intervalId = setInterval(() => {
      fetchDashboardData(search, true);
    }, 30000);

    return () => clearInterval(intervalId);
  }, [search, fetchDashboardData]);

  const formatCurrency = (amount: number) =>
    `₹${Number(amount || 0).toLocaleString("en-IN")}`;

  const formatDate = (dateStr: string) =>
    dateStr
      ? new Date(dateStr).toLocaleDateString("en-GB", {
          day: "numeric",
          month: "short",
          year: "numeric",
        })
      : "-";

  return (
    <div className="p-4 sm:p-6 w-full overflow-x-hidden min-h-screen bg-slate-50/50 space-y-6">
      
      {/* Header & Refresh */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-800">Users</h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
            All registered attendees and your most active bookers.
          </p>
        </div>
        <button
          onClick={() => fetchDashboardData(search, false)}
          disabled={refreshing}
          className="flex items-center gap-1.5 sm:gap-2 bg-white border border-slate-200 px-3 sm:px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-all shadow-sm active:scale-95 flex-shrink-0"
        >
          <BsArrowRepeat className={`text-[#49557E] ${refreshing ? "animate-spin" : ""}`} size={14} />
          <span className="hidden xs:inline">{refreshing ? "Updating..." : "Refresh"}</span>
        </button>
      </div>

      {/* Banner message div for feedback */}
      {bannerMessage && (
        <div
          className={`px-4 py-3 rounded-xl text-xs sm:text-sm flex items-center gap-2 border shadow-sm transition-all animate-fadeIn ${
            bannerMessage.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : "bg-red-50 border-red-200 text-red-800"
          }`}
        >
          {bannerMessage.type === "success" ? <BsCheckCircle size={16} className="shrink-0 text-emerald-600" /> : <BsXCircle size={16} className="shrink-0 text-red-600" />}
          <span>{bannerMessage.text}</span>
        </div>
      )}

      {/* Error Alert */}
      {error && !bannerMessage && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-600 text-xs sm:text-sm rounded-xl">
          {error}
        </div>
      )}

      {/* Stat strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-3.5 sm:p-5 flex items-center gap-3 sm:gap-4">
          <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-[#49557E] text-white flex items-center justify-center text-base sm:text-lg flex-shrink-0">
            <BsPeopleFill />
          </div>
          <div className="min-w-0">
            <p className="text-xl sm:text-2xl font-bold text-[#49557E] truncate">{stats.total_users}</p>
            <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5 truncate">Total Users</p>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-3.5 sm:p-5 flex items-center gap-3 sm:gap-4">
          <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-[#49557E]/15 text-[#49557E] flex items-center justify-center text-base sm:text-lg flex-shrink-0">
            <BsTicketPerforated />
          </div>
          <div className="min-w-0">
            <p className="text-xl sm:text-2xl font-bold text-slate-800 truncate">
              {stats.total_bookings}
            </p>
            <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5 truncate">Total Bookings</p>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-3.5 sm:p-5 flex items-center gap-3 sm:gap-4">
          <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-[#49557E]/10 text-[#49557E] flex items-center justify-center text-base sm:text-lg flex-shrink-0">
            <BsTrophy />
          </div>
          <div className="min-w-0">
            <p className="text-xl sm:text-2xl font-bold text-slate-800 truncate">
              {formatCurrency(stats.total_spent)}
            </p>
            <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5 truncate">Total Spent by Users</p>
          </div>
        </div>
      </div>

      {/* Top 5 Most Active Users */}
      <div>
        <h2 className="text-sm sm:text-base font-bold text-slate-800 flex items-center gap-2 mb-3 sm:mb-4">
          <BsTrophy className="text-[#49557E]" size={16} />
          Top 5 Most Active Users
        </h2>

        {loading && topUsers.length === 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 animate-pulse">
                <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-slate-200 mb-3" />
                <div className="h-4 bg-slate-200 rounded w-3/4 mb-2" />
                <div className="h-3 bg-slate-100 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
            {topUsers.map((user, index) => (
              <div
                key={user.user_id}
                className="bg-white border border-slate-200 rounded-2xl shadow-sm p-4 sm:p-5 relative hover:shadow-md hover:-translate-y-0.5 transition-all duration-300"
              >
                <div
                  className={`absolute top-3.5 right-3.5 sm:top-4 sm:right-4 w-6 h-6 sm:w-7 sm:h-7 rounded-full text-[11px] sm:text-xs font-bold flex items-center justify-center ${
                    index === 0
                      ? "bg-[#49557E] text-white"
                      : "bg-[#49557E]/10 text-[#49557E]"
                  }`}
                >
                  #{index + 1}
                </div>

                <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-[#49557E]/15 text-[#49557E] flex items-center justify-center text-xs sm:text-sm font-bold mb-3">
                  {getInitials(user.full_name)}
                </div>

                <p className="font-semibold text-slate-800 text-xs sm:text-sm truncate">{user.full_name}</p>
                <p className="text-[11px] sm:text-xs text-slate-400 truncate mb-3">{user.email}</p>

                <div className="flex items-center justify-between text-xs sm:text-sm pt-3 border-t border-slate-100">
                  <span className="flex items-center gap-1.5 text-slate-500">
                    <BsTicketPerforated size={13} className="text-[#49557E]" />
                    {user.booking_count}
                  </span>
                  <span className="text-[11px] sm:text-xs font-semibold text-[#49557E]">
                    {formatCurrency(user.total_spent)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* All Users Header & Search */}
      <div className="flex items-center justify-between gap-3 flex-wrap pt-2">
        <h2 className="text-sm sm:text-base font-bold text-slate-800 flex items-center gap-2">
          <BsPerson className="text-[#49557E]" size={16} />
          All Users
        </h2>

        <div className="relative w-full sm:w-64">
          <BsSearch size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email..."
            className="w-full pl-9 pr-3.5 py-2.5 text-xs sm:text-sm rounded-xl sm:rounded-full border border-slate-200 focus:outline-none focus:border-[#49557E] transition-colors bg-slate-50/50"
          />
        </div>
      </div>

      {/* All Users Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-left text-slate-500 bg-slate-50/60 text-xs">
                <th className="px-4 sm:px-5 py-3 font-medium">User</th>
                <th className="px-4 sm:px-5 py-3 font-medium">Contact</th>
                <th className="px-4 sm:px-5 py-3 font-medium">Bookings</th>
                <th className="px-4 sm:px-5 py-3 font-medium">Spent</th>
                <th className="px-4 sm:px-5 py-3 font-medium">Joined</th>
              </tr>
            </thead>
            <tbody>
              {loading && users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center text-slate-400 text-xs">
                    Loading users...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-10 text-center text-slate-400 text-xs">
                    No users match your search.
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr
                    key={user.user_id}
                    className="border-b border-slate-50 last:border-0 hover:bg-[#49557E]/[0.03] transition-colors"
                  >
                    <td className="px-4 sm:px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#49557E]/15 text-[#49557E] flex items-center justify-center text-xs font-bold shrink-0">
                          {getInitials(user.full_name)}
                        </div>
                        <span className="font-medium text-slate-800 truncate max-w-[140px] sm:max-w-none">{user.full_name}</span>
                      </div>
                    </td>
                    <td className="px-4 sm:px-5 py-3 text-slate-500">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <BsEnvelope size={11} className="text-slate-400 shrink-0" />
                        <span className="text-[11px] sm:text-xs truncate max-w-[160px] sm:max-w-none">{user.email}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <BsTelephone size={11} className="text-slate-400 shrink-0" />
                        <span className="text-[11px] sm:text-xs">{user.phone || "N/A"}</span>
                      </div>
                    </td>
                    <td className="px-4 sm:px-5 py-3">
                      <span className="inline-flex items-center gap-1 bg-[#49557E]/10 text-[#49557E] text-[11px] sm:text-xs font-semibold px-2.5 py-1 rounded-full">
                        {user.booking_count}
                      </span>
                    </td>
                    <td className="px-4 sm:px-5 py-3 font-medium text-slate-700">
                      {formatCurrency(user.total_spent)}
                    </td>
                    <td className="px-4 sm:px-5 py-3 text-slate-400 text-xs">{formatDate(user.created_at)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminUsers;