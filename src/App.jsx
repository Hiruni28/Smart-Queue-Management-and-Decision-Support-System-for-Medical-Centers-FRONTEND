import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import ManageDoctors from "./pages/ManageDoctors";
import ManageStaff from "./pages/ManageStaff";
import QueueRules from "./pages/QueueRules";
import Reports from "./pages/Reports";

import PatientRegister from "./pages/PatientRegister";
import PatientLogin from "./pages/PatientLogin";
import PatientDashboard from "./pages/PatientDashboard";
import PatientProfile from "./pages/PatientProfile";
import PatientAppointments from "./pages/PatientAppointments";
import PatientNotifications from "./pages/PatientNotifications";

import StaffLogin from "./pages/StaffLogin";
import StaffDashboard from "./pages/StaffDashboard";
import StaffAppointments from "./pages/StaffAppointments";
import StaffPatients from "./pages/StaffPatients";
import StaffSchedules from "./pages/StaffSchedules";
import StaffDoctorStatus from "./pages/StaffDoctorStatus";
import StaffQueue from "./pages/StaffQueue";


function App() {

  return (
    <BrowserRouter>

      <Routes>

        {/* PUBLIC HOME PAGE */}
        <Route path="/" element={<Home />} />

        {/* ==============================
            ADMIN
        ============================== */}

        <Route path="/admin-login" element={<AdminLogin />} />

        <Route
          path="/dashboard"
          element={<AdminDashboard />}
        />

        <Route
          path="/doctors"
          element={<ManageDoctors />}
        />

        <Route
          path="/staff"
          element={<ManageStaff />}
        />

        <Route
          path="/queue-rules"
          element={<QueueRules />}
        />

        <Route
          path="/reports"
          element={<Reports />}
        />


        {/* ==============================
            PATIENT
        ============================== */}

        <Route
          path="/patient-register"
          element={<PatientRegister />}
        />

        <Route
          path="/patient-login"
          element={<PatientLogin />}
        />

        <Route
          path="/patient-dashboard"
          element={<PatientDashboard />}
        />

        <Route
          path="/patient-profile"
          element={<PatientProfile />}
        />

        <Route
          path="/appointments"
          element={<PatientAppointments />}
        />

        <Route
          path="/patient-notifications"
          element={<PatientNotifications />}
        />


        {/* ==============================
            STAFF
        ============================== */}

        <Route
          path="/staff-login"
          element={<StaffLogin />}
        />

        <Route
          path="/staff-dashboard"
          element={<StaffDashboard />}
        />

        <Route
          path="/staff-appointments"
          element={<StaffAppointments />}
        />

        <Route
          path="/staff-patients"
          element={<StaffPatients />}
        />

        <Route
          path="/staff-schedules"
          element={<StaffSchedules />}
        />

        <Route
          path="/staff-doctor-status"
          element={<StaffDoctorStatus />}
        />

        <Route
          path="/staff-queue"
          element={<StaffQueue />}
        />

      </Routes>

    </BrowserRouter>
  );
}

export default App;