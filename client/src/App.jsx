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
import MathAdventureGame from './components/MathAdventureGame';
import RewardsAndGamificationModal from './components/RewardsAndGamificationModal';
import CourseJourneyMap from './components/CourseJourneyMap';
import {
  COURSE_LEVELS,
  getChildCourseProgress,
  saveChildCourseProgress,
} from './services/curriculumCourse';
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
  const [parentTab, setParentTab] = useState('screen1'); // 'screen1' | 'analytics' | 'tracker' | 'screen2'

  // Active game modal: null | 'counting' | 'shapes' | 'story' | 'alphabet' | 'addition' | 'subtraction' | 'multiplication' | 'division'
  const [activeGame, setActiveGame] = useState(null);

  // Modals
  const [isParentGateOpen, setIsParentGateOpen] = useState(false);
  const [isStickerBookOpen, setIsStickerBookOpen] = useState(false);
  const [isRewardsModalOpen, setIsRewardsModalOpen] = useState(false);
  const [isCourseMapOpen, setIsCourseMapOpen] = useState(false);

  // Step-by-step Course Progress
  const [courseProgress, setCourseProgress] = useState(() =>
    getChildCourseProgress('child_001')
  );

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
    setCourseProgress(getChildCourseProgress(child.id));
    sounds.playPop(480);
    showToast(`Switched active learner to ${child.name}!`);
  };

  // Game completion callback from kid's activity
  const handleGameComplete = ({ skill, status }) => {
    setStarCount((prev) => prev + 5);
    loadSummary(); // Refresh summary in background

    // Find if this corresponds to a course level
    const matchedLvl = COURSE_LEVELS.find(
      (l) => l.skill === skill || l.gameType === activeGame
    );

    if (matchedLvl) {
      setCourseProgress((prev) => {
        const completed = new Set(prev?.completedLevelIds || []);
        completed.add(matchedLvl.id);

        const isGraduated = completed.size >= COURSE_LEVELS.length;
        const nextLvl = COURSE_LEVELS.find((l) => !completed.has(l.id));

        const updated = {
          ...prev,
          completedLevelIds: Array.from(completed),
          currentLevelNum: nextLvl ? nextLvl.levelNum : COURSE_LEVELS.length,
          isGraduated,
        };

        saveChildCourseProgress(activeChild?.id, updated);

        if (isGraduated) {
          sounds.playFanfare();
          showToast(`🎓 CONGRATULATIONS! You finished all 8 Levels of the Course!`);
        } else if (nextLvl) {
          showToast(
            `⭐ Level ${matchedLvl.levelNum} Passed! Level ${nextLvl.levelNum} (${nextLvl.title}) is now UNLOCKED! 🚀`
          );
        }

        return updated;
      });
    } else {
      showToast(`⭐ Earned 5 Stars! "${skill}" saved to learning profile.`);
    }
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
          onOpenRewards={() => {
            sounds.playPop(520);
            setIsRewardsModalOpen(true);
          }}
          courseProgress={courseProgress}
          onOpenCourseMap={() => {
            sounds.playPop(520);
            setIsCourseMapOpen(true);
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
          onLaunchMathPractice={(modKey = 'addition') => {
            sounds.playPop(480);
            setAppMode('kids');
            setActiveGame(modKey);
          }}
          courseProgress={courseProgress}
          onOpenCourseMap={() => setIsCourseMapOpen(true)}
          currentScreen={parentTab}
          onScreenChange={setParentTab}
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

      {/* MODAL: STEP-BY-STEP COURSE JOURNEY MAP */}
      {isCourseMapOpen && (
        <CourseJourneyMap
          childName={activeChild?.name || 'Sarah'}
          courseProgress={courseProgress}
          onLaunchLevel={(gameType) => {
            setIsCourseMapOpen(false);
            sounds.playPop(500);
            setActiveGame(gameType);
          }}
          onToggleUnlockAll={() => {
            setCourseProgress((prev) => {
              const updated = { ...prev, allUnlocked: !prev?.allUnlocked };
              saveChildCourseProgress(activeChild?.id, updated);
              showToast(
                updated.allUnlocked
                  ? 'Parent Mode: All Levels Unlocked!'
                  : 'Sequential Level Locking Restored!'
              );
              return updated;
            });
          }}
          onResetCourse={() => {
            const reset = {
              completedLevelIds: [],
              currentLevelNum: 1,
              isGraduated: false,
              allUnlocked: false,
            };
            setCourseProgress(reset);
            saveChildCourseProgress(activeChild?.id, reset);
            showToast('Course reset to Level 1! Starting from the beginning.');
          }}
          onClose={() => setIsCourseMapOpen(false)}
        />
      )}

      {/* MODAL: STICKER BOOK */}
      {isStickerBookOpen && (
        <StickerBookModal
          childName={activeChild?.name || 'Sarah'}
          starCount={starCount}
          onClose={() => setIsStickerBookOpen(false)}
        />
      )}

      {/* MODAL: REWARDS & GAMIFICATION CLUBHOUSE */}
      {isRewardsModalOpen && (
        <RewardsAndGamificationModal
          childName={activeChild?.name || 'Sarah'}
          starCount={starCount}
          onSpendStars={(amount) => {
            setStarCount((prev) => Math.max(0, prev - amount));
          }}
          onClose={() => setIsRewardsModalOpen(false)}
        />
      )}

      {/* PLAYABLE GAME OVERLAYS */}
      {/* 1. CREATIVE MATH ADVENTURES (Addition, Subtraction, Multiplication, Division) */}
      {['addition', 'subtraction', 'multiplication', 'division', 'math'].includes(activeGame) && (
        <MathAdventureGame
          initialModule={activeGame === 'math' ? 'addition' : activeGame}
          childId={activeChild?.id || 'child_001'}
          childName={activeChild?.name || 'Sarah'}
          onClose={() => setActiveGame(null)}
          onCompleteActivity={handleGameComplete}
        />
      )}

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

      {/* FIXED MOBILE APPLICATION BOTTOM NAVIGATION BAR */}
      <nav className="mobile-app-bottom-nav" aria-label="Mobile Navigation">
        {appMode === 'kids' ? (
          <div className="mobile-nav-items kids-dock">
            <button
              type="button"
              className="mobile-nav-btn active"
              onClick={() => {
                sounds.playPop(480);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              title="Camp Home"
            >
              <span className="nav-icon" aria-hidden="true">🏕️</span>
              <span className="nav-text">Camp</span>
            </button>

            <button
              type="button"
              className="mobile-nav-btn"
              onClick={() => {
                sounds.playPop(520);
                setIsCourseMapOpen(true);
              }}
              title="Sequential Course Path"
            >
              <span className="nav-icon" aria-hidden="true">🗺️</span>
              <span className="nav-text">Course L{courseProgress?.currentLevelNum || 1}</span>
            </button>

            <button
              type="button"
              className="mobile-nav-btn"
              onClick={() => {
                sounds.playPop(520);
                setIsRewardsModalOpen(true);
              }}
              title="Rewards Clubhouse"
            >
              <span className="nav-icon" aria-hidden="true">🏆</span>
              <span className="nav-text">Rewards</span>
            </button>

            <button
              type="button"
              className="mobile-nav-btn"
              onClick={() => {
                sounds.playPop(520);
                setIsStickerBookOpen(true);
              }}
              title="Sticker Book"
            >
              <span className="nav-icon" aria-hidden="true">⭐</span>
              <span className="nav-text">Stickers</span>
            </button>

            <button
              type="button"
              className="mobile-nav-btn parent-btn"
              onClick={() => {
                sounds.playPop(440);
                setIsParentGateOpen(true);
              }}
              title="Parents Portal"
            >
              <span className="nav-icon" aria-hidden="true">🔒</span>
              <span className="nav-text">Parents</span>
            </button>
          </div>
        ) : (
          <div className="mobile-nav-items parent-dock">
            <button
              type="button"
              className={`mobile-nav-btn ${parentTab === 'screen1' ? 'active' : ''}`}
              onClick={() => {
                sounds.playPop(480);
                setParentTab('screen1');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            >
              <span className="nav-icon" aria-hidden="true">📋</span>
              <span className="nav-text">Today</span>
            </button>

            <button
              type="button"
              className={`mobile-nav-btn ${parentTab === 'analytics' ? 'active' : ''}`}
              onClick={() => {
                sounds.playPop(480);
                setParentTab('analytics');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            >
              <span className="nav-icon" aria-hidden="true">📊</span>
              <span className="nav-text">Analytics</span>
            </button>

            <button
              type="button"
              className={`mobile-nav-btn ${parentTab === 'tracker' ? 'active' : ''}`}
              onClick={() => {
                sounds.playPop(480);
                setParentTab('tracker');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            >
              <span className="nav-icon" aria-hidden="true">⚡</span>
              <span className="nav-text">Tracker</span>
            </button>

            <button
              type="button"
              className={`mobile-nav-btn ${parentTab === 'screen2' ? 'active' : ''}`}
              onClick={() => {
                sounds.playPop(480);
                setParentTab('screen2');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            >
              <span className="nav-icon" aria-hidden="true">🏡</span>
              <span className="nav-text">Home Play</span>
            </button>

            <button
              type="button"
              className="mobile-nav-btn return-kids-btn"
              onClick={() => {
                sounds.playPop(440);
                setAppMode('kids');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            >
              <span className="nav-icon" aria-hidden="true">🏕️</span>
              <span className="nav-text">Kids Camp</span>
            </button>
          </div>
        )}
      </nav>
    </div>
  );
}
