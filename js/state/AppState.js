/**
 * state/AppState.js
 * ─────────────────────────────────────────────
 * Single source of truth for the application.
 * Uses a minimal pub/sub system: subscribers register
 * to specific keys and are notified on change.
 *
 * Usage:
 *   AppState.set('score', { ...AppState.get('score'), current: 10 });
 *   AppState.subscribe('score', (value) => console.log(value));
 */

const _state = {
  // Navigation
  currentMode: null, // 'letters' | 'words' | 'sentences'

  // Active exercise
  currentExercise: {
    id: null,
    target: '',
    hint: null,
    difficulty: null,
  },

  // Session exercise tracking
  exerciseQueue: [],
  exerciseHistory: [],

  // User input
  input: {
    current: '',
    submitted: false,
  },

  // Validation result (set by Validator)
  validation: {
    status: 'idle', // 'idle' | 'partial' | 'error' | 'complete'
    characterResults: [],
    errorPositions: [],
    isComplete: false,
  },

  // Score
  score: {
    current: 0,
    streak: 0,
    bestStreak: 0,
    totalCorrect: 0,
    totalAttempts: 0,
  },

  // Session progress
  progress: {
    exercisesCompleted: 0,
    exercisesTotal: 0,
    percentComplete: 0,
  },

  // Timer
  timer: {
    isRunning: false,
    startedAt: null,
    elapsed: 0,
    limitSeconds: null,
  },

  // UI state
  ui: {
    isLoading: false,
    screen: 'menu', // 'menu' | 'exercise' | 'results'
  },
};

/** @type {Map<string, Set<Function>>} */
const _subscribers = new Map();

const AppState = {
  /**
   * Read a top-level key from state.
   * @param {string} key
   * @returns {*}
   */
  get(key) {
    return _state[key];
  },

  /**
   * Write a top-level key and notify subscribers.
   * Always pass the full new value (use spread for objects).
   * @param {string} key
   * @param {*} value
   */
  set(key, value) {
    _state[key] = value;
    this._notify(key, value);
  },

  /**
   * Subscribe to changes on a specific key.
   * Returns an unsubscribe function.
   * @param {string} key
   * @param {Function} callback
   * @returns {Function} unsubscribe
   */
  subscribe(key, callback) {
    if (!_subscribers.has(key)) {
      _subscribers.set(key, new Set());
    }
    _subscribers.get(key).add(callback);

    return () => {
      _subscribers.get(key)?.delete(callback);
    };
  },

  /**
   * @private
   */
  _notify(key, value) {
    _subscribers.get(key)?.forEach((cb) => cb(value));
  },

  /**
   * Reset all session-related state (score, progress, history).
   * Keeps currentMode intact.
   */
  resetSession() {
    this.set('exerciseQueue', []);
    this.set('exerciseHistory', []);
    this.set('input', { current: '', submitted: false });
    this.set('validation', {
      status: 'idle',
      characterResults: [],
      errorPositions: [],
      isComplete: false,
    });
    this.set('score', {
      current: 0,
      streak: 0,
      bestStreak: 0,
      totalCorrect: 0,
      totalAttempts: 0,
    });
    this.set('progress', {
      exercisesCompleted: 0,
      exercisesTotal: 0,
      percentComplete: 0,
    });
    this.set('timer', {
      isRunning: false,
      startedAt: null,
      elapsed: 0,
      limitSeconds: null,
    });
  },

  /**
   * Reset only the current exercise input/validation state.
   */
  resetExercise() {
    this.set('input', { current: '', submitted: false });
    this.set('validation', {
      status: 'idle',
      characterResults: [],
      errorPositions: [],
      isComplete: false,
    });
  },
};

export default AppState;
