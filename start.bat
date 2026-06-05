@echo off
:: ─────────────────────────────────────────────
:: start.bat — Hangul Practice local server (Windows)
:: ─────────────────────────────────────────────

set PORT=3000
set DIR=%~dp0

echo.
echo   ^^한글 연습 ^— Hangul Practice
echo   Starting local server on port %PORT%...
echo.

:: 1. Try npx (Node.js)
where npx >nul 2>&1
if %ERRORLEVEL% == 0 (
  echo   Using: npx serve
  start http://localhost:%PORT%
  npx serve "%DIR%" --listen %PORT% --no-clipboard
  goto :end
)

:: 2. Try Python 3
where python3 >nul 2>&1
if %ERRORLEVEL% == 0 (
  echo   Using: python3 http.server
  start http://localhost:%PORT%
  python3 -m http.server %PORT% --directory "%DIR%"
  goto :end
)

:: 3. Try Python (could be 2 or 3 on Windows)
where python >nul 2>&1
if %ERRORLEVEL% == 0 (
  echo   Using: python http.server
  start http://localhost:%PORT%
  python -m http.server %PORT% --directory "%DIR%"
  goto :end
)

:: 4. Try PHP
where php >nul 2>&1
if %ERRORLEVEL% == 0 (
  echo   Using: php -S
  start http://localhost:%PORT%
  php -S localhost:%PORT% -t "%DIR%"
  goto :end
)

echo   ERROR: No server found. Install one of:
echo.
echo     Node.js  -^> https://nodejs.org   (then run: npm start)
echo     Python 3 -^> https://python.org   (then run: python -m http.server 3000)
echo.
pause

:end
