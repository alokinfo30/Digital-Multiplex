@echo off
echo Stopping LibreTranslate server...
taskkill /F /IM python.exe /FI "WINDOWTITLE eq LibreTranslate*"
echo Server stopped.
pause