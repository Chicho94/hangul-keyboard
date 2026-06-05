/**
 * ui/VirtualKeyboard.js
 * ─────────────────────────────────────────────
 * Renders a 2-beolsik Korean virtual keyboard.
 * Highlights the physical key pressed and shows
 * its Hangul character.
 *
 * Responsibilities:
 *   - Build keyboard DOM once on init()
 *   - highlightKey(key) → illuminate a key briefly
 *   - toggle() / show() / hide() → visibility control
 *
 * No business logic. No AppState writes.
 */

import { qs } from '../utils/dom.js';

// ── Layout definition ─────────────────────────
// Each key: { q: QWERTY char, kr: Hangul jamo, shift?: shifted Hangul }
// Rows match a standard QWERTY physical layout.

const ROWS = [
  // Row 1 — number row (no Hangul mapping, shown as-is)
  [
    { q: '`' }, { q: '1' }, { q: '2' }, { q: '3' }, { q: '4' },
    { q: '5' }, { q: '6' }, { q: '7' }, { q: '8' }, { q: '9' },
    { q: '0' }, { q: '-' }, { q: '=' }, { q: 'Backspace', label: '⌫', wide: 'backspace' },
  ],
  // Row 2 — QWERTY row
  [
    { q: 'Tab', label: 'Tab', wide: 'tab' },
    { q: 'q', kr: 'ㅂ', shift: 'ㅃ' },
    { q: 'w', kr: 'ㅈ', shift: 'ㅉ' },
    { q: 'e', kr: 'ㄷ', shift: 'ㄸ' },
    { q: 'r', kr: 'ㄱ', shift: 'ㄲ' },
    { q: 't', kr: 'ㅅ', shift: 'ㅆ' },
    { q: 'y', kr: 'ㅛ' },
    { q: 'u', kr: 'ㅕ' },
    { q: 'i', kr: 'ㅑ' },
    { q: 'o', kr: 'ㅐ', shift: 'ㅒ' },
    { q: 'p', kr: 'ㅔ', shift: 'ㅖ' },
    { q: '[', kr: '\\' },
    { q: ']', kr: '\'' },
    { q: '\\', wide: 'backslash' },
  ],
  // Row 3 — Home row
  [
    { q: 'CapsLock', label: 'Caps', wide: 'caps' },
    { q: 'a', kr: 'ㅁ' },
    { q: 's', kr: 'ㄴ' },
    { q: 'd', kr: 'ㅇ' },
    { q: 'f', kr: 'ㄹ' },
    { q: 'g', kr: 'ㅎ' },
    { q: 'h', kr: 'ㅗ' },
    { q: 'j', kr: 'ㅓ' },
    { q: 'k', kr: 'ㅏ' },
    { q: 'l', kr: 'ㅣ' },
    { q: ';', kr: '\\' },
    { q: '\'', kr: '\'' },
    { q: 'Enter', label: '↵', wide: 'enter' },
  ],
  // Row 4 — Bottom row
  [
    { q: 'Shift', label: '⇧', wide: 'shift-l' },
    { q: 'z', kr: 'ㅋ' },
    { q: 'x', kr: 'ㅌ' },
    { q: 'c', kr: 'ㅊ' },
    { q: 'v', kr: 'ㅍ' },
    { q: 'b', kr: 'ㅠ' },
    { q: 'n', kr: 'ㅜ' },
    { q: 'm', kr: 'ㅡ' },
    { q: ',', kr: ',' },
    { q: '.', kr: '.' },
    { q: '/', kr: '/' },
    { q: 'Shift', label: '⇧', wide: 'shift-r' },
  ],
  // Row 5 — Space bar
  [
    { q: ' ', label: 'Space', wide: 'space' },
  ],
];

// Map from key identifier → DOM element (for fast lookup during highlight)
// Key: normalized key string (lowercase for letters, raw for special)
const _keyEls = new Map();

let _highlightTimer = null;
let _visible = true;

const VirtualKeyboard = {

  /**
   * Build the keyboard DOM and insert it into the container.
   * Call once after DOM is ready.
   */
  /**
   * Build keyboard into all containers found by selector.
   * Registers all key elements across containers in the shared _keyEls map,
   * so highlightKey() illuminates keys on both exercise and freewrite screens.
   */
  init() {
    _keyEls.clear();

    const CONTAINER_IDS = ['#virtual-keyboard', '#fw-virtual-keyboard'];

    CONTAINER_IDS.forEach((selector) => {
      const container = qs(selector);
      if (!container) return;

      container.innerHTML = '';

      ROWS.forEach((row, rowIdx) => {
        const rowEl = document.createElement('div');
        rowEl.className = 'vk-row';
        if (rowIdx === 4) rowEl.className += ' vk-row-space';

        row.forEach((keyDef) => {
          const keyEl = document.createElement('div');
          keyEl.className = 'vk-key';
          if (keyDef.wide) keyEl.classList.add(`vk-key--${keyDef.wide}`);
          if (!keyDef.kr)  keyEl.classList.add('vk-key--inactive');

          if (keyDef.kr) {
            const krEl = document.createElement('span');
            krEl.className = 'vk-kr';
            krEl.textContent = keyDef.kr;
            keyEl.appendChild(krEl);

            if (keyDef.shift) {
              const shiftEl = document.createElement('span');
              shiftEl.className = 'vk-kr-shift';
              shiftEl.textContent = keyDef.shift;
              keyEl.appendChild(shiftEl);
            }
          }

          const qEl = document.createElement('span');
          qEl.className = 'vk-q';
          qEl.textContent = keyDef.label ?? keyDef.q;
          keyEl.appendChild(qEl);

          rowEl.appendChild(keyEl);

          // Register in shared lookup map (all containers share it)
          const lookupKey = this._normalizeKey(keyDef.q);
          if (!_keyEls.has(lookupKey)) {
            _keyEls.set(lookupKey, []);
          }
          _keyEls.get(lookupKey).push(keyEl);
        });

        container.appendChild(rowEl);
      });
    });

    // Bind exercise screen toggle button
    qs('#btn-toggle-keyboard')?.addEventListener('click', () => this.toggle());

    // Prevent key clicks from stealing focus from the active input
    CONTAINER_IDS.forEach((selector) => {
      qs(selector)?.addEventListener('mousedown', (e) => e.preventDefault());
    });

    // Start visible
    this.show();
  },

  /**
   * Highlight the key corresponding to the given QWERTY character.
   * Uppercase letters trigger both the base key + the shift indicator.
   * @param {string} key - raw key from KeyboardEvent.key
   */
  highlightKey(key) {
    const isShifted = key !== key.toLowerCase() && key.length === 1;
    const lookupKey = this._normalizeKey(key);
    const els = _keyEls.get(lookupKey);
    if (!els) return;

    els.forEach((el) => {
      el.classList.add('vk-key--active');
      if (isShifted) el.classList.add('vk-key--shifted');
    });

    // Also light up Shift key when shifted
    if (isShifted) {
      (_keyEls.get('shift') ?? []).forEach((el) => {
        el.classList.add('vk-key--active');
      });
    }

    // Auto-clear after short duration
    clearTimeout(_highlightTimer);
    _highlightTimer = setTimeout(() => this.clearHighlight(), 200);
  },

  /**
   * Remove all active highlights immediately.
   */
  clearHighlight() {
    _keyEls.forEach((els) => {
      els.forEach((el) => {
        el.classList.remove('vk-key--active', 'vk-key--shifted');
      });
    });
  },

  /**
   * Toggle keyboard visibility.
   */
  toggle() {
    _visible ? this.hide() : this.show();
  },

  show() {
    _visible = true;
    ['#virtual-keyboard', '#fw-virtual-keyboard'].forEach((sel) => {
      qs(sel)?.classList.remove('vk-hidden');
    });
    ['#btn-toggle-keyboard', '#fw-btn-toggle-kb'].forEach((sel) => {
      const btn = qs(sel);
      if (!btn) return;
      btn.setAttribute('aria-pressed', 'true');
      btn.title = 'Hide keyboard';
      btn.textContent = '⌨ Hide';
    });
  },

  hide() {
    _visible = false;
    ['#virtual-keyboard', '#fw-virtual-keyboard'].forEach((sel) => {
      qs(sel)?.classList.add('vk-hidden');
    });
    ['#btn-toggle-keyboard', '#fw-btn-toggle-kb'].forEach((sel) => {
      const btn = qs(sel);
      if (!btn) return;
      btn.setAttribute('aria-pressed', 'false');
      btn.title = 'Show keyboard';
      btn.textContent = '⌨ Show';
    });
  },

  // ── Private ──────────────────────────────────

  /**
   * Normalize a key string for use as a Map key.
   * Letters → lowercase. Special keys → lowercase.
   * @param {string} key
   * @returns {string}
   */
  _normalizeKey(key) {
    if (key === ' ') return 'space';
    return key.toLowerCase();
  },
};

export default VirtualKeyboard;