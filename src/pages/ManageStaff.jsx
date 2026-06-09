import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function ManageStaff() {
  const navigate = useNavigate();
  const [staff, setStaff] = useState([]);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editStaff, setEditStaff] = useState({});
  const [msg, setMsg] = useState("");
  const [msgType, setMsgType] = useState("");

  function showMessage(text, type) {
    setMsg(text);
    setMsgType(type);
    setTimeout(() => setMsg(""), 3000);
  }

  async function loadStaff() {
    try {
      const response = await api.get("/staff");
      setStaff(response.data);
    } catch {
      showMessage("Failed to load staff", "error");
    }
  }

  useEffect(() => { loadStaff(); }, []);

  async function addStaff() {
    try {
      await api.post("/staff", { fullName, email, password });
      setFullName("");
      setEmail("");
      setPassword("");
      loadStaff();
      showMessage("Staff added successfully ✓", "success");
    } catch {
      showMessage("Add failed", "error");
    }
  }

  async function updateStaff() {
    try {
      await api.put("/staff", editStaff);
      setEditingId(null);
      loadStaff();
      showMessage("Staff updated successfully ✓", "success");
    } catch {
      showMessage("Update failed", "error");
    }
  }

  async function deleteStaff(id) {
    try {
      await api.delete(`/staff/${id}`);
      loadStaff();
      showMessage("Staff deleted successfully ✓", "success");
    } catch {
      showMessage("Delete failed", "error");
    }
  }

  const inputClass = "bg-slate-800 text-white placeholder-slate-500 border border-slate-700 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition w-full";
  const inlineInputClass = "bg-slate-800 text-white border border-slate-700 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition w-full";

  return (
    <div className="min-h-screen bg-slate-950 p-8">

      {/* Header */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <span className="text-xs font-semibold tracking-widest text-indigo-400 uppercase">
            Management
          </span>
          <h1 className="mt-1 text-2xl font-bold text-white tracking-tight">
            Staff Management
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
            ? <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" /></svg>
            : <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" /></svg>
          }
          {msg}
        </div>
      )}

      {/* Add Staff form */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mb-6 relative overflow-hidden">
        <div className="absolute left-0 top-4 bottom-4 w-0.5 bg-gradient-to-b from-indigo-400 to-indigo-600 rounded-full" />
        <h2 className="text-sm font-semibold tracking-widest text-indigo-400 uppercase mb-5">
          Add Staff Members
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-400 uppercase tracking-wide mb-1.5">Full Name</label>
            <input
              placeholder="Jane Doe"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 uppercase tracking-wide mb-1.5">Email</label>
            <input
              placeholder="jane@hospital.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 uppercase tracking-wide mb-1.5">Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={inputClass}
            />
          </div>
        </div>
        <button
          onClick={addStaff}
          className="mt-5 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white text-sm font-semibold px-6 py-2.5 rounded-lg transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-slate-900"
        >
          Add Staff
        </button>
      </div>

      {/* Staff table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-800">
          <h2 className="text-sm font-semibold tracking-widest text-indigo-400 uppercase">
            All Staff
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-800">
                {["Name", "Email", "Actions"].map((h) => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {staff.map((s) => (
                <tr key={s.staffId} className="border-b border-slate-800/60 hover:bg-slate-800/40 transition-colors">
                  <td className="px-5 py-3 text-slate-200 font-medium">
                    {editingId === s.staffId
                      ? <input value={editStaff.fullName} onChange={(e) => setEditStaff({ ...editStaff, fullName: e.target.value })} className={inlineInputClass} />
                      : <div className="flex items-center gap-3">
                          <div className="w-7 h-7 rounded-lg bg-indigo-600/20 border border-indigo-500/20 flex items-center justify-center text-indigo-400 text-xs font-bold flex-shrink-0">
                            {s.fullName?.charAt(0).toUpperCase()}
                          </div>
                          {s.fullName}
                        </div>
                    }
                  </td>
                  <td className="px-5 py-3 text-slate-400">
                    {editingId === s.staffId
                      ? <input value={editStaff.email} onChange={(e) => setEditStaff({ ...editStaff, email: e.target.value })} className={inlineInputClass} />
                      : s.email
                    }
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      {editingId === s.staffId ? (
                        <>
                          <button onClick={updateStaff} className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors">
                            Save
                          </button>
                          <button onClick={() => { setEditingId(null); setEditStaff({}); }} className="bg-slate-700 hover:bg-slate-600 text-slate-300 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors">
                            Cancel
                          </button>
                        </>
                      ) : (
                        <button onClick={() => { setEditingId(s.staffId); setEditStaff(s); }} className="bg-indigo-600/20 hover:bg-indigo-600 text-indigo-400 hover:text-white text-xs font-semibold px-3 py-1.5 rounded-lg border border-indigo-500/30 hover:border-indigo-600 transition-all duration-150">
                          Edit
                        </button>
                      )}
                      <button onClick={() => deleteStaff(s.staffId)} className="bg-red-500/10 hover:bg-red-600 text-red-400 hover:text-white text-xs font-semibold px-3 py-1.5 rounded-lg border border-red-500/20 hover:border-red-600 transition-all duration-150">
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}

export default ManageStaff;
