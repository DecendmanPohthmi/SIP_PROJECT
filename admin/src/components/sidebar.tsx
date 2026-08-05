import React, { useState } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import {
  BsGrid,
  BsCalendarEvent,
  BsPeopleFill,
  BsPerson,
  BsArrowCounterclockwise,
  BsCashCoin,
  BsBoxArrowRight,
  BsList,
  BsX,
} from "react-icons/bs";
import { useAuth } from "../context/AuthContext";

const navItems = [
  { path: "/admin/dashboard", label: "Home", icon: <BsGrid size={18} /> },
  { path: "/admin/events", label: "Event", icon: <BsCalendarEvent size={18} /> },
  { path: "/admin/organisers", label: "Organiser", icon: <BsPeopleFill size={18} /> },
  { path: "/admin/users", label: "User", icon: <BsPerson size={18} /> },
  { path: "/admin/refunds", label: "Request Refund", icon: <BsArrowCounterclockwise size={18} /> },
  { path: "/admin/withdrawals", label: "Request Withdraw", icon: <BsCashCoin size={18} /> },
];

const AdminLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/admin/login", { replace: true });
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* Mobile Top Navigation Bar */}
      <div className="md:hidden bg-slate-950 text-white px-4 py-3 flex items-center justify-between border-b border-slate-800 sticky top-0 z-40">
        <span className="font-bold text-sm tracking-wide text-slate-200">Admin Panel</span>
        <button
          onClick={() => setMobileMenuOpen((prev) => !prev)}
          className="w-9 h-9 rounded-lg flex items-center justify-center text-slate-300 hover:bg-slate-900 transition-colors"
          aria-label="Toggle Menu"
        >
          {mobileMenuOpen ? <BsX size={22} /> : <BsList size={22} />}
        </button>
      </div>

      {/* Mobile Slide-down / Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-slate-950 border-b border-slate-800 px-4 py-3 flex flex-col gap-1 sticky top-[57px] z-30 shadow-xl animate-fadeIn">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-colors ${
                  isActive
                    ? "bg-[#49557E] text-white font-semibold"
                    : "text-slate-400 hover:bg-slate-900 hover:text-slate-200"
                }`}
              >
                {item.icon}
                {item.label}
              </Link>
            );
          })}
          <div className="border-t border-slate-800 pt-2 mt-1">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                handleLogout();
              }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs text-slate-400 hover:bg-slate-900 hover:text-red-400 transition-colors text-left"
            >
              <BsBoxArrowRight size={18} />
              Logout
            </button>
          </div>
        </div>
      )}

      {/* Desktop Left Sidebar */}
      <div className="hidden md:flex w-64 shrink-0 bg-slate-950 min-h-screen flex-col">
        {/* Nav */}
        <nav className="flex-1 px-4 py-6 flex flex-col gap-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  isActive
                    ? "bg-[#49557E] text-white font-semibold"
                    : "text-slate-400 hover:bg-slate-900 hover:text-slate-200"
                }`}
              >
                {item.icon}
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="px-4 py-6 border-t border-slate-800">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-400 hover:bg-slate-900 hover:text-red-400 transition-colors"
          >
            <BsBoxArrowRight size={18} />
            Logout
          </button>
        </div>
      </div>

      {/* Main content area */}
      <div className="flex-1 min-w-0 px-4 py-6 md:px-8 md:py-8">
        <Outlet />
      </div>
    </div>
  );
};

export default AdminLayout;