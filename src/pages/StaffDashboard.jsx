import StaffSidebar from "../components/StaffSidebar";
import StaffTopbar from "../components/StaffTopbar";
import { useNavigate } from "react-router-dom";

const cards = [
  {
    title: "Walk-In Patients",
    value: "0",
    description: "Registered today",
    to: "/walkin",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
      </svg>
    ),
    accent: "teal",
  },
  {
    title: "Queue",
    value: "Live",
    description: "Currently active",
    to: "/staff-queue",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M4 6h16M4 10h16M4 14h10" />
      </svg>
    ),
    accent: "indigo",
  },
  {
    title: "Schedules",
    value: "24",
    description: "Appointments set",
    to: "/staff-schedules",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
    accent: "violet",
  },
  {
    title: "Doctors",
    value: "12",
    description: "On duty today",
    to: "/staff-schedules",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    accent: "sky",
  },
];

const accentMap = {
  teal: {
    icon: "bg-teal-600/10 border-teal-500/20 text-teal-400",
    value: "text-teal-400",
    hover: "hover:border-teal-500/40",
  },
  indigo: {
    icon: "bg-indigo-600/10 border-indigo-500/20 text-indigo-400",
    value: "text-indigo-400",
    hover: "hover:border-indigo-500/40",
  },
  violet: {
    icon: "bg-violet-600/10 border-violet-500/20 text-violet-400",
    value: "text-violet-400",
    hover: "hover:border-violet-500/40",
  },
  sky: {
    icon: "bg-sky-600/10 border-sky-500/20 text-sky-400",
    value: "text-sky-400",
    hover: "hover:border-sky-500/40",
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
      {/* Icon + title row */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">{title}</p>
        <div className={`w-8 h-8 rounded-lg border flex items-center justify-center shrink-0 ${a.icon}`}>
          {icon}
        </div>
      </div>

      {/* Value */}
      <p className={`text-3xl font-bold tracking-tight ${a.value}`}>{value}</p>

      {/* Description + arrow */}
      <div className="flex items-center justify-between mt-2">
        <p className="text-xs text-slate-500">{description}</p>
        <svg className="w-3.5 h-3.5 text-slate-600 group-hover:text-slate-400 transition-colors"
          fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </div>
  );
}

function StaffDashboard() {
  const staff = localStorage.getItem("staff");

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
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
            {cards.map((card) => (
              <Card key={card.title} {...card} />
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}

export default StaffDashboard;