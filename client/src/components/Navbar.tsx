import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  BsTicketPerforated,
  BsSearch,
  BsGrid,
  BsPerson,
  BsHouseDoor,
  BsList,
  BsX,
} from "react-icons/bs";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const { token, role } = useAuth();
  const isLoggedIn = !!token;
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const dashboardPath =
    role === "organiser" ? "/organiser/dashboard" : "/dashboard";
  const homePath = role === "organiser" ? "/" : "/";
  const profilePath = role === "organiser" ? "/organiser/profile" : "/profile";

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);

  return (
    <nav className="relative z-50 max-w-7xl mx-4 md:mx-auto mt-4 md:mt-8 px-5 md:px-7 py-4 md:py-5 flex justify-between items-center bg-white shadow-lg rounded-2xl border border-slate-100">
      {/* Logo */}
      <Link
        to={homePath}
        onClick={closeMenu}
        className="flex items-center gap-2 text-xl md:text-2xl font-bold text-[#49557E]"
      >
        <BsTicketPerforated size={24} className="md:w-[28px] md:h-[28px]" />
        <span>EventNest</span>
      </Link>

      {/* Mobile Menu Toggle */}
      <button
        onClick={toggleMenu}
        className="md:hidden text-[#49557E] focus:outline-none hover:text-[#FF4C24] transition-colors"
      >
        {isMenuOpen ? <BsX size={30} /> : <BsList size={30} />}
      </button>

      {/* Nav Links & Actions (Desktop + Mobile Dropdown) */}
      <div
        className={`${
          isMenuOpen ? "flex" : "hidden"
        } absolute top-full left-0 w-full bg-white shadow-lg rounded-2xl p-6 mt-2 border border-slate-100 flex-col gap-6 md:static md:w-auto md:bg-transparent md:shadow-none md:border-none md:p-0 md:mt-0 md:flex md:flex-row md:items-center md:gap-8 transition-all`}
      >
        {/* Center Links */}
        <ul className="flex flex-col md:flex-row md:items-center gap-4 md:gap-6 text-[#49557E]">
          <li>
            <Link
              to={homePath}
              onClick={closeMenu}
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
                onClick={closeMenu}
                className="flex items-center gap-2 hover:text-[#FF4C24] transition-colors"
              >
                <BsGrid size={20} />
                <span>Dashboard</span>
              </Link>
            </li>
          )}
        </ul>

        {/* Right Side Actions */}
        <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-6 border-t md:border-none pt-4 md:pt-0 border-slate-100">
          {/* Search */}
          {(!isLoggedIn || role !== "organiser") && (
            <div className="relative w-full md:w-52">
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
          )}

          {/* Sign Up */}
          {!isLoggedIn && (
            <Link
              to="/register"
              onClick={closeMenu}
              className="border border-[#FF4C24] px-6 py-2 rounded-full text-[#49557E] hover:bg-[#fff4f2] text-center"
            >
              Sign Up
            </Link>
          )}

          {/* Profile */}
          {isLoggedIn && (
            <Link
              to={profilePath}
              onClick={closeMenu}
              className="flex items-center gap-3 text-[#49557E] hover:text-[#FF4C24] transition-colors"
            >
              <BsPerson size={26} />
              {/* Text label only visible on mobile for easier navigation */}
              <span className="md:hidden font-medium">My Profile</span>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;