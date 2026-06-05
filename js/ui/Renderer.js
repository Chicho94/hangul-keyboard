/**
 * ui/Renderer.js
 * ─────────────────────────────────────────────
 * Renders exercise content into the DOM.
 * Subscribes to AppState keys and updates the UI reactively.
 * Never calls business logic directly — only reads state.
 */

import AppState     from '../state/AppState.js';
import ScoreManager from '../logic/ScoreManager.js';
import { qs, setText, formatTime } from '../utils/dom.js';

const Renderer = {
  // ── Cached DOM refs (set once in init) ──────

  _els: {},

  /**
   * Initialize DOM refs and subscribe to state keys.
   */
  init() {
    this._els = {
      headerMode:    qs('#header-mode-label'),
      progressFill:  qs('#progress-fill'),
      progressLabel: qs('#progress-label'),
      targetHangul:  qs('#target-hangul'),
      targetHint:    qs('#target-hint'),
      statTimer:     qs('#stat-timer'),
      statScore:     qs('#stat-score'),
      mCorrect:      qs('#m-correct'),
      mErrors:       qs('#m-errors'),
      mAccuracy:     qs('#m-accuracy'),
      mStreak:       qs('#m-streak'),
    };

    AppState.subscribe('currentExercise', (ex) => this._renderExercise(ex));
    AppState.subscribe('progress',        (p)  => this._renderProgress(p));
    AppState.subscribe('score',           (s)  => this._renderScore(s));
    AppState.subscribe('timer',           (t)  => this._renderTimer(t));
    AppState.subscribe('currentMode',     (m)  => this._renderModeLabel(m));
  },

  // ── Private renderers ────────────────────────

  /**
   * Render the target exercise card.
   * @param {object} exercise
   */
  _renderExercise(exercise) {
    if (!exercise?.target) return;
    const el = this._els;

    setText(el.targetHangul, exercise.target);

    // Hint display depends on mode
    const mode = AppState.get('currentMode');
    if (mode === 'letters' && exercise.hint) {
      setText(el.targetHint, `Key: ${exercise.hint.toUpperCase()}`);
    } else if (exercise.hint && exercise.hint !== '—') {
      setText(el.targetHint, exercise.hint);
    } else {
      setText(el.targetHint, '');
    }
  },

  /**
   * Render session progress bar and label.
   * @param {object} progress
   */
  _renderProgress(progress) {
    const el = this._els;
    const pct = progress.percentComplete ?? 0;
    if (el.progressFill)  el.progressFill.style.width = `${pct}%`;
    if (el.progressLabel) {
      setText(el.progressLabel,
        `${progress.exercisesCompleted} / ${progress.exercisesTotal}`);
    }
  },

  /**
   * Render all score-related elements.
   * @param {object} score
   */
  _renderScore(score) {
    const el       = this._els;
    const accuracy = ScoreManager.getAccuracy(score);
    const errors   = score.totalAttempts - score.totalCorrect;

    setText(el.statScore,  `${score.current} pts`);
    setText(el.mCorrect,   score.totalCorrect);
    setText(el.mErrors,    errors);
    setText(el.mAccuracy,  accuracy);
    setText(el.mStreak,    score.streak);
  },

  /**
   * Render the timer display.
   * @param {object} timer
   */
  _renderTimer(timer) {
    setText(this._els.statTimer, formatTime(timer.elapsed ?? 0));
  },

  /**
   * Render the mode label in the header.
   * @param {string} mode
   */
  _renderModeLabel(mode) {
    const labels = { letters: 'Letters', words: 'Words', sentences: 'Sentences' };
    setText(this._els.headerMode, labels[mode] ?? mode);
  },

  // ── Public: Results screen ───────────────────

  /**
   * Populate the results screen with final stats.
   */
  renderResults() {
    const score    = AppState.get('score');
    const timer    = AppState.get('timer');
    const errors   = score.totalAttempts - score.totalCorrect;
    const accuracy = ScoreManager.getAccuracy(score);

    setText(qs('#r-correct'),  score.totalCorrect);
    setText(qs('#r-errors'),   errors);
    setText(qs('#r-accuracy'), accuracy);
    setText(qs('#r-score'),    score.current);
    setText(qs('#r-time'),     formatTime(timer.elapsed ?? 0));
    setText(qs('#r-streak'),   score.bestStreak);
  },
};

export default Renderer;
