import { useEffect, useState } from "react";

import StaffSidebar from "../components/StaffSidebar";
import StaffTopbar from "../components/StaffTopbar";
import api from "../services/api";

const statusStyles = {
    Arrived:
        "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400",

    Delayed:
        "bg-amber-500/10 border border-amber-500/20 text-amber-400",

    Unavailable:
        "bg-slate-700/50 border border-slate-700 text-slate-400"
};

function StatusBadge({ status }) {

    const style =
        statusStyles[status] ||
        statusStyles.Unavailable;

    return (
        <span
            className={
                `inline-flex items-center px-2.5 py-0.5 ` +
                `rounded-full text-xs font-medium whitespace-nowrap ${style}`
            }
        >
            {status}
        </span>
    );
}

function StaffDoctorStatus() {

    const [allDoctors, setAllDoctors] = useState([]);
    const [todayDoctors, setTodayDoctors] = useState([]);

    const [doctorId, setDoctorId] = useState("");

    // IMPORTANT:
    // Do not default to Arrived.
    const [arrivalStatus, setArrivalStatus] = useState("");

    const [delayReason, setDelayReason] = useState("");

    const [msg, setMsg] = useState("");
    const [msgType, setMsgType] = useState("");

    const [doctorStatuses, setDoctorStatuses] = useState([]);

    function showMessage(text, type) {

        setMsg(text);
        setMsgType(type);

        setTimeout(() => {
            setMsg("");
        }, 3000);
    }

    // =========================================================
    // LOAD DATA
    // =========================================================

    useEffect(() => {

        loadDoctors();
        loadDoctorStatuses();

    }, []);

    // =========================================================
    // GET TODAY'S SCHEDULED DOCTORS
    // =========================================================

    async function loadDoctors() {

        try {

            const doctorRes =
                await api.get("/doctors");

            const scheduleRes =
                await api.get("/schedule");

            setAllDoctors(
                Array.isArray(doctorRes.data)
                    ? doctorRes.data
                    : []
            );

            const today =
                new Date().toLocaleDateString(
                    "en-CA",
                    {
                        timeZone: "Asia/Colombo"
                    }
                );

            const todayDoctorIds =
                scheduleRes.data
                    .filter(
                        (schedule) =>
                            schedule.availableDate === today
                    )
                    .map(
                        (schedule) =>
                            Number(schedule.doctorId)
                    );

            const filteredDoctors =
                doctorRes.data.filter(
                    (doctor) =>
                        todayDoctorIds.includes(
                            Number(doctor.doctorId)
                        )
                );

            setTodayDoctors(
                filteredDoctors
            );

        } catch (error) {

            console.error(
                "Failed to load doctors:",
                error
            );

            showMessage(
                "Failed to load doctors",
                "error"
            );
        }
    }

    // =========================================================
    // LOAD DOCTOR STATUS
    // =========================================================

    async function loadDoctorStatuses() {

        try {

            const response =
                await api.get("/doctor-status");

            const statuses =
                Array.isArray(response.data)
                    ? response.data
                    : [];

            setDoctorStatuses(
                statuses
            );

        } catch (error) {

            console.error(
                "Failed to load doctor statuses:",
                error
            );

            setDoctorStatuses([]);
        }
    }

    // =========================================================
    // GET TODAY STRING
    // =========================================================

    function getToday() {

        return new Date().toLocaleDateString(
            "en-CA",
            {
                timeZone: "Asia/Colombo"
            }
        );
    }

    // =========================================================
    // CHECK WHETHER STATUS WAS UPDATED TODAY
    // =========================================================

    function isStatusUpdatedToday(status) {

        if (!status?.updatedAt) {
            return false;
        }

        const updatedDate =
            new Date(
                status.updatedAt
            );

        const updatedDay =
            updatedDate.toLocaleDateString(
                "en-CA",
                {
                    timeZone: "Asia/Colombo"
                }
            );

        return updatedDay === getToday();
    }

    // =========================================================
    // GET TODAY'S STATUS FOR DOCTOR
    // =========================================================

    function getTodayDoctorStatus(doctorId) {

        const matchingStatuses =
            doctorStatuses
                .filter(
                    (status) =>
                        Number(status.doctorId) ===
                        Number(doctorId)
                )
                .filter(
                    (status) =>
                        isStatusUpdatedToday(status)
                )
                .sort(
                    (a, b) =>
                        new Date(b.updatedAt || 0) -
                        new Date(a.updatedAt || 0)
                );

        return (
            matchingStatuses[0] ||
            null
        );
    }

    // =========================================================
    // SAVE STATUS
    // =========================================================

    async function saveStatus() {

        if (!doctorId) {

            showMessage(
                "Select a doctor",
                "error"
            );

            return;
        }

        if (!arrivalStatus) {

            showMessage(
                "Select a doctor arrival status",
                "error"
            );

            return;
        }

        if (
            arrivalStatus === "Delayed" &&
            !delayReason.trim()
        ) {

            showMessage(
                "Enter a delay reason",
                "error"
            );

            return;
        }

        try {

            await api.post(
                "/doctor-status",
                {
                    doctorId:
                        Number(doctorId),

                    arrivalStatus:
                        arrivalStatus,

                    delayReason:
                        arrivalStatus === "Delayed"
                            ? delayReason.trim()
                            : null
                }
            );

            showMessage(
                arrivalStatus === "Delayed"
                    ? "Doctor marked as delayed. Waiting time will increase."
                    : "Doctor marked as arrived.",
                "success"
            );

            // Reset form.
            setDoctorId("");

            // IMPORTANT:
            // Do not reset to Arrived.
            setArrivalStatus("");

            setDelayReason("");

            // Refresh status table.
            await loadDoctorStatuses();

        } catch (error) {

            console.error(
                "Doctor status update error:",
                error
            );

            showMessage(
                error?.response?.data?.message ||
                error?.response?.data ||
                "Failed to update status",
                "error"
            );
        }
    }

    // =========================================================
    // DELETE STATUS
    // =========================================================

    async function remove(id) {

        try {

            await api.delete(
                `/doctor-status/${id}`
            );

            showMessage(
                "Status deleted",
                "success"
            );

            await loadDoctorStatuses();

        } catch (error) {

            console.error(
                "Delete status error:",
                error
            );

            showMessage(
                "Delete failed",
                "error"
            );
        }
    }

    // =========================================================
    // DOCTOR HELPERS
    // =========================================================

    function getDoctor(id) {

        return allDoctors.find(
            (doctor) =>
                Number(doctor.doctorId) ===
                Number(id)
        );
    }

    function doctorName(id) {

        return (
            getDoctor(id)?.doctorName ||
            "—"
        );
    }

    function doctorSpecialization(id) {

        return (
            getDoctor(id)?.specialization ||
            "—"
        );
    }

    // =========================================================
    // TODAY'S ACTUAL STATUS UPDATES
    // =========================================================

    const visibleStatuses =
        doctorStatuses
            .filter(
                (status) =>
                    todayDoctors.some(
                        (doctor) =>
                            Number(doctor.doctorId) ===
                            Number(status.doctorId)
                    )
            )
            .filter(
                (status) =>
                    isStatusUpdatedToday(status)
            )
            .sort(
                (a, b) =>
                    new Date(b.updatedAt || 0) -
                    new Date(a.updatedAt || 0)
            );

    const inputClass =
        "w-full bg-slate-800 border border-slate-700 " +
        "text-white placeholder-slate-500 rounded-lg px-4 py-2.5 " +
        "text-sm focus:outline-none focus:border-teal-500 " +
        "focus:ring-1 focus:ring-teal-500/50 transition-colors " +
        "disabled:opacity-50 disabled:cursor-not-allowed";

    const cols = [
        "ID",
        "Doctor",
        "Specialization",
        "Status",
        "Delay Reason",
        "Updated At",
        "Actions"
    ];

    return (

        <div className="flex min-h-screen bg-slate-950">

            <StaffSidebar />

            <div className="flex-1 flex flex-col min-w-0">

                <StaffTopbar />

                <main className="flex-1 p-8">

                    {/* =================================================
                        HEADER
                    ================================================= */}

                    <div className="mb-8">

                        <span className="text-xs font-semibold text-teal-400 uppercase tracking-widest">
                            Coordination
                        </span>

                        <h1 className="text-2xl text-white font-bold mt-1">
                            Doctor Coordination
                        </h1>

                        <p className="text-slate-500 text-sm mt-1">
                            Update doctor arrival and delay information.
                        </p>

                    </div>

                    {/* =================================================
                        MESSAGE
                    ================================================= */}

                    {msg && (

                        <div
                            className={
                                `mb-6 px-4 py-3 rounded-xl text-sm ` +
                                `font-medium border flex items-center gap-2 ` +
                                `${
                                    msgType === "success"
                                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                                        : "bg-red-500/10 text-red-400 border-red-500/30"
                                }`
                            }
                        >

                            {msg}

                        </div>

                    )}

                    {/* =================================================
                        UPDATE DOCTOR STATUS
                    ================================================= */}

                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mb-6 relative overflow-hidden">

                        <div
                            className={
                                "absolute left-0 top-4 bottom-4 w-0.5 " +
                                "bg-gradient-to-b from-teal-400 to-teal-600 " +
                                "rounded-full"
                            }
                        />

                        <div className="flex items-center gap-2 mb-5">

                            <div className="w-7 h-7 rounded-lg bg-teal-600/10 border border-teal-500/20 flex items-center justify-center">

                                <svg
                                    className="w-3.5 h-3.5 text-teal-400"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                    />
                                </svg>

                            </div>

                            <h2 className="text-sm font-semibold text-teal-400 uppercase tracking-widest">
                                Update Doctor Status
                            </h2>

                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                            {/* DOCTOR */}

                            <div>

                                <label className="block text-xs font-medium text-slate-400 uppercase tracking-wide mb-1.5">
                                    Doctor
                                </label>

                                <div className="relative">

                                    <select
                                        value={doctorId}
                                        onChange={(e) => {

                                            setDoctorId(
                                                e.target.value
                                            );

                                            // Clear previous status
                                            // selection when doctor changes.
                                            setArrivalStatus("");

                                            setDelayReason("");
                                        }}
                                        className={
                                            inputClass +
                                            " appearance-none pr-10"
                                        }
                                    >

                                        <option value="">
                                            Select Doctor
                                        </option>

                                        {todayDoctors.map(
                                            (doctor) => (

                                                <option
                                                    key={doctor.doctorId}
                                                    value={doctor.doctorId}
                                                >
                                                    {doctor.doctorName}
                                                    {" "}
                                                    (
                                                    {doctor.specialization}
                                                    )
                                                </option>

                                            )
                                        )}

                                    </select>

                                    <svg
                                        className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M19 9l-7 7-7-7"
                                        />
                                    </svg>

                                </div>

                            </div>

                            {/* ARRIVAL STATUS */}

                            <div>

                                <label className="block text-xs font-medium text-slate-400 uppercase tracking-wide mb-1.5">
                                    Arrival Status
                                </label>

                                <div className="relative">

                                    <select
                                        value={arrivalStatus}
                                        onChange={(e) =>
                                            setArrivalStatus(
                                                e.target.value
                                            )
                                        }
                                        disabled={!doctorId}
                                        className={
                                            inputClass +
                                            " appearance-none pr-10"
                                        }
                                    >

                                        <option value="">
                                            Select Status
                                        </option>

                                        <option value="Arrived">
                                            Arrived
                                        </option>

                                        <option value="Delayed">
                                            Delayed
                                        </option>

                                    </select>

                                    <svg
                                        className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M19 9l-7 7-7-7"
                                        />
                                    </svg>

                                </div>

                            </div>

                            {/* DELAY REASON */}

                            <div>

                                <label
                                    className={
                                        `block text-xs font-medium uppercase ` +
                                        `tracking-wide mb-1.5 ${
                                            arrivalStatus === "Delayed"
                                                ? "text-slate-400"
                                                : "text-slate-600"
                                        }`
                                    }
                                >
                                    Delay Reason
                                </label>

                                <input
                                    type="text"
                                    placeholder="e.g. Stuck in traffic"
                                    value={delayReason}
                                    onChange={(e) =>
                                        setDelayReason(
                                            e.target.value
                                        )
                                    }
                                    disabled={
                                        arrivalStatus !==
                                        "Delayed"
                                    }
                                    className={inputClass}
                                />

                            </div>

                        </div>

                        <button
                            onClick={saveStatus}
                            disabled={
                                !doctorId ||
                                !arrivalStatus
                            }
                            className={
                                "mt-5 bg-teal-600 hover:bg-teal-500 " +
                                "active:bg-teal-700 text-white text-sm " +
                                "font-semibold px-6 py-2.5 rounded-lg " +
                                "transition-colors focus:outline-none " +
                                "focus:ring-2 focus:ring-teal-500 " +
                                "focus:ring-offset-2 " +
                                "focus:ring-offset-slate-900 " +
                                "disabled:opacity-50 disabled:cursor-not-allowed"
                            }
                        >
                            Update Status
                        </button>

                    </div>

                    {/* =================================================
                        TODAY'S STATUS TABLE
                    ================================================= */}

                    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">

                        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">

                            <div>

                                <h2 className="text-sm font-semibold text-teal-400 uppercase tracking-widest">
                                    Today's Status Updates
                                </h2>

                                <p className="text-xs text-slate-500 mt-0.5">
                                    {visibleStatuses.length}
                                    {" "}
                                    update
                                    {visibleStatuses.length !== 1
                                        ? "s"
                                        : ""}
                                    {" "}
                                    for today's doctors
                                </p>

                            </div>

                        </div>

                        <div className="overflow-x-auto">

                            {visibleStatuses.length === 0 ? (

                                <div className="flex flex-col items-center justify-center py-16 text-center">

                                    <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center mb-3">

                                        <svg
                                            className="w-5 h-5 text-slate-500"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                            />
                                        </svg>

                                    </div>

                                    <p className="text-sm text-slate-400 font-medium">
                                        No status updates yet
                                    </p>

                                    <p className="text-xs text-slate-600 mt-1">
                                        Scheduled doctors remain unavailable
                                        until their status is updated.
                                    </p>

                                </div>

                            ) : (

                                <table className="w-full text-sm">

                                    <thead>

                                        <tr className="border-b border-slate-800">

                                            {cols.map(
                                                (col) => (

                                                    <th
                                                        key={col}
                                                        className={
                                                            "px-5 py-3 text-left " +
                                                            "text-xs font-semibold " +
                                                            "text-slate-500 uppercase " +
                                                            "tracking-wider whitespace-nowrap"
                                                        }
                                                    >
                                                        {col}
                                                    </th>

                                                )
                                            )}

                                        </tr>

                                    </thead>

                                    <tbody>

                                        {visibleStatuses.map(
                                            (status) => (

                                                <tr
                                                    key={
                                                        status.statusId
                                                    }
                                                    className={
                                                        "border-t border-slate-800/60 " +
                                                        "hover:bg-slate-800/40 " +
                                                        "transition-colors"
                                                    }
                                                >

                                                    <td className="px-5 py-3.5 text-slate-500 font-mono text-xs">
                                                        {status.statusId}
                                                    </td>

                                                    <td className="px-5 py-3.5 text-white font-medium whitespace-nowrap">
                                                        {doctorName(
                                                            status.doctorId
                                                        )}
                                                    </td>

                                                    <td className="px-5 py-3.5 text-slate-300 whitespace-nowrap">
                                                        {doctorSpecialization(
                                                            status.doctorId
                                                        )}
                                                    </td>

                                                    <td className="px-5 py-3.5 whitespace-nowrap">

                                                        <StatusBadge
                                                            status={
                                                                status.arrivalStatus
                                                            }
                                                        />

                                                    </td>

                                                    <td className="px-5 py-3.5 text-slate-300 whitespace-nowrap">
                                                        {
                                                            status.delayReason ||
                                                            "—"
                                                        }
                                                    </td>

                                                    <td className="px-5 py-3.5 text-slate-400 text-xs whitespace-nowrap">
                                                        {
                                                            status.updatedAt
                                                                ? new Date(
                                                                      status.updatedAt
                                                                  ).toLocaleString()
                                                                : "—"
                                                        }
                                                    </td>

                                                    <td className="px-5 py-3.5 whitespace-nowrap">

                                                        <button
                                                            onClick={() =>
                                                                remove(
                                                                    status.statusId
                                                                )
                                                            }
                                                            className={
                                                                "text-xs font-medium px-3 py-1.5 " +
                                                                "rounded-lg bg-red-500/10 " +
                                                                "border border-red-500/20 " +
                                                                "text-red-400 hover:bg-red-500/20 " +
                                                                "transition-colors"
                                                            }
                                                        >
                                                            Delete
                                                        </button>

                                                    </td>

                                                </tr>

                                            )
                                        )}

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