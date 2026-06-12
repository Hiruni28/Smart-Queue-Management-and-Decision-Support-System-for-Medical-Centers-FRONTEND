import { useEffect,useState } from "react";
import api from "../services/api";

function PatientProfile(){

const email=
localStorage.getItem(
"patient"
);

const [patient,setPatient]=useState({});

const [msg,setMsg]=useState("");

async function loadProfile(){

try{

const response=
await api.get(
`/patient/profile/${email}`
);

setPatient(
response.data
);

}

catch{

setMsg(
"Load Failed"
);

}

}

useEffect(()=>{

loadProfile();

},[]);

async function save(){

try{

await api.put(
"/patient/profile",
patient
);

setMsg(
"✓ Profile Updated"
);

}

catch{

setMsg(
"Update Failed"
);

}

}

return(

<div className="p-10">

<h1 className="text-3xl font-bold mb-8">

Patient Profile

</h1>

{

msg&&(

<div className="mb-4 text-green-600">

{msg}

</div>

)

}

<div className="space-y-4 max-w-lg">

<input
value={patient.fullName||""}
onChange={(e)=>

setPatient({

...patient,

fullName:
e.target.value

})

}
className="w-full border p-3 rounded"
/>

<input
value={patient.email||""}
disabled
className="w-full border p-3 rounded"
/>

<input
value={patient.phone||""}
onChange={(e)=>

setPatient({

...patient,

phone:
e.target.value

})

}
className="w-full border p-3 rounded"
/>

<input
type="password"
value={patient.password||""}
onChange={(e)=>

setPatient({

...patient,

password:
e.target.value

})

}
className="w-full border p-3 rounded"
/>

<input
type="date"
value={patient.dateOfBirth||""}
onChange={(e)=>

setPatient({

...patient,

dateOfBirth:
e.target.value

})

}
className="w-full border p-3 rounded"
/>

<button
onClick={save}
className="
bg-indigo-600
text-white
px-6
py-3
rounded
"
>

Save Profile

</button>

</div>

</div>

);

}

export default PatientProfile;