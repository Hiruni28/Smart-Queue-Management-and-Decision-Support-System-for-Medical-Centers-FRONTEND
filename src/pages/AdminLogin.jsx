import { useState } from "react";
import api from "../services/api";
import { useNavigate } from "react-router-dom";

function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const navigate = useNavigate();

  async function handleLogin() {
    try {
      const response = await api.post("/admin/login", { email, password });
     if (response.data === "Login Success") {

setMsg("✓ Login Successful");
setTimeout(() => {navigate("/dashboard");}, 1500);
}

else {setMsg(response.data);}
    } catch (error) {
      console.log(error.response);
      setMsg("Login Failed");
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 flex justify-center items-center px-4">
      <div className="w-full max-w-sm">

        {/* Card with left accent bar */}
        <div className="flex rounded-2xl overflow-hidden shadow-2xl shadow-black/50">

          {/* Accent bar */}
          <div className="w-1.5 bg-gradient-to-b from-indigo-400 to-indigo-600 flex-shrink-0" />

          {/* Card body */}
          <div className="flex-1 bg-slate-900 px-8 py-10">

            {/* Header with logo */}
            <div className="mb-8">
              <div className="w-24 h-24 bg-white rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg">
              <img 
                src="/logo.png"  
                alt="MediQueue Logo" 
              />
            </div>
              <h1 className="mt-1 text-2xl font-bold text-white tracking-tight text-center">
                Admin Login
              </h1>
            </div>

            {/* Email field */}
            <div className="mb-4">
              <label className="block text-xs font-medium text-slate-400 mb-1.5 tracking-wide uppercase">
                Email
              </label>
              <input
                type="email"
                placeholder="admin@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-800 text-white placeholder-slate-500 border border-slate-700 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
              />
            </div>

            {/* Password field */}
            <div className="mb-6">
              <label className="block text-xs font-medium text-slate-400 mb-1.5 tracking-wide uppercase">
                Password
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-800 text-white placeholder-slate-500 border border-slate-700 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
              />
            </div>

            {/* Submit button */}
            <button
              onClick={handleLogin}
              className="w-full bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-semibold py-2.5 rounded-lg text-sm tracking-wide transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-slate-900"
            >
              Sign in
            </button>

            {/* Error / status message */}
            {msg && (
  <p
    className={`mt-4 text-center text-sm font-medium ${
      msg.includes("Success")
        ? "text-green-400"
        : "text-red-400"
    }`}
  >
    {msg}
  </p>
)}
          </div>
        </div>

        {/* Footer note */}
        <p className="mt-5 text-center text-xs text-slate-600">
          Restricted access — authorized personnel only
        </p>
      </div>
    </div>
  );
}

export default AdminLogin;
