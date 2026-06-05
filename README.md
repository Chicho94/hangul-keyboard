# 한글 연습 — Hangul Practice

Practice writing Korean (Hangul) with three modes: Letters, Words, and Sentences.

---

## ⚠️ Why you can't just open index.html

The app uses **ES6 modules** (`type="module"`), which browsers block when
opened directly from the filesystem (`file://`) due to CORS security rules.
You need a local HTTP server — takes 30 seconds to set up.

---

## Quick start

### macOS / Linux

```bash
bash start.sh
```

The script auto-detects Node.js, Python 3, Python 2, or PHP — uses whichever
is available and opens your browser automatically.

### Windows

Double-click `start.bat`, or run it in a terminal:

```bat
start.bat
```

### Manual options

**Node.js** (recommended):
```bash
npm start
# or
npx serve . --listen 3000
```

**Python 3:**
```bash
python3 -m http.server 3000
```
Then open → http://localhost:3000

**Python 2:**
```bash
python -m SimpleHTTPServer 3000
```

**VS Code:** Install the *Live Server* extension, right-click `index.html` → *Open with Live Server*.

---

## Project structure

```
hangul-practice/
├── index.html              # Entry point
├── css/
│   ├── base.css            # Reset, variables, typography
│   ├── layout.css          # Screen system, containers
│   └── components.css      # All UI components
└── js/
    ├── main.js             # Bootstrap + event wiring
    ├── state/
    │   └── AppState.js     # Global state + pub/sub
    ├── data/
    │   ├── DataLoader.js   # Data access abstraction
    │   ├── letters.js      # 33 hangul letters + QWERTY map
    │   ├── words.js        # 30 words (3 difficulty levels)
    │   └── sentences.js    # 17 sentences (3 difficulty levels)
    ├── logic/
    │   ├── Validator.js    # Pure validation, no DOM
    │   ├── ExerciseEngine.js # Session, queue, timer
    │   └── ScoreManager.js # Points, streak, accuracy
    ├── ui/
    │   ├── Router.js       # Screen navigation
    │   ├── Renderer.js     # Reactive UI rendering
    │   └── FeedbackDisplay.js # Real-time input feedback
    └── utils/
        ├── dom.js          # DOM helpers
        └── hangul.js       # Hangul character utilities
```

---

## Adding dynamic data (future)

Only `DataLoader.js` needs to change. The interface is already async:

```js
// Current (static):
async getExercises(mode) {
  return [..._registry[mode]];
}

// Future (REST API):
async getExercises(mode) {
  const res = await fetch(`/api/exercises?mode=${mode}`);
  return res.json();
}
```

Nothing else in the codebase changes.

---

## Adding a new mode

1. Create `js/data/mymode.js` — same schema: `{ id, target, hint, difficulty }`
2. Register it in `DataLoader.js` `_registry`
3. Add a button in `index.html` with `data-mode="mymode"`
4. Add a validation case in `Validator.js` if needed
