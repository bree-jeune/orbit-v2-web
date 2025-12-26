/**
 * OrbitInput Component
 *
 * Input form for adding new items to orbit,
 * with toast notifications for feedback.
 */

import React, { useState, useRef, useEffect } from 'react';
import { ITEM_DEFAULTS, ANIMATION } from '../config/constants';
import { aiService, AI_CONFIG } from '../services/aiService';
import './OrbitInput.css';

// Sanitize input to prevent storage abuse
function sanitizeInput(value) {
  return value
    .trim()
    .slice(0, ITEM_DEFAULTS.MAX_TITLE_LENGTH)
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, ''); // Remove control chars
}

export default function OrbitInput({ totalItems, onAdd, showToast }) {
  const [inputValue, setInputValue] = useState('');
  const [inputFocused, setInputFocused] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [apiKey, setApiKey] = useState(() => {
    const envKey = process.env.GEMINI_API_KEY;
    const localKey = localStorage.getItem('orbit_ai_key');
    const finalKey = (envKey && envKey !== 'undefined') ? envKey : (localKey && localKey !== 'undefined') ? localKey : AI_CONFIG.DEFAULT_KEY;

    console.log('[AI] Key loaded from:', envKey ? 'Environment' : localKey ? 'LocalStorage' : 'Default Fallback');
    return finalKey || '';
  });

  const inputRef = useRef(null);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === '/' && !inputFocused) {
        e.preventDefault();
        inputRef.current?.focus();
      }
      if (e.key === 'Escape') {
        inputRef.current?.blur();
        setShowApiKeyModal(false);
      }
      // Magic Shortcut: Cmd+Enter to Trigger AI
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter' && inputFocused) {
        e.preventDefault();
        handleAiSubmit();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [inputFocused, inputValue]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const value = sanitizeInput(inputValue);
    if (!value) return;

    // Prevent storage abuse
    if (totalItems >= ITEM_DEFAULTS.MAX_ITEMS) {
      showToast('Orbit is full - remove some items');
      return;
    }

    onAdd(value);
    setInputValue('');
    showSuccessToast(totalItems);
  };

  const handleAiSubmit = async () => {
    const value = sanitizeInput(inputValue);
    if (!value) return;

    if (!apiKey) {
      setShowApiKeyModal(true);
      return;
    }

    setIsAiLoading(true);
    try {
      const result = await aiService.parseInput(value, apiKey);
      onAdd(result.title, result.detail);
      setInputValue('');
      showToast(`✨ Magic added: ${result.title}`);
    } catch (err) {
      showToast('❌ AI Failed: Check API Key');
      if (err.message.includes('400') || err.message.includes('403')) {
        setShowApiKeyModal(true);
      }
    } finally {
      setIsAiLoading(false);
    }
  };

  const saveApiKey = () => {
    if (apiKey.trim()) {
      localStorage.setItem('orbit_ai_key', apiKey.trim());
      setShowApiKeyModal(false);
      showToast('API Key Saved');
    }
  };

  const showSuccessToast = (count) => {
    if (count >= ITEM_DEFAULTS.MAX_VISIBLE) {
      showToast('Added to orbit');
    } else {
      showToast('Added');
    }
  };

  return (
    <>
      <div className={`input-container ${isAiLoading ? 'loading' : ''}`}>
        <form className="add" onSubmit={handleSubmit} onClick={(e) => e.stopPropagation()}>
          <input
            ref={inputRef}
            type="text"
            id="orbit-input"
            name="orbit-input"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onFocus={() => setInputFocused(true)}
            onBlur={() => setInputFocused(false)}
            placeholder={isAiLoading ? "Processing..." : "what's on your mind? (type / to add)"}
            spellCheck={false}
            maxLength={ITEM_DEFAULTS.MAX_TITLE_LENGTH}
            autoComplete="off"
            disabled={isAiLoading}
          />
          {inputValue && (
            <button
              type="button"
              className="ai-trigger"
              onClick={handleAiSubmit}
              title="Use AI (Cmd+Enter)"
              aria-label="Process with AI"
            >
              ✨
            </button>
          )}
        </form>
      </div>

      {showApiKeyModal && (
        <div className="modal-overlay" onClick={() => setShowApiKeyModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Enter Gemini API Key</h3>
            <p>To use AI features, you need a Google Gemini API key. This will be stored locally in your browser.</p>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="AIzaSy..."
              autoFocus
            />
            <div className="modal-actions">
              <button onClick={() => setShowApiKeyModal(false)}>Cancel</button>
              <button className="primary" onClick={saveApiKey}>Save Key</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
