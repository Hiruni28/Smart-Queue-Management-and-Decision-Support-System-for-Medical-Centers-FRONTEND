import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function PatientLogin(){

const navigate=
useNavigate();

const [email,setEmail]=useState("");

const [password,setPassword]=useState("");

const [msg,setMsg]=useState("");

const [msgType,setMsgType]=useState("");

function showMessage(text,type){

setMsg(text);

setMsgType(type);

setTimeout(()=>{

setMsg("");

},3000);

}

async function login(){

if(!email||!password){

showMessage(
"Fill all fields",
"error"
);

return;

}

try{

const response=
await api.post(
"/patient/login",
{
email,
password
}
);

if(
response.data===
"Login Success"
){

showMessage(
"✓ Login Success",
"success"
);

localStorage.setItem(
"patient",
email
);

setTimeout(()=>{

navigate(
"/patient-dashboard"
);

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
"Login Failed",
"error"
);

}

}

return(

<div className="min-h-screen bg-slate-950 flex justify-center items-center">

<div className="bg-slate-900 p-10 rounded-xl w-[400px]">

<h1 className="text-white text-3xl font-bold mb-8">

Patient Login

</h1>

{

msg&&(

<div
className={`

mb-5
p-3
rounded-lg

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

<input
type="email"
placeholder="Email"
className="w-full p-3 rounded mb-4"
value={email}
onChange={(e)=>
setEmail(
e.target.value
)}
/>

<input
type="password"
placeholder="Password"
className="w-full p-3 rounded mb-5"
value={password}
onChange={(e)=>
setPassword(
e.target.value
)}
/>

<button
onClick={login}
className="
w-full
bg-indigo-600
hover:bg-indigo-500
text-white
p-3
rounded-lg
"
>

Login

</button>

</div>

</div>

);

}

export default PatientLogin;