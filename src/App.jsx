import {BrowserRouter,Routes,Route}
from "react-router-dom";

import AdminLogin from "./pages/AdminLogin";

import AdminDashboard from "./pages/AdminDashboard";

import ManageDoctors from "./pages/ManageDoctors";

import ManageStaff from "./pages/ManageStaff";

import ManageQueue from "./pages/ManageQueue";

import PatientRegister from "./pages/PatientRegister";

import PatientLogin from "./pages/PatientLogin";

import PatientDashboard from "./pages/PatientDashboard";

import PatientProfile from "./pages/PatientProfile";

import PatientAppointments from "./pages/PatientAppointments";

import StaffLogin from "./pages/StaffLogin";

import StaffDashboard from "./pages/StaffDashboard";

function App(){

return(

<BrowserRouter>

<Routes>

<Route
path="/"
element={<AdminLogin/>}
/>

<Route
path="/dashboard"
element={<AdminDashboard/>}
/>

<Route
path="/doctors"
element={<ManageDoctors/>}
/>

<Route
path="/staff"
element={<ManageStaff/>}
/>

<Route
path="/queue"
element={<ManageQueue/>}
/>

<Route
path="/patient-register"
element={<PatientRegister/>}
/>

<Route
path="/patient-login"
element={<PatientLogin/>}
/>

<Route
path="/patient-dashboard"
element={<PatientDashboard/>}
/>

<Route
path="/patient-profile"
element={<PatientProfile/>}
/>

<Route
path="/appointments"
element={<PatientAppointments/>}
/>

<Route
path="/staff-login"
element={<StaffLogin/>}
/>

<Route
path="/staff-dashboard"
element={<StaffDashboard/>}
/>

</Routes>

</BrowserRouter>

);

}

export default App;