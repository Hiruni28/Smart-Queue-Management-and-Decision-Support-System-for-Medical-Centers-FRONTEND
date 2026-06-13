import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function PatientAppointments() {
  const navigate = useNavigate();
  const email = localStorage.getItem("patient");

  const [patient, setPatient] = useState({});
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [doctorId, setDoctorId] = useState("");
  const [appointmentDate, setAppointmentDate] = useState("");
  const [appointmentTime, setAppointmentTime] = useState("");
  const [msg, setMsg] = useState("");
  const [msgType, setMsgType] = useState("");

  function showMessage(text, type) {
    setMsg(text);
    setMsgType(type);
    setTimeout(() => setMsg(""), 3000);
  }

  async function loadPatient() {
    try {
      const response = await api.get(`/patient/profile/${email}`);
      setPatient(response.data);
      loadAppointments(response.data.patientId);
    } catch {
      showMessage("Failed to load patient", "error");
    }
  }

  async function loadDoctors() {
    try {
      const response = await api.get("/doctors");
      setDoctors(response.data);
    } catch {
      showMessage("Failed to load doctors", "error");
    }
  }

  async function loadAppointments(id) {
    try {
      const response = await api.get(`/appointment/${id}`);
      setAppointments(response.data);
    } catch {
      showMessage("Failed to load appointments", "error");
    }
  }

  useEffect(() => {
    loadPatient();
    loadDoctors();
  }, []);

  async function bookAppointment() {
    if (!doctorId || !appointmentDate || !appointmentTime) {
      showMessage("Fill all fields", "error");
      return;
    }
    try {
      await api.post("/appointment", {
        patientId: Number(patient.patientId),
        doctorId: Number(doctorId),
        appointmentDate,
        appointmentTime: `${appointmentTime}:00`,
        status: "Booked",
      });
      setDoctorId("");
      setAppointmentDate("");
      setAppointmentTime("");
      loadAppointments(patient.patientId);
      showMessage("✓ Appointment Booked", "success");
    } catch {
      showMessage("Booking Failed!", "error");
    }
  }

  async function cancelAppointment(id) {
    try {
      await api.delete(`/appointment/${id}`);
      loadAppointments(patient.patientId);
      showMessage("✓ Appointment Cancelled", "success");
    } catch {
      showMessage("Cancel Failed!", "error");
    }
  }

  const selectedDoctor = doctors.find((d) => String(d.doctorId) === doctorId);

  const inputClass =
    "w-full bg-white border border-slate-200 text-slate-800 placeholder-slate-400 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-colors duration-200 shadow-sm";

  return (
    <div className="min-h-screen bg-slate-400 px-4 py-12">
      {/* Background accents */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-teal-400/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-teal-400/10 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-4xl mx-auto">

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

          {/* Back to Dashboard */}
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

        {/* Book Appointment Card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-xl shadow-slate-200/60 mb-6">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-7 h-7 rounded-lg bg-indigo-50 border border-indigo-200 flex items-center justify-center">
              <svg className="w-3.5 h-3.5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <h2 className="text-sm font-semibold text-slate-700 tracking-wide uppercase">Book Appointment</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Doctor select */}
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5 tracking-wide">Doctor</label>
              <select
                value={doctorId}
                onChange={(e) => setDoctorId(e.target.value)}
                className={inputClass}
              >
                <option value="">Select Doctor</option>
                {doctors.map((d) => (
                  <option key={d.doctorId} value={d.doctorId}>
                    {d.doctorName} — {d.specialization}
                  </option>
                ))}
              </select>
            </div>

            {/* Date */}
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5 tracking-wide">Date</label>
              <input
                type="date"
                value={appointmentDate}
                onChange={(e) => setAppointmentDate(e.target.value)}
                className={`${inputClass} [color-scheme:light]`}
              />
            </div>

            {/* Time */}
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5 tracking-wide">Time</label>
              <input
                type="time"
                value={appointmentTime}
                onChange={(e) => setAppointmentTime(e.target.value)}
                className={`${inputClass} [color-scheme:light]`}
              />
            </div>
          </div>

          {/* Selected doctor info */}
          {selectedDoctor && (
            <div className="mt-5 bg-indigo-50 border border-indigo-100 rounded-xl p-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: "Doctor", value: selectedDoctor.doctorName },
                { label: "Specialization", value: selectedDoctor.specialization },
                { label: "Availability", value: selectedDoctor.availability },
                { label: "Room", value: selectedDoctor.roomNumber },
              ].map(({ label, value }) => (
                <div key={label}>
                  <p className="text-xs text-indigo-400 font-medium mb-0.5">{label}</p>
                  <p className="text-sm text-indigo-700 font-semibold">{value}</p>
                </div>
              ))}
            </div>
          )}

          <div className="border-t border-slate-100 mt-6 pt-5">
            <button
              onClick={bookAppointment}
              className="bg-indigo-500 hover:bg-indigo-600 active:bg-indigo-700 text-white font-semibold px-6 py-3 rounded-lg text-sm tracking-wide transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 focus:ring-offset-white shadow-sm"
            >
              Book Appointment
            </button>
          </div>
        </div>

        {/* Appointments Table Card */}
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
                  {["ID", "Doctor", "Date", "Time", "Status", "Action"].map((h) => (
                    <th key={h} className="px-6 py-3 text-left text-xs font-semibold text-slate-500 tracking-wider uppercase">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {appointments.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-10 text-center text-sm text-slate-400">
                      No appointments yet.
                    </td>
                  </tr>
                ) : (
                  appointments.map((a) => (
                    <tr key={a.appointmentId} className="hover:bg-slate-50 transition-colors duration-150">
                      <td className="px-6 py-4 text-slate-500 font-mono text-xs">{a.appointmentId}</td>
                      <td className="px-6 py-4 text-slate-700 font-medium">{a.doctorId}</td>
                      <td className="px-6 py-4 text-slate-600">{a.appointmentDate}</td>
                      <td className="px-6 py-4 text-slate-600">{a.appointmentTime}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          a.status === "Booked"
                            ? "bg-teal-50 text-teal-700 border border-teal-200"
                            : "bg-slate-100 text-slate-600 border border-slate-200"
                        }`}>
                          {a.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => cancelAppointment(a.appointmentId)}
                          className="bg-red-50 hover:bg-red-100 active:bg-red-200 text-red-500 border border-red-200 hover:border-red-300 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors duration-200"
                        >
                          Cancel
                        </button>
                      </td>
                    </tr>
                  ))
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
