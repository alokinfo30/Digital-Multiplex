@echo off
echo ========================================
echo 🚀 Starting Digital Multiplex
echo ========================================

echo.
echo Starting LibreTranslate server...
start "LibreTranslate" libretranslate --host 0.0.0.0 --port 5001 --load-only en,hi,es,fr,de,zh,ja,ko,pt,ru,it

echo Waiting for LibreTranslate to start...
timeout /t 5 /nobreak

echo.
echo Starting Digital Multiplex app...
start "Digital Multiplex" python run.py

echo.
echo ========================================
echo ✅ Digital Multiplex is starting!
echo 📱 Open: http://localhost:5000
echo 🌐 Translation: http://localhost:5001
echo ========================================
echo.
echo Press any key to close this window...
pause > nul