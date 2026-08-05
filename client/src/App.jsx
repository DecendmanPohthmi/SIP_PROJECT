import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Navbar from "./components/Navbar.tsx";
import Home from "./pages/UserHome.tsx";
import EventDetail from "./pages/EventDetail.tsx";
import Login from "./pages/Login.tsx";
import Register from "./pages/ClientRegister.tsx";
import UserDashboard from "./pages/UserDashboard.tsx";
import OtpValidator from "./components/verifyOtp.tsx";
import OrganiserDashboard from "./pages/OrganiserDashboard.tsx";
import OrganiserHome from "./pages/OrganiserHome.tsx";
import CreateEvent, { EditEvent } from "./pages/CreateEvent.tsx";
import ManageTickets from "./pages/ManageTicket.tsx";
import ProfilePage from "./pages/OrganiserProfile.tsx";
import TicketPage from "./pages/TicketPage.tsx";
import RefundPage from "./pages/Refundpage.tsx";
import OrganiserWithdraw from "./pages/OrganiserWithdraw.tsx";
import LiveEventAttendeePage from "./pages/AttendeePage.tsx";
import AboutPage from "./pages/AboutPage.tsx";

// New — split attendee profile pages
import ProfileLayout from "./components/ProfileLayout.tsx";
import MyProfile from "./pages/MyProfile.tsx";
import MyBookings from "./pages/MyBookings.tsx";
import Transactions from "./pages/Transactions.tsx";

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
          <Route path="/about" element={<AboutPage />} />
          <Route path="/events/:id" element={<EventDetail />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Attendee profile — now three nested pages under one sidebar layout */}
          <Route path="/profile" element={<ProfileLayout />}>
            <Route index element={<MyProfile />} />
            <Route path="bookings" element={<MyBookings />} />
            <Route path="transactions" element={<Transactions />} />
          </Route>

          <Route path="/organiser/profile" element={<ProfilePage />} />
          <Route path="/dashboard" element={<UserDashboard />} />
          <Route path="/verify" element={<OtpValidator />} />
          <Route path="/organiser/dashboard" element={<OrganiserDashboard />} />
          <Route path="/organiser/events/:id/tickets" element={<ManageTickets />} />
          <Route path="/organiser/create-event" element={<CreateEvent />} />
          <Route path="/organiser/edit-event/:id" element={<EditEvent />} />
          <Route path="/organiser/event/:eventId/attendees" element={<LiveEventAttendeePage />} />
          <Route path="/my-bookings/:id" element={<TicketPage />} />
          <Route path="/refund-page" element={<RefundPage/>} />
          <Route path="/organiser/withdraw" element={<OrganiserWithdraw />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;