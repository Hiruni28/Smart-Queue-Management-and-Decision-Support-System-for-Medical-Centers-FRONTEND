function Topbar() {
  return (
    <div className="bg-slate-900 border-b border-slate-800 px-8 py-4 flex items-center justify-between">

      {/* Page title */}
      <div>
        <h2 className="text-lg font-bold text-white leading-tight">
          Admin Dashboard
        </h2>
      </div>

      {/* Admin badge */}
      <div className="flex items-center gap-3">
        <div className="text-right hidden sm:block">
          <p className="text-sm font-semibold text-white leading-none">Administrator</p>
          <p className="text-xs text-slate-400 mt-0.5">Full access</p>
        </div>
        <div className="w-9 h-9 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
          </svg>
        </div>
      </div>

    </div>
  );
}

export default Topbar;
