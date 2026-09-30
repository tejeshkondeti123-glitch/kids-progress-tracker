// client/src/components/Characters.jsx
import React from 'react';

/**
 * Kodi the Bear - Khan Academy Kids protagonist
 */
export function KodiBear({ size = 120, mood = 'happy', className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 160 160"
      className={`kodi-character ${className}`}
      aria-label="Kodi the Bear"
      style={{ overflow: 'visible' }}
    >
      {/* Ears */}
      <circle cx="42" cy="46" r="20" fill="#78350f" />
      <circle cx="42" cy="46" r="11" fill="#fde68a" />
      <circle cx="118" cy="46" r="20" fill="#78350f" />
      <circle cx="118" cy="46" r="11" fill="#fde68a" />

      {/* Head */}
      <circle cx="80" cy="78" r="48" fill="#92400e" />

      {/* Cheeks */}
      <ellipse cx="50" cy="88" rx="8" ry="5" fill="#fca5a5" opacity="0.7" />
      <ellipse cx="110" cy="88" rx="8" ry="5" fill="#fca5a5" opacity="0.7" />

      {/* Snout / Muzzle */}
      <ellipse cx="80" cy="88" rx="26" ry="20" fill="#fef08a" />

      {/* Nose */}
      <ellipse cx="80" cy="78" rx="10" ry="7" fill="#1e1b4b" />
      <ellipse cx="78" cy="76" rx="3" ry="1.5" fill="#ffffff" />

      {/* Mouth */}
      {mood === 'happy' || mood === 'celebrating' ? (
        <path
          d="M 68 88 Q 80 102 92 88"
          stroke="#1e1b4b"
          strokeWidth="3.5"
          fill="#ef4444"
          strokeLinecap="round"
        />
      ) : (
        <path
          d="M 72 92 Q 80 97 88 92"
          stroke="#1e1b4b"
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
        />
      )}

      {/* Eyes */}
      <ellipse cx="62" cy="68" rx="5.5" ry="7.5" fill="#1e1b4b" />
      <circle cx="60.5" cy="65.5" r="2.2" fill="#ffffff" />
      <ellipse cx="98" cy="68" rx="5.5" ry="7.5" fill="#1e1b4b" />
      <circle cx="96.5" cy="65.5" r="2.2" fill="#ffffff" />

      {/* Red Shirt Body */}
      <path
        d="M 45 120 Q 80 112 115 120 L 126 160 L 34 160 Z"
        fill="#dc2626"
        stroke="#991b1b"
        strokeWidth="2.5"
      />
      {/* Shirt Collar / Khan emblem touch */}
      <path
        d="M 72 120 L 80 130 L 88 120"
        stroke="#fef08a"
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
      />
      {/* Red Bear Paws */}
      <ellipse cx="40" cy="136" rx="9" ry="7" fill="#92400e" />
      <ellipse cx="120" cy="136" rx="9" ry="7" fill="#92400e" />
    </svg>
  );
}

/**
 * Ollo the Dingo - cheerful yellow dingo with overalls
 */
export function OlloDingo({ size = 110, mood = 'happy', className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 160 160"
      className={`ollo-character ${className}`}
      aria-label="Ollo the Dingo"
      style={{ overflow: 'visible' }}
    >
      {/* Pointy Dingo Ears */}
      <polygon points="35,65 22,20 60,45" fill="#eab308" stroke="#ca8a04" strokeWidth="2" />
      <polygon points="36,55 28,30 52,47" fill="#fef08a" />
      <polygon points="125,65 138,20 100,45" fill="#eab308" stroke="#ca8a04" strokeWidth="2" />
      <polygon points="124,55 132,30 108,47" fill="#fef08a" />

      {/* Head */}
      <ellipse cx="80" cy="78" rx="44" ry="40" fill="#facc15" />

      {/* White face patch */}
      <ellipse cx="80" cy="90" rx="28" ry="20" fill="#fef9c3" />

      {/* Eyes */}
      <ellipse cx="64" cy="70" rx="5.5" ry="7" fill="#1e1b4b" />
      <circle cx="62" cy="67.5" r="2" fill="#ffffff" />
      <ellipse cx="96" cy="70" rx="5.5" ry="7" fill="#1e1b4b" />
      <circle cx="94" cy="67.5" r="2" fill="#ffffff" />

      {/* Cute black nose */}
      <ellipse cx="80" cy="83" rx="7.5" ry="5.5" fill="#1e1b4b" />
      <circle cx="78.5" cy="81.5" r="1.5" fill="#ffffff" />

      {/* Smile */}
      <path
        d="M 70 93 Q 80 104 90 93"
        stroke="#1e1b4b"
        strokeWidth="3.2"
        fill="#f43f5e"
        strokeLinecap="round"
      />

      {/* Teal Overalls Body */}
      <path
        d="M 48 116 Q 80 110 112 116 L 122 160 L 38 160 Z"
        fill="#0d9488"
        stroke="#115e59"
        strokeWidth="2.5"
      />
      {/* Overalls straps */}
      <rect x="54" y="114" width="8" height="24" rx="2" fill="#0f766e" />
      <circle cx="58" cy="132" r="2.5" fill="#fef08a" />
      <rect x="98" y="114" width="8" height="24" rx="2" fill="#0f766e" />
      <circle cx="102" cy="132" r="2.5" fill="#fef08a" />
    </svg>
  );
}

/**
 * Reya the Red Panda - wearing teal round glasses
 */
export function ReyaRedPanda({ size = 110, mood = 'happy', className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 160 160"
      className={`reya-character ${className}`}
      aria-label="Reya the Red Panda"
      style={{ overflow: 'visible' }}
    >
      {/* Big Fluffy Ears with white lining */}
      <ellipse cx="36" cy="40" rx="20" ry="24" fill="#c2410c" transform="rotate(-15 36 40)" />
      <ellipse cx="38" cy="42" rx="11" ry="14" fill="#ffedd5" transform="rotate(-15 38 42)" />
      <ellipse cx="124" cy="40" rx="20" ry="24" fill="#c2410c" transform="rotate(15 124 40)" />
      <ellipse cx="122" cy="42" rx="11" ry="14" fill="#ffedd5" transform="rotate(15 122 42)" />

      {/* Head */}
      <circle cx="80" cy="76" r="44" fill="#ea580c" />

      {/* White cheek patches */}
      <ellipse cx="50" cy="85" rx="14" ry="16" fill="#fff7ed" />
      <ellipse cx="110" cy="85" rx="14" ry="16" fill="#fff7ed" />

      {/* Snout */}
      <ellipse cx="80" cy="88" rx="20" ry="15" fill="#ffedd5" />
      <ellipse cx="80" cy="82" rx="6" ry="4.5" fill="#1e1b4b" />

      {/* Cute Glasses (Iconic for Reya) */}
      <circle cx="62" cy="70" r="14" fill="none" stroke="#0284c7" strokeWidth="4" />
      <circle cx="98" cy="70" r="14" fill="none" stroke="#0284c7" strokeWidth="4" />
      <line x1="76" y1="70" x2="84" y2="70" stroke="#0284c7" strokeWidth="4" strokeLinecap="round" />

      {/* Eyes behind glasses */}
      <circle cx="62" cy="70" r="5" fill="#1e1b4b" />
      <circle cx="60.5" cy="68.5" r="1.8" fill="#ffffff" />
      <circle cx="98" cy="70" r="5" fill="#1e1b4b" />
      <circle cx="96.5" cy="68.5" r="1.8" fill="#ffffff" />

      {/* Mouth */}
      <path d="M 72 94 Q 80 102 88 94" stroke="#1e1b4b" strokeWidth="3" fill="none" strokeLinecap="round" />

      {/* Cozy Teal Sweater Body */}
      <path
        d="M 50 118 Q 80 112 110 118 L 120 160 L 40 160 Z"
        fill="#0284c7"
        stroke="#0369a1"
        strokeWidth="2.5"
      />
      {/* Striped collar */}
      <path d="M 68 118 L 80 128 L 92 118" stroke="#38bdf8" strokeWidth="3" fill="none" />
    </svg>
  );
}

/**
 * Peck the Bird - bright blue bird with red crest and yellow beak
 */
export function PeckBird({ size = 100, mood = 'happy', className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 160 160"
      className={`peck-character ${className}`}
      aria-label="Peck the Bird"
      style={{ overflow: 'visible' }}
    >
      {/* Red Feathers Crest */}
      <path d="M 75 36 Q 70 12 82 16 Q 88 28 85 36" fill="#ef4444" />
      <path d="M 85 36 Q 92 14 100 20 Q 98 32 90 38" fill="#f97316" />

      {/* Body / Head (Round blue bird) */}
      <circle cx="80" cy="76" r="42" fill="#3b82f6" />
      <ellipse cx="80" cy="94" rx="26" ry="20" fill="#93c5fd" />

      {/* Big expressive eyes */}
      <circle cx="64" cy="66" r="10" fill="#ffffff" stroke="#1e1b4b" strokeWidth="2.5" />
      <circle cx="65" cy="66" r="5" fill="#1e1b4b" />
      <circle cx="63.5" cy="64.5" r="1.8" fill="#ffffff" />

      <circle cx="96" cy="66" r="10" fill="#ffffff" stroke="#1e1b4b" strokeWidth="2.5" />
      <circle cx="95" cy="66" r="5" fill="#1e1b4b" />
      <circle cx="93.5" cy="64.5" r="1.8" fill="#ffffff" />

      {/* Sharp orange/yellow beak */}
      <polygon points="70,76 90,76 80,94" fill="#f97316" stroke="#c2410c" strokeWidth="1.5" />

      {/* Wings */}
      <ellipse cx="40" cy="85" rx="10" ry="18" fill="#2563eb" transform="rotate(20 40 85)" />
      <ellipse cx="120" cy="85" rx="10" ry="18" fill="#2563eb" transform="rotate(-20 120 85)" />

      {/* Purple vest / sneakers */}
      <path d="M 52 116 L 108 116 L 114 150 L 46 150 Z" fill="#8b5cf6" />
    </svg>
  );
}

/**
 * Sandy the Dingo - creative puppy with pink headband
 */
export function SandyDingo({ size = 110, mood = 'happy', className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 160 160"
      className={`sandy-character ${className}`}
      aria-label="Sandy the Dingo"
      style={{ overflow: 'visible' }}
    >
      {/* Ears */}
      <polygon points="35,65 20,22 58,45" fill="#f97316" stroke="#ea580c" strokeWidth="2" />
      <polygon points="36,55 26,32 50,47" fill="#fed7aa" />
      <polygon points="125,65 140,22 102,45" fill="#f97316" stroke="#ea580c" strokeWidth="2" />
      <polygon points="124,55 134,32 110,47" fill="#fed7aa" />

      {/* Pink hair flower / bow */}
      <circle cx="118" cy="40" r="12" fill="#ec4899" />
      <circle cx="118" cy="40" r="4.5" fill="#fde047" />

      {/* Head */}
      <ellipse cx="80" cy="78" rx="44" ry="40" fill="#fb923c" />
      <ellipse cx="80" cy="90" rx="28" ry="20" fill="#ffedd5" />

      {/* Eyes with lashes */}
      <ellipse cx="64" cy="70" rx="5.5" ry="7" fill="#1e1b4b" />
      <circle cx="62" cy="67.5" r="2" fill="#ffffff" />
      <path d="M 58 64 L 54 60 M 64 62 L 64 57" stroke="#1e1b4b" strokeWidth="1.8" strokeLinecap="round" />

      <ellipse cx="96" cy="70" rx="5.5" ry="7" fill="#1e1b4b" />
      <circle cx="94" cy="67.5" r="2" fill="#ffffff" />
      <path d="M 102 64 L 106 60 M 96 62 L 96 57" stroke="#1e1b4b" strokeWidth="1.8" strokeLinecap="round" />

      {/* Nose & Smile */}
      <ellipse cx="80" cy="83" rx="7" ry="5" fill="#1e1b4b" />
      <path d="M 70 93 Q 80 104 90 93" stroke="#1e1b4b" strokeWidth="3" fill="#f43f5e" strokeLinecap="round" />

      {/* Purple shirt */}
      <path d="M 48 116 Q 80 110 112 116 L 122 160 L 38 160 Z" fill="#ec4899" />
    </svg>
  );
}

/**
 * Character Badge / Avatar helper
 */
export function CharacterAvatar({ avatar = 'sarah-avatar', size = 50 }) {
  if (avatar === 'leo-avatar' || avatar === 'ollo') {
    return <OlloDingo size={size} />;
  }
  if (avatar === 'maya-avatar' || avatar === 'reya') {
    return <ReyaRedPanda size={size} />;
  }
  if (avatar === 'peck') {
    return <PeckBird size={size} />;
  }
  if (avatar === 'sandy') {
    return <SandyDingo size={size} />;
  }
  // Default Kodi the Bear
  return <KodiBear size={size} />;
}
