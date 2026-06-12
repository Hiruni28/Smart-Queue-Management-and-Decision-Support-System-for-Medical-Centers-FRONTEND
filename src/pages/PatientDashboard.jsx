import { Link } from "react-router-dom";

function PatientDashboard(){

const email=
localStorage.getItem(
"patient"
);

return(

<div className="p-10">

<h1 className="text-4xl font-bold">

Welcome Patient

</h1>

<p className="mt-3">

{email}

</p>

<Link
to="/patient-profile"
className="
inline-block
mt-6
bg-indigo-600
text-white
px-6
py-3
rounded
"
>

Open Profile

</Link>

</div>

);

}

export default PatientDashboard;