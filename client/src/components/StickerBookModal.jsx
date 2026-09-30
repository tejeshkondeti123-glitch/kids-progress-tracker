// client/src/components/StickerBookModal.jsx
import React, { useState } from 'react';
import { KodiBear, OlloDingo, ReyaRedPanda, PeckBird, SandyDingo } from './Characters';
import { sounds } from '../services/soundEffects';

const AVAILABLE_STICKERS = [
  { id: 'stk_1', name: 'Kodi Bear', type: 'character', render: () => <KodiBear size={54} /> },
  { id: 'stk_2', name: 'Ollo Dingo', type: 'character', render: () => <OlloDingo size={50} /> },
  { id: 'stk_3', name: 'Reya Panda', type: 'character', render: () => <ReyaRedPanda size={50} /> },
  { id: 'stk_4', name: 'Peck Bird', type: 'character', render: () => <PeckBird size={46} /> },
  { id: 'stk_5', name: 'Sandy Dingo', type: 'character', render: () => <SandyDingo size={50} /> },
  { id: 'stk_6', name: 'Gold Star', type: 'reward', emoji: '⭐' },
  { id: 'stk_7', name: 'Rainbow', type: 'reward', emoji: '🌈' },
  { id: 'stk_8', name: 'Picnic Basket', type: 'reward', emoji: '🧺' },
  { id: 'stk_9', name: 'Strawberry', type: 'reward', emoji: '🍓' },
  { id: 'stk_10', name: 'Balloon', type: 'reward', emoji: '🎈' },
  { id: 'stk_11', name: 'Rocket', type: 'reward', emoji: '🚀' },
  { id: 'stk_12', name: 'Treehouse', type: 'reward', emoji: '🏕️' },
];

export default function StickerBookModal({ childName = 'Sarah', starCount = 18, onClose }) {
  const [placedStickers, setPlacedStickers] = useState([
    { id: 1, stickerId: 'stk_1', x: 25, y: 40 },
    { id: 2, stickerId: 'stk_2', x: 65, y: 45 },
    { id: 3, stickerId: 'stk_6', x: 45, y: 20 },
    { id: 4, stickerId: 'stk_7', x: 50, y: 10 },
  ]);

  const handlePlaceSticker = (sticker) => {
    sounds.playPop(550);
    // Place near random center region
    const x = Math.floor(20 + Math.random() * 60);
    const y = Math.floor(20 + Math.random() * 55);

    const newPlaced = {
      id: Date.now() + Math.random(),
      stickerId: sticker.id,
      x,
      y,
    };
    setPlacedStickers((prev) => [...prev, newPlaced]);
  };

  const handleClearCanvas = () => {
    sounds.playPop(300);
    setPlacedStickers([]);
  };

  return (
    <div className="game-overlay" role="dialog" aria-modal="true">
      <div className="game-modal-card stickerbook-modal">
        {/* Header */}
        <div className="game-header">
          <div className="game-header-info">
            <span className="game-badge">🎨 Creative Corner • Sticker Play</span>
            <span className="game-round-indicator">⭐ {starCount} Stars Earned</span>
          </div>
          <button
            type="button"
            className="game-close-btn"
            onClick={onClose}
            aria-label="Close Sticker Book"
          >
            ✕
          </button>
        </div>

        <div className="stickerbook-content">
          <p className="stickerbook-instructions">
            Tap any sticker below to place it onto {childName}&apos;s sunny camp scene!
          </p>

          {/* Interactive Scenic Canvas */}
          <div className="sticker-scene-canvas">
            {/* Background elements */}
            <div className="scene-sun" aria-hidden="true">☀️</div>
            <div className="scene-cloud c1" aria-hidden="true">☁️</div>
            <div className="scene-cloud c2" aria-hidden="true">☁️</div>
            <div className="scene-hills" aria-hidden="true" />

            {/* Placed stickers */}
            {placedStickers.map((item) => {
              const def = AVAILABLE_STICKERS.find((s) => s.id === item.stickerId);
              if (!def) return null;

              return (
                <div
                  key={item.id}
                  className="placed-sticker animated-bounce"
                  style={{ left: `${item.x}%`, top: `${item.y}%` }}
                >
                  {def.render ? (
                    def.render()
                  ) : (
                    <span className="sticker-emoji">{def.emoji}</span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Sticker Palette tray */}
          <div className="sticker-palette-tray">
            <div className="palette-header">
              <span className="palette-title">Your Sticker Collection ({AVAILABLE_STICKERS.length})</span>
              <button
                type="button"
                className="btn-clear-canvas"
                onClick={handleClearCanvas}
              >
                Clear Canvas 🧹
              </button>
            </div>
            <div className="sticker-scroll-row">
              {AVAILABLE_STICKERS.map((stk) => (
                <button
                  key={stk.id}
                  type="button"
                  className="sticker-pick-btn"
                  onClick={() => handlePlaceSticker(stk)}
                  aria-label={`Place ${stk.name} sticker`}
                >
                  {stk.render ? stk.render() : <span className="palette-emoji">{stk.emoji}</span>}
                  <span className="sticker-name">{stk.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
