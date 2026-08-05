import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  BsCalendarCheck,
  BsTicketPerforated,
  BsGraphUp,
  BsShieldCheck,
  BsSearch,
  BsQrCodeScan,
  BsHeart,
  BsBuilding,
  BsEnvelope,
  BsTelephone,
  BsGeoAlt,
  BsClock,
  BsArrowRight,
  BsSend,
  BsCheckCircle,
} from "react-icons/bs";
import { useAuth } from "../context/AuthContext";

const API = (import.meta as any).env?.VITE_API_URL || "http://localhost:4000";

interface PlatformStats {
  totalOrganisers: number;
  totalEvents: number;
  totalTickets: number;
  totalAttendees: number;
}

export const AboutPage = () => {
  const navigate = useNavigate();
  const { token, role } = useAuth();
  const isLoggedIn = !!token;

  const isOrganiser = isLoggedIn && role === "organiser";
  const isAttendee = isLoggedIn && role === "attendee";

  // Real Stats State
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [loadingStats, setLoadingStats] = useState<boolean>(true);

  // Form State
  const [sending, setSending] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Fetch real statistics from backend API
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch(`${API}/api/events/stats`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (response.ok) {
          const data = await response.json();
          setStats({
            totalOrganisers: data.totalOrganisers ?? data.organisersCount ?? 0,
            totalEvents: data.totalEvents ?? data.eventsCount ?? 0,
            totalTickets: data.totalTickets ?? data.ticketsSoldCount ?? 0,
            totalAttendees: data.totalAttendees ?? data.attendeesCount ?? 0,
          });
        }
      } catch (error) {
        console.error("Error fetching stats from backend:", error);
      } finally {
        setLoadingStats(false);
      }
    };

    fetchStats();
  }, [token]);

  // Format large numbers (e.g. 1500 -> 1.5K+)
  const formatStatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M+`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K+`;
    return `${num}`;
  };

  const statCards = [
    {
      label: "Active Organisers",
      value: stats ? formatStatNumber(stats.totalOrganisers) : "0",
    },
    {
      label: "Events Hosted",
      value: stats ? formatStatNumber(stats.totalEvents) : "0",
    },
    {
      label: "Tickets Sold",
      value: stats ? formatStatNumber(stats.totalTickets) : "0",
    },
    {
      label: "Happy Attendees",
      value: stats ? formatStatNumber(stats.totalAttendees) : "0",
    },
  ];

  // Official Web3Forms Submission Handler using raw FormData
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSending(true);
    setErrorMessage("");

    const form = event.currentTarget;
    const formData = new FormData(form);

    const accessKey =
      (import.meta as any).env?.VITE_WEB3FORMS_ACCESS_KEY ||
      "4f7e588b-8ba3-42db-8da2-49bbf9c5a9e0";

    formData.append("access_key", accessKey);

    try {
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        setSubmitted(true);
        form.reset();
        setTimeout(() => setSubmitted(false), 5000);
      } else {
        console.error("Web3Forms error response:", data);
        setErrorMessage(data.message || "Submission failed. Please try again.");
      }
    } catch (error) {
      console.error("Fetch error:", error);
      setErrorMessage(
        "Something went wrong. Please check your connection and try again."
      );
    } finally {
      setSending(false);
    }
  };

  const attendeeFeatures = [
    {
      icon: <BsSearch className="text-[#e31b88]" size={22} />,
      title: "Discover Local & Online Events",
      description:
        "Filter through tech hackathons, music shows, workshops, and meetups happening near you.",
    },
    {
      icon: <BsTicketPerforated className="text-[#e31b88]" size={22} />,
      title: "Instant Mobile Ticketing",
      description:
        "Book free passes or paid tickets instantly and access all your passes from one central wallet.",
    },
    {
      icon: <BsQrCodeScan className="text-[#e31b88]" size={22} />,
      title: "Fast QR Check-in",
      description:
        "No paper needed. Simply present your digital QR pass at the entrance for seamless venue entry.",
    },
  ];

  const organiserFeatures = [
    {
      icon: <BsCalendarCheck className="text-emerald-600" size={22} />,
      title: "Effortless Event Creation",
      description:
        "Publish events, set capacities, manage venue locations, and configure custom schedules in minutes.",
    },
    {
      icon: <BsGraphUp className="text-emerald-600" size={22} />,
      title: "Real-time Sales & Revenue",
      description:
        "Track live attendee registrations, total revenue generated, and top-performing event listings.",
    },
    {
      icon: <BsShieldCheck className="text-emerald-600" size={22} />,
      title: "Attendee Management & Check-in",
      description:
        "Monitor attendance on event day, scan attendee QR passes, and export attendance logs smoothly.",
    },
  ];

  const contactDetails = [
    {
      icon: <BsEnvelope className="text-[#e31b88]" size={20} />,
      title: "Email Us",
      value: "eventhub.hello@gmail.com",
      subtext: "We respond within 24 hours",
      action: "mailto:eventhub.hello@gmail.com",
    },
    {
      icon: <BsTelephone className="text-[#e31b88]" size={20} />,
      title: "Call Us",
      value: "9366042***",
      subtext: "Mon-Fri from 9am to 6pm IST",
      action: "tel:9366042***",
    },
    {
      icon: <BsGeoAlt className="text-[#e31b88]" size={20} />,
      title: "Our Headquarters",
      value: "Guwahati, Assam, India",
      subtext: "Assam Down Town University",
    },
    {
      icon: <BsClock className="text-[#e31b88]" size={20} />,
      title: "Support Hours",
      value: "24/7 Ticketing Help",
      subtext: "Live chat available on dashboard",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20">
      {/* Hero Section with Floating Stats Banner */}
      <section className="relative overflow-visible bg-slate-900 text-white pt-12 pb-20 lg:pt-14 lg:pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto rounded-3xl mt-4 sm:mt-6 shadow-xl mb-16">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl pointer-events-none overflow-hidden" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none overflow-hidden" />

        <div className="max-w-4xl mx-auto text-center space-y-6 relative z-10 pb-8">
          <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-pink-500/20 text-pink-300 border border-pink-500/30">
            One Platform • Dual Experience
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Where event creators and passionate attendees <span className="text-[#e31b88]">connect</span>.
          </h1>
          <p className="text-slate-300 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
            Whether you are hosting a major conference or looking for your next weekend experience, our platform brings people together effortlessly.
          </p>

          {/* Hero CTAs */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            {!isOrganiser && (
              <button
                onClick={() => navigate("/")}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#e31b88] hover:bg-[#c81678] text-white px-6 py-3.5 rounded-xl font-semibold text-sm transition-all shadow-lg shadow-pink-600/30"
              >
                Explore Events as Attendee
                <BsArrowRight size={16} />
              </button>
            )}

            {!isAttendee && (
              <button
                onClick={() => navigate(isLoggedIn ? "/organiser/dashboard" : "/login")}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 px-6 py-3.5 rounded-xl font-semibold text-sm transition-all"
              >
                Host as Organiser
              </button>
            )}
          </div>
        </div>

        {/* Real-time Stats Banner */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-full max-w-5xl px-4 sm:px-6 lg:px-8 z-20">
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xl p-5 sm:p-6 grid grid-cols-2 lg:grid-cols-4 gap-6 text-center">
            {statCards.map((stat, idx) => (
              <div key={idx} className="space-y-1">
                <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                  {loadingStats ? (
                    <span className="inline-block w-16 h-8 bg-slate-200 rounded animate-pulse" />
                  ) : (
                    stat.value
                  )}
                </h3>
                <p className="text-xs sm:text-sm font-medium text-slate-500">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Dual Perspective Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 space-y-16">
        {/* For Attendees */}
        <div className="space-y-8">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-pink-50 text-[#e31b88] rounded-xl">
              <BsHeart size={20} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight">For Attendees</h2>
              <p className="text-xs sm:text-sm text-slate-500">Discover, book, and enjoy seamless event entry.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {attendeeFeatures.map((f, idx) => (
              <div
                key={idx}
                className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm hover:border-pink-200 transition-all space-y-3"
              >
                <div className="w-10 h-10 rounded-xl bg-pink-50 flex items-center justify-center">
                  {f.icon}
                </div>
                <h3 className="text-base font-bold text-slate-900">{f.title}</h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{f.description}</p>
              </div>
            ))}
          </div>
        </div>

        <hr className="border-slate-200/80" />

        {/* For Organisers */}
        <div className="space-y-8">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
              <BsBuilding size={20} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight">For Organisers</h2>
              <p className="text-xs sm:text-sm text-slate-500">Build, launch, and monetize events effortlessly.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {organiserFeatures.map((f, idx) => (
              <div
                key={idx}
                className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm hover:border-emerald-200 transition-all space-y-3"
              >
                <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                  {f.icon}
                </div>
                <h3 className="text-base font-bold text-slate-900">{f.title}</h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Shared Mission Statement */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20">
        <div className="bg-gradient-to-br from-pink-900 via-slate-900 to-pink-950 text-white rounded-3xl p-8 sm:p-12 shadow-xl relative overflow-hidden">
          <div className="max-w-3xl space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-pink-300">Our Mission</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Simplifying event management and ticket discovery for everyone.
            </h2>
            <p className="text-pink-100/90 text-sm sm:text-base leading-relaxed">
              We bridge the gap between event organizers and active audiences by offering fast ticket delivery, simple venue entry, and real-time management dashboards in one unified system.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Info & Web3Forms Integration */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20">
        <div className="text-center max-w-xl mx-auto mb-12 space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Get in Touch
          </h2>
          <p className="text-slate-500 text-xs sm:text-sm">
            Have questions about an event, ticket refunds, or hosting? Send us a message!
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {contactDetails.map((item, idx) => (
            <div
              key={idx}
              className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col items-start space-y-3 hover:border-pink-200 transition-all"
            >
              <div className="p-3 bg-pink-50 rounded-xl">{item.icon}</div>
              <div>
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  {item.title}
                </span>
                {item.action ? (
                  <a
                    href={item.action}
                    className="block text-sm font-bold text-slate-900 hover:text-[#e31b88] transition-colors mt-0.5"
                  >
                    {item.value}
                  </a>
                ) : (
                  <p className="text-sm font-bold text-slate-900 mt-0.5">{item.value}</p>
                )}
                <p className="text-xs text-slate-500 mt-1">{item.subtext}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="max-w-3xl mx-auto bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-10 shadow-sm">
          {submitted ? (
            <div className="text-center py-8 space-y-3">
              <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <BsCheckCircle size={28} />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Message Sent Successfully!</h3>
              <p className="text-slate-500 text-sm">
                Thank you for reaching out. Our team will get back to you shortly.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {errorMessage && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-xs font-medium">
                  {errorMessage}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">Your Name</label>
                  <input
                    type="text"
                    name="name"
                    placeholder="John Doe"
                    required
                    className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-[#e31b88] focus:ring-1 focus:ring-[#e31b88] transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    placeholder="john@example.com"
                    required
                    className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-[#e31b88] focus:ring-1 focus:ring-[#e31b88] transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Subject</label>
                <input
                  type="text"
                  name="subject"
                  placeholder="Ticket inquiry / Event organizing question"
                  className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-[#e31b88] focus:ring-1 focus:ring-[#e31b88] transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Message</label>
                <textarea
                  name="message"
                  rows={4}
                  placeholder="Write your message here..."
                  required
                  className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-[#e31b88] focus:ring-1 focus:ring-[#e31b88] transition-all"
                />
              </div>

              <button
                type="submit"
                disabled={sending}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#e31b88] hover:bg-[#c81678] disabled:bg-pink-400 text-white px-8 py-3 rounded-xl font-semibold text-sm transition-all shadow-md shadow-pink-100"
              >
                <BsSend size={15} />
                {sending ? "Sending..." : "Send Message"}
              </button>
            </form>
          )}
        </div>
      </section>

      {/* Footer CTA */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 text-center space-y-6">
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
          Ready to get started?
        </h2>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          {!isOrganiser && (
            <button
              onClick={() => navigate("/")}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#e31b88] hover:bg-[#c81678] text-white px-6 py-3.5 rounded-xl font-semibold text-sm transition-all shadow-md shadow-pink-200"
            >
              Find Events to Attend
            </button>
          )}

          {!isAttendee && (
            <button
              onClick={() => navigate(isLoggedIn ? "/organiser/dashboard" : "/login")}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white hover:bg-slate-100 border border-slate-200/80 text-slate-800 px-6 py-3.5 rounded-xl font-semibold text-sm transition-all shadow-sm"
            >
              Go to Organiser Dashboard
            </button>
          )}
        </div>
      </section>
    </div>
  );
};

export default AboutPage;