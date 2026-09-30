// client/src/components/StoryTimeGame.jsx
import React, { useState, useEffect } from 'react';
import { ReyaRedPanda, KodiBear, OlloDingo } from './Characters';
import { sounds } from '../services/soundEffects';
import { recordLearningActivity } from '../services/api';

const STORY_PAGES = [
  {
    pageNumber: 1,
    title: 'A Sunny Morning in the Camp',
    text: 'One sunny morning, Kodi the Bear woke up with a big smile. The sky was bright blue and birds were singing.',
    character: 'kodi',
    illustration: '☀️ 🏕️ 🐻',
  },
  {
    pageNumber: 2,
    title: 'Packing the Red Basket',
    text: 'Kodi packed a basket with sweet strawberries and fresh honey sandwiches to share with friends.',
    character: 'kodi',
    illustration: '🧺 🍓 🥪',
  },
  {
    pageNumber: 3,
    title: 'Meeting Ollo and Reya',
    text: 'Under the big oak tree, Kodi met Ollo and Reya. They spread a cozy blanket on the soft green grass.',
    character: 'reya',
    illustration: '🌳 🧺 🦊',
  },
  {
    pageNumber: 4,
    title: 'Story Question Time!',
    text: 'What did Kodi bring in the picnic basket?',
    isQuestion: true,
    options: [
      { text: 'Strawberries and sandwiches', correct: true, emoji: '🍓🥪' },
      { text: 'Toy blocks and crayons', correct: false, emoji: '🧱🖍️' },
      { text: 'Rain boots and umbrellas', correct: false, emoji: '👢☂️' },
    ],
  },
];

export default function StoryTimeGame({
  childId = 'child_001',
  childName = 'Sarah',
  onClose,
  onCompleteActivity,
}) {
  const [currentPageIdx, setCurrentPageIdx] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [mistakes, setMistakes] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  const page = STORY_PAGES[currentPageIdx];

  useEffect(() => {
    sounds.playPop(520);
    if (!page.isQuestion) {
      sounds.speak(page.text);
    } else {
      sounds.speak('Here is a question: ' + page.text);
    }
  }, [currentPageIdx]);

  const handleNextPage = () => {
    sounds.playPop(440);
    if (currentPageIdx + 1 < STORY_PAGES.length) {
      setCurrentPageIdx((prev) => prev + 1);
    }
  };

  const handlePrevPage = () => {
    sounds.playPop(380);
    if (currentPageIdx > 0) {
      setCurrentPageIdx((prev) => prev - 1);
    }
  };

  const handleSelectAnswer = (option) => {
    setSelectedAnswer(option);

    if (option.correct) {
      sounds.playSuccess();
      setFeedback('correct');

      setTimeout(() => {
        finishGame();
      }, 1500);
    } else {
      sounds.playGentleTryAgain();
      setFeedback('try_again');
      setMistakes((prev) => prev + 1);
      sounds.speak('Think back to page two! What delicious food did Kodi pack?');
    }
  };

  const finishGame = async () => {
    setIsCompleted(true);
    sounds.playFanfare();

    const finalStatus = mistakes === 0 ? 'practiced' : 'needs_more_practice';
    const desc =
      mistakes === 0
        ? `Read "A Sunny Morning in the Camp" and demonstrated story comprehension!`
        : `Practiced story comprehension with Reya; reviewed story sequence.`;

    try {
      await recordLearningActivity(childId, {
        skill: 'Story Comprehension',
        subject: 'Reading',
        description: desc,
        status: finalStatus,
        practiceCount: 1,
      });
      if (onCompleteActivity) {
        onCompleteActivity({ skill: 'Story Comprehension', status: finalStatus });
      }
    } catch (err) {
      console.error('Error saving story session:', err);
    }
  };

  return (
    <div className="game-overlay" role="dialog" aria-modal="true">
      <div className="game-modal-card storybook-theme">
        {/* Header */}
        <div className="game-header">
          <div className="game-header-info">
            <span className="game-badge">📖 Reading Cove • Story Comprehension</span>
            <span className="game-round-indicator">
              Page {currentPageIdx + 1} of {STORY_PAGES.length}
            </span>
          </div>
          <button
            type="button"
            className="game-close-btn"
            onClick={onClose}
            aria-label="Exit Story"
          >
            ✕
          </button>
        </div>

        {!isCompleted ? (
          <div className="storybook-stage">
            <div className="storybook-card">
              <div className="storybook-illo-banner">
                <span className="illo-big-icons" aria-hidden="true">{page.illustration}</span>
                <div className="storybook-companion-corner">
                  {page.character === 'kodi' ? (
                    <KodiBear size={72} />
                  ) : page.character === 'reya' ? (
                    <ReyaRedPanda size={72} />
                  ) : (
                    <OlloDingo size={72} />
                  )}
                </div>
              </div>

              <h2 className="storybook-page-title">{page.title}</h2>
              <p className="storybook-page-text">{page.text}</p>

              {/* Read Aloud Button */}
              <button
                type="button"
                className="btn-read-aloud"
                onClick={() => sounds.speak(page.text)}
              >
                🔊 Read to Me
              </button>

              {/* Comprehension Question UI if on question page */}
              {page.isQuestion && (
                <div className="comprehension-options-list">
                  {page.options.map((opt, i) => (
                    <button
                      key={i}
                      type="button"
                      className={`comprehension-option-btn ${
                        selectedAnswer === opt
                          ? opt.correct
                            ? 'correct'
                            : 'wrong'
                          : ''
                      }`}
                      onClick={() => handleSelectAnswer(opt)}
                    >
                      <span className="opt-emoji" aria-hidden="true">{opt.emoji}</span>
                      <span className="opt-text">{opt.text}</span>
                    </button>
                  ))}

                  {feedback === 'correct' && (
                    <div className="game-feedback-badge success">
                      🌟 You remembered the story perfectly, {childName}!
                    </div>
                  )}
                  {feedback === 'try_again' && (
                    <div className="game-feedback-badge try-again">
                      🌱 Remember: Kodi packed sweet fruit and sandwiches!
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Navigation buttons */}
            <div className="storybook-nav-controls">
              <button
                type="button"
                className="btn-page-turn"
                onClick={handlePrevPage}
                disabled={currentPageIdx === 0}
              >
                ← Previous Page
              </button>

              {!page.isQuestion && (
                <button
                  type="button"
                  className="btn-page-turn primary"
                  onClick={handleNextPage}
                >
                  Next Page →
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="game-complete-screen">
            <div className="confetti-burst" aria-hidden="true">
              📚 🌟 ✨ 📖 🎈
            </div>
            <ReyaRedPanda size={110} mood="happy" />
            <h2 className="complete-title">Story Star Reader!</h2>
            <p className="complete-subtitle">
              Brilliant listening and comprehension, {childName}!
            </p>

            <div className="stars-earned-row">
              <span className="big-star animated">⭐</span>
              <span className="big-star animated delay-1">⭐</span>
              <span className="big-star animated delay-2">⭐</span>
            </div>

            <div className="live-sync-notice">
              <span>✨</span>
              <span>
                <strong>Live Sync:</strong> Reading comprehension score saved.
                Parent Companion includes real-world story discussion recommendations.
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
