import { useEffect, useMemo, useState } from "react";

import api from "../services/api";

import StaffSidebar from "../components/StaffSidebar";
import StaffTopbar from "../components/StaffTopbar";

function StaffQueue() {

    const [queues, setQueues] = useState([]);
    const [todayDoctors, setTodayDoctors] = useState([]);
    const [doctorStatuses, setDoctorStatuses] = useState([]);
    const [selectedDoctor, setSelectedDoctor] = useState("");

    // =========================================================
    // FILTER QUEUE BY SELECTED DOCTOR
    // =========================================================

    const filteredQueues = useMemo(() => {

        // No doctor selected
        // Show all queues
        if (!selectedDoctor) {
            return queues;
        }

        const doctorId = Number(selectedDoctor);

        return queues.filter(queue => {

            return Number(queue.doctorId) === doctorId;

        });

    }, [queues, selectedDoctor]);

    const [loading, setLoading] = useState(false);
    const [actionLoading, setActionLoading] = useState(null);

    const [message, setMessage] = useState("");
    const [messageType, setMessageType] = useState("error");

    const [transferQueueId, setTransferQueueId] = useState(null);
    const [transferDoctorId, setTransferDoctorId] = useState("");
    const [transferReason, setTransferReason] = useState("");
    const [transferDoctors, setTransferDoctors] = useState([]);
    const [transferLoading, setTransferLoading] = useState(false);


    // =========================================================
    // SHOW MESSAGE
    // =========================================================

    function showMessage(
        text,
        type = "error"
    ) {

        setMessage(text);
        setMessageType(type);

        setTimeout(() => {
            setMessage("");
        }, 3000);
    }


    // =========================================================
    // GET BACKEND ERROR MESSAGE
    // =========================================================

    function getErrorMessage(
        err,
        fallback
    ) {

        if (
            err?.response?.data?.message
        ) {

            return err.response.data.message;
        }

        if (
            typeof err?.response?.data === "string" &&
            err.response.data.trim()
        ) {

            return err.response.data;
        }

        if (
            err?.response?.status === 400
        ) {

            return "The queue action could not be completed.";
        }

        if (
            err?.response?.status === 404
        ) {

            return "Queue record was not found.";
        }

        if (
            err?.response?.status === 500
        ) {

            return "A server error occurred.";
        }

        if (err?.message) {

            return err.message;
        }

        return fallback;
    }


    // =========================================================
    // LOAD QUEUE
    // =========================================================

    async function loadQueue() {

    try {

        setLoading(true);

        const response =
            await api.get(
                "/staff-queue"
            );

        setQueues(
            Array.isArray(response.data)
                ? response.data
                : []
        );

    } catch (error) {

        console.error(
            "Failed to load queue:",
            error
        );

        setQueues([]);

    } finally {

        setLoading(false);
    }
}


    // =========================================================
// LOAD TODAY'S DOCTORS
// =========================================================

    async function loadTodayDoctors() {

    try {

        const [
            scheduleResponse,
            doctorResponse,
            statusResponse
        ] = await Promise.all([

            api.get("/schedule/today"),

            api.get("/doctors"),

            api.get("/doctor-status")

        ]);

        const schedules =
            Array.isArray(scheduleResponse.data)
                ? scheduleResponse.data
                : [];

        const doctors =
            Array.isArray(doctorResponse.data)
                ? doctorResponse.data
                : [];

        const statuses =
            Array.isArray(statusResponse.data)
                ? statusResponse.data
                : [];


        // =====================================================
        // TODAY'S DATE
        // =====================================================

        const today =
            new Date()
                .toISOString()
                .split("T")[0];


        // =====================================================
        // ONLY USE DOCTOR STATUS UPDATED TODAY
        //
        // This prevents yesterday's "Arrived" status from
        // being used for today's schedule.
        // =====================================================

        const todayStatuses =
            statuses.filter(status => {

                if (!status?.updatedAt) {
                    return false;
                }

                const statusDate =
                    new Date(status.updatedAt)
                        .toISOString()
                        .split("T")[0];

                return statusDate === today;

            });


        // =====================================================
        // BUILD LATEST TODAY STATUS MAP
        //
        // doctorId -> latest status TODAY
        // =====================================================

        const latestStatusByDoctor =
            new Map();


        todayStatuses.forEach(status => {

            if (status?.doctorId == null) {
                return;
            }


            const doctorId =
                Number(status.doctorId);


            const current =
                latestStatusByDoctor.get(
                    doctorId
                );


            if (!current) {

                latestStatusByDoctor.set(
                    doctorId,
                    status
                );

                return;
            }


            const currentTime =
                current.updatedAt
                    ? new Date(
                        current.updatedAt
                    ).getTime()
                    : 0;


            const newTime =
                status.updatedAt
                    ? new Date(
                        status.updatedAt
                    ).getTime()
                    : 0;


            if (newTime >= currentTime) {

                latestStatusByDoctor.set(
                    doctorId,
                    status
                );

            }

        });


        // =====================================================
        // ONLY DOCTORS SCHEDULED TODAY
        // =====================================================

        const todayDoctorList =
            doctors
                .filter(doctor => {

                    return schedules.some(
                        schedule => {

                            const scheduleDoctorId =
                                Number(
                                    schedule.doctorId
                                );


                            const scheduleDate =
                                String(
                                    schedule.availableDate || ""
                                )
                                    .split("T")[0];


                            return (
                                scheduleDoctorId ===
                                    Number(
                                        doctor.doctorId
                                    ) &&
                                scheduleDate === today
                            );

                        }
                    );

                })
                .map(doctor => {


                    const latestStatus =
                        latestStatusByDoctor.get(
                            Number(
                                doctor.doctorId
                            )
                        );


                    return {

                        ...doctor,


                        // =================================================
                        // IMPORTANT
                        //
                        // No status updated TODAY means the doctor
                        // has NOT arrived today.
                        // =================================================

                        doctorStatus:
                            latestStatus?.arrivalStatus ||
                            "Unavailable",


                        doctorStatusUpdatedAt:
                            latestStatus?.updatedAt ||
                            null,


                        delayReason:
                            latestStatus?.delayReason ||
                            null

                    };

                });


        setTodayDoctors(
            todayDoctorList
        );


    } catch (err) {

        console.error(
            "Failed to load today's doctors:",
            err
        );


        setTodayDoctors([]);


        showMessage(
            getErrorMessage(
                err,
                "Failed to load today's doctors."
            ),
            "error"
        );

    }

}

    // =========================================================
// LOAD SUITABLE EMERGENCY TRANSFER DOCTORS
// =========================================================

    async function loadTransferDoctors(queue) {

    try {

        setTransferLoading(true);
        setTransferDoctors([]);

        // -----------------------------------------------------
        // Validate queue
        // -----------------------------------------------------

        if (!queue) {
            throw new Error(
                "Queue information is missing."
            );
        }

        const currentDoctorId =
            Number(queue.doctorId);

        if (!currentDoctorId) {
            throw new Error(
                "Current doctor information is missing."
            );
        }

        // -----------------------------------------------------
        // Load doctors, today's schedules and doctor statuses
        // -----------------------------------------------------

        const [
            doctorResponse,
            scheduleResponse,
            statusResponse
        ] = await Promise.all([

            api.get("/doctors"),

            api.get("/schedule/today"),

            api.get("/doctor-status")

        ]);

        const doctors =
            Array.isArray(doctorResponse.data)
                ? doctorResponse.data
                : [];

        const schedules =
            Array.isArray(scheduleResponse.data)
                ? scheduleResponse.data
                : [];

        const allStatuses =
            Array.isArray(statusResponse.data)
                ? statusResponse.data
                : [];

        // -----------------------------------------------------
        // Find current doctor
        // -----------------------------------------------------

        const currentDoctor =
            doctors.find(
                doctor =>
                    Number(doctor.doctorId) ===
                    currentDoctorId
            );

        if (!currentDoctor) {
            throw new Error(
                "Current doctor could not be found."
            );
        }

        // -----------------------------------------------------
        // Current doctor's specialization
        // -----------------------------------------------------

        const currentSpecialization =
            String(
                currentDoctor.specialization || ""
            )
                .trim()
                .toLowerCase();

        if (!currentSpecialization) {
            throw new Error(
                "Current doctor's specialization is unavailable."
            );
        }

       // -----------------------------------------------------
        // Today's date
        // -----------------------------------------------------

        const today =
            new Date()
                .toISOString()
                .split("T")[0];


        // -----------------------------------------------------
        // ONLY USE DOCTOR STATUSES UPDATED TODAY
        // -----------------------------------------------------

        const statuses =
            allStatuses.filter(status => {

                if (!status?.updatedAt) {
                    return false;
                }

        const statusDate =
             new Date(status.updatedAt)
                .toISOString()
                .split("T")[0];

                return statusDate === today;

        });

        // -----------------------------------------------------
        // Find suitable doctors
        //
        // Requirements:
        // 1. Different doctor
        // 2. Same specialization
        // 3. Scheduled today
        // 4. Latest status is Arrived
        // -----------------------------------------------------

        const suitableDoctors =
            doctors.filter(
                doctor => {

                    const doctorId =
                        Number(
                            doctor.doctorId
                        );

                    // Cannot transfer to current doctor
                    if (
                        doctorId ===
                        currentDoctorId
                    ) {
                        return false;
                    }

                    // Same specialization required
                    const specialization =
                        String(
                            doctor.specialization || ""
                        )
                            .trim()
                            .toLowerCase();

                    if (
                        specialization !==
                        currentSpecialization
                    ) {
                        return false;
                    }

                    // Must be scheduled today
                    const scheduledToday =
                        schedules.some(
                            schedule => {

                                const scheduleDoctorId =
                                    Number(
                                        schedule.doctorId
                                    );

                                const scheduleDate =
                                    String(
                                        schedule.availableDate || ""
                                    )
                                        .split("T")[0];

                                return (
                                    scheduleDoctorId ===
                                        doctorId &&
                                    scheduleDate ===
                                        today
                                );
                            }
                        );

                    if (!scheduledToday) {
                        return false;
                    }

                    // -------------------------------------------------
                    // Get latest status for this doctor
                    // -------------------------------------------------

                    const doctorStatusesForDoctor =
                        statuses.filter(
                            status =>
                                Number(
                                    status.doctorId
                                ) === doctorId
                        );

                    const latestDoctorStatus =
                        doctorStatusesForDoctor
                            .sort(
                                (a, b) =>
                                    new Date(
                                        b.updatedAt || 0
                                    ) -
                                    new Date(
                                        a.updatedAt || 0
                                    )
                            )[0];

                    // -------------------------------------------------
                    // Doctor must currently be Arrived
                    // -------------------------------------------------

                    const latestArrivalStatus =
                        String(
                            latestDoctorStatus?.arrivalStatus || ""
                        )
                            .trim()
                            .toLowerCase();

                    return (
                        latestArrivalStatus ===
                        "arrived"
                    );
                }
            );

        setTransferDoctors(
            suitableDoctors
        );

        // -----------------------------------------------------
        // No suitable doctor
        // -----------------------------------------------------

        if (
            suitableDoctors.length === 0
        ) {

            showMessage(
                "No suitable arrived doctor with the same specialization is currently available.",
                "error"
            );
        }

    } catch (error) {

        console.error(
            "Failed to load suitable transfer doctors:",
            error
        );

        setTransferDoctors([]);

        showMessage(
            getErrorMessage(
                error,
                "Unable to load suitable emergency doctors."
            ),
            "error"
        );

    } finally {

        setTransferLoading(false);
    }
}

    // =========================================================
    // INITIAL LOAD
    // =========================================================

    useEffect(() => {

    loadTodayDoctors();

    const interval =
        setInterval(
            loadTodayDoctors,
            10000
        );

    return () => {
        clearInterval(interval);
    };

    }, []);

    // =========================================================
// GET LATEST STATUS FOR A DOCTOR
// =========================================================

    function getLatestDoctorStatus(
        doctorId,
        statuses
    ) {

        const doctorStatuses =
            statuses.filter(
                status =>
                    Number(status.doctorId) ===
                    Number(doctorId)
            );

        if (
            doctorStatuses.length === 0
        ) {

            return null;
        }

        return doctorStatuses
            .sort(
                (a, b) =>
                    new Date(
                        b.updatedAt || 0
                    ) -
                    new Date(
                        a.updatedAt || 0
                    )
            )[0];
    }


    // =========================================================
    // LOAD QUEUE WHEN DOCTOR CHANGES
    // =========================================================

    useEffect(() => {

    loadQueue();

    const interval =
        setInterval(
            loadQueue,
            5000
        );

    return () => {
        clearInterval(interval);
    };

    }, []);


    // =========================================================
    // CALL NEXT PATIENT
    // =========================================================

    async function callNext() {

        if (!selectedDoctor) {

            showMessage(
                "Please select a doctor first.",
                "error"
            );

            return;
        }


        try {

            setActionLoading("call-next");


            await api.put(
                "/staff-queue/call-next",
                null,
                {
                    params: {
                        doctorId: selectedDoctor
                    }
                }
            );


            showMessage(
                "Next patient called successfully.",
                "success"
            );


            await loadQueue();

        } catch (err) {

            console.error(
                "Call next error:",
                err
            );

            showMessage(
                getErrorMessage(
                    err,
                    "Unable to call the next patient."
                ),
                "error"
            );

        } finally {

            setActionLoading(null);
        }
    }


    // =========================================================
    // SKIP PATIENT
    // =========================================================

    async function skipPatient(
        queueId
    ) {

        if (!queueId) {

            showMessage(
                "Invalid queue ID.",
                "error"
            );

            return;
        }


        try {

            setActionLoading(queueId);


            await api.put(
                `/staff-queue/skip/${queueId}`
            );


            showMessage(
                "Patient skipped successfully.",
                "success"
            );


            await loadQueue();

        } catch (err) {

            console.error(
                "Skip error:",
                err
            );

            showMessage(
                getErrorMessage(
                    err,
                    "Unable to skip patient."
                ),
                "error"
            );

        } finally {

            setActionLoading(null);
        }
    }


    // =========================================================
    // COMPLETE PATIENT
    // =========================================================

    async function completePatient(
        queueId
    ) {

        if (!queueId) {

            showMessage(
                "Invalid queue ID.",
                "error"
            );

            return;
        }


        try {

            setActionLoading(queueId);


            await api.put(
                `/staff-queue/complete/${queueId}`
            );


            showMessage(
                "Patient completed successfully.",
                "success"
            );


            await loadQueue();

        } catch (err) {

            console.error(
                "Complete error:",
                err
            );

            showMessage(
                getErrorMessage(
                    err,
                    "Unable to complete patient."
                ),
                "error"
            );

        } finally {

            setActionLoading(null);
        }
    }


    // =========================================================
    // UPDATE QUEUE STATUS
    // =========================================================

    async function updateStatus(
        queueId,
        status
    ) {

        if (!queueId) {

            showMessage(
                "Invalid queue ID.",
                "error"
            );

            return;
        }


        try {

            setActionLoading(queueId);


            await api.put(
                `/staff-queue/status/${queueId}`,
                null,
                {
                    params: {
                        status: status
                    }
                }
            );


            showMessage(
                `Status updated to ${status}.`,
                "success"
            );


            await loadQueue();

        } catch (err) {

            console.error(
                "Update status error:",
                err
            );

            showMessage(
                getErrorMessage(
                    err,
                    "Unable to update queue status."
                ),
                "error"
            );

        } finally {

            setActionLoading(null);
        }
    }

    // =========================================================
// EMERGENCY TRANSFER
// =========================================================

async function transferEmergency() {

    if (!transferQueueId) {

        showMessage(
            "Invalid queue ID.",
            "error"
        );

        return;
    }

    if (!transferDoctorId) {

        showMessage(
            "Please select a suitable replacement doctor.",
            "error"
        );

        return;
    }

    if (
        !transferReason ||
        transferReason.trim() === ""
    ) {

        showMessage(
            "Please enter the emergency transfer reason.",
            "error"
        );

        return;
    }

    try {

        setActionLoading(
            `transfer-${transferQueueId}`
        );

        const request = {

            queueId: Number(
                transferQueueId
            ),

            newDoctorId: Number(
                transferDoctorId
            ),

            reason: transferReason.trim()
        };

        await api.put(
            "/staff-queue/transfer-emergency",
            request
        );

        showMessage(
            "Emergency patient transferred successfully.",
            "success"
        );

        setTransferQueueId(null);
        setTransferDoctorId("");
        setTransferReason("");
        setTransferDoctors([]);

        await loadQueue();

    } catch (err) {

        console.error(
            "Emergency transfer error:",
            err
        );

        showMessage(
            getErrorMessage(
                err,
                "Emergency transfer failed."
            ),
            "error"
        );

    } finally {

        setActionLoading(null);
    }
}

// =========================================================
// GET DOCTOR STATUS
// =========================================================

    function getDoctorStatus(doctorId) {

        const doctor =
            todayDoctors.find(
                item =>
                    Number(item.doctorId) ===
                    Number(doctorId)
            );

        if (!doctor) {
            return "Unavailable";
        }

        const status =
            String(
                doctor.doctorStatus ||
                "Unavailable"
            )
                .trim()
                .toLowerCase();

        switch (status) {

            case "arrived":
                return "Arrived";

            case "delayed":
                return "Delayed";

            case "unavailable":
            default:
                return "Unavailable";
        }
    }

// =========================================================
// STATUS STYLE
// =========================================================

    function getStatusClass(
        status
    ) {

        switch (
            String(status).toLowerCase()
        ) {

            case "waiting":

                return (
                    "bg-slate-700 " +
                    "text-slate-200"
                );


            case "serving":

                return (
                    "bg-blue-500/20 " +
                    "text-blue-400 " +
                    "border border-blue-500/30"
                );


            case "completed":

                return (
                    "bg-emerald-500/20 " +
                    "text-emerald-400 " +
                    "border border-emerald-500/30"
                );


            case "skipped":

                return (
                    "bg-amber-500/20 " +
                    "text-amber-400 " +
                    "border border-amber-500/30"
                );


            case "cancelled":

                return (
                    "bg-red-500/20 " +
                    "text-red-400 " +
                    "border border-red-500/30"
                );


            default:

                return (
                    "bg-slate-700 " +
                    "text-white"
                );
        }
    }


    // =========================================================
// PRIORITY STYLE
// =========================================================

    function getPriorityClass(priority) {

        const value =
            String(priority || "Normal")
                .trim()
                .toLowerCase();


        // Emergency - highest priority
        if (value === "emergency") {

            return (
                "bg-red-500/20 " +
                "text-red-400 " +
                "border border-red-500/30"
            );
        }


        // Elderly
        if (value === "elderly") {

            return (
                "bg-sky-500/20 " +
                "text-sky-400 " +
                "border border-sky-500/30"
            );
        }


        // Special Needs
        if (
            value === "special needs" ||
            value === "specialneeds"
        ) {

            return (
                "bg-purple-500/20 " +
                "text-purple-400 " +
                "border border-purple-500/30"
            );
        }


        // Normal
        return (
            "bg-slate-700 " +
            "text-slate-200"
        );
    }

    // =========================================================
    // RENDER
    // =========================================================

    return (

        <div className="flex min-h-screen bg-slate-950">

            {/* =================================================
                SIDEBAR
            ================================================= */}

            <StaffSidebar />


            <div className="flex-1 flex flex-col min-w-0">

                {/* =================================================
                    TOPBAR
                ================================================= */}

                <StaffTopbar />


                <main className="p-8">

                    {/* =================================================
                        MESSAGE
                    ================================================= */}

                    {message && (

                        <div
                            className={`
                                mb-6
                                px-4
                                py-3
                                rounded-xl
                                text-sm
                                font-medium
                                border

                                ${
                                    messageType === "success"
                                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                                        : "bg-red-500/10 text-red-400 border-red-500/30"
                                }
                            `}
                        >

                            {message}

                        </div>
                    )}


                    {/* =================================================
                        HEADER
                    ================================================= */}

                    <div
                        className="
                            flex
                            flex-col
                            lg:flex-row
                            lg:justify-between
                            lg:items-center
                            gap-5
                            mb-8
                        "
                    >

                        <div>

                            <span
                                className="
                                    text-xs
                                    font-semibold
                                    text-teal-400
                                    uppercase
                                    tracking-widest
                                "
                            >
                                Queue
                            </span>


                            <h1
                                className="
                                    text-3xl
                                    font-bold
                                    text-white
                                    mt-1
                                "
                            >
                                Manage Queue
                            </h1>


                            <p
                                className="
                                    text-slate-400
                                    mt-2
                                "
                            >
                                Call, skip, complete and update
                                patient queue status.
                            </p>

                        </div>


                        {/* =================================================
                            DOCTOR + CALL NEXT
                        ================================================= */}

                        <div
                            className="
                                flex
                                flex-col
                                sm:flex-row
                                gap-3
                                items-stretch
                                sm:items-center
                            "
                        >

                            {selectedDoctor && (
                                <div className="flex items-center gap-2">

                                    <span className="text-xs text-slate-500">
                                        Doctor status:
                                    </span>

                                    <span
                                        className={`
                                            px-2.5
                                            py-1
                                            rounded-full
                                            text-xs
                                            font-semibold
                                            border

                                            ${
                                                getDoctorStatus(selectedDoctor) === "Arrived"
                                                    ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                                                    : getDoctorStatus(selectedDoctor) === "Delayed"
                                                    ? "bg-amber-500/20 text-amber-400 border-amber-500/30"
                                                    : "bg-red-500/20 text-red-400 border-red-500/30"
                                            }
                                        `}
                                    >
                                        {getDoctorStatus(selectedDoctor)}
                                    </span>

                                </div>
                            )}

                            {/* DOCTOR SELECT */}

                            <select
                                value={selectedDoctor}
                                onChange={(e) =>
                                    setSelectedDoctor(
                                        e.target.value
                                    )
                                }
                                className="
                                    bg-slate-800
                                    text-white
                                    px-4
                                    py-3
                                    rounded-xl
                                    border
                                    border-slate-700
                                    focus:outline-none
                                    focus:border-teal-500
                                "
                            >

                                <option value="">
                                    Select Doctor
                                </option>


                                {todayDoctors.map(
                                    (doctor) => (

                                        <option
                                            key={
                                                doctor.doctorId
                                            }
                                            value={
                                                doctor.doctorId
                                            }
                                        >
                                            {
                                                doctor.doctorName
                                            }
                                        </option>

                                    )
                                )}

                            </select>


                            {/* CALL NEXT */}

                            <button
                                onClick={callNext}
                                disabled={
                                    !selectedDoctor ||
                                    getDoctorStatus(selectedDoctor) !== "Arrived" ||
                                    actionLoading === "call-next"
                                }
                                className="
                                    px-5
                                    py-3
                                    bg-teal-600
                                    hover:bg-teal-500
                                    disabled:bg-slate-700
                                    disabled:text-slate-500
                                    disabled:cursor-not-allowed
                                    text-white
                                    rounded-xl
                                    font-semibold
                                    transition
                                "
                            >
                                {actionLoading === "call-next"
                                    ? "Calling..."
                                    : "Call Next Patient"
                                }
                            </button>

                        </div>

                    </div>


                    {/* =================================================
                        QUEUE TABLE
                    ================================================= */}

                    <div
                        className="
                            bg-slate-900
                            rounded-2xl
                            border
                            border-slate-800
                            overflow-hidden
                        "
                    >

                        {/* =================================================
                            TABLE HEADER
                        ================================================= */}

                        <div
                            className="
                                px-6
                                py-4
                                border-b
                                border-slate-800
                            "
                        >

                            <h2
                                className="
                                    text-sm
                                    font-semibold
                                    text-teal-400
                                    uppercase
                                    tracking-widest
                                "
                            >
                                Queue Patients
                            </h2>


                            <p
                                className="
                                    text-xs
                                    text-slate-500
                                    mt-1
                                "
                            >

                                {filteredQueues.length} patient
                                {filteredQueues.length !== 1
                                    ? "s"
                                    : ""
                                } in queue

                            </p>

                        </div>


                        {/* =================================================
                            TABLE
                        ================================================= */}

                        <div
                            className="
                                overflow-x-auto
                            "
                        >

                            {/* LOADING */}

                            {loading &&
                            filteredQueues.length === 0 ? (

                                <div
                                    className="
                                        py-16
                                        text-center
                                    "
                                >

                                    <p
                                        className="
                                            text-slate-400
                                        "
                                    >
                                        Loading queue...
                                    </p>

                                </div>

                            ) : filteredQueues.length === 0 ? (

                                /* EMPTY */

                                <div
                                    className="
                                        py-16
                                        text-center
                                    "
                                >

                                    <p
                                        className="
                                            text-slate-400
                                        "
                                    >
                                        {selectedDoctor
                                            ? "No patients in this doctor's queue."
                                            : "No patients in the queue."
                                        }
                                    </p>

                                </div>

                            ) : (

                                <table className="w-full">

                                    {/* =================================================
                                        TABLE HEAD
                                    ================================================= */}

                                    <thead
                                        className="
                                            bg-slate-800
                                        "
                                    >

                                        <tr>

                                            <th
                                                className="
                                                    p-4
                                                    text-left
                                                    text-xs
                                                    font-semibold
                                                    text-slate-400
                                                    uppercase
                                                "
                                            >
                                                Token
                                            </th>


                                            <th
                                                className="
                                                    p-4
                                                    text-left
                                                    text-xs
                                                    font-semibold
                                                    text-slate-400
                                                    uppercase
                                                "
                                            >
                                                Patient
                                            </th>


                                            <th
                                                className="
                                                    p-4
                                                    text-left
                                                    text-xs
                                                    font-semibold
                                                    text-slate-400
                                                    uppercase
                                                "
                                            >
                                                Doctor
                                            </th>


                                            <th
                                                className="
                                                    p-4
                                                    text-left
                                                    text-xs
                                                    font-semibold
                                                    text-slate-400
                                                    uppercase
                                                "
                                            >
                                                Status
                                            </th>


                                            <th
                                                className="
                                                    p-4
                                                    text-left
                                                    text-xs
                                                    font-semibold
                                                    text-slate-400
                                                    uppercase
                                                "
                                            >
                                                Priority
                                            </th>


                                            <th
                                                className="
                                                    p-4
                                                    text-left
                                                    text-xs
                                                    font-semibold
                                                    text-slate-400
                                                    uppercase
                                                "
                                            >
                                                Wait Time
                                            </th>


                                            <th
                                                className="
                                                    p-4
                                                    text-left
                                                    text-xs
                                                    font-semibold
                                                    text-slate-400
                                                    uppercase
                                                "
                                            >
                                                Actions
                                            </th>

                                        </tr>

                                    </thead>


                                    {/* =================================================
                                        TABLE BODY
                                    ================================================= */}

                                    <tbody>

                                        {filteredQueues.map(
                                            (queue) => {

                                                const status =
                                                    String(
                                                        queue.queueStatus ||
                                                        "Waiting"
                                                    );


                                                const normalizedStatus =
                                                    status.toLowerCase();


                                                const processing =
                                                    actionLoading ===
                                                    queue.queueId;


                                                const isCompleted =
                                                    normalizedStatus ===
                                                    "completed";


                                                const isCancelled =
                                                    normalizedStatus ===
                                                    "cancelled";


                                                const isSkipped =
                                                    normalizedStatus ===
                                                    "skipped";


                                                return (

                                                    <tr
                                                        key={
                                                            queue.queueId
                                                        }
                                                        className="
                                                            border-t
                                                            border-slate-800
                                                            hover:bg-slate-800/50
                                                            transition
                                                        "
                                                    >

                                                        {/* =================================================
                                                            TOKEN
                                                        ================================================= */}

                                                        <td
                                                            className="
                                                                p-4
                                                            "
                                                        >

                                                            <span
                                                                className="
                                                                    font-bold
                                                                    text-white
                                                                "
                                                            >
                                                                {
                                                                    queue.tokenNumber ||
                                                                    "-"
                                                                }
                                                            </span>

                                                        </td>


                                                        {/* =================================================
                                                            PATIENT
                                                        ================================================= */}

                                                        <td
                                                            className="
                                                                p-4
                                                                text-white
                                                                font-medium
                                                            "
                                                        >

                                                            {
                                                                queue.patientName ||
                                                                "-"
                                                            }

                                                        </td>


                                                        {/* =================================================
                                                            DOCTOR
                                                        ================================================= */}

                                                        <td
                                                            className="
                                                                p-4
                                                                text-slate-300
                                                            "
                                                        >

                                                            {
                                                                queue.doctorName ||
                                                                "-"
                                                            }

                                                        </td>


                                                        {/* =================================================
                                                            STATUS
                                                        ================================================= */}

                                                        <td
                                                            className="
                                                                p-4
                                                            "
                                                        >

                                                            <span
                                                                className={`
                                                                    inline-flex
                                                                    px-3
                                                                    py-1
                                                                    rounded-full
                                                                    text-xs
                                                                    font-semibold
                                                                    ${getStatusClass(
                                                                        status
                                                                    )}
                                                                `}
                                                            >

                                                                {status}

                                                            </span>

                                                        </td>


                                                        {/* =================================================
                                                            PRIORITY
                                                        ================================================= */}

                                                        <td
                                                            className="
                                                                p-4
                                                            "
                                                        >

                                                            <span
                                                                className={`
                                                                    inline-flex
                                                                    px-3
                                                                    py-1
                                                                    rounded-full
                                                                    text-xs
                                                                    font-semibold
                                                                    ${getPriorityClass(
                                                                        queue.priorityType
                                                                    )}
                                                                `}
                                                            >

                                                                {
                                                                    queue.priorityType ||
                                                                    "Normal"
                                                                }

                                                            </span>

                                                        </td>


                                                        {/* =================================================
                                                            WAIT TIME
                                                        ================================================= */}

                                                        <td
                                                            className="
                                                                p-4
                                                                text-slate-300
                                                            "
                                                        >

                                                            <div className="flex flex-col gap-1">

                                                            <span className="text-slate-300">
                                                                {queue.estimatedWaitTime ?? 0} mins
                                                            </span>

                                                            {queue.doctorStatus === "Delayed" &&
                                                                queue.delayMinutes > 0 && (

                                                                <span className="text-xs text-amber-400">
                                                                    +{queue.delayMinutes} min delay
                                                                </span>

                                                            )}

                                                            </div>

                                                        </td>


                                                        {/* =================================================
                                                            ACTIONS
                                                        ================================================= */}

                                                        <td
                                                            className="
                                                                p-4
                                                            "
                                                        >

                                                            <div
                                                                className="
                                                                    flex
                                                                    gap-2
                                                                    flex-wrap
                                                                "
                                                            >

                                                                {/* =================================================
                                                                    COMPLETE
                                                                ================================================= */}

                                                                <button
                                                                    onClick={() =>
                                                                        completePatient(
                                                                            queue.queueId
                                                                        )
                                                                    }
                                                                    disabled={
                                                                        processing ||
                                                                        isCompleted ||
                                                                        isCancelled
                                                                    }
                                                                    className="
                                                                        px-3
                                                                        py-2
                                                                        bg-green-600
                                                                        hover:bg-green-700
                                                                        disabled:bg-slate-700
                                                                        disabled:text-slate-500
                                                                        rounded-lg
                                                                        text-white
                                                                        text-sm
                                                                        disabled:cursor-not-allowed
                                                                    "
                                                                >

                                                                    {
                                                                        processing
                                                                            ? "..."
                                                                            : "Complete"
                                                                    }

                                                                </button>


                                                                {/* =================================================
                                                                    SKIP
                                                                ================================================= */}

                                                                <button
                                                                    onClick={() =>
                                                                        skipPatient(
                                                                            queue.queueId
                                                                        )
                                                                    }
                                                                    disabled={
                                                                        processing ||
                                                                        isCompleted ||
                                                                        isCancelled ||
                                                                        isSkipped
                                                                    }
                                                                    className="
                                                                        px-3
                                                                        py-2
                                                                        bg-yellow-600
                                                                        hover:bg-yellow-700
                                                                        disabled:bg-slate-700
                                                                        disabled:text-slate-500
                                                                        rounded-lg
                                                                        text-white
                                                                        text-sm
                                                                        disabled:cursor-not-allowed
                                                                    "
                                                                >

                                                                    {
                                                                        processing
                                                                            ? "..."
                                                                            : "Skip"
                                                                    }

                                                                </button>

                                                                {["waiting", "serving"].includes(
                                                                    String(
                                                                        queue.queueStatus || ""
                                                                    )
                                                                        .trim()
                                                                        .toLowerCase()
                                                                ) &&
                                                                    String(
                                                                        queue.priorityType || ""
                                                                    )
                                                                        .trim()
                                                                        .toLowerCase() !== "emergency" && (

                                                                    <button
                                                                        onClick={async () => {

                                                                            setTransferQueueId(queue.queueId);
                                                                            setTransferDoctorId("");
                                                                            setTransferReason("");

                                                                            await loadTransferDoctors(queue);
                                                                        }}
                                                                        disabled={
                                                                            actionLoading ===
                                                                            `transfer-${queue.queueId}`
                                                                        }
                                                                        className="
                                                                            px-3
                                                                            py-2
                                                                            bg-red-600/20
                                                                            hover:bg-red-600
                                                                            border
                                                                            border-red-500/30
                                                                            text-red-400
                                                                            hover:text-white
                                                                            rounded-lg
                                                                            text-sm
                                                                            font-semibold
                                                                        "
                                                                    >
                                                                        Transfer
                                                                    </button>
                                                                )}

                                                                {/* =================================================
                                                                    UPDATE STATUS
                                                                ================================================= */}

                                                                <select
                                                                    value={
                                                                        queue.queueStatus ||
                                                                        "Waiting"
                                                                    }
                                                                    disabled={
                                                                        processing ||
                                                                        isCompleted ||
                                                                        isCancelled
                                                                    }
                                                                    onChange={(e) =>
                                                                        updateStatus(
                                                                            queue.queueId,
                                                                            e.target.value
                                                                        )
                                                                    }
                                                                    className="
                                                                        px-3
                                                                        py-2
                                                                        bg-slate-800
                                                                        border
                                                                        border-slate-700
                                                                        rounded-lg
                                                                        text-white
                                                                        text-sm
                                                                        outline-none
                                                                        disabled:opacity-50
                                                                        disabled:cursor-not-allowed
                                                                    "
                                                                >

                                                                    <option value="Waiting">
                                                                        Waiting
                                                                    </option>

                                                                    <option value="Serving">
                                                                        Serving
                                                                    </option>

                                                                    <option value="Skipped">
                                                                        Skipped
                                                                    </option>

                                                                    <option value="Completed">
                                                                        Completed
                                                                    </option>

                                                                    <option value="Cancelled">
                                                                        Cancelled
                                                                    </option>

                                                                </select>

                                                            </div>

                                                                                                                            {transferQueueId === queue.queueId && (
                                                            <div className="mt-3 p-3 bg-slate-800 border border-red-500/20 rounded-xl">

                                                                <p className="text-xs font-semibold text-red-400 uppercase tracking-wide mb-3">
                                                                Emergency Transfer
                                                                </p>

                                                                <div className="flex flex-col gap-2">
                                                                        {/* Transfer doctor dropdown */}
                                                                
                                                                <select
                                                                    value={transferDoctorId}
                                                                    onChange={(e) =>
                                                                        setTransferDoctorId(e.target.value)
                                                                    }
                                                                    disabled={transferLoading}
                                                                    className="
                                                                        bg-slate-900
                                                                        border
                                                                        border-slate-700
                                                                        text-white
                                                                        rounded-lg
                                                                        px-3
                                                                        py-2
                                                                        text-sm
                                                                        disabled:opacity-50
                                                                    "
                                                                >
                                                                    <option value="">
                                                                        {transferLoading
                                                                            ? "Loading suitable doctors..."
                                                                            : "Select suitable arrived doctor"
                                                                        }
                                                                    </option>

                                                                    {transferDoctors.map(
                                                                        doctor => (

                                                                            <option
                                                                                key={doctor.doctorId}
                                                                                value={doctor.doctorId}
                                                                            >
                                                                                {doctor.doctorName}
                                                                                {" — "}
                                                                                {doctor.specialization}
                                                                                {" — Arrived"}
                                                                            </option>

                                                                        )
                                                                    )}
                                                                </select>

                                                                <input
                                                                    type="text"
                                                                    value={transferReason}
                                                                    onChange={(e) =>
                                                                    setTransferReason(
                                                                        e.target.value
                                                                    )
                                                                    }
                                                                    placeholder="Reason for emergency transfer"
                                                                    className="
                                                                    bg-slate-900
                                                                    border
                                                                    border-slate-700
                                                                    text-white
                                                                    placeholder-slate-500
                                                                    rounded-lg
                                                                    px-3
                                                                    py-2
                                                                    text-sm
                                                                    outline-none
                                                                    "
                                                                />

                                                                <div className="flex gap-2">

                                                                    <button
                                                                    onClick={transferEmergency}
                                                                    disabled={
                                                                        actionLoading ===
                                                                        `transfer-${queue.queueId}`
                                                                    }
                                                                    className="
                                                                        px-3
                                                                        py-2
                                                                        bg-red-600
                                                                        hover:bg-red-500
                                                                        disabled:bg-slate-700
                                                                        text-white
                                                                        rounded-lg
                                                                        text-sm
                                                                        font-semibold
                                                                    "
                                                                    >
                                                                    {actionLoading ===
                                                                    `transfer-${queue.queueId}`
                                                                        ? "Transferring..."
                                                                        : "Confirm Transfer"}
                                                                    </button>

                                                                    <button
                                                                    onClick={() => {
                                                                        setTransferQueueId(null);
                                                                        setTransferDoctorId("");
                                                                        setTransferReason("");
                                                                    }}
                                                                    className="
                                                                        px-3
                                                                        py-2
                                                                        bg-slate-700
                                                                        hover:bg-slate-600
                                                                        text-slate-300
                                                                        rounded-lg
                                                                        text-sm
                                                                    "
                                                                    >
                                                                    Cancel
                                                                    </button>

                                                                </div>

                                                                </div>

                                                            </div>
                                                            )}

                                                        </td>

                                                    </tr>

                                                );
                                            }
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


export default StaffQueue;