import { Link, useNavigate } from "react-router-dom";
import {
  BsTicketPerforated,
  BsGrid,
  BsPeople,
  BsCalendarCheck,
  BsPerson,
  BsBoxArrowRight,
} from "react-icons/bs";
import { useAuth } from "../context/AuthContext.tsx";

const AdminNavbar = () => {
  const { token, logout } = useAuth();
  const navigate = useNavigate();
  const isLoggedIn = !!token;

  const handleLogout = () => {
    logout();
    navigate("/admin/login");
  };

  return (
    <nav className="bg-slate-950 border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-7 py-4 flex justify-between items-center">
        {/* Logo */}
        <Link
          to="/admin/dashboard"
          className="flex items-center gap-2 text-xl font-bold text-white"
        >
          <BsTicketPerforated size={24} />
          <span>EventNest</span>

          <span className="text-[10px] font-bold tracking-widest uppercase bg-white/10 text-indigo-300 px-2 py-1 rounded-full ml-1">
            Admin
          </span>
        </Link>

        {/* Navigation */}
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

            <li>
              <Link
                to="/admin/organisers"
                className="flex items-center gap-2 px-4 py-2 rounded-full text-slate-400 hover:text-white hover:bg-white/5"
              >
                <BsPeople size={17} />
                Organisers
              </Link>
            </li>

            <li>
              <Link
                to="/admin/events"
                className="flex items-center gap-2 px-4 py-2 rounded-full text-slate-400 hover:text-white hover:bg-white/5"
              >
                <BsCalendarCheck size={17} />
                Events
              </Link>
            </li>
          </ul>
        )}

        {/* Right Side */}
        {!isLoggedIn && (
          <Link
            to="/admin/login"
            className="border border-[#FF4C24] px-6 py-2 rounded-full text-[#49557E] hover:bg-[#fff4f2]"
          >
            LogIn
          </Link>
        )}
        {isLoggedIn && (
          <div className="flex items-center gap-3">
            <Link
              to="/admin/profile"
              className="w-9 h-9 rounded-full flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/5"
            >
              <BsPerson size={18} />
            </Link>

            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-sm text-slate-400 hover:text-red-400 transition-colors px-3 py-2"
            >
              <BsBoxArrowRight size={17} />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default AdminNavbar;