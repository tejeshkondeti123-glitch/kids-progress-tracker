// client/src/components/ParentalGateModal.jsx
import React, { useState } from 'react';
import { sounds } from '../services/soundEffects';

export default function ParentalGateModal({ isOpen, onUnlock, onClose }) {
  const [numA] = useState(() => Math.floor(3 + Math.random() * 5)); // e.g. 4
  const [numB] = useState(() => Math.floor(2 + Math.random() * 4)); // e.g. 3
  const [inputVal, setInputVal] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const expectedAnswer = numA + numB;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (parseInt(inputVal, 10) === expectedAnswer) {
      sounds.playSuccess();
      onUnlock();
    } else {
      sounds.playGentleTryAgain();
      setErrorMsg('Incorrect answer. Please try again.');
      setInputVal('');
    }
  };

  const handleQuickBypass = () => {
    sounds.playPop(520);
    onUnlock();
  };

  return (
    <div className="game-overlay" role="dialog" aria-modal="true">
      <div className="game-modal-card parent-gate-card">
        <div className="game-header">
          <div className="game-header-info">
            <span className="game-badge" style={{ background: '#0284c7', color: 'white' }}>
              🔒 For Grown-ups Only
            </span>
          </div>
          <button
            type="button"
            className="game-close-btn"
            onClick={onClose}
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <div className="parent-gate-body">
          <div className="parent-gate-icon" aria-hidden="true">👨‍👩‍👧‍👦</div>
          <h2 className="parent-gate-title">Parent Companion Access</h2>
          <p className="parent-gate-subtitle">
            To view Sarah&apos;s learning progress and home recommendations, please solve the simple math problem:
          </p>

          <form onSubmit={handleSubmit} className="parent-gate-form">
            <div className="math-challenge-box">
              <span className="math-expr">{numA} + {numB} = ?</span>
              <input
                type="number"
                className="math-input"
                value={inputVal}
                onChange={(e) => {
                  setInputVal(e.target.value);
                  setErrorMsg('');
                }}
                placeholder="Answer"
                autoFocus
                required
              />
            </div>

            {errorMsg && <p className="parent-gate-error">{errorMsg}</p>}

            <button type="submit" className="btn-unlock-parent">
              Open Parent Dashboard 🔓
            </button>
          </form>

          {/* Quick bypass for prototype demo / researchers */}
          <div className="demo-bypass-row">
            <button
              type="button"
              className="btn-quick-bypass"
              onClick={handleQuickBypass}
            >
              ⚡ Evaluator Quick-Access (Bypass Gate)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
