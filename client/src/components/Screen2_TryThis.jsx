// client/src/components/Screen2_TryThis.jsx
import React, { useState, useEffect } from 'react';
import { fetchActivityDetails, saveObservation, fetchObservations } from '../services/api';

export default function Screen2_TryThis({
  childId = 'child_001',
  practiceOpportunity,
  version,
  onNavigateBack,
}) {
  const [activity, setActivity] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Observation form state
  const [selectedObs, setSelectedObs] = useState('');
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');
  const [previousObservations, setPreviousObservations] = useState([]);
  const [showHistory, setShowHistory] = useState(false);

  // V3 Interactive Step Checklist state
  const [checkedSteps, setCheckedSteps] = useState({});

  const activityId = practiceOpportunity?.activityId || 'real_001';
  const skill = practiceOpportunity?.skill || 'Counting 1-10';

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    setError(null);

    Promise.all([
      fetchActivityDetails(activityId),
      fetchObservations(childId),
    ])
      .then(([actData, obsData]) => {
        if (!isMounted) return;
        setActivity(actData);
        setPreviousObservations(obsData || []);
        setIsLoading(false);
      })
      .catch((err) => {
        if (!isMounted) return;
        console.error('Error loading activity details:', err);
        setError(err.message || 'Failed to load activity details');
        setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [activityId, childId]);

  const handleToggleStep = (index) => {
    setCheckedSteps((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const handleSaveObservation = async (e) => {
    e.preventDefault();
    if (!selectedObs) {
      alert('Please select how your child did during the activity.');
      return;
    }

    setIsSubmitting(true);
    setSaveSuccessMsg('');
    setError(null);

    try {
      const res = await saveObservation(childId, {
        activityId,
        observation: selectedObs,
        note,
      });

      setSaveSuccessMsg(res.message || 'Observation saved.');
      // Refresh previous observations list
      const updatedObs = await fetchObservations(childId);
      setPreviousObservations(updatedObs);
      // Reset form slightly or keep selection
      setIsSubmitting(false);
    } catch (err) {
      console.error('Error saving observation:', err);
      setError(err.message || 'Failed to save observation');
      setIsSubmitting(false);
    }
  };

  const observationOptions = [
    {
      value: 'independent',
      label: 'Did it independently',
      icon: '🟢',
      description: 'Understood and completed the activity on their own',
    },
    {
      value: 'needed_help',
      label: 'Needed some help',
      icon: '🟡',
      description: 'Needed hints, prompts, or guidance along the way',
    },
    {
      value: 'difficult',
      label: 'Found it difficult',
      icon: '🟠',
      description: 'Struggled with the concept or seemed frustrated',
    },
  ];

  if (isLoading) {
    return (
      <main className="content-body" aria-busy="true" aria-live="polite">
        <div className="state-container">
          <div className="state-icon" aria-hidden="true">⏳</div>
          <h2 className="state-title">Loading activity...</h2>
          <p className="state-desc">Preparing simple real-world activity instructions.</p>
        </div>
      </main>
    );
  }

  if (error && !activity) {
    return (
      <main className="content-body" role="alert">
        <div className="state-container">
          <div className="state-icon" aria-hidden="true">⚠️</div>
          <h2 className="state-title">Unable to load activity</h2>
          <p className="state-desc">{error}</p>
          <button type="button" className="btn-back" onClick={onNavigateBack} style={{ marginTop: '16px' }}>
            ← Back to Today&apos;s Learning
          </button>
        </div>
      </main>
    );
  }

  const instructions = activity?.instructions || [];

  return (
    <div>
      {/* Screen Navigation & Header */}
      <header className="screen2-nav-header">
        <button
          type="button"
          id="btn-back-to-screen1"
          className="btn-back"
          onClick={onNavigateBack}
          aria-label="Back to Today's Learning"
        >
          <span aria-hidden="true">←</span>
          <span>Today&apos;s Learning</span>
        </button>

        <span className="duration-pill" aria-label={`Duration: ${activity?.duration || '5 minutes'}`}>
          <span aria-hidden="true">⏱️</span> {activity?.duration || '5 minutes'}
        </span>
      </header>

      <main className="content-body">
        {/* Title and Concept Connection */}
        <section aria-labelledby="screen2-main-title">
          <h1 id="screen2-main-title" className="screen-title" style={{ marginTop: 0 }}>
            Try This With Your Child
          </h1>

          <div className="concept-bridge-banner" style={{ marginTop: '12px' }}>
            <div className="concept-bridge-label">Concept: {skill}</div>
            <p className="concept-bridge-text">
              &ldquo;Your child practiced counting objects in the app today.&rdquo;
            </p>
          </div>
        </section>

        {/* Real-World Activity Card */}
        <section aria-labelledby="activity-title" className="activity-box">
          <div className="activity-box-top">
            <div>
              <span
                style={{
                  fontSize: '0.78rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  fontWeight: 700,
                  color: '#0284c7',
                }}
              >
                Real-Life Reinforcement
              </span>
              <h2 id="activity-title" className="activity-box-title">
                {activity?.title || 'Count 5 Objects'}
              </h2>
            </div>
          </div>

          <p style={{ fontSize: '0.92rem', color: '#475569', marginBottom: '14px' }}>
            {activity?.description}
          </p>

          {/* Step-by-Step Instructions */}
          <div className="section-header" style={{ marginBottom: '8px' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a' }}>
              Instructions:
            </h3>
            {version === 'V3' && (
              <span style={{ fontSize: '0.78rem', color: '#0369a1', fontWeight: 600 }}>
                Check off steps as you go!
              </span>
            )}
          </div>

          <ol className="instructions-list" style={{ listStyle: 'none' }}>
            {instructions.map((stepText, idx) => {
              const isChecked = !!checkedSteps[idx];

              return (
                <li key={idx} className="instruction-step">
                  {version === 'V3' ? (
                    <input
                      type="checkbox"
                      id={`step-${idx}`}
                      className="step-checkbox"
                      checked={isChecked}
                      onChange={() => handleToggleStep(idx)}
                      aria-label={`Step ${idx + 1}: ${stepText}`}
                    />
                  ) : (
                    <span className="step-number" aria-hidden="true">{idx + 1}</span>
                  )}

                  <label
                    htmlFor={`step-${idx}`}
                    style={{
                      cursor: version === 'V3' ? 'pointer' : 'default',
                      textDecoration: isChecked && version === 'V3' ? 'line-through' : 'none',
                      color: isChecked && version === 'V3' ? '#94a3b8' : 'var(--text-primary)',
                      flex: 1,
                    }}
                  >
                    {stepText}
                  </label>
                </li>
              );
            })}
          </ol>

          {/* Why this activity? */}
          <div className="why-activity-card">
            <h4 className="why-activity-title">
              <span aria-hidden="true">💡</span> Why this activity?
            </h4>
            <p className="why-activity-desc">
              {activity?.reason ||
                'This activity helps your child use the counting concept in an everyday situation.'}
            </p>
          </div>
        </section>

        {/* Parent Observation Section */}
        <section aria-labelledby="observation-heading" className="observation-card">
          <h2 id="observation-heading" className="observation-heading">
            How did your child do?
          </h2>
          <p style={{ fontSize: '0.88rem', color: '#64748b', marginBottom: '14px' }}>
            Reflect on Sarah&apos;s experience. This helps track progress without tests or pressure.
          </p>

          {saveSuccessMsg && (
            <div className="feedback-banner success" role="status" aria-live="polite">
              <span aria-hidden="true">✅</span>
              <span>{saveSuccessMsg}</span>
            </div>
          )}

          {error && (
            <div className="feedback-banner error" role="alert">
              <span aria-hidden="true">⚠️</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSaveObservation}>
            <div className="observation-options-grid" role="radiogroup" aria-label="How did your child do?">
              {observationOptions.map((opt) => {
                const isSelected = selectedObs === opt.value;

                return (
                  <label
                    key={opt.value}
                    className={`obs-option-pill ${isSelected ? 'selected' : ''}`}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="obs-pill-label">
                      <span aria-hidden="true">{opt.icon}</span>
                      <div>
                        <div>{opt.label}</div>
                        {(version === 'V2' || version === 'V3') && (
                          <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 400 }}>
                            {opt.description}
                          </div>
                        )}
                      </div>
                    </div>

                    <input
                      type="radio"
                      name="observation"
                      value={opt.value}
                      checked={isSelected}
                      onChange={() => setSelectedObs(opt.value)}
                      className="obs-radio"
                      required
                    />
                  </label>
                );
              })}
            </div>

            {/* Optional Parent Note */}
            <div className="note-input-container">
              <label htmlFor="parent-note" className="note-label">
                Add an optional note:
              </label>
              <textarea
                id="parent-note"
                className="note-textarea"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="e.g. Needed help counting after adding another object..."
                maxLength={500}
              />
            </div>

            <button
              type="submit"
              id="btn-save-observation"
              className="btn-primary-action"
              disabled={isSubmitting}
            >
              <span>{isSubmitting ? 'Saving...' : 'Save Observation'}</span>
              <span aria-hidden="true">✓</span>
            </button>
          </form>

          {/* Previous Observations History */}
          <div className="previous-obs-section">
            <button
              type="button"
              className="previous-obs-toggle"
              onClick={() => setShowHistory(!showHistory)}
              aria-expanded={showHistory}
            >
              <span>{showHistory ? '▼ Hide previous observations' : '▶ View previous observations'}</span>
              <span>({previousObservations.length})</span>
            </button>

            {showHistory && (
              <div className="obs-history-list">
                {previousObservations.length === 0 ? (
                  <p style={{ fontSize: '0.82rem', color: '#94a3b8', padding: '6px 0' }}>
                    No previous observations recorded yet.
                  </p>
                ) : (
                  previousObservations.map((obs) => {
                    const badgeColor =
                      obs.observation === 'independent'
                        ? '#16a34a'
                        : obs.observation === 'needed_help'
                        ? '#d97706'
                        : '#ea580c';

                    const obsLabel =
                      obs.observation === 'independent'
                        ? 'Did it independently'
                        : obs.observation === 'needed_help'
                        ? 'Needed some help'
                        : 'Found it difficult';

                    return (
                      <div key={obs.id} className="obs-history-item">
                        <div className="obs-history-header">
                          <strong style={{ color: '#0f172a' }}>{obs.activityTitle || skill}</strong>
                          <span style={{ fontSize: '0.78rem', fontWeight: 700, color: badgeColor }}>
                            {obsLabel}
                          </span>
                        </div>
                        {obs.note && (
                          <p style={{ color: '#475569', fontSize: '0.82rem', marginTop: '3px' }}>
                            &ldquo;{obs.note}&rdquo;
                          </p>
                        )}
                        <span style={{ fontSize: '0.72rem', color: '#94a3b8', display: 'block', marginTop: '4px' }}>
                          {new Date(obs.createdAt).toLocaleString(undefined, {
                            dateStyle: 'medium',
                            timeStyle: 'short',
                          })}
                        </span>
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
