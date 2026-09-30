// client/src/components/AlphabetSafariGame.jsx
import React, { useState, useEffect } from 'react';
import { PeckBird } from './Characters';
import { sounds } from '../services/soundEffects';
import { recordLearningActivity } from '../services/api';

const ALPHABET_ROUNDS = [
  {
    targetLetter: 'B',
    phonicsSound: '/b/ like in Bear',
    prompt: 'Which word starts with the /b/ sound?',
    options: [
      { word: 'Bear', emoji: '🐻', correct: true },
      { word: 'Apple', emoji: '🍎', correct: false },
      { word: 'Sun', emoji: '☀️', correct: false },
    ],
  },
  {
    targetLetter: 'S',
    phonicsSound: '/s/ like in Star',
    prompt: 'Which word starts with the /s/ sound?',
    options: [
      { word: 'Duck', emoji: '🦆', correct: false },
      { word: 'Star', emoji: '⭐', correct: true },
      { word: 'Fish', emoji: '🐟', correct: false },
    ],
  },
  {
    targetLetter: 'M',
    phonicsSound: '/m/ like in Moon',
    prompt: 'Which word starts with the /m/ sound?',
    options: [
      { word: 'Moon', emoji: '🌙', correct: true },
      { word: 'Clock', emoji: '⏰', correct: false },
      { word: 'Tree', emoji: '🌳', correct: false },
    ],
  },
];

export default function AlphabetSafariGame({
  childId = 'child_001',
  childName = 'Sarah',
  onClose,
  onCompleteActivity,
}) {
  const [roundIdx, setRoundIdx] = useState(0);
  const [selectedWord, setSelectedWord] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [mistakes, setMistakes] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  const round = ALPHABET_ROUNDS[roundIdx];

  useEffect(() => {
    sounds.playPop(520);
    sounds.speak(`Find the word starting with ${round.targetLetter}, ${round.phonicsSound}`);
  }, [roundIdx]);

  const handleSelect = (opt) => {
    setSelectedWord(opt.word);
    if (opt.correct) {
      sounds.playSuccess();
      setFeedback('correct');

      setTimeout(() => {
        setFeedback(null);
        setSelectedWord(null);
        if (roundIdx + 1 < ALPHABET_ROUNDS.length) {
          setRoundIdx((prev) => prev + 1);
        } else {
          finishGame();
        }
      }, 1300);
    } else {
      sounds.playGentleTryAgain();
      setFeedback('try_again');
      setMistakes((prev) => prev + 1);
      sounds.speak(`Listen closely for the ${round.phonicsSound} sound!`);
    }
  };

  const finishGame = async () => {
    setIsCompleted(true);
    sounds.playFanfare();

    const finalStatus = mistakes === 0 ? 'practiced' : 'needs_more_practice';
    const desc =
      mistakes === 0
        ? `Practiced phonics and letter sounds with Peck with high accuracy!`
        : `Practiced letter sounds with Peck; focused on beginning phonics.`;

    try {
      await recordLearningActivity(childId, {
        skill: 'Letter Sounds',
        subject: 'Reading',
        description: desc,
        status: finalStatus,
        practiceCount: 1,
      });
      if (onCompleteActivity) {
        onCompleteActivity({ skill: 'Letter Sounds', status: finalStatus });
      }
    } catch (err) {
      console.error('Error saving phonics session:', err);
    }
  };

  return (
    <div className="game-overlay" role="dialog" aria-modal="true">
      <div className="game-modal-card">
        {/* Game Header */}
        <div className="game-header">
          <div className="game-header-info">
            <span className="game-badge">🔤 ABC Cove • Letter Sounds</span>
            <span className="game-round-indicator">
              Round {roundIdx + 1} of {ALPHABET_ROUNDS.length}
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
            {/* Host Banner */}
            <div className="game-host-banner">
              <div className="game-host-avatar">
                <PeckBird size={72} mood="happy" />
              </div>
              <div className="game-host-dialog">
                <p className="game-host-text">
                  Letter <strong>{round.targetLetter}</strong>: {round.prompt}
                </p>
                <span className="game-host-hint">
                  Sound: <em>{round.phonicsSound}</em>
                </span>
              </div>
            </div>

            {/* Big Target Letter Display */}
            <div className="big-target-letter-circle">
              <span>{round.targetLetter}</span>
            </div>

            {/* Options Cards */}
            <div className="phonics-cards-grid">
              {round.options.map((opt) => (
                <button
                  key={opt.word}
                  type="button"
                  className={`phonics-card-btn ${
                    selectedWord === opt.word
                      ? opt.correct
                        ? 'correct'
                        : 'wrong'
                      : ''
                  }`}
                  onClick={() => handleSelect(opt)}
                >
                  <span className="phonics-emoji" aria-hidden="true">{opt.emoji}</span>
                  <span className="phonics-word-label">{opt.word}</span>
                </button>
              ))}
            </div>

            {feedback === 'correct' && (
              <div className="game-feedback-badge success">
                🎉 That&apos;s right! <strong>{selectedWord}</strong> starts with {round.targetLetter}!
              </div>
            )}
            {feedback === 'try_again' && (
              <div className="game-feedback-badge try-again">
                🐦 Listen to the starting sound again!
              </div>
            )}
          </div>
        ) : (
          <div className="game-complete-screen">
            <div className="confetti-burst" aria-hidden="true">
              🔤 🌟 🎈 ✨ 📚
            </div>
            <PeckBird size={110} mood="happy" />
            <h2 className="complete-title">Alphabet Whiz Badge!</h2>
            <p className="complete-subtitle">
              You matched all beginning letter sounds with Peck!
            </p>

            <div className="stars-earned-row">
              <span className="big-star animated">⭐</span>
              <span className="big-star animated delay-1">⭐</span>
              <span className="big-star animated delay-2">⭐</span>
            </div>

            <div className="live-sync-notice">
              <span>✨</span>
              <span>
                <strong>Live Sync:</strong> Letter Sounds learning recorded in database.
                Parent Companion shows recommended hands-on phonics safari!
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
