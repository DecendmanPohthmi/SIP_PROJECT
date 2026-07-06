import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
// import api from '../utils/axios';
import { FaCalendarAlt, FaMapMarkerAlt, FaSearch, FaRegClock, FaTicketAlt, FaShieldAlt } from 'react-icons/fa';
import {
  BsTicketPerforated,
} from "react-icons/bs";

const Home = () => {
    const [events, setEvents] = useState([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            const fetchEvents = async () => {
                try {
                    const { data } = await api.get(`/events?search=${search}`);
                    setEvents(data);
                } catch (error) {
                    console.error('Error fetching events:', error);
                } finally {
                    setLoading(false);
                }
            };
            fetchEvents();
        }, 400);

        return () => clearTimeout(timeoutId);
    }, [search]);

    // Eye-catching personalized color themes for each feature badge
    const features = [
        { 
            icon: <FaRegClock />, 
            title: "Fast Booking", 
            desc: "Secure your tickets instantly with our fast streamlined booking infrastructure built for speed.",
            iconBg: "bg-amber-500 text-white shadow-amber-200"
        },
        { 
            icon: <BsTicketPerforated />, 
            title: "Seamless Access", 
            desc: "Download tickets instantly or manage them right from your personal dashboard with easily.",
            iconBg: "bg-indigo-600 text-white shadow-indigo-200"
        },
        { 
            icon: <FaShieldAlt />, 
            title: "Secure Platform", 
            desc: "All transactions and registrations are bounded by cutting-edge security and 2FA OTP tech.",
            iconBg: "bg-emerald-500 text-white shadow-emerald-200"
        }
    ];

    return (
        <div className="flex flex-col min-h-screen bg-slate-50/50">
            {/* Hero Section - Upgraded with a vibrant Indigo-Violet Gradient */}
            <div className="relative bg-gradient-to-br from-indigo-900 via-purple-900 to-violet-950 text-white rounded-3xl overflow-hidden mb-12 shadow-xl border border-indigo-950/40">
                <div className="absolute inset-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1459749411175-04bf5292ceea?q=80&w=3000&auto=format&fit=crop')] bg-cover bg-center mix-blend-overlay"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-indigo-950/90 via-transparent to-transparent"></div>
                
                <div className="relative p-10 md:p-20 text-center flex flex-col items-center z-10">
                    <span className="bg-gradient-to-r from-pink-500 to-rose-500 text-white px-4 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase mb-6 shadow-md shadow-rose-900/30">
                        Welcome to EventNest
                    </span>
                    <h1 className="text-5xl md:text-7xl font-black mb-6 leading-tight tracking-tight drop-shadow-md">
                        Find Your Next <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-pink-400 to-purple-400">
                            Unforgettable
                        </span> Experience
                    </h1>
                    <p className="text-indigo-200 text-lg md:text-xl mb-10 max-w-2xl mx-auto font-light leading-relaxed">
                        Discover the best tech conferences, late-night music festivals, and hands-on workshops happening directly in your area. Secure your spot today.
                    </p>

                    {/* Enhanced high-contrast search bar */}
                    <div className="w-full max-w-2xl mx-auto relative flex items-center shadow-2xl group">
                        <FaSearch className="absolute left-6 text-indigo-500 text-xl group-focus-within:text-indigo-600 transition-colors" />
                        <input
                            type="text"
                            placeholder="Search events by title..."
                            className="w-full pl-16 pr-6 py-5 rounded-full text-lg text-slate-900 bg-white border-2 border-transparent focus:border-indigo-400 focus:outline-none transition-all placeholder-slate-400 font-medium shadow-inner"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {/* Why Choose Us / Features row with vibrant custom icons */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16 px-4">
                {features.map((feat, i) => (
                    <div key={i} className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center text-center hover:-translate-y-1.5 hover:shadow-md transition-all duration-300">
                        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-2xl mb-6 shadow-lg ${feat.iconBg}`}>
                            {feat.icon}
                        </div>
                        <h3 className="text-xl font-bold text-slate-800 mb-3">{feat.title}</h3>
                        <p className="text-slate-500 text-sm leading-relaxed">{feat.desc}</p>
                    </div>
                ))}
            </div>

            {/* Event List Header */}
            <div className="flex items-center justify-between mb-8 px-2 border-b border-slate-200 pb-4">
                <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">Upcoming Events</h2>
                <div className="bg-indigo-50 text-indigo-700 px-4 py-1.5 rounded-full text-sm font-semibold">
                    {events.length} results found
                </div>
            </div>

            {/* Events Handling */}
            {loading ? (
                <div className="text-center py-20 text-xl font-semibold text-indigo-600 animate-pulse">Loading events...</div>
            ) : events.length === 0 ? (
                <div className="text-center py-20 text-xl text-slate-500">No events found matching your search.</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {events.map(event => (
                        <div key={event._id} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl border border-slate-100 transition-all duration-300 flex flex-col group">
                            <div className="h-48 bg-slate-100 overflow-hidden relative">
                                {event.image ? (
                                    <img src={event.image} alt={event.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-50 to-slate-100 text-indigo-600 font-bold text-lg">
                                        {event.category || 'Event'}
                                    </div>
                                )}
                                <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-black shadow-sm border border-slate-100">
                                    {event.ticketPrice === 0 ? (
                                        <span className="text-emerald-600 tracking-wider">FREE</span>
                                    ) : (
                                        <span className="text-indigo-600">₹{event.ticketPrice}</span>
                                    )}
                                </div>
                            </div>
                            <div className="p-6 flex-grow flex flex-col">
                                <div className="text-xs font-bold text-indigo-600 uppercase tracking-widest mb-2">{event.category}</div>
                                <h2 className="text-xl font-bold text-slate-800 mb-3 group-hover:text-indigo-600 transition-colors">{event.title}</h2>
                                <div className="flex flex-col gap-2 mb-5 text-slate-600 text-sm">
                                    <div className="flex items-center gap-2.5">
                                        <FaCalendarAlt className="text-indigo-400" />
                                        <span>{new Date(event.date).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}</span>
                                    </div>
                                    <div className="flex items-center gap-2.5">
                                        <FaMapMarkerAlt className="text-rose-400" />
                                        <span className="truncate">{event.location}</span>
                                    </div>
                                </div>
                                <div className="mt-auto">
                                    <div className="w-full bg-slate-100 rounded-full h-2 mb-2 overflow-hidden">
                                        {/* Eye-catching purple progress indicator */}
                                        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 h-2 rounded-full" style={{ width: `${(event.availableSeats / event.totalSeats) * 100}%` }}></div>
                                    </div>
                                    <p className="text-xs text-slate-500 font-medium mb-4">{event.availableSeats} of {event.totalSeats} seats remaining</p>
                                    
                                    {/* Action button colored in solid indigo */}
                                    <Link to={`/events/${event._id}`} className="block w-full text-center bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 rounded-xl shadow-md shadow-indigo-100 transition duration-200">
                                        View Details
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Footer Section */}
            <footer className="mt-auto pt-16 pb-8 border-t border-slate-200 text-center">
                <div className="flex justify-center items-center gap-2 mb-4">
                    <FaTicketAlt className="text-indigo-600 text-2xl" />
                    <span className="text-xl font-extrabold text-slate-800 tracking-tight">Eventora</span>
                </div>
                <p className="text-slate-500 text-sm mb-6 max-w-md mx-auto leading-relaxed">
                    The simplest, most dynamic way to manage, discover, and host world-class events in your local city. Let's make memories together.
                </p>
                <div className="text-xs text-slate-400 font-bold uppercase tracking-widest">
                    &copy; {new Date().getFullYear()} Eventora Platform. All rights reserved.
                </div>
            </footer>
        </div>
    );
};

export default Home;