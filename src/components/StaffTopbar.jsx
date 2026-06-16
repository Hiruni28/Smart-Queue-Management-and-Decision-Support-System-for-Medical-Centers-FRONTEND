import { useLocation } from "react-router-dom";

const pageTitles = {
  "/staff-dashboard": "Dashboard",
  "/walkin": "Walk-In Patients",
  "/staff-queue": "Queue",
  "/staff-schedules": "Schedules",
};

function StaffTopbar() {
  const location = useLocation();
  const staff = localStorage.getItem("staff");
  const pageTitle = pageTitles[location.pathname] || "Staff Panel";

  return (
    <div className="bg-slate-900 border-b border-slate-800 px-6 py-3.5 flex items-center justify-between">

      {/* Left — dynamic page title */}
      <div>
        <h2 className="text-lg font-bold text-white leading-tight">
          Staff Dashboard
        </h2>
      </div>

      {/* Right — staff info */}
      <div className="flex items-center gap-3">
        <div className="text-right">
          <p className="text-sm text-white font-medium leading-none mb-1 truncate max-w-[180px]">
            {staff || "Staff Member"}
          </p>
          <span className="inline-flex items-center gap-1 text-xs text-teal-400 bg-teal-500/10 border border-teal-500/20 rounded-full px-2 py-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
            Limited Access
          </span>
        </div>

        {/* Avatar */}
        <div className="w-9 h-9 rounded-xl bg-teal-600/20 border border-teal-500/30 flex items-center justify-center shrink-0">
          <svg className="w-4 h-4 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
      </div>

    </div>
  );
}

export default StaffTopbar;