import { useEffect, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Route, Routes, useLocation } from 'react-router-dom';
import LoadingScreen from './components/ui/LoadingScreen';
import PageTransition from './components/ui/PageTransition';
import CursorTrail from './components/ui/CursorTrail';
import ToastContainer from './components/ui/ToastContainer';
import KeyboardShortcutOverlay from './components/ui/KeyboardShortcutOverlay';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import WorldMap from './pages/WorldMap';
import LevelSelect from './pages/LevelSelect';
import GameLevel from './pages/GameLevel';
import Progress from './pages/Progress';
import Settings from './pages/Settings';
import BreathPage from './pages/BreathPage';
import Support from './pages/Support';
import { useGame } from './context/GameContext';
import { useAmbientSound, type WorldSoundId } from './hooks/useAmbientSound';
import { getLevel } from './data/mockData';

/** Root application shell: handles the initial boot sequence, route-level transitions,
 *  the global cursor trail, the global toast layer, and the continuous ambient soundscapes. */
export default function App() {
  const [booting, setBooting] = useState(true);
  const location = useLocation();
  const { progress } = useGame();

  useEffect(() => {
    const t = setTimeout(() => setBooting(false), 1400);
    return () => clearTimeout(t);
  }, []);

  // Map current route path to appropriate ambient sound type
  const getAmbientSoundForRoute = (): WorldSoundId => {
    if (booting) return 'off';
    const path = location.pathname;

    if (path.startsWith('/play/')) {
      const parts = path.split('/');
      const levelId = parts[parts.length - 1];
      try {
        const level = getLevel(levelId);
        return (level?.worldId as WorldSoundId) || 'default';
      } catch {
        return 'default';
      }
    }

    if (path.startsWith('/levels/')) {
      const parts = path.split('/');
      const worldId = parts[parts.length - 1];
      return (worldId as WorldSoundId) || 'default';
    }

    if (path === '/breathe') {
      return 'stress';
    }

    return 'default';
  };

  const soundWorld = getAmbientSoundForRoute();
  const soundEnabled = progress.settings.musicOn ?? true;
  useAmbientSound(soundWorld, soundEnabled);

  if (booting) return <LoadingScreen label="Calibrating the Mind…" />;

  return (
    <>
      {/* Global cursor trail — respects reduced motion via CSS media query */}
      {!progress.settings.reducedMotion && <CursorTrail color="#3df8ff" />}

      {/* Global toast layer */}
      <ToastContainer />

      {/* Keyboard shortcut overlay — press '?' anywhere */}
      <KeyboardShortcutOverlay />

      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route
            path="/"
            element={
              <PageTransition>
                <LandingPage />
              </PageTransition>
            }
          />
          <Route
            path="/dashboard"
            element={
              <PageTransition>
                <Dashboard />
              </PageTransition>
            }
          />
          <Route
            path="/map"
            element={
              <PageTransition>
                <WorldMap />
              </PageTransition>
            }
          />
          <Route
            path="/levels/:worldId"
            element={
              <PageTransition>
                <LevelSelect />
              </PageTransition>
            }
          />
          <Route
            path="/play/:levelId"
            element={
              <PageTransition>
                <GameLevel />
              </PageTransition>
            }
          />
          <Route
            path="/progress"
            element={
              <PageTransition>
                <Progress />
              </PageTransition>
            }
          />
          <Route
            path="/settings"
            element={
              <PageTransition>
                <Settings />
              </PageTransition>
            }
          />
          <Route
            path="/breathe"
            element={
              <PageTransition>
                <BreathPage />
              </PageTransition>
            }
          />
          <Route
            path="/support"
            element={
              <PageTransition>
                <Support />
              </PageTransition>
            }
          />
          <Route
            path="*"
            element={
              <PageTransition>
                <LandingPage />
              </PageTransition>
            }
          />
        </Routes>
      </AnimatePresence>
    </>
  );
}
