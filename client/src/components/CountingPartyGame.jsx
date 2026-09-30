// client/src/components/CountingPartyGame.jsx
import React, { useState, useEffect } from 'react';
import { KodiBear } from './Characters';
import { sounds } from '../services/soundEffects';
import { recordLearningActivity } from '../services/api';

const ROUNDS = [
  {
    targetCount: 5,
    itemName: 'Strawberries',
    itemEmoji: '🍓',
    question: 'How many strawberries can you count for Kodi?',
    options: [4, 5, 6],
  },
  {
    targetCount: 4,
    itemName: 'Spoons',
    itemEmoji: '🥄',
    question: 'How many spoons are lined up on the table?',
    options: [3, 4, 5],
  },
  {
    targetCount: 7,
    itemName: 'Party Balloons',
    itemEmoji: '🎈',
    question: 'Count the balloons floating in the sky!',
    options: [6, 7, 8],
  },
];

export default function CountingPartyGame({
  childId = 'child_001',
  childName = 'Sarah',
  onClose,
  onCompleteActivity,
}) {
  const [currentRoundIdx, setCurrentRoundIdx] = useState(0);
  const [countedIndices, setCountedIndices] = useState(new Set());
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [feedback, setFeedback] = useState(null); // 'correct' | 'try_again'
  const [errorsCount, setErrorsCount] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [starsAwarded, setStarsAwarded] = useState(0);
  const [isSaving, setIsSaving] = useState(false);

  const round = ROUNDS[currentRoundIdx];

  useEffect(() => {
    sounds.playPop(500);
    sounds.speak(round.question);
    setCountedIndices(new Set());
    setSelectedAnswer(null);
    setFeedback(null);
  }, [currentRoundIdx]);

  const handleTapItem = (index) => {
    if (countedIndices.has(index)) return;

    const nextCount = countedIndices.size + 1;
    const newSet = new Set(countedIndices);
    newSet.add(index);
    setCountedIndices(newSet);

    sounds.playCountNote(nextCount);
    sounds.speak(`${nextCount}`);
  };

  const handleSelectOption = (num) => {
    setSelectedAnswer(num);

    if (num === round.targetCount) {
      sounds.playSuccess();
      setFeedback('correct');

      setTimeout(() => {
        if (currentRoundIdx + 1 < ROUNDS.length) {
          setCurrentRoundIdx((prev) => prev + 1);
        } else {
          finishGame();
        }
      }, 1400);
    } else {
      sounds.playGentleTryAgain();
      setFeedback('try_again');
      setErrorsCount((prev) => prev + 1);
      sounds.speak(`Let's count them again! Tap each one.`);
    }
  };

  const finishGame = async () => {
    setIsCompleted(true);
    setStarsAwarded(3);
    sounds.playFanfare();

    setIsSaving(true);
    const finalStatus = errorsCount === 0 ? 'practiced' : 'needs_more_practice';
    const desc =
      errorsCount === 0
        ? `Practiced counting 1-10 with Kodi with full accuracy!`
        : `Practiced counting 1-10 with Kodi; needed extra guidance.`;

    try {
      await recordLearningActivity(childId, {
        skill: 'Counting 1-10',
        subject: 'Math',
        description: desc,
        status: finalStatus,
        practiceCount: 1,
      });
      if (onCompleteActivity) {
        onCompleteActivity({ skill: 'Counting 1-10', status: finalStatus });
      }
    } catch (err) {
      console.error('Error saving learning session:', err);
    } finally {
      setIsSaving(false);
    }
  };

  // Generate item positions deterministically
  const items = Array.from({ length: round.targetCount }, (_, i) => ({
    id: i,
    label: round.itemEmoji,
  }));

  return (
    <div className="game-overlay" role="dialog" aria-modal="true">
      <div className="game-modal-card">
        {/* Game Header */}
        <div className="game-header">
          <div className="game-header-info">
            <span className="game-badge">🔢 Math Camp • Counting 1-10</span>
            <span className="game-round-indicator">
              Round {currentRoundIdx + 1} of {ROUNDS.length}
            </span>
          </div>
          <button
            type="button"
            className="game-close-btn"
            onClick={onClose}
            aria-label="Exit Game"
          >
            ✕
          </button>
        </div>

        {!isCompleted ? (
          <div className="game-play-area">
            {/* Kodi Host Prompt */}
            <div className="game-host-banner">
              <div className="game-host-avatar">
                <KodiBear size={72} mood={feedback === 'correct' ? 'celebrating' : 'happy'} />
              </div>
              <div className="game-host-dialog">
                <p className="game-host-text">{round.question}</p>
                <span className="game-host-hint">
                  👉 Tap each {round.itemName.toLowerCase()} to count! ({countedIndices.size}/{round.targetCount})
                </span>
              </div>
            </div>

            {/* Tap items playground */}
            <div className="counting-stage">
              {items.map((item, idx) => {
                const isCounted = countedIndices.has(idx);
                // order in which it was counted
                const countBadgeNumber = Array.from(countedIndices).indexOf(idx) + 1;

                return (
                  <button
                    key={item.id}
                    type="button"
                    className={`counting-item-btn ${isCounted ? 'counted' : ''}`}
                    onClick={() => handleTapItem(idx)}
                    aria-label={`${round.itemName} ${idx + 1}`}
                  >
                    <span className="counting-emoji">{item.label}</span>
                    {isCounted && (
                      <span className="item-count-badge" aria-hidden="true">
                        {countBadgeNumber}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Answer Options */}
            <div className="counting-answers-section">
              <p className="answers-prompt">Choose how many you counted:</p>
              <div className="answer-options-row">
                {round.options.map((opt) => {
                  let btnStateClass = '';
                  if (selectedAnswer === opt) {
                    btnStateClass = feedback === 'correct' ? 'correct-choice' : 'wrong-choice';
                  }

                  return (
                    <button
                      key={opt}
                      type="button"
                      className={`answer-number-pill ${btnStateClass}`}
                      onClick={() => handleSelectOption(opt)}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>

              {feedback === 'correct' && (
                <div className="game-feedback-badge success">
                  🌟 Super job, {childName}! You counted {round.targetCount}!
                </div>
              )}
              {feedback === 'try_again' && (
                <div className="game-feedback-badge try-again">
                  🌈 Good try! Tap each one again to count carefully.
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Completion Screen */
          <div className="game-complete-screen">
            <div className="confetti-burst" aria-hidden="true">
              🎉 🎈 ⭐ 🌟 🚀
            </div>
            <KodiBear size={110} mood="celebrating" />
            <h2 className="complete-title">Awesome Counting, {childName}!</h2>
            <p className="complete-subtitle">
              You practiced counting with Kodi and earned 3 stars!
            </p>

            <div className="stars-earned-row">
              <span className="big-star animated">⭐</span>
              <span className="big-star animated delay-1">⭐</span>
              <span className="big-star animated delay-2">⭐</span>
            </div>

            <div className="live-sync-notice">
              <span>✨</span>
              <span>
                <strong>Live Sync:</strong> This session has been saved to your child&apos;s learning profile.
                Check the <em>Parent Dashboard</em> to see the update!
              </span>
            </div>

            <div className="complete-actions">
              <button
                type="button"
                className="btn-kid-continue"
                onClick={onClose}
              >
                Back to Learning Hub 🏕️
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
