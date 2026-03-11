import { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router';
import { ThemeProvider } from './context/ThemeContext';
import { ProgressProvider, useProgress } from './context/UserProgressContext';
import AppShell from './components/layout/AppShell';
import Dashboard from './pages/Dashboard';
import VerbExplorer from './pages/VerbExplorer';
import VerbDetail from './pages/VerbDetail';
import Practice from './pages/Practice';
import Progress from './pages/Progress';
import Settings from './pages/Settings';
import ConfusingPairs from './pages/ConfusingPairs';
import Welcome from './components/onboarding/Welcome';
import PlacementTest from './components/onboarding/PlacementTest';

function AppRoutes() {
  const { userData, completeOnboarding } = useProgress();
  const [onboardingStep, setOnboardingStep] = useState<'welcome' | 'placement' | 'done'>(
    userData.hasCompletedOnboarding ? 'done' : 'welcome'
  );

  if (onboardingStep === 'welcome') {
    return (
      <Welcome
        onStartPlacement={() => setOnboardingStep('placement')}
        onSkip={() => {
          completeOnboarding();
          setOnboardingStep('done');
        }}
      />
    );
  }

  if (onboardingStep === 'placement') {
    return (
      <PlacementTest
        onComplete={(level) => {
          completeOnboarding(level);
          setOnboardingStep('done');
        }}
        onSkip={() => {
          completeOnboarding();
          setOnboardingStep('done');
        }}
      />
    );
  }

  return (
    <BrowserRouter basename="/Verbs_Fr">
      <Routes>
        <Route element={<AppShell />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/verbs" element={<VerbExplorer />} />
          <Route path="/verbs/:verbId" element={<VerbDetail />} />
          <Route path="/practice" element={<Practice />} />
          <Route path="/progress" element={<Progress />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/confusing-pairs" element={<ConfusingPairs />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <ProgressProvider>
        <AppRoutes />
      </ProgressProvider>
    </ThemeProvider>
  );
}
