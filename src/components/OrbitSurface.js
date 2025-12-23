import React, { useEffect, useState, useRef } from 'react';
import {
  getState,
  subscribe,
  initialize,
  startAutoRecompute,
  stopAutoRecompute,
  addToOrbit,
  markOpened,
  quiet,
  setPlace,
} from '../store/orbitStore.js';
import './OrbitSurface.css';

export default function OrbitSurface() {
  const [state, setState] = useState(getState());
  const [inputValue, setInputValue] = useState('');
  const [inputFocused, setInputFocused] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    const unsub = subscribe(setState);
    initialize();
    startAutoRecompute();
    return () => {
      unsub();
      stopAutoRecompute();
    };
  }, []);

  // Press / to focus input
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === '/' && !inputFocused) {
        e.preventDefault();
        inputRef.current?.focus();
      }
      if (e.key === 'Escape') {
        inputRef.current?.blur();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [inputFocused]);

  const handleAdd = (e) => {
    e.preventDefault();
    if (inputValue.trim()) {
      addToOrbit(inputValue.trim());
      setInputValue('');
    }
  };

  const { visibleItems, context, isLoading } = state;

  if (isLoading) {
    return <div className="surface" />;
  }

  return (
    <div className="surface">
      {/* Context - click to toggle */}
      <div
        className="place"
        onClick={() => setPlace(context?.place === 'work' ? 'home' : 'work')}
      >
        {context?.place === 'work' ? 'work' : 'home'}
      </div>

      {/* Center - pulses slowly */}
      <div className="center" />

      {/* Items drift around center */}
      {visibleItems.map((item, i) => (
        <OrbitItem
          key={item.id}
          item={item}
          index={i}
          total={visibleItems.length}
        />
      ))}

      {/* Empty state */}
      {visibleItems.length === 0 && (
        <div className="empty">press / to add</div>
      )}

      {/* Input */}
      <form className="add" onSubmit={handleAdd}>
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onFocus={() => setInputFocused(true)}
          onBlur={() => setInputFocused(false)}
          placeholder="/"
          spellCheck={false}
        />
      </form>
    </div>
  );
}

function OrbitItem({ item, index, total }) {
  const [hovered, setHovered] = useState(false);

  // Spread items around center, slightly elliptical
  const angle = (index / Math.max(total, 1)) * 360 + (item.id.charCodeAt(0) % 30);

  // Distance from center = inverse of score (higher score = closer)
  const baseDistance = 100 + (1 - item.computed.score) * 80;

  // Slight elliptical variation
  const seed = item.id.charCodeAt(0);
  const ellipseRatio = 0.85 + (seed % 30) / 100;

  // Opacity = relevance
  const opacity = 0.35 + item.computed.score * 0.65;

  // Click = acknowledge
  const handleClick = () => {
    markOpened(item.id);
  };

  // Double-click = quiet for now
  const handleDoubleClick = () => {
    quiet(item.id, 4);
  };

  return (
    <div
      className={`item ${item.signals.isPinned ? 'pinned' : ''}`}
      style={{
        '--angle': `${angle}deg`,
        '--distance': `${baseDistance}px`,
        '--ellipse': ellipseRatio,
        '--opacity': opacity,
        '--delay': `${-(seed % 60)}s`,
      }}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="dot" />
      {hovered && <div className="label">{item.title}</div>}
    </div>
  );
}
