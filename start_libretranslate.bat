@echo off
echo ========================================
echo Starting LibreTranslate Server
echo ========================================
echo.
echo 📚 Loading language models...
echo This may take a few minutes on first run.
echo.

REM Start the LibreTranslate server with only needed languages
start /B libretranslate --host 0.0.0.0 --port 5001 --load-only en,hi,es,fr,de,zh,ja,ko,pt,ru,it

echo.
echo ✅ LibreTranslate server starting on: http://localhost:5001
echo.
echo Press any key to continue...
pause > nul