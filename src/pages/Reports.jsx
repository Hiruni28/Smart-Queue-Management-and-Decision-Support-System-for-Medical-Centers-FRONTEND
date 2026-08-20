import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import api from "../services/api";

function Reports() {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
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
    loadReport();
  }, []);

  async function loadReport() {
    try {
      setLoading(true);

      const response = await api.get("/reports/dashboard");

      setReport(response.data);
    } catch (error) {
      console.error("REPORT DASHBOARD ERROR:", error);
      console.error("STATUS:", error.response?.status);
      console.error("SERVER RESPONSE:", error.response?.data);

      showMessage(
        "Failed to load reports dashboard.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  }

  function formatMinutes(value) {
    if (
      value === null ||
      value === undefined ||
      Number.isNaN(Number(value))
    ) {
      return "0 min";
    }

    return `${Math.round(Number(value))} min`;
  }

  // =============================================================
  // GENERATE REPORT
  // =============================================================

  function generateReport() {
    if (!report) {
      showMessage(
        "Report data is not available yet.",
        "error"
      );
      return;
    }

    try {
      setGenerating(true);

      const peakHours =
        report.peakHours || [];

      const peakHoursRows =
        peakHours.length > 0
          ? peakHours
              .map(
                (item) => `
                  <tr>
                    <td>${escapeHtml(item.hour ?? "-")}</td>
                    <td>${item.appointmentCount ?? 0}</td>
                  </tr>
                `
              )
              .join("")
          : `
              <tr>
                <td colspan="2">No appointment time data available.</td>
              </tr>
            `;

      const generatedAt =
        new Date().toLocaleString();

      const reportHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />

  <meta
    name="viewport"
    content="width=device-width, initial-scale=1.0"
  />

  <title>Hospital Queue Management Report</title>

  <style>
    * {
      box-sizing: border-box;
    }

    body {
      margin: 0;
      padding: 40px;
      font-family: Arial, Helvetica, sans-serif;
      background: #f8fafc;
      color: #0f172a;
    }

    .container {
      max-width: 1100px;
      margin: 0 auto;
      background: white;
      padding: 40px;
      border-radius: 12px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
    }

    .header {
      border-bottom: 2px solid #e2e8f0;
      padding-bottom: 20px;
      margin-bottom: 30px;
    }

    .header h1 {
      margin: 0;
      font-size: 28px;
      color: #0f172a;
    }

    .header p {
      margin: 8px 0 0;
      color: #64748b;
      font-size: 14px;
    }

    .section {
      margin-top: 30px;
    }

    .section h2 {
      font-size: 18px;
      margin-bottom: 15px;
      color: #1e293b;
    }

    .cards {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 15px;
    }

    .card {
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      padding: 18px;
      background: #f8fafc;
    }

    .card-title {
      font-size: 12px;
      text-transform: uppercase;
      color: #64748b;
      letter-spacing: 0.05em;
    }

    .card-value {
      margin-top: 8px;
      font-size: 26px;
      font-weight: bold;
      color: #0f172a;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 10px;
    }

    th,
    td {
      border: 1px solid #e2e8f0;
      padding: 12px;
      text-align: left;
      font-size: 14px;
    }

    th {
      background: #f1f5f9;
      color: #334155;
    }

    .recommendation {
      background: #eef2ff;
      border: 1px solid #c7d2fe;
      border-radius: 10px;
      padding: 20px;
      line-height: 1.6;
    }

    .footer {
      margin-top: 35px;
      padding-top: 20px;
      border-top: 1px solid #e2e8f0;
      color: #64748b;
      font-size: 12px;
    }

    @media print {
      body {
        background: white;
        padding: 0;
      }

      .container {
        box-shadow: none;
        max-width: none;
      }
    }

    @media (max-width: 800px) {
      .cards {
        grid-template-columns: repeat(2, 1fr);
      }
    }
  </style>
</head>

<body>

  <div class="container">

    <div class="header">
      <h1>Hospital Queue Management System</h1>

      <p>
        Reports & Decision Support
      </p>

      <p>
        Generated: ${escapeHtml(generatedAt)}
      </p>
    </div>

    <!-- SUMMARY -->

    <div class="section">

      <h2>Summary</h2>

      <div class="cards">

        <div class="card">
          <div class="card-title">
            Total Appointments
          </div>

          <div class="card-value">
            ${report.totalAppointments ?? 0}
          </div>
        </div>

        <div class="card">
          <div class="card-title">
            Currently Waiting
          </div>

          <div class="card-value">
            ${report.waitingAppointments ?? 0}
          </div>
        </div>

        <div class="card">
          <div class="card-title">
            Average Waiting Time
          </div>

          <div class="card-value">
            ${formatMinutes(
              report.averageWaitingTime
            )}
          </div>
        </div>

        <div class="card">
          <div class="card-title">
            Predicted Waiting Time
          </div>

          <div class="card-value">
            ${formatMinutes(
              report.predictedWaitingTime
            )}
          </div>
        </div>

      </div>

    </div>

    <!-- APPOINTMENT STATUS -->

    <div class="section">

      <h2>Appointment Status</h2>

      <table>

        <thead>
          <tr>
            <th>Status</th>
            <th>Count</th>
          </tr>
        </thead>

        <tbody>

          <tr>
            <td>Booked</td>
            <td>${report.bookedAppointments ?? 0}</td>
          </tr>

          <tr>
            <td>Confirmed</td>
            <td>${report.confirmedAppointments ?? 0}</td>
          </tr>

          <tr>
            <td>Waiting</td>
            <td>${report.waitingAppointments ?? 0}</td>
          </tr>

          <tr>
            <td>Serving</td>
            <td>${report.servingAppointments ?? 0}</td>
          </tr>

          <tr>
            <td>Completed</td>
            <td>${report.completedAppointments ?? 0}</td>
          </tr>

          <tr>
            <td>Cancelled</td>
            <td>${report.cancelledAppointments ?? 0}</td>
          </tr>

          <tr>
            <td>Skipped</td>
            <td>${report.skippedAppointments ?? 0}</td>
          </tr>

        </tbody>

      </table>

    </div>

    <!-- PEAK HOURS -->

    <div class="section">

      <h2>Peak Hours Analysis</h2>

      <p>
        <strong>Busiest Hour:</strong>
        ${escapeHtml(report.busiestHour ?? "-")}
      </p>

      <p>
        <strong>Appointments:</strong>
        ${report.busiestHourAppointmentCount ?? 0}
      </p>

      <table>

        <thead>
          <tr>
            <th>Hour</th>
            <th>Appointments</th>
          </tr>
        </thead>

        <tbody>
          ${peakHoursRows}
        </tbody>

      </table>

    </div>

    <!-- WAITING TIME -->

    <div class="section">

      <h2>Waiting Time Analysis</h2>

      <table>

        <thead>
          <tr>
            <th>Metric</th>
            <th>Value</th>
          </tr>
        </thead>

        <tbody>

          <tr>
            <td>Average Waiting Time</td>
            <td>
              ${formatMinutes(
                report.averageWaitingTime
              )}
            </td>
          </tr>

          <tr>
            <td>Predicted Waiting Time</td>
            <td>
              ${formatMinutes(
                report.predictedWaitingTime
              )}
            </td>
          </tr>

        </tbody>

      </table>

    </div>

    <!-- DECISION SUPPORT -->

    <div class="section">

      <h2>Decision Support</h2>

      <div class="recommendation">

        <strong>
          Recommended Action
        </strong>

        <p>
          ${escapeHtml(
            report.decisionSupportMessage ??
              "No recommendation available."
          )}
        </p>

      </div>

    </div>

    <div class="footer">
      Hospital Queue Management System -
      Reports Dashboard
    </div>

  </div>

</body>
</html>
      `;

      const blob = new Blob(
        [reportHtml],
        {
          type: "text/html;charset=utf-8",
        }
      );

      const url =
        window.URL.createObjectURL(blob);

      const link =
        document.createElement("a");

      link.href = url;

      link.download =
        `hospital-queue-report-${getDateForFileName()}.html`;

      document.body.appendChild(link);

      link.click();

      document.body.removeChild(link);

      window.URL.revokeObjectURL(url);

      showMessage(
        "Report generated successfully.",
        "success"
      );

    } catch (error) {

      console.error(
        "REPORT GENERATION ERROR:",
        error
      );

      showMessage(
        "Failed to generate report.",
        "error"
      );

    } finally {
      setGenerating(false);
    }
  }

  // =============================================================
  // ESCAPE HTML
  // =============================================================

  function escapeHtml(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  // =============================================================
  // FILE DATE
  // =============================================================

  function getDateForFileName() {
    const date = new Date();

    const year =
      date.getFullYear();

    const month =
      String(date.getMonth() + 1)
        .padStart(2, "0");

    const day =
      String(date.getDate())
        .padStart(2, "0");

    const hours =
      String(date.getHours())
        .padStart(2, "0");

    const minutes =
      String(date.getMinutes())
        .padStart(2, "0");

    return `${year}-${month}-${day}-${hours}${minutes}`;
  }

  // =============================================================
  // LOADING
  // =============================================================

  if (loading) {
    return (
      <div className="flex min-h-screen bg-slate-950">

        <Sidebar />

        <div className="flex-1 flex flex-col">

          <Topbar />

          <main className="flex-1 p-8">

            <div className="mb-8">

              <span className="text-xs font-semibold tracking-widest text-indigo-400 uppercase">
                Reports & Decision Support
              </span>

              <h1 className="mt-1 text-2xl font-bold text-white">
                Reports Dashboard
              </h1>

            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center text-slate-400">
              Loading report data...
            </div>

          </main>

        </div>

      </div>
    );
  }

  // =============================================================
  // MAIN
  // =============================================================

  return (
    <div className="flex min-h-screen bg-slate-950">

      <Sidebar />

      <div className="flex-1 flex flex-col">

        <Topbar />

        <main className="flex-1 p-8">

          {/* HEADER */}

          <div className="mb-8">

            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">

              <div>

                <span className="text-xs font-semibold tracking-widest text-indigo-400 uppercase">
                  Reports & Decision Support
                </span>

                <h1 className="mt-1 text-2xl font-bold text-white tracking-tight">
                  Reports Dashboard
                </h1>

                <p className="text-slate-400 text-sm mt-1">
                  Monitor queue performance, waiting times and appointment demand
                </p>

              </div>

              {/* GENERATE REPORT BUTTON */}

              <button
                onClick={generateReport}
                disabled={!report || generating}
                className={`inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors
                  ${
                    !report || generating
                      ? "bg-slate-700 text-slate-400 cursor-not-allowed"
                      : "bg-emerald-600 hover:bg-emerald-500 text-white"
                  }
                `}
              >

                {generating ? (
                  <>
                    <svg
                      className="w-4 h-4 animate-spin"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />

                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                      />
                    </svg>

                    Generating...
                  </>
                ) : (
                  <>
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 3v12m0 0 4-4m-4 4-4-4M5 21h14"
                      />
                    </svg>

                    Generate Report
                  </>
                )}

              </button>

            </div>

          </div>

          {/* MESSAGE */}

          {msg && (
            <div
              className={`mb-6 px-4 py-3 rounded-lg text-sm font-medium border
                ${
                  msgType === "success"
                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                    : "bg-red-500/10 text-red-400 border-red-500/30"
                }
              `}
            >
              {msg}
            </div>
          )}

          {report && (
            <>

              {/* SUMMARY CARDS */}

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">

                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">

                  <p className="text-xs uppercase tracking-wider text-slate-500">
                    Total Appointments
                  </p>

                  <p className="mt-2 text-3xl font-bold text-white">
                    {report.totalAppointments ?? 0}
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    All recorded appointments
                  </p>

                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">

                  <p className="text-xs uppercase tracking-wider text-slate-500">
                    Currently Waiting
                  </p>

                  <p className="mt-2 text-3xl font-bold text-amber-400">
                    {report.waitingAppointments ?? 0}
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    Patients in waiting status
                  </p>

                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">

                  <p className="text-xs uppercase tracking-wider text-slate-500">
                    Average Waiting Time
                  </p>

                  <p className="mt-2 text-3xl font-bold text-sky-400">
                    {formatMinutes(
                      report.averageWaitingTime
                    )}
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    Based on queue data
                  </p>

                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">

                  <p className="text-xs uppercase tracking-wider text-slate-500">
                    Predicted Waiting Time
                  </p>

                  <p className="mt-2 text-3xl font-bold text-purple-400">
                    {formatMinutes(
                      report.predictedWaitingTime
                    )}
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    Data-driven prediction
                  </p>

                </div>

              </div>

              {/* TWO COLUMN SECTION */}

              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-8">

                {/* APPOINTMENT STATUS */}

                <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">

                  <div className="px-6 py-4 border-b border-slate-800">

                    <h2 className="text-sm font-semibold tracking-widest text-indigo-400 uppercase">
                      Appointment Status
                    </h2>

                    <p className="text-xs text-slate-500 mt-1">
                      Current appointment distribution
                    </p>

                  </div>

                  <div className="p-6 space-y-4">

                    <StatusRow
                      label="Booked"
                      value={report.bookedAppointments}
                    />

                    <StatusRow
                      label="Confirmed"
                      value={report.confirmedAppointments}
                    />

                    <StatusRow
                      label="Waiting"
                      value={report.waitingAppointments}
                    />

                    <StatusRow
                      label="Serving"
                      value={report.servingAppointments}
                    />

                    <StatusRow
                      label="Completed"
                      value={report.completedAppointments}
                    />

                    <StatusRow
                      label="Cancelled"
                      value={report.cancelledAppointments}
                    />

                    <StatusRow
                      label="Skipped"
                      value={report.skippedAppointments}
                    />

                  </div>

                </div>

                {/* PEAK HOURS */}

                <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">

                  <div className="px-6 py-4 border-b border-slate-800">

                    <h2 className="text-sm font-semibold tracking-widest text-indigo-400 uppercase">
                      Peak Hours Analysis
                    </h2>

                    <p className="text-xs text-slate-500 mt-1">
                      Appointment demand by hour
                    </p>

                  </div>

                  <div className="p-6">

                    <div className="mb-5 p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20">

                      <p className="text-xs uppercase tracking-wider text-indigo-400">
                        Busiest Hour
                      </p>

                      <p className="mt-1 text-xl font-bold text-white">
                        {report.busiestHour ?? "-"}
                      </p>

                      <p className="text-xs text-slate-400 mt-1">
                        {report.busiestHourAppointmentCount ?? 0} appointments
                      </p>

                    </div>

                    <div className="space-y-3 max-h-72 overflow-y-auto">

                      {report.peakHours &&
                      report.peakHours.length > 0 ? (

                        report.peakHours.map(
                          (item, index) => {

                            const maxCount =
                              Math.max(
                                ...report.peakHours.map(
                                  (x) =>
                                    Number(
                                      x.appointmentCount
                                    ) || 0
                                )
                              );

                            const count =
                              Number(
                                item.appointmentCount
                              ) || 0;

                            const width =
                              maxCount > 0
                                ? (count / maxCount) * 100
                                : 0;

                            return (
                              <div
                                key={index}
                                className="flex items-center gap-3"
                              >

                                <span className="w-28 text-xs text-slate-400">
                                  {item.hour}
                                </span>

                                <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">

                                  <div
                                    className="h-full bg-indigo-500 rounded-full"
                                    style={{
                                      width: `${width}%`,
                                    }}
                                  />

                                </div>

                                <span className="w-8 text-right text-xs font-semibold text-slate-300">
                                  {count}
                                </span>

                              </div>
                            );
                          }
                        )

                      ) : (

                        <p className="text-sm text-slate-500 text-center py-8">
                          No appointment time data available.
                        </p>

                      )}

                    </div>

                  </div>

                </div>

              </div>

              {/* WAITING TIME ANALYSIS */}

              <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden mb-8">

                <div className="px-6 py-4 border-b border-slate-800">

                  <h2 className="text-sm font-semibold tracking-widest text-indigo-400 uppercase">
                    Waiting Time Analysis
                  </h2>

                  <p className="text-xs text-slate-500 mt-1">
                    Queue waiting-time monitoring and prediction
                  </p>

                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">

                  <div className="p-5 rounded-xl bg-slate-800/50 border border-slate-700">

                    <p className="text-xs uppercase tracking-wider text-slate-500">
                      Average Waiting Time
                    </p>

                    <p className="mt-2 text-3xl font-bold text-sky-400">
                      {formatMinutes(
                        report.averageWaitingTime
                      )}
                    </p>

                    <p className="mt-2 text-xs text-slate-500">
                      Calculated from queue token estimated waiting times.
                    </p>

                  </div>

                  <div className="p-5 rounded-xl bg-slate-800/50 border border-slate-700">

                    <p className="text-xs uppercase tracking-wider text-slate-500">
                      AI / Data Prediction
                    </p>

                    <p className="mt-2 text-3xl font-bold text-purple-400">
                      {formatMinutes(
                        report.predictedWaitingTime
                      )}
                    </p>

                    <p className="mt-2 text-xs text-slate-500">
                      Estimated using current queue demand and historical waiting data.
                    </p>

                  </div>

                </div>

              </div>

              {/* DECISION SUPPORT */}

              <div className="bg-slate-900 border border-indigo-500/20 rounded-2xl overflow-hidden">

                <div className="px-6 py-4 border-b border-slate-800">

                  <h2 className="text-sm font-semibold tracking-widest text-indigo-400 uppercase">
                    Decision Support
                  </h2>

                  <p className="text-xs text-slate-500 mt-1">
                    Operational recommendation based on current queue conditions
                  </p>

                </div>

                <div className="p-6">

                  <div className="flex items-start gap-4">

                    <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center flex-shrink-0">

                      <svg
                        className="w-5 h-5 text-indigo-400"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                      >

                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M9.5 3.5h5l1 3 3 1v5l-3 1-1 3h-5l-1-3-3-1v-5l3-1 1-3Z"
                        />

                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M10 10h4M12 8v4"
                        />

                      </svg>

                    </div>

                    <div>

                      <h3 className="text-sm font-semibold text-white">
                        Recommended Action
                      </h3>

                      <p className="mt-2 text-sm text-slate-400 leading-relaxed">
                        {report.decisionSupportMessage ||
                          "No recommendation available."}
                      </p>

                    </div>

                  </div>

                </div>

              </div>

              {/* ACTION BUTTONS */}

              <div className="mt-6 flex justify-end gap-3">

                <button
                  onClick={loadReport}
                  disabled={loading}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-semibold px-4 py-2 rounded-lg transition-colors border border-slate-700"
                >
                  Refresh Report
                </button>

                <button
                  onClick={generateReport}
                  disabled={!report || generating}
                  className={`inline-flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-lg transition-colors
                    ${
                      !report || generating
                        ? "bg-slate-700 text-slate-400 cursor-not-allowed"
                        : "bg-emerald-600 hover:bg-emerald-500 text-white"
                    }
                  `}
                >

                  {generating ? (
                    <>
                      <svg
                        className="w-4 h-4 animate-spin"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />

                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                        />
                      </svg>

                      Generating...
                    </>
                  ) : (
                    <>
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M12 3v12m0 0 4-4m-4 4-4-4M5 21h14"
                        />
                      </svg>

                      Generate Report
                    </>
                  )}

                </button>

              </div>

            </>
          )}

        </main>

      </div>

    </div>
  );
}


// =============================================================
// STATUS ROW
// =============================================================

function StatusRow({
  label,
  value,
}) {
  return (
    <div className="flex items-center justify-between">

      <span className="text-sm text-slate-400">
        {label}
      </span>

      <span className="text-sm font-bold text-white">
        {value ?? 0}
      </span>

    </div>
  );
}


export default Reports;