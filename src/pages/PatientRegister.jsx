import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function PatientRegister(){

const navigate=useNavigate();

const [fullName,setFullName]=useState("");

const [email,setEmail]=useState("");

const [password,setPassword]=useState("");

const [phone,setPhone]=useState("");

const [dateOfBirth,setDateOfBirth]=useState("");

const [msg,setMsg]=useState("");

const [msgType,setMsgType]=useState("");

function showMessage(text,type){

setMsg(text);

setMsgType(type);

setTimeout(()=>{

setMsg("");

},3000);

}

async function register(){

if(
!fullName||
!email||
!password||
!phone||
!dateOfBirth
){

showMessage(
"All fields are required!",
"error"
);

return;

}

try{

const response=
await api.post(
"/patient/register",
{

fullName,

email,

password,

phone,

dateOfBirth

}

);

if(
response.data===
"Registration Success"
){

showMessage(
"✓ Registration Success",
"success"
);

setTimeout(()=>{

navigate("/patient-login");

},1500);

}

else{

showMessage(
response.data,
"error"
);

}

}

catch{

showMessage(
"Registration Failed!",
"error"
);

}

}

return(

<div className="min-h-screen bg-slate-950 flex justify-center items-center">

<div className="bg-slate-900 p-10 rounded-2xl w-[450px]">

<h1 className="text-white text-3xl font-bold mb-8">

Patient Registration

</h1>

{
msg&&(

<div
className={`

mb-5
p-3
rounded

${
msgType==="success"

?

"bg-green-100 text-green-700"

:

"bg-red-100 text-red-700"

}

`}
>

{msg}

</div>

)
}

<div className="space-y-4">

<input
placeholder="Full Name"
className="w-full p-3 rounded"
value={fullName}
onChange={(e)=>
setFullName(
e.target.value
)}
/>

<input
type="email"
placeholder="Email"
className="w-full p-3 rounded"
value={email}
onChange={(e)=>
setEmail(
e.target.value
)}
/>

<input
type="password"
placeholder="Password"
className="w-full p-3 rounded"
value={password}
onChange={(e)=>
setPassword(
e.target.value
)}
/>

<input
placeholder="Phone"
className="w-full p-3 rounded"
value={phone}
onChange={(e)=>
setPhone(
e.target.value
)}
/>

<input
type="date"
className="w-full p-3 rounded"
value={dateOfBirth}
onChange={(e)=>
setDateOfBirth(
e.target.value
)}
/>

<button
onClick={register}
className="
w-full
bg-indigo-600
text-white
p-3
rounded-lg
"
>

Register

</button>

</div>

</div>

</div>

);

}

export default PatientRegister;