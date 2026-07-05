import { useEffect, useState } from "react";
import StaffSidebar from "../components/StaffSidebar";
import StaffTopbar from "../components/StaffTopbar";
import api from "../services/api";

function StaffSchedules() {
  const [doctors, setDoctors] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [doctorId, setDoctorId] = useState("");
  const [availableDate, setAvailableDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [msg, setMsg] = useState("");
  const [msgType, setMsgType] = useState("");

  function showMessage(text, type) {
    setMsg(text);
    setMsgType(type);
    setTimeout(() => setMsg(""), 3000);
  }

  useEffect(() => { loadDoctors(); loadSchedules(); }, []);

  async function loadDoctors() {
    try {
      const res = await api.get("/doctors");
      setDoctors(res.data);
    } catch {
      showMessage("Failed to load doctors", "error");
    }
  }

  async function loadSchedules() {
    try {
      const res = await api.get("/schedule");
      setSchedules(res.data);
    } catch {
      showMessage("Failed to load schedules", "error");
    }
  }

  async function save() {
    if (!doctorId || !availableDate || !startTime || !endTime) {
      showMessage("Fill all fields", "error");
      return;
    }
    try {
      const payload = {
        scheduleId: editingId,
        doctorId: Number(doctorId),
        availableDate,
        startTime: startTime + ":00",
        endTime: endTime + ":00",
      };
      if (editingId) {
        await api.put("/schedule", payload);
        showMessage("Schedule updated successfully", "success");
      } else {
        await api.post("/schedule", payload);
        showMessage("Schedule added successfully", "success");
      }
      clearForm();
      loadSchedules();
    } catch (err) {
      console.log(err);
      showMessage("Failed to save schedule", "error");
    }
  }

  async function remove(id) {
    try {
      await api.delete(`/schedule/${id}`);
      loadSchedules();
      showMessage("Schedule deleted", "success");
    } catch {
      showMessage("Delete failed", "error");
    }
  }

  function edit(s) {
    setEditingId(s.scheduleId);
    setDoctorId(String(s.doctorId));
    setAvailableDate(String(s.availableDate).split("T")[0]);
    setStartTime(String(s.startTime).substring(0, 5));
    setEndTime(String(s.endTime).substring(0, 5));
  }

  function clearForm() {
    setEditingId(null);
    setDoctorId("");
    setAvailableDate("");
    setStartTime("");
    setEndTime("");
  }

  function getDoctorName(id) {
  return doctors.find((d) => d.doctorId === id)?.doctorName || "—";
}

function getDoctorRoom(id) {
  return doctors.find((d) => d.doctorId === id)?.roomNumber || "—";
}

  const inputClass = "w-full bg-slate-800 border border-slate-700 text-white placeholder-slate-500 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 transition-colors";
  const cols = ["ID", "Doctor", "Room", "Date", "Start", "End", "Actions"];

  return (
    <div className="flex min-h-screen bg-slate-950">
      <StaffSidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <StaffTopbar />

        <main className="flex-1 p-8">

          {/* Header */}
          <div className="mb-8">
            <span className="text-xs font-semibold text-teal-400 uppercase tracking-widest">
              Schedules
            </span>
            <h1 className="text-2xl text-white font-bold mt-1">Doctor Schedules</h1>
            <p className="text-slate-500 text-sm mt-1">Manage doctor availability and time slots.</p>
          </div>

          {/* Toast */}
          {msg && (
            <div className={`mb-6 px-4 py-3 rounded-xl text-sm font-medium border flex items-center gap-2
              ${msgType === "success"
                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                : "bg-red-500/10 text-red-400 border-red-500/30"
              }`}>
              {msgType === "success"
                ? <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                  </svg>
                : <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
                  </svg>
              }
              {msg}
            </div>
          )}

          {/* Form card */}
          <div className={`bg-slate-900 border rounded-2xl p-6 mb-6 relative overflow-hidden transition-colors duration-200
            ${editingId ? "border-amber-500/30" : "border-slate-800"}`}>
            <div className={`absolute left-0 top-4 bottom-4 w-0.5 rounded-full
              ${editingId
                ? "bg-gradient-to-b from-amber-400 to-amber-600"
                : "bg-gradient-to-b from-indigo-400 to-indigo-600"
              }`} />

            {/* Form header */}
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <div className={`w-7 h-7 rounded-lg border flex items-center justify-center
                  ${editingId
                    ? "bg-amber-500/10 border-amber-500/20 text-amber-400"
                    : "bg-indigo-500/10 border-indigo-500/20 text-indigo-400"
                  }`}>
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {editingId
                      ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    }
                  </svg>
                </div>
                <h2 className={`text-sm font-semibold uppercase tracking-widest
                  ${editingId ? "text-amber-400" : "text-indigo-400"}`}>
                  {editingId ? "Update Schedule" : "Add Schedule"}
                </h2>
              </div>
              {editingId && (
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 uppercase tracking-wide mb-1.5">Doctor</label>
                <div className="relative">
                  <select
                    value={doctorId}
                    onChange={(e) => setDoctorId(e.target.value)}
                    className={inputClass + " appearance-none pr-10"}
                  >
                    <option value="">Select Doctor</option>
                    {doctors.map((d) => (
                      <option key={d.doctorId} value={d.doctorId}>{d.doctorName}</option>
                    ))}
                  </select>
                  <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none"
                    fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 uppercase tracking-wide mb-1.5">Available Date</label>
                <input
                  type="date"
                  value={availableDate}
                  onChange={(e) => setAvailableDate(e.target.value)}
                  className={inputClass}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 uppercase tracking-wide mb-1.5">Start Time</label>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className={inputClass}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 uppercase tracking-wide mb-1.5">End Time</label>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className={inputClass}
                />
              </div>
            </div>

            <div className="mt-5">
              <button
                onClick={save}
                className={`text-white text-sm font-semibold px-6 py-2.5 rounded-lg transition-colors
                  focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900
                  ${editingId
                    ? "bg-amber-500 hover:bg-amber-400 focus:ring-amber-500"
                    : "bg-indigo-600 hover:bg-indigo-500 focus:ring-indigo-500"
                  }`}
              >
                {editingId ? "Update Schedule" : "Add Schedule"}
              </button>
            </div>
          </div>

          {/* Schedules table */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-indigo-400 uppercase tracking-widest">All Schedules</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  {schedules.length} schedule{schedules.length !== 1 ? "s" : ""} found
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              {schedules.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center mb-3">
                    <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <p className="text-sm text-slate-400 font-medium">No schedules yet</p>
                  <p className="text-xs text-slate-600 mt-1">Add a schedule using the form above.</p>
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
                    {schedules.map((s) => {
                      const isEditing = editingId === s.scheduleId;
                      return (
                        <tr key={s.scheduleId}
                          className={`border-t border-slate-800/60 transition-colors
                            ${isEditing ? "bg-amber-500/5 border-l-2 border-l-amber-500/50" : "hover:bg-slate-800/40"}`}>
                          <td className="px-5 py-3.5 text-slate-500 font-mono text-xs">{s.scheduleId}</td>
                          <td className="px-5 py-3.5 text-white font-medium whitespace-nowrap">
                            {getDoctorName(s.doctorId)}
                          </td>
                          <td className="px-5 py-3.5 text-slate-300 whitespace-nowrap">
                            Room {getDoctorRoom(s.doctorId)}
                          </td>
                          <td className="px-5 py-3.5 text-slate-300 whitespace-nowrap">
                            {String(s.availableDate).split("T")[0]}
                          </td>
                          <td className="px-5 py-3.5 text-slate-300 whitespace-nowrap">{s.startTime}</td>
                          <td className="px-5 py-3.5 text-slate-300 whitespace-nowrap">{s.endTime}</td>
                          <td className="px-5 py-3.5 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => { edit(s); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                                className={`text-xs font-medium px-3 py-1.5 rounded-lg border transition-colors
                                  ${isEditing
                                    ? "bg-amber-500/20 border-amber-500/30 text-amber-400 cursor-default"
                                    : "bg-amber-500/10 border-amber-500/20 text-amber-400 hover:bg-amber-500/20"
                                  }`}
                              >
                                {isEditing ? "Editing…" : "Edit"}
                              </button>
                              <button
                                onClick={() => remove(s.scheduleId)}
                                className="text-xs font-medium px-3 py-1.5 rounded-lg border
                                  bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500/20 transition-colors"
                              >
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

        </main>
      </div>
    </div>
  );
}

export default StaffSchedules;