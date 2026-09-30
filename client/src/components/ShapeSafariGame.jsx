// client/src/components/ShapeSafariGame.jsx
import React, { useState, useEffect } from 'react';
import { OlloDingo } from './Characters';
import { sounds } from '../services/soundEffects';
import { recordLearningActivity } from '../services/api';

const SHAPE_ITEMS = [
  { id: 1, name: 'Wall Clock', shape: 'Circle', emoji: '⏰', hint: 'Round like a ball' },
  { id: 2, name: 'Gift Box', shape: 'Square', emoji: '🎁', hint: 'Four equal sides' },
  { id: 3, name: 'Slice of Pizza', shape: 'Triangle', emoji: '🍕', hint: 'Three pointy corners' },
  { id: 4, name: 'Gold Coin', shape: 'Circle', emoji: '🪙', hint: 'Round curved edge' },
  { id: 5, name: 'Picture Frame', shape: 'Square', emoji: '🖼️', hint: 'Straight even edges' },
  { id: 6, name: 'Watermelon Slice', shape: 'Triangle', emoji: '🍉', hint: 'Three sides and points' },
];

const TARGET_SHAPES = ['Circle', 'Square', 'Triangle'];

export default function ShapeSafariGame({
  childId = 'child_001',
  childName = 'Sarah',
  onClose,
  onCompleteActivity,
}) {
  const [currentItemIdx, setCurrentItemIdx] = useState(0);
  const [sortedCount, setSortedCount] = useState(0);
  const [feedback, setFeedback] = useState(null); // 'correct' | 'try_again'
  const [mistakes, setMistakes] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  const currentItem = SHAPE_ITEMS[currentItemIdx];

  useEffect(() => {
    sounds.playPop(480);
    if (currentItem) {
      sounds.speak(`Which shape is this ${currentItem.name}?`);
    }
  }, [currentItemIdx]);

  const handleChooseShape = (chosenShape) => {
    if (!currentItem) return;

    if (chosenShape === currentItem.shape) {
      sounds.playSuccess();
      setFeedback('correct');
      setSortedCount((prev) => prev + 1);

      setTimeout(() => {
        setFeedback(null);
        if (currentItemIdx + 1 < SHAPE_ITEMS.length) {
          setCurrentItemIdx((prev) => prev + 1);
        } else {
          finishGame();
        }
      }, 1200);
    } else {
      sounds.playGentleTryAgain();
      setFeedback('try_again');
      setMistakes((prev) => prev + 1);
      sounds.speak(`Look closely! ${currentItem.hint}.`);
    }
  };

  const finishGame = async () => {
    setIsCompleted(true);
    sounds.playFanfare();

    const finalStatus = mistakes === 0 ? 'practiced' : 'needs_more_practice';
    const desc =
      mistakes === 0
        ? `Practiced identifying circles, squares, and triangles with Ollo!`
        : `Practiced shapes with Ollo; needed help with geometry recognition.`;

    try {
      await recordLearningActivity(childId, {
        skill: 'Shapes',
        subject: 'Math',
        description: desc,
        status: finalStatus,
        practiceCount: 1,
      });
      if (onCompleteActivity) {
        onCompleteActivity({ skill: 'Shapes', status: finalStatus });
      }
    } catch (err) {
      console.error('Error saving shape session:', err);
    }
  };

  return (
    <div className="game-overlay" role="dialog" aria-modal="true">
      <div className="game-modal-card">
        {/* Game Header */}
        <div className="game-header">
          <div className="game-header-info">
            <span className="game-badge">📐 Math Safari • Shapes</span>
            <span className="game-round-indicator">
              Item {currentItemIdx + 1} of {SHAPE_ITEMS.length}
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
            {/* Ollo Host Dialog */}
            <div className="game-host-banner">
              <div className="game-host-avatar">
                <OlloDingo size={72} mood={feedback === 'correct' ? 'happy' : 'happy'} />
              </div>
              <div className="game-host-dialog">
                <p className="game-host-text">
                  Which shape matches this <strong>{currentItem.name}</strong>?
                </p>
                <span className="game-host-hint">
                  💡 Hint: {currentItem.hint}
                </span>
              </div>
            </div>

            {/* Target Item Display */}
            <div className="shape-featured-card">
              <div className="shape-big-emoji">{currentItem.emoji}</div>
              <div className="shape-item-title">{currentItem.name}</div>
            </div>

            {/* Shape Target Baskets */}
            <div className="shape-baskets-grid">
              {TARGET_SHAPES.map((shapeName) => {
                let shapeIcon = '⚪';
                if (shapeName === 'Square') shapeIcon = '🟦';
                if (shapeName === 'Triangle') shapeIcon = '🔺';

                return (
                  <button
                    key={shapeName}
                    type="button"
                    className="shape-basket-btn"
                    onClick={() => handleChooseShape(shapeName)}
                  >
                    <span className="shape-basket-icon" aria-hidden="true">{shapeIcon}</span>
                    <span className="shape-basket-label">{shapeName}</span>
                  </button>
                );
              })}
            </div>

            {feedback === 'correct' && (
              <div className="game-feedback-badge success">
                🎉 Wonderful! The {currentItem.name} is a {currentItem.shape}!
              </div>
            )}
            {feedback === 'try_again' && (
              <div className="game-feedback-badge try-again">
                🤔 Not quite. Count the edges or trace the boundary!
              </div>
            )}
          </div>
        ) : (
          <div className="game-complete-screen">
            <div className="confetti-burst" aria-hidden="true">
              🟡 🔺 🟦 ✨ 🌟
            </div>
            <OlloDingo size={110} mood="happy" />
            <h2 className="complete-title">Shape Explorer Badge Earned!</h2>
            <p className="complete-subtitle">
              Terrific job {childName}! You sorted circles, squares, and triangles with Ollo.
            </p>

            <div className="stars-earned-row">
              <span className="big-star animated">⭐</span>
              <span className="big-star animated delay-1">⭐</span>
              <span className="big-star animated delay-2">⭐</span>
            </div>

            <div className="live-sync-notice">
              <span>✨</span>
              <span>
                <strong>Live Sync:</strong> Activity recorded in Khan Academy Kids database.
                Parent Companion shows updated skill mastery!
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
