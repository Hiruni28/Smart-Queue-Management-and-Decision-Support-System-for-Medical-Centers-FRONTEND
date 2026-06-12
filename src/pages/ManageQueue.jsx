import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

const statusStyles = {
  Waiting:   "bg-amber-500/10 text-amber-400 border-amber-500/20",
  Serving:   "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
  Completed: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  Skipped:   "bg-slate-700/50 text-slate-400 border-slate-700",
};

const statusDot = {
  Waiting:   "bg-amber-400",
  Serving:   "bg-indigo-400",
  Completed: "bg-emerald-400",
  Skipped:   "bg-slate-500",
};

const priorityStyles = {
  Normal:        "bg-slate-700/50 text-slate-400 border-slate-700",
  Emergency:     "bg-red-500/10 text-red-400 border-red-500/20",
  Elderly:       "bg-sky-500/10 text-sky-400 border-sky-500/20",
  "Special Needs": "bg-purple-500/10 text-purple-400 border-purple-500/20",
};

function ManageQueue() {
  const navigate = useNavigate();
  const [queues, setQueues] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editQueue, setEditQueue] = useState({});
  const [msg, setMsg] = useState("");
  const [msgType, setMsgType] = useState("");

  function showMessage(text, type) {
    setMsg(text);
    setMsgType(type);
    setTimeout(() => setMsg(""), 3000);
  }

  async function loadQueues() {
    try {
      const response = await api.get("/queue");
      setQueues(response.data);
    } catch {
      showMessage("Failed to load queue", "error");
    }
  }

  useEffect(() => { loadQueues(); }, []);

  async function updateQueue() {
    if (!editQueue.queueStatus) { showMessage("Queue Status required", "error"); return; }
    if (!editQueue.priorityType) { showMessage("Priority Type required", "error"); return; }
    try {
      await api.put("/queue", editQueue);
      setEditingId(null);
      loadQueues();
      showMessage("Queue Updated", "success");
    } catch {
      showMessage("Update Failed", "error");
    }
  }

  async function deleteQueue(id) {
    try {
      await api.delete(`/queue/${id}`);
      loadQueues();
      showMessage("Queue Deleted", "success");
    } catch {
      showMessage("Delete Failed", "error");
    }
  }

  const selectClass = "bg-slate-800 text-white border border-slate-700 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition w-full";

  return (
    <div className="min-h-screen bg-slate-950 p-8">

      {/* Header */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <span className="text-xs font-semibold tracking-widest text-indigo-400 uppercase">
            Live
          </span>
          <h1 className="mt-1 text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            Queue Management
            <span className="flex items-center gap-1.5 text-sm font-normal text-emerald-400 ml-1">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
              </span>
              Active
            </span>
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

      {/* Toast */}
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

      {/* Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <h2 className="text-sm font-semibold tracking-widest text-indigo-400 uppercase">
            Queue List
          </h2>
          <span className="text-xs text-slate-500">{queues.length} entries</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-800">
                {["Token", "Appointment", "Status", "Priority", "Wait (min)", "Actions"].map((h) => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {queues.map((q) => (
                <tr key={q.queueId} className="border-b border-slate-800/60 hover:bg-slate-800/40 transition-colors">

                  {/* Token */}
                  <td className="px-5 py-3">
                    <span className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-indigo-600/20 border border-indigo-500/20 text-indigo-300 font-bold text-sm">
                      {q.tokenNumber}
                    </span>
                  </td>

                  {/* Appointment */}
                  <td className="px-5 py-3 text-slate-400 font-mono text-xs">
                    #{q.appointmentId}
                  </td>

                  {/* Status */}
                  <td className="px-5 py-3">
                    {editingId === q.queueId
                      ? <select value={editQueue.queueStatus} onChange={(e) => setEditQueue({ ...editQueue, queueStatus: e.target.value })} className={selectClass}>
                          <option>Waiting</option>
                          <option>Serving</option>
                          <option>Completed</option>
                          <option>Skipped</option>
                        </select>
                      : <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${statusStyles[q.queueStatus] ?? statusStyles.Waiting}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${statusDot[q.queueStatus] ?? "bg-slate-400"}`} />
                          {q.queueStatus}
                        </span>
                    }
                  </td>

                  {/* Priority */}
                  <td className="px-5 py-3">
                    {editingId === q.queueId
                      ? <select value={editQueue.priorityType} onChange={(e) => setEditQueue({ ...editQueue, priorityType: e.target.value })} className={selectClass}>
                          <option>Normal</option>
                          <option>Emergency</option>
                          <option>Elderly</option>
                          <option>Special Needs</option>
                        </select>
                      : <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${priorityStyles[q.priorityType] ?? priorityStyles.Normal}`}>
                          {q.priorityType}
                        </span>
                    }
                  </td>

                  {/* Wait time */}
                  <td className="px-5 py-3 text-slate-300 font-medium">
                    {q.estimatedWaitTime ?? "—"}
                    {q.estimatedWaitTime && <span className="text-slate-500 text-xs ml-1">min</span>}
                  </td>

                  {/* Actions */}
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      {editingId === q.queueId ? (
                        <>
                          <button onClick={updateQueue} className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors">
                            Save
                          </button>
                          <button onClick={() => { setEditingId(null); setEditQueue({}); }} className="bg-slate-700 hover:bg-slate-600 text-slate-300 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors">
                            Cancel
                          </button>
                        </>
                      ) : (
                        <button onClick={() => { setEditingId(q.queueId); setEditQueue(q); }} className="bg-indigo-600/20 hover:bg-indigo-600 text-indigo-400 hover:text-white text-xs font-semibold px-3 py-1.5 rounded-lg border border-indigo-500/30 hover:border-indigo-600 transition-all duration-150">
                          Edit
                        </button>
                      )}
                      <button onClick={() => deleteQueue(q.queueId)} className="bg-red-500/10 hover:bg-red-600 text-red-400 hover:text-white text-xs font-semibold px-3 py-1.5 rounded-lg border border-red-500/20 hover:border-red-600 transition-all duration-150">
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

export default ManageQueue;
