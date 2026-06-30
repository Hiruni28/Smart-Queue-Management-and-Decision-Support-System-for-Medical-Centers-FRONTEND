import { useEffect, useState } from "react";
import StaffSidebar from "../components/StaffSidebar";
import StaffTopbar from "../components/StaffTopbar";
import api from "../services/api";

const statusStyles = {
  Arrived:     "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400",
  Delayed:     "bg-amber-500/10 border border-amber-500/20 text-amber-400",
  Unavailable: "bg-red-500/10 border border-red-500/20 text-red-400",
};

function StatusBadge({ status }) {
  const style = statusStyles[status] ?? "bg-slate-700 border border-slate-600 text-slate-300";
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${style}`}>
      {status}
    </span>
  );
}

function StaffDoctorStatus() {
  const [allDoctors, setAllDoctors] = useState([]);
  const [todayDoctors, setTodayDoctors] = useState([]);
  const [statuses, setStatuses] = useState([]);

  const [doctorId, setDoctorId] = useState("");
  const [arrivalStatus, setArrivalStatus] = useState("Arrived");
  const [delayReason, setDelayReason] = useState("");

  const [msg, setMsg] = useState("");
  const [msgType, setMsgType] = useState("");

  function showMessage(text, type) {
    setMsg(text);
    setMsgType(type);
    setTimeout(() => setMsg(""), 3000);
  }

  useEffect(() => { loadDoctors(); loadStatuses(); }, []);

  async function loadDoctors() {
    try {
      const doctorRes = await api.get("/doctors");
      const scheduleRes = await api.get("/schedule");

      setAllDoctors(doctorRes.data);

      const today = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Colombo" });
      const todayDoctorIds = scheduleRes.data
        .filter((s) => s.availableDate === today)
        .map((s) => s.doctorId);

      const filteredDoctors = doctorRes.data.filter((d) => todayDoctorIds.includes(d.doctorId));
      setTodayDoctors(filteredDoctors);
    } catch {
      showMessage("Failed to load doctors", "error");
    }
  }

  async function loadStatuses() {
    try {
      const res = await api.get("/doctor-status");
      setStatuses(res.data);
    } catch {
      showMessage("Failed to load statuses", "error");
    }
  }

  async function saveStatus() {
    if (!doctorId) {
      showMessage("Select a doctor", "error");
      return;
    }
    try {
      await api.post("/doctor-status", {
        doctorId: Number(doctorId),
        arrivalStatus,
        delayReason,
      });
      showMessage("Status updated successfully", "success");
      setDoctorId("");
      setArrivalStatus("Arrived");
      setDelayReason("");
      loadStatuses();
    } catch (err) {
      console.log(err);
      showMessage("Failed to update status", "error");
    }
  }

  async function remove(id) {
    try {
      await api.delete(`/doctor-status/${id}`);
      showMessage("Status deleted", "success");
      loadStatuses();
    } catch {
      showMessage("Delete failed", "error");
    }
  }

  function getDoctor(id) {
    return allDoctors.find((d) => d.doctorId === id);
  }

  function doctorName(id) {
    return getDoctor(id)?.doctorName || "—";
  }

  function doctorSpecialization(id) {
    return getDoctor(id)?.specialization || "—";
  }

  const visibleStatuses = statuses.filter((s) =>
    todayDoctors.some((d) => d.doctorId === s.doctorId)
  );

  const inputClass = "w-full bg-slate-800 border border-slate-700 text-white placeholder-slate-500 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed";
  const cols = ["ID", "Doctor", "Specialization", "Status", "Delay Reason", "Updated At", "Actions"];

  return (
    <div className="flex min-h-screen bg-slate-950">
      <StaffSidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <StaffTopbar />

        <main className="flex-1 p-8">

          {/* Header */}
          <div className="mb-8">
            <span className="text-xs font-semibold text-teal-400 uppercase tracking-widest">
              Coordination
            </span>
            <h1 className="text-2xl text-white font-bold mt-1">Doctor Coordination</h1>
            <p className="text-slate-500 text-sm mt-1">Update doctor arrival and delay information.</p>
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
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mb-6 relative overflow-hidden">
            <div className="absolute left-0 top-4 bottom-4 w-0.5 bg-gradient-to-b from-teal-400 to-teal-600 rounded-full" />

            <div className="flex items-center gap-2 mb-5">
              <div className="w-7 h-7 rounded-lg bg-teal-600/10 border border-teal-500/20 flex items-center justify-center">
                <svg className="w-3.5 h-3.5 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-sm font-semibold text-teal-400 uppercase tracking-widest">
                Update Doctor Status
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 uppercase tracking-wide mb-1.5">Doctor</label>
                <div className="relative">
                  <select
                    value={doctorId}
                    onChange={(e) => setDoctorId(e.target.value)}
                    className={inputClass + " appearance-none pr-10"}
                  >
                    <option value="">Select Doctor</option>
                    {todayDoctors.map((d) => (
                      <option key={d.doctorId} value={d.doctorId}>
                        {d.doctorName} ({d.specialization})
                      </option>
                    ))}
                  </select>
                  <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none"
                    fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 uppercase tracking-wide mb-1.5">Arrival Status</label>
                <div className="relative">
                  <select
                    value={arrivalStatus}
                    onChange={(e) => setArrivalStatus(e.target.value)}
                    className={inputClass + " appearance-none pr-10"}
                  >
                    <option value="Arrived">Arrived</option>
                    <option value="Delayed">Delayed</option>
                    <option value="Unavailable">Unavailable</option>
                  </select>
                  <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none"
                    fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>

              <div>
                <label className={`block text-xs font-medium uppercase tracking-wide mb-1.5
                  ${arrivalStatus === "Delayed" ? "text-slate-400" : "text-slate-600"}`}>
                  Delay Reason
                </label>
                <input
                  type="text"
                  placeholder="e.g. Stuck in traffic"
                  value={delayReason}
                  onChange={(e) => setDelayReason(e.target.value)}
                  disabled={arrivalStatus !== "Delayed"}
                  className={inputClass}
                />
              </div>
            </div>

            <button
              onClick={saveStatus}
              className="mt-5 bg-teal-600 hover:bg-teal-500 active:bg-teal-700 text-white text-sm font-semibold
                px-6 py-2.5 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500
                focus:ring-offset-2 focus:ring-offset-slate-900"
            >
              Update Status
            </button>
          </div>

          {/* Status table */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-teal-400 uppercase tracking-widest">Today's Status Updates</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  {visibleStatuses.length} update{visibleStatuses.length !== 1 ? "s" : ""} for today's doctors
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              {visibleStatuses.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center mb-3">
                    <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <p className="text-sm text-slate-400 font-medium">No status updates yet</p>
                  <p className="text-xs text-slate-600 mt-1">Update a doctor's status using the form above.</p>
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
                    {visibleStatuses.map((s) => (
                      <tr key={s.statusId}
                        className="border-t border-slate-800/60 hover:bg-slate-800/40 transition-colors">
                        <td className="px-5 py-3.5 text-slate-500 font-mono text-xs">{s.statusId}</td>
                        <td className="px-5 py-3.5 text-white font-medium whitespace-nowrap">{doctorName(s.doctorId)}</td>
                        <td className="px-5 py-3.5 text-slate-300 whitespace-nowrap">{doctorSpecialization(s.doctorId)}</td>
                        <td className="px-5 py-3.5 whitespace-nowrap">
                          <StatusBadge status={s.arrivalStatus} />
                        </td>
                        <td className="px-5 py-3.5 text-slate-300 whitespace-nowrap">{s.delayReason || "—"}</td>
                        <td className="px-5 py-3.5 text-slate-400 text-xs whitespace-nowrap">
                          {s.updatedAt ? new Date(s.updatedAt).toLocaleString() : "—"}
                        </td>
                        <td className="px-5 py-3.5 whitespace-nowrap">
                          <button
                            onClick={() => remove(s.statusId)}
                            className="text-xs font-medium px-3 py-1.5 rounded-lg
                              bg-red-500/10 border border-red-500/20 text-red-400
                              hover:bg-red-500/20 transition-colors"
                          >
                            Delete
                          </button>
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
    </div>
  );
}

export default StaffDoctorStatus;