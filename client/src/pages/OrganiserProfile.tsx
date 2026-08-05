import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import {
  BsPerson,
  BsCalendarEvent,
  BsCashStack,
  BsBoxArrowRight,
  BsPencilSquare,
  BsEnvelope,
  BsTelephone,
  BsBank,
  BsWallet2,
  BsArrowUpRightCircle,
  BsShieldCheck,
  BsGeoAlt,
  BsPeople,
  BsTag,
  BsChevronRight,
  BsPlusLg,
  BsClockHistory,
  BsCheckCircleFill,
  BsXCircleFill,
} from "react-icons/bs";
import { useAuth } from "../context/AuthContext";

type Tab = "profile" | "events" | "earnings";

interface DecodedToken {
  id: string;
  role: string;
}

const API = (import.meta as any).env?.VITE_API_URL || "http://localhost:4000";

const ProfilePage = () => {
  const navigate = useNavigate();
  const { logout, token } = useAuth();

  const id = token ? jwtDecode<DecodedToken>(token).id : null;

  const [activeTab, setActiveTab] = useState<Tab>("profile");

  const [profile, setProfile] = useState<any>(null);
  const [editingProfile, setEditingProfile] = useState(false);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileError, setProfileError] = useState("");

  const [events, setEvents] = useState<any[]>([]);
  const [eventFilter, setEventFilter] = useState<string>("all");

  const [editingBank, setEditingBank] = useState(false);
  const [bankAccountNumber, setBankAccountNumber] = useState("");
  const [bankIfsc, setBankIfsc] = useState("");
  const [upiId, setUpiId] = useState("");
  const [bankName, setBankName] = useState("");
  const [bankSaving, setBankSaving] = useState(false);
  const [bankError, setBankError] = useState("");
  const [totalBalance, setTotalBalance] = useState("0.00");
  const [withdrawnAmount, setWithdrawnAmount] = useState("0.00");
  const [availableBalance, setAvailableBalance] = useState("0.00");


  const authHeaders = { token: token || "" };

  const fetchProfile = async () => {
    if (!id) return;

    try {
      const res = await fetch(`${API}/api/organiser/me/${id}`, {
        headers: authHeaders,
      });
      const data = await res.json();

      if (data.success) {
        setProfile(data.organiser);
        setFullName(data.organiser.full_name);
        setPhone(data.organiser.phone);
        setBankAccountNumber(data.organiser.bank_account_number || "");
        setBankIfsc(data.organiser.bank_ifsc_code || "");
        setUpiId(data.organiser.upi_id || "");
        setBankName(data.organiser.bank_name || "");
        setTotalBalance(data.organiser.total_balance || data.organiser.totalBalance || "0.00");
        setWithdrawnAmount(data.organiser.withdrawn_amount || data.organiser.withdrawnAmount || "0.00");
        setAvailableBalance(data.organiser.available_balance || data.organiser.available_balance || "0.00");
      }
    } catch (err) {
      console.log("fetchProfile error:", err);
    }
  };

  const fetchMyEvents = async () => {
    try {
      const res = await fetch(`${API}/api/events/my-events`, {
        headers: authHeaders,
      });
      const data = await res.json();
      if (data.success) setEvents(data.events || []);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    if (token && id) {
      fetchProfile();
      fetchMyEvents();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, id]);

  const handleLogout = () => {
    logout();
    navigate("/", { replace: true });
  };

  const handleSaveProfile = async () => {
    setProfileError("");
    if (!fullName.trim() || !phone.trim()) {
      setProfileError("Name and phone are required.");
      return;
    }

    try {
      setProfileSaving(true);
      const res = await fetch(`${API}/api/organiser/profile`, {
        method: "PUT",
        headers: { ...authHeaders, "Content-Type": "application/json" },
        body: JSON.stringify({ full_name: fullName, phone }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      setProfile((prev: any) => ({ ...prev, full_name: fullName, phone }));
      setEditingProfile(false);
    } catch (err: any) {
      setProfileError(err.message || "Could not save changes.");
    } finally {
      setProfileSaving(false);
    }
  };

  const handleSaveBank = async () => {
    setBankError("");
    if (!bankAccountNumber || !bankIfsc || !bankName) {
      setBankError("All bank fields are required.");
      return;
    }

    try {
      setBankSaving(true);
      const res = await fetch(`${API}/api/organiser/bank-details`, {
        method: "PUT",
        headers: { ...authHeaders, "Content-Type": "application/json" },
        body: JSON.stringify({
          bank_account_number: bankAccountNumber,
          bank_ifsc_code: bankIfsc,
          upi_id: upiId,
          bank_name: bankName,
        }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);

      setProfile((prev: any) => ({
        ...prev,
        bank_account_number: bankAccountNumber,
        bank_ifsc_code: bankIfsc,
        upi_id: upiId,
        bank_name: bankName,
      }));
      setEditingBank(false);
    } catch (err: any) {
      setBankError(err.message || "Could not save bank details.");
    } finally {
      setBankSaving(false);
    }
  };

  const menuItems = [
    { key: "profile" as Tab, label: "My Profile", icon: <BsPerson size={18} /> },
    { key: "events" as Tab, label: "My Events", icon: <BsCalendarEvent size={18} /> },
    { key: "earnings" as Tab, label: "My Earnings", icon: <BsCashStack size={18} /> },
  ];

  const renderStatusBadge = (status: string) => {
    switch (status) {
      case "live":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-500 text-white shadow-sm shadow-red-500/20">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
            </span>
            LIVE NOW
          </span>
        );
      case "approved":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500 text-white shadow-sm">
            <BsCheckCircleFill size={11} /> Approved
          </span>
        );
      case "pending":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500 text-white shadow-sm">
            <BsClockHistory size={11} /> Pending Review
          </span>
        );
      case "rejected":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-600 text-white shadow-sm">
            <BsXCircleFill size={11} /> Rejected
          </span>
        );
      case "completed":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-700 text-white">
            Completed
          </span>
        );
      case "cancelled":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-gray-500 text-white">
            Cancelled
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 capitalize">
            {status}
          </span>
        );
    }
  };

  const filteredEvents = eventFilter === "all" 
    ? events 
    : events.filter(e => e.status === eventFilter);

  return (
    <div className="min-h-screen bg-slate-50/50 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        
        {/* Top Profile Banner Header */}
        <div className="relative bg-gradient-to-r from-slate-900 via-indigo-950 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl mb-8 overflow-hidden">
          <div className="absolute right-0 top-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-indigo-600 to-rose-500 text-white font-extrabold text-2xl sm:text-3xl flex items-center justify-center shadow-lg shadow-indigo-900/40 border-2 border-white/10">
                {profile?.full_name ? profile.full_name.charAt(0).toUpperCase() : "O"}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-black tracking-tight">
                    {profile?.full_name || "Organiser Account"}
                  </h1>
                  <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full flex items-center gap-1">
                    <BsShieldCheck size={10} /> Verified
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-indigo-200/80 mt-1 font-medium">
                  {profile?.email || "Loading email..."}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate("/organiser/withdraw")}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white text-xs sm:text-sm font-bold px-4 py-2.5 rounded-xl transition-all shadow-lg shadow-red-500/20 cursor-pointer"
              >
                <BsArrowUpRightCircle size={16} /> Withdraw Funds
              </button>
            </div>
          </div>
        </div>

        {/* Grid Layout Container */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          
          {/* Navigation Sidebar */}
          <div className="md:col-span-1 bg-white border border-slate-200/80 rounded-2xl shadow-sm p-3 sm:p-4 h-fit sticky top-6">
            <nav className="flex flex-row md:flex-col overflow-x-auto no-scrollbar gap-1.5 sm:gap-2">
              {menuItems.map((item) => (
                <button
                  key={item.key}
                  onClick={() => setActiveTab(item.key)}
                  className={`flex items-center gap-3 px-3.5 sm:px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all shrink-0 cursor-pointer ${
                    activeTab === item.key
                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-100"
                      : "text-slate-600 hover:bg-slate-100/60 hover:text-slate-900"
                  }`}
                >
                  {item.icon}
                  {item.label}
                </button>
              ))}

              <div className="hidden md:block my-2 border-t border-slate-100" />

              <button
                onClick={handleLogout}
                className="flex items-center gap-3 px-3.5 sm:px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-rose-600 hover:bg-rose-50 transition-colors shrink-0 ml-auto md:ml-0 cursor-pointer"
              >
                <BsBoxArrowRight size={18} />
                <span>Logout</span>
              </button>
            </nav>
          </div>

          {/* Main Content Area */}
          <div className="md:col-span-3 space-y-6">
            
            {/* PROFILE TAB */}
            {activeTab === "profile" && (
              <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm p-6 sm:p-8">
                <div className="flex items-center justify-between pb-5 border-b border-slate-100 mb-6">
                  <div>
                    <h2 className="text-base sm:text-lg font-bold text-slate-900">Personal Information</h2>
                    <p className="text-xs text-slate-500 mt-0.5">Manage your personal identity details.</p>
                  </div>
                  {!editingProfile && (
                    <button
                      onClick={() => setEditingProfile(true)}
                      className="inline-flex items-center gap-2 border border-slate-200 hover:border-indigo-600 hover:text-indigo-600 text-slate-700 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all shadow-sm cursor-pointer"
                    >
                      <BsPencilSquare size={14} /> Edit Profile
                    </button>
                  )}
                </div>

                {!profile ? (
                  <div className="py-12 text-center text-slate-400 text-sm animate-pulse">Loading profile data...</div>
                ) : editingProfile ? (
                  <div className="space-y-4 max-w-lg">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Full Name</label>
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 outline-none focus:bg-white focus:border-indigo-600 transition-all font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Phone Number</label>
                      <input
                        type="text"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 outline-none focus:bg-white focus:border-indigo-600 transition-all font-medium"
                      />
                    </div>
                    {profileError && (
                      <p className="text-rose-600 text-xs font-semibold bg-rose-50 p-3 rounded-xl border border-rose-100">{profileError}</p>
                    )}
                    <div className="flex gap-3 pt-4">
                      <button
                        onClick={() => setEditingProfile(false)}
                        className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-700 text-xs sm:text-sm font-bold hover:bg-slate-50 transition-colors cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSaveProfile}
                        disabled={profileSaving}
                        className="flex-1 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-bold transition-all disabled:opacity-50 shadow-md shadow-indigo-100 cursor-pointer"
                      >
                        {profileSaving ? "Saving..." : "Save Changes"}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-100 flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-white text-indigo-600 flex items-center justify-center shrink-0 shadow-sm border border-slate-100">
                        <BsPerson size={20} />
                      </div>
                      <div>
                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Full Name</p>
                        <p className="text-sm font-bold text-slate-900 mt-0.5">{profile.full_name}</p>
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-100 flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-white text-indigo-600 flex items-center justify-center shrink-0 shadow-sm border border-slate-100">
                        <BsEnvelope size={20} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Email Address</p>
                        <p className="text-sm font-bold text-slate-900 mt-0.5 truncate">{profile.email}</p>
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-100 flex items-center gap-4 sm:col-span-2">
                      <div className="w-12 h-12 rounded-xl bg-white text-indigo-600 flex items-center justify-center shrink-0 shadow-sm border border-slate-100">
                        <BsTelephone size={20} />
                      </div>
                      <div>
                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Phone Number</p>
                        <p className="text-sm font-bold text-slate-900 mt-0.5">{profile.phone || "Not specified"}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* EVENTS TAB (UPGRADED) */}
            {activeTab === "events" && (
              <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm p-6 sm:p-8">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100 mb-6">
                  <div>
                    <h2 className="text-base sm:text-lg font-bold text-slate-900">My Events Management</h2>
                    <p className="text-xs text-slate-500 mt-0.5">Overview of all events hosted or created under your organiser profile.</p>
                  </div>
                  <button
                    onClick={() => navigate("/organiser/create-event")}
                    className="inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-bold px-4 py-2.5 rounded-xl transition-all shadow-md shadow-indigo-100 cursor-pointer"
                  >
                    <BsPlusLg size={14} /> Create New Event
                  </button>
                </div>

                {/* Filter Bar */}
                <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-6 no-scrollbar">
                  {["all", "live", "approved", "pending", "completed", "cancelled"].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setEventFilter(tab)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold capitalize whitespace-nowrap transition-all cursor-pointer ${
                        eventFilter === tab
                          ? "bg-indigo-600 text-white shadow-sm"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>

                {filteredEvents.length === 0 ? (
                  <div className="text-center py-16 border border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
                    <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-sm">
                      <BsCalendarEvent size={24} />
                    </div>
                    <p className="text-slate-800 font-bold text-sm">No events found</p>
                    <p className="text-slate-400 text-xs mt-1 max-w-xs mx-auto">
                      There are no events matching the selected filter category.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4">
                    {filteredEvents.map((event) => (
                      <div
                        key={event.event_id}
                        className="group bg-white border border-slate-200/80 hover:border-indigo-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col md:flex-row items-start md:items-center justify-between gap-5"
                      >
                        <div className="flex items-start gap-4 min-w-0">
                          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-slate-100 shrink-0 overflow-hidden relative border border-slate-200/60">
                            {event.image_url ? (
                              <img src={event.image_url} alt={event.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-slate-400">
                                <BsCalendarEvent size={20} />
                              </div>
                            )}
                          </div>

                          <div className="min-w-0 space-y-1.5">
                            <div className="flex items-center gap-2 flex-wrap">
                              {renderStatusBadge(event.status)}
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700">
                                <BsTag size={10} /> {event.category || "General"}
                              </span>
                              <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                                event.pricing_mode === "free" ? "bg-emerald-50 text-emerald-700" : "bg-purple-50 text-purple-700"
                              }`}>
                                {event.pricing_mode}
                              </span>
                            </div>

                            <h3 className="font-bold text-slate-900 text-sm sm:text-base line-clamp-1 group-hover:text-indigo-600 transition-colors">
                              {event.title}
                            </h3>

                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 font-medium">
                              <span className="flex items-center gap-1.5 text-slate-700">
                                <BsCalendarEvent className="text-indigo-600" size={12} />
                                {event.event_date ? new Date(event.event_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : "TBD"}
                                {event.start_time && ` • ${event.start_time}`}
                              </span>
                              <span className="flex items-center gap-1.5 text-slate-600">
                                <BsGeoAlt className="text-slate-400" size={12} />
                                {event.venue || event.city || "Online Venue"}
                              </span>
                              <span className="flex items-center gap-1.5 text-slate-600">
                                <BsPeople className="text-slate-400" size={12} />
                                <strong className="text-slate-900">{event.available_capacity ?? event.total_capacity}</strong> / {event.total_capacity} seats
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 w-full md:w-auto justify-end pt-3 md:pt-0 border-t md:border-t-0 border-slate-100">
                          {event.status === "live" || event.status === "completed" ? (
                            <button
                              onClick={() => navigate(`/organiser/event/${event.event_id}/attendees`)}
                              className="w-full md:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm cursor-pointer"
                            >
                              <BsPeople size={14} /> Attendees <BsChevronRight size={10} />
                            </button>
                          ) : event.status === "approved" ? (
                            <button
                              onClick={() => navigate(`/organiser/events/${event.event_id}/tickets`)}
                              className="w-full md:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm cursor-pointer"
                            >
                              Go Live <BsChevronRight size={10} />
                            </button>
                          ) : (
                            <button
                              onClick={() => navigate(`/organiser/edit-event/${event.event_id}`)}
                              className="w-full md:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all cursor-pointer"
                            >
                              <BsPencilSquare size={13} /> Edit Event
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* EARNINGS TAB */}
            {activeTab === "earnings" && (
              <div className="space-y-6">
                
                {/* Financial Summary Metric Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm p-5 text-center relative overflow-hidden">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-3">
                      <BsWallet2 size={20} />
                    </div>
                    <p className="text-2xl font-black text-slate-900">₹{totalBalance}</p>
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mt-1">Total Balance</p>
                  </div>

                  <div className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white border border-indigo-800 rounded-2xl shadow-md p-5 text-center relative overflow-hidden">
                    <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-300 flex items-center justify-center mx-auto mb-3 border border-indigo-400/20">
                      <BsCashStack size={20} />
                    </div>
                    <p className="text-2xl font-black text-white">₹{availableBalance}</p>
                    <p className="text-xs font-semibold text-indigo-200 uppercase tracking-wider mt-1">Available Balance</p>
                  </div>

                  <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm p-5 text-center relative overflow-hidden">
                    <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-3">
                      <BsCashStack size={20} />
                    </div>
                    <p className="text-2xl font-black text-slate-900">₹{withdrawnAmount}</p>
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mt-1">Withdrawn Amount</p>
                  </div>
                </div>

                {/* Bank Details Container */}
                <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm p-6 sm:p-8">
                  <div className="flex items-center justify-between pb-5 border-b border-slate-100 mb-6">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
                        <BsBank size={18} />
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-slate-900">Bank & Payout Information</h3>
                        <p className="text-xs text-slate-500">Destination account for your earnings withdrawals.</p>
                      </div>
                    </div>

                    {!editingBank && (
                      <button
                        onClick={() => setEditingBank(true)}
                        className="inline-flex items-center gap-2 border border-slate-200 hover:border-indigo-600 hover:text-indigo-600 text-slate-700 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all shadow-sm cursor-pointer"
                      >
                        <BsPencilSquare size={14} /> Edit
                      </button>
                    )}
                  </div>

                  {editingBank ? (
                    <div className="space-y-4 max-w-lg">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Account Number</label>
                        <input
                          type="text"
                          value={bankAccountNumber}
                          onChange={(e) => setBankAccountNumber(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 outline-none focus:bg-white focus:border-indigo-600 transition-all font-medium"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">IFSC Code</label>
                        <input
                          type="text"
                          value={bankIfsc}
                          onChange={(e) => setBankIfsc(e.target.value.toUpperCase())}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 outline-none focus:bg-white focus:border-indigo-600 transition-all font-medium"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">UPI ID (Optional)</label>
                        <input
                          type="text"
                          placeholder="e.g. username@upi"
                          value={upiId}
                          onChange={(e) => setUpiId(e.target.value.toLowerCase())}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 outline-none focus:bg-white focus:border-indigo-600 transition-all font-medium"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Bank Name</label>
                        <input
                          type="text"
                          value={bankName}
                          onChange={(e) => setBankName(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 outline-none focus:bg-white focus:border-indigo-600 transition-all font-medium"
                        />
                      </div>
                      {bankError && (
                        <p className="text-rose-600 text-xs font-semibold bg-rose-50 p-3 rounded-xl border border-rose-100">{bankError}</p>
                      )}
                      <div className="flex gap-3 pt-4">
                        <button
                          onClick={() => setEditingBank(false)}
                          className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-700 text-xs sm:text-sm font-bold hover:bg-slate-50 transition-colors cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleSaveBank}
                          disabled={bankSaving}
                          className="flex-1 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-bold transition-all disabled:opacity-50 shadow-md shadow-indigo-100 cursor-pointer"
                        >
                          {bankSaving ? "Saving..." : "Save Details"}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Account Number</span>
                        <span className="text-sm font-bold text-slate-900 mt-1 block">{bankAccountNumber || "Not configured"}</span>
                      </div>
                      <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">IFSC Code</span>
                        <span className="text-sm font-bold text-slate-900 mt-1 block">{bankIfsc || "Not configured"}</span>
                      </div>
                      <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">UPI ID</span>
                        <span className="text-sm font-bold text-slate-900 mt-1 block">{upiId || "Not configured"}</span>
                      </div>
                      <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Bank Name</span>
                        <span className="text-sm font-bold text-slate-900 mt-1 block">{bankName || "Not configured"}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

          </div>

        </div>

      </div>
    </div>
  );
};

export default ProfilePage;