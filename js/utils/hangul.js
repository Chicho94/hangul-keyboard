/**
 * utils/hangul.js
 * ─────────────────────────────────────────────
 * 2-beolsik QWERTY → Hangul converter + syllable composer.
 *
 * Hangul syllable formula (Unicode):
 *   syllable = 0xAC00 + (초성 × 21 + 중성) × 28 + 종성
 */

// ── 2-beolsik key map ─────────────────────────
// Consonants: { cho: choseong index, jong: jongseong index (0 = cannot be jong) }
// Vowels:     { jung: jungseong index }

const KEY_MAP = {
  r: { cho: 0,  jong: 1  }, // ㄱ
  R: { cho: 1,  jong: 2  }, // ㄲ
  s: { cho: 2,  jong: 4  }, // ㄴ
  e: { cho: 3,  jong: 7  }, // ㄷ
  E: { cho: 4,  jong: 0  }, // ㄸ (no jong)
  f: { cho: 5,  jong: 8  }, // ㄹ
  a: { cho: 6,  jong: 16 }, // ㅁ
  q: { cho: 7,  jong: 17 }, // ㅂ
  Q: { cho: 8,  jong: 0  }, // ㅃ (no jong)
  t: { cho: 9,  jong: 19 }, // ㅅ
  T: { cho: 10, jong: 20 }, // ㅆ
  d: { cho: 11, jong: 21 }, // ㅇ
  w: { cho: 12, jong: 22 }, // ㅈ
  W: { cho: 13, jong: 0  }, // ㅉ (no jong)
  c: { cho: 14, jong: 23 }, // ㅊ
  z: { cho: 15, jong: 24 }, // ㅋ
  x: { cho: 16, jong: 25 }, // ㅌ
  v: { cho: 17, jong: 26 }, // ㅍ
  g: { cho: 18, jong: 27 }, // ㅎ
  // Vowels
  k: { jung: 0  }, // ㅏ
  o: { jung: 1  }, // ㅐ
  i: { jung: 2  }, // ㅑ
  O: { jung: 3  }, // ㅒ
  j: { jung: 4  }, // ㅓ
  p: { jung: 5  }, // ㅔ
  u: { jung: 6  }, // ㅕ
  P: { jung: 7  }, // ㅖ
  h: { jung: 8  }, // ㅗ
  y: { jung: 12 }, // ㅛ
  n: { jung: 13 }, // ㅜ
  b: { jung: 17 }, // ㅠ
  m: { jung: 18 }, // ㅡ
  l: { jung: 20 }, // ㅣ
};

// Compound jungseong: 'jungA+jungB' → compound jung index
const COMPOUND_JUNG = {
  '8+0':  9,  // ㅗ+ㅏ=ㅘ
  '8+1':  10, // ㅗ+ㅐ=ㅙ
  '8+20': 11, // ㅗ+ㅣ=ㅚ
  '13+4': 14, // ㅜ+ㅓ=ㅝ
  '13+5': 15, // ㅜ+ㅔ=ㅞ
  '13+20':16, // ㅜ+ㅣ=ㅟ
  '18+20':19, // ㅡ+ㅣ=ㅢ
};

// Compound jongseong: 'jongA+jongB' → compound jong index
const COMPOUND_JONG = {
  '1+19': 3,  // ㄱ+ㅅ=ㄳ
  '4+22': 5,  // ㄴ+ㅈ=ㄵ
  '4+27': 6,  // ㄴ+ㅎ=ㄶ
  '8+1':  9,  // ㄹ+ㄱ=ㄺ
  '8+16': 10, // ㄹ+ㅁ=ㄻ
  '8+17': 11, // ㄹ+ㅂ=ㄼ
  '8+19': 12, // ㄹ+ㅅ=ㄽ
  '8+20': 13, // ㄹ+ㅆ=ㄾ
  '8+26': 14, // ㄹ+ㅍ=ㄿ
  '8+27': 15, // ㄹ+ㅎ=ㅀ
  '17+19':18, // ㅂ+ㅅ=ㅄ
};

// Split compound jong back into [remaining jong, new cho]
const SPLIT_JONG = {
  3:  [1,  0],  // ㄳ → ㄱ + ㄱcho(0)... ㅅcho=9
  5:  [4,  12], // ㄵ → ㄴ + ㅈcho
  6:  [4,  18], // ㄶ → ㄴ + ㅎcho
  9:  [8,  0],  // ㄺ → ㄹ + ㄱcho
  10: [8,  6],  // ㄻ → ㄹ + ㅁcho
  11: [8,  7],  // ㄼ → ㄹ + ㅂcho
  12: [8,  9],  // ㄽ → ㄹ + ㅅcho
  13: [8,  10], // ㄾ → ㄹ + ㅆcho
  14: [8,  17], // ㄿ → ㄹ + ㅍcho
  15: [8,  18], // ㅀ → ㄹ + ㅎcho
  18: [17, 9],  // ㅄ → ㅂ + ㅅcho
};

// Fix split for ㄳ: ㄱ+ㅅ, so new cho for ㅅ is 9
SPLIT_JONG[3] = [1, 9];


// Jong index → Cho index (needed when a simple jong becomes next syllable's cho)
const JONG_TO_CHO = {
  1:0, 2:1, 4:2, 7:3, 8:5, 16:6, 17:7, 19:9, 20:10,
  21:11, 22:12, 23:14, 24:15, 25:16, 26:17, 27:18,
};

// Compatibility jamo display strings (indexed by cho/jong)
const CHO_CHARS  = ['ㄱ','ㄲ','ㄴ','ㄷ','ㄸ','ㄹ','ㅁ','ㅂ','ㅃ','ㅅ','ㅆ','ㅇ','ㅈ','ㅉ','ㅊ','ㅋ','ㅌ','ㅍ','ㅎ'];
const JUNG_CHARS = ['ㅏ','ㅐ','ㅑ','ㅒ','ㅓ','ㅔ','ㅕ','ㅖ','ㅗ','ㅘ','ㅙ','ㅚ','ㅛ','ㅜ','ㅝ','ㅞ','ㅟ','ㅠ','ㅡ','ㅢ','ㅣ'];
const JONG_CHARS = ['','ㄱ','ㄲ','ㄳ','ㄴ','ㄵ','ㄶ','ㄷ','ㄹ','ㄺ','ㄻ','ㄼ','ㄽ','ㄾ','ㄿ','ㅀ','ㅁ','ㅂ','ㅄ','ㅅ','ㅆ','ㅇ','ㅈ','ㅊ','ㅋ','ㅌ','ㅍ','ㅎ'];

function buildSyllable(cho, jung, jong) {
  return String.fromCodePoint(0xAC00 + (cho * 21 + jung) * 28 + jong);
}

function emptySyl() {
  return { cho: null, jung: null, jong: null };
}

// ── IME engine ────────────────────────────────

const HangulIME = {
  /**
   * Convert a raw QWERTY string to Hangul (2-beolsik).
   * @param {string} qwerty
   * @returns {string}
   */
  convert(qwerty, options = {}) {
    const opts = {
      autoInsertIeung: false, // <- false = no agregar ㅇ automáticamente
      ...options,
    };

    let result = '';
    let syl = emptySyl();

    for (const key of qwerty) {
      if (key === ' ') {
        result += this._flush(syl) + ' ';
        syl = emptySyl();
        continue;
      }

      const entry = KEY_MAP[key];
      if (!entry) {
        result += this._flush(syl) + key;
        syl = emptySyl();
        continue;
      }

      if ('jung' in entry) {
        const out = this._onVowel(entry.jung, syl, opts);
        result += out.emit;
        syl = out.syl;
      } else {
        const out = this._onConsonant(entry, syl);
        result += out.emit;
        syl = out.syl;
      }
    }

    result += this._flush(syl);
    return result;
  },

  _onVowel(jungIdx, syl, opts = {}) {
    // Empty state
    if (syl.cho === null) {
      if (opts.autoInsertIeung) {
        return { emit: '', syl: { cho: 11, jung: jungIdx, jong: null } };
      }

      // emitir vocal suelta, sin ㅇ implícito
      return { emit: JUNG_CHARS[jungIdx], syl: emptySyl() };
    }

    // Have cho only → attach vowel
    if (syl.jung === null) {
      return { emit: '', syl: { cho: syl.cho, jung: jungIdx, jong: null } };
    }

    // Have cho+jung, no jong → try compound vowel
    if (syl.jong === null) {
      const ck = `${syl.jung}+${jungIdx}`;
      if (COMPOUND_JUNG[ck] !== undefined) {
        return { emit: '', syl: { cho: syl.cho, jung: COMPOUND_JUNG[ck], jong: null } };
      }

      // Si no quieres ㅇ implícito, emite la vocal suelta
      if (!opts.autoInsertIeung) {
        return {
          emit: buildSyllable(syl.cho, syl.jung, 0) + JUNG_CHARS[jungIdx],
          syl: emptySyl(),
        };
      }

      // comportamiento original
      return {
        emit: buildSyllable(syl.cho, syl.jung, 0),
        syl: { cho: 11, jung: jungIdx, jong: null },
      };
    }

    // Have cho+jung+jong → jong becomes cho of new syllable
    let prevJong = 0;
    let newCho = syl.jong;

    if (SPLIT_JONG[syl.jong]) {
      [prevJong, newCho] = SPLIT_JONG[syl.jong];
    } else {
      newCho = JONG_TO_CHO[syl.jong] ?? 11;
    }

    return {
      emit: buildSyllable(syl.cho, syl.jung, prevJong),
      syl: { cho: newCho, jung: jungIdx, jong: null },
    };
  },

  _onConsonant(entry, syl) {
    const choIdx  = entry.cho;
    const jongIdx = entry.jong;

    // Empty → start new syllable as cho
    if (syl.cho === null) {
      return { emit: '', syl: { cho: choIdx, jung: null, jong: null } };
    }

    // Have cho only (no jung) → flush standalone jamo, start new
    if (syl.jung === null) {
      return {
        emit: CHO_CHARS[syl.cho],
        syl:  { cho: choIdx, jung: null, jong: null },
      };
    }

    // Have cho+jung, no jong → try to attach as jong
    if (syl.jong === null) {
      if (jongIdx > 0) {
        return { emit: '', syl: { cho: syl.cho, jung: syl.jung, jong: jongIdx } };
      }
      // Cannot be jong → flush, start new cho
      return {
        emit: buildSyllable(syl.cho, syl.jung, 0),
        syl:  { cho: choIdx, jung: null, jong: null },
      };
    }

    // Have cho+jung+jong → try compound jong
    const ck = `${syl.jong}+${jongIdx}`;
    if (jongIdx > 0 && COMPOUND_JONG[ck] !== undefined) {
      return { emit: '', syl: { cho: syl.cho, jung: syl.jung, jong: COMPOUND_JONG[ck] } };
    }

    // Cannot compound → flush current syllable, start new
    return {
      emit: buildSyllable(syl.cho, syl.jung, syl.jong),
      syl:  { cho: choIdx, jung: null, jong: null },
    };
  },

  _flush(syl) {
    if (syl.cho === null) return '';
    if (syl.jung === null) return CHO_CHARS[syl.cho] ?? '';
    return buildSyllable(syl.cho, syl.jung, syl.jong ?? 0);
  },
};

// ── General utilities ─────────────────────────

const SYLLABLE_START    = 0xAC00;
const SYLLABLE_END      = 0xD7A3;
const COMPAT_JAMO_START = 0x3130;
const COMPAT_JAMO_END   = 0x318F;

const Hangul = {
  ime: HangulIME,

  isSyllable(char) {
    const cp = char?.codePointAt(0) ?? 0;
    return cp >= SYLLABLE_START && cp <= SYLLABLE_END;
  },

  isJamo(char) {
    const cp = char?.codePointAt(0) ?? 0;
    return cp >= COMPAT_JAMO_START && cp <= COMPAT_JAMO_END;
  },

  isHangul(char) {
    return this.isSyllable(char) || this.isJamo(char);
  },

  normalize(str) {
    return (str ?? '').trim().replace(/\s+/g, ' ');
  },
};

export default Hangul;
