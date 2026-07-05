import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import StaffSidebar from "../components/StaffSidebar";
import StaffTopbar from "../components/StaffTopbar";

const statusStyles = {
  Booked:    "bg-indigo-500/10 border border-indigo-500/20 text-indigo-400",
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
      border shadow-lg shadow-black/30 text-sm font-medium backdrop-blur-sm ${styles[type]}`}>
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

  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [allAppointments, setAllAppointments] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [manageSchedules, setManageSchedules] = useState([]);
  const [editingId, setEditingId] = useState(null);

  const [patientId, setPatientId] = useState("");
  const [manageDoctorId, setManageDoctorId] = useState("");
  const [appointmentDate, setAppointmentDate] = useState("");
  const [appointmentTime, setAppointmentTime] = useState("");

  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [toast, setToast] = useState({ message: "", type: "success" });
  const [loading, setLoading] = useState(false);
  const [doctorId, setDoctorId] = useState("");

  const filteredAppointments = allAppointments.filter((app) => {
    const patientName = (patients.find(p => p.patientId === app.patientId)?.fullName || "").toLowerCase();
    const doctorName  = (doctors.find(d => d.doctorId === app.doctorId)?.doctorName || "").toLowerCase();
    const search = searchText.toLowerCase();
    return (
      (patientName.includes(search) || doctorName.includes(search)) &&
      (!statusFilter || app.status === statusFilter) &&
      (!dateFilter || app.appointmentDate === dateFilter)
    );
  });

  function showToast(message, type = "success") { setToast({ message, type }); }
  function clearToast() { setToast({ message: "", type: "success" }); }

  async function loadDoctors() {
    try { const res = await api.get("/doctors"); setDoctors(res.data); }
    catch { showToast("Failed to load doctors.", "error"); }
  }
  async function loadPatients() {
    try { const res = await api.get("/patient"); setPatients(res.data); }
    catch { showToast("Failed to load patients.", "error"); }
  }
  async function loadAllAppointments() {
    try { const res = await api.get("/appointment/staff/all"); setAllAppointments(res.data); }
    catch { showToast("Failed to load appointments.", "error"); }
  }
  async function loadManageSchedules(id) {
    if (!id) { setManageSchedules([]); return; }
    try { const res = await api.get(`/schedule/${id}`); setManageSchedules(res.data); }
    catch { setManageSchedules([]); }
  }
  async function loadAppointments() {
    if (!doctorId) { setAppointments([]); return; }
    setLoading(true);
    try { const res = await api.get(`/appointment/staff/today/${doctorId}`); setAppointments(res.data); }
    catch { showToast("Failed to load appointments.", "error"); }
    finally { setLoading(false); }
  }

  async function saveAppointment() {
    if (!patientId || !manageDoctorId || !appointmentDate || !appointmentTime) {
      showToast("Please fill all fields.", "error"); return;
    }
    const data = { patientId: Number(patientId), doctorId: Number(manageDoctorId), appointmentDate, appointmentTime, status: "Booked" };
    try {
      if (editingId) { await api.put(`/appointment/staff/${editingId}`, data); showToast("Appointment updated successfully."); }
      else           { await api.post("/appointment/staff", data); showToast("Appointment created successfully."); }
      clearForm(); loadAllAppointments();
    } catch (error) { showToast(error.response?.data?.message || "Operation failed.", "error"); }
  }

  function editAppointment(app) {
    setEditingId(app.appointmentId);
    const patient = patients.find(p => p.fullName === app.patientName);
    const doctor  = doctors.find(d => d.doctorId === app.doctorId);
    setPatientId(patient ? String(patient.patientId) : "");
    setManageDoctorId(doctor ? String(doctor.doctorId) : "");
    setAppointmentDate(app.appointmentDate);
    setAppointmentTime(app.appointmentTime);
    loadManageSchedules(app.doctorId);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function deleteAppointment(id) {
    if (!window.confirm("Delete this appointment?")) return;
    try { await api.delete(`/appointment/staff/${id}`); showToast("Appointment deleted."); loadAllAppointments(); }
    catch { showToast("Delete failed.", "error"); }
  }

  function clearForm() {
    setEditingId(null); setPatientId(""); setManageDoctorId("");
    setAppointmentDate(""); setAppointmentTime(""); setManageSchedules([]);
  }

  async function update(id, status) {
    try { await api.put(`/appointment/status/${id}?status=${status}`); showToast(`Appointment marked as ${status}.`); loadAppointments(); }
    catch { showToast("Failed to update appointment status.", "error"); }
  }

  useEffect(() => { loadDoctors(); loadPatients(); loadAllAppointments(); }, []);
  useEffect(() => { if (manageDoctorId) loadManageSchedules(manageDoctorId); }, [manageDoctorId]);
  useEffect(() => { loadAppointments(); }, [doctorId]);

  const selectedDoctor = doctors.find(d => String(d.doctorId) === String(doctorId));
  const todayCols = ["ID", "Patient", "Doctor", "Specialization", "Room", "Time", "Status", "Actions"];

  const inputClass = "w-full bg-slate-800 border border-slate-700 text-white placeholder-slate-500 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500/50 transition-colors appearance-none";
  const editInputClass = "w-full bg-slate-800 border border-amber-500/30 text-white placeholder-slate-500 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/50 transition-colors appearance-none";

  const isEditing = !!editingId;
  const selectClass = isEditing ? editInputClass : inputClass;

  return (
    <div className="flex min-h-screen bg-slate-950">
      <StaffSidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <StaffTopbar />

        <main className="flex-1 p-8">

          {/* Header */}
          <div className="flex items-start justify-between mb-8">
            <div>
              <span className="text-xs font-semibold text-teal-400 uppercase tracking-widest">Appointments</span>
              <h1 className="text-2xl text-white font-bold mt-1">Appointment Management</h1>
              <p className="text-slate-500 text-sm mt-1">Create, update, and manage all appointments.</p>
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

          {/* ── Create / Edit form ── */}
          <div className={`bg-slate-900 border rounded-2xl p-6 mb-6 relative overflow-hidden transition-colors duration-200
            ${isEditing ? "border-amber-500/30" : "border-slate-800"}`}>
            <div className={`absolute left-0 top-4 bottom-4 w-0.5 rounded-full
              ${isEditing ? "bg-gradient-to-b from-amber-400 to-amber-600" : "bg-gradient-to-b from-teal-400 to-teal-600"}`} />

            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <div className={`w-7 h-7 rounded-lg border flex items-center justify-center
                  ${isEditing ? "bg-amber-500/10 border-amber-500/20 text-amber-400" : "bg-teal-500/10 border-teal-500/20 text-teal-400"}`}>
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {isEditing
                      ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    }
                  </svg>
                </div>
                <h2 className={`text-sm font-semibold uppercase tracking-widest
                  ${isEditing ? "text-amber-400" : "text-teal-400"}`}>
                  {isEditing ? "Update Appointment" : "Create Appointment"}
                </h2>
              </div>
              {isEditing && (
                <button
                  onClick={clearForm}
                  className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Discard
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 uppercase tracking-wide mb-1.5">Patient</label>
                <div className="relative">
                  <select value={patientId} onChange={(e) => setPatientId(e.target.value)} className={selectClass}>
                    <option value="">Select Patient</option>
                    {patients.map(p => <option key={p.patientId} value={p.patientId}>{p.fullName}</option>)}
                  </select>
                  <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 uppercase tracking-wide mb-1.5">Doctor</label>
                <div className="relative">
                  <select value={manageDoctorId} onChange={(e) => setManageDoctorId(e.target.value)} className={selectClass}>
                    <option value="">Select Doctor</option>
                    {doctors.map(d => <option key={d.doctorId} value={d.doctorId}>{d.doctorName} — {d.specialization}</option>)}
                  </select>
                  <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 uppercase tracking-wide mb-1.5">Available Date</label>
                <div className="relative">
                  <select value={appointmentDate} onChange={(e) => { setAppointmentDate(e.target.value); setAppointmentTime(""); }} className={selectClass}>
                    <option value="">Select Date</option>
                    {manageSchedules
                      .filter((s) => { const today = new Date(); today.setHours(0,0,0,0); return new Date(s.availableDate) >= today; })
                      .map(s => <option key={s.scheduleId} value={s.availableDate}>{s.availableDate}</option>)}
                  </select>
                  <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>

              {appointmentDate && (
                <div>
                  <label className="block text-xs font-medium text-slate-400 uppercase tracking-wide mb-1.5">Time Slot</label>
                  <div className="relative">
                    <select value={appointmentTime} onChange={(e) => setAppointmentTime(e.target.value)} className={selectClass}>
                      <option value="">Select Time</option>
                      {manageSchedules.filter(s => s.availableDate === appointmentDate)
                        .map(s => <option key={s.scheduleId} value={s.startTime}>{s.startTime} — {s.endTime}</option>)}
                    </select>
                    <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-5">
              <button
                onClick={saveAppointment}
                className={`text-white text-sm font-semibold px-6 py-2.5 rounded-lg transition-colors
                  focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900
                  ${isEditing
                    ? "bg-amber-500 hover:bg-amber-400 focus:ring-amber-500"
                    : "bg-teal-600 hover:bg-teal-500 focus:ring-teal-500"
                  }`}
              >
                {isEditing ? "Update Appointment" : "Create Appointment"}
              </button>
            </div>
          </div>

          {/* ── All Appointments table ── */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden mb-8">
            <div className="px-6 py-4 border-b border-slate-800">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-sm font-semibold text-teal-400 uppercase tracking-widest">All Appointments</h2>
                  <p className="text-xs text-slate-500 mt-0.5">{filteredAppointments.length} appointment{filteredAppointments.length !== 1 ? "s" : ""} found</p>
                </div>
              </div>

              {/* Filters */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="relative">
                  <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    type="text"
                    placeholder="Search patient or doctor…"
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 text-white placeholder-slate-500 rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500/50 transition-colors"
                  />
                </div>

                <div className="relative">
                  <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full appearance-none bg-slate-800 border border-slate-700 text-white rounded-lg px-4 py-2 text-sm pr-9 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500/50 transition-colors">
                    <option value="">All Statuses</option>
                    <option value="Booked">Booked</option>
                    <option value="Confirmed">Confirmed</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                  <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>

                <input
                  type="date"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500/50 transition-colors"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              {filteredAppointments.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center mb-3">
                    <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <p className="text-sm text-slate-400 font-medium">No appointments found</p>
                  <p className="text-xs text-slate-600 mt-1">Try adjusting your filters.</p>
                </div>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-800">
                      {["ID", "Patient", "Doctor", "Date", "Time", "Status", "Actions"].map(h => (
                        <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAppointments.map(app => {
                      const doctor = doctors.find(d => d.doctorId === app.doctorId);
                      const isRowEditing = editingId === app.appointmentId;
                      return (
                        <tr key={app.appointmentId}
                          className={`border-t border-slate-800/60 transition-colors
                            ${isRowEditing ? "bg-amber-500/5 border-l-2 border-l-amber-500/50" : "hover:bg-slate-800/40"}`}>
                          <td className="px-5 py-3.5 text-slate-500 font-mono text-xs">{app.appointmentId}</td>
                          <td className="px-5 py-3.5 text-white font-medium whitespace-nowrap">
                            {patients.find(p => p.patientId === app.patientId)?.fullName || "—"}
                          </td>
                          <td className="px-5 py-3.5 text-slate-300 whitespace-nowrap">
                            {doctor ? `${doctor.doctorName} — ${doctor.specialization}` : "—"}
                          </td>
                          <td className="px-5 py-3.5 text-slate-300 whitespace-nowrap">{app.appointmentDate}</td>
                          <td className="px-5 py-3.5 text-slate-300 whitespace-nowrap">{app.appointmentTime}</td>
                          <td className="px-5 py-3.5 whitespace-nowrap"><StatusBadge status={app.status} /></td>
                          <td className="px-5 py-3.5 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <button onClick={() => editAppointment(app)}
                                className={`text-xs font-medium px-3 py-1.5 rounded-lg border transition-colors
                                  ${isRowEditing
                                    ? "bg-amber-500/20 border-amber-500/30 text-amber-400 cursor-default"
                                    : "bg-amber-500/10 border-amber-500/20 text-amber-400 hover:bg-amber-500/20"}`}>
                                {isRowEditing ? "Editing…" : "Edit"}
                              </button>
                              <button onClick={() => deleteAppointment(app.appointmentId)}
                                className="text-xs font-medium px-3 py-1.5 rounded-lg border bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500/20 transition-colors">
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* ── Today's appointments by doctor ── */}
          <div className="mb-6">
            <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">
              Filter by Doctor — Today's View
            </label>
            <div className="relative w-80">
              <select value={doctorId} onChange={(e) => setDoctorId(e.target.value)}
                className="w-full appearance-none bg-slate-900 border border-slate-700 text-white text-sm px-4 py-2.5 rounded-xl pr-10
                  focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500/50 transition-colors">
                <option value="">Select a doctor…</option>
                {doctors.map(d => <option key={d.doctorId} value={d.doctorId}>{d.doctorName} — {d.specialization}</option>)}
              </select>
              <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-white">
                  {selectedDoctor ? `${selectedDoctor.doctorName} · ${selectedDoctor.specialization}` : "Today's Appointments"}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  {doctorId ? `${appointments.length} appointment${appointments.length !== 1 ? "s" : ""} today` : "No doctor selected"}
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
              {doctorId && loading && (
                <div className="flex items-center justify-center py-16 gap-2 text-slate-500 text-sm">
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Loading appointments…
                </div>
              )}
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
              {doctorId && !loading && appointments.length > 0 && (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-800">
                      {todayCols.map(col => (
                        <th key={col} className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">{col}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {appointments.map(a => (
                      <tr key={a.appointmentId} className="border-t border-slate-800/60 hover:bg-slate-800/40 transition-colors">
                        <td className="px-5 py-3.5 text-slate-500 font-mono text-xs">{a.appointmentId}</td>
                        <td className="px-5 py-3.5 text-white font-medium whitespace-nowrap">{a.patientName}</td>
                        <td className="px-5 py-3.5 text-slate-300 whitespace-nowrap">{a.doctorName}</td>
                        <td className="px-5 py-3.5 text-slate-300 whitespace-nowrap">{a.specialization}</td>
                        <td className="px-5 py-3.5 text-slate-300 whitespace-nowrap">{a.roomNumber}</td>
                        <td className="px-5 py-3.5 text-slate-300 whitespace-nowrap">{a.appointmentTime}</td>
                        <td className="px-5 py-3.5 whitespace-nowrap"><StatusBadge status={a.status} /></td>
                        <td className="px-5 py-3.5 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <button onClick={() => update(a.appointmentId, "Confirmed")}
                              className="text-xs font-medium px-3 py-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 hover:bg-indigo-500/20 transition-colors">
                              Confirm
                            </button>
                            <button onClick={() => update(a.appointmentId, "Completed")}
                              className="text-xs font-medium px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 transition-colors">
                              Complete
                            </button>
                            <button onClick={() => update(a.appointmentId, "Cancelled")}
                              className="text-xs font-medium px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-colors">
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

      <Toast message={toast.message} type={toast.type} onClose={clearToast} />
    </div>
  );
}

export default StaffAppointments;