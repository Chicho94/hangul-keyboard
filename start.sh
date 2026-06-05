#!/usr/bin/env bash
# ─────────────────────────────────────────────
# start.sh — Hangul Practice local server
# Detects available tools and starts HTTP server.
# Usage: bash start.sh
# ─────────────────────────────────────────────

PORT=3000
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

open_browser() {
  local url="http://localhost:$PORT"
  echo ""
  echo "  ✦ App ready → $url"
  echo "  Press Ctrl+C to stop."
  echo ""
  # Try to open browser automatically
  if command -v open    &>/dev/null; then open    "$url"; fi  # macOS
  if command -v xdg-open &>/dev/null; then xdg-open "$url"; fi  # Linux
  # Windows Git Bash / WSL
  if command -v start   &>/dev/null; then start   "$url"; fi
}

echo ""
echo "  한글 연습 — Hangul Practice"
echo "  Starting local server on port $PORT..."
echo ""

# 1. npx serve (Node.js)
if command -v npx &>/dev/null; then
  echo "  Using: npx serve"
  open_browser
  npx serve "$DIR" --listen "$PORT" --no-clipboard
  exit 0
fi

# 2. Python 3
if command -v python3 &>/dev/null; then
  echo "  Using: python3 http.server"
  open_browser
  python3 -m http.server "$PORT" --directory "$DIR"
  exit 0
fi

# 3. Python 2 fallback
if command -v python &>/dev/null; then
  echo "  Using: python SimpleHTTPServer"
  open_browser
  cd "$DIR" && python -m SimpleHTTPServer "$PORT"
  exit 0
fi

# 4. PHP built-in server
if command -v php &>/dev/null; then
  echo "  Using: php -S"
  open_browser
  php -S "localhost:$PORT" -t "$DIR"
  exit 0
fi

# Nothing found
echo "  ✗ No server found. Install one of:"
echo ""
echo "    Node.js  → https://nodejs.org  (then run: npm start)"
echo "    Python 3 → https://python.org  (then run: python3 -m http.server 3000)"
echo ""
exit 1
