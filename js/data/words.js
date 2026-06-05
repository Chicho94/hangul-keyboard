/**
 * data/words.js
 * ─────────────────────────────────────────────
 * Korean words for writing practice.
 * Schema: { id, target, hint, meaning, difficulty }
 *
 * 'hint' is a romanization aid (not enforced, shown as hint).
 * 'meaning' is English gloss for context.
 */

export const words = [
  // ── Difficulty 1: Basic nouns & greetings ──
  { id: 'w-01', target: '물',   hint: 'mul',       meaning: 'water',    difficulty: 1 },
  { id: 'w-02', target: '불',   hint: 'bul',       meaning: 'fire',     difficulty: 1 },
  { id: 'w-03', target: '산',   hint: 'san',       meaning: 'mountain', difficulty: 1 },
  { id: 'w-04', target: '달',   hint: 'dal',       meaning: 'moon',     difficulty: 1 },
  { id: 'w-05', target: '별',   hint: 'byeol',     meaning: 'star',     difficulty: 1 },
  { id: 'w-06', target: '바람', hint: 'baram',     meaning: 'wind',     difficulty: 1 },
  { id: 'w-07', target: '하늘', hint: 'haneul',    meaning: 'sky',      difficulty: 1 },
  { id: 'w-08', target: '나무', hint: 'namu',      meaning: 'tree',     difficulty: 1 },
  { id: 'w-09', target: '꽃',   hint: 'kkot',      meaning: 'flower',   difficulty: 1 },
  { id: 'w-10', target: '눈',   hint: 'nun',       meaning: 'eye/snow', difficulty: 1 },
  { id: 'w-11', target: '손',   hint: 'son',       meaning: 'hand',     difficulty: 1 },
  { id: 'w-12', target: '발',   hint: 'bal',       meaning: 'foot',     difficulty: 1 },
  { id: 'w-13', target: '집',   hint: 'jip',       meaning: 'house',    difficulty: 1 },
  { id: 'w-14', target: '책',   hint: 'chaek',     meaning: 'book',     difficulty: 1 },
  { id: 'w-15', target: '밥',   hint: 'bap',       meaning: 'rice/meal',difficulty: 1 },

  // ── Difficulty 2: Common vocabulary ──
  { id: 'w-16', target: '사람', hint: 'saram',     meaning: 'person',   difficulty: 2 },
  { id: 'w-17', target: '학교', hint: 'hakgyo',    meaning: 'school',   difficulty: 2 },
  { id: 'w-18', target: '음악', hint: 'eumak',     meaning: 'music',    difficulty: 2 },
  { id: 'w-19', target: '공부', hint: 'gongbu',    meaning: 'studying', difficulty: 2 },
  { id: 'w-20', target: '친구', hint: 'chingu',    meaning: 'friend',   difficulty: 2 },
  { id: 'w-21', target: '사랑', hint: 'sarang',    meaning: 'love',     difficulty: 2 },
  { id: 'w-22', target: '행복', hint: 'haengbok',  meaning: 'happiness',difficulty: 2 },
  { id: 'w-23', target: '음식', hint: 'eumsik',    meaning: 'food',     difficulty: 2 },
  { id: 'w-24', target: '영화', hint: 'yeonghwa',  meaning: 'movie',    difficulty: 2 },
  { id: 'w-25', target: '도서관',hint: 'doseogwan', meaning: 'library', difficulty: 2 },

  // ── Difficulty 3: More complex words ──
  { id: 'w-26', target: '컴퓨터', hint: 'keompyuteo', meaning: 'computer',    difficulty: 3 },
  { id: 'w-27', target: '대학교', hint: 'daehakgyo',  meaning: 'university',  difficulty: 3 },
  { id: 'w-28', target: '비행기', hint: 'bihaenggi',  meaning: 'airplane',    difficulty: 3 },
  { id: 'w-29', target: '아름답다',hint: 'areumdapda', meaning: 'to be beautiful', difficulty: 3 },
  { id: 'w-30', target: '재미있다',hint: 'jaemiitda',  meaning: 'to be fun',   difficulty: 3 },
];
