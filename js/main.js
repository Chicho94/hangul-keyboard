/**
 * main.js
 * ─────────────────────────────────────────────
 * Application bootstrap.
 *
 * Input flow with IME:
 *   keydown → _rawKeys buffer updated → HangulIME.convert() →
 *   hangulValue written to input.value → Validator → AppState
 *   keydown → VirtualKeyboard.highlightKey(key)
 */

import AppState         from './state/AppState.js';
import Validator        from './logic/Validator.js';
import ExerciseEngine   from './logic/ExerciseEngine.js';
import Router           from './ui/Router.js';
import Renderer         from './ui/Renderer.js';
import FeedbackDisplay  from './ui/FeedbackDisplay.js';
import VirtualKeyboard  from './ui/VirtualKeyboard.js';
import Hangul           from './utils/hangul.js';
import { qs }           from './utils/dom.js';

// ── IME key buffer ────────────────────────────
let _rawKeys = '';

// ── Bootstrap ────────────────────────────────

function init() {
  Router.init();
  Renderer.init();
  FeedbackDisplay.init();
  VirtualKeyboard.init();

  _bindMenuEvents();
  _bindExerciseEvents();
  _bindResultsEvents();
  _bindScreenTransitions();
}

// ── Event: Menu ──────────────────────────────

function _bindMenuEvents() {
  qs('#screen-menu').addEventListener('click', async (e) => {
    const card = e.target.closest('[data-mode]');
    if (!card) return;
    const mode = card.dataset.mode;
    await ExerciseEngine.startSession(mode);
    Router.navigateTo('exercise');
  });
}

// ── Event: Exercise screen ───────────────────

function _bindExerciseEvents() {
  const inputEl = qs('#exercise-input');

  // ── IME: intercept keydown ──
  inputEl.addEventListener('keydown', (e) => {
    // Enter → advance if complete
    if (e.key === 'Enter') {
      const validation = AppState.get('validation');
      if (validation.isComplete) _handleComplete();
      return;
    }

    // Pass modifier combos through
    if (e.ctrlKey || e.altKey || e.metaKey) return;

    // Backspace
    if (e.key === 'Backspace') {
      e.preventDefault();
      VirtualKeyboard.highlightKey('Backspace');
      _rawKeys = _rawKeys.slice(0, -1);
      _processIME();
      return;
    }

    // Space
    if (e.key === ' ') {
      e.preventDefault();
      VirtualKeyboard.highlightKey(' ');
      _rawKeys += ' ';
      _processIME();
      return;
    }

    // Printable single chars
    if (e.key.length === 1) {
      e.preventDefault();
      VirtualKeyboard.highlightKey(e.key);
      _rawKeys += e.key;
      _processIME();
    }
  });

  // ── Button: Next ──
  qs('#btn-next').addEventListener('click', () => {
    _handleComplete();
  });

  // ── Button: Restart exercise ──
  qs('#btn-restart-exercise').addEventListener('click', () => {
    _resetIME();
    ExerciseEngine.restartExercise();
  });

  // ── Button: Skip ──
  qs('#btn-skip').addEventListener('click', () => {
    _resetIME();
    ExerciseEngine.skipExercise();
  });

  // ── Button: Restart session ──
  qs('#btn-restart-session').addEventListener('click', async () => {
    _resetIME();
    await ExerciseEngine.restartSession();
    Router.navigateTo('exercise');
  });

  // ── Button: Back to menu ──
  qs('#btn-back').addEventListener('click', () => {
    _resetIME();
    Router.navigateTo('menu');
  });
}

// ── Event: Results screen ────────────────────

function _bindResultsEvents() {
  qs('#btn-play-again').addEventListener('click', async () => {
    _resetIME();
    await ExerciseEngine.restartSession();
    Router.navigateTo('exercise');
  });

  qs('#btn-menu').addEventListener('click', () => {
    _resetIME();
    Router.navigateTo('menu');
  });
}

// ── Screen transitions ───────────────────────

function _bindScreenTransitions() {
  AppState.subscribe('ui', (ui) => {
    if (ui.screen === 'results') {
      Renderer.renderResults();
    }
    if (ui.screen === 'exercise') {
      requestAnimationFrame(() => qs('#exercise-input')?.focus());
    }
  });

  AppState.subscribe('currentExercise', () => {
    _resetIME();
  });
}

// ── IME processing ────────────────────────────

function _processIME() {
  const exercise = AppState.get('currentExercise');
  const mode     = AppState.get('currentMode');
  if (!exercise?.target) return;

  const hangulValue = Hangul.ime.convert(_rawKeys, { autoInsertIeung: false });
  qs('#exercise-input').value = hangulValue;

  AppState.set('input', { current: hangulValue, submitted: false });

  const result = Validator.validate(hangulValue, exercise.target, mode);
  AppState.set('validation', result);

  if (mode === 'letters' && hangulValue.length > 0) {
    _handleLetterInput(result);
  }
}

function _resetIME() {
  _rawKeys = '';
  const inputEl = qs('#exercise-input');
  if (inputEl) inputEl.value = '';
}

// ── Input result handlers ─────────────────────

function _handleLetterInput(validation) {
  const targetEl = qs('#target-hangul');

  if (validation.isComplete) {
    setTimeout(() => {
      ExerciseEngine.completeExercise();
      _resetIME();
    }, 350);
  } else {
    targetEl?.classList.add('error-flash');
    setTimeout(() => {
      targetEl?.classList.remove('error-flash');
      _resetIME();
      AppState.set('input', { current: '', submitted: false });
      AppState.set('validation', {
        status: 'idle', characterResults: [], errorPositions: [], isComplete: false,
      });
    }, 400);
  }
}

function _handleComplete() {
  const validation = AppState.get('validation');
  if (!validation.isComplete) return;
  ExerciseEngine.completeExercise();
  _resetIME();
}

// ── Start ────────────────────────────────────

init();
