/**
 * ui/FeedbackDisplay.js
 * ─────────────────────────────────────────────
 * Handles all real-time visual feedback for user input.
 * Subscribes to AppState.validation and AppState.input.
 * Never calls Validator or business logic directly.
 */

import AppState from '../state/AppState.js';
import { qs, setHTML, setText, addClass, removeClass, flashClass } from '../utils/dom.js';

const FeedbackDisplay = {

  _els: {},

  /**
   * Initialize DOM refs and subscribe to state.
   */
  init() {
    this._els = {
      charFeedback:   qs('#char-feedback'),
      input:          qs('#exercise-input'),
      inputStatus:    qs('#input-status'),
      targetHangul:   qs('#target-hangul'),
      btnNext:        qs('#btn-next'),
    };

    AppState.subscribe('validation', (v) => this._renderValidation(v));
    AppState.subscribe('currentExercise', () => this._resetFeedback());
  },

  // ── Private ──────────────────────────────────

  /**
   * Main feedback renderer — called on every validation state change.
   * @param {object} validation
   */
  _renderValidation(validation) {
    const mode = AppState.get('currentMode');
    const el   = this._els;

    // Update input border color
    this._updateInputClass(validation.status);

    // Update status text below input
    this._updateStatusText(validation);

    // Character-level feedback (words/sentences only)
    if (mode !== 'letters') {
      this._renderCharTokens(validation.characterResults);
    }

    // Enable/disable Next button
    if (el.btnNext) {
      el.btnNext.disabled = !validation.isComplete;
    }

    // Flash target on completion or error
    if (validation.isComplete) {
      flashClass(el.targetHangul, 'correct-flash', 600);
      flashClass(el.input,        'success-pulse',  400);
    }
  },

  /**
   * Render character-by-character tokens for words/sentences mode.
   * @param {Array} characterResults
   */
  _renderCharTokens(characterResults) {
    const el = this._els;
    if (!el.charFeedback) return;

    if (!characterResults.length) {
      el.charFeedback.innerHTML = '';
      return;
    }

    const target = AppState.get('currentExercise')?.target ?? '';

    const html = [...target].map((char, i) => {
      const result = characterResults[i];
      const status = result?.status ?? 'pending';
      const isSpace = char === ' ';
      const cls = `char-token ${status}${isSpace ? ' space' : ''}`;
      // Show underscore for space so position is visible
      const display = isSpace ? '␣' : char;
      return `<span class="${cls}" data-index="${i}">${display}</span>`;
    }).join('');

    setHTML(el.charFeedback, html);
  },

  /**
   * Update input element border class based on validation status.
   * @param {string} status
   */
  _updateInputClass(status) {
    const el = this._els.input;
    if (!el) return;

    removeClass(el, 'input-correct', 'input-error');

    if (status === 'complete') addClass(el, 'input-correct');
    else if (status === 'error') addClass(el, 'input-error');
  },

  /**
   * Update the small status text below the input.
   * @param {object} validation
   */
  _updateStatusText(validation) {
    const el = this._els.inputStatus;
    if (!el) return;

    const messages = {
      idle:     '',
      partial:  '…',
      error:    `${validation.errorPositions.length} error${validation.errorPositions.length !== 1 ? 's' : ''}`,
      complete: '✓ correct',
    };

    setText(el, messages[validation.status] ?? '');
    el.style.color = validation.status === 'complete'
      ? 'var(--correct)'
      : validation.status === 'error'
        ? 'var(--error)'
        : 'var(--text-3)';
  },

  /**
   * Clear all feedback state (called when exercise changes).
   */
  _resetFeedback() {
    const el = this._els;
    if (el.charFeedback) el.charFeedback.innerHTML = '';
    if (el.inputStatus)  setText(el.inputStatus, '');
    if (el.input) {
      removeClass(el.input, 'input-correct', 'input-error');
      el.input.value = '';
      el.input.focus();
    }
    if (el.btnNext) el.btnNext.disabled = true;
  },
};

export default FeedbackDisplay;
