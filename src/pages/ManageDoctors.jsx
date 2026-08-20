import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function ManageDoctors() {
  const navigate = useNavigate();
  const [doctorName, setDoctorName] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [availability, setAvailability] = useState("Available");
  const [roomNumber, setRoomNumber] = useState("");
  const [doctors, setDoctors] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editDoctor, setEditDoctor] = useState({});
  const [msg, setMsg] = useState("");
  const [msgType, setMsgType] = useState("");

  function showMessage(message, type) {
    setMsg(message);
    setMsgType(type);
    setTimeout(() => setMsg(""), 3000);
  }

  async function loadDoctors() {
    try {
      const response = await api.get("/doctors");
      setDoctors(response.data);
    } catch {
      showMessage("Failed to load doctors", "error");
    }
  }

  useEffect(() => { loadDoctors(); }, []);

  async function addDoctor() {
    if (!doctorName.trim()) { showMessage("Doctor Name is required!", "error"); return; }
    if (!specialization.trim()) { showMessage("Specialization is required!", "error"); return; }
    if (!roomNumber.trim()) { showMessage("Room Number is required!", "error"); return; }
    try {
      await api.post("/doctors", { doctorName, specialization, availability, roomNumber });
      setDoctorName("");
      setSpecialization("");
      setAvailability("Available");
      setRoomNumber("");
      loadDoctors();
      showMessage("Doctor Added Successfully", "success");
    } catch {
      showMessage("Failed to Add Doctor", "error");
    }
  }

  async function deleteDoctor(id) {
    try {
      await api.delete(`/doctors/${id}`);
      loadDoctors();
      showMessage("Doctor Deleted Successfully", "success");
    } catch {
      showMessage("Delete Failed", "error");
    }
  }

  async function updateDoctor() {
    if (!editDoctor.doctorName?.trim()) { showMessage("Doctor Name cannot be empty!", "error"); return; }
    if (!editDoctor.specialization?.trim()) { showMessage("Specialization cannot be empty!", "error"); return; }
    if (!editDoctor.roomNumber?.trim()) { showMessage("Room Number cannot be empty!", "error"); return; }
    try {
      await api.put("/doctors", editDoctor);
      setEditingId(null);
      setEditDoctor({});
      loadDoctors();
      showMessage("Doctor Updated Successfully", "success");
    } catch {
      showMessage("Update Failed", "error");
    }
  }

  const inputClass =
  "bg-slate-800 text-white placeholder-slate-500 border border-slate-700 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition w-full";

  const inlineInputClass =
  "bg-slate-800 text-white border border-slate-700 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition w-full";

  return (
    <div className="min-h-screen bg-slate-950 p-8">

      {/* Header */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <span className="text-xs font-semibold tracking-widest text-indigo-400 uppercase">
            Management
          </span>
          <h1 className="mt-1 text-2xl font-bold text-white tracking-tight">
            Doctor Management
          </h1>
        </div>
        <button
          onClick={() => navigate("/dashboard")}
          className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-sm font-medium px-4 py-2.5 rounded-lg border border-slate-700 transition-colors duration-150"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
          </svg>
          Dashboard
        </button>
      </div>

      {/* Toast message */}
      {msg && (
        <div className={`mb-6 px-4 py-3 rounded-lg text-sm font-medium border flex items-center gap-2
          ${msgType === "success"
            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
            : "bg-red-500/10 text-red-400 border-red-500/30"
          }`}
        >
          {msgType === "success"
            ? <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
              </svg>
            : <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
              </svg>
          }
          {msg}
        </div>
      )}

      {/* Add Doctor form */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mb-6 relative overflow-hidden">
        <div className="absolute left-0 top-4 bottom-4 w-0.5 bg-gradient-to-b from-indigo-400 to-indigo-600 rounded-full" />
        <h2 className="text-sm font-semibold tracking-widest text-indigo-400 uppercase mb-5">
          Add New Doctor
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-400 uppercase tracking-wide mb-1.5">Doctor Name</label>
            <input type="text" placeholder="Dr. John Smith" value={doctorName} onChange={(e) => setDoctorName(e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 uppercase tracking-wide mb-1.5">Specialization</label>
            <input type="text" placeholder="e.g. Cardiology" value={specialization} onChange={(e) => setSpecialization(e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 uppercase tracking-wide mb-1.5">Availability</label>
            <select value={availability} onChange={(e) => setAvailability(e.target.value)} className={inputClass}>
              <option>Available</option>
              <option>Unavailable</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 uppercase tracking-wide mb-1.5">Room Number</label>
            <input type="text" placeholder="e.g. 204" value={roomNumber} onChange={(e) => setRoomNumber(e.target.value)} className={inputClass} />
          </div>
        </div>
        <button
          onClick={addDoctor}
          className="mt-5 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white text-sm font-semibold px-6 py-2.5 rounded-lg transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-slate-900"
        >
          Add Doctor
        </button>
      </div>

      {/* Doctors table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <h2 className="text-sm font-semibold tracking-widest text-indigo-400 uppercase">
            All Doctors
          </h2>
          <span className="text-xs text-slate-500">{doctors.length} doctor{doctors.length !== 1 ? "s" : ""}</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-800">
                {["ID", "Name", "Specialization", "Availability", "Room", "Actions"].map((h) => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {doctors.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center">
                    <p className="text-sm text-slate-500">No doctors added yet.</p>
                  </td>
                </tr>
              ) : (
                doctors.map((d) => (
                  <tr key={d.doctorId} className="border-b border-slate-800/60 hover:bg-slate-800/40 transition-colors">

                    {/* ID */}
                    <td className="px-5 py-3 text-slate-500 font-mono text-xs">
                      {d.doctorId}
                    </td>

                    {/* Name */}
                    <td className="px-5 py-3 text-slate-200 font-medium">
                      {editingId === d.doctorId
                        ? <input value={editDoctor.doctorName || ""} onChange={(e) => setEditDoctor({ ...editDoctor, doctorName: e.target.value })} className={inlineInputClass} />
                        : d.doctorName}
                    </td>

                    {/* Specialization */}
                    <td className="px-5 py-3 text-slate-300">
                      {editingId === d.doctorId
                        ? <input value={editDoctor.specialization || ""} onChange={(e) => setEditDoctor({ ...editDoctor, specialization: e.target.value })} className={inlineInputClass} />
                        : d.specialization}
                    </td>

                    {/* Availability */}
                    <td className="px-5 py-3">
                      {editingId === d.doctorId
                        ? <select value={editDoctor.availability || ""} onChange={(e) => setEditDoctor({ ...editDoctor, availability: e.target.value })} className={inlineInputClass}>
                            <option>Available</option>
                            <option>Unavailable</option>
                          </select>
                        : <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold
                            ${d.availability === "Available"
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                              : "bg-slate-700/50 text-slate-400 border border-slate-700"
                            }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${d.availability === "Available" ? "bg-emerald-400" : "bg-slate-500"}`} />
                            {d.availability}
                          </span>
                      }
                    </td>

                    {/* Room */}
                    <td className="px-5 py-3 text-slate-300">
                      {editingId === d.doctorId
                        ? <input value={editDoctor.roomNumber || ""} onChange={(e) => setEditDoctor({ ...editDoctor, roomNumber: e.target.value })} className={inlineInputClass} />
                        : d.roomNumber}
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        {editingId === d.doctorId ? (
                          <>
                            <button onClick={updateDoctor} className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors">
                              Save
                            </button>
                            <button onClick={() => { setEditingId(null); setEditDoctor({}); }} className="bg-slate-700 hover:bg-slate-600 text-slate-300 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors">
                              Cancel
                            </button>
                          </>
                        ) : (
                          <button onClick={() => { setEditingId(d.doctorId); setEditDoctor(d); }} className="bg-indigo-600/20 hover:bg-indigo-600 text-indigo-400 hover:text-white text-xs font-semibold px-3 py-1.5 rounded-lg border border-indigo-500/30 hover:border-indigo-600 transition-all duration-150">
                            Edit
                          </button>
                        )}
                        <button onClick={() => deleteDoctor(d.doctorId)} className="bg-red-500/10 hover:bg-red-600 text-red-400 hover:text-white text-xs font-semibold px-3 py-1.5 rounded-lg border border-red-500/20 hover:border-red-600 transition-all duration-150">
                          Delete
                        </button>
                      </div>
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}

export default ManageDoctors;