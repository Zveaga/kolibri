#!/bin/bash

set -e  # stop if any command fails

# Define green color
GREEN='\033[0;32m'
NC='\033[0m' # No Color

green_echo() {
  echo -e "${GREEN}$1${NC}"
}

green_echo "🔹 Moving into Kolibri folder..."
cd /volume1/kolibri/kolibri || exit 1

green_echo "🔹 Remove previous Virtual Environment..."

# Check if venv is activated
if [[ "$VIRTUAL_ENV" == "$(pwd)/venv" ]]; then
    deactivate
fi

# Remove venv directory if it exists
if [ -d "venv" ]; then
    rm -rf venv
fi

green_echo "🔹 Creating Virtual Environment..."
python3 -m venv venv

green_echo "🔹 Activating Virtual Environment..."
source venv/bin/activate

green_echo "🔹 Stopping Kolibri if running..."
kolibri stop || true

green_echo "🔹 Installing Python dependencies..."
# pip install --upgrade pip setuptools wheel
pip install typing_extensions 
pip install backports.zoneinfo

# python -c "import typing_extensions" 2>/dev/null || pip install typing_extensions
# python -c "import zoneinfo" 2>/dev/null || pip install backports.zoneinfo

green_echo "🔹 Installing Kolibri from .whl file..."
pip install ./dist/kolibri-*.whl

green_echo "🔹 Starting Kolibri..."
kolibri start

green_echo "✅ Done!"
