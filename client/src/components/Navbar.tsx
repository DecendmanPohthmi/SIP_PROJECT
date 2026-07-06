import { Link } from "react-router-dom";
import {
  BsTicketPerforated,
} from "react-icons/bs";

const Navbar = () => {
  return (
    <nav className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 text-2xl font-bold">
          <BsTicketPerforated size={28} />
          <span>EventNest</span>
        </Link>

        {/* Navigation */}
        <div className="flex items-center gap-6">
          <Link to="/" className="hover:text-gray-300">
            Home
          </Link>

          <Link to="/events" className="hover:text-gray-300">
            Events
          </Link>

          <Link to="/login" className="hover:text-gray-300">
            Login
          </Link>

          <Link
            to="/register"
            className="bg-white text-gray-900 px-4 py-2 rounded-md hover:bg-gray-200"
          >
            Sign Up
          </Link>
        </div>

      </div>
    </nav>
  );
};

export default Navbar;