/**
 * data/DataLoader.js
 * ─────────────────────────────────────────────
 * Single abstraction for all data access.
 * Today: returns local static arrays.
 * Future: swap getExercises() to fetch() without
 * changing any other module.
 *
 * All exercises follow this schema:
 * { id: string, target: string, hint: string|null, difficulty: number }
 */

import { letters }   from './letters.js';
import { words }     from './words.js';
import { sentences } from './sentences.js';

/** @type {Record<string, Array>} */
const _registry = {
  letters,
  words,
  sentences,
  freewrite: [{ id: 'f-01', target: '', hint: '', meaning: '', difficulty: 0 },]
};

const DataLoader = {
  /**
   * Returns the full exercise list for a mode.
   * Returns a shallow copy to prevent external mutation.
   *
   * To switch to dynamic loading in the future, replace
   * this method body with a fetch call — the interface stays identical.
   *
   * @param {'letters'|'words'|'sentences'} mode
   * @returns {Promise<Array>}
   */
  async getExercises(mode) {

    const data = _registry[mode];
    if (!data) {
      throw new Error(`DataLoader: unknown mode "${mode}"`);
    }
    // Simulate async interface for future fetch compatibility
    return [...data];
  },

  /**
   * Returns the list of available modes.
   * @returns {string[]}
   */
  getModes() {
    return Object.keys(_registry);
  },
};

export default DataLoader;
