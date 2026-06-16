import { Link, useLocation, useNavigate } from "react-router-dom";

const navItems = [
  {
    to: "/staff-dashboard",
    label: "Dashboard",
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round"
          d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6Z" />
      </svg>
    ),
  },
  {
    to: "/walkin",
    label: "Walk-In Patients",
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
      </svg>
    ),
  },
  {
    to: "/staff-queue",
    label: "Queue",
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h10" />
      </svg>
    ),
  },
  {
    to: "/staff-schedules",
    label: "Schedules",
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round"
          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  },
];

function StaffSidebar() {
  const location = useLocation();
  const navigate = useNavigate();

  const staff = localStorage.getItem("staff");

  function logout() {
    localStorage.removeItem("staff");
    navigate("/staff-login");
  }

  return (
    <div className="w-64 min-h-screen bg-slate-900 border-r border-slate-800 flex flex-col">

      {/* Logo & Title */}
      <div className="px-5 py-6 border-b border-slate-800">
        <div className="flex flex-col items-center text-center">
          <div className="w-21 h-20 mb-3 rounded-2xl overflow-hidden bg-slate-800 border border-slate-700 flex items-center justify-center">
            <img
              src="/logo.png"
              alt="Logo"
              className="object-contain w-full h-full"
            />
          </div>
          <h2 className="text-3xl font-bold text-teal-400 tracking-tight">Staff Panel</h2>
          <p className="text-xs text-slate-500 mt-0.5">Queue Management System</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-5 flex flex-col gap-1">
        {navItems.map((item) => {
          const active = location.pathname === item.to;
          return (
            <Link
              key={item.to}
              to={item.to}
              className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150
                ${active
                  ? "bg-teal-600 text-white shadow-lg shadow-teal-900/40"
                  : "text-slate-400 hover:bg-slate-800 hover:text-white"
                }`}
            >
              {/* Icon wrapper */}
              <span className={`w-7 h-7 flex items-center justify-center rounded-lg shrink-0 transition-colors
                ${active
                  ? "bg-teal-500/30 text-white"
                  : "bg-slate-800 text-slate-400 group-hover:bg-slate-700 group-hover:text-white"
                }`}>
                {item.icon}
              </span>
              {item.label}
            </Link>
          );
        })}
      </nav>

        {/* Logout button */}
        <button
          onClick={logout}
          className="group w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
            text-red-400 hover:bg-red-950/40 hover:text-red-300 border border-transparent
            hover:border-red-500/20 transition-all duration-150"
        >
          <span className="w-7 h-7 flex items-center justify-center rounded-lg bg-slate-800
            group-hover:bg-red-900/40 text-red-400 shrink-0 transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </span>
          Logout
        </button>
      
    </div>
  );
}

export default StaffSidebar;