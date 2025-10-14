#!/usr/bin/env bash

set -e  # stop if any command fails

# Define green color
GREEN='\033[0;32m'
NC='\033[0m' # No Color

green_echo() {
  echo -e "${GREEN}$1${NC}"
}

green_echo "🔹 Activating Virtual Environment..."
source venv/bin/activate

green_echo "🔹 Stopping Kolibri..."
kolibri stop || true

green_echo "🔹 Installing Python dependencies..."
pip install beautifulsoup4

green_echo "🔹 Increase Node heap memory limit to 4GB..."
if ! grep -q 'NODE_OPTIONS="--max-old-space-size=4096"' Makefile; then
  sed -i 's|yarn run build|NODE_OPTIONS="--max-old-space-size=4096" yarn run build|' Makefile
  green_echo "✅ Makefile updated."
else
  green_echo "ℹ️  Makefile already contains NODE_OPTIONS — no changes made."
fi

green_echo "🔹 Generating .whl file..."
make dist SKIP_PY_CHECK=1

green_echo "✅ .whl file generated!"
