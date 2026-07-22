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
} from "react-icons/bs";
import { useAuth } from "../context/AuthContext";

type Tab = "profile" | "events" | "earnings";

interface DecodedToken {
  id: string;
  role: string;
}

const ProfilePage = () => {
  const navigate = useNavigate();
  const { logout, token } = useAuth();

  const id = token ? jwtDecode<DecodedToken>(token).id : null;

  console.log("token:", token, "decoded id:", id); // TEMP DEBUG — remove once working

  const [activeTab, setActiveTab] = useState<Tab>("profile");

  const [profile, setProfile] = useState<any>(null);
  const [editingProfile, setEditingProfile] = useState(false);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileError, setProfileError] = useState("");

  const [events, setEvents] = useState<any[]>([]);

  const [editingBank, setEditingBank] = useState(false);
  const [bankAccountNumber, setBankAccountNumber] = useState("");
  const [bankIfsc, setBankIfsc] = useState("");
  const [bankName, setBankName] = useState("");
  const [bankBranch, setBankBranch] = useState("");
  const [bankSaving, setBankSaving] = useState(false);
  const [bankError, setBankError] = useState("");

  const authHeaders = { token: token || "" };

  const fetchProfile = async () => {
    if (!id) return;

    try {
      const res = await fetch(`http://localhost:4000/api/organiser/me/${id}`, {
        headers: authHeaders,
      });
      const data = await res.json();

      console.log("fetchProfile response:", res.status, data); // TEMP DEBUG

      if (data.success) {
        setProfile(data.organiser);
        setFullName(data.organiser.full_name);
        setPhone(data.organiser.phone);
        setBankAccountNumber(data.organiser.bank_account_number || "");
        setBankIfsc(data.organiser.bank_ifsc_code || "");
        setBankName(data.organiser.bank_name || "");
        setBankBranch(data.organiser.bank_branch || "");
        console.log(data.organiser);
      }
    } catch (err) {
      console.log("fetchProfile error:", err);
    }
  };

  const fetchMyEvents = async () => {
    try {
      const res = await fetch("http://localhost:4000/api/events/my-events", {
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
      const res = await fetch("http://localhost:4000/api/organiser/profile", {
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
    if (!bankAccountNumber || !bankIfsc || !bankName || !bankBranch) {
      setBankError("All bank fields are required.");
      return;
    }

    try {
      setBankSaving(true);
      const res = await fetch("http://localhost:4000/api/organiser/bank-details", {
        method: "PUT",
        headers: { ...authHeaders, "Content-Type": "application/json" },
        body: JSON.stringify({
          bank_account_number: bankAccountNumber,
          bank_ifsc_code: bankIfsc,
          bank_name: bankName,
          bank_branch: bankBranch,
        }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      
      // Keep state contextual data structurally synchronized
      setProfile((prev: any) => ({
        ...prev,
        bank_account_number: bankAccountNumber,
        bank_ifsc_code: bankIfsc,
        bank_name: bankName,
        bank_branch: bankBranch
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

  return (
    <div className="max-w-7xl mx-auto mt-8 px-6 pb-16 grid grid-cols-1 md:grid-cols-4 gap-6">
      
      {/* Dynamic Tab Body Window Context */}
      <div className="md:col-span-3 space-y-6">
        {activeTab === "profile" && (
          <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-slate-800">My Profile</h2>
              {!editingProfile && (
                <button
                  onClick={() => setEditingProfile(true)}
                  className="flex items-center gap-2 border border-[#FF4C24] text-[#49557E] px-4 py-2 rounded-full text-sm font-medium hover:bg-[#fff4f2] transition-colors"
                >
                  <BsPencilSquare size={14} />
                  Edit Profile
                </button>
              )}
            </div>

            {!profile ? (
              <p className="text-slate-400 text-sm">Loading...</p>
            ) : editingProfile ? (
              <div className="space-y-4 max-w-md">
                <div>
                  <label className="block text-sm font-semibold mb-1.5 text-slate-700">Full Name</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg p-2.5"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1.5 text-slate-700">Phone Number</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg p-2.5"
                  />
                </div>
                {profileError && <p className="text-red-500 text-sm">{profileError}</p>}
                <div className="flex gap-3">
                  <button
                    onClick={() => setEditingProfile(false)}
                    className="flex-1 py-2.5 rounded-lg border border-gray-300 text-slate-700 font-medium hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveProfile}
                    disabled={profileSaving}
                    className="flex-1 py-2.5 rounded-lg bg-black text-white font-medium hover:bg-gray-800 disabled:opacity-50"
                  >
                    {profileSaving ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-5">
                <div className="flex items-center gap-4 pb-5 border-b border-slate-100">
                  <div className="w-10 h-10 rounded-lg bg-slate-50 text-[#49557E] flex items-center justify-center">
                    <BsPerson size={18} />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 uppercase tracking-wide">Full Name</p>
                    <p className="text-base text-slate-800 font-medium">{profile.full_name}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 pb-5 border-b border-slate-100">
                  <div className="w-10 h-10 rounded-lg bg-slate-50 text-[#49557E] flex items-center justify-center">
                    <BsEnvelope size={18} />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 uppercase tracking-wide">Email Address</p>
                    <p className="text-base text-slate-800 font-medium">{profile.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-slate-50 text-[#49557E] flex items-center justify-center">
                    <BsTelephone size={18} />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 uppercase tracking-wide">Phone Number</p>
                    <p className="text-base text-slate-800 font-medium">{profile.phone}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "events" && (
          <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-8">
            <h2 className="text-lg font-bold text-slate-800 mb-6">My Events</h2>
            {events.length === 0 ? (
              <p className="text-slate-400 text-sm">You haven't created any events yet.</p>
            ) : (
              <div className="space-y-3">
                {events.map((event) => (
                  <div key={event.event_id} className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div>
                      <p className="font-semibold text-slate-800">{event.title}</p>
                      <p className="text-sm text-slate-500">{event.event_date} · {event.city}</p>
                    </div>
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 capitalize">
                      {event.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "earnings" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-6 text-center">
                <BsWallet2 className="mx-auto text-indigo-500 mb-2" size={22} />
                <p className="text-2xl font-bold text-slate-800">—</p>
                <p className="text-sm text-slate-500 mt-1">Total Earned</p>
              </div>
              <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-6 text-center">
                <BsCashStack className="mx-auto text-emerald-500 mb-2" size={22} />
                <p className="text-2xl font-bold text-slate-800">—</p>
                <p className="text-sm text-slate-500 mt-1">Available Balance</p>
              </div>
              <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-6 text-center">
                <BsCashStack className="mx-auto text-amber-500 mb-2" size={22} />
                <p className="text-2xl font-bold text-slate-800">—</p>
                <p className="text-sm text-slate-500 mt-1">Withdrawn</p>
              </div>
            </div>

            <p className="text-xs text-slate-400 -mt-3">
              Earnings figures will populate once the bookings system is live.
            </p>

            <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <BsBank size={18} />
                  Bank Account Details
                </h2>
                {!editingBank && (
                  <button
                    onClick={() => setEditingBank(true)}
                    className="flex items-center gap-2 border border-[#FF4C24] text-[#49557E] px-4 py-2 rounded-full text-sm font-medium hover:bg-[#fff4f2] transition-colors"
                  >
                    <BsPencilSquare size={14} />
                    Edit
                  </button>
                )}
              </div>

              {editingBank ? (
                <div className="space-y-4 max-w-md">
                  <div>
                    <label className="block text-sm font-semibold mb-1.5 text-slate-700">Account Number</label>
                    <input
                      type="text"
                      value={bankAccountNumber}
                      onChange={(e) => setBankAccountNumber(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg p-2.5"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-1.5 text-slate-700">IFSC Code</label>
                    <input
                      type="text"
                      value={bankIfsc}
                      onChange={(e) => setBankIfsc(e.target.value.toUpperCase())}
                      className="w-full border border-gray-300 rounded-lg p-2.5"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-1.5 text-slate-700">Bank Name</label>
                    <input
                      type="text"
                      value={bankName}
                      onChange={(e) => setBankName(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg p-2.5"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-1.5 text-slate-700">Branch</label>
                    <input
                      type="text"
                      value={bankBranch}
                      onChange={(e) => setBankBranch(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg p-2.5"
                    />
                  </div>
                  {bankError && <p className="text-red-500 text-sm">{bankError}</p>}
                  <div className="flex gap-3">
                    <button
                      onClick={() => setEditingBank(false)}
                      className="flex-1 py-2.5 rounded-lg border border-gray-300 text-slate-700 font-medium hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveBank}
                      disabled={bankSaving}
                      className="flex-1 py-2.5 rounded-lg bg-black text-white font-medium hover:bg-gray-800 disabled:opacity-50"
                    >
                      {bankSaving ? "Saving..." : "Save Bank Details"}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3 text-sm">
                  <p><span className="text-slate-400">Account Number:</span> <span className="font-medium text-slate-800">{bankAccountNumber || "Not set"}</span></p>
                  <p><span className="text-slate-400">IFSC Code:</span> <span className="font-medium text-slate-800">{bankIfsc || "Not set"}</span></p>
                  <p><span className="text-slate-400">Bank Name:</span> <span className="font-medium text-slate-800">{bankName || "Not set"}</span></p>
                  <p><span className="text-slate-400">Branch:</span> <span className="font-medium text-slate-800">{bankBranch || "Not set"}</span></p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Sidebar Control Interface Element (md:order-last secures accurate sorting on mobiles) */}
      <div className="md:col-span-1 bg-white border border-slate-100 rounded-2xl shadow-sm p-4 h-fit md:order-last">
        <nav className="flex flex-col gap-1">
          {menuItems.map((item) => (
            <button
              key={item.key}
              onClick={() => setActiveTab(item.key)}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm text-left transition-colors ${
                activeTab === item.key
                  ? "bg-[#fff4f2] text-[#FF4C24] font-semibold"
                  : "text-[#49557E] hover:bg-slate-50"
              }`}
            >
              {item.icon}
              {item.label}
            </button>
          ))}

          <hr className="my-2 border-slate-100" />

          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm text-red-500 hover:bg-red-50 transition-colors"
          >
            <BsBoxArrowRight size={18} />
            Logout
          </button>
        </nav>
      </div>
    </div>
  );
};

export default ProfilePage;