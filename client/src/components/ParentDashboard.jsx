// client/src/components/ParentDashboard.jsx
import React, { useState } from 'react';
import Screen1_TodaysLearning from './Screen1_TodaysLearning';
import Screen2_TryThis from './Screen2_TryThis';
import ProgressAnalyticsView from './ProgressAnalyticsView';
import ActivityTrackerView from './ActivityTrackerView';
import { CharacterAvatar } from './Characters';

export default function ParentDashboard({
  activeChild,
  availableChildren = [],
  onSelectChild,
  version,
  onVersionChange,
  scenario,
  onScenarioChange,
  onResetDemo,
  isResetting,
  summary,
  isLoading,
  error,
  onReloadSummary,
  onReturnToKidsApp,
  onLaunchMathPractice,
  courseProgress,
  onOpenCourseMap,
  currentScreen: controlledScreen,
  onScreenChange,
}) {
  const [internalScreen, setInternalScreen] = useState('screen1'); // 'screen1' | 'screen2' | 'analytics' | 'tracker'
  const currentScreen = controlledScreen || internalScreen;

  const setCurrentScreen = (scr) => {
    setInternalScreen(scr);
    if (onScreenChange) onScreenChange(scr);
  };

  const [selectedOpportunity, setSelectedOpportunity] = useState(null);

  const effectiveOpportunity = selectedOpportunity || summary?.practiceOpportunity;
  const completedCount = courseProgress?.completedLevelIds?.length || 0;
  const percentComplete = Math.round((completedCount / 8) * 100);

  const handleNavigateToScreen2 = (opportunity) => {
    if (opportunity) {
      setSelectedOpportunity(opportunity);
    }
    setCurrentScreen('screen2');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigateBackToScreen1 = () => {
    setCurrentScreen('screen1');
    onReloadSummary();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="parent-companion-section">
      {/* Top Breadcrumb & Return to Kids App Header */}
      <div className="parent-return-banner">
        <div className="return-banner-left">
          <button
            type="button"
            className="btn-return-kids-app"
            onClick={onReturnToKidsApp}
            aria-label="Return to Khan Academy Kids App"
          >
            <span aria-hidden="true">🏕️</span>
            <span className="btn-return-text-desktop">← Return to Khan Academy Kids</span>
            <span className="btn-return-text-mobile">← Kids Camp</span>
          </button>
        </div>

        <div className="return-banner-right">
          <div className="parent-child-switcher">
            <span className="child-switcher-label">Learner:</span>
            <div className="child-badge-mini">
              <CharacterAvatar avatar={activeChild?.avatar} size={22} />
              <select
                className="child-select-dropdown"
                value={activeChild?.id}
                onChange={(e) => {
                  const found = availableChildren.find((c) => c.id === e.target.value);
                  if (found) onSelectChild(found);
                }}
                aria-label="Select learner"
              >
                {availableChildren.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.age}y)
                  </option>
                ))}
              </select>
            </div>
          </div>
          <span className="live-status-pill" title="Live Connected to Kids App">
            <span className="status-dot"></span>
            <span className="live-status-text">Live</span>
          </span>
        </div>
      </div>

      {/* PARENT COURSE PROGRESSION BANNER */}
      <div className="parent-course-roadmap-banner">
        <div className="roadmap-banner-top">
          <span className="roadmap-icon">🗺️</span>
          <div className="roadmap-meta">
            <span className="roadmap-title">
              {percentComplete >= 100
                ? `🎓 Course Completed! ${activeChild?.name || 'Sarah'} graduated!`
                : `Level Progression: Level ${courseProgress?.currentLevelNum || 4} of 8 (${percentComplete}% Mastered)`}
            </span>
            <span className="roadmap-sub">
              {completedCount} of 8 levels completed • Level-by-level
            </span>
          </div>
        </div>

        <div className="roadmap-banner-bottom">
          <div className="roadmap-progress-track">
            <div className="roadmap-fill" style={{ width: `${percentComplete}%` }}></div>
          </div>
          {onOpenCourseMap && (
            <button
              type="button"
              className="btn-open-roadmap-map"
              onClick={onOpenCourseMap}
            >
              Inspect Course Map ➔
            </button>
          )}
        </div>
      </div>

      {/* PARENT COMPANION NAVIGATION TABS */}
      <div className="parent-nav-tabs-wrapper">
        <div className="parent-nav-tabs">
          <button
            type="button"
            className={`parent-nav-tab-btn ${currentScreen === 'screen1' ? 'active' : ''}`}
            onClick={() => setCurrentScreen('screen1')}
          >
            <span className="nav-tab-icon">📋</span>
            <span className="nav-tab-text">Today's Learning</span>
          </button>

          <button
            type="button"
            className={`parent-nav-tab-btn ${currentScreen === 'analytics' ? 'active' : ''}`}
            onClick={() => setCurrentScreen('analytics')}
          >
            <span className="nav-tab-icon">📊</span>
            <span className="nav-tab-text">Analytics</span>
          </button>

          <button
            type="button"
            className={`parent-nav-tab-btn ${currentScreen === 'tracker' ? 'active' : ''}`}
            onClick={() => setCurrentScreen('tracker')}
          >
            <span className="nav-tab-icon">⚡</span>
            <span className="nav-tab-text">Activity Tracker</span>
          </button>

          <button
            type="button"
            className={`parent-nav-tab-btn ${currentScreen === 'screen2' ? 'active' : ''}`}
            onClick={() => setCurrentScreen('screen2')}
          >
            <span className="nav-tab-icon">🏡</span>
            <span className="nav-tab-text">Home Play</span>
            {effectiveOpportunity && (
              <span className="nav-tab-badge">Recommended</span>
            )}
          </button>
        </div>
      </div>

      {/* Parent Content Shell */}
      <div className="app-shell">
        <div className="screen-card-container">
          {currentScreen === 'screen1' && (
            <Screen1_TodaysLearning
              summary={summary}
              isLoading={isLoading}
              error={error}
              version={version}
              onNavigateToScreen2={handleNavigateToScreen2}
              onRetry={onReloadSummary}
            />
          )}

          {currentScreen === 'analytics' && (
            <ProgressAnalyticsView
              childId={activeChild?.id || 'child_001'}
              childName={activeChild?.name || 'Sarah'}
              onLaunchMathPractice={onLaunchMathPractice}
            />
          )}

          {currentScreen === 'tracker' && (
            <ActivityTrackerView
              childId={activeChild?.id || 'child_001'}
              childName={activeChild?.name || 'Sarah'}
              onReinforceOffline={(opp) => handleNavigateToScreen2(opp)}
              onLaunchPractice={onLaunchMathPractice}
            />
          )}

          {currentScreen === 'screen2' && (
            <Screen2_TryThis
              childId={activeChild?.id || 'child_001'}
              practiceOpportunity={effectiveOpportunity}
              version={version}
              onNavigateBack={handleNavigateBackToScreen1}
            />
          )}
        </div>
      </div>
    </div>
  );
}

