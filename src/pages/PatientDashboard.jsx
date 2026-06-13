import { Link, useNavigate } from "react-router-dom";

function PatientDashboard() {
  const email = localStorage.getItem("patient");
  const navigate = useNavigate();

  function logout() {
    localStorage.removeItem("patient");
    navigate("/patient-login");
  }

  return (
    <div className="min-h-screen bg-slate-400 px-4 py-12">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-teal-400/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-teal-400/10 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-2xl mx-auto">

        {/* Header */}
        <div className="flex justify-between items-start mb-10">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-teal-50 border border-teal-200 flex items-center justify-center">
                <svg className="w-4 h-4 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
              </div>
              <span className="text-xs font-medium text-teal-600 tracking-widest uppercase">Dashboard</span>
            </div>
            <h1 className="text-2xl font-semibold text-slate-800">Welcome back</h1>
            <p className="mt-1 text-sm text-slate-500">{email}</p>
          </div>

          {/* Logout */}
          <button
            onClick={logout}
            className="bg-red-50 hover:bg-red-100 active:bg-red-200 text-red-500 border border-red-200 hover:border-red-300 px-5 py-2 rounded-xl text-sm font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-300 focus:ring-offset-2 focus:ring-offset-slate-50"
          >
            Logout
          </button>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

          {/* Profile card */}
          <Link
            to="/patient-profile"
            className="group bg-white border border-slate-200 hover:border-teal-400 rounded-2xl p-6 shadow-sm hover:shadow-md shadow-slate-100 transition-all duration-200"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center">
                <svg className="w-5 h-5 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <svg className="w-4 h-4 text-slate-300 group-hover:text-teal-500 transition-colors duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </div>
            <h2 className="text-sm font-semibold text-slate-800 mb-1">My Profile</h2>
            <p className="text-xs text-slate-500">View and update your personal details.</p>
          </Link>

          {/* Appointments card */}
          <Link
            to="/appointments"
            className="group bg-white border border-slate-200 hover:border-indigo-400 rounded-2xl p-6 shadow-sm hover:shadow-md shadow-slate-100 transition-all duration-200"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center">
                <svg className="w-5 h-5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <svg className="w-4 h-4 text-slate-300 group-hover:text-indigo-500 transition-colors duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </div>
            <h2 className="text-sm font-semibold text-slate-800 mb-1">Appointments</h2>
            <p className="text-xs text-slate-500">Book and manage appointments.</p>
          </Link>

        </div>
      </div>
    </div>
  );
}

export default PatientDashboard;
