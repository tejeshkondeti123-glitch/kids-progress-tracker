// client/src/components/ParentDashboard.jsx
import React, { useState } from 'react';
import ResearcherBar from './ResearcherBar';
import Screen1_TodaysLearning from './Screen1_TodaysLearning';
import Screen2_TryThis from './Screen2_TryThis';
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
}) {
  const [currentScreen, setCurrentScreen] = useState('screen1'); // 'screen1' | 'screen2'
  const [selectedOpportunity, setSelectedOpportunity] = useState(null);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'observations'

  const effectiveOpportunity = selectedOpportunity || summary?.practiceOpportunity;

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
            <span>← Return to Khan Academy Kids</span>
          </button>
        </div>

        <div className="return-banner-right">
          <div className="parent-child-switcher">
            <span className="child-switcher-label">Learner:</span>
            <div className="child-badge-mini">
              <CharacterAvatar avatar={activeChild?.avatar} size={28} />
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
                    {c.name} (Age {c.age})
                  </option>
                ))}
              </select>
            </div>
          </div>
          <span className="live-status-pill">
            <span className="status-dot"></span> Live Connected
          </span>
        </div>
      </div>

      {/* Academic Researcher Bar */}
      <ResearcherBar
        currentVersion={version}
        onVersionChange={onVersionChange}
        scenario={scenario}
        onScenarioChange={onScenarioChange}
        onResetDemo={onResetDemo}
        isResetting={isResetting}
      />

      {/* Parent Content Shell */}
      <div className="app-shell">
        <div className="screen-card-container">
          {currentScreen === 'screen1' ? (
            <Screen1_TodaysLearning
              summary={summary}
              isLoading={isLoading}
              error={error}
              version={version}
              onNavigateToScreen2={handleNavigateToScreen2}
              onRetry={onReloadSummary}
            />
          ) : (
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
