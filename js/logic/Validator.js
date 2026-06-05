/**
 * logic/Validator.js
 * ─────────────────────────────────────────────
 * Pure validation logic. Zero DOM access.
 * All functions: same input → same output.
 *
 * Supports three modes:
 *   - letters:   single keypress comparison
 *   - words:     character-by-character progressive
 *   - sentences: character-by-character with spaces
 */

/**
 * @typedef {'correct'|'wrong'|'pending'|'extra'} CharStatus
 * @typedef {{ index: number, expected: string, received: string|undefined, status: CharStatus }} CharResult
 * @typedef {{ status: 'idle'|'partial'|'error'|'complete', characterResults: CharResult[], errorPositions: number[], isComplete: boolean }} ValidationResult
 */

const Validator = {
  /**
   * Main validation entry point.
   * @param {string} userInput
   * @param {string} target
   * @param {'letters'|'words'|'sentences'} mode
   * @returns {ValidationResult}
   */
  validate(userInput, target, mode) {
    if (mode === 'letters') {
      return this._validateLetter(userInput, target);
    }
    return this._validateProgressive(userInput, target);
  },

  /**
   * Letter mode: single character, immediate result.
   * @param {string} userInput
   * @param {string} target
   * @returns {ValidationResult}
   */
  _validateLetter(userInput, target) {
    if (!userInput) {
      return this._idleResult();
    }

    const received = userInput[0];
    const isCorrect = received === target;

    return {
      status: isCorrect ? 'complete' : 'error',
      characterResults: [{
        index: 0,
        expected: target,
        received,
        status: isCorrect ? 'correct' : 'wrong',
      }],
      errorPositions: isCorrect ? [] : [0],
      isComplete: isCorrect,
    };
  },

  /**
   * Words/sentences: compare char by char as user types.
   * @param {string} userInput
   * @param {string} target
   * @returns {ValidationResult}
   */
  _validateProgressive(userInput, target) {
    if (!userInput) {
      return this._idleResult();
    }

    const maxLen = Math.max(userInput.length, target.length);
    /** @type {CharResult[]} */
    const characterResults = [];
    const errorPositions = [];

    for (let i = 0; i < maxLen; i++) {
      const expected = target[i];
      const received = userInput[i];

      let status;

      if (received === undefined) {
        // User hasn't typed this far yet
        status = 'pending';
      } else if (expected === undefined) {
        // User typed past the target length
        status = 'extra';
        errorPositions.push(i);
      } else if (received === expected) {
        status = 'correct';
      } else {
        status = 'wrong';
        errorPositions.push(i);
      }

      characterResults.push({ index: i, expected, received, status });
    }

    const hasErrors   = errorPositions.length > 0;
    const hasPending  = characterResults.some((r) => r.status === 'pending');
    const isComplete  = !hasErrors && !hasPending && userInput.length === target.length;

    let status;
    if (isComplete)       status = 'complete';
    else if (hasErrors)   status = 'error';
    else if (userInput.length > 0) status = 'partial';
    else                  status = 'idle';

    return { status, characterResults, errorPositions, isComplete };
  },

  /**
   * @returns {ValidationResult}
   */
  _idleResult() {
    return {
      status: 'idle',
      characterResults: [],
      errorPositions: [],
      isComplete: false,
    };
  },
};

export default Validator;
