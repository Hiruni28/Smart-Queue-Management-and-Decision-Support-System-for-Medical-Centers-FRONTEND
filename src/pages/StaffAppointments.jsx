import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import StaffSidebar from "../components/StaffSidebar";
import StaffTopbar from "../components/StaffTopbar";

const statusStyles = {
  Confirmed: "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400",
  Completed: "bg-teal-500/10 border border-teal-500/20 text-teal-400",
  Pending:   "bg-amber-500/10 border border-amber-500/20 text-amber-400",
  Cancelled: "bg-red-500/10 border border-red-500/20 text-red-400",
};

function StatusBadge({ status }) {
  const style = statusStyles[status] ?? "bg-slate-700 border border-slate-600 text-slate-300";
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${style}`}>
      {status}
    </span>
  );
}

function Toast({ message, type, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [message]);

  if (!message) return null;

  const styles = {
    success: "bg-emerald-500/10 border-emerald-500/30 text-emerald-400",
    error:   "bg-red-500/10 border-red-500/30 text-red-400",
  };

  const icons = {
    success: (
      <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
    ),
    error: (
      <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      </svg>
    ),
  };

  return (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl
      border shadow-lg shadow-black/30 text-sm font-medium backdrop-blur-sm
      animate-fade-in ${styles[type]}`}>
      {icons[type]}
      {message}
      <button onClick={onClose} className="ml-2 opacity-60 hover:opacity-100 transition-opacity">
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}

function StaffAppointments() {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [doctorId, setDoctorId] = useState("");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ message: "", type: "success" });

  function showToast(message, type = "success") {
    setToast({ message, type });
  }

  function clearToast() {
    setToast({ message: "", type: "success" });
  }

  async function loadDoctors() {
    try {
      const res = await api.get("/doctors");
      setDoctors(res.data);
    } catch {
      showToast("Failed to load doctors.", "error");
    }
  }

  async function loadAppointments() {
    if (!doctorId) { setAppointments([]); return; }
    setLoading(true);
    try {
      const res = await api.get(`/appointment/staff/today/${doctorId}`);
      setAppointments(res.data);
    } catch {
      showToast("Failed to load appointments.", "error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadDoctors(); }, []);
  useEffect(() => { loadAppointments(); }, [doctorId]);

  async function update(id, status) {
    try {
      await api.put(`/appointment/status/${id}?status=${status}`);
      showToast(`Appointment marked as ${status}.`, "success");
      loadAppointments();
    } catch {
      showToast(`Failed to update appointment status.`, "error");
    }
  }

  const selectedDoctor = doctors.find(d => String(d.doctorId) === String(doctorId));
  const cols = ["ID", "Patient", "Doctor", "Specialization", "Room", "Time", "Status", "Actions"];

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
                Schedules
              </span>
              <h1 className="text-2xl text-white font-bold mt-1">Today's Appointments</h1>
              <p className="text-slate-500 text-sm mt-1">Select a doctor to view their appointments.</p>
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

          {/* Doctor selector */}
          <div className="mb-6">
            <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">
              Filter by Doctor
            </label>
            <div className="relative w-80">
              <select
                value={doctorId}
                onChange={(e) => setDoctorId(e.target.value)}
                className="w-full appearance-none bg-slate-900 border border-slate-700 hover:border-slate-600
                  text-white text-sm px-4 py-2.5 rounded-xl pr-10
                  focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500/50 transition-colors"
              >
                <option value="">Select a doctor…</option>
                {doctors.map((d) => (
                  <option key={d.doctorId} value={d.doctorId}>
                    {d.doctorName} — {d.specialization}
                  </option>
                ))}
              </select>
              <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none"
                fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>

          {/* Table card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">

            {/* Table header bar */}
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-white">
                  {selectedDoctor
                    ? `${selectedDoctor.doctorName} · ${selectedDoctor.specialization}`
                    : "Appointments"}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  {doctorId
                    ? `${appointments.length} appointment${appointments.length !== 1 ? "s" : ""} today`
                    : "No doctor selected"}
                </p>
              </div>
              {doctorId && (
                <span className="inline-flex items-center gap-1.5 text-xs text-teal-400 bg-teal-500/10 border border-teal-500/20 rounded-full px-3 py-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
                  Live
                </span>
              )}
            </div>

            <div className="overflow-x-auto">

              {/* No doctor selected */}
              {!doctorId && (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center mb-3">
                    <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <p className="text-sm text-slate-400 font-medium">No doctor selected</p>
                  <p className="text-xs text-slate-600 mt-1">Choose a doctor above to see today's appointments.</p>
                </div>
              )}

              {/* Loading */}
              {doctorId && loading && (
                <div className="flex items-center justify-center py-16 gap-2 text-slate-500 text-sm">
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Loading appointments…
                </div>
              )}

              {/* Empty */}
              {doctorId && !loading && appointments.length === 0 && (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center mb-3">
                    <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <p className="text-sm text-slate-400 font-medium">No appointments today</p>
                  <p className="text-xs text-slate-600 mt-1">This doctor has no appointments scheduled for today.</p>
                </div>
              )}

              {/* Table */}
              {doctorId && !loading && appointments.length > 0 && (
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
                        <td className="px-5 py-3.5 text-slate-500 font-mono text-xs">{a.appointmentId}</td>
                        <td className="px-5 py-3.5 text-white font-medium whitespace-nowrap">{a.patientName}</td>
                        <td className="px-5 py-3.5 text-slate-300 whitespace-nowrap">{a.doctorName}</td>
                        <td className="px-5 py-3.5 text-slate-300 whitespace-nowrap">{a.specialization}</td>
                        <td className="px-5 py-3.5 text-slate-300 whitespace-nowrap">{a.roomNumber}</td>
                        <td className="px-5 py-3.5 text-slate-300 whitespace-nowrap">{a.appointmentTime}</td>
                        <td className="px-5 py-3.5 whitespace-nowrap">
                          <StatusBadge status={a.status} />
                        </td>
                        <td className="px-5 py-3.5 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => update(a.appointmentId, "Confirmed")}
                              className="text-xs font-medium px-3 py-1.5 rounded-lg
                                bg-indigo-500/10 border border-indigo-500/20 text-indigo-400
                                hover:bg-indigo-500/20 transition-colors"
                            >
                              Confirm
                            </button>
                            <button
                              onClick={() => update(a.appointmentId, "Completed")}
                              className="text-xs font-medium px-3 py-1.5 rounded-lg
                                bg-emerald-500/10 border border-emerald-500/20 text-emerald-400
                                hover:bg-emerald-500/20 transition-colors"
                            >
                              Complete
                            </button>
                            <button
                              onClick={() => update(a.appointmentId, "Cancelled")}
                              className="text-xs font-medium px-3 py-1.5 rounded-lg
                                bg-red-500/10 border border-red-500/20 text-red-400
                                hover:bg-red-500/20 transition-colors"
                            >
                              Cancel
                            </button>
                          </div>
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

      {/* Toast */}
      <Toast message={toast.message} type={toast.type} onClose={clearToast} />
    </div>
  );
}

export default StaffAppointments;