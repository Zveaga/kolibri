#!/usr/bin/env bash

set -e  # stop if any command fails

# Define green color
GREEN='\033[0;32m'
NC='\033[0m' # No Color

green_echo() {
  echo -e "${GREEN}$1${NC}"
}

NAS_USER="EduNetAdmin"
NAS_HOST="10.0.0.111"
NAS_PATH="/volume1/kolibri/kolibri/dist/"
LOCAL_PATH="/home/osboxes/Documents/projects/kolibri/dist/"

green_echo "🔹 Sending files to Nas..."
rsync -av  "$LOCAL_PATH"/*.whl "$NAS_USER@$NAS_HOST:$NAS_PATH"

green_echo "✅ .whl file sent to NAS!"
