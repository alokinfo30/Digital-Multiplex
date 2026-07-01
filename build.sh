#!/usr/bin/env bash
# build.sh

# Exit immediately if a command exits with a non-zero status.
set -o errexit

echo "--- Upgrading pip and installing dependencies ---"
pip install --upgrade pip
pip install --only-binary :all: -r requirements.txt

echo "--- Running database migrations ---"
flask db upgrade