import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function PatientProfile() {
  const email = localStorage.getItem("patient");
  const navigate = useNavigate();

  const [patient, setPatient] = useState({});
  const [msg, setMsg] = useState("");
  const [msgType, setMsgType] = useState("");

  async function loadProfile() {
    try {
      const response = await api.get(`/patient/profile/${email}`);
      setPatient(response.data);
    } catch {
      setMsg("Failed to load profile");
      setMsgType("error");
    }
  }

  useEffect(() => {
    loadProfile();
  }, []);

  async function save() {
    try {
      await api.put("/patient/profile", patient);
      setMsg("✓ Profile updated successfully");
      setMsgType("success");
      setTimeout(() => setMsg(""), 3000);
    } catch {
      setMsg("Update failed. Please try again.");
      setMsgType("error");
      setTimeout(() => setMsg(""), 3000);
    }
  }

  const inputClass =
    "w-full bg-white border border-slate-200 text-slate-800 placeholder-slate-400 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-colors duration-200 shadow-sm";

  const disabledInputClass =
    "w-full bg-slate-100 border border-slate-200 text-slate-400 rounded-lg px-4 py-3 text-sm cursor-not-allowed shadow-sm";

  return (
    <div className="min-h-screen bg-slate-300 px-4 py-12">
      {/* Subtle background accent */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-teal-400/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-teal-400/10 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-lg mx-auto">
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-teal-50 border border-teal-200 flex items-center justify-center">
                <svg className="w-4 h-4 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="text-xs font-medium text-teal-600 tracking-widest uppercase">Account</span>
            </div>
            <h1 className="text-2xl font-semibold text-slate-800">Patient Profile</h1>
            <p className="mt-1 text-sm text-slate-500">Update your personal details below.</p>
          </div>

          {/* Back to Dashboard */}
          <button
            onClick={() => navigate("/patient-dashboard")}
            className="flex items-center gap-2 bg-white hover:bg-slate-100 active:bg-slate-200 text-slate-600 hover:text-slate-800 border border-slate-200 hover:border-slate-300 px-4 py-2 rounded-xl text-sm font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-slate-300 focus:ring-offset-2 focus:ring-offset-slate-50 shadow-sm"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Dashboard
          </button>
        </div>

        {/* Card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-xl shadow-slate-200/60">

          {/* Message banner */}
          {msg && (
            <div className={`mb-6 px-4 py-3 rounded-lg text-sm font-medium flex items-center gap-2 transition-all duration-300 ${
              msgType === "success"
                ? "bg-teal-50 border border-teal-200 text-teal-700"
                : "bg-red-50 border border-red-200 text-red-600"
            }`}>
              {msg}
            </div>
          )}

          <div className="space-y-4">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5 tracking-wide">Full Name</label>
              <input
                value={patient.fullName || ""}
                onChange={(e) => setPatient({ ...patient, fullName: e.target.value })}
                placeholder="Your full name"
                className={inputClass}
              />
            </div>

            {/* Email — read only */}
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5 tracking-wide">
                Email
                <span className="ml-2 text-slate-400 font-normal normal-case tracking-normal">read-only</span>
              </label>
              <input
                value={patient.email || ""}
                disabled
                className={disabledInputClass}
              />
            </div>

            {/* Phone & DOB — side by side */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5 tracking-wide">Phone</label>
                <input
                  value={patient.phone || ""}
                  onChange={(e) => setPatient({ ...patient, phone: e.target.value })}
                  placeholder="+94 77 000 0000"
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5 tracking-wide">Date of Birth</label>
                <input
                  type="date"
                  value={patient.dateOfBirth || ""}
                  onChange={(e) => setPatient({ ...patient, dateOfBirth: e.target.value })}
                  className={`${inputClass} [color-scheme:light]`}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5 tracking-wide">New Password</label>
              <input
                type="password"
                value={patient.password || ""}
                onChange={(e) => setPatient({ ...patient, password: e.target.value })}
                placeholder="Leave blank to keep current"
                className={inputClass}
              />
            </div>

            {/* Divider */}
            <div className="border-t border-slate-100 pt-4">
              <button
                onClick={save}
                className="w-full bg-teal-500 hover:bg-teal-600 active:bg-teal-700 text-white font-semibold py-3 rounded-lg text-sm tracking-wide transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 focus:ring-offset-white shadow-sm"
              >
                Save Profile
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PatientProfile;
