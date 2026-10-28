// client/src/components/RewardsAndGamificationModal.jsx
import React, { useState } from 'react';
import { KodiBear, SandyDingo, OlloDingo, ReyaRedPanda, PeckBird } from './Characters';
import { sounds } from '../services/soundEffects';

const ACCESSORIES = [
  { id: 'none', name: 'Original', icon: '✨', cost: 0 },
  { id: 'crown', name: 'Party Crown', icon: '👑', cost: 3 },
  { id: 'glasses', name: 'Star Shades', icon: '🕶️', cost: 5 },
  { id: 'safari', name: 'Explorer Hat', icon: '🤠', cost: 5 },
  { id: 'space', name: 'Astronaut Helmet', icon: '🚀', cost: 8 },
  { id: 'cape', name: 'Hero Cape', icon: '🦸', cost: 10 },
  { id: 'chef', name: 'Baker Hat', icon: '👨‍🍳', cost: 6 },
];

const TROPHIES = [
  {
    id: 't_first',
    name: 'Curious Cub',
    desc: 'Completed your first learning activity!',
    icon: '🐾',
    tier: 'Bronze',
    unlocked: true,
  },
  {
    id: 't_add',
    name: 'Addition Ace',
    desc: 'Harvested apples and solved addition problems!',
    icon: '🍎',
    tier: 'Gold',
    unlocked: true,
  },
  {
    id: 't_sub',
    name: 'Subtraction Star',
    desc: 'Splashed starfish and mastered take-away math!',
    icon: '⭐',
    tier: 'Gold',
    unlocked: true,
  },
  {
    id: 't_mul',
    name: 'Leapfrog Multiplier',
    desc: 'Learned repeated groups and equal arrays!',
    icon: '🐸',
    tier: 'Diamond',
    unlocked: true,
  },
  {
    id: 't_div',
    name: 'Fair Share Hero',
    desc: 'Shared cupcakes and snacks equally with friends!',
    icon: '🧁',
    tier: 'Diamond',
    unlocked: true,
  },
  {
    id: 't_count',
    name: 'Counting Champion',
    desc: 'Counted 1 to 10 objects in order!',
    icon: '🔢',
    tier: 'Silver',
    unlocked: true,
  },
  {
    id: 't_streak',
    name: '3-Day Streak Legend',
    desc: 'Came back to learn 3 days in a row!',
    icon: '🔥',
    tier: 'Gold',
    unlocked: true,
  },
  {
    id: 't_star',
    name: 'Star Dynamo',
    desc: 'Earned 20+ glowing stars across activities!',
    icon: '🌟',
    tier: 'Gold',
    unlocked: true,
  },
];

export default function RewardsAndGamificationModal({
  childName = 'Sarah',
  starCount = 18,
  onSpendStars,
  onClose,
}) {
  const [activeTab, setActiveTab] = useState('wardrobe'); // 'wardrobe' | 'trophies' | 'streak'
  const [selectedMascot, setSelectedMascot] = useState('kodi'); // 'kodi' | 'sandy' | 'ollo' | 'reya' | 'peck'
  const [equippedOutfits, setEquippedOutfits] = useState({
    kodi: 'crown',
    sandy: 'glasses',
    ollo: 'safari',
    reya: 'chef',
    peck: 'cape',
  });
  const [unlockedAccessories, setUnlockedAccessories] = useState(
    new Set(['none', 'crown', 'glasses', 'safari'])
  );

  const handleEquipAccessory = (acc) => {
    if (!unlockedAccessories.has(acc.id)) {
      if (starCount < acc.cost) {
        sounds.playGentleTryAgain();
        sounds.speak(`You need ${acc.cost} stars to unlock the ${acc.name}! Keep playing to earn more.`);
        return;
      }
      // Unlock with stars
      if (onSpendStars) onSpendStars(acc.cost);
      setUnlockedAccessories(new Set([...unlockedAccessories, acc.id]));
      sounds.playSuccess();
      sounds.speak(`Unlocked ${acc.name}! Looks wonderful on ${selectedMascot}!`);
    } else {
      sounds.playPop(520);
    }

    setEquippedOutfits({
      ...equippedOutfits,
      [selectedMascot]: acc.id,
    });
  };

  const handleTrophyTap = (trophy) => {
    sounds.playSuccess();
    sounds.speak(`${trophy.name}: ${trophy.desc}`);
  };

  const currentOutfit = equippedOutfits[selectedMascot] || 'none';
  const outfitData = ACCESSORIES.find((a) => a.id === currentOutfit);

  return (
    <div className="game-overlay rewards-gamification-overlay" role="dialog" aria-modal="true">
      <div className="game-modal-card rewards-modal-card">
        {/* MODAL HEADER */}
        <div className="game-header">
          <div className="game-header-info">
            <span className="game-badge">🏆 Rewards & Gamification Clubhouse</span>
            <span className="user-stars-badge">⭐ {starCount} Stars</span>
          </div>
          <button
            type="button"
            className="game-close-btn"
            onClick={onClose}
            aria-label="Close Rewards Clubhouse"
          >
            ✕
          </button>
        </div>

        {/* LEVEL & XP PROGRESS BAR */}
        <div className="rewards-level-banner">
          <div className="level-badge-pod">
            <span className="level-shield">🏅</span>
            <div className="level-meta">
              <span className="level-title">Level 4 Explorer</span>
              <span className="level-sub">{childName}'s Learning Journey</span>
            </div>
          </div>

          <div className="xp-progress-bar-container">
            <div className="xp-bar-labels">
              <span>Experience XP</span>
              <span>180 / 250 XP</span>
            </div>
            <div className="xp-track">
              <div className="xp-fill" style={{ width: '72%' }}></div>
            </div>
            <span className="xp-hint">70 XP until Level 5 Star Wizard!</span>
          </div>

          {/* Daily Streak Pill */}
          <div className="streak-fire-pill" title="Daily Streak Active!">
            <span className="fire-icon">🔥</span>
            <div className="streak-text-group">
              <span className="streak-num">3 Days</span>
              <span className="streak-label">Streak!</span>
            </div>
          </div>
        </div>

        {/* REWARDS TABS */}
        <div className="rewards-nav-tabs">
          <button
            type="button"
            className={`rewards-tab-btn ${activeTab === 'wardrobe' ? 'active' : ''}`}
            onClick={() => setActiveTab('wardrobe')}
          >
            <span>🎩 Character Dress-Up</span>
          </button>
          <button
            type="button"
            className={`rewards-tab-btn ${activeTab === 'trophies' ? 'active' : ''}`}
            onClick={() => setActiveTab('trophies')}
          >
            <span>🏆 Milestone Trophy Cabinet</span>
          </button>
          <button
            type="button"
            className={`rewards-tab-btn ${activeTab === 'streak' ? 'active' : ''}`}
            onClick={() => setActiveTab('streak')}
          >
            <span>🔥 Daily Streaks & Chests</span>
          </button>
        </div>

        {/* TAB 1: CHARACTER DRESS-UP WARDROBE */}
        {activeTab === 'wardrobe' && (
          <div className="wardrobe-stage">
            {/* Mascot Picker Row */}
            <div className="mascot-selection-row">
              <button
                type="button"
                className={`mascot-select-pill ${selectedMascot === 'kodi' ? 'active' : ''}`}
                onClick={() => setSelectedMascot('kodi')}
              >
                <span>🐻 Kodi</span>
              </button>
              <button
                type="button"
                className={`mascot-select-pill ${selectedMascot === 'sandy' ? 'active' : ''}`}
                onClick={() => setSelectedMascot('sandy')}
              >
                <span>🦊 Sandy</span>
              </button>
              <button
                type="button"
                className={`mascot-select-pill ${selectedMascot === 'ollo' ? 'active' : ''}`}
                onClick={() => setSelectedMascot('ollo')}
              >
                <span>🐕 Ollo</span>
              </button>
              <button
                type="button"
                className={`mascot-select-pill ${selectedMascot === 'reya' ? 'active' : ''}`}
                onClick={() => setSelectedMascot('reya')}
              >
                <span>🐼 Reya</span>
              </button>
              <button
                type="button"
                className={`mascot-select-pill ${selectedMascot === 'peck' ? 'active' : ''}`}
                onClick={() => setSelectedMascot('peck')}
              >
                <span>🐦 Peck</span>
              </button>
            </div>

            {/* Character Showcase Stage */}
            <div className="character-preview-pod">
              <div className="character-dressing-room">
                {selectedMascot === 'kodi' && <KodiBear size={150} mood="happy" />}
                {selectedMascot === 'sandy' && <SandyDingo size={150} />}
                {selectedMascot === 'ollo' && <OlloDingo size={150} />}
                {selectedMascot === 'reya' && <ReyaRedPanda size={150} />}
                {selectedMascot === 'peck' && <PeckBird size={130} />}

                {/* Floating accessory badge overlay */}
                {outfitData?.id !== 'none' && (
                  <div className="equipped-accessory-float">
                    <span className="acc-icon">{outfitData?.icon}</span>
                    <span className="acc-tag">{outfitData?.name}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Accessories Shelf */}
            <div className="accessories-shelf">
              <div className="shelf-title">
                Choose an accessory for {selectedMascot.toUpperCase()} (Tap to unlock with stars):
              </div>
              <div className="accessories-grid">
                {ACCESSORIES.map((acc) => {
                  const isUnlocked = unlockedAccessories.has(acc.id);
                  const isEquipped = currentOutfit === acc.id;

                  return (
                    <button
                      key={acc.id}
                      type="button"
                      className={`accessory-card ${isEquipped ? 'equipped' : ''} ${
                        !isUnlocked ? 'locked' : ''
                      }`}
                      onClick={() => handleEquipAccessory(acc)}
                    >
                      <span className="accessory-icon">{acc.icon}</span>
                      <span className="accessory-name">{acc.name}</span>
                      <div className="accessory-status-badge">
                        {isEquipped ? (
                          <span className="status-equipped">Equipped ✓</span>
                        ) : isUnlocked ? (
                          <span className="status-owned">Wear</span>
                        ) : (
                          <span className="status-cost">⭐ {acc.cost}</span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: TROPHY CABINET */}
        {activeTab === 'trophies' && (
          <div className="trophy-cabinet-stage">
            <p className="cabinet-subtitle">
              Milestones earned through math adventures, daily practice, and reading! Tap any trophy to inspect.
            </p>
            <div className="trophies-grid">
              {TROPHIES.map((trophy) => (
                <div
                  key={trophy.id}
                  className={`trophy-card tier-${trophy.tier.toLowerCase()}`}
                  onClick={() => handleTrophyTap(trophy)}
                  tabIndex={0}
                  role="button"
                >
                  <div className="trophy-tier-ribbon">{trophy.tier}</div>
                  <div className="trophy-icon-ring">{trophy.icon}</div>
                  <div className="trophy-info">
                    <h4 className="trophy-name">{trophy.name}</h4>
                    <p className="trophy-desc">{trophy.desc}</p>
                  </div>
                  <span className="trophy-unlocked-pill">Unlocked ✨</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: DAILY STREAK & MYSTERY CHESTS */}
        {activeTab === 'streak' && (
          <div className="streak-rewards-stage">
            <div className="streak-hero-card">
              <div className="flame-big-visual">🔥</div>
              <div className="streak-hero-content">
                <h3>3-Day Super Learner Streak!</h3>
                <p>
                  {childName} has practiced consistently! Keep learning tomorrow to reach the 4-day milestone!
                </p>
              </div>
            </div>

            <div className="streak-calendar-row">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, idx) => {
                const isCompletedDay = idx <= 2;
                const isToday = idx === 2;
                return (
                  <div
                    key={day}
                    className={`streak-day-cell ${isCompletedDay ? 'done' : ''} ${
                      isToday ? 'today' : ''
                    }`}
                  >
                    <span className="day-name">{day}</span>
                    <span className="day-icon">{isCompletedDay ? '🔥' : '⚪'}</span>
                    <span className="day-reward">{isCompletedDay ? '+3 ⭐' : 'Locked'}</span>
                  </div>
                );
              })}
            </div>

            {/* Mystery Reward Chest */}
            <div className="mystery-chest-pod">
              <div className="chest-visual">🎁</div>
              <div className="chest-details">
                <h4>Streak Milestone Bonus Chest!</h4>
                <p>Reach a 5-day streak to unlock a mystery golden sticker & 10 bonus stars!</p>
              </div>
              <button
                type="button"
                className="btn-claim-streak-preview"
                onClick={() => {
                  sounds.playSuccess();
                  sounds.speak('Streak chest is ready after 2 more days of learning!');
                }}
              >
                2 Days Remaining ⏳
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
