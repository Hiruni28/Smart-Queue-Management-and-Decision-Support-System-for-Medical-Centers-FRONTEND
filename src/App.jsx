import {BrowserRouter,Routes,Route} from "react-router-dom";
import AdminLogin from"./pages/AdminLogin";
import AdminDashboard from"./pages/AdminDashboard";
import ManageDoctors from "./pages/ManageDoctors";
import ManageStaff from "./pages/ManageStaff";
import ManageQueue from "./pages/ManageQueue";

function App(){

return(

<BrowserRouter>

<Routes>

<Route path="/"element={<AdminLogin/>}/>

<Route path="/dashboard"element={<AdminDashboard/>}/>

<Route path="/doctors" element={<ManageDoctors/>}/>

<Route path="/staff" element={<ManageStaff />} />

<Route path="/queue" element={<ManageQueue />} />

</Routes>

</BrowserRouter>

);
}

export default App;