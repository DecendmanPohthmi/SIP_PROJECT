import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  BsPerson,
  BsGrid,
  BsPencilSquare,
  BsEnvelope,
  BsShieldLock,
  BsPhone,
  BsCheckCircle,
} from "react-icons/bs";
import { useAuth } from "../context/AuthContext";

const API = (import.meta as any).env?.VITE_API_URL || "http://localhost:4000";

const AdminProfile = () => {
  const { token, logout } = useAuth();
  const navigate = useNavigate();

  const [adminData, setAdminData] = useState({
    full_name: "",
    email: "",
    phone: "",
    role: "Administrator",
  });

  const [editingProfile, setEditingProfile] = useState(false);
  const [formData, setFormData] = useState({
    full_name: "",
    phone: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // Fetch real admin profile data from backend
  useEffect(() => {
    const fetchProfile = async () => {
      if (!token) return;
      try {
        setLoading(true);
        const res = await fetch(`${API}/api/admin/profile`, {
          headers: { token },
        });
        const data = await res.json();
        if (data.success && data.admin) {
          setAdminData({
            full_name: data.admin.full_name || "Admin User",
            email: data.admin.email || "admin@eventnest.com",
            phone: data.admin.phone || "",
            role: data.admin.role || "Administrator",
          });
          setFormData({
            full_name: data.admin.full_name || "",
            phone: data.admin.phone || "",
          });
        }
      } catch (err) {
        console.log("Failed to fetch admin profile:", err);
        setErrorMessage("Could not load profile details.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [token]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    try {
      setSaving(true);
      setErrorMessage("");
      setSuccessMessage("");

      const res = await fetch(`${API}/api/admin/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          token,
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (data.success) {
        setAdminData((prev) => ({
          ...prev,
          full_name: formData.full_name,
          phone: formData.phone,
        }));
        setEditingProfile(false);
        setSuccessMessage("Profile updated successfully!");
        setTimeout(() => setSuccessMessage(""), 3000);
      } else {
        setErrorMessage(data.message || "Failed to update profile.");
      }
    } catch (err) {
      console.log("Update error:", err);
      setErrorMessage("An error occurred while updating profile.");
    } finally {
      setSaving(false);
    }
  };

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
                <h1 className="text-2xl font-bold text-white">
                  {loading ? "Loading..." : adminData.full_name}
                </h1>
                <p className="text-sm text-slate-400">Administrator · EventNest</p>
              </div>
            </div>

            <button
              onClick={() => {
                setEditingProfile((prev) => !prev);
                setErrorMessage("");
                setSuccessMessage("");
              }}
              className="flex items-center gap-2 border border-slate-700 text-slate-200 px-5 py-2.5 rounded-full text-sm font-medium hover:bg-white/5 transition-colors"
            >
              <BsPencilSquare size={16} />
              {editingProfile ? "Cancel" : "Edit Profile"}
            </button>
          </div>

          {successMessage && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
              <BsCheckCircle size={16} />
              {successMessage}
            </div>
          )}

          {errorMessage && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
              {errorMessage}
            </div>
          )}

          {/* Account details or Edit Form */}
          <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-8">
            <h2 className="text-lg font-bold text-slate-800 mb-6">Account Details</h2>

            {editingProfile ? (
              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div>
                  <label className="text-xs text-slate-400 uppercase tracking-wide">Full Name</label>
                  <input
                    type="text"
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    required
                    className="w-full mt-1 border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#49557E]"
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-400 uppercase tracking-wide">Phone Number</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="e.g. +91 9876543210"
                    className="w-full mt-1 border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#49557E]"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setEditingProfile(false)}
                    className="px-5 py-2.5 rounded-full text-sm font-medium border border-slate-300 text-slate-600 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-5 py-2.5 rounded-full text-sm font-medium bg-[#49557E] text-white hover:bg-[#3c4768] disabled:opacity-50"
                  >
                    {saving ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-5">
                <div className="flex items-center gap-4 pb-5 border-b border-slate-100">
                  <div className="w-10 h-10 rounded-lg bg-slate-50 text-[#49557E] flex items-center justify-center">
                    <BsPerson size={18} />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 uppercase tracking-wide">Full Name</p>
                    <p className="text-base text-slate-800 font-medium">
                      {loading ? "Loading..." : adminData.full_name}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 pb-5 border-b border-slate-100">
                  <div className="w-10 h-10 rounded-lg bg-slate-50 text-[#49557E] flex items-center justify-center">
                    <BsEnvelope size={18} />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 uppercase tracking-wide">Email Address</p>
                    <p className="text-base text-slate-800 font-medium">
                      {loading ? "Loading..." : adminData.email}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 pb-5 border-b border-slate-100">
                  <div className="w-10 h-10 rounded-lg bg-slate-50 text-[#49557E] flex items-center justify-center">
                    <BsPhone size={18} />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 uppercase tracking-wide">Phone Number</p>
                    <p className="text-base text-slate-800 font-medium">
                      {loading ? "Loading..." : adminData.phone || "Not provided"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-slate-50 text-[#49557E] flex items-center justify-center">
                    <BsShieldLock size={18} />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 uppercase tracking-wide">Role</p>
                    <p className="text-base text-slate-800 font-medium">
                      {loading ? "Loading..." : adminData.role}
                    </p>
                  </div>
                </div>
              </div>
            )}
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
          </nav>
        </div>
      </div>
    </div>
  );
};

export default AdminProfile;