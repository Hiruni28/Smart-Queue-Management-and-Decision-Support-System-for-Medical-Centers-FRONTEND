import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function PatientNotifications() {
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const [patientId, setPatientId] = useState(null);

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("error");

  // =========================================================
  // SHOW MESSAGE
  // =========================================================

  function showMessage(text, type = "error") {
    setMessage(text);
    setMessageType(type);

    setTimeout(() => {
      setMessage("");
    }, 3000);
  }

  // =========================================================
  // GET PATIENT ID
  // =========================================================
  // Uses the SAME endpoint as PatientProfile.jsx:
  //
  // GET /patient/profile/{email}
  //
  // =========================================================

  async function loadPatientId() {
    const email = localStorage.getItem("patient");

    if (!email) {
      navigate("/patient-login");
      return null;
    }

    try {
      const response = await api.get(
        `/patient/profile/${encodeURIComponent(email)}`
      );

      const data = response.data;

      const id =
        data?.patientId ??
        data?.id;

      if (id === null || id === undefined) {
        throw new Error(
          "Patient ID was not returned by the server."
        );
      }

      const numericId = Number(id);

      if (Number.isNaN(numericId)) {
        throw new Error(
          "Invalid patient ID returned by the server."
        );
      }

      setPatientId(numericId);

      return numericId;

    } catch (error) {
      console.error(
        "Failed to load patient information:",
        error
      );

      showMessage(
        "Unable to load patient information.",
        "error"
      );

      return null;
    }
  }

  // =========================================================
  // LOAD ALL NOTIFICATIONS
  // =========================================================

  async function loadNotifications(id) {
    if (!id) {
      return;
    }

    try {
      setLoading(true);

      const response = await api.get(
        `/notifications/patient/${id}`
      );

      setNotifications(
        Array.isArray(response.data)
          ? response.data
          : []
      );

    } catch (error) {
      console.error(
        "Failed to load notifications:",
        error
      );

      showMessage(
        "Unable to load notifications.",
        "error"
      );

    } finally {
      setLoading(false);
    }
  }

  // =========================================================
  // LOAD UNREAD COUNT
  // =========================================================

  async function loadUnreadCount(id) {
    if (!id) {
      return;
    }

    try {
      const response = await api.get(
        `/notifications/patient/${id}/unread-count`
      );

      setUnreadCount(
        Number(response.data) || 0
      );

    } catch (error) {
      console.error(
        "Failed to load unread count:",
        error
      );
    }
  }

  // =========================================================
  // INITIAL LOAD
  // =========================================================

  useEffect(() => {
    let mounted = true;

    async function initialize() {
      const id = await loadPatientId();

      if (!mounted || !id) {
        return;
      }

      await Promise.all([
        loadNotifications(id),
        loadUnreadCount(id),
      ]);
    }

    initialize();

    return () => {
      mounted = false;
    };
  }, []);

  // =========================================================
  // AUTO REFRESH
  // =========================================================

  useEffect(() => {
    if (!patientId) {
      return;
    }

    const interval = setInterval(() => {
      loadNotifications(patientId);
      loadUnreadCount(patientId);
    }, 10000);

    return () => {
      clearInterval(interval);
    };
  }, [patientId]);

  // =========================================================
  // MARK ONE NOTIFICATION AS READ
  // =========================================================

  async function markAsRead(notificationId) {
    if (!notificationId) {
      return;
    }

    try {
      await api.put(
        `/notifications/${notificationId}/read`
      );

      setNotifications((current) =>
        current.map((notification) =>
          notification.notificationId === notificationId
            ? {
                ...notification,
                isRead: true,
              }
            : notification
        )
      );

      setUnreadCount((current) =>
        Math.max(0, current - 1)
      );

    } catch (error) {
      console.error(
        "Failed to mark notification as read:",
        error
      );

      showMessage(
        "Unable to mark notification as read.",
        "error"
      );
    }
  }

  // =========================================================
  // MARK ALL NOTIFICATIONS AS READ
  // =========================================================

  async function markAllAsRead() {
    if (!patientId || unreadCount === 0) {
      return;
    }

    try {
      setActionLoading(true);

      await api.put(
        `/notifications/patient/${patientId}/read-all`
      );

      setNotifications((current) =>
        current.map((notification) => ({
          ...notification,
          isRead: true,
        }))
      );

      setUnreadCount(0);

      showMessage(
        "All notifications marked as read.",
        "success"
      );

    } catch (error) {
      console.error(
        "Failed to mark all notifications as read:",
        error
      );

      showMessage(
        "Unable to mark all notifications as read.",
        "error"
      );

    } finally {
      setActionLoading(false);
    }
  }

  // =========================================================
  // FORMAT DATE
  // =========================================================

  function formatDate(dateValue) {
    if (!dateValue) {
      return "";
    }

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
      return "";
    }

    return date.toLocaleString();
  }

  // =========================================================
  // NOTIFICATION TYPE STYLE
  // =========================================================

  function getNotificationStyle(type) {
    switch (
      String(type || "")
        .trim()
        .toUpperCase()
    ) {
      case "PATIENT_CALLED":
        return {
          icon: "🔔",
          box: "bg-emerald-50 border-emerald-200 text-emerald-700",
          iconBox: "bg-emerald-50 border border-emerald-200",
          title: "text-emerald-700",
          unreadBg: "bg-emerald-50/60",
        };

      case "QUEUE_TOKEN_CREATED":
        return {
          icon: "🎫",
          box: "bg-blue-50 border-blue-200 text-blue-700",
          iconBox: "bg-blue-50 border border-blue-200",
          title: "text-blue-700",
          unreadBg: "bg-blue-50/60",
        };

      case "PATIENT_SKIPPED":
        return {
          icon: "⚠",
          box: "bg-amber-50 border-amber-200 text-amber-700",
          iconBox: "bg-amber-50 border border-amber-200",
          title: "text-amber-700",
          unreadBg: "bg-amber-50/60",
        };

      case "APPOINTMENT_COMPLETED":
        return {
          icon: "✓",
          box: "bg-emerald-50 border-emerald-200 text-emerald-700",
          iconBox: "bg-emerald-50 border border-emerald-200",
          title: "text-emerald-700",
          unreadBg: "bg-emerald-50/60",
        };

      case "EMERGENCY_TRANSFER":
        return {
          icon: "🚨",
          box: "bg-red-50 border-red-200 text-red-700",
          iconBox: "bg-red-50 border border-red-200",
          title: "text-red-700",
          unreadBg: "bg-red-50/60",
        };

      case "DOCTOR_DELAYED":
        return {
          icon: "⏱",
          box: "bg-amber-50 border-amber-200 text-amber-700",
          iconBox: "bg-amber-50 border border-amber-200",
          title: "text-amber-700",
          unreadBg: "bg-amber-50/60",
        };

      case "DOCTOR_ARRIVED":
        return {
          icon: "✅",
          box: "bg-teal-50 border-teal-200 text-teal-700",
          iconBox: "bg-teal-50 border border-teal-200",
          title: "text-teal-700",
          unreadBg: "bg-teal-50/60",
        };

      case "DOCTOR_UNAVAILABLE":
        return {
          icon: "⚠",
          box: "bg-red-50 border-red-200 text-red-700",
          iconBox: "bg-red-50 border border-red-200",
          title: "text-red-700",
          unreadBg: "bg-red-50/60",
        };

      default:
        return {
          icon: "🔔",
          box: "bg-slate-100 border-slate-200 text-slate-700",
          iconBox: "bg-slate-100 border border-slate-200",
          title: "text-slate-900",
          unreadBg: "bg-slate-50",
        };
    }
  }

  // =========================================================
  // LOGOUT
  // =========================================================

  function logout() {
    localStorage.removeItem("patient");
    navigate("/patient-login");
  }

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div className="relative min-h-screen bg-slate-300 px-4 py-8">

      {/* Background */}

      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-teal-400/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-teal-400/10 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-3xl mx-auto">

        {/* =====================================================
            HEADER
        ===================================================== */}

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">

          <div>

            <button
              onClick={() =>
                navigate("/patient-dashboard")
              }
              className="text-sm text-teal-600 hover:text-teal-700 font-medium mb-4"
            >
              ← Back to Dashboard
            </button>

            <div className="flex items-center gap-2">

              <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center">

                <svg
                  className="w-5 h-5 text-teal-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                  />
                </svg>

              </div>

              <div>

                <h1 className="text-2xl font-semibold text-slate-900">
                  Notifications
                </h1>

                <p className="text-sm text-slate-500 mt-1">
                  Stay updated about your appointments and queue.
                </p>

              </div>

            </div>

          </div>

          <button
            onClick={logout}
            className="
              bg-red-50
              hover:bg-red-100
              text-red-600
              border
              border-red-200
              px-5
              py-2
              rounded-xl
              text-sm
              font-medium
              transition-colors
            "
          >
            Logout
          </button>

        </div>

        {/* =====================================================
            MESSAGE
        ===================================================== */}

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
                  ? "bg-teal-50 text-teal-700 border-teal-200"
                  : "bg-red-50 text-red-600 border-red-200"
              }
            `}
          >
            {message}
          </div>
        )}

        {/* =====================================================
            MAIN CARD
        ===================================================== */}

        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">

          {/* Card Header */}

          <div className="px-6 py-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

            <div>

              <h2 className="text-sm font-semibold text-teal-600 uppercase tracking-widest">
                Your Notifications
              </h2>

              <p className="text-xs text-slate-500 mt-1">
                {unreadCount} unread notification
                {unreadCount !== 1 ? "s" : ""}
              </p>

            </div>

            <button
              onClick={markAllAsRead}
              disabled={
                unreadCount === 0 ||
                actionLoading
              }
              className="
                px-4
                py-2
                bg-teal-600
                hover:bg-teal-700
                disabled:bg-slate-100
                disabled:text-slate-400
                text-white
                rounded-lg
                text-sm
                font-medium
                disabled:cursor-not-allowed
                transition-colors
              "
            >
              {actionLoading
                ? "Updating..."
                : "Mark All as Read"}
            </button>

          </div>

          {/* ===================================================
              CONTENT
          =================================================== */}

          {loading ? (

            <div className="py-16 text-center">

              <p className="text-slate-500">
                Loading notifications...
              </p>

            </div>

          ) : notifications.length === 0 ? (

            <div className="py-16 text-center px-6">

              <div className="w-14 h-14 mx-auto rounded-full bg-slate-100 flex items-center justify-center mb-4">

                <svg
                  className="w-7 h-7 text-slate-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                  />
                </svg>

              </div>

              <p className="text-slate-700 font-medium">
                No notifications
              </p>

              <p className="text-sm text-slate-500 mt-1">
                You will see appointment and queue updates here.
              </p>

            </div>

          ) : (

            <div className="divide-y divide-slate-200">

              {notifications.map((notification) => {

                const style =
                  getNotificationStyle(
                    notification.notificationType
                  );

                const isUnread =
                  notification.isRead !== true;

                return (
                  <div
                    key={notification.notificationId}
                    className={`
                      p-5
                      transition-colors
                      ${
                        isUnread
                          ? style.unreadBg
                          : "bg-white"
                      }
                    `}
                  >

                    <div className="flex gap-4">

                      {/* ICON */}

                      <div
                        className={`
                          flex-shrink-0
                          w-11
                          h-11
                          rounded-xl
                          flex
                          items-center
                          justify-center
                          text-lg
                          ${style.iconBox}
                        `}
                      >
                        {style.icon}
                      </div>

                      {/* CONTENT */}

                      <div className="flex-1 min-w-0">

                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">

                          <div>

                            <div className="flex items-center gap-2">

                              <h3
                                className={`
                                  font-semibold
                                  ${style.title}
                                `}
                              >
                                {notification.title}
                              </h3>

                              {isUnread && (
                                <span className="w-2 h-2 rounded-full bg-teal-500" />
                              )}

                            </div>

                            <p className="text-xs text-slate-500 mt-1">
                              {formatDate(
                                notification.createdAt
                              )}
                            </p>

                          </div>

                          {isUnread && (
                            <button
                              onClick={() =>
                                markAsRead(
                                  notification.notificationId
                                )
                              }
                              className="
                                text-xs
                                text-teal-600
                                hover:text-teal-700
                                font-medium
                              "
                            >
                              Mark as read
                            </button>
                          )}

                        </div>

                        <p className="text-sm text-slate-600 leading-relaxed mt-3">
                          {notification.message}
                        </p>

                        {/* TYPE */}

                        {notification.notificationType && (
                          <span
                            className={`
                              inline-flex
                              mt-3
                              px-2.5
                              py-1
                              rounded-full
                              text-[10px]
                              font-semibold
                              uppercase
                              tracking-wide
                              border
                              ${style.box}
                            `}
                          >
                            {notification.notificationType.replaceAll(
                              "_",
                              " "
                            )}
                          </span>
                        )}

                      </div>

                    </div>

                  </div>
                );
              })}

            </div>

          )}

        </div>

      </div>
    </div>
  );
}

export default PatientNotifications;