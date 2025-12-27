/**
 * MusicToggle Component
 *
 * Button to toggle ambient background music on/off.
 */

import React from 'react';

// Volume on icon
const VolumeOn = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
    <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
    <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
  </svg>
);

// Volume off icon
const VolumeOff = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
    <line x1="23" y1="9" x2="17" y2="15" />
    <line x1="17" y1="9" x2="23" y2="15" />
  </svg>
);

export default function MusicToggle({ isPlaying, onToggle }) {
  return (
    <button
      className={`music-toggle ${isPlaying ? 'playing' : ''}`}
      onClick={(e) => { e.stopPropagation(); onToggle(); }}
      title={isPlaying ? 'Mute ambient music' : 'Play ambient music'}
      aria-label={isPlaying ? 'Mute ambient music' : 'Play ambient music'}
      aria-pressed={isPlaying}
    >
      {isPlaying ? <VolumeOn /> : <VolumeOff />}
    </button>
  );
}
