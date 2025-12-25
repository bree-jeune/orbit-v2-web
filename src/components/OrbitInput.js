/**
 * OrbitInput Component
 *
 * Input form for adding new items to orbit,
 * with toast notifications for feedback.
 */

import React, { useState, useRef, useEffect } from 'react';
import { ITEM_DEFAULTS, ANIMATION } from '../config/constants';
import { aiService } from '../services/aiService';
import './OrbitInput.css';

// Sanitize input to prevent storage abuse
function sanitizeInput(value) {
  return value
    .trim()
    .slice(0, ITEM_DEFAULTS.MAX_TITLE_LENGTH)
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, ''); // Remove control chars
}

export default function OrbitInput({ totalItems, onAdd }) {
  const [inputValue, setInputValue] = useState('');
  const [inputFocused, setInputFocused] = useState(false);
  const [toast, setToast] = useState(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [apiKey, setApiKey] = useState(localStorage.getItem('orbit_ai_key') || process.env.GEMINI_API_KEY || '');

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

      // Use the parsed result
      // For now, we just use the clean title and maybe details
      // In a real implementation, we'd pass the full metadata to onAdd
      // But we need to update safeAdd first to accept objects.

      // Temporary: Append detail to title if present to show it worked
      let finalTitle = result.title;
      if (result.suggestedTime !== undefined) {
        // Hacky way to simulate context for now
        console.log(`AIContext: Time=${result.suggestedTime}, Context=${result.suggestedContext}`);
      }

      onAdd(finalTitle, result.detail);
      setInputValue('');
      showToast(`✨ Magic added: ${result.title}`);
    } catch (err) {
      showToast('❌ AI Failed: Check API Key');
      // If auth error, maybe prompt key again
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
      showToast('Added to orbit (in background)');
    } else {
      showToast('Added');
    }
  };

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(null), ANIMATION.TOAST_DURATION);
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
            placeholder={isAiLoading ? "Processing..." : "/ add item (Cmd+Enter for AI)"}
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
            >
              ✨
            </button>
          )}
        </form>
      </div>

      {toast && <div className="toast">{toast}</div>}

      {showApiKeyModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Enter Gemini API Key</h3>
            <p>To use AI features, you need a Google Gemini API key.</p>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="AIzaSy..."
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

// Export a hook for parent components that need toast functionality
export function useToast() {
  const [toast, setToast] = useState(null);

  const showToast = (message, duration = ANIMATION.TOAST_DURATION) => {
    setToast(message);
    setTimeout(() => setToast(null), duration);
  };

  return { toast, showToast };
}
