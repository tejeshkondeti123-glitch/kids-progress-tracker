// client/src/components/KhanKidsHome.jsx
import React, { useState } from 'react';
import { KodiBear, OlloDingo, ReyaRedPanda, PeckBird, SandyDingo, CharacterAvatar } from './Characters';
import { sounds } from '../services/soundEffects';

export default function KhanKidsHome({
  activeChild,
  availableChildren = [],
  onSelectChild,
  onOpenParentDashboard,
  onLaunchGame, // 'counting' | 'shapes' | 'story' | 'alphabet' | 'stickers'
  starCount = 18,
  onOpenStickerBook,
}) {
  const [isChildMenuOpen, setIsChildMenuOpen] = useState(false);
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [mascotQuote, setMascotQuote] = useState('Welcome to Khan Academy Kids! Tap anywhere to learn & play!');
  const [isMuted, setIsMuted] = useState(sounds.isMuted);

  const handleMascotTap = (name, quote) => {
    sounds.playPop(520);
    setMascotQuote(`"${quote}" — ${name}`);
    sounds.speak(quote);
  };

  const handleToggleSound = () => {
    const muted = sounds.toggleMute();
    setIsMuted(muted);
    if (!muted) {
      sounds.playPop(440);
    }
  };

  return (
    <div className="khan-kids-app-container">
      {/* KHAN KIDS TOP NAVIGATION BAR */}
      <header className="khan-kids-topbar">
        {/* Left: For Parents Button */}
        <div className="topbar-left">
          <button
            type="button"
            className="btn-for-parents"
            onClick={onOpenParentDashboard}
            aria-label="Parent Dashboard Access"
          >
            <span className="parent-btn-icon" aria-hidden="true">🔒</span>
            <span className="parent-btn-text">For Parents</span>
          </button>
        </div>

        {/* Center: Child Profile Selector */}
        <div className="topbar-center">
          <div className="child-profile-pill" onClick={() => setIsChildMenuOpen(!isChildMenuOpen)}>
            <div className="child-avatar-frame">
              <CharacterAvatar avatar={activeChild?.avatar} size={36} />
            </div>
            <div className="child-name-meta">
              <span className="child-name-label">{activeChild?.name || 'Sarah'}</span>
              <span className="child-age-label">Age {activeChild?.age || 7} ▾</span>
            </div>
          </div>

          {/* Child Switcher Dropdown */}
          {isChildMenuOpen && (
            <div className="child-switch-dropdown">
              <div className="dropdown-title">Choose Learner</div>
              {availableChildren.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  className={`child-switch-option ${c.id === activeChild?.id ? 'active' : ''}`}
                  onClick={() => {
                    sounds.playPop(480);
                    onSelectChild(c);
                    setIsChildMenuOpen(false);
                  }}
                >
                  <CharacterAvatar avatar={c.avatar} size={32} />
                  <div className="switch-name-group">
                    <span className="switch-name">{c.name}</span>
                    <span className="switch-age">Age {c.age}</span>
                  </div>
                  {c.id === activeChild?.id && <span className="active-checkmark">✓</span>}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Star Counter & Sound Toggle */}
        <div className="topbar-right">
          <button
            type="button"
            className="star-counter-pill"
            onClick={onOpenStickerBook}
            aria-label="View Star Rewards and Sticker Book"
          >
            <span className="star-icon" aria-hidden="true">⭐</span>
            <span className="star-count-num">{starCount}</span>
            <span className="sticker-book-tag">Stickers</span>
          </button>

          <button
            type="button"
            className={`btn-sound-toggle ${isMuted ? 'muted' : ''}`}
            onClick={handleToggleSound}
            aria-label={isMuted ? 'Unmute audio' : 'Mute audio'}
            title={isMuted ? 'Audio Muted' : 'Audio On'}
          >
            {isMuted ? '🔇' : '🔊'}
          </button>
        </div>
      </header>

      {/* MASCOT SPEECH BUBBLE NOTIFICATION */}
      <div className="mascot-speech-bubble" role="status">
        <span className="bubble-icon">💬</span>
        <span className="bubble-text">{mascotQuote}</span>
      </div>

      {/* MAIN PLAYGROUND / SCENIC TREEHOUSE LANDSCAPE */}
      <main className="khan-kids-landscape">
        {/* Animated Sky Elements */}
        <div className="sky-sun" aria-hidden="true">☀️</div>
        <div className="sky-rainbow" aria-hidden="true">🌈</div>
        <div className="sky-cloud sky-cloud-1" aria-hidden="true">☁️</div>
        <div className="sky-cloud sky-cloud-2" aria-hidden="true">☁️</div>
        <div className="sky-cloud sky-cloud-3" aria-hidden="true">☁️</div>

        {/* Big Central Play Adventure Button with Kodi */}
        <div className="central-play-pod">
          <div className="kodi-host-wrapper" onClick={() => handleMascotTap('Kodi', 'Are you ready for our daily counting adventure?')}>
            <KodiBear size={140} mood="happy" className="hover-bounce" />
          </div>

          <button
            type="button"
            className="big-play-btn"
            onClick={() => onLaunchGame('counting')}
            aria-label="Start Today's Learning Journey with Kodi"
          >
            <span className="play-triangle" aria-hidden="true">▶</span>
            <span className="play-btn-text">PLAY!</span>
            <span className="play-subtext">Today&apos;s Adventure</span>
          </button>
        </div>

        {/* LEARNING STATIONS ISLANDS */}
        <div className="learning-islands-grid">
          {/* Station 1: Math Camp */}
          <div className="island-card math-island">
            <div className="island-header">
              <span className="island-badge">🔢 Math Camp</span>
              <span className="island-stars">⭐⭐⭐</span>
            </div>
            <div className="island-content">
              <div className="island-character-icon">
                <OlloDingo size={80} onClick={() => handleMascotTap('Ollo', 'Shapes and counting are my absolute favorite!')} />
              </div>
              <div className="island-actions">
                <button
                  type="button"
                  className="station-btn count-btn"
                  onClick={() => onLaunchGame('counting')}
                >
                  <span>Counting 1-10</span>
                  <span className="station-btn-arrow">➔</span>
                </button>
                <button
                  type="button"
                  className="station-btn shape-btn"
                  onClick={() => onLaunchGame('shapes')}
                >
                  <span>Shape Safari</span>
                  <span className="station-btn-arrow">➔</span>
                </button>
              </div>
            </div>
          </div>

          {/* Station 2: Reading Cove */}
          <div className="island-card reading-island">
            <div className="island-header">
              <span className="island-badge">📖 Reading Cove</span>
              <span className="island-stars">⭐⭐⭐</span>
            </div>
            <div className="island-content">
              <div className="island-character-icon">
                <ReyaRedPanda size={80} onClick={() => handleMascotTap('Reya', 'Come read a magical storybook with me!')} />
              </div>
              <div className="island-actions">
                <button
                  type="button"
                  className="station-btn story-btn"
                  onClick={() => onLaunchGame('story')}
                >
                  <span>Story Time</span>
                  <span className="station-btn-arrow">➔</span>
                </button>
                <button
                  type="button"
                  className="station-btn abc-btn"
                  onClick={() => onLaunchGame('alphabet')}
                >
                  <span>Letter Sounds</span>
                  <span className="station-btn-arrow">➔</span>
                </button>
              </div>
            </div>
          </div>

          {/* Station 3: Library & Creative Stickers */}
          <div className="island-card create-island">
            <div className="island-header">
              <span className="island-badge">🎨 Creative & Library</span>
              <span className="island-stars">⭐⭐⭐</span>
            </div>
            <div className="island-content">
              <div className="island-character-icon">
                <PeckBird size={74} onClick={() => handleMascotTap('Peck', 'Look at all the awesome stickers you earned!')} />
              </div>
              <div className="island-actions">
                <button
                  type="button"
                  className="station-btn sticker-btn"
                  onClick={onOpenStickerBook}
                >
                  <span>Sticker Book</span>
                  <span className="station-btn-arrow">➔</span>
                </button>
                <button
                  type="button"
                  className="station-btn library-btn"
                  onClick={() => setIsLibraryOpen(true)}
                >
                  <span>Explore Library 📚</span>
                  <span className="station-btn-arrow">➔</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* BOTTOM MASCOT PARADE BAR */}
        <div className="mascot-parade-dock">
          <div
            className="parade-mascot"
            onClick={() => handleMascotTap('Sandy', 'Hi! Khan Academy Kids is full of wonder and joy!')}
            title="Tap Sandy!"
          >
            <SandyDingo size={58} />
            <span className="mascot-dock-label">Sandy</span>
          </div>
          <div
            className="parade-mascot"
            onClick={() => handleMascotTap('Ollo', 'Keep up the good work!')}
            title="Tap Ollo!"
          >
            <OlloDingo size={58} />
            <span className="mascot-dock-label">Ollo</span>
          </div>
          <div
            className="parade-mascot active-guide"
            onClick={() => handleMascotTap('Kodi', 'We are having so much fun learning today!')}
            title="Tap Kodi!"
          >
            <KodiBear size={66} />
            <span className="mascot-dock-label">Kodi</span>
          </div>
          <div
            className="parade-mascot"
            onClick={() => handleMascotTap('Reya', 'Every book is a brand new adventure!')}
            title="Tap Reya!"
          >
            <ReyaRedPanda size={58} />
            <span className="mascot-dock-label">Reya</span>
          </div>
          <div
            className="parade-mascot"
            onClick={() => handleMascotTap('Peck', 'Sing with me! Chirp chirp!')}
            title="Tap Peck!"
          >
            <PeckBird size={54} />
            <span className="mascot-dock-label">Peck</span>
          </div>
        </div>
      </main>

      {/* FULL LIBRARY MODAL */}
      {isLibraryOpen && (
        <div className="game-overlay" role="dialog" aria-modal="true">
          <div className="game-modal-card library-modal">
            <div className="game-header">
              <div className="game-header-info">
                <span className="game-badge">📚 Khan Academy Kids • Full Library</span>
              </div>
              <button
                type="button"
                className="game-close-btn"
                onClick={() => setIsLibraryOpen(false)}
                aria-label="Close Library"
              >
                ✕
              </button>
            </div>

            <div className="library-body">
              <h2 className="library-headline">Explore by Learning Area</h2>
              <div className="library-cards-grid">
                <div
                  className="library-book-card"
                  onClick={() => {
                    setIsLibraryOpen(false);
                    onLaunchGame('counting');
                  }}
                >
                  <span className="lib-emoji">🔢</span>
                  <h3>Numbers & Counting</h3>
                  <p>Count objects 1-10 with musical feedback</p>
                  <button type="button" className="lib-launch-btn">Play Now</button>
                </div>

                <div
                  className="library-book-card"
                  onClick={() => {
                    setIsLibraryOpen(false);
                    onLaunchGame('shapes');
                  }}
                >
                  <span className="lib-emoji">📐</span>
                  <h3>Geometry & Shapes</h3>
                  <p>Spot circles, squares, and triangles in real items</p>
                  <button type="button" className="lib-launch-btn">Play Now</button>
                </div>

                <div
                  className="library-book-card"
                  onClick={() => {
                    setIsLibraryOpen(false);
                    onLaunchGame('story');
                  }}
                >
                  <span className="lib-emoji">📖</span>
                  <h3>Interactive Books</h3>
                  <p>Listen and answer comprehension questions</p>
                  <button type="button" className="lib-launch-btn">Play Now</button>
                </div>

                <div
                  className="library-book-card"
                  onClick={() => {
                    setIsLibraryOpen(false);
                    onLaunchGame('alphabet');
                  }}
                >
                  <span className="lib-emoji">🔤</span>
                  <h3>Phonics & ABCs</h3>
                  <p>Match letters to sounds with Peck</p>
                  <button type="button" className="lib-launch-btn">Play Now</button>
                </div>

                <div
                  className="library-book-card"
                  onClick={() => {
                    setIsLibraryOpen(false);
                    onOpenStickerBook();
                  }}
                >
                  <span className="lib-emoji">🎨</span>
                  <h3>Creative Canvas</h3>
                  <p>Create stories with character stickers</p>
                  <button type="button" className="lib-launch-btn">Open Canvas</button>
                </div>

                <div
                  className="library-book-card parent-card-highlight"
                  onClick={() => {
                    setIsLibraryOpen(false);
                    onOpenParentDashboard();
                  }}
                >
                  <span className="lib-emoji">👨‍👩‍👧‍👦</span>
                  <h3>Parent Companion</h3>
                  <p>View daily summaries, mastery & home activities</p>
                  <button type="button" className="lib-launch-btn parent-style">Open Companion</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
