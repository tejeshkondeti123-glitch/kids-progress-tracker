// client/src/App.jsx
import React, { useState, useEffect, useCallback } from 'react';
import KhanKidsHome from './components/KhanKidsHome';
import ParentDashboard from './components/ParentDashboard';
import CountingPartyGame from './components/CountingPartyGame';
import ShapeSafariGame from './components/ShapeSafariGame';
import StoryTimeGame from './components/StoryTimeGame';
import AlphabetSafariGame from './components/AlphabetSafariGame';
import StickerBookModal from './components/StickerBookModal';
import ParentalGateModal from './components/ParentalGateModal';
import {
  fetchChildren,
  fetchDailySummary,
  fetchVersionConfig,
  setVersionConfig,
  resetDemoData,
} from './services/api';
import { sounds } from './services/soundEffects';

export default function App() {
  // Navigation mode: 'kids' (Khan Academy Kids App) | 'parent' (Parent Dashboard)
  const [appMode, setAppMode] = useState('kids');

  // Active game modal: null | 'counting' | 'shapes' | 'story' | 'alphabet'
  const [activeGame, setActiveGame] = useState(null);

  // Modals
  const [isParentGateOpen, setIsParentGateOpen] = useState(false);
  const [isStickerBookOpen, setIsStickerBookOpen] = useState(false);

  // Children state
  const [availableChildren, setAvailableChildren] = useState([
    { id: 'child_001', name: 'Sarah', age: 7, avatar: 'sarah-avatar' },
    { id: 'child_002', name: 'Leo', age: 4, avatar: 'leo-avatar' },
    { id: 'child_003', name: 'Maya', age: 5, avatar: 'maya-avatar' },
  ]);
  const [activeChild, setActiveChild] = useState({
    id: 'child_001',
    name: 'Sarah',
    age: 7,
    avatar: 'sarah-avatar',
  });

  // Kids stars & rewards
  const [starCount, setStarCount] = useState(18);

  // Parent Companion / Researcher states
  const [version, setVersion] = useState('V1');
  const [scenario, setScenario] = useState('today'); // 'today' | 'empty'
  const [summary, setSummary] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isResetting, setIsResetting] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // Toast notification helper
  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Load all children on mount
  useEffect(() => {
    fetchChildren()
      .then((kids) => {
        if (Array.isArray(kids) && kids.length > 0) {
          setAvailableChildren(kids);
          const current = kids.find((k) => k.id === activeChild?.id) || kids[0];
          setActiveChild(current);
        }
      })
      .catch((err) => console.warn('Could not load children from API:', err));
  }, []);

  // Load backend version config
  useEffect(() => {
    fetchVersionConfig()
      .then((data) => {
        if (data && data.version) {
          setVersion(data.version);
        }
      })
      .catch((err) => console.warn('Could not load version config:', err));
  }, []);

  // Load Daily Summary for the active child
  const loadSummary = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const targetDate = scenario === 'empty' ? '2020-01-01' : undefined;
      const childId = activeChild?.id || 'child_001';
      const data = await fetchDailySummary(childId, targetDate);
      setSummary(data);
      setIsLoading(false);
    } catch (err) {
      console.error('Failed to load daily summary:', err);
      setError(err.message || 'Something went wrong while loading today’s learning.');
      setIsLoading(false);
    }
  }, [scenario, activeChild?.id]);

  useEffect(() => {
    loadSummary();
  }, [loadSummary]);

  // Version change handler
  const handleVersionChange = async (newVersion) => {
    setVersion(newVersion);
    try {
      await setVersionConfig(newVersion);
    } catch (err) {
      console.warn('Failed to sync version to backend:', err);
    }
  };

  // Reset Demo Data handler
  const handleResetDemo = async () => {
    if (!window.confirm('Reset prototype data to original demo seed state?')) {
      return;
    }
    setIsResetting(true);
    try {
      await resetDemoData();
      await loadSummary();
      setStarCount(18);
      alert('Demo data has been restored to default seed state.');
    } catch (err) {
      alert('Failed to reset demo data: ' + err.message);
    } finally {
      setIsResetting(false);
    }
  };

  // Switch learner
  const handleSelectChild = (child) => {
    setActiveChild(child);
    sounds.playPop(480);
    showToast(`Switched active learner to ${child.name}!`);
  };

  // Game completion callback from kid's activity
  const handleGameComplete = ({ skill, status }) => {
    setStarCount((prev) => prev + 3);
    loadSummary(); // Refresh summary in background
    showToast(`⭐ Earned 3 Stars! "${skill}" saved to learning profile.`);
  };

  return (
    <div className="khan-academy-kids-app-root">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="app-floating-toast" role="status" aria-live="polite">
          <span className="toast-sparkle">✨</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* VIEW: KHAN KIDS APP MODE */}
      {appMode === 'kids' && (
        <KhanKidsHome
          activeChild={activeChild}
          availableChildren={availableChildren}
          onSelectChild={handleSelectChild}
          onOpenParentDashboard={() => setIsParentGateOpen(true)}
          onLaunchGame={(gameType) => {
            sounds.playPop(520);
            setActiveGame(gameType);
          }}
          starCount={starCount}
          onOpenStickerBook={() => {
            sounds.playPop(520);
            setIsStickerBookOpen(true);
          }}
        />
      )}

      {/* VIEW: PARENT DASHBOARD MODE */}
      {appMode === 'parent' && (
        <ParentDashboard
          activeChild={activeChild}
          availableChildren={availableChildren}
          onSelectChild={handleSelectChild}
          version={version}
          onVersionChange={handleVersionChange}
          scenario={scenario}
          onScenarioChange={setScenario}
          onResetDemo={handleResetDemo}
          isResetting={isResetting}
          summary={summary}
          isLoading={isLoading}
          error={error}
          onReloadSummary={loadSummary}
          onReturnToKidsApp={() => {
            sounds.playPop(440);
            setAppMode('kids');
          }}
        />
      )}

      {/* MODAL: PARENTAL GATE */}
      <ParentalGateModal
        isOpen={isParentGateOpen}
        onUnlock={() => {
          setIsParentGateOpen(false);
          setAppMode('parent');
          loadSummary();
        }}
        onClose={() => setIsParentGateOpen(false)}
      />

      {/* MODAL: STICKER BOOK */}
      {isStickerBookOpen && (
        <StickerBookModal
          childName={activeChild?.name || 'Sarah'}
          starCount={starCount}
          onClose={() => setIsStickerBookOpen(false)}
        />
      )}

      {/* PLAYABLE GAME OVERLAYS */}
      {activeGame === 'counting' && (
        <CountingPartyGame
          childId={activeChild?.id || 'child_001'}
          childName={activeChild?.name || 'Sarah'}
          onClose={() => setActiveGame(null)}
          onCompleteActivity={handleGameComplete}
        />
      )}

      {activeGame === 'shapes' && (
        <ShapeSafariGame
          childId={activeChild?.id || 'child_001'}
          childName={activeChild?.name || 'Sarah'}
          onClose={() => setActiveGame(null)}
          onCompleteActivity={handleGameComplete}
        />
      )}

      {activeGame === 'story' && (
        <StoryTimeGame
          childId={activeChild?.id || 'child_001'}
          childName={activeChild?.name || 'Sarah'}
          onClose={() => setActiveGame(null)}
          onCompleteActivity={handleGameComplete}
        />
      )}

      {activeGame === 'alphabet' && (
        <AlphabetSafariGame
          childId={activeChild?.id || 'child_001'}
          childName={activeChild?.name || 'Sarah'}
          onClose={() => setActiveGame(null)}
          onCompleteActivity={handleGameComplete}
        />
      )}
    </div>
  );
}
