import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import api from "../services/api";

const priorityStyles = {
  Emergency:
    "bg-red-500/10 text-red-400 border-red-500/20",

  Elderly:
    "bg-sky-500/10 text-sky-400 border-sky-500/20",

  "Special Needs":
    "bg-purple-500/10 text-purple-400 border-purple-500/20",

  Normal:
    "bg-slate-700/50 text-slate-400 border-slate-700",
};

function QueueRules() {
  const [rules, setRules] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editRule, setEditRule] = useState({});
  const [msg, setMsg] = useState("");
  const [msgType, setMsgType] = useState("");

  function showMessage(text, type) {
    setMsg(text);
    setMsgType(type);

    setTimeout(() => {
      setMsg("");
      setMsgType("");
    }, 3000);
  }

  useEffect(() => {
    loadRules();
  }, []);

  async function loadRules() {
    try {
      const res = await api.get("/queue-rules");

      setRules(
        Array.isArray(res.data)
          ? res.data
          : []
      );
    } catch (error) {
      console.error("LOAD QUEUE RULES ERROR:", error);
      console.error(
        "SERVER RESPONSE:",
        error.response?.data
      );

      showMessage(
        "Failed to load queue rules",
        "error"
      );
    }
  }

  function startEditing(rule) {
    setEditingId(rule.ruleId);

    setEditRule({
      ruleId: rule.ruleId,
      priorityType: rule.priorityType,
      priorityOrder: rule.priorityOrder,
      description: rule.description ?? "",
      isActive: Boolean(rule.isActive),
    });
  }

  function cancelEditing() {
    setEditingId(null);
    setEditRule({});
  }

  async function saveRule() {
  if (!editingId) {
    showMessage(
      "No rule selected for editing.",
      "error"
    );
    return;
  }

  const payload = {
    priorityType: editRule.priorityType,
    priorityOrder: Number(editRule.priorityOrder),
    description: editRule.description ?? "",
    isActive: Boolean(editRule.isActive),
  };

  console.log("UPDATING QUEUE RULE:", {
    id: editingId,
    payload: payload,
  });

  try {
    const response = await api.put(
      `/queue-rules/${editingId}`,
      payload
    );

    console.log(
      "QUEUE RULE UPDATE RESPONSE:",
      response.data
    );

    setEditingId(null);
    setEditRule({});

    await loadRules();

    showMessage(
      "Rule updated successfully",
      "success"
    );

  } catch (error) {
    console.error(
      "UPDATE QUEUE RULE ERROR:",
      error
    );

    console.error(
      "STATUS:",
      error.response?.status
    );

    console.error(
      "SERVER RESPONSE:",
      error.response?.data
    );

    if (!error.response) {
      showMessage(
        "Cannot connect to the server. Make sure Spring Boot is running on port 8080.",
        "error"
      );
      return;
    }

    const backendMessage =
      error.response?.data?.message ||
      (
        typeof error.response?.data === "string"
          ? error.response.data
          : null
      );

    showMessage(
      backendMessage ||
        `Failed to update rule (${error.response.status})`,
      "error"
    );
  }
}

  const inlineInputClass =
    "bg-slate-800 text-white border border-slate-700 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition w-full";

  return (
    <div className="flex min-h-screen bg-slate-950">

      <Sidebar />

      <div className="flex-1 flex flex-col">

        <Topbar />

        <main className="flex-1 p-8">

          {/* Header */}
          <div className="mb-8">

            <span className="text-xs font-semibold tracking-widest text-indigo-400 uppercase">
              Configuration
            </span>

            <h1 className="mt-1 text-2xl font-bold text-white tracking-tight">
              Priority Queue Rules
            </h1>

            <p className="text-slate-400 text-sm mt-1">
              Manage patient priority handling rules
            </p>

          </div>

          {/* Toast */}
          {msg && (
            <div
              className={`
                mb-6
                px-4
                py-3
                rounded-lg
                text-sm
                font-medium
                border
                flex
                items-center
                gap-2

                ${
                  msgType === "success"
                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                    : "bg-red-500/10 text-red-400 border-red-500/30"
                }
              `}
            >
              {msgType === "success" ? (
                <svg
                  className="w-4 h-4 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m4.5 12.75 6 6 9-13.5"
                  />
                </svg>
              ) : (
                <svg
                  className="w-4 h-4 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 9v3.75m9-.75a9 9 0 1 1-18 0Zm-9 3.75h.008v.008H12v-.008Z"
                  />
                </svg>
              )}

              {msg}
            </div>
          )}

          {/* Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">

            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">

              <h2 className="text-sm font-semibold tracking-widest text-indigo-400 uppercase">
                Rules
              </h2>

              <span className="text-xs text-slate-500">
                {rules.length} rules configured
              </span>

            </div>

            <div className="overflow-x-auto">

              <table className="w-full text-sm">

                <thead>
                  <tr className="border-b border-slate-800">

                    {[
                      "Priority Type",
                      "Order",
                      "Description",
                      "Status",
                      "Actions",
                    ].map((header) => (
                      <th
                        key={header}
                        className="px-5 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider"
                      >
                        {header}
                      </th>
                    ))}

                  </tr>
                </thead>

                <tbody>

                  {rules.length === 0 ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-5 py-10 text-center text-slate-500"
                      >
                        No queue rules found.
                      </td>
                    </tr>
                  ) : (
                    rules.map((rule) => {

                      const isEditing =
                        editingId === rule.ruleId;

                      return (
                        <tr
                          key={rule.ruleId}
                          className="border-b border-slate-800/60 hover:bg-slate-800/40 transition-colors"
                        >

                          {/* Priority Type */}
                          <td className="px-5 py-3">

                            <span
                              className={`
                                inline-flex
                                items-center
                                px-2.5
                                py-1
                                rounded-full
                                text-xs
                                font-semibold
                                border

                                ${
                                  priorityStyles[
                                    rule.priorityType
                                  ] ??
                                  priorityStyles.Normal
                                }
                              `}
                            >
                              {rule.priorityType}
                            </span>

                          </td>

                          {/* Priority Order */}
                          <td className="px-5 py-3">

                            {isEditing ? (
                              <input
                                type="number"
                                min="1"
                                value={
                                  editRule.priorityOrder ?? ""
                                }
                                onChange={(event) =>
                                  setEditRule({
                                    ...editRule,
                                    priorityOrder:
                                      event.target.value,
                                  })
                                }
                                className={`${inlineInputClass} w-20`}
                              />
                            ) : (
                              <span
                                className="
                                  inline-flex
                                  items-center
                                  justify-center
                                  w-7
                                  h-7
                                  rounded-lg
                                  bg-slate-800
                                  border
                                  border-slate-700
                                  text-slate-300
                                  font-bold
                                  text-xs
                                "
                              >
                                {rule.priorityOrder}
                              </span>
                            )}

                          </td>

                          {/* Description */}
                          <td className="px-5 py-3 text-slate-400 max-w-xs">

                            {isEditing ? (
                              <input
                                type="text"
                                value={
                                  editRule.description ?? ""
                                }
                                onChange={(event) =>
                                  setEditRule({
                                    ...editRule,
                                    description:
                                      event.target.value,
                                  })
                                }
                                className={inlineInputClass}
                              />
                            ) : (
                              <span className="text-slate-400">
                                {rule.description}
                              </span>
                            )}

                          </td>

                          {/* Status */}
                          <td className="px-5 py-3">

                            {isEditing ? (
                              <select
                                value={
                                  editRule.isActive
                                    ? "true"
                                    : "false"
                                }
                                onChange={(event) =>
                                  setEditRule({
                                    ...editRule,
                                    isActive:
                                      event.target.value ===
                                      "true",
                                  })
                                }
                                className={`${inlineInputClass} w-32`}
                              >
                                <option value="true">
                                  Active
                                </option>

                                <option value="false">
                                  Disabled
                                </option>
                              </select>
                            ) : (
                              <span
                                className={`
                                  inline-flex
                                  items-center
                                  gap-1.5
                                  px-2.5
                                  py-1
                                  rounded-full
                                  text-xs
                                  font-semibold
                                  border

                                  ${
                                    rule.isActive
                                      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                      : "bg-slate-700/50 text-slate-400 border-slate-700"
                                  }
                                `}
                              >

                                <span
                                  className={`
                                    w-1.5
                                    h-1.5
                                    rounded-full

                                    ${
                                      rule.isActive
                                        ? "bg-emerald-400"
                                        : "bg-slate-500"
                                    }
                                  `}
                                />

                                {rule.isActive
                                  ? "Active"
                                  : "Disabled"}

                              </span>
                            )}

                          </td>

                          {/* Actions */}
                          <td className="px-5 py-3">

                            <div className="flex items-center gap-2">

                              {isEditing ? (
                                <>
                                  <button
                                    onClick={saveRule}
                                    className="
                                      bg-emerald-600
                                      hover:bg-emerald-500
                                      text-white
                                      text-xs
                                      font-semibold
                                      px-3
                                      py-1.5
                                      rounded-lg
                                      transition-colors
                                    "
                                  >
                                    Save
                                  </button>

                                  <button
                                    onClick={cancelEditing}
                                    className="
                                      bg-slate-700
                                      hover:bg-slate-600
                                      text-slate-300
                                      text-xs
                                      font-semibold
                                      px-3
                                      py-1.5
                                      rounded-lg
                                      transition-colors
                                    "
                                  >
                                    Cancel
                                  </button>
                                </>
                              ) : (
                                <button
                                  onClick={() =>
                                    startEditing(rule)
                                  }
                                  className="
                                    bg-indigo-600/20
                                    hover:bg-indigo-600
                                    text-indigo-400
                                    hover:text-white
                                    text-xs
                                    font-semibold
                                    px-3
                                    py-1.5
                                    rounded-lg
                                    border
                                    border-indigo-500/30
                                    hover:border-indigo-600
                                    transition-all
                                    duration-150
                                  "
                                >
                                  Edit
                                </button>
                              )}

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

        </main>

      </div>

    </div>
  );
}

export default QueueRules;