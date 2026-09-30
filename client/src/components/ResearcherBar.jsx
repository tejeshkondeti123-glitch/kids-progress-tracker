// client/src/components/ResearcherBar.jsx
import React, { useState } from 'react';

export default function ResearcherBar({
  currentVersion,
  onVersionChange,
  scenario,
  onScenarioChange,
  onResetDemo,
  isResetting,
}) {
  const [showDetails, setShowDetails] = useState(false);

  const versionDescriptions = {
    V1: 'V1 (Baseline): Direct, essential 2-screen flow for daily learning and 5-min reinforcement.',
    V2: 'V2 (User 1 Feedback): Enhanced pedagogical clarity, helper tags, and parent preparation tip.',
    V3: 'V3 (User 2 Feedback): Interactive step checklist during activity, celebration badge & reflection.',
  };

  return (
    <header className="researcher-bar" role="region" aria-label="Researcher Academic Controls">
      <div className="researcher-brand">
        <span className="researcher-tag">Academic HCD Prototype</span>
        <span>Khan Kids Parent Companion</span>
      </div>

      <div className="researcher-controls">
        {/* Prototype Version Switcher */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Version:</span>
          <div className="version-pill-group" role="radiogroup" aria-label="Prototype Version">
            {['V1', 'V2', 'V3'].map((v) => (
              <button
                key={v}
                type="button"
                className={`version-btn ${currentVersion === v ? 'active' : ''}`}
                onClick={() => onVersionChange(v)}
                title={versionDescriptions[v]}
                aria-checked={currentVersion === v}
                role="radio"
              >
                {v}
              </button>
            ))}
          </div>
        </div>

        {/* Date / Scenario Switcher for Academic Testing */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Data:</span>
          <select
            value={scenario}
            onChange={(e) => onScenarioChange(e.target.value)}
            style={{
              background: '#1e293b',
              color: '#f8fafc',
              border: '1px solid #334155',
              padding: '4px 8px',
              borderRadius: '6px',
              fontSize: '0.78rem',
              cursor: 'pointer',
            }}
            aria-label="Testing Scenario"
          >
            <option value="today">Today (Active: 3 Activities)</option>
            <option value="empty">Empty Day (0 Activities)</option>
          </select>
        </div>

        {/* Reset Demo Data Button */}
        <button
          type="button"
          className="researcher-action-btn reset-btn"
          onClick={onResetDemo}
          disabled={isResetting}
          title="Restore initial seed state in SQLite database"
        >
          {isResetting ? 'Resetting...' : '↺ Reset Demo Data'}
        </button>

        {/* Details Toggle */}
        <button
          type="button"
          className="researcher-action-btn"
          onClick={() => setShowDetails(!showDetails)}
          style={{ background: showDetails ? '#2563eb' : '#334155' }}
        >
          {showDetails ? 'Hide Notes' : 'HCD Notes'}
        </button>
      </div>

      {showDetails && (
        <div
          style={{
            width: '100%',
            background: '#1e293b',
            border: '1px solid #334155',
            borderRadius: '8px',
            padding: '10px 14px',
            marginTop: '6px',
            fontSize: '0.8rem',
            color: '#cbd5e1',
            lineHeight: 1.4,
          }}
        >
          <strong style={{ color: '#60a5fa' }}>Current Active Version: {currentVersion}</strong> —{' '}
          {versionDescriptions[currentVersion]}
          <div style={{ marginTop: '4px', color: '#94a3b8' }}>
            <em>HCD Question Addressed:</em> &ldquo;How might we help parents quickly understand what their child learned and reinforce it through simple real-life activities?&rdquo;
          </div>
        </div>
      )}
    </header>
  );
}
