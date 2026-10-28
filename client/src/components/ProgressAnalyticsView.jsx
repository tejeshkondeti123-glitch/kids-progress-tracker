// client/src/components/ProgressAnalyticsView.jsx
import React, { useState, useEffect } from 'react';
import { fetchAnalytics } from '../services/api';
import { CharacterAvatar } from './Characters';

export default function ProgressAnalyticsView({
  childId = 'child_001',
  childName = 'Sarah',
  onLaunchMathPractice,
}) {
  const [analytics, setAnalytics] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeCategoryFilter, setActiveCategoryFilter] = useState('all');

  const loadAnalytics = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchAnalytics(childId);
      setAnalytics(data);
    } catch (err) {
      console.error('Failed to load analytics:', err);
      setError(err.message || 'Could not load analytics');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, [childId]);

  if (isLoading) {
    return (
      <div className="analytics-loading-box">
        <div className="spinner"></div>
        <p>Crunching learning progress & milestone analytics for {childName}...</p>
      </div>
    );
  }

  if (error || !analytics) {
    return (
      <div className="analytics-error-box">
        <p>⚠️ {error || 'No analytics data available.'}</p>
        <button type="button" className="btn-retry" onClick={loadAnalytics}>
          Retry
        </button>
      </div>
    );
  }

  const { metrics, subjectBreakdown = [], trend7Days = [], milestones = [] } = analytics;

  const filteredMilestones =
    activeCategoryFilter === 'all'
      ? milestones
      : milestones.filter((m) => m.category.toLowerCase() === activeCategoryFilter.toLowerCase());

  return (
    <div className="progress-analytics-container">
      {/* HEADER SECTION */}
      <div className="analytics-header-banner">
        <div className="analytics-title-group">
          <span className="analytics-tag">📊 Milestone & Progress Analytics</span>
          <h2 className="analytics-heading">
            {childName}'s Learning Mastery & Growth
          </h2>
          <p className="analytics-subheading">
            Holistic academic tracking across Math, Literacy, and Foundational Logic.
          </p>
        </div>

        <div className="analytics-actions">
          <button
            type="button"
            className="btn-print-report"
            onClick={() => window.print()}
            title="Print or Save PDF report"
          >
            🖨️ Export Report
          </button>
          <button
            type="button"
            className="btn-practice-quick"
            onClick={() => onLaunchMathPractice && onLaunchMathPractice('addition')}
          >
            🚀 Launch Math Adventure
          </button>
        </div>
      </div>

      {/* KPI METRICS ROW */}
      <div className="kpi-cards-grid">
        <div className="kpi-card">
          <div className="kpi-icon-box minutes">⏱️</div>
          <div className="kpi-details">
            <span className="kpi-val">{metrics.estimatedMinutes} mins</span>
            <span className="kpi-lbl">Total Learning Time</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-box sessions">🎯</div>
          <div className="kpi-details">
            <span className="kpi-val">{metrics.totalPracticeSessions}</span>
            <span className="kpi-lbl">Practice Sessions</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-box accuracy">🌟</div>
          <div className="kpi-details">
            <span className="kpi-val">{metrics.accuracyPercent}%</span>
            <span className="kpi-lbl">Independence & Accuracy</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-box milestones">🏆</div>
          <div className="kpi-details">
            <span className="kpi-val">
              {metrics.milestonesUnlocked} / {metrics.milestonesTotal}
            </span>
            <span className="kpi-lbl">Milestones Unlocked</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-box streak">🔥</div>
          <div className="kpi-details">
            <span className="kpi-val">{metrics.currentStreakDays} Days</span>
            <span className="kpi-lbl">Active Streak</span>
          </div>
        </div>
      </div>

      {/* 2-COLUMN ANALYTICS GRID: TRENDS + SUBJECT MASTERY */}
      <div className="analytics-dual-columns">
        {/* LEFT COLUMN: 7-DAY ACTIVITY TREND CHART */}
        <div className="analytics-panel trend-panel">
          <div className="panel-header">
            <div className="panel-title-group">
              <h3 className="panel-title">📈 7-Day Activity Trends</h3>
              <span className="panel-subtitle">Daily practice engagement</span>
            </div>
            <span className="trend-summary-pill">
              {trend7Days.reduce((acc, t) => acc + t.sessions, 0)} sessions this week
            </span>
          </div>

          <div className="trend-bars-chart">
            {trend7Days.map((item, idx) => {
              const maxSessions = Math.max(...trend7Days.map((t) => t.sessions), 4);
              const heightPercent = Math.max(12, Math.round((item.sessions / maxSessions) * 100));

              return (
                <div key={idx} className="trend-bar-column">
                  <div className="bar-track">
                    <div
                      className={`bar-fill ${item.sessions > 0 ? 'active' : 'empty'}`}
                      style={{ height: `${heightPercent}%` }}
                      title={`${item.day}: ${item.sessions} sessions (${item.minutes} mins)`}
                    >
                      {item.sessions > 0 && <span className="bar-val">{item.sessions}</span>}
                    </div>
                  </div>
                  <span className="bar-day">{item.day}</span>
                  <span className="bar-date-mini">{item.date.slice(5)}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT COLUMN: SUBJECT MASTERY BREAKDOWN */}
        <div className="analytics-panel subjects-panel">
          <div className="panel-header">
            <div className="panel-title-group">
              <h3 className="panel-title">🎓 Subject Mastery Breakdown</h3>
              <span className="panel-subtitle">Competency distribution across domains</span>
            </div>
          </div>

          <div className="subject-meters-list">
            {subjectBreakdown.map((subj) => (
              <div key={subj.subject} className="subject-meter-item">
                <div className="meter-info-row">
                  <span className="subject-name-tag">
                    {subj.subject === 'Math' && '🔢 '}
                    {subj.subject === 'Reading' && '📖 '}
                    {subj.subject === 'Logic & Reasoning' && '🧩 '}
                    {subj.subject === 'Creative & Arts' && '🎨 '}
                    {subj.subject}
                  </span>
                  <div className="meter-meta">
                    <span className="meta-sessions">{subj.totalSessions} sessions</span>
                    <span className="meta-percent">{subj.accuracyPercent}% Mastery</span>
                  </div>
                </div>

                <div className="meter-track">
                  <div
                    className={`meter-bar-fill subj-${subj.subject.toLowerCase().replace(/[^a-z]/g, '')}`}
                    style={{ width: `${Math.max(8, subj.accuracyPercent)}%` }}
                  ></div>
                </div>

                {subj.skills.length > 0 && (
                  <div className="skills-tags-row">
                    {subj.skills.map((sk) => (
                      <span key={sk} className="skill-chip">
                        ✓ {sk}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* MILESTONE BADGES ROADMAP SECTION */}
      <div className="analytics-panel milestones-roadmap-panel">
        <div className="panel-header">
          <div className="panel-title-group">
            <h3 className="panel-title">🏅 Milestones & Competency Badges</h3>
            <span className="panel-subtitle">
              Recognizing developmental achievements and skill milestones
            </span>
          </div>

          {/* Filter tabs */}
          <div className="milestone-filter-tabs">
            {['all', 'Math', 'Literacy', 'Habit', 'Rewards'].map((cat) => (
              <button
                key={cat}
                type="button"
                className={`milestone-tab ${activeCategoryFilter === cat ? 'active' : ''}`}
                onClick={() => setActiveCategoryFilter(cat)}
              >
                {cat === 'all' ? 'All Badges' : cat}
              </button>
            ))}
          </div>
        </div>

        <div className="milestones-roadmap-grid">
          {filteredMilestones.map((m) => (
            <div
              key={m.id}
              className={`milestone-badge-card ${m.isUnlocked ? 'unlocked' : 'in-progress'}`}
            >
              <div className="milestone-icon-bubble">
                <span className="m-icon">{m.icon}</span>
                {m.isUnlocked && <span className="m-check">✓</span>}
              </div>

              <div className="milestone-content">
                <div className="m-badge-header">
                  <h4 className="m-title">{m.title}</h4>
                  <span className="m-cat-tag">{m.category}</span>
                </div>
                <p className="m-desc">{m.description}</p>

                <div className="m-progress-meter">
                  <div className="m-track">
                    <div
                      className="m-fill"
                      style={{ width: `${Math.round(m.progress * 100)}%` }}
                    ></div>
                  </div>
                  <span className="m-progress-lbl">
                    {m.isUnlocked ? 'Unlocked ✨' : `${Math.round(m.progress * 100)}% Complete`}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
