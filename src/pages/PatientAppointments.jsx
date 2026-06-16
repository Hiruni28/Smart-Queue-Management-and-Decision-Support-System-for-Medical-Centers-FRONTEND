import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function PatientAppointments() {
  const navigate = useNavigate();
  const email = localStorage.getItem("patient");

  const [patient, setPatient] = useState({});
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [schedules, setSchedules] = useState([]);

  const [doctorId, setDoctorId] = useState("");
  const [appointmentDate, setAppointmentDate] = useState("");
  const [appointmentTime, setAppointmentTime] = useState("");

  const [msg, setMsg] = useState("");
  const [msgType, setMsgType] = useState("");

  const todayDate = new Date().toISOString().split("T")[0];
  const [editingId, setEditingId] = useState(null);
  const [selectedSpecialization, setSelectedSpecialization] = useState("");

  function showMessage(text, type) {
    setMsg(text);
    setMsgType(type);
    setTimeout(() => setMsg(""), 3000);
  }

  async function loadDoctors() {
    try {
      const res = await api.get("/doctors");
      setDoctors(res.data);
    } catch {
      showMessage("Failed to load doctors", "error");
    }
  }

  async function loadPatient() {
    try {
      const res = await api.get(`/patient/profile/${email}`);
      setPatient(res.data);
      if (res.data.patientId) {
        loadAppointments(res.data.patientId);
      }
    } catch {
      showMessage("Failed to load patient", "error");
    }
  }

  async function loadAppointments(id) {
    try {
      const res = await api.get(`/appointment/${id}`);
      setAppointments(res.data);
    } catch {
      showMessage("Failed to load appointments", "error");
    }
  }

  async function loadSchedules(id) {
    try {
      const res = await api.get(`/schedule/${id}`);
      setSchedules(res.data);
    } catch {
      setSchedules([]);
      showMessage("No schedule available", "error");
    }
  }

  useEffect(() => {
    loadDoctors();
    loadPatient();
  }, []);

  useEffect(() => {
    if (doctorId) {
      loadSchedules(doctorId);
      setAppointmentDate("");
      setAppointmentTime("");
    }
  }, [doctorId]);

  const availableSchedule = schedules.find(
    (s) => s.availableDate === appointmentDate
  );

  const specializations = [
    ...new Set(doctors.map((d) => d.specialization)),
  ];

  const filteredDoctors = selectedSpecialization
    ? doctors.filter((d) => d.specialization === selectedSpecialization)
    : [];

  async function bookAppointment() {
    if (!doctorId || !appointmentDate || !appointmentTime) {
      showMessage("Fill all fields", "error");
      return;
    }
    try {
      await api.post("/appointment", {
        patientId: patient.patientId,
        doctorId: Number(doctorId),
        appointmentDate,
        appointmentTime,
        status: "Booked",
      });
      showMessage("✓ Appointment Booked", "success");
      setDoctorId("");
      setAppointmentDate("");
      setAppointmentTime("");
      setSchedules([]);
      setSelectedSpecialization("");
      loadAppointments(patient.patientId);
    } catch {
      showMessage("Booking Failed", "error");
    }
  }

  async function cancelAppointment(id) {
    try {
      await api.delete(`/appointment/${id}`);
      loadAppointments(patient.patientId);
      showMessage("✓ Appointment Cancelled", "success");
    } catch {
      showMessage("Cancel Failed", "error");
    }
  }

  function editAppointment(app) {
    setEditingId(app.appointmentId);
    setDoctorId(String(app.doctorId));
    setAppointmentDate(app.appointmentDate);
    setAppointmentTime(app.appointmentTime);
    const doc = doctors.find((d) => d.doctorId === app.doctorId);
    if (doc) setSelectedSpecialization(doc.specialization);
    loadSchedules(app.doctorId);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function cancelEditMode() {
    setEditingId(null);
    setDoctorId("");
    setAppointmentDate("");
    setAppointmentTime("");
    setSchedules([]);
    setSelectedSpecialization("");
  }

  async function updateAppointment() {
    if (!doctorId || !appointmentDate || !appointmentTime) {
      showMessage("Fill all fields", "error");
      return;
    }
    try {
      await api.put(`/appointment/${editingId}`, {
        appointmentId: editingId,
        patientId: patient.patientId,
        doctorId: Number(doctorId),
        appointmentDate,
        appointmentTime,
        status: "Booked",
      });
      showMessage("✓ Appointment Updated", "success");
      cancelEditMode();
      loadAppointments(patient.patientId);
    } catch {
      showMessage("Update Failed", "error");
    }
  }

  const selectClass =
    "w-full bg-white border border-slate-200 text-slate-800 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-colors duration-200 shadow-sm disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed";

  const editSelectClass =
    "w-full bg-white border border-amber-200 text-slate-800 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-colors duration-200 shadow-sm disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed";

  const isEditing = !!editingId;

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-12">
      {/* Background accents */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-teal-400/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-teal-400/10 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-5xl mx-auto">

        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-200 flex items-center justify-center">
                <svg className="w-4 h-4 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <span className="text-xs font-medium text-indigo-500 tracking-widest uppercase">Patient Portal</span>
            </div>
            <h1 className="text-2xl font-semibold text-slate-800">Appointments</h1>
            <p className="mt-1 text-sm text-slate-500">Book and manage your appointments.</p>
          </div>

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

        {/* Book / Edit Appointment Card */}
        <div className={`rounded-2xl p-8 shadow-xl mb-6 border transition-colors duration-300 ${
          isEditing
            ? "bg-amber-50 border-amber-200 shadow-amber-100/60"
            : "bg-white border-slate-200 shadow-slate-200/60"
        }`}>
          {/* Card header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <div className={`w-7 h-7 rounded-lg border flex items-center justify-center ${
                isEditing
                  ? "bg-amber-100 border-amber-300"
                  : "bg-indigo-50 border-indigo-200"
              }`}>
                <svg className={`w-3.5 h-3.5 ${isEditing ? "text-amber-600" : "text-indigo-500"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  {isEditing ? (
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  )}
                </svg>
              </div>
              <h2 className={`text-sm font-semibold tracking-wide uppercase ${isEditing ? "text-amber-700" : "text-slate-700"}`}>
                {isEditing ? "Update Appointment" : "Book Appointment"}
              </h2>
            </div>

            {/* Discard edit */}
            {isEditing && (
              <button
                onClick={cancelEditMode}
                className="flex items-center gap-1.5 bg-white hover:bg-slate-100 text-slate-500 border border-slate-200 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors duration-200"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
                Discard
              </button>
            )}
          </div>

          <div className="grid gap-4">
            {/* Specialization */}
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5 tracking-wide">Specialization</label>
              <select
                value={selectedSpecialization}
                onChange={(e) => {
                  setSelectedSpecialization(e.target.value);
                  setDoctorId("");
                  setAppointmentDate("");
                  setAppointmentTime("");
                  setSchedules([]);
                }}
                className={isEditing ? editSelectClass : selectClass}
              >
                <option value="">Select Specialization</option>
                {specializations.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            {/* Doctor */}
            <div>
              <label className={`block text-xs font-medium mb-1.5 tracking-wide ${selectedSpecialization ? "text-slate-600" : "text-slate-400"}`}>
                Doctor
              </label>
              <select
                value={doctorId}
                disabled={!selectedSpecialization}
                onChange={(e) => setDoctorId(e.target.value)}
                className={isEditing ? editSelectClass : selectClass}
              >
                <option value="">Select Doctor</option>
                {filteredDoctors.map((d) => (
                  <option key={d.doctorId} value={d.doctorId}>{d.doctorName}</option>
                ))}
              </select>
            </div>

            {/* Available Date */}
            <div>
              <label className={`block text-xs font-medium mb-1.5 tracking-wide ${doctorId ? "text-slate-600" : "text-slate-400"}`}>
                Available Date
              </label>
              <select
                value={appointmentDate}
                onChange={(e) => { setAppointmentDate(e.target.value); setAppointmentTime(""); }}
                className={isEditing ? editSelectClass : selectClass}
                disabled={!doctorId}
              >
                <option value="">Select Available Date</option>
                {schedules.map((s) => (
                  <option key={s.scheduleId} value={s.availableDate}>{s.availableDate}</option>
                ))}
              </select>
            </div>

            {/* Time Slot */}
            {availableSchedule && (
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5 tracking-wide">Time Slot</label>
                <select
                  value={appointmentTime}
                  onChange={(e) => setAppointmentTime(e.target.value)}
                  className={isEditing ? editSelectClass : selectClass}
                >
                  <option value="">Select Time</option>
                  <option value={availableSchedule.startTime}>
                    {availableSchedule.startTime} – {availableSchedule.endTime}
                  </option>
                </select>
              </div>
            )}

            <div className={`border-t pt-4 ${isEditing ? "border-amber-200" : "border-slate-100"}`}>
              <button
                onClick={isEditing ? updateAppointment : bookAppointment}
                className={`font-semibold px-6 py-3 rounded-lg text-sm tracking-wide transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 shadow-sm text-white ${
                  isEditing
                    ? "bg-amber-500 hover:bg-amber-600 active:bg-amber-700 focus:ring-amber-400 focus:ring-offset-amber-50"
                    : "bg-indigo-500 hover:bg-indigo-600 active:bg-indigo-700 focus:ring-indigo-400 focus:ring-offset-white"
                }`}
              >
                {isEditing ? "Save Changes" : "Book Appointment"}
              </button>
            </div>
          </div>
        </div>

        {/* Your Appointments Card */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-xl shadow-slate-200/60 overflow-hidden">
          <div className="flex items-center gap-2 px-8 py-5 border-b border-slate-100">
            <div className="w-7 h-7 rounded-lg bg-teal-50 border border-teal-200 flex items-center justify-center">
              <svg className="w-3.5 h-3.5 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h2 className="text-sm font-semibold text-slate-700 tracking-wide uppercase">Your Appointments</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  {["ID", "Doctor", "Specialization", "Room", "Date", "Time", "Status", "Actions"].map((h) => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-slate-500 tracking-wider uppercase whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {appointments.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-10 text-center text-sm text-slate-400">
                      No appointments yet.
                    </td>
                  </tr>
                ) : (
                  appointments.map((a) => {
                    const doc = doctors.find((d) => d.doctorId === a.doctorId);
                    const isRowEditing = editingId === a.appointmentId;
                    return (
                      <tr
                        key={a.appointmentId}
                        className={`transition-colors duration-150 ${
                          isRowEditing
                            ? "bg-amber-50 border-l-2 border-l-amber-400"
                            : "hover:bg-slate-50"
                        }`}
                      >
                        <td className="px-5 py-4 text-slate-500 font-mono text-xs">{a.appointmentId}</td>
                        <td className="px-5 py-4 text-slate-800 font-medium whitespace-nowrap">
                          {doc?.doctorName || "-"}
                        </td>
                        <td className="px-5 py-4 text-slate-600 whitespace-nowrap">
                          {doc?.specialization || "-"}
                        </td>
                        <td className="px-5 py-4 text-slate-600 whitespace-nowrap">
                          {doc?.roomNumber ? `Room ${doc.roomNumber}` : "-"}
                        </td>
                        <td className="px-5 py-4 text-slate-600 whitespace-nowrap">{a.appointmentDate}</td>
                        <td className="px-5 py-4 text-slate-600 whitespace-nowrap">{a.appointmentTime}</td>
                        <td className="px-5 py-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${
                            a.status === "Booked"
                              ? "bg-teal-50 text-teal-700 border border-teal-200"
                              : "bg-slate-100 text-slate-600 border border-slate-200"
                          }`}>
                            {a.status}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => editAppointment(a)}
                              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors duration-200 whitespace-nowrap ${
                                isRowEditing
                                  ? "bg-amber-100 text-amber-700 border-amber-300 cursor-default"
                                  : "bg-amber-50 hover:bg-amber-100 active:bg-amber-200 text-amber-600 border-amber-200 hover:border-amber-300"
                              }`}
                            >
                              {isRowEditing ? "Editing…" : "Update"}
                            </button>
                            <button
                              onClick={() => cancelAppointment(a.appointmentId)}
                              className="bg-red-50 hover:bg-red-100 active:bg-red-200 text-red-500 border border-red-200 hover:border-red-300 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors duration-200 whitespace-nowrap"
                            >
                              Cancel
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}

export default PatientAppointments;
