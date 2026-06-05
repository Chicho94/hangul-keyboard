/**
 * data/letters.js
 * ─────────────────────────────────────────────
 * Hangul consonants and vowels with QWERTY mapping.
 * Schema: { id, target, hint, type, romanization, difficulty }
 *
 * 'hint' is the QWERTY key that produces this character
 * on a standard Korean keyboard layout (2-beolsik).
 */

export const letters = [
  // ── Consonants (자음) ──
  { id: 'l-01', target: 'ㄱ', hint: 'r', type: 'consonant', romanization: 'g/k', difficulty: 1 },
  { id: 'l-02', target: 'ㄴ', hint: 's', type: 'consonant', romanization: 'n',   difficulty: 1 },
  { id: 'l-03', target: 'ㄷ', hint: 'e', type: 'consonant', romanization: 'd/t', difficulty: 1 },
  { id: 'l-04', target: 'ㄹ', hint: 'f', type: 'consonant', romanization: 'r/l', difficulty: 1 },
  { id: 'l-05', target: 'ㅁ', hint: 'a', type: 'consonant', romanization: 'm',   difficulty: 1 },
  { id: 'l-06', target: 'ㅂ', hint: 'q', type: 'consonant', romanization: 'b/p', difficulty: 1 },
  { id: 'l-07', target: 'ㅅ', hint: 't', type: 'consonant', romanization: 's',   difficulty: 1 },
  { id: 'l-08', target: 'ㅇ', hint: 'd', type: 'consonant', romanization: 'ng',  difficulty: 1 },
  { id: 'l-09', target: 'ㅈ', hint: 'w', type: 'consonant', romanization: 'j',   difficulty: 1 },
  { id: 'l-10', target: 'ㅊ', hint: 'c', type: 'consonant', romanization: 'ch',  difficulty: 2 },
  { id: 'l-11', target: 'ㅋ', hint: 'z', type: 'consonant', romanization: 'k',   difficulty: 2 },
  { id: 'l-12', target: 'ㅌ', hint: 'x', type: 'consonant', romanization: 't',   difficulty: 2 },
  { id: 'l-13', target: 'ㅍ', hint: 'v', type: 'consonant', romanization: 'p',   difficulty: 2 },
  { id: 'l-14', target: 'ㅎ', hint: 'g', type: 'consonant', romanization: 'h',   difficulty: 2 },
  { id: 'l-15', target: 'ㄲ', hint: 'R', type: 'consonant', romanization: 'kk',  difficulty: 3 },
  { id: 'l-16', target: 'ㄸ', hint: 'E', type: 'consonant', romanization: 'tt',  difficulty: 3 },
  { id: 'l-17', target: 'ㅃ', hint: 'Q', type: 'consonant', romanization: 'pp',  difficulty: 3 },
  { id: 'l-18', target: 'ㅆ', hint: 'T', type: 'consonant', romanization: 'ss',  difficulty: 3 },
  { id: 'l-19', target: 'ㅉ', hint: 'W', type: 'consonant', romanization: 'jj',  difficulty: 3 },

  // ── Vowels (모음) ──
  { id: 'l-20', target: 'ㅏ', hint: 'k', type: 'vowel', romanization: 'a',   difficulty: 1 },
  { id: 'l-21', target: 'ㅑ', hint: 'i', type: 'vowel', romanization: 'ya',  difficulty: 1 },
  { id: 'l-22', target: 'ㅓ', hint: 'j', type: 'vowel', romanization: 'eo',  difficulty: 1 },
  { id: 'l-23', target: 'ㅕ', hint: 'u', type: 'vowel', romanization: 'yeo', difficulty: 1 },
  { id: 'l-24', target: 'ㅗ', hint: 'h', type: 'vowel', romanization: 'o',   difficulty: 1 },
  { id: 'l-25', target: 'ㅛ', hint: 'y', type: 'vowel', romanization: 'yo',  difficulty: 1 },
  { id: 'l-26', target: 'ㅜ', hint: 'n', type: 'vowel', romanization: 'u',   difficulty: 1 },
  { id: 'l-27', target: 'ㅠ', hint: 'b', type: 'vowel', romanization: 'yu',  difficulty: 2 },
  { id: 'l-28', target: 'ㅡ', hint: 'm', type: 'vowel', romanization: 'eu',  difficulty: 2 },
  { id: 'l-29', target: 'ㅣ', hint: 'l', type: 'vowel', romanization: 'i',   difficulty: 1 },
  { id: 'l-30', target: 'ㅐ', hint: 'o', type: 'vowel', romanization: 'ae',  difficulty: 2 },
  { id: 'l-31', target: 'ㅔ', hint: 'p', type: 'vowel', romanization: 'e',   difficulty: 2 },
  { id: 'l-32', target: 'ㅒ', hint: 'O', type: 'vowel', romanization: 'yae', difficulty: 3 },
  { id: 'l-33', target: 'ㅖ', hint: 'P', type: 'vowel', romanization: 'ye',  difficulty: 3 },
];
