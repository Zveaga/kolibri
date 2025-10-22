#!/usr/bin/env bash

set -e  # stop if any command fails

# Define green color
GREEN='\033[0;32m'
NC='\033[0m' # No Color

green_echo() {
  echo -e "${GREEN}$1${NC}"
}

green_echo "🔹 Initialize Git Large File Storage..."
git lfs install

green_echo "🔹 Creating Virtual Environment..."
python3 -m venv venv

green_echo "🔹 Activating Virtual Environment..."
source venv/bin/activate

green_echo "🔹 Installing Python dependencies..."
pip install --upgrade -r requirements.txt
pip install --upgrade -r requirements/dev.txt
pip install -e .

green_echo "🔹 Installing node..."
nodeenv -p --node=20.19.3

green_echo "🔹 Installing yarn..."
npm install -g yarn

green_echo "🔹 Installing build-essential package..."
sudo apt install build-essential

green_echo "🔹 Installing other project dependencies..."
yarn install

green_echo "🔹 Initialize Kolibri database..."
kolibri manage migrate

green_echo "✅ Done!"
green_echo "You can start the server by running: yarn run devserver"