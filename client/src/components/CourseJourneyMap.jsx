// client/src/components/CourseJourneyMap.jsx
import React, { useState } from 'react';
import { COURSE_LEVELS } from '../services/curriculumCourse';
import { sounds } from '../services/soundEffects';
import { KodiBear, SandyDingo, OlloDingo, ReyaRedPanda, PeckBird } from './Characters';

export default function CourseJourneyMap({
  childName = 'Sarah',
  courseProgress,
  onLaunchLevel,
  onResetCourse,
  onToggleUnlockAll,
  onClose,
}) {
  const [selectedLevelForPreview, setSelectedLevelForPreview] = useState(null);
  const [showGraduationDiploma, setShowGraduationDiploma] = useState(false);

  const completedSet = new Set(courseProgress?.completedLevelIds || []);
  const allUnlocked = !!courseProgress?.allUnlocked;

  // Find the first non-completed level as current active level
  const currentActiveLevel =
    COURSE_LEVELS.find((lvl) => !completedSet.has(lvl.id)) ||
    COURSE_LEVELS[COURSE_LEVELS.length - 1];

  const percentComplete = Math.round(
    (completedSet.size / COURSE_LEVELS.length) * 100
  );
  const isCourseFinished = completedSet.size >= COURSE_LEVELS.length;

  const handleLevelClick = (lvl, isLocked, isCurrent, isCompleted) => {
    if (isLocked && !allUnlocked) {
      sounds.playGentleTryAgain();
      sounds.speak(
        `Level ${lvl.levelNum} is locked! Finish Level ${
          lvl.levelNum - 1
        } first to unlock this adventure.`
      );
      setSelectedLevelForPreview({
        ...lvl,
        lockedMessage: `Complete Level ${lvl.levelNum - 1} to unlock!`,
      });
      return;
    }

    sounds.playPop(520);
    sounds.speak(`Launching Level ${lvl.levelNum}: ${lvl.title}!`);
    onLaunchLevel(lvl.gameType, lvl);
  };

  return (
    <div className="course-journey-overlay" role="dialog" aria-modal="true">
      <div className="course-journey-modal-card">
        {/* HEADER BAR */}
        <div className="journey-header">
          <div className="journey-header-title">
            <span className="journey-badge">🗺️ Step-by-Step Learning Adventure</span>
            <h2 className="journey-main-title">{childName}'s Learning Journey Path</h2>
          </div>
          <button
            type="button"
            className="journey-close-btn"
            onClick={onClose}
            aria-label="Close Course Map"
          >
            ✕
          </button>
        </div>

        {/* PROGRESS METER & GRADUATION BANNER */}
        <div className="course-progress-banner">
          <div className="progress-bar-left">
            <div className="progress-labels">
              <span className="course-step-count">
                {isCourseFinished
                  ? '🎉 Course Completed! All 8 Levels Mastered!'
                  : `Level ${currentActiveLevel.levelNum} of ${COURSE_LEVELS.length}: Next is ${currentActiveLevel.title}`}
              </span>
              <span className="course-percent-badge">{percentComplete}% Complete</span>
            </div>
            <div className="course-track">
              <div
                className="course-track-fill"
                style={{ width: `${percentComplete}%` }}
              ></div>
            </div>
          </div>

          <div className="progress-bar-right">
            {isCourseFinished ? (
              <button
                type="button"
                className="btn-view-diploma glow-anim"
                onClick={() => setShowGraduationDiploma(true)}
              >
                🎓 View Graduation Diploma!
              </button>
            ) : (
              <div className="graduation-goal-pill" title="Finish all 8 levels to graduate!">
                <span className="goal-icon">🎓</span>
                <span className="goal-text">Graduation Ahead</span>
              </div>
            )}
          </div>
        </div>

        {/* CONTROLS ROW FOR RESEARCHERS / PARENTS */}
        <div className="journey-subcontrols">
          <span className="subcontrols-hint">
            💡 Levels unlock sequentially one after another. Replay any finished level anytime!
          </span>
          <div className="subcontrols-buttons">
            <button
              type="button"
              className={`btn-subcontrol ${allUnlocked ? 'active' : ''}`}
              onClick={onToggleUnlockAll}
              title="Unlock all levels for quick review"
            >
              {allUnlocked ? '🔒 Restore Sequential Lock' : '🔓 Parent: Unlock All'}
            </button>
            <button
              type="button"
              className="btn-subcontrol"
              onClick={onResetCourse}
              title="Reset course progression to Level 1"
            >
              🔄 Reset to Level 1
            </button>
          </div>
        </div>

        {/* WINDING STEPPING STONES PATH */}
        <div className="journey-path-scrollbox">
          <div className="stepping-stones-container">
            {COURSE_LEVELS.map((lvl, index) => {
              const isCompleted = completedSet.has(lvl.id);
              const isCurrent = lvl.id === currentActiveLevel.id && !isCourseFinished;
              const isLocked = !isCompleted && !isCurrent && !allUnlocked;

              return (
                <div key={lvl.id} className="stone-wrapper">
                  {/* Connecting path line */}
                  {index > 0 && (
                    <div
                      className={`path-segment ${
                        completedSet.has(COURSE_LEVELS[index - 1].id)
                          ? 'active-path'
                          : 'locked-path'
                      }`}
                    >
                      <span className="path-dot"></span>
                      <span className="path-dot"></span>
                      <span className="path-dot"></span>
                    </div>
                  )}

                  {/* Level Stone Card */}
                  <div
                    className={`level-stone-card ${
                      isCompleted
                        ? 'completed'
                        : isCurrent
                        ? 'current'
                        : 'locked'
                    }`}
                    onClick={() =>
                      handleLevelClick(lvl, isLocked, isCurrent, isCompleted)
                    }
                    role="button"
                    tabIndex={0}
                  >
                    {/* Stepping stone circle */}
                    <div
                      className="stone-circle"
                      style={{
                        borderColor: isLocked ? '#94a3b8' : lvl.color,
                        background: isLocked ? '#f1f5f9' : lvl.bgColor,
                      }}
                    >
                      <span className="stone-icon">{lvl.icon}</span>

                      {/* Overlays: Checkmark, Lock, or Current Pulse */}
                      {isCompleted && <span className="stone-status-badge check">✓</span>}
                      {isCurrent && (
                        <span className="stone-status-badge play-now">▶</span>
                      )}
                      {isLocked && <span className="stone-status-badge lock">🔒</span>}
                    </div>

                    {/* Level Meta info */}
                    <div className="stone-meta">
                      <div className="stone-level-num">LEVEL {lvl.levelNum}</div>
                      <h4 className="stone-title">{lvl.title}</h4>
                      <span className="stone-skill-tag">{lvl.skill}</span>

                      {/* Status hint text */}
                      <div className="stone-action-text">
                        {isCompleted ? (
                          <span className="text-completed">⭐⭐⭐ Passed (Replay)</span>
                        ) : isCurrent ? (
                          <span className="text-current-action pulse">▶ PLAY NOW!</span>
                        ) : (
                          <span className="text-locked">Locked</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* GRAND FINALE GRADUATION ISLAND */}
            <div className="stone-wrapper finale-wrapper">
              <div
                className={`path-segment ${
                  isCourseFinished ? 'active-path' : 'locked-path'
                }`}
              >
                <span className="path-dot"></span>
                <span className="path-dot"></span>
                <span className="path-dot"></span>
              </div>

              <div
                className={`finale-island-card ${isCourseFinished ? 'achieved' : 'locked'}`}
                onClick={() => {
                  if (isCourseFinished) {
                    sounds.playSuccess();
                    setShowGraduationDiploma(true);
                  } else {
                    sounds.speak('Complete all 8 levels to graduate and earn your Grand Diploma!');
                  }
                }}
                role="button"
                tabIndex={0}
              >
                <div className="finale-cap-icon">🎓</div>
                <h3 className="finale-title">Course Graduation</h3>
                <p className="finale-sub">Master Explorer Diploma & Golden Trophy</p>
                <span className={`finale-status-pill ${isCourseFinished ? 'celebrate' : 'wait'}`}>
                  {isCourseFinished ? '⭐ Graduate! View Diploma' : 'Complete All Levels'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* MODAL: GRADUATION DIPLOMA CERTIFICATE */}
        {showGraduationDiploma && (
          <div className="diploma-overlay" role="dialog" aria-modal="true">
            <div className="diploma-card">
              <button
                type="button"
                className="btn-close-diploma"
                onClick={() => setShowGraduationDiploma(false)}
              >
                ✕
              </button>

              <div className="diploma-ribbon">🎓 OFFICIAL GRADUATION CERTIFICATE 🎓</div>
              <div className="diploma-crest">🏆</div>

              <h1 className="diploma-heading">Certificate of Mastery</h1>
              <p className="diploma-body">This proudly certifies that</p>
              <h2 className="diploma-student-name">{childName}</h2>
              <p className="diploma-text">
                has successfully completed all 8 levels of the foundational{' '}
                <strong>Khan Academy Kids Learning Adventure Course</strong>, demonstrating
                excellence in Counting, Shapes, Phonics, Addition, Subtraction, Story Comprehension,
                Multiplication, and Division!
              </p>

              <div className="diploma-signatures">
                <div className="sig-block">
                  <span className="sig-mascot">🐻 Kodi Bear</span>
                  <span className="sig-label">Math Camp Lead</span>
                </div>
                <div className="sig-block">
                  <span className="sig-mascot">🐼 Reya Red Panda</span>
                  <span className="sig-label">Reading Cove Lead</span>
                </div>
                <div className="sig-block">
                  <span className="sig-mascot">🐕 Ollo Dingo</span>
                  <span className="sig-label">Logic Explorer Lead</span>
                </div>
              </div>

              <div className="diploma-actions">
                <button
                  type="button"
                  className="btn-print-diploma"
                  onClick={() => window.print()}
                >
                  🖨️ Print Certificate
                </button>
                <button
                  type="button"
                  className="btn-close-diploma-btn"
                  onClick={() => setShowGraduationDiploma(false)}
                >
                  Awesome! ✨
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
