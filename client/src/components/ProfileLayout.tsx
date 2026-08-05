import React from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import {
  BsPerson,
  BsTicketDetailed,
  BsBoxArrowRight,
  BsReceiptCutoff,
} from "react-icons/bs";
import { useAuth } from "../context/AuthContext";

const tabs = [
  { path: "/profile", label: "My Profile", icon: <BsPerson size={18} /> },
  { path: "/profile/bookings", label: "My Bookings", icon: <BsTicketDetailed size={18} /> },
  { path: "/profile/transactions", label: "Transactions", icon: <BsReceiptCutoff size={18} /> },
];

const ProfileLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/", { replace: true });
  };

  return (
    <div className="max-w-7xl mx-auto mt-4 sm:mt-8 px-4 sm:px-6 pb-16 grid grid-cols-1 md:grid-cols-4 gap-6">
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.4s ease-out both;
        }
      `}</style>

      {/* Navigation Sidebar */}
      <div className="md:col-span-1 bg-white border border-slate-100 rounded-2xl shadow-sm p-3 sm:p-4 h-fit md:order-last">
        <nav className="flex flex-row md:flex-col overflow-x-auto no-scrollbar gap-1.5 sm:gap-1">
          {tabs.map((tab) => {
            const isActive = location.pathname === tab.path;
            return (
              <button
                key={tab.path}
                onClick={() => navigate(tab.path)}
                className={`flex items-center gap-2.5 sm:gap-3 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm whitespace-nowrap transition-all duration-300 shrink-0 w-full text-left ${
                  isActive
                    ? "bg-[#fff4f2] text-[#FF4C24] font-semibold shadow-sm scale-[1.02]"
                    : "text-[#49557E] hover:bg-slate-50 hover:pl-5"
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            );
          })}

          <hr className="hidden md:block my-2 border-slate-100" />

          <button
            onClick={handleLogout}
            className="flex items-center gap-2.5 sm:gap-3 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm text-red-500 hover:bg-red-50 hover:pl-5 transition-all duration-300 shrink-0 ml-auto md:ml-0"
          >
            <BsBoxArrowRight size={18} />
            <span>Logout</span>
          </button>
        </nav>
      </div>

      {/* Main Content Area — filled by whichever page is active */}
      <div className="md:col-span-3 space-y-4 sm:space-y-6">
        <Outlet />
      </div>
    </div>
  );
};

export default ProfileLayout;