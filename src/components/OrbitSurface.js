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
  pin,
  unpin,
  remove,
  setPlace,
} from '../store/orbitStore.js';
import { useAudio } from '../hooks/useAudio.js';
import './OrbitSurface.css';

export default function OrbitSurface() {
  const [state, setState] = useState(getState());
  const [inputValue, setInputValue] = useState('');
  const [inputFocused, setInputFocused] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const [toast, setToast] = useState(null);
  const inputRef = useRef(null);
  const { playHover, playClick, toggleMusic, isMusicPlaying } = useAudio();

  useEffect(() => {
    const unsub = subscribe(setState);
    initialize();
    startAutoRecompute();
    return () => {
      unsub();
      stopAutoRecompute();
    };
  }, []);

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === '/' && !inputFocused) {
        e.preventDefault();
        inputRef.current?.focus();
      }
      if (e.key === 'Escape') {
        setExpandedId(null);
        inputRef.current?.blur();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [inputFocused]);

  const handleAdd = (e) => {
    e.preventDefault();
    if (inputValue.trim()) {
      const totalBefore = state.items.length;
      addToOrbit(inputValue.trim());
      setInputValue('');

      // Show toast if item will be outside visible set
      if (totalBefore >= 5) {
        setToast('Added to orbit (in background)');
        setTimeout(() => setToast(null), 2000);
      } else {
        setToast('Added');
        setTimeout(() => setToast(null), 1500);
      }
    }
  };

  const handlePlaceToggle = () => {
    const newPlace = state.context?.place === 'work' ? 'home' : 'work';
    setPlace(newPlace);
  };

  const { visibleItems, items, context, isLoading } = state;

  if (isLoading) {
    return <div className="surface"><div className="center" /></div>;
  }

  return (
    <div className="surface" onClick={() => setExpandedId(null)}>
      {/* Branding */}
      <div className="brand">
        <div className="brand-icon" />
        <span>orbit</span>
      </div>

      {/* Context toggle */}
      <div className="place" onClick={(e) => { e.stopPropagation(); handlePlaceToggle(); }}>
        {context?.place === 'work' ? 'work' : 'home'}
      </div>

      {/* Item count indicator */}
      <div className="count">
        {visibleItems.length} of {items.length}
      </div>

      {/* Music toggle */}
      <button
        className={`music-toggle ${isMusicPlaying ? 'playing' : ''}`}
        onClick={(e) => { e.stopPropagation(); toggleMusic(); }}
        title={isMusicPlaying ? 'Mute ambient music' : 'Play ambient music'}
      >
        {isMusicPlaying ? (
          <svg viewBox="0 0 24 24" fill="currentColor"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg>
        ) : (
          <svg viewBox="0 0 24 24" fill="currentColor"><path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/></svg>
        )}
      </button>

      {/* Center - bigger, pulses */}
      <div className="center" />

      {/* Orbiting items */}
      {visibleItems.map((item, i) => (
        <OrbitItem
          key={item.id}
          item={item}
          index={i}
          total={visibleItems.length}
          isExpanded={expandedId === item.id}
          onExpand={(e) => {
            e.stopPropagation();
            setExpandedId(expandedId === item.id ? null : item.id);
          }}
          onAcknowledge={() => {
            markOpened(item.id);
            setExpandedId(null);
          }}
          onQuiet={() => {
            quiet(item.id, 4);
            setExpandedId(null);
            setToast('Quieted for 4 hours');
            setTimeout(() => setToast(null), 1500);
          }}
          onPin={() => {
            item.signals.isPinned ? unpin(item.id) : pin(item.id);
          }}
          onRemove={() => {
            remove(item.id);
            setExpandedId(null);
          }}
          onHover={playHover}
          onClick={playClick}
        />
      ))}

      {/* Empty state */}
      {visibleItems.length === 0 && (
        <div className="empty">press / to add</div>
      )}

      {/* Input */}
      <form className="add" onSubmit={handleAdd} onClick={(e) => e.stopPropagation()}>
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

      {/* Toast notification */}
      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}

function OrbitItem({
  item,
  index,
  total,
  isExpanded,
  onExpand,
  onAcknowledge,
  onQuiet,
  onPin,
  onRemove,
  onHover,
  onClick,
}) {
  const [hovered, setHovered] = useState(false);

  // Spread items around center - bigger radius
  const angle = (index / Math.max(total, 1)) * 360 + (item.id.charCodeAt(0) % 20);

  // Distance from center - BIGGER orbits
  // Higher score = closer, but minimum distance increased
  const baseDistance = 140 + (1 - item.computed.score) * 100;

  // Opacity = relevance
  const opacity = 0.4 + item.computed.score * 0.6;

  // Age-based growth: items grow over time (max after 7 days)
  const createdAt = new Date(item.signals.createdAt).getTime();
  const now = Date.now();
  const ageHours = (now - createdAt) / (1000 * 60 * 60);
  const ageDays = ageHours / 24;

  // Dot grows from 16px to 24px over 7 days
  const dotSize = Math.min(24, 16 + (ageDays / 7) * 8);

  // Rings appear after 2 days, grow more visible over time
  const ringAge = Math.max(0, ageDays - 2);
  const ringSize = Math.min(50, ringAge * 8);
  const ringOpacity = Math.min(0.6, ringAge * 0.1);

  const handleMouseEnter = () => {
    setHovered(true);
    onHover?.();
  };

  const handleClick = (e) => {
    onClick?.();
    onExpand(e);
  };

  return (
    <div
      className={`item ${hovered ? 'hovered' : ''} ${isExpanded ? 'expanded' : ''} ${item.signals.isPinned ? 'pinned' : ''}`}
      style={{
        '--angle': `${angle}deg`,
        '--distance': `${baseDistance}px`,
        '--opacity': opacity,
        '--delay': `${-(item.id.charCodeAt(0) % 80)}s`,
        '--dot-size': `${dotSize}px`,
        '--ring-size': `${ringSize}px`,
        '--ring-opacity': ringOpacity,
      }}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="dot" />

      {/* Label - shows on hover */}
      <div className={`label ${hovered || isExpanded ? 'visible' : ''}`}>
        {item.title}
      </div>

      {/* Action buttons - show when expanded */}
      {isExpanded && (
        <div className="actions">
          <button onClick={(e) => { e.stopPropagation(); onAcknowledge(); }} title="Got it">
            <svg viewBox="0 0 16 16" fill="currentColor"><path d="M13.78 4.22a.75.75 0 010 1.06l-7.25 7.25a.75.75 0 01-1.06 0L2.22 9.28a.75.75 0 011.06-1.06L6 10.94l6.72-6.72a.75.75 0 011.06 0z"/></svg>
          </button>
          <button onClick={(e) => { e.stopPropagation(); onQuiet(); }} title="Later">
            <svg viewBox="0 0 16 16" fill="currentColor"><path d="M8 0a8 8 0 100 16A8 8 0 008 0zM1.5 8a6.5 6.5 0 1113 0 6.5 6.5 0 01-13 0zm7-3.25v2.992l2.028.812a.75.75 0 01-.557 1.392l-2.5-1A.75.75 0 017 8.25v-3.5a.75.75 0 011.5 0z"/></svg>
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onPin(); }}
            title={item.signals.isPinned ? 'Unpin' : 'Pin'}
            className={item.signals.isPinned ? 'active' : ''}
          >
            <svg viewBox="0 0 16 16" fill="currentColor"><path d="M4.456.734a1.75 1.75 0 012.826.504l.613 1.327a3.08 3.08 0 002.084 1.707l2.454.584c1.332.317 1.8 1.972.832 2.94L11.06 10l3.72 3.72a.75.75 0 11-1.06 1.06L10 11.06l-2.204 2.205c-.968.968-2.623.5-2.94-.832l-.584-2.454a3.08 3.08 0 00-1.707-2.084l-1.327-.613a1.75 1.75 0 01-.504-2.826L4.456.734z"/></svg>
          </button>
          <button onClick={(e) => { e.stopPropagation(); onRemove(); }} title="Remove" className="danger">
            <svg viewBox="0 0 16 16" fill="currentColor"><path d="M3.72 3.72a.75.75 0 011.06 0L8 6.94l3.22-3.22a.75.75 0 111.06 1.06L9.06 8l3.22 3.22a.75.75 0 11-1.06 1.06L8 9.06l-3.22 3.22a.75.75 0 01-1.06-1.06L6.94 8 3.72 4.78a.75.75 0 010-1.06z"/></svg>
          </button>
        </div>
      )}
    </div>
  );
}
