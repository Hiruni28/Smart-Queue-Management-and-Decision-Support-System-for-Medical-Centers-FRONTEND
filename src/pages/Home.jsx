import { Link } from "react-router-dom";

function Home() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">

      {/* =====================================================
          NAVBAR
      ===================================================== */}

      <header className="border-b border-slate-200 bg-white/90 backdrop-blur sticky top-0 z-10">

        <div className="max-w-7xl mx-auto px-6 py-4">

          <div className="flex items-center justify-between">

            {/* Logo / Brand */}

            <Link
              to="/"
              className="flex items-center gap-3"
            >

              <div
                className="
                  w-20
                  h-20
                  rounded-2xl
                  bg-teal-600
                  flex
                  items-center
                  justify-center
                  shadow-sm
                "
              >
                <div className="w-24 h-24 bg-white rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg">
              <img 
                src="/logo.png"  
                alt="MediQueue Logo" 
              />
            </div>
              </div>

              <div>

                <h1 className="text-lg font-bold text-slate-900">
                  MediQueue
                </h1>

                <p className="text-[10px] text-slate-500 tracking-widest uppercase">
                  Hospital Queue Management
                </p>

              </div>

            </Link>


            {/* Navigation */}

            <div className="flex items-center gap-3">

              <Link
                to="/patient-login"
                className="
                  hidden
                  sm:inline-flex
                  items-center
                  justify-center
                  px-4
                  py-2
                  rounded-lg
                  text-sm
                  font-medium
                  text-slate-600
                  border
                  border-slate-300
                  hover:border-teal-500
                  hover:text-teal-600
                  transition-colors
                "
              >
                Patient Login
              </Link>

              <Link
                to="/patient-register"
                className="
                  inline-flex
                  items-center
                  justify-center
                  px-4
                  py-2
                  rounded-lg
                  text-sm
                  font-semibold
                  bg-teal-600
                  hover:bg-teal-700
                  text-white
                  transition-colors
                  shadow-sm
                "
              >
                Register
              </Link>

            </div>

          </div>

        </div>

      </header>


      {/* =====================================================
          HERO SECTION
      ===================================================== */}

      <main>

        <section className="relative overflow-hidden">

          {/* Background decoration */}

          <div
            className="
              absolute
              -top-32
              -right-32
              w-96
              h-96
              bg-teal-200/40
              rounded-full
              blur-3xl
              pointer-events-none
            "
          />

          <div
            className="
              absolute
              -bottom-32
              -left-32
              w-96
              h-96
              bg-indigo-200/40
              rounded-full
              blur-3xl
              pointer-events-none
            "
          />

          {/* Subtle pulse-line motif */}
          <svg
            className="absolute top-1/2 left-0 w-full h-24 -translate-y-1/2 opacity-[0.06] pointer-events-none"
            viewBox="0 0 1200 100"
            preserveAspectRatio="none"
            fill="none"
          >
            <path
              d="M0 50 L280 50 L310 15 L340 85 L370 50 L1200 50"
              stroke="#0d9488"
              strokeWidth="4"
              fill="none"
            />
          </svg>


          <div
            className="
              relative
              max-w-7xl
              mx-auto
              px-6
              py-20
              lg:py-28
            "
          >

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">


              {/* LEFT SIDE */}

              <div>

                <span
                  className="
                    inline-flex
                    items-center
                    px-3
                    py-1.5
                    rounded-full
                    bg-teal-50
                    border
                    border-teal-200
                    text-teal-700
                    text-xs
                    font-semibold
                    tracking-widest
                    uppercase
                  "
                >
                  Smart Healthcare Queue
                </span>


                <h2
                  className="
                    mt-6
                    text-4xl
                    sm:text-5xl
                    lg:text-6xl
                    font-bold
                    tracking-tight
                    leading-tight
                    text-slate-900
                  "
                >
                  Healthcare made
                  <span className="text-teal-600">
                    {" "}simpler.
                  </span>
                </h2>


                <p
                  className="
                    mt-6
                    max-w-xl
                    text-base
                    sm:text-lg
                    leading-relaxed
                    text-slate-600
                  "
                >
                  Manage your hospital appointments, receive queue
                  notifications, and keep track of your estimated
                  waiting time from one convenient place.
                </p>


                {/* Buttons */}

                <div className="mt-8 flex flex-col sm:flex-row gap-3">

                  <Link
                    to="/patient-register"
                    className="
                      inline-flex
                      items-center
                      justify-center
                      px-6
                      py-3
                      rounded-xl
                      bg-teal-600
                      hover:bg-teal-700
                      text-white
                      font-semibold
                      text-sm
                      transition-colors
                      shadow-md
                      shadow-teal-600/20
                    "
                  >
                    Create Patient Account

                    <svg
                      className="w-4 h-4 ml-2"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M13 7l5 5m0 0l-5 5m5-5H6"
                      />
                    </svg>

                  </Link>


                  <Link
                    to="/patient-login"
                    className="
                      inline-flex
                      items-center
                      justify-center
                      px-6
                      py-3
                      rounded-xl
                      bg-white
                      hover:bg-slate-50
                      border
                      border-slate-300
                      hover:border-slate-400
                      text-slate-700
                      font-semibold
                      text-sm
                      transition-colors
                    "
                  >
                    Patient Login
                  </Link>

                </div>


                {/* Small information */}

                <div
                  className="
                    mt-8
                    flex
                    flex-wrap
                    items-center
                    gap-x-6
                    gap-y-3
                    text-xs
                    text-slate-500
                  "
                >

                  <span className="flex items-center gap-2">

                    <span className="w-2 h-2 rounded-full bg-emerald-500" />

                    Easy appointment management

                  </span>


                  <span className="flex items-center gap-2">

                    <span className="w-2 h-2 rounded-full bg-sky-500" />

                    Queue monitoring

                  </span>

                </div>

              </div>


              {/* RIGHT SIDE - SYSTEM PREVIEW */}

              <div className="relative">

                <div
                  className="
                    bg-white
                    border
                    border-slate-200
                    rounded-3xl
                    p-6
                    shadow-xl
                    shadow-slate-300/30
                  "
                >

                  {/* Preview header */}

                  <div
                    className="
                      flex
                      items-center
                      justify-between
                      pb-5
                      border-b
                      border-slate-200
                    "
                  >

                    <div>

                      <p className="text-xs text-slate-500 uppercase tracking-wider">
                        Patient Dashboard
                      </p>

                      <p className="mt-1 text-lg font-semibold text-slate-900">
                        Your Queue Status
                      </p>

                    </div>


                    <div
                      className="
                        w-10
                        h-10
                        rounded-xl
                        bg-teal-50
                        border
                        border-teal-200
                        flex
                        items-center
                        justify-center
                      "
                    >

                      <svg
                        className="w-5 h-5 text-teal-600"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >

                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M12 8v4l3 2"
                        />

                        <circle
                          cx="12"
                          cy="12"
                          r="9"
                        />

                      </svg>

                    </div>

                  </div>


                  {/* Queue card */}

                  <div
                    className="
                      mt-6
                      p-5
                      rounded-2xl
                      bg-slate-50
                      border
                      border-slate-200
                    "
                  >

                    <div className="flex items-center justify-between">

                      <div>

                        <p className="text-xs text-slate-500 uppercase tracking-wider">
                          Queue Token
                        </p>

                        <p className="mt-2 text-4xl font-bold text-teal-600">
                          A-024
                        </p>

                      </div>


                      <div className="text-right">

                        <p className="text-xs text-slate-500">
                          Status
                        </p>

                        <p className="mt-1 text-sm font-semibold text-amber-600">
                          Waiting
                        </p>

                      </div>

                    </div>


                    <div className="mt-5">

                      <div className="flex items-center justify-between mb-2">

                        <span className="text-xs text-slate-500">
                          Estimated waiting time
                        </span>

                        <span className="text-sm font-semibold text-slate-900">
                          25 min
                        </span>

                      </div>


                      <div className="h-2 bg-slate-200 rounded-full overflow-hidden">

                        <div
                          className="
                            h-full
                            w-2/3
                            bg-gradient-to-r
                            from-teal-500
                            to-indigo-500
                            rounded-full
                          "
                        />

                      </div>

                    </div>

                  </div>


                  {/* Mini cards */}

                  <div className="grid grid-cols-2 gap-4 mt-4">

                    <div
                      className="
                        p-4
                        rounded-xl
                        bg-slate-50
                        border
                        border-slate-200
                      "
                    >

                      <p className="text-xs text-slate-500">
                        Appointment
                      </p>

                      <p className="mt-2 text-sm font-semibold text-slate-900">
                        Today, 10:30 AM
                      </p>

                    </div>


                    <div
                      className="
                        p-4
                        rounded-xl
                        bg-slate-50
                        border
                        border-slate-200
                      "
                    >

                      <p className="text-xs text-slate-500">
                        Notifications
                      </p>

                      <p className="mt-2 text-sm font-semibold text-slate-900">
                        3 Updates
                      </p>

                    </div>

                  </div>

                </div>

              </div>

            </div>

          </div>

        </section>


        {/* =====================================================
            FEATURES
        ===================================================== */}

        <section className="border-t border-slate-200 bg-white">

          <div className="max-w-7xl mx-auto px-6 py-16">

            <div className="text-center max-w-2xl mx-auto">

              <span className="text-xs font-semibold tracking-widest text-teal-600 uppercase">
                Patient Services
              </span>

              <h3 className="mt-2 text-2xl font-bold text-slate-900">
                Everything you need in one place
              </h3>

              <p className="mt-3 text-sm text-slate-500">
                Access your appointments and queue information
                without unnecessary steps.
              </p>

            </div>


            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-10">


              {/* Feature 1 */}

              <FeatureCard
                title="Appointments"
                description="Book and manage your hospital appointments with ease."
                color="teal"
                icon={
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                }
              />


              {/* Feature 2 */}

              <FeatureCard
                title="Queue Tracking"
                description="Monitor your queue position and estimated waiting time."
                color="indigo"
                icon={
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 8v4l3 2"
                    />

                    <circle
                      cx="12"
                      cy="12"
                      r="9"
                    />
                  </svg>
                }
              />


              {/* Feature 3 */}

              <FeatureCard
                title="Notifications"
                description="Receive important appointment and queue updates."
                color="amber"
                icon={
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                    />
                  </svg>
                }
              />

            </div>

          </div>

        </section>


        {/* =====================================================
            PATIENT CTA
        ===================================================== */}

        <section className="border-t border-slate-200 bg-slate-50">

          <div className="max-w-4xl mx-auto px-6 py-16 text-center">

            <h3 className="text-2xl font-bold text-slate-900">
              Ready to manage your appointments?
            </h3>

            <p className="mt-3 text-sm text-slate-500">
              Create your patient account or sign in to continue.
            </p>


            <div className="mt-6 flex flex-col sm:flex-row justify-center gap-3">

              <Link
                to="/patient-register"
                className="
                  inline-flex
                  items-center
                  justify-center
                  px-6
                  py-3
                  rounded-xl
                  bg-teal-600
                  hover:bg-teal-700
                  text-white
                  text-sm
                  font-semibold
                  transition-colors
                  shadow-sm
                "
              >
                Register as Patient
              </Link>


              <Link
                to="/patient-login"
                className="
                  inline-flex
                  items-center
                  justify-center
                  px-6
                  py-3
                  rounded-xl
                  bg-white
                  hover:bg-slate-50
                  border
                  border-slate-300
                  text-slate-700
                  text-sm
                  font-semibold
                  transition-colors
                "
              >
                Patient Login
              </Link>

            </div>

          </div>

        </section>

      </main>


      {/* =====================================================
          FOOTER
      ===================================================== */}

      <footer className="border-t border-slate-200 bg-white">

        <div className="max-w-7xl mx-auto px-6 py-6">

          <div
            className="
              flex
              flex-col
              sm:flex-row
              items-center
              justify-between
              gap-4
            "
          >

            <p className="text-xs text-slate-500">
              © {new Date().getFullYear()} MediQueue. Hospital Queue Management System.
            </p>


            <div className="flex items-center gap-4">

              <Link
                to="/staff-login"
                className="
                  text-xs
                  text-slate-500
                  hover:text-teal-600
                  transition-colors
                "
              >
                Staff Login
              </Link>

              <Link
                to="/admin-login"
                className="
                  text-xs
                  text-slate-500
                  hover:text-indigo-600
                  transition-colors
                "
              >
                Admin Login
              </Link>

            </div>

          </div>

        </div>

      </footer>

    </div>
  );
}


// =============================================================
// FEATURE CARD
// =============================================================

function FeatureCard({
  title,
  description,
  icon,
  color,
}) {

  const colors = {

    teal: {
      box: "bg-teal-50 border-teal-200 text-teal-600",
      hover: "hover:border-teal-300 hover:shadow-md",
    },

    indigo: {
      box: "bg-indigo-50 border-indigo-200 text-indigo-600",
      hover: "hover:border-indigo-300 hover:shadow-md",
    },

    amber: {
      box: "bg-amber-50 border-amber-200 text-amber-600",
      hover: "hover:border-amber-300 hover:shadow-md",
    },

  };


  const c = colors[color];


  return (
    <div
      className={`
        bg-white
        border
        border-slate-200
        ${c.hover}
        rounded-2xl
        p-6
        transition-all
      `}
    >

      <div
        className={`
          w-10
          h-10
          rounded-xl
          border
          flex
          items-center
          justify-center
          ${c.box}
        `}
      >
        {icon}
      </div>


      <h4 className="mt-5 text-sm font-semibold text-slate-900">
        {title}
      </h4>


      <p className="mt-2 text-xs leading-relaxed text-slate-500">
        {description}
      </p>

    </div>
  );
}


export default Home;
