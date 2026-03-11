import { BrowserRouter, Routes, Route } from 'react-router';
import { ThemeProvider } from './context/ThemeContext';
import { ProgressProvider } from './context/UserProgressContext';
import AppShell from './components/layout/AppShell';
import Dashboard from './pages/Dashboard';
import VerbExplorer from './pages/VerbExplorer';
import VerbDetail from './pages/VerbDetail';
import Practice from './pages/Practice';
import Progress from './pages/Progress';
import Settings from './pages/Settings';

export default function App() {
  return (
    <ThemeProvider>
      <ProgressProvider>
        <BrowserRouter basename="/Verbs_Fr">
          <Routes>
            <Route element={<AppShell />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/verbs" element={<VerbExplorer />} />
              <Route path="/verbs/:verbId" element={<VerbDetail />} />
              <Route path="/practice" element={<Practice />} />
              <Route path="/progress" element={<Progress />} />
              <Route path="/settings" element={<Settings />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </ProgressProvider>
    </ThemeProvider>
  );
}
