import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

const statusStyles = {
  Booked: "bg-indigo-50 text-indigo-700 border border-indigo-200",
  Confirmed: "bg-teal-50 text-teal-700 border border-teal-200",
  Completed: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  Cancelled: "bg-red-50 text-red-600 border border-red-200",
};

function StatusBadge({ status }) {
  const normalizedStatus = String(status ?? "Unknown")
    .trim()
    .toLowerCase();

  const displayStatus =
    normalizedStatus.charAt(0).toUpperCase() +
    normalizedStatus.slice(1);

  const style =
    statusStyles[displayStatus] ??
    "bg-slate-100 text-slate-600 border border-slate-200";

  return (
    <span
      className={`
        inline-flex
        items-center
        px-2.5
        py-0.5
        rounded-full
        text-xs
        font-medium
        whitespace-nowrap
        ${style}
      `}
    >
      {displayStatus}
    </span>
  );
}

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

  const [editingId, setEditingId] = useState(null);
  const [selectedSpecialization, setSelectedSpecialization] = useState("");

  function showMessage(text, type) {
    setMsg(text);
    setMsgType(type);

    setTimeout(() => {
      setMsg("");
    }, 3000);
  }

  async function loadDoctors() {
    try {
      const res = await api.get("/doctors");
      setDoctors(res.data);
    } catch (error) {
      console.error("LOAD DOCTORS ERROR:", error);
      showMessage("Failed to load doctors", "error");
    }
  }

  async function loadPatient() {
    try {
      const res = await api.get(`/patient/profile/${email}`);

      setPatient(res.data);

      if (res.data.patientId) {
        await loadAppointments(res.data.patientId);
      }
    } catch (error) {
      console.error("LOAD PATIENT ERROR:", error);
      showMessage("Failed to load patient", "error");
    }
  }

  async function loadAppointments(id) {
    try {
      const res = await api.get(`/appointment/patient/view/${id}`);

      setAppointments(res.data);
    } catch (error) {
      console.error("LOAD APPOINTMENTS ERROR:", error);
      showMessage("Failed to load appointments", "error");
    }
  }

  async function loadSchedules(id) {
    try {
      const res = await api.get(`/schedule/${id}`);
      setSchedules(res.data);
    } catch (error) {
      console.error("LOAD SCHEDULE ERROR:", error);

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

  useEffect(() => {
    if (!patient.patientId) {
      return;
    }

    const refreshAppointments = () => {
      loadAppointments(patient.patientId);
    };

    const interval = setInterval(
      refreshAppointments,
      10000
    );

    return () => {
      clearInterval(interval);
    };
  }, [patient.patientId]);

  function formatDate(value) {
    if (!value) {
      return "";
    }

    return String(value).split("T")[0];
  }

  function formatTime(value) {
    if (!value) {
      return "";
    }

    return String(value).substring(0, 5);
  }

  function formatTimeForBackend(value) {
    if (!value) {
      return "";
    }

    const time = String(value).trim();

    // Already HH:mm:ss
    if (/^\d{2}:\d{2}:\d{2}$/.test(time)) {
      return time;
    }

    // Convert HH:mm to HH:mm:ss
    if (/^\d{2}:\d{2}$/.test(time)) {
      return `${time}:00`;
    }

    return time;
  }

  // Adds the estimated wait (in minutes) to the appointment's
  // scheduled slot time, and returns a 12-hour clock string,
  // e.g. slot 09:00 + 120 min -> "11:00 AM"
  function formatEstimatedWaitAsTime(appointmentTimeValue, minutes) {
    if (minutes == null || isNaN(minutes) || !appointmentTimeValue) {
      return "-";
    }

    const timeStr = String(appointmentTimeValue).substring(0, 8);

    const parts = timeStr.split(":");

    if (parts.length < 2) {
      return "-";
    }

    const slotHours = Number(parts[0]);
    const slotMinutes = Number(parts[1]);
    const slotSeconds = parts[2] ? Number(parts[2]) : 0;

    if (isNaN(slotHours) || isNaN(slotMinutes)) {
      return "-";
    }

    const base = new Date();
    base.setHours(slotHours, slotMinutes, slotSeconds, 0);

    const target = new Date(
      base.getTime() + Number(minutes) * 60000
    );

    let hours = target.getHours();
    const mins = String(target.getMinutes()).padStart(2, "0");

    const ampm = hours >= 12 ? "PM" : "AM";

    hours = hours % 12;
    hours = hours === 0 ? 12 : hours;

    return `${hours}:${mins} ${ampm}`;
  }

  function getToday() {
    const now = new Date();

    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  }

  const today = getToday();

  const futureSchedules = schedules
    .filter((schedule) => {
      const scheduleDate = formatDate(
        schedule.availableDate
      );

      return scheduleDate && scheduleDate >= today;
    })
    .sort((a, b) => {
      return formatDate(a.availableDate).localeCompare(
        formatDate(b.availableDate)
      );
    });

  const availableSchedule = futureSchedules.find(
    (schedule) =>
      formatDate(schedule.availableDate) ===
      appointmentDate
  );

  const specializations = [
    ...new Set(
      doctors
        .map((d) => d.specialization)
        .filter(Boolean)
    ),
  ];

  const filteredDoctors = selectedSpecialization
    ? doctors.filter(
        (d) =>
          d.specialization ===
          selectedSpecialization
      )
    : [];

  async function bookAppointment() {
    if (!patient.patientId) {
      showMessage(
        "Patient information is not available.",
        "error"
      );
      return;
    }

    if (
      !doctorId ||
      !appointmentDate ||
      !appointmentTime
    ) {
      showMessage(
        "Please select doctor, date and time.",
        "error"
      );
      return;
    }

    const currentToday = getToday();

    if (appointmentDate < currentToday) {
      showMessage(
        "Cannot book an appointment on an old date.",
        "error"
      );
      return;
    }

    const selectedSchedule = futureSchedules.find(
      (schedule) =>
        formatDate(schedule.availableDate) ===
        appointmentDate
    );

    if (!selectedSchedule) {
      showMessage(
        "The selected doctor does not have a schedule on this date.",
        "error"
      );
      return;
    }

    const selectedTime = formatTime(
      appointmentTime
    );

    const startTime = formatTime(
      selectedSchedule.startTime
    );

    const endTime = formatTime(
      selectedSchedule.endTime
    );

    if (
      selectedTime < startTime ||
      selectedTime > endTime
    ) {
      showMessage(
        `Please select a time between ${startTime} and ${endTime}.`,
        "error"
      );
      return;
    }

    /*
     * Prevent duplicate active appointment
     * for the same doctor and date.
     */
    const duplicateAppointment =
      appointments.some((appointment) => {
        const status = String(
          appointment.status ?? ""
        )
          .trim()
          .toLowerCase();

        const sameDoctor =
          Number(appointment.doctorId) ===
          Number(doctorId);

        const sameDate =
          formatDate(
            appointment.appointmentDate
          ) === appointmentDate;

        const activeStatus =
          status !== "cancelled" &&
          status !== "completed";

        return (
          sameDoctor &&
          sameDate &&
          activeStatus
        );
      });

    if (duplicateAppointment) {
      showMessage(
        "You already have an appointment with this doctor on this date.",
        "error"
      );
      return;
    }

    try {
      await api.post("/appointment", {
        patientId: Number(patient.patientId),
        doctorId: Number(doctorId),
        appointmentDate,
        appointmentTime:
          formatTimeForBackend(
            appointmentTime
          ),
        status: "Booked",
      });

      showMessage(
        "Appointment booked successfully.",
        "success"
      );

      setDoctorId("");
      setAppointmentDate("");
      setAppointmentTime("");
      setSchedules([]);
      setSelectedSpecialization("");

      await loadAppointments(
        patient.patientId
      );
    } catch (error) {
      console.error(
        "BOOK APPOINTMENT ERROR:",
        error
      );

      console.error(
        "SERVER RESPONSE:",
        error.response?.data
      );

      const backendMessage =
        error?.response?.data?.message ||
        (typeof error?.response?.data === "string"
          ? error.response.data
          : null);

      showMessage(
        backendMessage || "Booking failed.",
        "error"
      );
    }
  }

  async function cancelAppointment(id) {
    const confirmed = window.confirm(
      "Are you sure you want to cancel this appointment?"
    );

    if (!confirmed) {
      return;
    }

    try {
      await api.delete(`/appointment/${id}`);

      await loadAppointments(
        patient.patientId
      );

      showMessage(
        "Appointment cancelled successfully.",
        "success"
      );
    } catch (error) {
      console.error(
        "CANCEL APPOINTMENT ERROR:",
        error
      );

      console.error(
        "SERVER RESPONSE:",
        error.response?.data
      );

      const backendMessage =
        error?.response?.data?.message ||
        (typeof error?.response?.data === "string"
          ? error.response.data
          : null);

      showMessage(
        backendMessage ||
          "Unable to cancel appointment.",
        "error"
      );
    }
  }

  function editAppointment(app) {
    const status = String(
      app.status || ""
    )
      .trim()
      .toLowerCase();

    if (status !== "booked") {
      showMessage(
        "Only booked appointments can be updated. Confirmed appointments are locked.",
        "error"
      );

      return;
    }

    setEditingId(app.appointmentId);

    setDoctorId(
      String(app.doctorId)
    );

    setAppointmentDate(
      formatDate(app.appointmentDate)
    );

    setAppointmentTime(
      formatTime(app.appointmentTime)
    );

    const doc = doctors.find(
      (d) =>
        Number(d.doctorId) ===
        Number(app.doctorId)
    );

    if (doc) {
      setSelectedSpecialization(
        doc.specialization
      );
    }

    loadSchedules(app.doctorId);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
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
    if (!editingId) {
      showMessage(
        "No appointment selected for editing.",
        "error"
      );
      return;
    }

    if (
      !doctorId ||
      !appointmentDate ||
      !appointmentTime
    ) {
      showMessage(
        "Please fill all fields.",
        "error"
      );
      return;
    }

    const currentToday = getToday();

    if (appointmentDate < currentToday) {
      showMessage(
        "Cannot select an old schedule.",
        "error"
      );
      return;
    }

    const selectedSchedule = futureSchedules.find(
      (schedule) =>
        formatDate(schedule.availableDate) ===
        appointmentDate
    );

    if (!selectedSchedule) {
      showMessage(
        "The selected doctor does not have a schedule on this date.",
        "error"
      );
      return;
    }

    const selectedTime =
      formatTime(appointmentTime);

    const startTime =
      formatTime(
        selectedSchedule.startTime
      );

    const endTime =
      formatTime(
        selectedSchedule.endTime
      );

    if (
      selectedTime < startTime ||
      selectedTime > endTime
    ) {
      showMessage(
        `Please select a time between ${startTime} and ${endTime}.`,
        "error"
      );
      return;
    }

    /*
     * Prevent updating to another appointment
     * on the same doctor/date.
     */
    const duplicateAppointment =
      appointments.some((appointment) => {
        if (
          Number(
            appointment.appointmentId
          ) === Number(editingId)
        ) {
          return false;
        }

        const status = String(
          appointment.status ?? ""
        )
          .trim()
          .toLowerCase();

        return (
          Number(appointment.doctorId) ===
            Number(doctorId) &&
          formatDate(
            appointment.appointmentDate
          ) === appointmentDate &&
          status !== "cancelled" &&
          status !== "completed"
        );
      });

    if (duplicateAppointment) {
      showMessage(
        "You already have another appointment with this doctor on this date.",
        "error"
      );
      return;
    }

    try {
      await api.put(
        `/appointment/${editingId}`,
        {
          appointmentId: editingId,
          patientId: Number(
            patient.patientId
          ),
          doctorId: Number(doctorId),
          appointmentDate,
          appointmentTime:
            formatTimeForBackend(
              selectedTime
            ),
        }
      );

      showMessage(
        "Appointment updated successfully.",
        "success"
      );

      cancelEditMode();

      await loadAppointments(
        patient.patientId
      );
    } catch (error) {
      console.error(
        "UPDATE APPOINTMENT ERROR:",
        error
      );

      console.error(
        "SERVER RESPONSE:",
        error.response?.data
      );

      const backendMessage =
        error?.response?.data?.message ||
        (typeof error?.response?.data === "string"
          ? error.response.data
          : null);

      showMessage(
        backendMessage ||
          "Unable to update appointment.",
        "error"
      );
    }
  }

  const isEditing = !!editingId;

  const selectClass =
    "w-full bg-white border border-slate-200 text-slate-800 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-colors duration-200 shadow-sm disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed";

  const editSelectClass =
    "w-full bg-white border border-amber-200 text-slate-800 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-colors duration-200 shadow-sm disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed";

  return (
    <div className="min-h-screen bg-slate-300 px-4 py-12">
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
                <svg
                  className="w-4 h-4 text-indigo-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>

              <span className="text-xs font-medium text-indigo-500 tracking-widest uppercase">
                Patient Portal
              </span>
            </div>

            <h1 className="text-2xl font-semibold text-slate-800">
              Appointments
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Book and manage your appointments.
            </p>
          </div>

          <button
            onClick={() =>
              navigate("/patient-dashboard")
            }
            className="flex items-center gap-2 bg-white hover:bg-slate-100 text-slate-600 hover:text-slate-800 border border-slate-200 px-4 py-2 rounded-xl text-sm font-medium transition-colors shadow-sm"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 19l-7-7 7-7"
              />
            </svg>

            Dashboard
          </button>
        </div>

        {/* Message banner */}
        {msg && (
          <div
            className={`
              mb-6 px-4 py-3 rounded-lg text-sm
              font-medium flex items-center gap-2
              transition-all duration-300
              ${
                msgType === "success"
                  ? "bg-teal-50 border border-teal-200 text-teal-700"
                  : "bg-red-50 border border-red-200 text-red-600"
              }
            `}
          >
            {msgType === "success" ? (
              <svg
                className="w-4 h-4 shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            ) : (
              <svg
                className="w-4 h-4 shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            )}

            {msg}
          </div>
        )}

        {/* Book / Edit Card */}
        <div
          className={`
            rounded-2xl p-8 shadow-xl mb-6 border
            transition-colors duration-300
            ${
              isEditing
                ? "bg-amber-50 border-amber-200"
                : "bg-white border-slate-200"
            }
          `}
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <div
                className={`
                  w-7 h-7 rounded-lg border
                  flex items-center justify-center
                  ${
                    isEditing
                      ? "bg-amber-100 border-amber-300"
                      : "bg-indigo-50 border-indigo-200"
                  }
                `}
              >
                <svg
                  className={`
                    w-3.5 h-3.5
                    ${
                      isEditing
                        ? "text-amber-600"
                        : "text-indigo-500"
                    }
                  `}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  {isEditing ? (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  ) : (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 4v16m8-8H4"
                    />
                  )}
                </svg>
              </div>

              <h2
                className={`
                  text-sm font-semibold tracking-wide uppercase
                  ${
                    isEditing
                      ? "text-amber-700"
                      : "text-slate-700"
                  }
                `}
              >
                {isEditing
                  ? "Update Appointment"
                  : "Book Appointment"}
              </h2>
            </div>

            {isEditing && (
              <button
                onClick={cancelEditMode}
                className="flex items-center gap-1.5 bg-white hover:bg-slate-100 text-slate-500 border border-slate-200 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
              >
                <svg
                  className="w-3.5 h-3.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>

                Discard
              </button>
            )}
          </div>

          <div className="grid gap-4">

            {/* Specialization */}
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5 tracking-wide">
                Specialization
              </label>

              <select
                value={selectedSpecialization}
                onChange={(e) => {
                  setSelectedSpecialization(
                    e.target.value
                  );

                  setDoctorId("");
                  setAppointmentDate("");
                  setAppointmentTime("");
                  setSchedules([]);
                }}
                className={
                  isEditing
                    ? editSelectClass
                    : selectClass
                }
              >
                <option value="">
                  Select Specialization
                </option>

                {specializations.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            {/* Doctor */}
            <div>
              <label
                className={`
                  block text-xs font-medium mb-1.5 tracking-wide
                  ${
                    selectedSpecialization
                      ? "text-slate-600"
                      : "text-slate-400"
                  }
                `}
              >
                Doctor
              </label>

              <select
                value={doctorId}
                disabled={!selectedSpecialization}
                onChange={(e) =>
                  setDoctorId(e.target.value)
                }
                className={
                  isEditing
                    ? editSelectClass
                    : selectClass
                }
              >
                <option value="">
                  Select Doctor
                </option>

                {filteredDoctors.map((d) => (
                  <option
                    key={d.doctorId}
                    value={d.doctorId}
                  >
                    {d.doctorName}
                  </option>
                ))}
              </select>
            </div>

            {/* Available Date */}
            <div>
              <label
                className={`
                  block text-xs font-medium mb-1.5 tracking-wide
                  ${
                    doctorId
                      ? "text-slate-600"
                      : "text-slate-400"
                  }
                `}
              >
                Available Date
              </label>

              <select
                value={appointmentDate}
                disabled={!doctorId}
                onChange={(e) => {
                  setAppointmentDate(
                    e.target.value
                  );
                  setAppointmentTime("");
                }}
                className={
                  isEditing
                    ? editSelectClass
                    : selectClass
                }
              >
                <option value="">
                  Select Available Date
                </option>

                {futureSchedules.map((s) => {
                  const date = formatDate(
                    s.availableDate
                  );

                  return (
                    <option
                      key={s.scheduleId}
                      value={date}
                    >
                      {date}
                    </option>
                  );
                })}
              </select>
            </div>

            {/* Time Slot */}
            {availableSchedule && (
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5 tracking-wide">
                  Time Slot
                </label>

                <select
                  value={appointmentTime}
                  onChange={(e) =>
                    setAppointmentTime(
                      e.target.value
                    )
                  }
                  className={
                    isEditing
                      ? editSelectClass
                      : selectClass
                  }
                >
                  <option value="">
                    Select Time
                  </option>

                  <option
                    value={formatTime(
                      availableSchedule.startTime
                    )}
                  >
                    {formatTime(
                      availableSchedule.startTime
                    )}
                    {" – "}
                    {formatTime(
                      availableSchedule.endTime
                    )}
                  </option>
                </select>
              </div>
            )}

            {/* Submit */}
            <div
              className={`
                border-t pt-4
                ${
                  isEditing
                    ? "border-amber-200"
                    : "border-slate-100"
                }
              `}
            >
              <button
                onClick={
                  isEditing
                    ? updateAppointment
                    : bookAppointment
                }
                className={`
                  font-semibold px-6 py-3 rounded-lg
                  text-sm tracking-wide transition-colors
                  shadow-sm text-white
                  ${
                    isEditing
                      ? "bg-amber-500 hover:bg-amber-600 active:bg-amber-700"
                      : "bg-indigo-500 hover:bg-indigo-600 active:bg-indigo-700"
                  }
                `}
              >
                {isEditing
                  ? "Save Changes"
                  : "Book Appointment"}
              </button>
            </div>
          </div>
        </div>

        {/* Appointments Table */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-xl shadow-slate-200/60 overflow-hidden">

          <div className="flex items-center justify-between px-8 py-5 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-teal-50 border border-teal-200 flex items-center justify-center">
                <svg
                  className="w-3.5 h-3.5 text-teal-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
              </div>

              <h2 className="text-sm font-semibold text-slate-700 tracking-wide uppercase">
                Your Appointments
              </h2>
            </div>

            {/* Status legend */}
            <div className="hidden sm:flex items-center gap-2">
              {Object.entries(statusStyles).map(
                ([status, style]) => (
                  <span
                    key={status}
                    className={`
                      inline-flex items-center
                      px-2 py-0.5 rounded-full
                      text-xs font-medium ${style}
                    `}
                  >
                    {status}
                  </span>
                )
              )}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">

              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  {[
                    "ID",
                    "Doctor",
                    "Specialization",
                    "Room",
                    "Date",
                    "Time",
                    "Status",
                    "Queue Token",
                    "Estimated Wait",
                    "Actions",
                  ].map((h) => (
                    <th
                      key={h}
                      className="px-5 py-3 text-left text-xs font-semibold text-slate-500 tracking-wider uppercase whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">

                {appointments.length === 0 ? (
                  <tr>
                    <td
                      colSpan={10}
                      className="px-6 py-12 text-center"
                    >
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center">
                          <svg
                            className="w-4 h-4 text-slate-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                        </div>

                        <p className="text-sm text-slate-400 font-medium">
                          No appointments yet
                        </p>

                        <p className="text-xs text-slate-300">
                          Book your first appointment above.
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  appointments.map((a) => {
                    const appointmentStatus =
                      String(a.status ?? "")
                        .trim()
                        .toLowerCase();

                    const canUpdate =
                      appointmentStatus === "booked";

                    const doc = doctors.find(
                      (d) =>
                        Number(d.doctorId) ===
                        Number(a.doctorId)
                    );

                    const isRowEditing =
                      editingId ===
                      a.appointmentId;

                    const canCancel =
                      appointmentStatus === "booked" ||
                      appointmentStatus === "confirmed";

                    return (
                      <tr
                        key={a.appointmentId}
                        className={`
                          transition-colors
                          duration-150
                          ${
                            isRowEditing
                              ? "bg-amber-50 border-l-2 border-l-amber-400"
                              : "hover:bg-slate-50"
                          }
                        `}
                      >
                        {/* ID */}
                        <td className="px-5 py-4 text-slate-400 font-mono text-xs">
                          {a.appointmentId}
                        </td>

                        {/* Doctor */}
                        <td className="px-5 py-4 text-slate-800 font-medium whitespace-nowrap">
                          {a.doctorName ||
                            doc?.doctorName ||
                            "—"}
                        </td>

                        {/* Specialization */}
                        <td className="px-5 py-4 text-slate-600 whitespace-nowrap">
                          {a.specialization ||
                            doc?.specialization ||
                            "—"}
                        </td>

                        {/* Room */}
                        <td className="px-5 py-4 text-slate-600 whitespace-nowrap">
                          {a.roomNumber
                            ? `Room ${a.roomNumber}`
                            : "—"}
                        </td>

                        {/* Date */}
                        <td className="px-5 py-4 text-slate-600 whitespace-nowrap">
                          {formatDate(
                            a.appointmentDate
                          ) || "—"}
                        </td>

                        {/* Time */}
                        <td className="px-5 py-4 text-slate-600 whitespace-nowrap">
                          {formatTime(
                            a.appointmentTime
                          ) || "—"}
                        </td>

                        {/* Status */}
                        <td className="px-5 py-4 whitespace-nowrap">
                          <StatusBadge
                            status={
                              a.status ||
                              "Unknown"
                            }
                          />
                        </td>

                        {/* Queue Token */}
                        <td className="px-5 py-4 whitespace-nowrap">
                          {a.queueToken || "-"}
                        </td>

                        {/* Estimated Wait */}
                        <td className="px-5 py-4 whitespace-nowrap">
                          {formatEstimatedWaitAsTime(
                            a.appointmentTime,
                            a.estimatedWaitTime
                          )}
                        </td>

                        {/* Actions */}
                        <td className="px-5 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">

                            {/* Update */}
                            <button
                              onClick={() =>
                                editAppointment(a)
                              }
                              disabled={
                                !canUpdate ||
                                isRowEditing
                              }
                              className={`
                                px-3 py-1.5
                                rounded-lg
                                text-xs
                                font-medium
                                border
                                transition-colors
                                whitespace-nowrap
                                ${
                                  !canUpdate
                                    ? "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed"
                                    : isRowEditing
                                    ? "bg-amber-100 text-amber-700 border-amber-300"
                                    : "bg-amber-50 hover:bg-amber-100 text-amber-600 border-amber-200"
                                }
                              `}
                            >
                              {!canUpdate
                                ? "Locked"
                                : isRowEditing
                                ? "Editing..."
                                : "Update"}
                            </button>

                            {/* Cancel */}
                            <button
                              onClick={() =>
                                cancelAppointment(
                                  a.appointmentId
                                )
                              }
                              disabled={!canCancel}
                              className="
                                bg-red-50
                                hover:bg-red-100
                                text-red-500
                                border
                                border-red-200
                                px-3
                                py-1.5
                                rounded-lg
                                text-xs
                                font-medium
                                transition-colors
                                whitespace-nowrap
                                disabled:bg-slate-100
                                disabled:text-slate-400
                                disabled:border-slate-200
                                disabled:cursor-not-allowed
                              "
                            >
                              {appointmentStatus ===
                              "completed"
                                ? "Completed"
                                : appointmentStatus ===
                                  "cancelled"
                                ? "Cancelled"
                                : appointmentStatus ===
                                    "confirmed" ||
                                  appointmentStatus ===
                                    "booked"
                                ? "Cancel"
                                : "Locked"}
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
