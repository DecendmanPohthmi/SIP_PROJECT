import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { BsTicketPerforated, BsShieldLock, BsEnvelope, BsLock } from "react-icons/bs";
import { useAuth } from "../context/AuthContext.tsx";

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  // cast import.meta to any to avoid TypeScript error: Property 'env' does not exist on type 'ImportMeta'
  const API_BASE = (import.meta as any).env?.VITE_API_URL || "http://localhost:4000";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/api/admin/login`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ email, password }),
});

      const data = await res.json();

      if (!res.ok) {
        // Backend sends distinct messages for 400/401/404/500 — surface it as-is
        throw new Error(data.message || "Login failed");
      }

      // This endpoint only ever authenticates admins, so role is implicit —
      // the backend doesn't send a top-level `role` field, it's baked into the JWT.
      login(data.token, "admin");
      navigate("/admin/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-6">
      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 rounded-2xl overflow-hidden shadow-2xl border border-slate-800">
        {/* Brand panel */}
        <div className="hidden md:flex flex-col justify-between bg-gradient-to-br from-indigo-900 via-purple-900 to-violet-950 text-white p-10 relative overflow-hidden">
          <div className="absolute -right-10 -top-10 w-56 h-56 rounded-full bg-white/5" />
          <div className="absolute -left-16 bottom-0 w-72 h-72 rounded-full bg-white/5" />

          <div className="flex items-center gap-2 text-2xl font-bold relative z-10">
            <BsTicketPerforated size={26} />
            <span>EventNest</span>
          </div>

          <div className="relative z-10">
            <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center mb-4">
              <BsShieldLock size={22} />
            </div>
            <h2 className="text-2xl font-bold mb-2 leading-snug">
              Admin Control Room
            </h2>
            <p className="text-indigo-200 text-sm leading-relaxed max-w-xs">
              Review organiser applications, approve events before they go
              live, and keep EventNest trustworthy.
            </p>
          </div>
        </div>

        {/* Form panel */}
        <div className="bg-white p-10 flex flex-col justify-center">
          <h1 className="text-2xl font-bold text-slate-800 mb-1">Admin Sign In</h1>
          <p className="text-slate-500 text-sm mb-8">
            Restricted access. Authorized administrators only.
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                {error}
              </div>
            )}

            <div>
              <label className="text-xs text-slate-400 uppercase tracking-wide font-semibold">
                Email Address
              </label>
              <div className="mt-1.5 flex items-center gap-2 border border-slate-200 rounded-lg px-3 py-2.5 focus-within:border-[#49557E]">
                <BsEnvelope className="text-slate-400" size={16} />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@eventnest.com"
                  className="w-full text-sm text-slate-800 outline-none placeholder:text-slate-300"
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-slate-400 uppercase tracking-wide font-semibold">
                Password
              </label>
              <div className="mt-1.5 flex items-center gap-2 border border-slate-200 rounded-lg px-3 py-2.5 focus-within:border-[#49557E]">
                <BsLock className="text-slate-400" size={16} />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full text-sm text-slate-800 outline-none placeholder:text-slate-300"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#49557E] hover:bg-[#3c4768] disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold text-sm py-3 rounded-full transition-colors"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <p className="text-xs text-slate-400 mt-8 text-center">
            Not an admin?{" "}
            <Link to="/" className="text-[#49557E] font-semibold hover:underline">
              Back to EventNest
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;