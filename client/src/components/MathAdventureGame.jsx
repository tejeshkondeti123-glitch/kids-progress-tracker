// client/src/components/MathAdventureGame.jsx
import React, { useState, useEffect } from 'react';
import { KodiBear, SandyDingo, OlloDingo, ReyaRedPanda } from './Characters';
import { sounds } from '../services/soundEffects';
import { recordLearningActivity } from '../services/api';

const MATH_MODULES = {
  addition: {
    id: 'addition',
    skill: 'Addition',
    title: "Kodi's Apple Harvest",
    mascot: 'Kodi',
    themeColor: '#ff6b6b',
    icon: '🍎',
    rounds: [
      {
        num1: 3,
        num2: 2,
        itemEmoji: '🍎',
        itemName: 'Crisp Apples',
        question: 'Kodi has 3 red apples and picks 2 green apples. How many apples in total?',
        options: [4, 5, 6],
        target: 5,
      },
      {
        num1: 4,
        num2: 3,
        itemEmoji: '🍓',
        itemName: 'Sweet Berries',
        question: '4 strawberries in the bowl, plus 3 strawberries on the plate. How many altogether?',
        options: [6, 7, 8],
        target: 7,
      },
      {
        num1: 5,
        num2: 4,
        itemEmoji: '🍌',
        itemName: 'Sunny Bananas',
        question: '5 bananas on the tree and 4 in the cart. Add them up!',
        options: [8, 9, 10],
        target: 9,
      },
    ],
  },
  subtraction: {
    id: 'subtraction',
    skill: 'Subtraction',
    title: "Sandy's Beach Splash",
    mascot: 'Sandy',
    themeColor: '#4ecdc4',
    icon: '⭐',
    rounds: [
      {
        startCount: 6,
        removeCount: 2,
        itemEmoji: '⭐',
        itemName: 'Starfish',
        question: '6 starfish are resting on the sand. Tap 2 starfish to let them splash into the sea! How many remain?',
        options: [3, 4, 5],
        target: 4,
      },
      {
        startCount: 7,
        removeCount: 3,
        itemEmoji: '🐚',
        itemName: 'Seashells',
        question: '7 seashells are on the shore. 3 wash away with the tide! How many are left?',
        options: [3, 4, 5],
        target: 4,
      },
      {
        startCount: 8,
        removeCount: 4,
        itemEmoji: '🦀',
        itemName: 'Friendly Crabs',
        question: '8 crabs were building sandcastles. 4 crawled back into their burrows! How many crabs remain?',
        options: [3, 4, 5],
        target: 4,
      },
    ],
  },
  multiplication: {
    id: 'multiplication',
    skill: 'Multiplication',
    title: "Ollo's Leapfrog Groups",
    mascot: 'Ollo',
    themeColor: '#6c5ce7',
    icon: '🐸',
    rounds: [
      {
        groups: 3,
        perGroup: 2,
        itemEmoji: '🐸',
        groupName: 'Lilypads',
        question: '3 lilypads with 2 frogs on each lilypad! How many frogs in all 3 groups?',
        options: [5, 6, 8],
        target: 6,
      },
      {
        groups: 4,
        perGroup: 2,
        itemEmoji: '🎈',
        groupName: 'Balloon Bunches',
        question: '4 kids each hold 2 colorful balloons! How many balloons altogether?',
        options: [6, 8, 10],
        target: 8,
      },
      {
        groups: 3,
        perGroup: 3,
        itemEmoji: '✨',
        groupName: 'Star Clusters',
        question: '3 magic wands, each casting 3 glowing stars! 3 groups of 3 equals what?',
        options: [6, 9, 12],
        target: 9,
      },
    ],
  },
  division: {
    id: 'division',
    skill: 'Division',
    title: "Reya's Fair Share Picnic",
    mascot: 'Reya',
    themeColor: '#fd79a8',
    icon: '🧁',
    rounds: [
      {
        totalItems: 8,
        recipients: 2,
        itemEmoji: '🧁',
        recipientNames: ['Sandy', 'Peck'],
        question: 'Reya baked 8 delicious cupcakes to share equally between 2 friends. How many does each friend get?',
        options: [3, 4, 5],
        target: 4,
      },
      {
        totalItems: 6,
        recipients: 3,
        itemEmoji: '🍪',
        recipientNames: ['Kodi', 'Ollo', 'Peck'],
        question: '6 warm cookies shared equally between 3 friends. How many cookies for each friend?',
        options: [2, 3, 4],
        target: 2,
      },
      {
        totalItems: 9,
        recipients: 3,
        itemEmoji: '🍉',
        recipientNames: ['Kodi', 'Sandy', 'Reya'],
        question: '9 juicy watermelon slices shared equally among 3 friends. Fair share for each?',
        options: [2, 3, 4],
        target: 3,
      },
    ],
  },
};

export default function MathAdventureGame({
  initialModule = 'addition',
  childId = 'child_001',
  childName = 'Sarah',
  onClose,
  onCompleteActivity,
}) {
  const [currentModuleKey, setCurrentModuleKey] = useState(initialModule);
  const [roundIdx, setRoundIdx] = useState(0);

  // Manipulative state per operation
  // Addition: dropped into basket
  const [addedItems, setAddedItems] = useState(new Set());
  // Subtraction: splashed / removed
  const [removedItems, setRemovedItems] = useState(new Set());
  // Multiplication: tapped lilypad groups
  const [tappedGroups, setTappedGroups] = useState(new Set());
  // Division: distributed items [plateIdx: count]
  const [distributedItems, setDistributedItems] = useState([]);

  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [feedback, setFeedback] = useState(null); // 'correct' | 'try_again'
  const [errorCount, setErrorCount] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [starsAwarded, setStarsAwarded] = useState(0);
  const [isSaving, setIsSaving] = useState(false);

  const activeMod = MATH_MODULES[currentModuleKey] || MATH_MODULES.addition;
  const currentRound = activeMod.rounds[roundIdx];

  // Reset round state when module or round index changes
  useEffect(() => {
    setAddedItems(new Set());
    setRemovedItems(new Set());
    setTappedGroups(new Set());
    setDistributedItems([]);
    setSelectedAnswer(null);
    setFeedback(null);

    sounds.playPop(520);
    if (currentRound?.question) {
      sounds.speak(currentRound.question);
    }
  }, [currentModuleKey, roundIdx]);

  // Handle module switch tab
  const handleSwitchModule = (modKey) => {
    sounds.playPop(480);
    setCurrentModuleKey(modKey);
    setRoundIdx(0);
    setIsCompleted(false);
    setErrorCount(0);
  };

  // ADDITION: Tap item to collect into basket
  const handleTapAdditionItem = (idx) => {
    if (addedItems.has(idx)) return;
    const nextSet = new Set(addedItems);
    nextSet.add(idx);
    setAddedItems(nextSet);

    sounds.playCountNote(nextSet.size);
    sounds.speak(`${nextSet.size}`);
  };

  // SUBTRACTION: Tap item to splash away
  const handleTapSubtractionItem = (idx) => {
    const nextSet = new Set(removedItems);
    if (nextSet.has(idx)) {
      nextSet.delete(idx);
    } else {
      nextSet.add(idx);
      sounds.playPop(600);
      sounds.speak(`Splash! ${currentRound.startCount - nextSet.size} left!`);
    }
    setRemovedItems(nextSet);
  };

  // MULTIPLICATION: Tap group
  const handleTapGroup = (grpIdx) => {
    const nextSet = new Set(tappedGroups);
    nextSet.add(grpIdx);
    setTappedGroups(nextSet);
    const totalCount = nextSet.size * currentRound.perGroup;
    sounds.playCountNote(nextSet.size);
    sounds.speak(`${nextSet.size} groups is ${totalCount}!`);
  };

  // DIVISION: Tap item to distribute to plates
  const handleDistributeItem = (itemIdx) => {
    if (distributedItems.includes(itemIdx)) return;
    const currentCount = distributedItems.length;
    const recipientIdx = currentCount % currentRound.recipients;
    setDistributedItems([...distributedItems, itemIdx]);
    sounds.playCountNote((currentCount % currentRound.target) + 1);
    sounds.speak(`One for ${currentRound.recipientNames[recipientIdx]}!`);
  };

  // Check Answer
  const handleSelectOption = (num) => {
    setSelectedAnswer(num);

    if (num === currentRound.target) {
      sounds.playSuccess();
      setFeedback('correct');

      setTimeout(() => {
        if (roundIdx + 1 < activeMod.rounds.length) {
          setRoundIdx((prev) => prev + 1);
        } else {
          finishModule();
        }
      }, 1500);
    } else {
      sounds.playGentleTryAgain();
      setFeedback('try_again');
      setErrorCount((prev) => prev + 1);
      sounds.speak('Almost! Let us count carefully and try again.');
    }
  };

  // Finish Module & record to backend
  const finishModule = async () => {
    setIsCompleted(true);
    setStarsAwarded(5);
    sounds.playFanfare();

    setIsSaving(true);
    const finalStatus = errorCount === 0 ? 'practiced' : 'needs_more_practice';
    const description =
      errorCount === 0
        ? `Mastered interactive ${activeMod.skill} challenges with 100% accuracy!`
        : `Practiced interactive ${activeMod.skill} manipulatives and built foundational intuition.`;

    try {
      await recordLearningActivity(childId, {
        skill: activeMod.skill,
        subject: 'Math',
        description,
        status: finalStatus,
        practiceCount: 1,
      });

      if (onCompleteActivity) {
        onCompleteActivity({
          skill: activeMod.skill,
          subject: 'Math',
          status: finalStatus,
        });
      }
    } catch (err) {
      console.warn('Could not record math learning activity to backend:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="game-overlay math-adventure-overlay" role="dialog" aria-modal="true">
      <div className="game-modal-card math-adventure-card">
        {/* TOP HEADER */}
        <div className="game-header">
          <div className="game-header-info">
            <span className="game-badge">
              🔢 Math Camp • {activeMod.title}
            </span>
            <span className="game-progress-pill">
              Round {roundIdx + 1} of {activeMod.rounds.length}
            </span>
          </div>
          <button
            type="button"
            className="game-close-btn"
            onClick={onClose}
            aria-label="Close Math Module"
          >
            ✕
          </button>
        </div>

        {/* MATH OPERATION TABS */}
        <div className="math-operation-tabs">
          {Object.values(MATH_MODULES).map((mod) => (
            <button
              key={mod.id}
              type="button"
              className={`math-tab-btn ${currentModuleKey === mod.id ? 'active' : ''}`}
              onClick={() => handleSwitchModule(mod.id)}
            >
              <span className="tab-icon">{mod.icon}</span>
              <span className="tab-label">{mod.skill}</span>
            </button>
          ))}
        </div>

        {/* GAME CONTENT CONTAINER */}
        {!isCompleted ? (
          <div className="math-play-stage">
            {/* Mascot Guide Banner */}
            <div className="math-mascot-guide">
              <div className="mascot-avatar-small">
                {currentModuleKey === 'addition' && <KodiBear size={72} mood="happy" />}
                {currentModuleKey === 'subtraction' && <SandyDingo size={72} />}
                {currentModuleKey === 'multiplication' && <OlloDingo size={72} />}
                {currentModuleKey === 'division' && <ReyaRedPanda size={72} />}
              </div>
              <div className="math-question-bubble">
                <span className="question-text">{currentRound.question}</span>
                <button
                  type="button"
                  className="btn-replay-audio"
                  onClick={() => sounds.speak(currentRound.question)}
                  title="Listen again"
                >
                  🔊 Hear prompt
                </button>
              </div>
            </div>

            {/* INTERACTIVE MANIPULATIVE STAGE */}
            <div className={`manipulative-canvas mode-${currentModuleKey}`}>
              {/* 1. ADDITION: Pick apples into basket */}
              {currentModuleKey === 'addition' && (
                <div className="addition-manipulative">
                  <div className="groups-container">
                    {/* Group 1 */}
                    <div className="addition-group group-1">
                      <div className="group-label">Group 1: {currentRound.num1} {currentRound.itemEmoji}</div>
                      <div className="items-row">
                        {Array.from({ length: currentRound.num1 }).map((_, i) => {
                          const idx = `g1_${i}`;
                          const isAdded = addedItems.has(idx);
                          return (
                            <button
                              key={idx}
                              type="button"
                              className={`manipulative-item addition-item ${isAdded ? 'collected' : ''}`}
                              onClick={() => handleTapAdditionItem(idx)}
                              title="Tap to collect"
                            >
                              <span className="emoji-item">{currentRound.itemEmoji}</span>
                              {isAdded && <span className="item-check">✓</span>}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="math-operator-symbol">+</div>

                    {/* Group 2 */}
                    <div className="addition-group group-2">
                      <div className="group-label">Group 2: {currentRound.num2} {currentRound.itemEmoji}</div>
                      <div className="items-row">
                        {Array.from({ length: currentRound.num2 }).map((_, i) => {
                          const idx = `g2_${i}`;
                          const isAdded = addedItems.has(idx);
                          return (
                            <button
                              key={idx}
                              type="button"
                              className={`manipulative-item addition-item ${isAdded ? 'collected' : ''}`}
                              onClick={() => handleTapAdditionItem(idx)}
                              title="Tap to collect"
                            >
                              <span className="emoji-item">{currentRound.itemEmoji}</span>
                              {isAdded && <span className="item-check">✓</span>}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Golden Harvest Basket */}
                  <div className="addition-basket">
                    <span className="basket-label">
                      🧺 Kodi's Harvest Basket: <strong>{addedItems.size}</strong> collected!
                    </span>
                    <span className="basket-hint">(Tap all fruits to drop them in!)</span>
                  </div>
                </div>
              )}

              {/* 2. SUBTRACTION: Starfish splash away */}
              {currentModuleKey === 'subtraction' && (
                <div className="subtraction-manipulative">
                  <div className="beach-sand-shore">
                    <div className="beach-label">
                      🏖️ Sandy's Shore: Tap starfish to splash them into the waves!
                    </div>
                    <div className="starfish-grid">
                      {Array.from({ length: currentRound.startCount }).map((_, i) => {
                        const isSplashed = removedItems.has(i);
                        return (
                          <button
                            key={i}
                            type="button"
                            className={`manipulative-item subtraction-item ${isSplashed ? 'splashed' : ''}`}
                            onClick={() => handleTapSubtractionItem(i)}
                          >
                            <span className="emoji-item">{currentRound.itemEmoji}</span>
                            {isSplashed && <span className="splash-effect">🌊 Splash!</span>}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  <div className="subtraction-status-pill">
                    Started: {currentRound.startCount} — Splashed away: {removedItems.size} = <strong>{currentRound.startCount - removedItems.size} Left</strong>
                  </div>
                </div>
              )}

              {/* 3. MULTIPLICATION: Leapfrog Lilypads */}
              {currentModuleKey === 'multiplication' && (
                <div className="multiplication-manipulative">
                  <div className="lilypads-pond">
                    {Array.from({ length: currentRound.groups }).map((_, grpIdx) => {
                      const isTapped = tappedGroups.has(grpIdx);
                      return (
                        <button
                          key={grpIdx}
                          type="button"
                          className={`lilypad-group-card ${isTapped ? 'jumped' : ''}`}
                          onClick={() => handleTapGroup(grpIdx)}
                        >
                          <div className="lilypad-badge">Group #{grpIdx + 1}</div>
                          <div className="frogs-on-pad">
                            {Array.from({ length: currentRound.perGroup }).map((_, fIdx) => (
                              <span key={fIdx} className="frog-bounce">{currentRound.itemEmoji}</span>
                            ))}
                          </div>
                          <span className="group-count-tag">{currentRound.perGroup} items</span>
                        </button>
                      );
                    })}
                  </div>
                  <div className="multiplication-equation-hint">
                    {currentRound.groups} groups of {currentRound.perGroup} = {currentRound.groups} × {currentRound.perGroup}
                  </div>
                </div>
              )}

              {/* 4. DIVISION: Fair share cupcakes */}
              {currentModuleKey === 'division' && (
                <div className="division-manipulative">
                  <div className="treats-tray">
                    <div className="tray-label">
                      🧁 Treats Tray: {currentRound.totalItems - distributedItems.length} left to distribute
                    </div>
                    <div className="treats-row">
                      {Array.from({ length: currentRound.totalItems }).map((_, i) => {
                        const isGiven = distributedItems.includes(i);
                        return (
                          <button
                            key={i}
                            type="button"
                            disabled={isGiven}
                            className={`manipulative-item treat-item ${isGiven ? 'shared-out' : ''}`}
                            onClick={() => handleDistributeItem(i)}
                            title="Tap to share out"
                          >
                            <span className="emoji-item">{currentRound.itemEmoji}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="plates-row">
                    {currentRound.recipientNames.map((name, pIdx) => {
                      const itemsOnPlate = distributedItems.filter(
                        (idx) => distributedItems.indexOf(idx) % currentRound.recipients === pIdx
                      ).length;
                      return (
                        <div key={pIdx} className="recipient-plate">
                          <div className="plate-friend-tag">Friend: {name}</div>
                          <div className="plate-surface">
                            {Array.from({ length: itemsOnPlate }).map((_, idx) => (
                              <span key={idx} className="on-plate-item">{currentRound.itemEmoji}</span>
                            ))}
                          </div>
                          <div className="plate-count-badge">{itemsOnPlate} treats</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* EQUATION DISPLAY & INTERACTIVE CHOICES */}
            <div className="math-equation-bar">
              <div className="equation-math-string">
                {currentModuleKey === 'addition' && (
                  <span>{currentRound.num1} + {currentRound.num2} = ?</span>
                )}
                {currentModuleKey === 'subtraction' && (
                  <span>{currentRound.startCount} - {currentRound.removeCount} = ?</span>
                )}
                {currentModuleKey === 'multiplication' && (
                  <span>{currentRound.groups} × {currentRound.perGroup} = ?</span>
                )}
                {currentModuleKey === 'division' && (
                  <span>{currentRound.totalItems} ÷ {currentRound.recipients} = ?</span>
                )}
              </div>

              {/* CHOICE OPTIONS */}
              <div className="math-options-grid">
                {currentRound.options.map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    className={`math-option-btn ${
                      selectedAnswer === opt
                        ? feedback === 'correct'
                          ? 'correct'
                          : 'incorrect'
                        : ''
                    }`}
                    onClick={() => handleSelectOption(opt)}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            {/* FEEDBACK STATUS */}
            {feedback === 'correct' && (
              <div className="game-feedback-toast correct">
                🎉 Hooray! That is exactly right! 🌟
              </div>
            )}
            {feedback === 'try_again' && (
              <div className="game-feedback-toast try-again">
                💛 Nice try! Let’s count the pieces once more!
              </div>
            )}
          </div>
        ) : (
          /* COMPLETION CELEBRATION */
          <div className="game-completion-celebration">
            <div className="celebration-confetti">✨ ⭐ 🎈 🎊 🏆 ✨</div>
            <div className="celebration-mascot">
              {currentModuleKey === 'addition' && <KodiBear size={120} mood="happy" />}
              {currentModuleKey === 'subtraction' && <SandyDingo size={120} />}
              {currentModuleKey === 'multiplication' && <OlloDingo size={120} />}
              {currentModuleKey === 'division' && <ReyaRedPanda size={120} />}
            </div>

            <h2 className="celebration-title">Math Champion!</h2>
            <p className="celebration-message">
              {childName} completed <strong>{activeMod.title}</strong>! You mastered <strong>{activeMod.skill}</strong> with flying colors!
            </p>

            <div className="celebration-stars-award">
              <span className="big-stars">⭐⭐⭐⭐⭐</span>
              <span className="stars-earned-text">+{starsAwarded} Stars Added to Your Profile!</span>
            </div>

            {isSaving && <div className="saving-indicator">Saving to learning profile...</div>}

            <div className="celebration-actions">
              <button
                type="button"
                className="btn-celebrate-primary"
                onClick={onClose}
              >
                Back to Camp 🏕️
              </button>
              <button
                type="button"
                className="btn-celebrate-secondary"
                onClick={() => {
                  setRoundIdx(0);
                  setIsCompleted(false);
                }}
              >
                Play Again 🔄
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
