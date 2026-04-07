import React from 'react';

const PrivacyView = () => (
  <div className="space-y-6">
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div>
        <p className="text-sm font-semibold text-cyan-700">Privacy</p>
        <h2 className="text-2xl font-semibold">Privacy Policy</h2>
        <p className="mt-2 text-xs text-slate-500">Last updated: February 28, 2026</p>
      </div>
    </div>

    <div className="rounded-2xl bg-white p-6 shadow-sm text-sm text-slate-600 space-y-4">
      <p>
        This Privacy Policy explains how Practice Load & Injury-Prevention Tracker (“we”, “us”, or “the App”) processes
        personal data. This policy is designed to comply with the EU General Data Protection Regulation (GDPR) and
        international privacy standards.
      </p>

      <div>
        <h3 className="text-sm font-semibold text-slate-700">1. Controller</h3>
        <p>Controller: Practice Load & Injury-Prevention Tracker</p>
        <p>Contact: privacy@paulzuiderduin.com</p>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-slate-700">2. Data We Collect</h3>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>Account data: Email address used for optional authentication (if enabled).</li>
          <li>Team data: Seasons, teams, and roster profiles you create.</li>
          <li>Session data: RPE, attendance, prehab checklist completion, and notes you log.</li>
          <li>Injury data: Body part, severity, time-loss estimate, and return dates you record.</li>
          <li>Technical data: Basic device metadata required for service operation.</li>
        </ul>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-slate-700">3. Purposes and Legal Bases (GDPR)</h3>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>Service delivery: Training load tracking, reporting, and export functionality.</li>
          <li>Security and maintenance: Stability, monitoring, and troubleshooting.</li>
          <li>Reporting: Generating analytics and PDF/CSV reports.</li>
        </ul>
        <p className="mt-2">
          Legal bases: Performance of contract (Art. 6(1)(b)) and legitimate interests (Art. 6(1)(f)) for service
          delivery and security. Consent (Art. 6(1)(a)) applies where optional authentication or analytics are enabled.
        </p>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-slate-700">4. Processors and Storage</h3>
        <p>By default, data is stored locally in the browser. Supabase can be enabled for cloud sync and authentication.</p>
        <p>Data may be processed internationally when cloud services are enabled. Where required, appropriate safeguards are used.</p>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-slate-700">5. Data Sharing</h3>
        <p>We do not sell personal data. We only share data with service providers when cloud services are enabled.</p>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-slate-700">6. Retention</h3>
        <p>We retain data as long as it is stored locally or in your cloud workspace. You can delete data in the App.</p>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-slate-700">7. Your Rights (GDPR)</h3>
        <p>
          You have the right to access, rectify, erase, restrict, object, and receive your data. Contact us at
          privacy@paulzuiderduin.com to exercise these rights.
        </p>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-slate-700">8. Security</h3>
        <p>No system is 100% secure. Keep login links private when authentication is enabled.</p>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-slate-700">9. Children</h3>
        <p>The App is intended for coaches and team administrators. If you process data of minors, you are responsible for obtaining permissions.</p>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-slate-700">10. Changes</h3>
        <p>We may update this policy. The latest version will always be available in the App.</p>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-slate-700">11. Supervisory Authority</h3>
        <p>If you are in the EU, you can lodge a complaint with your local supervisory authority. In the Netherlands, this is the Autoriteit Persoonsgegevens.</p>
      </div>
    </div>
  </div>
);


export default PrivacyView;
