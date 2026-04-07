import React, { Suspense, lazy, useCallback, useEffect, useMemo, useState } from 'react';
import {
  Activity,
  AlertTriangle,
  BarChart2,
  ClipboardList,
  FileText,
  HelpCircle,
  Home,
  Settings2,
  ShieldCheck,
  Users
} from 'lucide-react';
import AppHeader from './components/AppHeader';
import AppOverlays from './components/AppOverlays';
import AuthScreen from './components/AuthScreen';
import MobileNav from './components/MobileNav';
import SidebarNav from './components/SidebarNav';
import WorkspaceSetupScreen from './components/WorkspaceSetupScreen';
import { useAuthSession } from './hooks/useAuthSession';
import { usePersistedUiState } from './hooks/usePersistedUiState';
import { useSeasonsTeams } from './hooks/useSeasonsTeams';
import { getSeoMetadata } from './seo/metadata';
import { useSeoMeta } from './seo/useSeoMeta';
import {
  createSeason as createSeasonLocal,
  createTeam as createTeamLocal,
  deleteSeason as deleteSeasonLocal,
  deleteTeam as deleteTeamLocal,
  renameSeason as renameSeasonLocal,
  renameTeam as renameTeamLocal
} from './lib/practice/storage';
import { supabase, supabaseEnabled } from './lib/supabase';

const HubView = lazy(() => import('./modules/hub/HubView'));
const SessionsView = lazy(() => import('./modules/sessions/SessionsView'));
const LoadView = lazy(() => import('./modules/load/LoadView'));
const InjuriesView = lazy(() => import('./modules/injuries/InjuriesView'));
const PrehabView = lazy(() => import('./modules/prehab/PrehabView'));
const AlertsView = lazy(() => import('./modules/alerts/AlertsView'));
const ReportsView = lazy(() => import('./modules/reports/ReportsView'));
const RosterView = lazy(() => import('./modules/roster/RosterView'));
const HelpView = lazy(() => import('./modules/help/HelpView'));
const SettingsView = lazy(() => import('./modules/settings/SettingsView'));
const PrivacyView = lazy(() => import('./modules/privacy/PrivacyView'));

const App = () => {
  const { session, authLoading } = useAuthSession();
  const { seasons, setSeasons, loadingSeasons } = useSeasonsTeams(session?.user?.id);
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authMessage, setAuthMessage] = useState('');
  const [seasonForm, setSeasonForm] = useState('');
  const [teamForm, setTeamForm] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState(null);
  const [promptDialog, setPromptDialog] = useState(null);
  const [toasts, setToasts] = useState([]);

  const toast = useCallback((message, type = 'info') => {
    const id = `${Date.now()}_${Math.random()}`;
    setToasts((prev) => [...prev, { id, message, type }]);
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((item) => item.id !== id));
    }, 2800);
  }, []);

  const confirmAction = useCallback((message) => {
    return new Promise((resolve) => {
      setConfirmDialog({ message, resolve });
    });
  }, []);

  const promptAction = useCallback((message, initialValue = '') => {
    return new Promise((resolve) => {
      setPromptDialog({ message, value: initialValue, resolve });
    });
  }, []);

  const moduleConfig = useMemo(
    () => [
      { key: 'hub', label: 'Dashboard', icon: <Home size={16} />, alwaysVisible: true },
      { key: 'sessions', label: 'Sessions', icon: <ClipboardList size={16} /> },
      { key: 'load', label: 'Load', icon: <BarChart2 size={16} /> },
      { key: 'injuries', label: 'Injuries', icon: <Activity size={16} /> },
      { key: 'prehab', label: 'Prehab', icon: <ShieldCheck size={16} /> },
      { key: 'alerts', label: 'Alerts', icon: <AlertTriangle size={16} /> },
      { key: 'reports', label: 'Reports', icon: <FileText size={16} /> },
      { key: 'roster', label: 'Roster', icon: <Users size={16} /> },
      { key: 'help', label: 'Help', icon: <HelpCircle size={16} />, alwaysVisible: true },
      { key: 'settings', label: 'Settings', icon: <Settings2 size={16} />, alwaysVisible: true }
    ],
    []
  );

  const moduleShellCopy = useMemo(
    () => ({
      hub: 'Weekly overview of load, compliance, and injury risk signals.',
      sessions: 'Log training sessions with RPE, attendance, and prehab compliance.',
      load: 'Weekly team and player load summaries with spike comparisons.',
      injuries: 'Track injuries, time-loss estimates, and return dates.',
      prehab: 'Manage prehab checklist items and compliance trends.',
      alerts: 'See load spike and low-compliance alerts at a glance.',
      reports: 'Export weekly PDF and CSV summaries.',
      roster: 'Manage the shared roster for attendance and injury logs.',
      help: 'Data model, layout guidance, and FAQs.',
      settings: 'Configure modules and UI preferences.'
    }),
    []
  );

  const {
    activeTab,
    setActiveTab,
    selectedSeasonId,
    setSelectedSeasonId,
    selectedTeamId,
    setSelectedTeamId,
    moduleVisibility,
    setModuleVisibility,
    preferences,
    setPreferences,
    sidebarCollapsed,
    setSidebarCollapsed,
    selectedSeason,
    selectedTeam,
    navItems,
    mobilePrimaryItems,
    mobileOverflowItems
  } = usePersistedUiState({
    sessionUser: session?.user,
    moduleConfig,
    seasons,
    loadingSeasons,
    defaultTab: 'hub'
  });

  const seoMeta = useMemo(
    () =>
      getSeoMetadata({
        activeTab,
        isAuthenticated: Boolean(session?.user),
        selectedSeasonName: selectedSeason?.name || '',
        selectedTeamName: selectedTeam?.name || ''
      }),
    [activeTab, selectedSeason?.name, selectedTeam?.name, session?.user]
  );
  useSeoMeta(seoMeta);

  useEffect(() => {
    if (!session?.user || !selectedSeason || !selectedTeam) {
      setShowOnboarding(false);
      return;
    }
    if (preferences.onboardingCompleted) {
      setShowOnboarding(false);
      return;
    }
    setShowOnboarding(true);
    if (activeTab !== 'help') setActiveTab('help');
  }, [session?.user, selectedSeason, selectedTeam, preferences.onboardingCompleted, activeTab, setActiveTab]);

  const activeModule = moduleConfig.find((item) => item.key === activeTab) || moduleConfig[0];

  const createSeason = async () => {
    if (!seasonForm.trim()) return;
    const { season, seasons: next } = createSeasonLocal(seasonForm.trim());
    setSeasons(next);
    setSeasonForm('');
    setSelectedSeasonId(season.id);
    setSelectedTeamId('');
    toast('Season created.', 'success');
  };

  const createTeam = async () => {
    if (!teamForm.trim() || !selectedSeason) return;
    const { team, seasons: next } = createTeamLocal(selectedSeason.id, teamForm.trim());
    setSeasons(next);
    setTeamForm('');
    setSelectedTeamId(team.id);
    toast('Team created.', 'success');
  };

  const renameSeason = async (seasonId, name) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    setSeasons(renameSeasonLocal(seasonId, trimmed));
    toast('Season renamed.', 'success');
  };

  const deleteSeason = async (seasonId) => {
    if (!(await confirmAction('Delete season? All teams and data will be removed.'))) return;
    const nextSeasons = deleteSeasonLocal(seasonId);
    setSeasons(nextSeasons);
    if (selectedSeasonId === seasonId) {
      setSelectedSeasonId('');
      setSelectedTeamId('');
    }
    toast('Season deleted.', 'success');
  };

  const renameTeam = async (seasonId, teamId, name) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    setSeasons(renameTeamLocal(seasonId, teamId, trimmed));
    toast('Team renamed.', 'success');
  };

  const deleteTeam = async (seasonId, teamId) => {
    if (!(await confirmAction('Delete team? All data for this team will be removed.'))) return;
    const nextSeasons = deleteTeamLocal(seasonId, teamId);
    setSeasons(nextSeasons);
    if (selectedTeamId === teamId) {
      setSelectedTeamId('');
    }
    toast('Team deleted.', 'success');
  };

  const overlays = (
    <AppOverlays
      confirmDialog={confirmDialog}
      setConfirmDialog={setConfirmDialog}
      promptDialog={promptDialog}
      setPromptDialog={setPromptDialog}
      toasts={toasts}
    />
  );

  if (authLoading) {
    return <div className="p-10 text-slate-700">Loading...</div>;
  }

  if (supabaseEnabled && !session?.user) {
    return (
      <AuthScreen
        authEmail={authEmail}
        setAuthEmail={setAuthEmail}
        authPassword={authPassword}
        setAuthPassword={setAuthPassword}
        authMessage={authMessage}
        onSignInWithGitHub={async () => {
          if (!supabase) return;
          setAuthMessage('Opening GitHub sign-in...');
          const redirectTo = `${window.location.origin}${import.meta.env.BASE_URL}`;
          const { error } = await supabase.auth.signInWithOAuth({
            provider: 'github',
            options: { redirectTo }
          });
          if (error) setAuthMessage(`Failed to sign in with GitHub: ${error.message}`);
        }}
        onSendMagicLink={async () => {
          if (!supabase || !authEmail) return;
          setAuthMessage('Sending magic link...');
          const redirectTo = `${window.location.origin}${import.meta.env.BASE_URL}`;
          const { error } = await supabase.auth.signInWithOtp({ email: authEmail, options: { redirectTo } });
          setAuthMessage(error ? error.message : 'Check your inbox for the sign-in link.');
        }}
        onSignInWithPassword={async () => {
          if (!supabase || !authEmail || !authPassword) return;
          setAuthMessage('Signing in...');
          const { error } = await supabase.auth.signInWithPassword({ email: authEmail, password: authPassword });
          setAuthMessage(error ? error.message : '');
        }}
        onCreatePasswordAccount={async () => {
          if (!supabase || !authEmail || !authPassword) return;
          setAuthMessage('Creating account...');
          const { error } = await supabase.auth.signUp({ email: authEmail, password: authPassword });
          setAuthMessage(error ? `Account creation failed: ${error.message}` : 'Account created. Check email.');
        }}
        overlays={overlays}
      />
    );
  }

  if (loadingSeasons) {
    return <div className="p-10 text-slate-700">Loading...</div>;
  }

  if (!selectedSeason || !selectedTeam) {
    if (activeTab === 'privacy') {
      return (
        <div className="min-h-screen px-6 py-8">
          <div className="mx-auto max-w-5xl space-y-6">
            <button
              className="rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700"
              onClick={() => setActiveTab('hub')}
            >
              Back to setup
            </button>
            <PrivacyView />
          </div>
        </div>
      );
    }
    return (
      <WorkspaceSetupScreen
        seasons={seasons}
        selectedSeason={selectedSeason}
        selectedSeasonId={selectedSeasonId}
        selectedTeamId={selectedTeamId}
        setSelectedSeasonId={setSelectedSeasonId}
        setSelectedTeamId={setSelectedTeamId}
        seasonForm={seasonForm}
        setSeasonForm={setSeasonForm}
        teamForm={teamForm}
        setTeamForm={setTeamForm}
        createSeason={createSeason}
        createTeam={createTeam}
        promptAction={promptAction}
        renameSeason={renameSeason}
        deleteSeason={deleteSeason}
        renameTeam={renameTeam}
        deleteTeam={deleteTeam}
        openFeatureRequestDialog={null}
        onSendFeedback={() => {
          window.location.href = 'mailto:info@paulzuiderduin.com';
        }}
        onOpenPrivacy={() => setActiveTab('privacy')}
        setActiveTab={setActiveTab}
        overlays={overlays}
      />
    );
  }

  return (
    <div className={`min-h-screen pb-20 transition-[padding] duration-200 ${sidebarCollapsed ? 'lg:pl-20' : 'lg:pl-64'}`}>
      <SidebarNav
        selectedSeasonName={selectedSeason.name}
        navItems={navItems}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onSwitchTeam={() => {
          setSelectedSeasonId('');
          setSelectedTeamId('');
        }}
        onSignOut={supabaseEnabled ? () => supabase?.auth.signOut() : null}
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed((prev) => !prev)}
      />

      <AppHeader
        activeModuleLabel={activeModule?.label || 'Practice Load Hub'}
        activeModuleDescription={moduleShellCopy[activeTab] || 'Practice load workspace.'}
        selectedSeasonName={selectedSeason.name}
        selectedTeamName={selectedTeam.name}
        userEmail={session?.user?.email || 'local@device'}
        seasons={seasons}
        selectedSeasonId={selectedSeasonId}
        onSelectSeason={(nextSeasonId) => {
          const nextSeason = seasons.find((season) => season.id === nextSeasonId);
          setSelectedSeasonId(nextSeasonId);
          setSelectedTeamId(nextSeason?.teams?.[0]?.id || '');
        }}
        teamOptions={selectedSeason.teams || []}
        selectedTeamId={selectedTeamId}
        onSelectTeam={setSelectedTeamId}
      />

      <main className="mx-auto max-w-7xl space-y-6 p-6">
        <Suspense fallback={<div className="p-10 text-slate-700">Loading module...</div>}>
          {activeTab === 'hub' && (
            <HubView
              teamId={selectedTeamId}
              showTips={preferences.showHubTips}
              showTooltips={preferences.showStatTooltips}
              onOpenModule={setActiveTab}
            />
          )}
          {activeTab === 'sessions' && (
            <SessionsView teamId={selectedTeamId} toast={toast} confirmAction={confirmAction} />
          )}
          {activeTab === 'load' && <LoadView teamId={selectedTeamId} />}
          {activeTab === 'injuries' && (
            <InjuriesView teamId={selectedTeamId} toast={toast} confirmAction={confirmAction} />
          )}
          {activeTab === 'prehab' && <PrehabView teamId={selectedTeamId} toast={toast} />}
          {activeTab === 'alerts' && <AlertsView teamId={selectedTeamId} toast={toast} />}
          {activeTab === 'reports' && (
            <ReportsView teamId={selectedTeamId} seasonName={selectedSeason.name} teamName={selectedTeam.name} />
          )}
          {activeTab === 'roster' && (
            <RosterView teamId={selectedTeamId} toast={toast} confirmAction={confirmAction} />
          )}
          {activeTab === 'help' && <HelpView />}
          {activeTab === 'settings' && (
            <SettingsView
              moduleConfig={moduleConfig}
              moduleVisibility={moduleVisibility}
              onToggle={(key) =>
                setModuleVisibility((prev) => ({
                  ...prev,
                  [key]: !prev[key]
                }))
              }
              onReset={() => {
                const defaults = moduleConfig.reduce((acc, item) => {
                  if (!item.alwaysVisible) acc[item.key] = true;
                  return acc;
                }, {});
                setModuleVisibility(defaults);
              }}
              preferences={preferences}
              onSetPreference={(key, value) =>
                setPreferences((prev) => ({
                  ...prev,
                  [key]: value
                }))
              }
            />
          )}
          {activeTab === 'privacy' && <PrivacyView />}
        </Suspense>
      </main>

      <footer className="mx-auto mb-14 max-w-7xl px-6 text-xs text-slate-500 lg:mb-6">
        <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white/70 px-4 py-3">
          <span>© {new Date().getFullYear()} Practice Load Tracker</span>
          <button
            className="font-semibold text-slate-700 underline decoration-transparent transition hover:decoration-current"
            onClick={() => setActiveTab('privacy')}
          >
            Privacy Policy
          </button>
        </div>
      </footer>

      <MobileNav
        activeTab={activeTab}
        primaryItems={mobilePrimaryItems}
        overflowItems={mobileOverflowItems}
        mobileMenuOpen={mobileMenuOpen}
        onSelectTab={(key) => {
          setActiveTab(key);
          setMobileMenuOpen(false);
        }}
        onToggleMobileMenu={() => setMobileMenuOpen((prev) => !prev)}
        onCloseMobileMenu={() => setMobileMenuOpen(false)}
        onOpenPrivacy={() => {
          setActiveTab('privacy');
          setMobileMenuOpen(false);
        }}
      />

      {showOnboarding && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/45 p-4">
          <div className="w-full max-w-xl rounded-3xl bg-white p-6 shadow-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-700">First-time setup</p>
            <h3 className="mt-2 text-2xl font-bold text-slate-900">Welcome to Practice Load Hub</h3>
            <p className="mt-2 text-sm text-slate-600">
              You are in <span className="font-semibold">{selectedSeason?.name}</span> /{' '}
              <span className="font-semibold">{selectedTeam?.name}</span>.
            </p>
            <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm text-slate-700">
              <li>Add roster in `Roster`.</li>
              <li>Log a session in `Sessions`.</li>
              <li>Review load summaries in `Load` and `Alerts`.</li>
              <li>Export the weekly PDF in `Reports`.</li>
            </ol>
            <div className="mt-5 flex flex-wrap items-center gap-2">
              <button
                className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
                onClick={() => {
                  setPreferences((prev) => ({ ...prev, onboardingCompleted: true }));
                  setShowOnboarding(false);
                  setActiveTab('sessions');
                }}
              >
                Start in Sessions
              </button>
              <button
                className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700"
                onClick={() => {
                  setPreferences((prev) => ({ ...prev, onboardingCompleted: true }));
                  setShowOnboarding(false);
                  setActiveTab('help');
                }}
              >
                Open help
              </button>
            </div>
          </div>
        </div>
      )}
      {overlays}
    </div>
  );
};

export default App;
