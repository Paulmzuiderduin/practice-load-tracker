import React from 'react';

const PublicSeoContent = () => (
  <section className="rounded-2xl bg-white p-6 shadow-sm">
    <h2 className="text-xl font-semibold text-slate-900">Practice Load & Injury-Prevention Tracker</h2>
    <p className="mt-2 text-sm text-slate-600">
      Track training load, prehab completion, and early risk signals across your teams. Data stays organized per season
      and team for fast weekly planning.
    </p>
    <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
      <article className="rounded-xl border border-slate-200 bg-slate-50 p-3">
        <h3 className="text-sm font-semibold text-slate-800">Session Logs</h3>
        <p className="mt-1 text-xs text-slate-600">
          Capture duration, RPE, focus, attendance, and prehab checklists for every session.
        </p>
      </article>
      <article className="rounded-xl border border-slate-200 bg-slate-50 p-3">
        <h3 className="text-sm font-semibold text-slate-800">Weekly Load Summary</h3>
        <p className="mt-1 text-xs text-slate-600">
          Review total minutes, average RPE, and load spikes vs the previous week.
        </p>
      </article>
      <article className="rounded-xl border border-slate-200 bg-slate-50 p-3">
        <h3 className="text-sm font-semibold text-slate-800">Injury Tracking</h3>
        <p className="mt-1 text-xs text-slate-600">
          Log body part, severity, estimated time loss, and return-to-play dates.
        </p>
      </article>
      <article className="rounded-xl border border-slate-200 bg-slate-50 p-3">
        <h3 className="text-sm font-semibold text-slate-800">Alerts & Reports</h3>
        <p className="mt-1 text-xs text-slate-600">
          Trigger load spike and low-compliance alerts, then export weekly PDF and CSV reports.
        </p>
      </article>
    </div>
    <div className="mt-4 text-xs text-slate-500">
      Local-first storage with Supabase-ready structures. No data leaves the device unless you opt in.
    </div>
  </section>
);

export default PublicSeoContent;
