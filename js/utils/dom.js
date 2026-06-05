/**
 * utils/dom.js
 * ─────────────────────────────────────────────
 * Small, focused DOM helper functions.
 * No business logic. No state access.
 */

/**
 * Safe querySelector with guard.
 * @param {string} selector
 * @param {Element} [root=document]
 * @returns {Element|null}
 */
export function qs(selector, root = document) {
  return root.querySelector(selector);
}

/**
 * Adds one or more CSS classes to an element.
 * @param {Element} el
 * @param {...string} classes
 */
export function addClass(el, ...classes) {
  el?.classList.add(...classes);
}

/**
 * Removes one or more CSS classes from an element.
 * @param {Element} el
 * @param {...string} classes
 */
export function removeClass(el, ...classes) {
  el?.classList.remove(...classes);
}

/**
 * Sets textContent safely.
 * @param {Element} el
 * @param {string} text
 */
export function setText(el, text) {
  if (el) el.textContent = text;
}

/**
 * Sets innerHTML safely (only for trusted content, e.g. char spans).
 * @param {Element} el
 * @param {string} html
 */
export function setHTML(el, html) {
  if (el) el.innerHTML = html;
}

/**
 * Temporarily adds a class and removes it after the animation ends.
 * @param {Element} el
 * @param {string} cls
 * @param {number} [durationMs=400]
 */
export function flashClass(el, cls, durationMs = 400) {
  if (!el) return;
  el.classList.add(cls);
  setTimeout(() => el.classList.remove(cls), durationMs);
}

/**
 * Format seconds as MM:SS string.
 * @param {number} seconds
 * @returns {string}
 */
export function formatTime(seconds) {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}
