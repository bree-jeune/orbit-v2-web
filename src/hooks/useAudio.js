/**
 * Audio Hook for Orbit
 *
 * Handles hover sounds, click sounds, and background music.
 * Music starts muted by preference and can be toggled.
 */

import { useRef, useCallback, useEffect, useState } from 'react';

// Sound file paths
const SOUNDS = {
  hover: '/sounds/envato_sfxgen_Dec_23_2025_9_59_33.mp3',
  click: '/sounds/envato_sfxgen_Dec_23_2025_10_01_03.mp3',
  ambient: '/sounds/Space Ambience.mp3',
};

/**
 * Audio manager hook
 * @returns {{ playHover, playClick, toggleMusic, isMusicPlaying }}
 */
export function useAudio() {
  const hoverRef = useRef(null);
  const clickRef = useRef(null);
  const ambientRef = useRef(null);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);

  // Initialize audio elements
  useEffect(() => {
    // Hover sound - quiet, subtle
    hoverRef.current = new Audio(SOUNDS.hover);
    hoverRef.current.volume = 0.15;
    hoverRef.current.preload = 'auto';

    // Click sound - slightly louder
    clickRef.current = new Audio(SOUNDS.click);
    clickRef.current.volume = 0.25;
    clickRef.current.preload = 'auto';

    // Ambient music - low volume, loops
    ambientRef.current = new Audio(SOUNDS.ambient);
    ambientRef.current.volume = 0.1;
    ambientRef.current.loop = true;
    ambientRef.current.preload = 'auto';

    // Check saved preference
    const musicPref = localStorage.getItem('orbit_music');
    if (musicPref === 'on') {
      ambientRef.current.play().catch(() => {});
      setIsMusicPlaying(true);
    }

    return () => {
      hoverRef.current?.pause();
      clickRef.current?.pause();
      ambientRef.current?.pause();
    };
  }, []);

  const playHover = useCallback(() => {
    if (hoverRef.current) {
      hoverRef.current.currentTime = 0;
      hoverRef.current.play().catch(() => {});
    }
  }, []);

  const playClick = useCallback(() => {
    if (clickRef.current) {
      clickRef.current.currentTime = 0;
      clickRef.current.play().catch(() => {});
    }
  }, []);

  const toggleMusic = useCallback(() => {
    if (!ambientRef.current) return;

    if (isMusicPlaying) {
      ambientRef.current.pause();
      localStorage.setItem('orbit_music', 'off');
      setIsMusicPlaying(false);
    } else {
      ambientRef.current.play().catch(() => {});
      localStorage.setItem('orbit_music', 'on');
      setIsMusicPlaying(true);
    }
  }, [isMusicPlaying]);

  return {
    playHover,
    playClick,
    toggleMusic,
    isMusicPlaying,
  };
}
