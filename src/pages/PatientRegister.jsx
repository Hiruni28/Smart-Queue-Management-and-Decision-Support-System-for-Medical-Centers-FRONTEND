import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function PatientRegister() {
  const navigate = useNavigate();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");

  // =========================================================
  // SPECIAL NEEDS
  // =========================================================

  const [specialNeeds, setSpecialNeeds] = useState(false);
  const [disabilityType, setDisabilityType] = useState("");

  const [msg, setMsg] = useState("");
  const [msgType, setMsgType] = useState("");

  function showMessage(text, type) {
    setMsg(text);
    setMsgType(type);

    setTimeout(() => {
      setMsg("");
    }, 3000);
  }

  // =========================================================
  // REGISTER
  // =========================================================

  async function register() {
    // ---------------------------------------------------------
    // Required fields
    // ---------------------------------------------------------

    if (
      !fullName ||
      !email ||
      !password ||
      !phone ||
      !dateOfBirth
    ) {
      showMessage(
        "All required fields are required!",
        "error"
      );

      return;
    }

    // ---------------------------------------------------------
    // Special Needs validation
    // ---------------------------------------------------------

    if (
      specialNeeds &&
      !disabilityType.trim()
    ) {
      showMessage(
        "Please specify the type of special need.",
        "error"
      );

      return;
    }

    try {
      // -------------------------------------------------------
      // Build registration request
      // -------------------------------------------------------

      const requestData = {
        fullName: fullName.trim(),
        email: email.trim(),
        password,
        phone: phone.trim(),
        dateOfBirth,

        // -----------------------------------------------------
        // SPECIAL NEEDS
        // -----------------------------------------------------

        specialNeeds: Boolean(specialNeeds),

        disabilityType: specialNeeds
          ? disabilityType.trim()
          : null,
      };

      console.log(
        "Patient registration request:",
        requestData
      );

      const response = await api.post(
        "/patient/register",
        requestData
      );

      // -------------------------------------------------------
      // Registration success
      // -------------------------------------------------------

      if (
        response.data ===
        "Registration Success"
      ) {
        showMessage(
          "✓ Registration Success",
          "success"
        );

        setTimeout(() => {
          navigate("/patient-login");
        }, 1500);
      } else {
        showMessage(
          response.data,
          "error"
        );
      }

    } catch (error) {
      console.error(
        "Patient registration error:",
        error
      );

      // -------------------------------------------------------
      // Backend error message
      // -------------------------------------------------------

      if (
        error?.response?.data
      ) {
        if (
          typeof error.response.data === "string"
        ) {
          showMessage(
            error.response.data,
            "error"
          );
        } else if (
          error.response.data.message
        ) {
          showMessage(
            error.response.data.message,
            "error"
          );
        } else {
          showMessage(
            "Registration Failed!",
            "error"
          );
        }
      } else {
        showMessage(
          "Registration Failed!",
          "error"
        );
      }
    }
  }

  // =========================================================
  // INPUT STYLE
  // =========================================================

  const inputClass =
    "w-full bg-white border border-slate-200 text-slate-800 placeholder-slate-400 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-colors duration-200 shadow-sm";

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div className="min-h-screen bg-slate-300 flex items-center justify-center px-4 py-8">

      {/* =====================================================
          BACKGROUND
      ===================================================== */}

      <div className="absolute inset-0 overflow-hidden pointer-events-none">

        <div className="absolute -top-40 -right-40 w-96 h-96 bg-teal-400/10 rounded-full blur-3xl" />

        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-teal-400/10 rounded-full blur-3xl" />

      </div>


      {/* =====================================================
          CARD
      ===================================================== */}

      <div className="relative w-full max-w-md">

        <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-xl shadow-slate-200/60">

          {/* =================================================
              HEADER
          ================================================= */}

          <div className="mb-8">

            <div className="flex items-center gap-2 mb-4">

              <div className="w-8 h-8 rounded-lg bg-teal-50 border border-teal-200 flex items-center justify-center">

                <svg
                  className="w-4 h-4 text-teal-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>

              </div>

              <span className="text-xs font-medium text-teal-600 tracking-widest uppercase">
                New Account
              </span>

            </div>


            <h1 className="text-2xl font-semibold text-slate-800 leading-tight">
              Patient Registration
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Fill in your details to get started.
            </p>

          </div>


          {/* =================================================
              MESSAGE
          ================================================= */}

          {msg && (
            <div
              className={`mb-6 px-4 py-3 rounded-lg text-sm font-medium flex items-center gap-2 transition-all duration-300 ${
                msgType === "success"
                  ? "bg-teal-50 border border-teal-200 text-teal-700"
                  : "bg-red-50 border border-red-200 text-red-600"
              }`}
            >
              <span>{msg}</span>
            </div>
          )}


          {/* =================================================
              FORM
          ================================================= */}

          <div className="space-y-4">

            {/* =================================================
                FULL NAME
            ================================================= */}

            <div>

              <label className="block text-xs font-medium text-slate-600 mb-1.5 tracking-wide">
                Full Name
              </label>

              <input
                placeholder="e.g. Jane Perera"
                className={inputClass}
                value={fullName}
                onChange={(e) =>
                  setFullName(e.target.value)
                }
              />

            </div>


            {/* =================================================
                EMAIL
            ================================================= */}

            <div>

              <label className="block text-xs font-medium text-slate-600 mb-1.5 tracking-wide">
                Email
              </label>

              <input
                type="email"
                placeholder="you@example.com"
                className={inputClass}
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
              />

            </div>


            {/* =================================================
                PASSWORD
            ================================================= */}

            <div>

              <label className="block text-xs font-medium text-slate-600 mb-1.5 tracking-wide">
                Password
              </label>

              <input
                type="password"
                placeholder="••••••••"
                className={inputClass}
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
              />

            </div>


            {/* =================================================
                PHONE + DOB
            ================================================= */}

            <div className="grid grid-cols-2 gap-3">

              <div>

                <label className="block text-xs font-medium text-slate-600 mb-1.5 tracking-wide">
                  Phone
                </label>

                <input
                  placeholder="+94 77 000 0000"
                  className={inputClass}
                  value={phone}
                  onChange={(e) =>
                    setPhone(e.target.value)
                  }
                />

              </div>


              <div>

                <label className="block text-xs font-medium text-slate-600 mb-1.5 tracking-wide">
                  Date of Birth
                </label>

                <input
                  type="date"
                  className={`${inputClass} [color-scheme:light]`}
                  value={dateOfBirth}
                  onChange={(e) =>
                    setDateOfBirth(e.target.value)
                  }
                />

              </div>

            </div>


            {/* =================================================
                SPECIAL NEEDS SECTION
            ================================================= */}

            <div className="mt-6 pt-5 border-t border-slate-200">

              <div className="mb-4">

                <h2 className="text-sm font-semibold text-slate-700">
                  Accessibility & Special Needs
                </h2>

                <p className="text-xs text-slate-500 mt-1">
                  This information helps the hospital provide
                  appropriate assistance and queue priority.
                </p>

              </div>


              {/* =================================================
                  SPECIAL NEEDS YES / NO
              ================================================= */}

              <div>

                <label className="block text-xs font-medium text-slate-600 mb-2 tracking-wide">
                  Do you have special needs?
                </label>

                <div className="grid grid-cols-2 gap-3">

                  {/* NO */}

                  <button
                    type="button"
                    onClick={() => {
                      setSpecialNeeds(false);
                      setDisabilityType("");
                    }}
                    className={`py-3 px-4 rounded-lg border text-sm font-medium transition-all ${
                      !specialNeeds
                        ? "bg-slate-100 border-slate-400 text-slate-800"
                        : "bg-white border-slate-200 text-slate-500 hover:border-slate-300"
                    }`}
                  >
                    No
                  </button>


                  {/* YES */}

                  <button
                    type="button"
                    onClick={() => {
                      setSpecialNeeds(true);
                    }}
                    className={`py-3 px-4 rounded-lg border text-sm font-medium transition-all ${
                      specialNeeds
                        ? "bg-purple-50 border-purple-300 text-purple-700"
                        : "bg-white border-slate-200 text-slate-500 hover:border-slate-300"
                    }`}
                  >
                    Yes
                  </button>

                </div>

              </div>


              {/* =================================================
                  DISABILITY / SPECIAL NEED TYPE
              ================================================= */}

              {specialNeeds && (

                <div className="mt-4">

                  <label className="block text-xs font-medium text-slate-600 mb-1.5 tracking-wide">
                    Special Need Type
                  </label>

                  <select
                    className={`${inputClass} [color-scheme:light]`}
                    value={disabilityType}
                    onChange={(e) =>
                      setDisabilityType(
                        e.target.value
                      )
                    }
                  >

                    <option value="">
                      Select special need type
                    </option>

                    <option value="Physical Disability">
                      Physical Disability
                    </option>

                    <option value="Visual Impairment">
                      Visual Impairment
                    </option>

                    <option value="Hearing Impairment">
                      Hearing Impairment
                    </option>

                    <option value="Speech Impairment">
                      Speech Impairment
                    </option>

                    <option value="Intellectual Disability">
                      Intellectual Disability
                    </option>

                    <option value="Developmental Disability">
                      Developmental Disability
                    </option>

                    <option value="Autism Spectrum Disorder">
                      Autism Spectrum Disorder
                    </option>

                    <option value="Mobility Assistance">
                      Mobility Assistance
                    </option>

                    <option value="Other">
                      Other
                    </option>

                  </select>


                  <p className="mt-2 text-xs text-slate-400">
                    Please select the option that best describes
                    the patient's accessibility requirement.
                  </p>

                </div>

              )}

            </div>


            {/* =================================================
                SUBMIT
            ================================================= */}

            <button
              onClick={register}
              className="w-full mt-4 bg-teal-500 hover:bg-teal-600 active:bg-teal-700 text-white font-semibold py-3 rounded-lg text-sm tracking-wide transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 focus:ring-offset-white shadow-sm"
            >
              Create Account
            </button>

          </div>


          {/* =================================================
              FOOTER
          ================================================= */}

          <p className="mt-6 text-center text-xs text-slate-400">

            Already registered?{" "}

            <button
              onClick={() =>
                navigate("/patient-login")
              }
              className="text-teal-600 hover:text-teal-700 transition-colors duration-150 font-medium"
            >
              Sign in
            </button>

          </p>

        </div>

      </div>

    </div>
  );
}

export default PatientRegister;