// import { useState, useEffect } from "react";
// import { Link, useNavigate } from "react-router-dom";
// import {
//   BsPerson,
//   BsTicketDetailed,
//   BsBoxArrowRight,
//   BsPencilSquare,
//   BsEnvelope,
//   BsTelephone,
//   BsBank,
//   BsQrCode,
//   BsArrowRightShort,
//   BsReceiptCutoff,
//   BsArrowCounterclockwise,
//   BsCalendarEvent,
//   BsGeoAlt,
//   BsChevronRight,
// } from "react-icons/bs";
// import { useAuth } from "../context/AuthContext";
// import { jwtDecode } from "jwt-decode";

// type Tab = "profile" | "bookings" | "transactions" | "bank";

// interface DecodedToken {
//   id: string;
//   role: string;
// }

// type Booking = {
//   booking_id: number;
//   event_id: number;
//   ticket_type_id: number;
//   booking_reference: string;
//   quantity: number;
//   total_amount: string;
//   booking_status: string;
//   event_status: string;
//   booking_date: string;
//   checkedin: boolean;
//   title: string;
//   event_date: string;
//   event_starting_time: string;
//   city: string;
//   ticket_name: string;
//   event_cancelled_at?: string | null;
// };

// const API = (import.meta as any).env?.VITE_API_URL || "http://localhost:4000";

// const initials = (name?: string) => {
//   if (!name) return "?";
//   const parts = name.trim().split(/\s+/);
//   return parts.length === 1
//     ? parts[0].slice(0, 2).toUpperCase()
//     : (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
// };

// const REFUND_WINDOW_DAYS = 30;

// const formatMemberSince = (dateStr?: string) => {
//   if (!dateStr) return "";
//   const d = new Date(dateStr);
//   return d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
// };

// const formatDateOnly = (dateStr?: string) => {
//   if (!dateStr) return "";
//   return dateStr.split("T")[0];
// };

// const getLocalDateString = (date: Date = new Date()) => {
//   const year = date.getFullYear();
//   const month = String(date.getMonth() + 1).padStart(2, "0");
//   const day = String(date.getDate()).padStart(2, "0");
//   return `${year}-${month}-${day}`;
// };

// const isBeforeEventDay = (eventDateStr: string) => {
//   if (!eventDateStr) return false;
//   return eventDateStr.split("T")[0] > getLocalDateString();
// };

// const isEventToday = (eventDateStr: string) => {
//   if (!eventDateStr) return false;
//   return eventDateStr.split("T")[0] === getLocalDateString();
// };

// const isWithinRefundWindow = (cancelledAtStr?: string | null) => {
//   if (!cancelledAtStr) return false;
//   const cancelledAt = new Date(cancelledAtStr);
//   const deadline = new Date(cancelledAt);
//   deadline.setDate(deadline.getDate() + REFUND_WINDOW_DAYS);
//   return new Date() <= deadline;
// };

// const daysLeftToRefund = (cancelledAtStr?: string | null) => {
//   if (!cancelledAtStr) return 0;
//   const cancelledAt = new Date(cancelledAtStr);
//   const deadline = new Date(cancelledAt);
//   deadline.setDate(deadline.getDate() + REFUND_WINDOW_DAYS);
//   const msLeft = deadline.getTime() - new Date().getTime();
//   return Math.max(0, Math.ceil(msLeft / (1000 * 60 * 60 * 24)));
// };

// const bookingStatusStyles: Record<string, string> = {
//   confirmed: "bg-emerald-50 text-emerald-600",
//   pending: "bg-amber-50 text-amber-600",
//   cancelled: "bg-red-50 text-red-500",
//   refunded: "bg-slate-100 text-slate-600",
// };
// const eventStatusStyles: Record<string, string> = {
//   live: "bg-emerald-50 text-emerald-600",
//   completed: "bg-slate-100 text-slate-600",
//   cancelled: "bg-red-50 text-red-500",
// };

// const formatBookingStatus = (status: string) =>
//   status.charAt(0).toUpperCase() + status.slice(1);

// const tabs: { key: Tab; label: string; icon: React.ReactElement }[] = [
//   { key: "profile", label: "My Profile", icon: <BsPerson size={18} /> },
//   {
//     key: "bookings",
//     label: "My Bookings",
//     icon: <BsTicketDetailed size={18} />,
//   },
//   {
//     key: "transactions",
//     label: "Transactions",
//     icon: <BsReceiptCutoff size={18} />,
//   },
//   { key: "bank", label: "Bank & UPI", icon: <BsBank size={18} /> },
// ];

// const ProfilePage = () => {
//   const navigate = useNavigate();
//   const { logout, token } = useAuth();

//   const id = token ? jwtDecode<DecodedToken>(token).id : null;

//   const [activeTab, setActiveTab] = useState<Tab>("profile");

//   const [profile, setProfile] = useState<any>(null);
//   const [editingProfile, setEditingProfile] = useState(false);
//   const [fullName, setFullName] = useState("");
//   const [phone, setPhone] = useState("");
//   const [profileSaving, setProfileSaving] = useState(false);
//   const [profileError, setProfileError] = useState("");

//   const [bookings, setBookings] = useState<Booking[]>([]);
//   const [bookingsLoading, setBookingsLoading] = useState(false);
//   const [cancellingId, setCancellingId] = useState<number | null>(null);
//   const [cancelError, setCancelError] = useState("");

//   const [transactions, setTransactions] = useState<any[]>([]);
//   const [transactionsLoading, setTransactionsLoading] = useState(false);

//   const [editingBank, setEditingBank] = useState(false);
//   const [bankAccountNumber, setBankAccountNumber] = useState("");
//   const [bankIfsc, setBankIfsc] = useState("");
//   const [bankName, setBankName] = useState("");
//   const [upiId, setUpiId] = useState("");
//   const [bankSaving, setBankSaving] = useState(false);
//   const [bankError, setBankError] = useState("");

//   const authHeaders = { token: token || "" };

//   const fetchProfile = async () => {
//     if (!token) return;

//     try {
//       const res = await fetch(`${API}/api/user/me/${id}`, {
//         headers: authHeaders,
//       });

//       const data = await res.json();

//       if (data.success) {
//         setProfile(data.user);
//         setFullName(data.user.full_name || "");
//         setPhone(data.user.phone || "");
//         setBankAccountNumber(data.user.bank_account_number || "");
//         setBankIfsc(data.user.bank_ifsc_code || "");
//         setUpiId(data.user.upi_id || "");
//         setBankName(data.user.bank_name || "");
//       }
//     } catch (err) {
//       console.log("fetchProfile error:", err);
//     }
//   };

//   const fetchBookings = async () => {
//     if (!token) return;

//     try {
//       setBookingsLoading(true);
//       const res = await fetch(`${API}/api/bookings/my-bookings/history`, {
//         headers: { token: token || "" },
//       });
//       const data = await res.json();

//       if (data.success) {
//         setBookings(data.bookings || []);
//       }
//     } catch (err) {
//       console.log("fetchBookings error:", err);
//     } finally {
//       setBookingsLoading(false);
//     }
//   };

//   const fetchTransactions = async () => {
//     if (!token) return;

//     try {
//       setTransactionsLoading(true);
//       const res = await fetch(`${API}/api/user/${id}/transactions`, {
//         headers: authHeaders,
//       });
//       const data = await res.json();

//       if (data.success) {
//         setTransactions(data.transactions || []);
//       }
//     } catch (err) {
//       console.log("fetchTransactions error:", err);
//     } finally {
//       setTransactionsLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchProfile();
//   }, [token]);

//   useEffect(() => {
//     if (activeTab === "bookings" && bookings.length === 0) {
//       fetchBookings();
//     }
//     if (activeTab === "transactions" && transactions.length === 0) {
//       fetchTransactions();
//     }
//   }, [activeTab]);

//   const handleSaveProfile = async () => {
//     if (!fullName.trim()) {
//       setProfileError("Full name is required.");
//       return;
//     }

//     try {
//       setProfileSaving(true);
//       setProfileError("");

//       const res = await fetch(`${API}/api/user/profile`, {
//         method: "PUT",
//         headers: {
//           "Content-Type": "application/json",
//           ...authHeaders,
//         },
//         body: JSON.stringify({ full_name: fullName, phone }),
//       });

//       const data = await res.json();

//       if (!data.success) {
//         throw new Error(data.message || "Failed to update profile.");
//       }

//       setProfile(data.user);
//       setEditingProfile(false);
//     } catch (err: any) {
//       setProfileError(err.message || "Something went wrong.");
//     } finally {
//       setProfileSaving(false);
//     }
//   };

//   const handelCancelRequest = async (bookingId: number) => {
//     try {
//       setCancelError("");
//       const res = await fetch(
//         `${API}/api/bookings/${bookingId}/cancel-refund`,
//         {
//           method: "PUT",
//           headers: {
//             "Content-Type": "application/json",
//             token: token || "",
//           },
//         },
//       );

//       const data = await res.json();

//       if (!data.success) {
//         throw new Error(data.message || "Failed to cancel refund request.");
//       }

//       // Refresh bookings list after successful update
//       fetchBookings();
//     } catch (err: any) {
//       console.log("handelCancelRequest error:", err);
//       setCancelError(err.message || "Something went wrong.");
//     }
//   };

//   const handleBankSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();

//     try {
//       setBankSaving(true);
//       setBankError("");

//       const res = await fetch(`${API}/api/user/bank-details`, {
//         method: "PUT",
//         headers: {
//           "Content-Type": "application/json",
//           ...authHeaders,
//         },
//         body: JSON.stringify({
//           bank_account_number: bankAccountNumber,
//           bank_ifsc_code: bankIfsc,
//           bank_name: bankName,
//           upi_id: upiId,
//         }),
//       });

//       const data = await res.json();

//       if (!data.success) {
//         throw new Error(data.message || "Failed to update bank details.");
//       }

//       setEditingBank(false);
//     } catch (err: any) {
//       setBankError(err.message || "Something went wrong.");
//     } finally {
//       setBankSaving(false);
//     }
//   };

//   // Free bookings are cancelled directly here — no refund math applies,
//   // so this does NOT route to RefundPage (which now assumes paid bookings only).
//   const handleCancelBooking = async (bookingId: number) => {
//     if (!confirm("Cancel this booking? This cannot be undone.")) return;

//     try {
//       setCancellingId(bookingId);
//       setCancelError("");

//       const res = await fetch(`${API}/api/bookings/${bookingId}/cancel`, {
//         method: "PUT",
//         headers: { token: token || "" },
//       });

//       const data = await res.json();

//       if (!data.success) {
//         throw new Error(data.message || "Could not cancel booking.");
//       }

//       setBookings((prev) =>
//         prev.map((b) =>
//           b.booking_id === bookingId
//             ? { ...b, booking_status: "cancelled" }
//             : b,
//         ),
//       );
//     } catch (err: any) {
//       setCancelError(err.message || "Something went wrong.");
//     } finally {
//       setCancellingId(null);
//     }
//   };

//   const handleLogout = () => {
//     logout();
//     navigate("/", { replace: true });
//   };

//   return (
//     <div className="max-w-7xl mx-auto mt-4 sm:mt-8 px-4 sm:px-6 pb-16 grid grid-cols-1 md:grid-cols-4 gap-6">
//       <style>{`
//         @keyframes fadeInUp {
//           from { opacity: 0; transform: translateY(10px); }
//           to { opacity: 1; transform: translateY(0); }
//         }
//         @keyframes fadeIn {
//           from { opacity: 0; }
//           to { opacity: 1; }
//         }
//         @keyframes shimmer {
//           0% { background-position: -200% 0; }
//           100% { background-position: 200% 0; }
//         }
//         .animate-fade-in-up {
//           animation: fadeInUp 0.4s ease-out both;
//         }
//         .animate-fade-in {
//           animation: fadeIn 0.3s ease-out both;
//         }
//         .avatar-glow {
//           background: linear-gradient(135deg, #49557E, #6c7aad, #49557E);
//           background-size: 200% 200%;
//           animation: shimmer 6s ease infinite;
//         }
//       `}</style>

//       {/* Navigation Sidebar */}
//       <div className="md:col-span-1 bg-white border border-slate-100 rounded-2xl shadow-sm p-3 sm:p-4 h-fit md:order-last">
//         <nav className="flex flex-row md:flex-col overflow-x-auto no-scrollbar gap-1.5 sm:gap-1">
//           {tabs.map((tab) => (
//             <button
//               key={tab.key}
//               onClick={() => setActiveTab(tab.key)}
//               className={`flex items-center gap-2.5 sm:gap-3 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm whitespace-nowrap transition-all duration-300 shrink-0 w-full text-left ${
//                 activeTab === tab.key
//                   ? "bg-[#fff4f2] text-[#FF4C24] font-semibold shadow-sm scale-[1.02]"
//                   : "text-[#49557E] hover:bg-slate-50 hover:pl-5"
//               }`}
//             >
//               {tab.icon}
//               {tab.label}
//             </button>
//           ))}

//           <hr className="hidden md:block my-2 border-slate-100" />

//           <button
//             onClick={handleLogout}
//             className="flex items-center gap-2.5 sm:gap-3 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm text-red-500 hover:bg-red-50 hover:pl-5 transition-all duration-300 shrink-0 ml-auto md:ml-0"
//           >
//             <BsBoxArrowRight size={18} />
//             <span>Logout</span>
//           </button>
//         </nav>
//       </div>

//       {/* Main Content Area */}
//       <div className="md:col-span-3 space-y-4 sm:space-y-6">
//         {/* Profile Header Card */}
//         <div className="animate-fade-in-up bg-white border border-slate-100 rounded-2xl shadow-sm p-5 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-6 hover:shadow-md transition-shadow duration-300">
//           <div className="flex items-center gap-4 sm:gap-5">
//             <div className="avatar-glow w-14 h-14 sm:w-20 sm:h-20 rounded-full flex items-center justify-center text-white text-lg sm:text-2xl font-bold shrink-0 shadow-md">
//               {initials(profile?.full_name)}
//             </div>
//             <div>
//               <h1 className="text-xl sm:text-2xl font-bold text-slate-800">
//                 {profile?.full_name || "—"}
//               </h1>
//               <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
//                 {profile?.created_at
//                   ? `Member since ${formatMemberSince(profile.created_at)}`
//                   : ""}
//               </p>
//             </div>
//           </div>

//           <button
//             onClick={() => {
//               setActiveTab("profile");
//               setEditingProfile(true);
//             }}
//             className="w-full sm:w-auto flex items-center justify-center gap-2 border border-[#FF4C24] text-[#49557E] px-4 sm:px-5 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-medium hover:bg-[#fff4f2] hover:scale-105 active:scale-95 transition-all duration-200"
//           >
//             <BsPencilSquare size={16} />
//             Edit Profile
//           </button>
//         </div>

//         {/* TAB 1: PROFILE DETAILS */}
//         {activeTab === "profile" && (
//           <div
//             key="profile"
//             className="animate-fade-in-up bg-white border border-slate-100 rounded-2xl shadow-sm p-5 sm:p-8 space-y-6"
//           >
//             <div className="flex items-center justify-between">
//               <h2 className="text-base sm:text-lg font-bold text-slate-800">
//                 Account Details
//               </h2>
//               {!editingProfile && (
//                 <button
//                   onClick={() => setEditingProfile(true)}
//                   className="text-xs sm:text-sm font-semibold text-[#FF4C24] hover:underline"
//                 >
//                   Edit Details
//                 </button>
//               )}
//             </div>

//             {editingProfile ? (
//               <div className="space-y-4 animate-fade-in">
//                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//                   <div>
//                     <label className="block text-xs text-slate-500 mb-1">
//                       Full Name
//                     </label>
//                     <input
//                       type="text"
//                       value={fullName}
//                       onChange={(e) => setFullName(e.target.value)}
//                       className="w-full border border-slate-200 rounded-lg p-2.5 text-sm outline-none focus:border-[#FF4C24] focus:ring-2 focus:ring-[#FF4C24]/10 transition-all"
//                     />
//                   </div>
//                   <div>
//                     <label className="block text-xs text-slate-500 mb-1">
//                       Phone Number
//                     </label>
//                     <input
//                       type="text"
//                       value={phone}
//                       onChange={(e) => setPhone(e.target.value)}
//                       className="w-full border border-slate-200 rounded-lg p-2.5 text-sm outline-none focus:border-[#FF4C24] focus:ring-2 focus:ring-[#FF4C24]/10 transition-all"
//                     />
//                   </div>
//                 </div>

//                 {profileError && (
//                   <p className="text-red-500 text-xs animate-fade-in">
//                     {profileError}
//                   </p>
//                 )}

//                 <div className="flex items-center gap-3">
//                   <button
//                     onClick={handleSaveProfile}
//                     disabled={profileSaving}
//                     className="bg-[#FF4C24] text-white text-xs sm:text-sm font-semibold px-5 py-2.5 rounded-lg hover:bg-[#e03e1a] hover:scale-105 active:scale-95 disabled:opacity-60 disabled:scale-100 transition-all duration-200"
//                   >
//                     {profileSaving ? "Saving..." : "Save Changes"}
//                   </button>
//                   <button
//                     onClick={() => {
//                       setEditingProfile(false);
//                       setFullName(profile?.full_name || "");
//                       setPhone(profile?.phone || "");
//                       setProfileError("");
//                     }}
//                     className="text-xs sm:text-sm font-semibold text-slate-500 hover:text-slate-700 transition-colors"
//                   >
//                     Cancel
//                   </button>
//                 </div>
//               </div>
//             ) : (
//               <div className="space-y-4 sm:space-y-5">
//                 <div className="flex items-center gap-3.5 sm:gap-4 pb-4 sm:pb-5 border-b border-slate-100 group">
//                   <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-slate-50 text-[#49557E] flex items-center justify-center shrink-0 group-hover:bg-[#49557E] group-hover:text-white transition-colors duration-300">
//                     <BsPerson size={18} />
//                   </div>
//                   <div>
//                     <p className="text-[10px] sm:text-xs text-slate-400 uppercase tracking-wide">
//                       Full Name
//                     </p>
//                     <p className="text-sm sm:text-base text-slate-800 font-medium">
//                       {profile?.full_name || "—"}
//                     </p>
//                   </div>
//                 </div>

//                 <div className="flex items-center gap-3.5 sm:gap-4 pb-4 sm:pb-5 border-b border-slate-100 group">
//                   <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-slate-50 text-[#49557E] flex items-center justify-center shrink-0 group-hover:bg-[#49557E] group-hover:text-white transition-colors duration-300">
//                     <BsEnvelope size={18} />
//                   </div>
//                   <div className="min-w-0">
//                     <p className="text-[10px] sm:text-xs text-slate-400 uppercase tracking-wide">
//                       Email Address
//                     </p>
//                     <p className="text-sm sm:text-base text-slate-800 font-medium truncate">
//                       {profile?.email || "—"}
//                     </p>
//                   </div>
//                 </div>

//                 <div className="flex items-center gap-3.5 sm:gap-4 group">
//                   <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-slate-50 text-[#49557E] flex items-center justify-center shrink-0 group-hover:bg-[#49557E] group-hover:text-white transition-colors duration-300">
//                     <BsTelephone size={18} />
//                   </div>
//                   <div>
//                     <p className="text-[10px] sm:text-xs text-slate-400 uppercase tracking-wide">
//                       Phone Number
//                     </p>
//                     <p className="text-sm sm:text-base text-slate-800 font-medium">
//                       {profile?.phone || "—"}
//                     </p>
//                   </div>
//                 </div>
//               </div>
//             )}
//           </div>
//         )}

//         {/* TAB 2: MY BOOKINGS */}
//         {activeTab === "bookings" && (
//           <div
//             key="bookings"
//             className="animate-fade-in-up bg-white border border-slate-100 rounded-2xl shadow-sm p-5 sm:p-8"
//           >
//             <h2 className="text-base sm:text-lg font-bold text-slate-800 mb-4 sm:mb-6">
//               My Bookings
//             </h2>

//             {cancelError && (
//               <p className="text-red-600 text-xs sm:text-sm mb-4 bg-red-50 border border-red-100 rounded-lg px-3.5 py-2.5">
//                 {cancelError}
//               </p>
//             )}

//             {bookingsLoading ? (
//               <p className="text-sm text-slate-400">Loading bookings...</p>
//             ) : bookings.length === 0 ? (
//               <p className="text-sm text-slate-400">
//                 You haven't made any bookings yet.
//               </p>
//             ) : (
//               <div className="space-y-3.5">
//                 {bookings.map((booking, idx) => {
//                   const isFree =
//                     booking.total_amount === "0" ||
//                     booking.total_amount === "0.00";
//                   const isPaid = !isFree;

//                   const isCancelledWithinWindow =
//                     booking.event_status === "cancelled" &&
//                     isWithinRefundWindow(booking.event_cancelled_at);

//                   const canRefund =
//                     isPaid &&
//                     !booking.checkedin &&
//                     booking.booking_status === "confirmed" &&
//                     (isBeforeEventDay(booking.event_date) ||
//                       isCancelledWithinWindow);

//                   const canCancel =
//                     isFree &&
//                     !booking.checkedin &&
//                     booking.booking_status === "confirmed" &&
//                     (isBeforeEventDay(booking.event_date) ||
//                       isEventToday(booking.event_date));

//                   const canRequestCancle =
//                     !isFree && booking.booking_status === "refund_requested";

//                   return (
//                     <div
//                       key={booking.booking_id}
//                       onClick={() =>
//                         navigate(`/my-bookings/${booking.booking_id}`)
//                       }
//                       style={{ animationDelay: `${idx * 60}ms` }}
//                       className="animate-fade-in-up group relative flex items-stretch gap-0 border border-slate-100 rounded-xl overflow-hidden cursor-pointer hover:border-slate-200 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300"
//                     >
//                       {/* Status accent strip */}
//                       <div
//                         className={`w-1.5 shrink-0 transition-all duration-300 group-hover:w-2.5 ${
//                           booking.booking_status === "confirmed"
//                             ? "bg-emerald-400"
//                             : booking.booking_status === "pending"
//                               ? "bg-amber-400"
//                               : booking.booking_status === "refunded"
//                                 ? "bg-slate-300"
//                                 : "bg-red-400"
//                         }`}
//                       />

//                       <div className="flex-1 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
//                         <div className="space-y-2 min-w-0">
//                           {/* Badges row */}
//                           <div className="flex items-center gap-2 flex-wrap">
//                             <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 tracking-wide">
//                               {booking.booking_reference}
//                             </span>
//                             <span
//                               className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
//                                 bookingStatusStyles[booking.booking_status] ||
//                                 "bg-slate-100 text-slate-600"
//                               }`}
//                             >
//                               {formatBookingStatus(booking.booking_status)}
//                             </span>
//                             <span
//                               className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
//                                 eventStatusStyles[booking.event_status] ||
//                                 "bg-slate-100 text-slate-600"
//                               }`}
//                             >
//                               Event {formatBookingStatus(booking.event_status)}
//                             </span>
//                           </div>

//                           {/* Title */}
//                           <h3 className="font-bold text-slate-800 text-sm sm:text-base truncate group-hover:text-[#49557E] transition-colors">
//                             {booking.title}
//                           </h3>

//                           {/* Meta row — now correctly shows the event date, not booking date */}
//                           <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-slate-500">
//                             <span className="inline-flex items-center gap-1.5">
//                               <BsCalendarEvent
//                                 size={12}
//                                 className="text-[#49557E]"
//                               />
//                               {formatDateOnly(booking.event_date)}
//                             </span>
//                             <span className="inline-flex items-center gap-1.5">
//                               <BsGeoAlt size={12} className="text-[#49557E]" />
//                               {booking.city}
//                             </span>
//                             <span className="inline-flex items-center gap-1.5">
//                               <BsTicketDetailed
//                                 size={12}
//                                 className="text-[#49557E]"
//                               />
//                               {booking.ticket_name} × {booking.quantity}
//                             </span>
//                           </div>

//                           <p className="text-[11px] text-slate-400">
//                             Booked on {formatDateOnly(booking.booking_date)}
//                           </p>

//                           {isCancelledWithinWindow && (
//                             <p className="text-[11px] text-red-500 font-medium">
//                               Event cancelled — refund window closes in{" "}
//                               {daysLeftToRefund(booking.event_cancelled_at)} day
//                               {daysLeftToRefund(booking.event_cancelled_at) ===
//                               1
//                                 ? ""
//                                 : "s"}
//                             </p>
//                           )}
//                         </div>

//                         {/* Right side: price + actions */}
//                         <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 shrink-0 border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-50">
//                           <span
//                             className={`text-sm sm:text-base font-bold ${
//                               isFree ? "text-emerald-600" : "text-slate-800"
//                             }`}
//                           >
//                             {isFree ? "Free" : `₹${booking.total_amount}`}
//                           </span>

//                           <div className="flex items-center gap-2">
//                             {canRefund && (
//                               <Link
//                                 to={`/refund-page?bookingId=${booking.booking_id}`}
//                                 onClick={(e) => e.stopPropagation()}
//                                 className="inline-flex items-center gap-1 text-xs font-semibold text-[#FF4C24] bg-[#fff4f2] hover:bg-[#ffe8e3] hover:scale-105 active:scale-95 px-3 py-1.5 rounded-lg transition-all duration-200 w-fit"
//                               >
//                                 Request Refund
//                               </Link>
//                             )}

//                             {canCancel && (
//                               <Link
//                                 to={`/refund-page?bookingId=${booking.booking_id}`}
//                                 onClick={(e) => e.stopPropagation()}
//                                 className="inline-flex items-center gap-1 text-xs font-semibold text-[#FF4C24] bg-[#fff4f2] hover:bg-[#ffe8e3] hover:scale-105 active:scale-95 px-3 py-1.5 rounded-lg transition-all duration-200 w-fit"
//                               >
//                                 cancel Booking
//                               </Link>
//                             )}
//                             {canRequestCancle && (
//                               <button
//                                 type="button"
//                                 onClick={(e) => {
//                                   e.stopPropagation();
//                                   handelCancelRequest(booking.booking_id);
//                                 }}
//                                 className="inline-flex items-center gap-1 text-xs font-semibold text-[#FF4C24] bg-[#fff4f2] hover:bg-[#ffe8e3] hover:scale-105 active:scale-95 px-3 py-1.5 rounded-lg transition-all duration-200 w-fit"
//                               >
//                                 Cancel Refund
//                               </button>
//                             )}

//                             <BsChevronRight
//                               size={16}
//                               className="text-slate-300 group-hover:text-[#49557E] group-hover:translate-x-1 transition-all duration-300 hidden sm:block"
//                             />
//                           </div>
//                         </div>
//                       </div>
//                     </div>
//                   );
//                 })}
//               </div>
//             )}
//           </div>
//         )}

//         {/* TAB 3: TRANSACTIONS & REFUND HISTORY */}
//         {activeTab === "transactions" && (
//           <div
//             key="transactions"
//             className="animate-fade-in-up bg-white border border-slate-100 rounded-2xl shadow-sm p-5 sm:p-8"
//           >
//             <h2 className="text-base sm:text-lg font-bold text-slate-800 mb-4 sm:mb-6">
//               Transaction History
//             </h2>

//             {transactionsLoading ? (
//               <p className="text-sm text-slate-400">Loading transactions...</p>
//             ) : transactions.length === 0 ? (
//               <p className="text-sm text-slate-400">No transactions yet.</p>
//             ) : (
//               <div className="space-y-3">
//                 {transactions.map((txn, idx) => {
//                   const isRefunded = txn.transaction_status === "refunded";

//                   return (
//                     <div
//                       key={txn.transaction_id}
//                       style={{ animationDelay: `${idx * 60}ms` }}
//                       className="animate-fade-in-up p-4 border border-slate-100 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:shadow-sm hover:border-slate-200 transition-all duration-300"
//                     >
//                       <div className="flex items-start gap-3">
//                         <div
//                           className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
//                             isRefunded
//                               ? "bg-emerald-50 text-emerald-600"
//                               : "bg-slate-100 text-slate-600"
//                           }`}
//                         >
//                           {isRefunded ? (
//                             <BsArrowCounterclockwise size={18} />
//                           ) : (
//                             <BsReceiptCutoff size={18} />
//                           )}
//                         </div>
//                         <div className="space-y-0.5">
//                           <div className="flex items-center gap-2">
//                             <span className="font-semibold text-slate-800 text-sm">
//                               {txn.event_title}
//                             </span>
//                             <span
//                               className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
//                                 isRefunded
//                                   ? "bg-emerald-50 text-emerald-600"
//                                   : txn.transaction_status === "completed"
//                                     ? "bg-emerald-50 text-emerald-600"
//                                     : "bg-amber-50 text-amber-600"
//                               }`}
//                             >
//                               {txn.transaction_status.toUpperCase()}
//                             </span>
//                           </div>
//                           <p className="text-xs text-slate-400">
//                             {formatDateOnly(txn.created_at)} • Ref:{" "}
//                             {txn.booking_reference}
//                           </p>
//                           <p className="text-[11px] text-slate-400 truncate max-w-xs sm:max-w-sm">
//                             Order ID: {txn.razorpay_order_id}
//                           </p>
//                         </div>
//                       </div>

//                       <div className="flex sm:flex-col items-center sm:items-end justify-between border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-50">
//                         <p
//                           className={`text-sm font-bold ${
//                             isRefunded ? "text-emerald-600" : "text-slate-800"
//                           }`}
//                         >
//                           {isRefunded
//                             ? `+₹${txn.total_amount}`
//                             : `-₹${txn.total_amount}`}
//                         </p>

//                         {isRefunded && (
//                           <Link
//                             to={`/refund-page?bookingId=${txn.booking_id}`}
//                             className="text-xs font-medium text-[#FF4C24] hover:underline flex items-center gap-0.5 mt-1"
//                           >
//                             Refund Details
//                             <BsArrowRightShort size={16} />
//                           </Link>
//                         )}
//                       </div>
//                     </div>
//                   );
//                 })}
//               </div>
//             )}
//           </div>
//         )}

//         {/* TAB 4: BANK & UPI SECTOR */}
//         {activeTab === "bank" && (
//           <div
//             key="bank"
//             className="animate-fade-in-up bg-white border border-slate-100 rounded-2xl shadow-sm p-5 sm:p-8 space-y-6"
//           >
//             <div className="flex items-center justify-between">
//               <h2 className="text-base sm:text-lg font-bold text-slate-800">
//                 Saved Bank & UPI Details
//               </h2>
//               <button
//                 onClick={() => setEditingBank(!editingBank)}
//                 className="text-xs sm:text-sm font-semibold text-[#FF4C24] hover:underline"
//               >
//                 {editingBank ? "Cancel" : "Edit Details"}
//               </button>
//             </div>

//             {editingBank ? (
//               <form
//                 onSubmit={handleBankSubmit}
//                 className="space-y-4 animate-fade-in"
//               >
//                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//                   <div>
//                     <label className="block text-xs text-slate-500 mb-1">
//                       Bank Name
//                     </label>
//                     <input
//                       type="text"
//                       value={bankName}
//                       onChange={(e) => setBankName(e.target.value)}
//                       className="w-full border border-slate-200 rounded-lg p-2.5 text-sm outline-none focus:border-[#FF4C24] focus:ring-2 focus:ring-[#FF4C24]/10 transition-all"
//                     />
//                   </div>
//                   <div>
//                     <label className="block text-xs text-slate-500 mb-1">
//                       Account Number
//                     </label>
//                     <input
//                       type="text"
//                       value={bankAccountNumber}
//                       onChange={(e) => setBankAccountNumber(e.target.value)}
//                       className="w-full border border-slate-200 rounded-lg p-2.5 text-sm outline-none focus:border-[#FF4C24] focus:ring-2 focus:ring-[#FF4C24]/10 transition-all"
//                     />
//                   </div>
//                   <div>
//                     <label className="block text-xs text-slate-500 mb-1">
//                       IFSC Code
//                     </label>
//                     <input
//                       type="text"
//                       value={bankIfsc}
//                       onChange={(e) => setBankIfsc(e.target.value)}
//                       className="w-full border border-slate-200 rounded-lg p-2.5 text-sm outline-none focus:border-[#FF4C24] focus:ring-2 focus:ring-[#FF4C24]/10 transition-all"
//                     />
//                   </div>
//                 </div>

//                 <div>
//                   <label className="block text-xs text-slate-500 mb-1">
//                     UPI ID
//                   </label>
//                   <input
//                     type="text"
//                     value={upiId}
//                     onChange={(e) => setUpiId(e.target.value)}
//                     className="w-full border border-slate-200 rounded-lg p-2.5 text-sm outline-none focus:border-[#FF4C24] focus:ring-2 focus:ring-[#FF4C24]/10 transition-all"
//                   />
//                 </div>

//                 {bankError && (
//                   <p className="text-red-500 text-xs animate-fade-in">
//                     {bankError}
//                   </p>
//                 )}

//                 <button
//                   type="submit"
//                   disabled={bankSaving}
//                   className="bg-[#FF4C24] text-white text-xs sm:text-sm font-semibold px-5 py-2.5 rounded-lg hover:bg-[#e03e1a] hover:scale-105 active:scale-95 disabled:opacity-60 disabled:scale-100 transition-all duration-200"
//                 >
//                   {bankSaving ? "Saving..." : "Save Details"}
//                 </button>
//               </form>
//             ) : (
//               <div className="space-y-4">
//                 {/* Bank Details View */}
//                 <div className="p-4 border border-slate-100 rounded-xl space-y-3 hover:shadow-sm hover:border-slate-200 transition-all duration-300">
//                   <div className="flex items-center gap-3">
//                     <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
//                       <BsBank size={16} />
//                     </div>
//                     <div>
//                       <p className="text-xs text-slate-400">
//                         Primary Bank Account (Max 1)
//                       </p>
//                       <p className="text-sm font-semibold text-slate-800">
//                         {bankName || "No bank account added"}
//                       </p>
//                     </div>
//                   </div>
//                   {bankAccountNumber && (
//                     <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 pt-2 border-t border-slate-50">
//                       <p>
//                         <span className="text-slate-400">A/C No:</span> ••••{" "}
//                         {bankAccountNumber.slice(-4)}
//                       </p>
//                       <p>
//                         <span className="text-slate-400">IFSC:</span> {bankIfsc}
//                       </p>
//                     </div>
//                   )}
//                 </div>

//                 {/* UPI Details View */}
//                 <div className="p-4 border border-slate-100 rounded-xl flex items-center gap-3 hover:shadow-sm hover:border-slate-200 transition-all duration-300">
//                   <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
//                     <BsQrCode size={16} />
//                   </div>
//                   <div>
//                     <p className="text-xs text-slate-400">
//                       Primary UPI ID (Max 1)
//                     </p>
//                     <p className="text-sm font-semibold text-slate-800">
//                       {upiId || "No UPI ID added"}
//                     </p>
//                   </div>
//                 </div>
//               </div>
//             )}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default ProfilePage;
