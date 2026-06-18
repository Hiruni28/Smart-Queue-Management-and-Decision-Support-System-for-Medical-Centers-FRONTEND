import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import StaffSidebar from "../components/StaffSidebar";
import StaffTopbar from "../components/StaffTopbar";

function StaffPatients() {
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    phone: "",
    dateOfBirth: "",
  });

  function showMessage(text, type) {
    setMessage(text);
    setMessageType(type);
    setTimeout(() => setMessage(""), 3000);
  }

  async function load() {
    try {
      const res = await api.get("/patient");
      setPatients(res.data);
    } catch {
      showMessage("Failed to load patients", "error");
    }
  }

  useEffect(() => { load(); }, []);

  async function register() {
    try {
      const res = await api.post("/patient/walkin", form);
      showMessage(res.data, "success");
      setForm({ fullName: "", email: "", password: "", phone: "", dateOfBirth: "" });
      load();
    } catch {
      showMessage("Patient registration failed", "error");
    }
  }

  async function searchPatient() {
    try {
      if (!search) { load(); return; }
      const res = await api.get(`/patient/search?keyword=${search}`);
      setPatients(res.data);
    } catch {
      showMessage("Search failed", "error");
    }
  }

  const inputClass = "w-full bg-slate-800 border border-slate-700 text-white placeholder-slate-500 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500/50 transition-colors";
  const cols = ["ID", "Name", "Email", "Phone", "DOB"];

  return (
    <div className="flex min-h-screen bg-slate-950">
      <StaffSidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <StaffTopbar />

        <main className="flex-1 p-8">

          {/* Header */}
          <div className="flex items-start justify-between mb-8">
            <div>
              <span className="text-xs font-semibold text-teal-400 uppercase tracking-widest">
                Patients
              </span>
              <h1 className="text-2xl text-white font-bold mt-1">Patient Management</h1>
              <p className="text-slate-500 text-sm mt-1">Register walk-in patients and search records.</p>
            </div>
            <button
              onClick={() => navigate("/staff-dashboard")}
              className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 border border-slate-700
                text-slate-300 hover:text-white text-sm font-medium px-4 py-2.5 rounded-xl transition-all"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Dashboard
            </button>
          </div>

          {/* Toast */}
          {message && (
            <div className={`mb-6 px-4 py-3 rounded-xl text-sm font-medium border flex items-center gap-2
              ${messageType === "success"
                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                : "bg-red-500/10 text-red-400 border-red-500/30"
              }`}>
              {messageType === "success"
                ? <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                  </svg>
                : <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
                  </svg>
              }
              {message}
            </div>
          )}

          {/* Register form */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mb-6 relative overflow-hidden">
            <div className="absolute left-0 top-4 bottom-4 w-0.5 bg-gradient-to-b from-teal-400 to-teal-600 rounded-full" />

            <div className="flex items-center gap-2 mb-5">
              <div className="w-7 h-7 rounded-lg bg-teal-600/10 border border-teal-500/20 flex items-center justify-center">
                <svg className="w-3.5 h-3.5 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
              </div>
              <h2 className="text-sm font-semibold text-teal-400 uppercase tracking-widest">
                Register Walk-In Patient
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 uppercase tracking-wide mb-1.5">Full Name</label>
                <input
                  placeholder="Jane Doe"
                  value={form.fullName}
                  onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 uppercase tracking-wide mb-1.5">Email</label>
                <input
                  type="email"
                  placeholder="jane@example.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 uppercase tracking-wide mb-1.5">Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 uppercase tracking-wide mb-1.5">Phone</label>
                <input
                  placeholder="+94 77 123 4567"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 uppercase tracking-wide mb-1.5">Date of Birth</label>
                <input
                  type="date"
                  value={form.dateOfBirth}
                  onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })}
                  className={inputClass}
                />
              </div>
            </div>

            <button
              onClick={register}
              className="mt-5 bg-teal-600 hover:bg-teal-500 active:bg-teal-700 text-white text-sm font-semibold
                px-6 py-2.5 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500
                focus:ring-offset-2 focus:ring-offset-slate-900"
            >
              Register Patient
            </button>
          </div>

          {/* Patients table */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">

            {/* Table header + search */}
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between gap-4 flex-wrap">
              <div>
                <h2 className="text-sm font-semibold text-teal-400 uppercase tracking-widest">All Patients</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  {patients.length} patient{patients.length !== 1 ? "s" : ""} found
                </p>
              </div>

              <div className="flex items-center gap-2">
                <div className="relative">
                  <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none"
                    fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    placeholder="Search patient…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && searchPatient()}
                    className="bg-slate-800 border border-slate-700 text-white placeholder-slate-500 rounded-lg
                      pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-teal-500 focus:ring-1
                      focus:ring-teal-500/50 transition-colors w-56"
                  />
                </div>
                <button
                  onClick={searchPatient}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
                >
                  Search
                </button>
                {search && (
                  <button
                    onClick={() => { setSearch(""); load(); }}
                    className="text-slate-400 hover:text-white text-sm px-3 py-2 rounded-lg hover:bg-slate-800 transition-colors"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>

            <div className="overflow-x-auto">
              {patients.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center mb-3">
                    <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <p className="text-sm text-slate-400 font-medium">No patients found</p>
                  <p className="text-xs text-slate-600 mt-1">
                    {search ? "Try a different search term." : "Register a walk-in patient above."}
                  </p>
                </div>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-800">
                      {cols.map((col) => (
                        <th key={col}
                          className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {patients.map((p) => (
                      <tr key={p.patientId}
                        className="border-t border-slate-800/60 hover:bg-slate-800/40 transition-colors">
                        <td className="px-5 py-3.5 text-slate-500 font-mono text-xs">{p.patientId}</td>
                        <td className="px-5 py-3.5 text-white font-medium whitespace-nowrap">{p.fullName}</td>
                        <td className="px-5 py-3.5 text-slate-300 whitespace-nowrap">{p.email}</td>
                        <td className="px-5 py-3.5 text-slate-300 whitespace-nowrap">{p.phone}</td>
                        <td className="px-5 py-3.5 text-slate-300 whitespace-nowrap">{p.dateOfBirth}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

        </main>
      </div>
    </div>
  );
}

export default StaffPatients;