/**
 * ui/Router.js
 * ─────────────────────────────────────────────
 * Controls which screen is visible.
 * Reads screen names from AppState.ui.screen.
 * Handles CSS transitions between screens.
 */

import AppState from '../state/AppState.js';
import { qs }   from '../utils/dom.js';

/** @type {Record<string, string>} screenName → element id */
const SCREEN_MAP = {
  menu:     'screen-menu',
  exercise: 'screen-exercise',
  results:  'screen-results',
};

const Router = {
  _currentScreen: null,

  /**
   * Initialize: subscribe to ui state changes.
   */
  init() {
    AppState.subscribe('ui', (ui) => {
      this._showScreen(ui.screen);
    });
    // Show initial screen
    this._showScreen(AppState.get('ui').screen);
  },

  /**
   * Navigate programmatically.
   * @param {'menu'|'exercise'|'results'} screen
   */
  navigateTo(screen) {
    AppState.set('ui', { ...AppState.get('ui'), screen });
  },

  // ── Private ──────────────────────────────────

  /**
   * @param {string} screenName
   */
  _showScreen(screenName) {
    if (this._currentScreen === screenName) return;

    // Hide all screens
    Object.values(SCREEN_MAP).forEach((id) => {
      const el = qs(`#${id}`);
      if (el) {
        el.classList.remove('active');
        el.style.display = 'none';
      }
    });

    // Show target screen
    const targetId = SCREEN_MAP[screenName];
    const target   = qs(`#${targetId}`);
    if (target) {
      target.style.display = 'flex';
      // Force reflow before adding active class (enables CSS transition)
      requestAnimationFrame(() => {
        target.classList.add('active');
      });
    }

    this._currentScreen = screenName;
  },
};

export default Router;
