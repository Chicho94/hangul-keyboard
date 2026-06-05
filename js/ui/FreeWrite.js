/**
 * ui/FreeWrite.js
 * ─────────────────────────────────────────────
 * Free writing screen — minimal, self-contained.
 *
 * Layout: back button → textarea → (optional target bar) → virtual keyboard
 *
 * Two IME buffers:
 *   _writeKeys  — main textarea
 *   _targetKeys — optional target input
 */

import Hangul          from '../utils/hangul.js';
import Validator       from '../logic/Validator.js';
import VirtualKeyboard from './VirtualKeyboard.js';
import { qs, setText, setHTML } from '../utils/dom.js';

let _writeKeys   = '';
let _targetKeys  = '';
let _targetValue = '';   // compiled hangul target
let _active      = false;
let _targetFocused = false;

const FreeWrite = {

  init() {
    this._bindTextarea();
    this._bindTargetInput();
    this._bindButtons();
  },

  onEnter() {
    _active = true;
    _writeKeys = '';
    _targetFocused = false;
    const ta = qs('#fw-textarea');
    if (ta) ta.value = '';
    // Double rAF ensures screen transition (display:flex + .active class) is complete
    requestAnimationFrame(() => requestAnimationFrame(() => ta?.focus()));
  },

  onLeave() {
    _active = false;
  },

  // ── Main textarea ─────────────────────────────

  _bindTextarea() {
    const ta = qs('#fw-textarea');
    if (!ta) return;

    ta.addEventListener('focus', () => { _targetFocused = false; });

    ta.addEventListener('keydown', (e) => {
      if (!_active || _targetFocused) return;
      if (e.ctrlKey || e.altKey || e.metaKey) return;

      if (e.key === 'Backspace') {
        e.preventDefault();
        VirtualKeyboard.highlightKey('Backspace');
        _writeKeys = _writeKeys.slice(0, -1);
        this._processWriteIME(ta);
        return;
      }
      if (e.key === 'Enter') {
        e.preventDefault();
        VirtualKeyboard.highlightKey('Enter');
        _writeKeys += '\n';
        this._processWriteIME(ta);
        return;
      }
      if (e.key === ' ') {
        e.preventDefault();
        VirtualKeyboard.highlightKey(' ');
        _writeKeys += ' ';
        this._processWriteIME(ta);
        return;
      }
      if (e.key.length === 1) {
        e.preventDefault();
        VirtualKeyboard.highlightKey(e.key);
        _writeKeys += e.key;
        this._processWriteIME(ta);
      }
    });
  },

  _processWriteIME(ta) {
    const hangul = Hangul.ime.convert(_writeKeys);
    ta.value = hangul;
    ta.selectionStart = ta.selectionEnd = hangul.length;
    if (_targetValue) this._updateMatchFeedback(hangul, _targetValue);
  },

  // ── Target input ──────────────────────────────

  _bindTargetInput() {
    const input = qs('#fw-target-input');
    if (!input) return;

    input.addEventListener('focus', () => { _targetFocused = true; });
    input.addEventListener('blur',  () => { _targetFocused = false; });

    input.addEventListener('keydown', (e) => {
      if (!_active) return;
      if (e.ctrlKey || e.altKey || e.metaKey) return;

      if (e.key === 'Enter') {
        e.preventDefault();
        this._confirmTarget();
        qs('#fw-textarea')?.focus();
        return;
      }
      if (e.key === 'Escape') {
        e.preventDefault();
        qs('#fw-textarea')?.focus();
        return;
      }
      if (e.key === 'Backspace') {
        e.preventDefault();
        VirtualKeyboard.highlightKey('Backspace');
        _targetKeys = _targetKeys.slice(0, -1);
        this._processTargetIME(input);
        return;
      }
      if (e.key === ' ') {
        e.preventDefault();
        VirtualKeyboard.highlightKey(' ');
        _targetKeys += ' ';
        this._processTargetIME(input);
        return;
      }
      if (e.key.length === 1) {
        e.preventDefault();
        VirtualKeyboard.highlightKey(e.key);
        _targetKeys += e.key;
        this._processTargetIME(input);
      }
    });
  },

  _processTargetIME(input) {
    const hangul = Hangul.ime.convert(_targetKeys);
    input.value = hangul;
    _targetValue = hangul;
    const written = qs('#fw-textarea')?.value ?? '';
    if (hangul) this._updateMatchFeedback(written, hangul);
    else        setHTML(qs('#fw-char-feedback'), '');
  },

  _confirmTarget() {
    const hangul = Hangul.ime.convert(_targetKeys);
    if (!hangul.trim()) { this._clearTarget(); return; }
    _targetValue = hangul;
    const written = qs('#fw-textarea')?.value ?? '';
    this._updateMatchFeedback(written, hangul);
  },

  _clearTarget() {
    _targetValue = '';
    _targetKeys  = '';
    const input = qs('#fw-target-input');
    if (input) input.value = '';
    setHTML(qs('#fw-char-feedback'), '');
    setText(qs('#fw-match-status'), '');
  },

  // ── Match feedback ────────────────────────────

  _updateMatchFeedback(written, target) {
    if (!target) return;
    const validation = Validator.validate(written, target, 'sentences');

    // Char tokens
    const html = [...target].map((char, i) => {
      const result = validation.characterResults[i];
      const status = result?.status ?? 'pending';
      const isSpace = char === ' ';
      return `<span class="fw-char-token ${status}${isSpace ? ' space' : ''}">${isSpace ? '␣' : char}</span>`;
    }).join('');
    setHTML(qs('#fw-char-feedback'), html);

    // Status text
    const statusEl = qs('#fw-match-status');
    if (statusEl) {
      if (validation.isComplete) {
        statusEl.textContent = '✓ Perfect match!';
        statusEl.className = 'fw-match-status status-complete';
      } else if (validation.status === 'error') {
        statusEl.textContent = `${validation.errorPositions.length} error${validation.errorPositions.length !== 1 ? 's' : ''}`;
        statusEl.className = 'fw-match-status status-error';
      } else if (validation.status === 'partial') {
        statusEl.textContent = 'Keep going…';
        statusEl.className = 'fw-match-status status-partial';
      } else {
        statusEl.textContent = '';
        statusEl.className = 'fw-match-status';
      }
    }
  },

  // ── Buttons ───────────────────────────────────

  _bindButtons() {
    // Prevent virtual keyboard clicks from stealing focus from textarea
    qs('#fw-virtual-keyboard')?.addEventListener('mousedown', (e) => {
      e.preventDefault();
    });

    // Back
    qs('#fw-btn-back')?.addEventListener('click', () => {
      import('./Router.js').then(({ default: Router }) => {
        this.onLeave();
        Router.navigateTo('menu');
      });
    });

    // Toggle target bar
    qs('#fw-btn-toggle-target')?.addEventListener('click', () => {
      const area = qs('#fw-target-area');
      const btn  = qs('#fw-btn-toggle-target');
      const isOpen = !area.hidden;
      if (isOpen) {
        area.hidden = true;
        btn.textContent = '＋ Set target';
        this._clearTarget();
      } else {
        area.hidden = false;
        btn.textContent = '− Remove target';
        requestAnimationFrame(() => qs('#fw-target-input')?.focus());
      }
    });

    // Clear target X button
    qs('#fw-btn-clear-target')?.addEventListener('click', () => {
      this._clearTarget();
      qs('#fw-target-input')?.focus();
    });

    // Toggle keyboard
    qs('#fw-btn-toggle-kb')?.addEventListener('click', () => {
      VirtualKeyboard.toggle();
    });
  },
};

export default FreeWrite;