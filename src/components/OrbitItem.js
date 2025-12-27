/**
 * OrbitItem Component
 *
 * Individual orbiting item with age-based growth,
 * hover effects, and action buttons.
 */

import React, { useState } from 'react';
import {
  PLANET_SIZES,
  ORBIT_RADII,
  DEBRIS_RINGS,
} from '../config/constants';

export default function OrbitItem({
  item,
  index,
  total,
  isExpanded,
  onExpand,
  onAcknowledge,
  onDone,
  onQuiet,
  onPin,
  onRemove,
  onHover,
  onClick,
}) {
  const [hovered, setHovered] = useState(false);

  // Spread items around center
  const angle = (index / Math.max(total, 1)) * 360 + (item.id.charCodeAt(0) % 20);

  // Distance from center - higher score = closer
  const baseDistance =
    ORBIT_RADII.MIN_DISTANCE + (1 - item.computed.score) * ORBIT_RADII.DISTANCE_RANGE;

  // Opacity = relevance
  const opacity = 0.4 + item.computed.score * 0.6;

  // Age-based growth: items grow over time
  const createdAt = new Date(item.signals.createdAt).getTime();
  const now = Date.now();
  const ageDays = (now - createdAt) / (1000 * 60 * 60 * 24);

  // Dot grows from min to max over growth period
  const growthProgress = Math.min(1, ageDays / PLANET_SIZES.DOT_GROWTH_DAYS);
  const dotSize =
    PLANET_SIZES.DOT_MIN +
    growthProgress * (PLANET_SIZES.DOT_MAX - PLANET_SIZES.DOT_MIN);

  // Rings appear after threshold, grow more visible over time
  const ringAge = Math.max(0, ageDays - DEBRIS_RINGS.APPEAR_AFTER_DAYS);
  const ringSize = Math.min(DEBRIS_RINGS.MAX_SIZE, ringAge * DEBRIS_RINGS.GROWTH_RATE);
  const ringOpacity = Math.min(DEBRIS_RINGS.MAX_OPACITY, ringAge * DEBRIS_RINGS.OPACITY_RATE);

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
      role="button"
      tabIndex={0}
      aria-label={`${item.title}, ${item.signals.isPinned ? 'pinned' : ''}`}
      aria-expanded={isExpanded}
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
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick(e);
        }
      }}
    >
      <div className="dot" />

      {/* Label - shows on hover or expansion */}
      <div className={`label ${hovered || isExpanded ? 'visible' : ''}`}>
        <div className="label-title">{item.title}</div>
        {item.computed?.reasons?.length > 0 && (
          <div className="label-reason">
            {item.computed.reasons[0]}
          </div>
        )}
      </div>

      {/* Action buttons - show when expanded */}
      <div className="actions">
        <button onClick={(e) => { e.stopPropagation(); onDone?.(); }} title="Done" className="done" aria-label="Mark as done">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </button>
        <button onClick={(e) => { e.stopPropagation(); onQuiet(); }} title="Later" aria-label="Remind me later">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onPin(); }}
          title={item.signals.isPinned ? 'Unpin' : 'Pin'}
          className={item.signals.isPinned ? 'active' : ''}
          aria-label={item.signals.isPinned ? 'Unpin item' : 'Pin item'}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" x2="12" y1="17" y2="22" />
            <path d="M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.79-.9A.5.5 0 0 1 16 12.1V8a4 4 0 0 0-4-4 4 4 0 0 0-4 4v4.1a.5.5 0 0 1-.1.31l-1.79.9A2 2 0 0 0 5 15.24Z" />
          </svg>
        </button>
        <button onClick={(e) => { e.stopPropagation(); onRemove(); }} title="Remove" className="danger" aria-label="Remove item">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}
