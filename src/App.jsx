import {BrowserRouter,Routes,Route} from "react-router-dom";
import AdminLogin from"./pages/AdminLogin";
import AdminDashboard from"./pages/AdminDashboard";
import ManageDoctors from "./pages/ManageDoctors";
import ManageStaff from "./pages/ManageStaff";
import ManageQueue from "./pages/ManageQueue";
import PatientRegister from "./pages/PatientRegister";
import PatientLogin from "./pages/PatientLogin";
import PatientDashboard from "./pages/PatientDashboard";
import PatientProfile from "./pages/PatientProfile";

function App(){

return(

<BrowserRouter>

<Routes>

<Route path="/"element={<AdminLogin/>}/>
<Route path="/"element={<PatientLogin/>}/>

<Route path="/dashboard"element={<AdminDashboard/>}/>

<Route path="/doctors" element={<ManageDoctors/>}/>

<Route path="/staff" element={<ManageStaff />} />

<Route path="/queue" element={<ManageQueue />} />

<Route path="/patient-register" element={<PatientRegister/>} />

<Route path="/patient-login" element={<PatientLogin/>} />

<Route path="/patient-dashboard" element={<PatientDashboard/>} />

<Route path="/patient-profile" element={<PatientProfile/>} />


</Routes>

</BrowserRouter>

);
}

export default App;