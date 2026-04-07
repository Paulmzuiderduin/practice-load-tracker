const SITE_NAME = 'Practice Load & Injury-Prevention Tracker';
const SITE_URL = 'https://practice-load.paulzuiderduin.com';
const DEFAULT_IMAGE = `${SITE_URL}/favicon.svg`;

const DEFAULT_DESCRIPTION =
  'Practice Load & Injury-Prevention Tracker helps coaches monitor training load, prehab compliance, and early risk signals with weekly summaries and exportable reports.';

const DEFAULT_KEYWORDS = [
  'training load tracker',
  'injury prevention software',
  'session RPE tracking',
  'coach workload dashboard',
  'weekly load summary',
  'prehab compliance',
  'sports performance analytics'
].join(', ');

const TAB_META = {
  hub: {
    title: 'Practice Load Dashboard',
    description: 'Overview of weekly load, prehab compliance, and injury risk signals.'
  },
  sessions: {
    title: 'Session Log',
    description: 'Log session duration, RPE, focus, attendance, and prehab compliance.'
  },
  load: {
    title: 'Weekly Load Summary',
    description: 'Review team and player load totals, average RPE, and spikes versus last week.'
  },
  injuries: {
    title: 'Injury Log',
    description: 'Track body part, severity, time-loss estimates, and return dates.'
  },
  prehab: {
    title: 'Prehab Compliance',
    description: 'Review prehab completion trends and adjust the checklist.'
  },
  alerts: {
    title: 'Risk Alerts',
    description: 'Flag load spikes and low compliance weeks for early action.'
  },
  reports: {
    title: 'Weekly Reports',
    description: 'Export PDF and CSV summaries for staff and medical reviews.'
  },
  roster: {
    title: 'Team Roster',
    description: 'Manage players for attendance, prehab, and injury tracking.'
  },
  help: {
    title: 'Help Center',
    description: 'Getting started guide, data model, and FAQ.'
  },
  settings: {
    title: 'Settings',
    description: 'Configure modules, onboarding, and workspace preferences.'
  },
  privacy: {
    title: 'Privacy Policy',
    description: 'Read how Practice Load Tracker stores and processes data.'
  }
};

const getBaseUrl = () => {
  if (typeof window === 'undefined') return SITE_URL;
  return window.location.origin || SITE_URL;
};

export const getSeoMetadata = ({
  activeTab,
  isAuthenticated,
  selectedSeasonName = '',
  selectedTeamName = ''
}) => {
  const base = getBaseUrl();
  const tabMeta = TAB_META[activeTab] || {};
  const scope =
    isAuthenticated && (selectedTeamName || selectedSeasonName)
      ? ` · ${selectedSeasonName || 'Season'} · ${selectedTeamName || 'Team'}`
      : '';

  const titlePrefix = tabMeta.title || 'Practice Load & Injury-Prevention Tracker';
  const title = `${titlePrefix}${scope} | ${SITE_NAME}`;
  const description = tabMeta.description || DEFAULT_DESCRIPTION;
  const canonical = `${base}/`;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: SITE_NAME,
    applicationCategory: 'SportsApplication',
    operatingSystem: 'Web',
    url: canonical,
    description,
    image: DEFAULT_IMAGE,
    inLanguage: 'en',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'EUR'
    },
    creator: {
      '@type': 'Person',
      name: 'Paul Zuiderduin'
    }
  };

  return {
    title,
    description,
    keywords: DEFAULT_KEYWORDS,
    canonical,
    robots: 'index, follow',
    og: {
      type: 'website',
      title,
      description,
      url: canonical,
      image: DEFAULT_IMAGE,
      siteName: SITE_NAME
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      image: DEFAULT_IMAGE
    },
    jsonLd
  };
};
