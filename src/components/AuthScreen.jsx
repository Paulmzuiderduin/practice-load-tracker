import React, { useState } from 'react';
import PublicSeoContent from './PublicSeoContent';

const AuthScreen = ({
  authEmail,
  setAuthEmail,
  authPassword,
  setAuthPassword,
  authMessage,
  onSignInWithGitHub,
  onSendMagicLink,
  onSignInWithPassword,
  onCreatePasswordAccount,
  overlays
}) => {
  const [loginMethod, setLoginMethod] = useState('password');

  return (
    <div className="min-h-screen px-6 py-8">
      <div className="mx-auto max-w-4xl space-y-6">
        <header className="rounded-3xl bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold text-cyan-700">Practice Load & Injury-Prevention Tracker</p>
          <h1 className="text-3xl font-semibold">Sign in</h1>
          <p className="mt-2 text-sm text-slate-500">
            Track training load, prehab compliance, and early injury risk across your squads.
          </p>
        </header>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_1.15fr]">
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <button
              className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-800"
              onClick={onSignInWithGitHub}
            >
              Continue with GitHub
            </button>
            <div className="my-4 flex items-center gap-3 text-xs text-slate-400">
              <span className="h-px flex-1 bg-slate-200" />
              <span>or use email</span>
              <span className="h-px flex-1 bg-slate-200" />
            </div>

            <div className="mb-4 grid grid-cols-2 rounded-xl border border-slate-200 p-1 text-sm">
              <button
                className={`rounded-lg px-3 py-2 font-semibold ${
                  loginMethod === 'password'
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
                type="button"
                onClick={() => setLoginMethod('password')}
              >
                Email + password
              </button>
              <button
                className={`rounded-lg px-3 py-2 font-semibold ${
                  loginMethod === 'magic'
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
                type="button"
                onClick={() => setLoginMethod('magic')}
              >
                Magic link
              </button>
            </div>

            <label className="text-xs font-semibold text-slate-500">Email</label>
            <input
              className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              placeholder="you@example.com"
              value={authEmail}
              onChange={(event) => setAuthEmail(event.target.value)}
            />

            {loginMethod === 'password' ? (
              <>
                <label className="mt-3 block text-xs font-semibold text-slate-500">Password</label>
                <input
                  className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  type="password"
                  placeholder="Your password"
                  value={authPassword}
                  onChange={(event) => setAuthPassword(event.target.value)}
                />
                <button
                  className="mt-4 w-full rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
                  onClick={onSignInWithPassword}
                >
                  Sign in
                </button>
                <button
                  className="mt-2 w-full rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700"
                  onClick={onCreatePasswordAccount}
                >
                  Create account
                </button>
              </>
            ) : (
              <>
                <button
                  className="mt-4 w-full rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
                  onClick={onSendMagicLink}
                >
                  Send magic link
                </button>
                <button
                  className="mt-2 w-full rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700"
                  onClick={onSendMagicLink}
                >
                  Resend link
                </button>
              </>
            )}
            {authMessage && <div className="mt-3 text-sm text-slate-500">{authMessage}</div>}
            <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <h2 className="text-sm font-semibold text-slate-900">How login works</h2>
              {loginMethod === 'magic' ? (
                <>
                  <ol className="mt-3 list-decimal space-y-2 pl-4 text-sm text-slate-600">
                    <li>
                      Enter your email address and click{' '}
                      <span className="font-semibold text-slate-900">Send magic link</span>.
                    </li>
                    <li>You will receive a Supabase sign-in email.</li>
                    <li>Open the email and click the confirmation link to sign in.</li>
                  </ol>
                  <div className="mt-4 space-y-1 text-xs text-slate-500">
                    <div>
                      <span className="font-semibold text-slate-700">Sender:</span> usually{' '}
                      <span className="font-mono">Supabase Auth</span>
                    </div>
                    <div>
                      <span className="font-semibold text-slate-700">Subject:</span> usually{' '}
                      <span className="font-mono">Confirm Your Signup</span>
                    </div>
                    <div>If you do not see the email, check your spam folder first.</div>
                  </div>
                </>
              ) : (
                <ul className="mt-3 list-disc space-y-2 pl-4 text-sm text-slate-600">
                  <li>Use Sign in if you already have an account and password.</li>
                  <li>Use Create account once to register email + password.</li>
                  <li>You can still use magic link anytime as a fallback.</li>
                </ul>
              )}
            </div>
          </div>
          <PublicSeoContent />
        </div>
      </div>
      {overlays}
    </div>
  );
};

export default AuthScreen;
