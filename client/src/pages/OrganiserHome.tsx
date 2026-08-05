import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  BsCashStack,
  BsShieldCheck,
  BsSpeedometer2,
  BsMegaphone,
  BsCheckCircleFill,
  BsArrowRight,
  BsGraphUp,
  BsPeople,
  BsCalendarCheck,
  BsChevronDown
} from "react-icons/bs";
import { useAuth } from "../context/AuthContext";

const API = (import.meta as any).env?.VITE_API_URL || "http://localhost:4000";

const OrganiserHome = () => {
  const navigate = useNavigate();
  const { token } = useAuth();
  const isLoggedIn = !!token;

  const [stats, setStats] = useState({
    activeOrganisers: "27+",
    eventsHosted: "180+",
    totalPaidOut: "₹4.8L+",
    ticketsSold: "3,200+"
  });
  const [, setLoadingStats] = useState(true);

  // FAQ Accordion State
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  useEffect(() => {
    const fetchPlatformStats = async () => {
      try {
        const res = await fetch(`${API}/api/events/stats`);
        const data = await res.json();
        
        if (data.success) {
          const formatNumber = (num: number) => (num ? `${num.toLocaleString('en-IN')}+` : "0+");
          
          const rawAmount = Number(data.totalAmount || 0);
          let formattedAmount = `₹${rawAmount.toLocaleString('en-IN')}+`;
          if (rawAmount >= 100000) {
            formattedAmount = `₹${(rawAmount / 100000).toFixed(1)}L+`;
          }

          setStats({
            activeOrganisers: formatNumber(data.totalOrganisers),
            eventsHosted: formatNumber(data.totalEvents),
            totalPaidOut: rawAmount > 0 ? formattedAmount : "₹0+",
            ticketsSold: formatNumber(data.totalTickets)
          });
        }
      } catch (err) {
        console.error("Could not fetch live platform stats, using default values.", err);
      } finally {
        setLoadingStats(false);
      }
    };

    fetchPlatformStats();
  }, []);

  const handleStartHosting = () => {
    if (isLoggedIn) {
      navigate("/organiser/create-event");
    } else {
      navigate("/register");
    }
  };

  const handleBottomCta = () => {
    if (isLoggedIn) {
      navigate("/organiser/create-event");
    } else {
      navigate("/login");
    }
  };

  const faqs = [
    {
      question: "How do I get paid for the tickets I sell?",
      answer: "All earnings from your ticket sales are tracked securely in your organiser dashboard. You can request payouts straight to your registered bank account or UPI ID anytime via your profile."
    },
    {
      question: "Is there a fee to list events on EventNest?",
      answer: "Listing free events is completely free! For paid events, we maintain transparent pricing with low platform processing fees so you keep maximum profits from your ticket sales."
    },
    {
      question: "How do I check in attendees at the venue?",
      answer: "You can use the built-in QR code ticket scanner right from your mobile phone or laptop browser to instantly verify and check in guests at the door."
    },
    {
      question: "How long does organiser verification take?",
      answer: "Our team reviews new organiser sign-ups swiftly to ensure community safety. Most accounts are reviewed and verified within a few hours."
    }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-[#f8f9fa]">

      {/* Hero Section */}
      <div className="relative mx-4 sm:mx-8 mt-6 bg-slate-900 text-white rounded-3xl overflow-hidden shadow-xl border border-slate-700/50">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-pink-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative p-8 sm:p-14 md:p-16 text-center flex flex-col items-center z-10">
          <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-pink-500/20 text-pink-300 border border-pink-500/30 mb-4 shadow-sm backdrop-blur-sm">
            For Organisers
          </span>

          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black mb-4 sm:mb-6 leading-tight tracking-tight text-white">
            Host Events That <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-indigo-300">
              Actually Fill Up
            </span>
          </h1>

          <p className="text-slate-300 text-sm sm:text-base md:text-lg max-w-xl mx-auto font-normal leading-relaxed mb-8">
            From ticketing to live QR check-ins, EventNest gives you everything you need to plan, promote, and profit from your events.
          </p>

          <div className="flex flex-col sm:flex-row w-full sm:w-auto justify-center gap-3 sm:gap-4">
            <button
              onClick={handleStartHosting}
              className="w-full sm:w-auto justify-center bg-[#e31b88] hover:bg-[#c71575] text-white px-8 py-3 rounded-xl font-bold transition-all shadow-md shadow-pink-500/20 flex items-center gap-2 text-sm sm:text-base cursor-pointer"
            >
              Start Hosting <BsArrowRight size={16} />
            </button>
            {!isLoggedIn && (
              <Link
                to="/login"
                className="w-full sm:w-auto justify-center border border-slate-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-white/5 transition-colors text-sm sm:text-base text-center"
              >
                I Already Have an Account
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Why Host With Us */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 mx-4 sm:mx-8 my-10">

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/80 flex flex-col items-center text-center hover:-translate-y-1 hover:shadow-md transition-all duration-300 hover:border-pink-200">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-lg mb-4 shadow-sm bg-pink-50 text-[#e31b88]">
            <BsCashStack />
          </div>
          <h3 className="text-base font-bold text-slate-900 mb-2">Get Paid Fast</h3>
          <p className="text-slate-500 text-xs sm:text-sm leading-relaxed">Track every ticket sale in real time and see your earnings roll in as your event fills up.</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/80 flex flex-col items-center text-center hover:-translate-y-1 hover:shadow-md transition-all duration-300 hover:border-pink-200">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-lg mb-4 shadow-sm bg-pink-50 text-[#e31b88]">
            <BsSpeedometer2 />
          </div>
          <h3 className="text-base font-bold text-slate-900 mb-2">Simple Dashboard</h3>
          <p className="text-slate-500 text-xs sm:text-sm leading-relaxed">Manage every event, ticket, waitlist queue, and attendee from one clean dashboard.</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/80 flex flex-col items-center text-center hover:-translate-y-1 hover:shadow-md transition-all duration-300 hover:border-pink-200 sm:col-span-2 md:col-span-1">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-lg mb-4 shadow-sm bg-pink-50 text-[#e31b88]">
            <BsMegaphone />
          </div>
          <h3 className="text-base font-bold text-slate-900 mb-2">Built-In Reach</h3>
          <p className="text-slate-500 text-xs sm:text-sm leading-relaxed">Your event gets listed where people are already searching for things to do nearby.</p>
        </div>

      </div>

      {/* How It Works */}
      <div className="mx-4 sm:mx-8 mb-10">
        <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight mb-6 text-center">
          How It Works
        </h2>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">

          <div className="text-center p-5 bg-white rounded-2xl border border-slate-200/80 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-pink-50 text-[#e31b88] flex items-center justify-center text-sm font-black mx-auto mb-3">
              1
            </div>
            <p className="font-bold text-slate-900 text-sm sm:text-base mb-1">Sign Up</p>
            <p className="text-xs text-slate-500">Register as an organiser in under two minutes.</p>
          </div>

          <div className="text-center p-5 bg-white rounded-2xl border border-slate-200/80 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-pink-50 text-[#e31b88] flex items-center justify-center text-sm font-black mx-auto mb-3">
              2
            </div>
            <p className="font-bold text-slate-900 text-sm sm:text-base mb-1">Get Verified</p>
            <p className="text-xs text-slate-500">Our team reviews your application quickly.</p>
          </div>

          <div className="text-center p-5 bg-white rounded-2xl border border-slate-200/80 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-pink-50 text-[#e31b88] flex items-center justify-center text-sm font-black mx-auto mb-3">
              3
            </div>
            <p className="font-bold text-slate-900 text-sm sm:text-base mb-1">Create Event</p>
            <p className="text-xs text-slate-500">Add details, set capacity limits, and publish.</p>
          </div>

          <div className="text-center p-5 bg-white rounded-2xl border border-slate-200/80 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-pink-50 text-[#e31b88] flex items-center justify-center text-sm font-black mx-auto mb-3">
              4
            </div>
            <p className="font-bold text-slate-900 text-sm sm:text-base mb-1">Start Selling</p>
            <p className="text-xs text-slate-500">Your event goes live for attendees to book & check-in.</p>
          </div>

        </div>
      </div>

      {/* Trust / Stats Strip */}
      <div className="bg-slate-900 text-white mx-4 sm:mx-8 rounded-3xl p-8 mb-10 shadow-xl border border-slate-800">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div className="flex flex-col items-center">
            <BsPeople className="text-pink-400 mb-2 w-5 h-5" />
            <p className="text-2xl sm:text-3xl font-black">{stats.activeOrganisers}</p>
            <p className="text-xs sm:text-sm text-slate-400 mt-0.5">Active Organisers</p>
          </div>
          <div className="flex flex-col items-center">
            <BsCalendarCheck className="text-pink-400 mb-2 w-5 h-5" />
            <p className="text-2xl sm:text-3xl font-black">{stats.eventsHosted}</p>
            <p className="text-xs sm:text-sm text-slate-400 mt-0.5">Events Hosted</p>
          </div>
          <div className="flex flex-col items-center">
            <BsCashStack className="text-pink-400 mb-2 w-5 h-5" />
            <p className="text-2xl sm:text-3xl font-black">{stats.totalPaidOut}</p>
            <p className="text-xs sm:text-sm text-slate-400 mt-0.5">Total Revenue Generated</p>
          </div>
          <div className="flex flex-col items-center">
            <BsGraphUp className="text-pink-400 mb-2 w-5 h-5" />
            <p className="text-2xl sm:text-3xl font-black">{stats.ticketsSold}</p>
            <p className="text-xs sm:text-sm text-slate-400 mt-0.5">Tickets Sold</p>
          </div>
        </div>
      </div>

      {/* What You Get */}
      <div className="mx-4 sm:mx-8 mb-10 bg-white border border-slate-200/80 rounded-3xl shadow-sm p-8">
        <h2 className="text-lg sm:text-xl font-bold text-slate-900 mb-6">Everything included, no hidden fees</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex items-center gap-3">
            <BsCheckCircleFill className="text-[#e31b88] flex-shrink-0" />
            <span className="text-slate-600 text-xs sm:text-sm font-medium">Real-time ticket sales & seat tracking</span>
          </div>
          <div className="flex items-center gap-3">
            <BsCheckCircleFill className="text-[#e31b88] flex-shrink-0" />
            <span className="text-slate-600 text-xs sm:text-sm font-medium">Automated email confirmations & alerts</span>
          </div>
          <div className="flex items-center gap-3">
            <BsCheckCircleFill className="text-[#e31b88] flex-shrink-0" />
            <span className="text-slate-600 text-xs sm:text-sm font-medium">Capacity & waitlist queue management</span>
          </div>
          <div className="flex items-center gap-3">
            <BsCheckCircleFill className="text-[#e31b88] flex-shrink-0" />
            <span className="text-slate-600 text-xs sm:text-sm font-medium">Built-in QR code ticket check-in scanner</span>
          </div>
          <div className="flex items-center gap-3">
            <BsCheckCircleFill className="text-[#e31b88] flex-shrink-0" />
            <span className="text-slate-600 text-xs sm:text-sm font-medium">Verified organiser badge & profile</span>
          </div>
          <div className="flex items-center gap-3">
            <BsCheckCircleFill className="text-[#e31b88] flex-shrink-0" />
            <span className="text-slate-600 text-xs sm:text-sm font-medium">Priority support team</span>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="mx-4 sm:mx-8 mb-10 max-w-4xl w-full self-center">
        <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight mb-2 text-center">
          Frequently Asked Questions
        </h2>
        <p className="text-slate-500 text-xs sm:text-sm text-center mb-6">
          Got questions about hosting? We’ve got answers.
        </p>

        <div className="space-y-3">
          {faqs.map((faq, index) => {
            const isOpen = openFaq === index;
            return (
              <div
                key={index}
                className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-sm transition-all"
              >
                <button
                  onClick={() => setOpenFaq(isOpen ? null : index)}
                  className="w-full flex items-center justify-between p-5 text-left font-bold text-slate-900 text-sm sm:text-base hover:bg-slate-50 transition-colors"
                >
                  <span>{faq.question}</span>
                  <BsChevronDown
                    size={16}
                    className={`text-slate-400 shrink-0 transition-transform duration-300 ${
                      isOpen ? "rotate-180 text-[#e31b88]" : ""
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 text-slate-600 text-xs sm:text-sm leading-relaxed border-t border-slate-100 pt-3">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* CTA */}
      <div className="mx-4 sm:mx-8 mb-16 text-center bg-slate-900 text-white rounded-3xl p-8 sm:p-12 shadow-xl border border-slate-700/50 relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-pink-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center">
          <BsShieldCheck size={32} className="mx-auto mb-3 text-pink-400" />
          <h2 className="text-xl sm:text-2xl font-bold mb-2">Ready to host your first event?</h2>
          <p className="text-slate-300 text-xs sm:text-sm mb-6 max-w-md mx-auto">
            Join successful organisers growing their community and audience through EventNest.
          </p>
          <button
            onClick={handleBottomCta}
            className="inline-flex items-center justify-center gap-2 w-full sm:w-auto bg-[#e31b88] hover:bg-[#c71575] text-white px-8 py-3.5 rounded-xl font-bold transition-all shadow-md shadow-pink-500/20 text-sm sm:text-base cursor-pointer"
          >
            Become an Organiser <BsArrowRight size={16} />
          </button>
        </div>
      </div>

    </div>
  );
};

export default OrganiserHome;