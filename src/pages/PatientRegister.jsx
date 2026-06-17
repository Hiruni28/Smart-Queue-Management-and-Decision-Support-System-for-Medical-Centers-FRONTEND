import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function PatientRegister() {
  const navigate = useNavigate();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [msg, setMsg] = useState("");
  const [msgType, setMsgType] = useState("");

  function showMessage(text, type) {
    setMsg(text);
    setMsgType(type);
    setTimeout(() => {
      setMsg("");
    }, 3000);
  }

  async function register() {
    if (!fullName || !email || !password || !phone || !dateOfBirth) {
      showMessage("All fields are required!", "error");
      return;
    }

    try {
      const response = await api.post("/patient/register", {
        fullName,
        email,
        password,
        phone,
        dateOfBirth,
      });

      if (response.data === "Registration Success") {
        showMessage("✓ Registration Success", "success");
        setTimeout(() => {
          navigate("/patient-login");
        }, 1500);
      } else {
        showMessage(response.data, "error");
      }
    } catch {
      showMessage("Registration Failed!", "error");
    }
  }

  const inputClass =
    "w-full bg-white border border-slate-200 text-slate-800 placeholder-slate-400 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-colors duration-200 shadow-sm";

  return (
    <div className="min-h-screen bg-slate-300 flex items-center justify-center px-4">
      {/* Subtle background accent */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-teal-400/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-teal-400/10 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-xl shadow-slate-200/60">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-teal-50 border border-teal-200 flex items-center justify-center">
                <svg className="w-4 h-4 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <span className="text-xs font-medium text-teal-600 tracking-widest uppercase">New Account</span>
            </div>
            <h1 className="text-2xl font-semibold text-slate-800 leading-tight">Patient Registration</h1>
            <p className="mt-1 text-sm text-slate-500">Fill in your details to get started.</p>
          </div>

          {/* Message banner */}
          {msg && (
            <div
              className={`mb-6 px-4 py-3 rounded-lg text-sm font-medium flex items-center gap-2 transition-all duration-300 ${
                msgType === "success"
                  ? "bg-teal-50 border border-teal-200 text-teal-700"
                  : "bg-red-50 border border-red-200 text-red-600"
              }`}
            >
              <span>{msg}</span>
            </div>
          )}

          {/* Form fields */}
          <div className="space-y-4">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5 tracking-wide">Full Name</label>
              <input
                placeholder="e.g. Jane Perera"
                className={inputClass}
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5 tracking-wide">Email</label>
              <input
                type="email"
                placeholder="you@example.com"
                className={inputClass}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5 tracking-wide">Password</label>
              <input
                type="password"
                placeholder="••••••••"
                className={inputClass}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {/* Phone & DOB — side by side */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5 tracking-wide">Phone</label>
                <input
                  placeholder="+94 77 000 0000"
                  className={inputClass}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5 tracking-wide">Date of Birth</label>
                <input
                  type="date"
                  className={`${inputClass} [color-scheme:light]`}
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                />
              </div>
            </div>

            {/* Submit */}
            <button
              onClick={register}
              className="w-full mt-2 bg-teal-500 hover:bg-teal-600 active:bg-teal-700 text-white font-semibold py-3 rounded-lg text-sm tracking-wide transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 focus:ring-offset-white shadow-sm"
            >
              Create Account
            </button>
          </div>

          {/* Footer link */}
          <p className="mt-6 text-center text-xs text-slate-400">
            Already registered?{" "}
            <button
              onClick={() => navigate("/patient-login")}
              className="text-teal-600 hover:text-teal-700 transition-colors duration-150 font-medium"
            >
              Sign in
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

export default PatientRegister;
