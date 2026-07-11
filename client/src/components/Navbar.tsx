import { Link } from "react-router-dom";
import {
  BsTicketPerforated,
  BsSearch,
  BsGrid,
  BsPerson,
  BsHouseDoor,
} from "react-icons/bs";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const { token, role } = useAuth();
  const isLoggedIn = !!token;

  const dashboardPath = role === "organiser" ? "/organiser/dashboard" : "/dashboard";
  const homePath = role === "organiser" ? "/" : "/";

  return (
    <nav className="max-w-7xl mx-auto mt-8 px-7 py-5 flex justify-between items-center bg-white shadow-lg rounded-2xl border border-slate-100">
      {/* Logo */}
      <Link
        to={homePath}
        className="flex items-center gap-2 w-[150px] text-2xl font-bold text-[#49557E]"
      >
        <BsTicketPerforated size={28} />
        <span>EventNest</span>
      </Link>

      <ul className="hidden md:flex items-center gap-6 text-[#49557E]">
        <li>
          <Link
            to={homePath}
            className="flex items-center gap-2 hover:text-[#FF4C24] transition-colors"
          >
            <BsHouseDoor size={20} />
            <span>Home</span>
          </Link>
        </li>

        {isLoggedIn && (
          <li>
            <Link
              to={dashboardPath}
              className="flex items-center gap-2 hover:text-[#FF4C24] transition-colors"
            >
              <BsGrid size={20} />
              <span>Dashboard</span>
            </Link>
          </li>
        )}
      </ul>

      {/* Right Side */}
      <div className="flex items-center gap-6">
        {/* Search */}
        <div className="relative w-52">
          <BsSearch
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[#49557E]"
          />

          <input
            type="text"
            placeholder="Search..."
            className="w-full pl-9 pr-3 py-2 text-sm rounded-full border border-gray-300 focus:outline-none focus:border-[#49557E]"
          />
        </div>

        {/* Sign Up — only show when NOT logged in */}
        {!isLoggedIn && (
          <Link
            to="/register"
            className="border border-[#FF4C24] px-6 py-2 rounded-full text-[#49557E] hover:bg-[#fff4f2]"
          >
            Sign Up
          </Link>
        )}

        {/* Profile — only show when logged in */}
        {isLoggedIn && (
          <Link to="/profile">
            <BsPerson
              size={26}
              className="text-[#49557E] cursor-pointer hover:text-[#FF4C24] transition-colors"
            />
          </Link>
        )}
      </div>
    </nav>
  );
};

export default Navbar;