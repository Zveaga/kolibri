#!/usr/bin/env bash

set -e  # stop if any command fails

green_echo() {
  echo -e "${GREEN}$1${NC}"
}

green_echo "🔹 Creating Virtual Environment..."
python3 -m venv venv

green_echo "🔹 Activating Virtual Environment..."
source venv/bin/activate

green_echo "🔹 Installing Python dependencies..."
pip install --upgrade -r requirements.txt
pip install --upgrade -r requirements/dev.txt
pip install -e .
pip install beautifulsoup4

green_echo "🔹 Installing node..."
nodeenv -p --node=20.19.3

green_echo "🔹 Installing yarn..."
npm install -g yarn

green_echo "🔹 Installing other project dependencies..."
yarn install

green_echo "🔹 Increase Node heap memory limit to 4GB..."
if ! grep -q 'NODE_OPTIONS="--max-old-space-size=4096"' Makefile; then
  sed -i 's|yarn run build|NODE_OPTIONS="--max-old-space-size=4096" yarn run build|' Makefile
  green_echo "✅ Makefile updated."
else
  green_echo "ℹ️  Makefile already contains NODE_OPTIONS — no changes made."
fi

green_echo "🔹 Generating .whl file..."
make dist SKIP_PY_CHECK=1

green_echo "✅ Done!"