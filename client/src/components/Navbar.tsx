import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  BsTicketPerforated,
  BsGrid,
  BsPerson,
  BsHouseDoor,
  BsInfoCircle,
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
  const homePath = "/";
  const profilePath = role === "organiser" ? "/organiser/profile" : "/profile";

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);

  return (
    <nav className="relative z-50 max-w-7xl mx-4 md:mx-auto mt-4 md:mt-6 px-5 md:px-8 py-3.5 md:py-4 flex justify-between items-center bg-white/90 backdrop-blur-md shadow-lg shadow-slate-100 rounded-2xl border border-slate-200/80 transition-all">
      {/* Brand Logo */}
      <Link
        to={homePath}
        onClick={closeMenu}
        className="flex items-center gap-2.5 text-xl md:text-2xl font-black text-slate-900 hover:text-[#e31b88] transition-colors"
      >
        <div className="p-1.5 bg-pink-50 border border-pink-100 rounded-xl flex items-center justify-center shadow-sm">
          <img
            src="/logo_rb.png"
            alt="EventNest Logo"
            className="w-10 h-10 object-contain"
          />
        </div>
        <span className="tracking-tight">EventNest</span>
      </Link>

      {/* Mobile Menu Toggle Button */}
      <button
        onClick={toggleMenu}
        aria-label="Toggle navigation menu"
        className="md:hidden p-2 text-slate-700 hover:text-[#e31b88] bg-slate-50 hover:bg-pink-50 rounded-xl transition-all active:scale-95"
      >
        {isMenuOpen ? <BsX size={26} /> : <BsList size={26} />}
      </button>

      {/* Nav Links & Actions Container */}
      <div
        className={`${
          isMenuOpen ? "flex" : "hidden"
        } absolute top-[calc(100%+0.75rem)] left-0 right-0 w-full bg-white/95 backdrop-blur-xl shadow-xl rounded-2xl p-6 border border-slate-200/80 flex-col gap-6 md:static md:w-auto md:bg-transparent md:shadow-none md:border-none md:p-0 md:flex md:flex-row md:items-center md:gap-8 transition-all duration-200 ease-in-out`}
      >
        {/* Navigation Links */}
        <ul className="flex flex-col md:flex-row md:items-center gap-3 md:gap-7 text-slate-700 font-medium text-sm">
          <li>
            <Link
              to={homePath}
              onClick={closeMenu}
              className="flex items-center gap-3 md:gap-2 px-3 py-2 md:p-0 rounded-xl hover:bg-pink-50 md:hover:bg-transparent hover:text-[#e31b88] transition-colors"
            >
              <BsHouseDoor size={18} className="text-slate-400" />
              <span>Home</span>
            </Link>
          </li>

          {/* Dashboard Link (When Logged In) */}
          {isLoggedIn && (
            <li>
              <Link
                to={dashboardPath}
                onClick={closeMenu}
                className="flex items-center gap-3 md:gap-2 px-3 py-2 md:p-0 rounded-xl hover:bg-pink-50 md:hover:bg-transparent hover:text-[#e31b88] transition-colors"
              >
                <BsGrid size={18} className="text-slate-400" />
                <span>Dashboard</span>
              </Link>
            </li>
          )}

          {/* About Us Link */}
          <li>
            <Link
              to="/about"
              onClick={closeMenu}
              className="flex items-center gap-3 md:gap-2 px-3 py-2 md:p-0 rounded-xl hover:bg-pink-50 md:hover:bg-transparent hover:text-[#e31b88] transition-colors"
            >
              <BsInfoCircle size={18} className="text-slate-400" />
              <span>About Us</span>
            </Link>
          </li>
        </ul>

        {/* Right Action Items */}
        <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-6 border-t md:border-none pt-4 md:pt-0 border-slate-100">
          {/* Sign Up Button */}
          {!isLoggedIn && (
            <Link
              to="/register"
              onClick={closeMenu}
              className="w-full md:w-auto bg-[#e31b88] hover:bg-[#c81678] text-white font-semibold text-xs md:text-sm px-6 py-2.5 rounded-full text-center shadow-md shadow-pink-500/30 transition-all active:scale-95"
            >
              Sign Up
            </Link>
          )}

          {/* User Profile Navigation */}
          {isLoggedIn && (
            <Link
              to={profilePath}
              onClick={closeMenu}
              className="flex items-center gap-3 px-3 py-2 md:p-0 rounded-xl text-slate-700 hover:text-[#e31b88] transition-colors"
            >
              <div className="w-9 h-9 rounded-full bg-pink-50 border border-pink-100 flex items-center justify-center text-[#e31b88]">
                <BsPerson size={20} />
              </div>
              <span className="md:hidden text-sm font-medium">My Profile</span>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
