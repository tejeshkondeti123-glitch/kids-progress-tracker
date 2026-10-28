// client/src/components/ActivityTrackerView.jsx
import React, { useState, useEffect } from 'react';
import { fetchActivityLog } from '../services/api';

export default function ActivityTrackerView({
  childId = 'child_001',
  childName = 'Sarah',
  onReinforceOffline,
  onLaunchPractice,
}) {
  const [activities, setActivities] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Parent offline reinforcement check state (local state + reflection notes)
  const [reinforcedIds, setReinforcedIds] = useState(new Set());
  const [expandedNoteId, setExpandedNoteId] = useState(null);
  const [parentNotes, setParentNotes] = useState({});

  const loadActivities = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchActivityLog(childId, {
        subject: selectedSubject,
        status: selectedStatus,
        search: searchQuery,
      });
      setActivities(data.activities || []);
      setTotalCount(data.total || 0);
    } catch (err) {
      console.error('Failed to load activity log:', err);
      setError(err.message || 'Could not fetch activity log');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadActivities();
  }, [childId, selectedSubject, selectedStatus]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      loadActivities();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleToggleReinforced = (actId) => {
    const nextSet = new Set(reinforcedIds);
    if (nextSet.has(actId)) {
      nextSet.delete(actId);
    } else {
      nextSet.add(actId);
    }
    setReinforcedIds(nextSet);
  };

  const handleSaveNote = (actId, text) => {
    setParentNotes((prev) => ({
      ...prev,
      [actId]: text,
    }));
  };

  return (
    <div className="activity-tracker-container">
      {/* HEADER */}
      <div className="tracker-header-banner">
        <div className="tracker-title-group">
          <span className="tracker-tag">⚡ Interactive Activity Tracker</span>
          <h2 className="tracker-heading">
            Live Activity Feed & Practice Log
          </h2>
          <p className="tracker-subheading">
            Review detailed learning sessions for {childName}, explore real-world links, and log parent reflections.
          </p>
        </div>

        <div className="tracker-stats-pill">
          <span className="count-num">{totalCount}</span>
          <span className="count-label">Recorded Sessions</span>
        </div>
      </div>

      {/* FILTER & SEARCH CONTROL TOOLBAR */}
      <div className="tracker-filter-toolbar">
        {/* Search input */}
        <div className="tracker-search-box">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            className="tracker-search-input"
            placeholder="Search by skill (e.g. Addition, Shapes, Counting)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              type="button"
              className="btn-clear-search"
              onClick={() => setSearchQuery('')}
            >
              ✕
            </button>
          )}
        </div>

        {/* Subject Filter Pills */}
        <div className="filter-group">
          <span className="filter-group-label">Subject:</span>
          {['all', 'Math', 'Reading', 'Logic & Reasoning'].map((subj) => (
            <button
              key={subj}
              type="button"
              className={`filter-pill-btn ${selectedSubject === subj ? 'active' : ''}`}
              onClick={() => setSelectedSubject(subj)}
            >
              {subj === 'all' ? 'All Subjects' : subj}
            </button>
          ))}
        </div>

        {/* Status Filter Pills */}
        <div className="filter-group">
          <span className="filter-group-label">Status:</span>
          {[
            { id: 'all', label: 'All Statuses' },
            { id: 'practiced', label: 'Practiced / Mastered' },
            { id: 'needs_more_practice', label: 'Needs Practice' },
          ].map((st) => (
            <button
              key={st.id}
              type="button"
              className={`filter-pill-btn ${selectedStatus === st.id ? 'active' : ''}`}
              onClick={() => setSelectedStatus(st.id)}
            >
              {st.label}
            </button>
          ))}
        </div>
      </div>

      {/* ACTIVITY FEED LIST */}
      {isLoading ? (
        <div className="tracker-loading-box">
          <div className="spinner"></div>
          <p>Fetching real-time activity log...</p>
        </div>
      ) : error ? (
        <div className="tracker-error-box">
          <p>⚠️ {error}</p>
          <button type="button" className="btn-retry" onClick={loadActivities}>
            Retry
          </button>
        </div>
      ) : activities.length === 0 ? (
        <div className="tracker-empty-box">
          <span className="empty-icon">📂</span>
          <h3>No activities match your current filters</h3>
          <p>Try resetting your search or filter options, or launch a new activity with {childName}.</p>
          <button
            type="button"
            className="btn-reset-filters"
            onClick={() => {
              setSelectedSubject('all');
              setSelectedStatus('all');
              setSearchQuery('');
            }}
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="activity-feed-list">
          {activities.map((act) => {
            const isNeedsMore = act.status === 'needs_more_practice';
            const isReinforced = reinforcedIds.has(act.id);
            const note = parentNotes[act.id] || '';
            const isNoteOpen = expandedNoteId === act.id;

            return (
              <div
                key={act.id}
                className={`activity-feed-card ${isNeedsMore ? 'needs-practice' : 'mastered'} ${
                  isReinforced ? 'reinforced' : ''
                }`}
              >
                {/* Left status badge & indicator */}
                <div className="feed-card-left">
                  <div className={`status-indicator-dot ${isNeedsMore ? 'orange' : 'green'}`}></div>
                  <div className="subject-icon-avatar">
                    {act.subject === 'Math' && '🔢'}
                    {act.subject === 'Reading' && '📖'}
                    {act.subject === 'Logic & Reasoning' && '🧩'}
                    {!['Math', 'Reading', 'Logic & Reasoning'].includes(act.subject) && '🎨'}
                  </div>
                </div>

                {/* Main Card Content */}
                <div className="feed-card-main">
                  <div className="feed-card-header">
                    <div className="title-and-tags">
                      <h4 className="feed-skill-title">{act.skill}</h4>
                      <span className="feed-subject-tag">{act.subject}</span>
                      <span className={`feed-status-badge ${isNeedsMore ? 'needs' : 'done'}`}>
                        {isNeedsMore ? 'Needs More Practice' : 'Practiced'}
                      </span>
                      {isReinforced && (
                        <span className="reinforced-success-badge">
                          ✓ Reinforced Offline
                        </span>
                      )}
                    </div>

                    <div className="feed-time-meta">
                      <span className="feed-timestamp">
                        {act.completedAt ? new Date(act.completedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Today'}
                      </span>
                      <span className="feed-date">
                        {act.completedAt ? new Date(act.completedAt).toLocaleDateString([], { month: 'short', day: 'numeric' }) : ''}
                      </span>
                    </div>
                  </div>

                  <p className="feed-description">{act.description}</p>

                  {/* Practice Count & Metadata */}
                  <div className="feed-meta-row">
                    <span className="meta-item">
                      🔁 Practice Count: <strong>{act.practiceCount || 1} time(s)</strong>
                    </span>
                    <span className="meta-item">
                      ⏱️ Estimated Duration: <strong>~5 mins</strong>
                    </span>
                  </div>

                  {/* Connected Real-World Activity Link */}
                  {act.realWorldActivity && (
                    <div className="connected-realworld-box">
                      <div className="realworld-mini-info">
                        <span className="rw-tag">🏡 Real-World Connection:</span>
                        <span className="rw-title">
                          <strong>{act.realWorldActivity.title}</strong> ({act.realWorldActivity.duration})
                        </span>
                      </div>
                      <button
                        type="button"
                        className="btn-view-realworld"
                        onClick={() =>
                          onReinforceOffline &&
                          onReinforceOffline({
                            skill: act.skill,
                            activityId: act.realWorldActivity.id,
                            status: act.status,
                          })
                        }
                      >
                        Open Guide →
                      </button>
                    </div>
                  )}

                  {/* Parent Reflection Note Box */}
                  {isNoteOpen && (
                    <div className="parent-note-editor">
                      <label htmlFor={`note-${act.id}`} className="note-editor-label">
                        Parent Reflection / Offline Observation:
                      </label>
                      <textarea
                        id={`note-${act.id}`}
                        className="parent-note-textarea"
                        placeholder="Add a note (e.g. Practiced with grapes at snack time, grasped concept quickly)..."
                        value={note}
                        onChange={(e) => handleSaveNote(act.id, e.target.value)}
                        rows={2}
                      />
                    </div>
                  )}

                  {/* ACTION BUTTONS ROW */}
                  <div className="feed-actions-row">
                    <button
                      type="button"
                      className={`btn-action-pill ${isReinforced ? 'active-reinforced' : ''}`}
                      onClick={() => handleToggleReinforced(act.id)}
                    >
                      {isReinforced ? '✓ Mark Completed' : '➕ Mark Reinforced Offline'}
                    </button>

                    <button
                      type="button"
                      className="btn-action-pill"
                      onClick={() => setExpandedNoteId(isNoteOpen ? null : act.id)}
                    >
                      💬 {note ? 'Edit Note' : 'Add Note'}
                    </button>

                    {act.subject === 'Math' && (
                      <button
                        type="button"
                        className="btn-action-pill highlight"
                        onClick={() =>
                          onLaunchPractice &&
                          onLaunchPractice(
                            act.skill.toLowerCase().includes('addition')
                              ? 'addition'
                              : act.skill.toLowerCase().includes('subtraction')
                              ? 'subtraction'
                              : act.skill.toLowerCase().includes('multiplication')
                              ? 'multiplication'
                              : act.skill.toLowerCase().includes('division')
                              ? 'division'
                              : 'addition'
                          )
                        }
                      >
                        🎮 Practice Again in Camp
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
