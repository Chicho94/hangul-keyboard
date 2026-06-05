/**
 * logic/ExerciseEngine.js
 * ─────────────────────────────────────────────
 * Controls exercise flow:
 *   - loads exercises for a mode
 *   - builds shuffled queue
 *   - advances to next exercise
 *   - signals session completion
 *
 * Reads from and writes to AppState.
 * Does NOT touch the DOM.
 */

import AppState    from '../state/AppState.js';
import DataLoader  from '../data/DataLoader.js';
import ScoreManager from './ScoreManager.js';

/** How many exercises per session */
const SESSION_SIZE = 10;

const ExerciseEngine = {
  /**
   * Start a new session for the given mode.
   * Loads exercises, builds queue, loads first exercise.
   * @param {'letters'|'words'|'sentences'} mode
   */
  async startSession(mode) {
    AppState.resetSession();
    AppState.set('currentMode', mode);

    const all      = await DataLoader.getExercises(mode);
    const shuffled = this._shuffle([...all]);
    const queue    = shuffled.slice(0, SESSION_SIZE);

    AppState.set('exerciseQueue', queue);
    AppState.set('progress', {
      exercisesCompleted: 0,
      exercisesTotal: queue.length,
      percentComplete: 0,
    });

    this._loadFromQueue();
    this._startTimer();
  },

  /**
   * Mark current exercise as complete (correct answer).
   */
  completeExercise() {
    const exercise    = AppState.get('currentExercise');
    const currentScore = AppState.get('score');
    const newScore    = ScoreManager.award(currentScore, exercise.difficulty ?? 1);
    AppState.set('score', newScore);

    this._advanceProgress(true);
  },

  /**
   * Skip current exercise without scoring.
   */
  skipExercise() {
    const currentScore = AppState.get('score');
    AppState.set('score', ScoreManager.recordSkip(currentScore));
    this._advanceProgress(false);
  },

  /**
   * Restart the current exercise (reset input/validation, keep score).
   */
  restartExercise() {
    AppState.resetExercise();
  },

  /**
   * Restart the full session with the same mode.
   */
  async restartSession() {
    const mode = AppState.get('currentMode');
    await this.startSession(mode);
  },

  // ── Private ──────────────────────────────────

  /**
   * Load the next exercise from the queue into AppState.
   */
  _loadFromQueue() {
    const queue = AppState.get('exerciseQueue');
    if (!queue.length) {
      this._endSession();
      return;
    }

    // Take from front of queue (already shuffled)
    const [next, ...rest] = queue;
    AppState.set('exerciseQueue', rest);
    AppState.set('currentExercise', next);
    AppState.resetExercise();
  },

  /**
   * Update progress state and either load next or end session.
   * @param {boolean} wasCorrect
   */
  _advanceProgress(wasCorrect) {
    const progress = AppState.get('progress');
    const completed = progress.exercisesCompleted + 1;
    const total     = progress.exercisesTotal;
    const pct       = Math.round((completed / total) * 100);

    AppState.set('progress', {
      ...progress,
      exercisesCompleted: completed,
      percentComplete: pct,
    });

    const history = AppState.get('exerciseHistory');
    AppState.set('exerciseHistory', [...history, {
      id:     AppState.get('currentExercise').id,
      correct: wasCorrect,
    }]);

    if (completed >= total) {
      this._endSession();
    } else {
      this._loadFromQueue();
    }
  },

  /**
   * Stop timer and signal end-of-session.
   */
  _endSession() {
    this._stopTimer();
    AppState.set('ui', { ...AppState.get('ui'), screen: 'results' });
  },

  // ── Timer ──────────────────────────────────

  _timerInterval: null,

  _startTimer() {
    this._stopTimer();
    AppState.set('timer', {
      isRunning: true,
      startedAt: Date.now(),
      elapsed: 0,
      limitSeconds: null,
    });
    this._timerInterval = setInterval(() => {
      const timer = AppState.get('timer');
      if (!timer.isRunning) return;
      const elapsed = Math.floor((Date.now() - timer.startedAt) / 1000);
      AppState.set('timer', { ...timer, elapsed });
    }, 1000);
  },

  _stopTimer() {
    if (this._timerInterval) {
      clearInterval(this._timerInterval);
      this._timerInterval = null;
    }
    const timer = AppState.get('timer');
    AppState.set('timer', { ...timer, isRunning: false });
  },

  // ── Utilities ──────────────────────────────

  /**
   * Fisher-Yates shuffle (returns new array).
   * @param {Array} arr
   * @returns {Array}
   */
  _shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  },
};

export default ExerciseEngine;
