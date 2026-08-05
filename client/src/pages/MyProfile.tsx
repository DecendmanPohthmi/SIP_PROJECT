import { useState, useEffect } from "react";
import { BsPerson, BsPencilSquare, BsEnvelope, BsTelephone, BsBank, BsQrCode } from "react-icons/bs";
import { useAuth } from "../context/AuthContext";
import { jwtDecode } from "jwt-decode";

interface DecodedToken {
  id: string;
  role: string;
}

const API = (import.meta as any).env?.VITE_API_URL || "http://localhost:4000";

const initials = (name?: string) => {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  return parts.length === 1
    ? parts[0].slice(0, 2).toUpperCase()
    : (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

const formatMemberSince = (dateStr?: string) => {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
};

const MyProfile = () => {
  const { token } = useAuth();
  const id = token ? jwtDecode<DecodedToken>(token).id : null;

  const [profile, setProfile] = useState<any>(null);
  const [editingProfile, setEditingProfile] = useState(false);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileError, setProfileError] = useState("");

  const [editingBank, setEditingBank] = useState(false);
  const [bankAccountNumber, setBankAccountNumber] = useState("");
  const [bankIfsc, setBankIfsc] = useState("");
  const [bankName, setBankName] = useState("");
  const [upiId, setUpiId] = useState("");
  const [bankSaving, setBankSaving] = useState(false);
  const [bankError, setBankError] = useState("");

  const authHeaders = { token: token || "" };

  const fetchProfile = async () => {
    if (!token) return;

    try {
      const res = await fetch(`${API}/api/user/me/${id}`, { headers: authHeaders });
      const data = await res.json();

      if (data.success) {
        setProfile(data.user);
        setFullName(data.user.full_name || "");
        setPhone(data.user.phone || "");
        setBankAccountNumber(data.user.bank_account_number || "");
        setBankIfsc(data.user.bank_ifsc_code || "");
        setUpiId(data.user.upi_id || "");
        setBankName(data.user.bank_name || "");
      }
    } catch (err) {
      console.log("fetchProfile error:", err);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [token]);

  const handleSaveProfile = async () => {
    if (!fullName.trim()) {
      setProfileError("Full name is required.");
      return;
    }

    try {
      setProfileSaving(true);
      setProfileError("");

      const res = await fetch(`${API}/api/user/profile`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...authHeaders },
        body: JSON.stringify({ full_name: fullName, phone }),
      });

      const data = await res.json();
      if (!data.success) throw new Error(data.message || "Failed to update profile.");

      setProfile(data.user);
      setEditingProfile(false);
    } catch (err: any) {
      setProfileError(err.message || "Something went wrong.");
    } finally {
      setProfileSaving(false);
    }
  };

  const handleBankSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setBankSaving(true);
      setBankError("");

      const res = await fetch(`${API}/api/user/bank-details`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...authHeaders },
        body: JSON.stringify({
          bank_account_number: bankAccountNumber,
          bank_ifsc_code: bankIfsc,
          bank_name: bankName,
          upi_id: upiId,
        }),
      });

      const data = await res.json();
      if (!data.success) throw new Error(data.message || "Failed to update bank details.");

      setEditingBank(false);
    } catch (err: any) {
      setBankError(err.message || "Something went wrong.");
    } finally {
      setBankSaving(false);
    }
  };

  return (
    <>
      {/* Profile Header Card */}
      <div className="animate-fade-in-up bg-white border border-slate-100 rounded-2xl shadow-sm p-5 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-6 hover:shadow-md transition-shadow duration-300">
        <div className="flex items-center gap-4 sm:gap-5">
          <div className="w-14 h-14 sm:w-20 sm:h-20 rounded-full bg-[#49557E] flex items-center justify-center text-white text-lg sm:text-2xl font-bold shrink-0 shadow-md">
            {initials(profile?.full_name)}
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-800">
              {profile?.full_name || "—"}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              {profile?.created_at ? `Member since ${formatMemberSince(profile.created_at)}` : ""}
            </p>
          </div>
        </div>

        <button
          onClick={() => setEditingProfile(true)}
          className="w-full sm:w-auto flex items-center justify-center gap-2 border border-[#FF4C24] text-[#49557E] px-4 sm:px-5 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-medium hover:bg-[#fff4f2] hover:scale-105 active:scale-95 transition-all duration-200"
        >
          <BsPencilSquare size={16} />
          Edit Profile
        </button>
      </div>

      {/* Account Details */}
      <div className="animate-fade-in-up bg-white border border-slate-100 rounded-2xl shadow-sm p-5 sm:p-8 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-base sm:text-lg font-bold text-slate-800">Account Details</h2>
          {!editingProfile && (
            <button
              onClick={() => setEditingProfile(true)}
              className="text-xs sm:text-sm font-semibold text-[#FF4C24] hover:underline"
            >
              Edit Details
            </button>
          )}
        </div>

        {editingProfile ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-slate-500 mb-1">Full Name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg p-2.5 text-sm outline-none focus:border-[#FF4C24] focus:ring-2 focus:ring-[#FF4C24]/10 transition-all"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">Phone Number</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg p-2.5 text-sm outline-none focus:border-[#FF4C24] focus:ring-2 focus:ring-[#FF4C24]/10 transition-all"
                />
              </div>
            </div>

            {profileError && <p className="text-red-500 text-xs">{profileError}</p>}

            <div className="flex items-center gap-3">
              <button
                onClick={handleSaveProfile}
                disabled={profileSaving}
                className="bg-[#FF4C24] text-white text-xs sm:text-sm font-semibold px-5 py-2.5 rounded-lg hover:bg-[#e03e1a] disabled:opacity-60 transition-all duration-200"
              >
                {profileSaving ? "Saving..." : "Save Changes"}
              </button>
              <button
                onClick={() => {
                  setEditingProfile(false);
                  setFullName(profile?.full_name || "");
                  setPhone(profile?.phone || "");
                  setProfileError("");
                }}
                className="text-xs sm:text-sm font-semibold text-slate-500 hover:text-slate-700"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4 sm:space-y-5">
            <div className="flex items-center gap-3.5 sm:gap-4 pb-4 sm:pb-5 border-b border-slate-100 group">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-slate-50 text-[#49557E] flex items-center justify-center shrink-0 group-hover:bg-[#49557E] group-hover:text-white transition-colors duration-300">
                <BsPerson size={18} />
              </div>
              <div>
                <p className="text-[10px] sm:text-xs text-slate-400 uppercase tracking-wide">Full Name</p>
                <p className="text-sm sm:text-base text-slate-800 font-medium">{profile?.full_name || "—"}</p>
              </div>
            </div>

            <div className="flex items-center gap-3.5 sm:gap-4 pb-4 sm:pb-5 border-b border-slate-100 group">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-slate-50 text-[#49557E] flex items-center justify-center shrink-0 group-hover:bg-[#49557E] group-hover:text-white transition-colors duration-300">
                <BsEnvelope size={18} />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] sm:text-xs text-slate-400 uppercase tracking-wide">Email Address</p>
                <p className="text-sm sm:text-base text-slate-800 font-medium truncate">{profile?.email || "—"}</p>
              </div>
            </div>

            <div className="flex items-center gap-3.5 sm:gap-4 group">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-slate-50 text-[#49557E] flex items-center justify-center shrink-0 group-hover:bg-[#49557E] group-hover:text-white transition-colors duration-300">
                <BsTelephone size={18} />
              </div>
              <div>
                <p className="text-[10px] sm:text-xs text-slate-400 uppercase tracking-wide">Phone Number</p>
                <p className="text-sm sm:text-base text-slate-800 font-medium">{profile?.phone || "—"}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bank & UPI */}
      <div className="animate-fade-in-up bg-white border border-slate-100 rounded-2xl shadow-sm p-5 sm:p-8 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-base sm:text-lg font-bold text-slate-800">Saved Bank & UPI Details</h2>
          <button
            onClick={() => setEditingBank(!editingBank)}
            className="text-xs sm:text-sm font-semibold text-[#FF4C24] hover:underline"
          >
            {editingBank ? "Cancel" : "Edit Details"}
          </button>
        </div>

        {editingBank ? (
          <form onSubmit={handleBankSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-slate-500 mb-1">Bank Name</label>
                <input
                  type="text"
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg p-2.5 text-sm outline-none focus:border-[#FF4C24] focus:ring-2 focus:ring-[#FF4C24]/10 transition-all"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">Account Number</label>
                <input
                  type="text"
                  value={bankAccountNumber}
                  onChange={(e) => setBankAccountNumber(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg p-2.5 text-sm outline-none focus:border-[#FF4C24] focus:ring-2 focus:ring-[#FF4C24]/10 transition-all"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">IFSC Code</label>
                <input
                  type="text"
                  value={bankIfsc}
                  onChange={(e) => setBankIfsc(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg p-2.5 text-sm outline-none focus:border-[#FF4C24] focus:ring-2 focus:ring-[#FF4C24]/10 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs text-slate-500 mb-1">UPI ID</label>
              <input
                type="text"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                className="w-full border border-slate-200 rounded-lg p-2.5 text-sm outline-none focus:border-[#FF4C24] focus:ring-2 focus:ring-[#FF4C24]/10 transition-all"
              />
            </div>

            {bankError && <p className="text-red-500 text-xs">{bankError}</p>}

            <button
              type="submit"
              disabled={bankSaving}
              className="bg-[#FF4C24] text-white text-xs sm:text-sm font-semibold px-5 py-2.5 rounded-lg hover:bg-[#e03e1a] disabled:opacity-60 transition-all duration-200"
            >
              {bankSaving ? "Saving..." : "Save Details"}
            </button>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="p-4 border border-slate-100 rounded-xl space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                  <BsBank size={16} />
                </div>
                <div>
                  <p className="text-xs text-slate-400">Primary Bank Account (Max 1)</p>
                  <p className="text-sm font-semibold text-slate-800">{bankName || "No bank account added"}</p>
                </div>
              </div>
              {bankAccountNumber && (
                <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 pt-2 border-t border-slate-50">
                  <p><span className="text-slate-400">A/C No:</span> •••• {bankAccountNumber.slice(-4)}</p>
                  <p><span className="text-slate-400">IFSC:</span> {bankIfsc}</p>
                </div>
              )}
            </div>

            <div className="p-4 border border-slate-100 rounded-xl flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                <BsQrCode size={16} />
              </div>
              <div>
                <p className="text-xs text-slate-400">Primary UPI ID (Max 1)</p>
                <p className="text-sm font-semibold text-slate-800">{upiId || "No UPI ID added"}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default MyProfile;