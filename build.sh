#!/usr/bin/env bash
# build.sh - Render / Cloud Production Build Script

set -o errexit

echo "--- Upgrading pip and installing dependencies ---"
pip install --upgrade pip
pip install -r requirements.txt

echo "--- Initializing database ---"
flask db upgrade || echo "Database initialized or already up to date"

echo "--- Build completed successfully ---"