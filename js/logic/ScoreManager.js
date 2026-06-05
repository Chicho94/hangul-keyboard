/**
 * logic/ScoreManager.js
 * ─────────────────────────────────────────────
 * Handles all score calculation.
 * Pure functions that take current score state and return new score state.
 * Never mutates AppState directly — returns new values for the caller to set.
 */

/** Points awarded per exercise completion, by difficulty */
const POINTS_BY_DIFFICULTY = {
  1: 10,
  2: 20,
  3: 35,
};

/** Streak bonus multiplier thresholds */
const STREAK_BONUSES = [
  { threshold: 10, multiplier: 2.0 },
  { threshold: 5,  multiplier: 1.5 },
  { threshold: 3,  multiplier: 1.25 },
];

const ScoreManager = {
  /**
   * Called when an exercise is completed correctly.
   * @param {object} currentScore - AppState.get('score')
   * @param {number} difficulty
   * @returns {object} new score state
   */
  award(currentScore, difficulty) {
    const base         = POINTS_BY_DIFFICULTY[difficulty] ?? 10;
    const newStreak    = currentScore.streak + 1;
    const multiplier   = this._getMultiplier(newStreak);
    const points       = Math.round(base * multiplier);
    const newBestStreak = Math.max(currentScore.bestStreak, newStreak);

    return {
      ...currentScore,
      current:      currentScore.current + points,
      streak:       newStreak,
      bestStreak:   newBestStreak,
      totalCorrect: currentScore.totalCorrect + 1,
      totalAttempts: currentScore.totalAttempts + 1,
    };
  },

  /**
   * Called when an exercise is skipped or manually restarted.
   * @param {object} currentScore
   * @returns {object} new score state
   */
  recordSkip(currentScore) {
    return {
      ...currentScore,
      streak:        0,
      totalAttempts: currentScore.totalAttempts + 1,
    };
  },

  /**
   * Computes accuracy percentage from score state.
   * @param {object} score
   * @returns {string} e.g. "87%"
   */
  getAccuracy(score) {
    if (score.totalAttempts === 0) return '—';
    const pct = Math.round((score.totalCorrect / score.totalAttempts) * 100);
    return `${pct}%`;
  },

  /**
   * @private
   * @param {number} streak
   * @returns {number}
   */
  _getMultiplier(streak) {
    for (const { threshold, multiplier } of STREAK_BONUSES) {
      if (streak >= threshold) return multiplier;
    }
    return 1;
  },
};

export default ScoreManager;
