import { useEffect, useState } from "react";
import api from "../services/api";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";

function AdminDashboard() {
  const [stats, setStats] = useState({});

  useEffect(() => {
    load();
  }, []);

  async function load() {
    const res = await api.get("/dashboard");
    setStats(res.data);
  }

  return (
    <div className="flex min-h-screen bg-slate-950">
      <Sidebar />

      <div className="flex-1 flex flex-col">
        <Topbar />

        <main className="flex-1 p-8">

          {/* Page header */}
          <div className="mb-8">
            <span className="text-xs font-semibold tracking-widest text-indigo-400 uppercase">
              Overview
            </span>
            <h1 className="mt-1 text-2xl font-bold text-white tracking-tight">
              Welcome back, Admin
            </h1>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
            <Card
              title="Doctors"
              value={stats.doctors}
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-3-3v6M5.25 6.375a4.125 4.125 0 1 1 8.25 0 4.125 4.125 0 0 1-8.25 0ZM3 19.125a7.125 7.125 0 0 1 14.25 0v.003l-.001.119a.75.75 0 0 1-.363.63 13.067 13.067 0 0 1-6.761 1.873c-2.472 0-4.786-.684-6.76-1.873a.75.75 0 0 1-.364-.63l-.001-.122Z" />
                </svg>
              }
            />
            <Card
              title="Staff"
              value={stats.staff}
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" />
                </svg>
              }
            />
            <Card
              title="Appointments"
              value={stats.appointments}
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
                </svg>
              }
            />
            <Card
              title="Waiting Queue"
              value={stats.waitingPatients}
              live
              icon={
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.8}
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 0 1 0 3.75H5.625a1.875 1.875 0 0 1 0-3.75Z"
                  />
                </svg>
              }
            />
            <Card
              title="Now Serving"
              value={stats.servingPatients}
              icon={
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.8}
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 12.75 11.25 15 15 9.75"
                  />
                  <circle
                    cx="12"
                    cy="12"
                    r="9"
                  />
                </svg>
              }
            />
          </div>
        </main>
      </div>
    </div>
  );
}

function Card({ title, value, icon, live }) {
  return (
    <div className="relative bg-slate-900 rounded-2xl p-6 border border-slate-800 shadow-lg shadow-black/30 overflow-hidden group">

      {/* Subtle left accent bar */}
      <div className="absolute left-0 top-4 bottom-4 w-0.5 bg-gradient-to-b from-indigo-400 to-indigo-600 rounded-full" />

      {/* Icon */}
      <div className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-indigo-600/10 text-indigo-400 mb-4">
        {icon}
      </div>

      {/* Label */}
      <p className="text-xs font-semibold tracking-widest text-slate-400 uppercase mb-1">
        {title}
      </p>

      {/* Value */}
      <div className="flex items-end gap-2">
        <span className="text-3xl font-bold text-white leading-none">
          {value ?? "—"}
        </span>

        {/* Live pulse badge */}
        {live && (
          <span className="flex items-center gap-1.5 mb-0.5 text-xs font-semibold text-emerald-400">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
            </span>
            Active
          </span>
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;
