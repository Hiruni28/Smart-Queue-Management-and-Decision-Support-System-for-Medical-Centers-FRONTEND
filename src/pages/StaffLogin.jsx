import { useState } from "react";
import api from "../services/api";
import { useNavigate } from "react-router-dom";

function StaffLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function login() {
    setIsLoading(true);
    try {
      const res = await api.post("/staff/login", { email, password });

      if (res.data === "Login Success") {
        localStorage.setItem("staff", email);
        setMsg("Login Success");
        setTimeout(() => navigate("/staff-dashboard"), 1200);
      } else {
        setMsg(res.data);
      }
    } catch {
      setMsg("Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  const isSuccess = msg === "Login Success";

  return (
    <div className="min-h-screen bg-slate-950 flex justify-center items-center px-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-900/20 rounded-full blur-3xl" />
      </div>

      {/* Header with logo */}
      <div className="relative w-full max-w-sm">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl shadow-black/50 p-8">

              <div className="mb-8">
              <div className="w-24 h-24 bg-white rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg">
              <img 
                src="/logo.png"  
                alt="MediQueue Logo" 
              />
            </div>
              <h1 className="mt-1 text-2xl font-bold text-white tracking-tight text-center">
                Staff Login
              </h1>
            </div>

          {/* Email field */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wider">
                Email
              </label>
              <input
                type="email"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && login()}
                className="w-full bg-slate-800 border border-slate-700 text-white placeholder-slate-500 rounded-lg px-4 py-2.5 text-sm
                  focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 transition-colors"
              />
            </div>

           {/* Password field */}
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wider">
                Password
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && login()}
                className="w-full bg-slate-800 border border-slate-700 text-white placeholder-slate-500 rounded-lg px-4 py-2.5 text-sm
                  focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 transition-colors"
              />
            </div>
          </div>

          {/* Submit button */}
          <button
            onClick={login}
            disabled={isLoading || !email || !password}
            className="mt-6 w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 disabled:cursor-not-allowed
              text-white text-sm font-medium py-2.5 rounded-lg transition-colors duration-150
              focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-slate-900"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Signing in…
              </span>
            ) : "Sign in"}
          </button>

          {/* Error / status message */}
          {msg && (
            <p className={`mt-4 text-sm text-center ${isSuccess ? "text-emerald-400" : "text-red-400"}`}>
              {msg}
            </p>
          )}
        </div>

         {/* Footer note */}
        <p className="text-center text-slate-600 text-xs mt-6">
          Staff access only · Unauthorized use is prohibited
        </p>
      </div>
    </div>
  );
}

export default StaffLogin;