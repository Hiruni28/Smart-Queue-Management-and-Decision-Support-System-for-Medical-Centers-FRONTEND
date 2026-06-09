import {BrowserRouter,Routes,Route} from "react-router-dom";
import AdminLogin from"./pages/AdminLogin";
import AdminDashboard from"./pages/AdminDashboard";
import ManageDoctors from "./pages/ManageDoctors";

function App(){

return(

<BrowserRouter>

<Routes>

<Route path="/"element={<AdminLogin/>}/>

<Route path="/dashboard"element={<AdminDashboard/>}/>

<Route path="/doctors" element={<ManageDoctors/>}/>

</Routes>

</BrowserRouter>

);
}

export default App;