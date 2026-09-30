// client/src/components/Screen1_TodaysLearning.jsx
import React from 'react';

export default function Screen1_TodaysLearning({
  summary,
  isLoading,
  error,
  version,
  onNavigateToScreen2,
  onRetry,
}) {
  // Format friendly date string (e.g. "Today • Monday, Sep 21")
  const formattedDate = React.useMemo(() => {
    if (!summary || !summary.date) return 'Today';
    try {
      const d = new Date(summary.date + 'T00:00:00');
      const options = { weekday: 'short', month: 'short', day: 'numeric' };
      return `Today • ${d.toLocaleDateString(undefined, options)}`;
    } catch {
      return 'Today';
    }
  }, [summary]);

  if (isLoading) {
    return (
      <main className="content-body" aria-busy="true" aria-live="polite">
        <div className="state-container">
          <div className="state-icon" aria-hidden="true">⏳</div>
          <h2 className="state-title">Loading today&apos;s learning...</h2>
          <p className="state-desc">Fetching Sarah&apos;s latest Khan Academy Kids activities.</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="content-body" role="alert">
        <div className="state-container">
          <div className="state-icon" aria-hidden="true">⚠️</div>
          <h2 className="state-title">Something went wrong while loading today&apos;s learning.</h2>
          <p className="state-desc">{error}</p>
          <button
            type="button"
            className="researcher-action-btn"
            onClick={onRetry}
            style={{ marginTop: '16px', padding: '8px 18px', background: '#0284c7', color: 'white' }}
          >
            Try Again
          </button>
        </div>
      </main>
    );
  }

  const child = summary?.child || { name: 'Sarah', age: 7 };
  const activities = summary?.activities || [];
  const practiceOpportunity = summary?.practiceOpportunity;

  return (
    <div>
      {/* Screen Header */}
      <header className="app-header">
        <div className="header-top">
          <div className="child-badge">
            <div className="child-avatar" aria-hidden="true">👧</div>
            <div className="child-info">
              <h2>{child.name}</h2>
              <p>Age {child.age} • Early Learner</p>
            </div>
          </div>
          <div className="date-pill" aria-label={`Date: ${formattedDate}`}>{formattedDate}</div>
        </div>

        <h1 className="screen-title">Today&apos;s Learning</h1>
        <p className="screen-subtitle">
          {version === 'V2' || version === 'V3'
            ? 'A quick overview of what Sarah practiced and how you can support her.'
            : 'Review what your child practiced and discover a quick home activity.'}
        </p>

        {/* V3 Enhancement: Friendly Effort / Progress Callout */}
        {version === 'V3' && activities.length > 0 && (
          <div
            style={{
              marginTop: '12px',
              padding: '8px 14px',
              background: '#ecfdf5',
              border: '1px solid #a7f3d0',
              borderRadius: '10px',
              fontSize: '0.85rem',
              color: '#065f46',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontWeight: '600',
            }}
          >
            <span>🌟</span>
            <span>Great curiosity today! Sarah engaged with {activities.length} digital learning items.</span>
          </div>
        )}
      </header>

      <main className="content-body">
        {/* SECTION: What your child learned */}
        <section aria-labelledby="section-learned-title">
          <div className="section-header">
            <h2 id="section-learned-title" className="section-title">
              <span>📚</span> What your child learned
            </h2>
            <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
              {activities.length} {activities.length === 1 ? 'activity' : 'activities'}
            </span>
          </div>

          {activities.length === 0 ? (
            <div className="state-container" style={{ background: '#f8fafc', borderRadius: '14px', padding: '28px 20px' }}>
              <div className="state-icon" aria-hidden="true">📖</div>
              <h3 className="state-title">No learning activities recorded for today.</h3>
              <p className="state-desc">
                When Sarah completes activities in Khan Academy Kids, they will automatically appear here.
              </p>
            </div>
          ) : (
            <div className="activities-list">
              {activities.map((item) => {
                const isNeedsPractice = item.status === 'needs_more_practice';
                const statusLabel = isNeedsPractice ? 'Needs more practice' : 'Practiced';

                return (
                  <article key={item.id || item.skill} className="learning-card">
                    <div className="learning-card-header">
                      <h3 className="learning-skill-name">
                        <span>{item.subject === 'Math' ? '🔢' : '📖'}</span>
                        {item.skill}
                      </h3>
                      <span
                        className={`status-badge ${isNeedsPractice ? 'needs_more_practice' : 'practiced'}`}
                        aria-label={`Status: ${statusLabel}`}
                      >
                        {isNeedsPractice ? '⚠️ Needs more practice' : '✓ Practiced'}
                      </span>
                    </div>

                    <p className="learning-description">{item.description}</p>

                    <div className="learning-meta">
                      <span className="meta-item">
                        <strong>Subject:</strong> {item.subject}
                      </span>
                      <span>•</span>
                      <span className="meta-item">
                        <strong>Attempts:</strong> {item.practiceCount} {item.practiceCount === 1 ? 'time' : 'times'}
                      </span>

                      {/* V2/V3 Clarification Note: Avoid false mastery claims */}
                      {(version === 'V2' || version === 'V3') && (
                        <>
                          <span>•</span>
                          <span style={{ color: '#0369a1', fontStyle: 'italic' }}>
                            {isNeedsPractice ? 'Recommended for home practice' : 'Explored in app'}
                          </span>
                        </>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        {/* SECTION: PRACTICE OPPORTUNITY */}
        <section aria-labelledby="section-opportunity-title">
          <div className="section-header">
            <h2 id="section-opportunity-title" className="section-title">
              <span>💡</span> Practice Opportunity
            </h2>
          </div>

          {practiceOpportunity ? (
            <div className="practice-opportunity-card">
              <span className="opportunity-eyebrow">
                {practiceOpportunity.status === 'needs_more_practice'
                  ? 'Recommended Focus'
                  : 'Reinforce Concept'}
              </span>

              <h3 className="opportunity-skill-title">{practiceOpportunity.skill}</h3>

              <p className="opportunity-explanation">
                {practiceOpportunity.reason ||
                  `Your child practiced ${practiceOpportunity.skill.toLowerCase()} today. Try a short real-life activity to reinforce this concept.`}
              </p>

              {/* V2 / V3: Parental Preparation Prompt */}
              {(version === 'V2' || version === 'V3') && (
                <div
                  style={{
                    background: 'rgba(255, 255, 255, 0.7)',
                    borderRadius: '10px',
                    padding: '10px 14px',
                    marginBottom: '16px',
                    fontSize: '0.85rem',
                    color: '#0369a1',
                    border: '1px solid #bae6fd',
                  }}
                >
                  <strong>Parent Tip:</strong> Takes just 5 minutes using simple household items. No special materials required!
                </div>
              )}

              <button
                type="button"
                id="btn-try-with-child"
                className="btn-primary-action"
                onClick={() => onNavigateToScreen2(practiceOpportunity)}
              >
                <span>Try this with your child</span>
                <span aria-hidden="true">→</span>
              </button>
            </div>
          ) : (
            <div className="state-container" style={{ background: '#f8fafc', borderRadius: '14px', padding: '24px' }}>
              <div className="state-icon" aria-hidden="true">🌱</div>
              <h3 className="state-title">
                {activities.length > 0
                  ? 'Your child completed today&apos;s activities. Try revisiting one of the skills together.'
                  : 'No recommendation available yet.'}
              </h3>
              <p className="state-desc">
                Check back after your child spends time exploring new learning adventures.
              </p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
