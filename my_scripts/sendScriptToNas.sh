#!/bin/bash

set -e  # stop if any command fails

# Define green color
GREEN='\033[0;32m'
NC='\033[0m' # No Color

green_echo() {
  echo -e "${GREEN}$1${NC}"
}

NAS_USER="EduNetAdmin"
NAS_HOST="10.0.0.111"
NAS_PATH="/volume1/kolibri/kolibri/my_scripts/"
LOCAL_PATH="/home/osboxes/Documents/projects/kolibri/my_scripts/startKolibriOnNas.sh"

green_echo "🔹 Sending files to Nas..."
rsync -av  "$LOCAL_PATH" "$NAS_USER@$NAS_HOST:$NAS_PATH"

green_echo "✅ Done!"
