import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function PatientLogin() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [msgType, setMsgType] = useState("");

  function showMessage(text, type) {
    setMsg(text);
    setMsgType(type);
    setTimeout(() => {
      setMsg("");
    }, 3000);
  }

  async function login() {
    if (!email || !password) {
      showMessage("Fill all fields", "error");
      return;
    }

    try {
      const response = await api.post("/patient/login", { email, password });

      if (response.data === "Login Success") {
        showMessage("✓ Login Success", "success");
        localStorage.setItem("patient", email);
        setTimeout(() => {
          navigate("/patient-dashboard");
        }, 1500);
      } else {
        showMessage(response.data, "error");
      }
    } catch {
      showMessage("Login Failed", "error");
    }
  }

  const inputClass =
    "w-full bg-transparent border border-slate-700 text-slate-100 placeholder-slate-500 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-colors duration-200";

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
      {/* Subtle background accent */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-teal-500/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-teal-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl shadow-black/40">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-teal-500/10 border border-teal-500/20 flex items-center justify-center">
                <svg className="w-4 h-4 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
              </div>
              <span className="text-xs font-medium text-teal-400 tracking-widest uppercase">Patient Portal</span>
            </div>
            <h1 className="text-2xl font-semibold text-slate-100 leading-tight">Welcome back</h1>
            <p className="mt-1 text-sm text-slate-500">Sign in to access your health dashboard.</p>
          </div>

          {/* Message banner */}
          {msg && (
            <div
              className={`mb-6 px-4 py-3 rounded-lg text-sm font-medium flex items-center gap-2 transition-all duration-300 ${
                msgType === "success"
                  ? "bg-teal-500/10 border border-teal-500/20 text-teal-400"
                  : "bg-red-500/10 border border-red-500/20 text-red-400"
              }`}
            >
              <span>{msg}</span>
            </div>
          )}

          {/* Form fields */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5 tracking-wide">Email</label>
              <input
                type="email"
                placeholder="you@example.com"
                className={inputClass}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5 tracking-wide">Password</label>
              <input
                type="password"
                placeholder="••••••••"
                className={inputClass}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button
              onClick={login}
              className="w-full mt-2 bg-teal-500 hover:bg-teal-400 active:bg-teal-600 text-slate-950 font-semibold py-3 rounded-lg text-sm tracking-wide transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 focus:ring-offset-slate-900"
            >
              Sign In
            </button>
          </div>

          {/* Footer link */}
          <p className="mt-6 text-center text-xs text-slate-600">
            Don't have an account?{" "}
            <button
              onClick={() => navigate("/patient-register")}
              className="text-teal-500 hover:text-teal-400 transition-colors duration-150 font-medium"
            >
              Register
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

export default PatientLogin;
