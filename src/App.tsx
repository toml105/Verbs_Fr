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
import ListeningPractice from './pages/ListeningPractice';
import SpeakingPractice from './pages/SpeakingPractice';
import ConversationPractice from './pages/ConversationPractice';
import Learn from './pages/Learn';
import Grammar from './pages/Grammar';
import GrammarLesson from './pages/GrammarLesson';
import GrammarPractice from './pages/GrammarPractice';
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
          <Route path="/learn" element={<Learn />} />
          <Route path="/verbs" element={<VerbExplorer />} />
          <Route path="/verbs/:verbId" element={<VerbDetail />} />
          <Route path="/grammar" element={<Grammar />} />
          <Route path="/grammar/:lessonId" element={<GrammarLesson />} />
          <Route path="/grammar/:lessonId/practice" element={<GrammarPractice />} />
          <Route path="/practice" element={<Practice />} />
          <Route path="/progress" element={<Progress />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/confusing-pairs" element={<ConfusingPairs />} />
          <Route path="/listening" element={<ListeningPractice />} />
          <Route path="/speaking" element={<SpeakingPractice />} />
          <Route path="/conversations" element={<ConversationPractice />} />
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
