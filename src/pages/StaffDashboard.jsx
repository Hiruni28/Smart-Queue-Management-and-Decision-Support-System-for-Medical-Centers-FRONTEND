import { useEffect, useState } from "react";
import StaffSidebar from "../components/StaffSidebar";
import StaffTopbar from "../components/StaffTopbar";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

const accentMap = {
  teal: {
    icon: "bg-teal-600/10 border border-teal-500/20 text-teal-400",
    value: "text-teal-400",
    hover: "hover:border-teal-500/40",
  },
  indigo: {
    icon: "bg-indigo-600/10 border border-indigo-500/20 text-indigo-400",
    value: "text-indigo-400",
    hover: "hover:border-indigo-500/40",
  },
  violet: {
    icon: "bg-violet-600/10 border border-violet-500/20 text-violet-400",
    value: "text-violet-400",
    hover: "hover:border-violet-500/40",
  },
};

function Card({ title, value, description, icon, accent, to }) {
  const navigate = useNavigate();
  const a = accentMap[accent];

  return (
    <div
      onClick={() => navigate(to)}
      className={`group bg-slate-900 border border-slate-800 ${a.hover} rounded-2xl p-5
        cursor-pointer transition-all duration-150 hover:bg-slate-800/60`}
    >
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">{title}</p>
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${a.icon}`}>
          {icon}
        </div>
      </div>

      <p className={`text-3xl font-bold tracking-tight ${a.value}`}>{value}</p>

      <div className="flex items-center justify-between mt-2">
        <p className="text-xs text-slate-500">{description}</p>
        <svg
          className="w-3.5 h-3.5 text-slate-600 group-hover:text-slate-400 transition-colors"
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </div>
  );
}

const statusStyles = {
  Confirmed:  "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400",
  Pending:    "bg-amber-500/10 border border-amber-500/20 text-amber-400",
  Cancelled:  "bg-red-500/10 border border-red-500/20 text-red-400",
};

function StatusBadge({ status }) {
  const style = statusStyles[status] ?? "bg-slate-700 text-slate-300 border border-slate-600";
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${style}`}>
      {status}
    </span>
  );
}

function StaffDashboard() {
  const [appointments, setAppointments] = useState([]);
  const [doctorCount, setDoctorCount] = useState(0);
  const staff = localStorage.getItem("staff");

  useEffect(() => { load(); }, []);

  async function load() {
    try {
      const appointmentRes = await api.get("/appointment/today");
      setAppointments(appointmentRes.data);
      const doctorRes = await api.get("/doctors");
      setDoctorCount(doctorRes.data.length);
    } catch (err) {
      console.log(err);
    }
  }

  const cards = [
    {
      title: "Today's Appointments",
      value: appointments.length,
      description: "Scheduled today",
      to: "/staff-schedules",
      accent: "teal",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      title: "Doctors",
      value: doctorCount,
      description: "Available doctors",
      to: "/staff-schedules",
      accent: "indigo",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
    },
    {
      title: "Queue",
      value: "Live",
      description: "Current queue",
      to: "/staff-queue",
      accent: "violet",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M4 6h16M4 10h16M4 14h10" />
        </svg>
      ),
    },
  ];

  const cols = ["Patient", "Doctor", "Specialization", "Room", "Date", "Time", "Status"];

  return (
    <div className="flex min-h-screen bg-slate-950">
      <StaffSidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <StaffTopbar />

        <main className="flex-1 p-8">

          {/* Header */}
          <div className="mb-8">
            <span className="text-xs font-semibold text-teal-400 uppercase tracking-widest">
              Overview
            </span>
            <h1 className="text-2xl text-white font-bold mt-1">
              Welcome back{staff ? `, ${staff.split("@")[0]}` : ""}
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              Here's what's happening in the clinic today.
            </p>
          </div>

          {/* Stat cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            {cards.map((c) => <Card key={c.title} {...c} />)}
          </div>

          {/* Appointments table */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">

            {/* Table header */}
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-white">Today's Appointments</h2>
                <p className="text-xs text-slate-500 mt-0.5">{appointments.length} appointment{appointments.length !== 1 ? "s" : ""} scheduled</p>
              </div>
              <span className="inline-flex items-center gap-1.5 text-xs text-teal-400 bg-teal-500/10 border border-teal-500/20 rounded-full px-3 py-1">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
                Live
              </span>
            </div>

            <div className="overflow-x-auto">
              {appointments.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center mb-3">
                    <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <p className="text-sm text-slate-400 font-medium">No appointments today</p>
                  <p className="text-xs text-slate-600 mt-1">Appointments will appear here once scheduled.</p>
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
                    {appointments.map((a) => (
                      <tr key={a.appointmentId}
                        className="border-t border-slate-800/60 hover:bg-slate-800/40 transition-colors">
                        <td className="px-5 py-3.5 text-white font-medium whitespace-nowrap">{a.patientName}</td>
                        <td className="px-5 py-3.5 text-slate-300 whitespace-nowrap">{a.doctorName}</td>
                        <td className="px-5 py-3.5 text-slate-300 whitespace-nowrap">{a.specialization}</td>
                        <td className="px-5 py-3.5 text-slate-300 whitespace-nowrap">{a.roomNumber}</td>
                        <td className="px-5 py-3.5 text-slate-300 whitespace-nowrap">{a.appointmentDate}</td>
                        <td className="px-5 py-3.5 text-slate-300 whitespace-nowrap">{a.appointmentTime}</td>
                        <td className="px-5 py-3.5 whitespace-nowrap">
                          <StatusBadge status={a.status} />
                        </td>
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

export default StaffDashboard;