#!/bin/bash

# APK to AAB Conversion Setup Script
# This script sets up the environment and downloads required tools

set -e  # Exit on error

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
VENV_PATH="/home/nithin/venv"

echo "========================================"
echo "APK to AAB Conversion - Setup"
echo "========================================"

# Check if venv exists
if [ ! -d "$VENV_PATH" ]; then
    echo "✗ Virtual environment not found at $VENV_PATH"
    exit 1
fi

echo "✓ Virtual environment found"

# Activate venv
echo "📦 Activating virtual environment..."
source "$VENV_PATH/bin/activate"

# Install requirements
echo "📥 Installing Python dependencies..."
pip install --upgrade pip > /dev/null 2>&1
pip install -q -r "$SCRIPT_DIR/requirements.txt"

echo "✓ Dependencies installed"

# Download bundletool
echo ""
echo "📥 Setting up bundletool..."
cd "$SCRIPT_DIR"
python download_bundletool.py

# Setup certificates
echo ""
echo "🔐 Setting up certificates..."
python cert_manager.py

echo ""
echo "========================================"
echo "✓ Setup completed successfully!"
echo "========================================"
echo ""
echo "Next steps:"
echo "1. Review keystore credentials in cert_manager.py"
echo "2. Run: python apk_to_aab.py ../iot-marketplace-app.apk"
echo ""
