#!/bin/bash

echo "========================================"
echo "🚀 Starting Digital Multiplex"
echo "========================================"

echo ""
echo "Starting LibreTranslate server..."
echo "This will use Docker. Make sure Docker Desktop is running."

# Run Docker container in the background
docker run --rm -d -p 5001:5000 -v "$(pwd)/lt_models":/home/libretranslate/.local libretranslate/libretranslate --load-only en,hi,es,fr,de,zh,ja,ko,pt,ru,it

echo "Waiting for LibreTranslate to start..."
echo "(It may take a few minutes to download models on the first run)"
sleep 15

echo ""
echo "Starting Digital Multiplex app..."
export FLASK_APP=run.py
flask run &

echo ""
echo "✅ Digital Multiplex is starting!"
echo "📱 Open: http://localhost:5000"
echo "🌐 Translation: http://localhost:5001"
echo ""
echo "Use 'fg' to bring the Flask app to the foreground or 'kill %1' to stop it."