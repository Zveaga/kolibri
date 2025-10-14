#!/usr/bin/env bash

# NOTE: This script should be run from the root of the Kolibri directory on the NAS.

set -e

# Define green color
GREEN='\033[0;32m'
NC='\033[0m' # No Color

green_echo() {
  echo -e "${GREEN}$1${NC}"
}

NAS_USER="EduNetAdmin"
NAS_HOST="10.0.0.111"
KOLIBRI_HOME_PATH="/volume1/homes/EduNetAdmin/.kolibri"

green_echo "🔹 Activating Virtual Environment..."
source venv/bin/activate

green_echo "🔹 Stopping Kolibri if running..."
kolibri stop || true

green_echo "🔹 Cleaning Virtual Environment..."
deactivate
rm -rf venv

green_echo "🔹 Deleting Kolibri files..."
rm -rf $KOLIBRI_HOME_PATH

green_echo "✅ Deployment environment cleaned!"
