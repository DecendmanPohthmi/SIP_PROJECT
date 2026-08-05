import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  BsGrid,
  BsBell,
  BsPersonCircle,
  BsBoxArrowRight,
  BsChevronDown,
  BsPhone,
  BsList,
  BsX,
} from "react-icons/bs";
import { useAuth } from "../context/AuthContext.tsx";

const API = (import.meta as any).env?.VITE_API_URL || "http://localhost:4000";

const AdminNavbar = () => {
  const { token, logout } = useAuth();
  const navigate = useNavigate();
  const isLoggedIn = !!token;

  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [adminPhone, setAdminPhone] = useState<string>("Loading...");
  const [adminName, setAdminName] = useState<string>("Admin");
  
  const profileRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  const handleLogout = () => {
    logout();
    navigate("/admin/login");
  };

  // Fetch admin profile details to display phone number and name initial
  useEffect(() => {
    const fetchAdminProfile = async () => {
      if (!token) return;
      try {
        const res = await fetch(`${API}/api/admin/profile`, {
          headers: { token },
        });
        const data = await res.json();
        if (data.success && data.admin) {
          setAdminPhone(data.admin.phone || "No phone added");
          if (data.admin.full_name) {
            setAdminName(data.admin.full_name);
          }
        }
      } catch (err) {
        console.log("Failed to load admin profile:", err);
        setAdminPhone("Unavailable");
      }
    };

    fetchAdminProfile();
  }, [token]);

  // Close profile dropdown or mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Get the first letter of the admin's name (fallback to "A")
  const adminInitial = adminName ? adminName.charAt(0).toUpperCase() : "A";

  return (
    <nav className="bg-slate-950 border-b border-slate-800 relative z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-7 py-4 flex justify-between items-center">
        {/* Logo */}
        <Link
          to="/admin/dashboard"
          className="flex items-center gap-2 text-xl font-bold text-white"
        >
          <div className="p-1.5 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-center">
            <img src="/icons.svg" alt="EventNest Logo" className="w-8 h-8 object-contain" />
          </div>
          <span>EventNest</span>

          <span className="text-[10px] font-bold tracking-widest uppercase bg-white/10 text-indigo-300 px-2 py-1 rounded-full ml-1">
            Admin
          </span>
        </Link>

        {/* Desktop Navigation */}
        {isLoggedIn && (
          <ul className="hidden md:flex items-center gap-1 text-sm">
            <li>
              <Link
                to="/admin/dashboard"
                className="flex items-center gap-2 px-4 py-2 rounded-full text-slate-400 hover:text-white hover:bg-white/5"
              >
                <BsGrid size={17} />
                Dashboard
              </Link>
            </li>
          </ul>
        )}

        {/* Right Side Desktop / General */}
        {!isLoggedIn && (
          <Link
            to="/admin/login"
            className="bg-[#49557E] hover:bg-[#3c4768] text-white px-6 py-2 rounded-full text-sm font-semibold transition-colors"
          >
            Log In
          </Link>
        )}

        {isLoggedIn && (
          <div className="flex items-center gap-2">
            {/* Notification Bell */}
            <button
              className="relative w-9 h-9 rounded-full flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
              aria-label="Notifications"
            >
              <BsBell size={18} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500" />
            </button>

            {/* Profile Dropdown (Desktop view behavior) */}
            <div className="relative hidden sm:block" ref={profileRef}>
              <button
                onClick={() => setProfileOpen((prev) => !prev)}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-full text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-[#49557E]/20 text-[#8b97c2] flex items-center justify-center text-sm font-bold">
                  {adminInitial}
                </div>
                <span className="text-sm font-medium text-slate-200 max-w-[120px] truncate">
                  {adminName}
                </span>
                <BsChevronDown
                  size={12}
                  className={`transition-transform ${profileOpen ? "rotate-180" : ""}`}
                />
              </button>

              {profileOpen && (
                <div className="absolute right-0 mt-2 w-60 bg-white border border-slate-200 rounded-xl shadow-lg py-1.5 z-50">
                  <div className="px-4 py-2.5 border-b border-slate-100 flex items-center gap-2.5 bg-slate-50/50">
                    <div className="w-7 h-7 rounded-lg bg-[#49557E]/10 text-[#49557E] flex items-center justify-center">
                      <BsPhone size={14} />
                    </div>
                    <div className="overflow-hidden">
                      <p className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">Phone Number</p>
                      <p className="text-xs font-bold text-slate-700 truncate">{adminPhone}</p>
                    </div>
                  </div>

                  <Link
                    to="/admin/profile"
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50"
                  >
                    <BsPersonCircle size={16} className="text-slate-400" />
                    My Profile
                  </Link>

                  <div className="border-t border-slate-100 my-1" />

                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 text-left"
                  >
                    <BsBoxArrowRight size={16} />
                    Logout
                  </button>
                </div>
              )}
            </div>

            {/* Mobile Menu Trigger Button */}
            <button
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              className="sm:hidden w-9 h-9 rounded-full flex items-center justify-center text-slate-300 hover:bg-white/5 transition-colors ml-1"
              aria-label="Toggle Mobile Menu"
            >
              {mobileMenuOpen ? <BsX size={24} /> : <BsList size={24} />}
            </button>
          </div>
        )}
      </div>

      {/* Mobile Dropdown Menu Drawer */}
      {isLoggedIn && mobileMenuOpen && (
        <div className="sm:hidden bg-slate-900 border-t border-slate-800 px-4 py-4 space-y-4 animate-fadeIn">
          {/* Admin Identity Header inside Mobile Menu */}
          <div className="flex items-center gap-3 px-3 py-2.5 bg-slate-950/60 rounded-xl border border-slate-800">
            <div className="w-10 h-10 rounded-full bg-[#49557E]/30 text-[#8b97c2] flex items-center justify-center text-base font-bold flex-shrink-0">
              {adminInitial}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-semibold text-white truncate">{adminName}</p>
              <p className="text-xs text-slate-400 truncate flex items-center gap-1 mt-0.5">
                <BsPhone size={12} /> {adminPhone}
              </p>
            </div>
          </div>

          {/* Navigation Links for Mobile */}
          <div className="space-y-1">
            <Link
              to="/admin/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-slate-200 hover:bg-white/5 transition-colors"
            >
              <BsGrid size={18} className="text-indigo-400" />
              Dashboard
            </Link>

            <Link
              to="/admin/profile"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-slate-200 hover:bg-white/5 transition-colors"
            >
              <BsPersonCircle size={18} className="text-slate-400" />
              My Profile
            </Link>
          </div>

          <div className="border-t border-slate-800 pt-2">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                handleLogout();
              }}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 transition-colors text-left"
            >
              <BsBoxArrowRight size={18} />
              Logout
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default AdminNavbar;