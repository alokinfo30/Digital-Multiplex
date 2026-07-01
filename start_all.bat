@echo off
echo ========================================
echo 🚀 Starting Digital Multiplex
echo ========================================

echo.
echo Starting LibreTranslate server...
echo This will use Docker. Make sure Docker Desktop is running.
start "LibreTranslate Docker" docker run --rm -p 5001:5000 -v "%cd%\lt_models":/home/libretranslate/.local libretranslate/libretranslate --load-only en,hi,es,fr,de,zh,ja,ko,pt,ru,it

echo Waiting for LibreTranslate to start...
echo (It may take a few minutes to download models on the first run)
timeout /t 15 /nobreak

echo.
echo Starting Digital Multiplex app...
set FLASK_APP=run.py
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