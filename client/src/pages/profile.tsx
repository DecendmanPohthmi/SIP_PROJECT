import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  BsPerson,
  BsTicketDetailed,
  BsBoxArrowRight,
  BsPencilSquare,
  BsEnvelope,
  BsTelephone,
  BsCalendarCheck,
  BsBagCheck,
} from "react-icons/bs";
import { useAuth } from "../context/AuthContext";

const ProfilePage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const isActive = (path: string) => location.pathname === path;

  const menuItems = [
    { label: "My Profile", path: "/profile", icon: <BsPerson size={18} /> },
    { label: "My Bookings", path: "/myBooking", icon: <BsTicketDetailed size={18} /> },
  ];

  const handleLogout = () => {
    logout();
    navigate("/", { replace: true });
  };

  return (
    <div className="max-w-7xl mx-auto mt-8 px-6 pb-16 grid grid-cols-1 md:grid-cols-4 gap-6">

      {/* Main content area */}
      <div className="md:col-span-3 space-y-6">

        {/* Profile Header Card */}
        <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-8 flex items-center justify-between flex-wrap gap-6">
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-900 via-purple-900 to-violet-950 flex items-center justify-center text-white text-2xl font-bold">
              DM
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-800">Decend Man</h1>
              <p className="text-sm text-slate-500">Member since Jan 2026</p>
            </div>
          </div>

          <button className="flex items-center gap-2 border border-[#FF4C24] text-[#49557E] px-5 py-2.5 rounded-full text-sm font-medium hover:bg-[#fff4f2] transition-colors">
            <BsPencilSquare size={16} />
            Edit Profile
          </button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-xl">
              <BsBagCheck />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800">12</p>
              <p className="text-sm text-slate-500">Total Bookings</p>
            </div>
          </div>

          <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-xl">
              <BsCalendarCheck />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800">3</p>
              <p className="text-sm text-slate-500">Upcoming Events</p>
            </div>
          </div>
        </div>

        {/* Account Details */}
        <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-8">
          <h2 className="text-lg font-bold text-slate-800 mb-6">Account Details</h2>

          <div className="space-y-5">
            <div className="flex items-center gap-4 pb-5 border-b border-slate-100">
              <div className="w-10 h-10 rounded-lg bg-slate-50 text-[#49557E] flex items-center justify-center">
                <BsPerson size={18} />
              </div>
              <div>
                <p className="text-xs text-slate-400 uppercase tracking-wide">Full Name</p>
                <p className="text-base text-slate-800 font-medium">Decend Man</p>
              </div>
            </div>

            <div className="flex items-center gap-4 pb-5 border-b border-slate-100">
              <div className="w-10 h-10 rounded-lg bg-slate-50 text-[#49557E] flex items-center justify-center">
                <BsEnvelope size={18} />
              </div>
              <div>
                <p className="text-xs text-slate-400 uppercase tracking-wide">Email Address</p>
                <p className="text-base text-slate-800 font-medium">decend@example.com</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-slate-50 text-[#49557E] flex items-center justify-center">
                <BsTelephone size={18} />
              </div>
              <div>
                <p className="text-xs text-slate-400 uppercase tracking-wide">Phone Number</p>
                <p className="text-base text-slate-800 font-medium">+91 98765 43210</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Sidebar */}
      <div className="md:col-span-1 bg-white border border-slate-100 rounded-2xl shadow-sm p-4 h-fit">
        <nav className="flex flex-col gap-1">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-colors ${
                isActive(item.path)
                  ? "bg-[#fff4f2] text-[#FF4C24] font-semibold"
                  : "text-[#49557E] hover:bg-slate-50"
              }`}
            >
              {item.icon}
              {item.label}
            </Link>
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