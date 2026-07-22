import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Navbar from "./components/Navbar.tsx";
import Home from "./pages/Home.tsx";
import EventDetail from "./pages/EventDetail.tsx";
import Login from "./pages/Login.tsx";
import Register from "./pages/Register.tsx";
import UserDashboard from "./pages/UserDashboard.tsx";
import Profile from "./pages/profile.tsx";
import OtpValidator from "./components/verifyOtp.tsx";
import OrganiserDashboard from "./pages/OrganiserDashboard.tsx";
import OrganiserHome from "./pages/OrganiserHome.tsx";
import CreateEvent from "./pages/CreateEvent.tsx";
import ManageTickets from "./pages/ManageTicket.tsx";
import ProfilePage from "./pages/OrganiserProfile.tsx";
import TicketPage from "./pages/TicketPage.tsx";

const HomeRouter = () => {
  const { token, role } = useAuth();

  if (!token || role === "user") return <Home />;
  if (role === "organiser") return <OrganiserHome />;
  return <Home />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Navbar />

        <Routes>
          <Route path="/" element={<HomeRouter />} />

          <Route path="/events/:id" element={<EventDetail />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/organiser/profile" element={<ProfilePage />} />
          <Route path="/dashboard" element={<UserDashboard />} />
          <Route path="/verify" element={<OtpValidator />} />
          <Route path="/organiser/dashboard" element={<OrganiserDashboard />} />
          <Route path="/organiser/events/:id/tickets" element={<ManageTickets />} />
          <Route path="/organiser/create-event" element={<CreateEvent />} />
          <Route path="/my-bookings/:id" element={<TicketPage />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;