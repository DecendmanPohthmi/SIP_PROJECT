import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar.tsx";
import Home from "./pages/Home.tsx";
import EventDetail from "./pages/EventDetail.tsx";
import Login from "./pages/Login.tsx";
import Register from "./pages/Register.tsx";
import UserDashboard from "./pages/UserDashboard.tsx";
import Profile from "./pages/profile.tsx";
import OtpValidator from "./components/verifyOtp.tsx";

function App() {
  return (
    <Router>
      <Navbar />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/events/:id" element={<EventDetail />} />{" "}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/dashboard" element={<UserDashboard />} />
        <Route path="/verify" element={<OtpValidator/>} />
        {/* <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/payment-success" element={<PaymentSuccess />} />
        <Route path="/payment-failed" element={<PaymentFailed />} />
        <Route
          path="*"
          element={
            <h1 className="text-3xl font-bold text-center mt-20">
              404 - Page Not Found
            </h1>
          }
        /> */}
      </Routes>
    </Router>
  );
}

export default App;
