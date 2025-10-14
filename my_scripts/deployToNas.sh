#!/bin/bash

set -e  # stop if any command fails

GREEN='\033[0;32m'
NC='\033[0m' # No Color

green_echo() {
  echo -e "${GREEN}$1${NC}"
}

NAS_USER="EduNetAdmin"
NAS_HOST="10.0.0.111"
NAS_SCRIPT_PATH="/volume1/kolibri/kolibri/my_scripts/startKolibriOnNas.sh"

green_echo "🔹 Activating Virtual Environment..."
source venv/bin/activate

green_echo "🔹 Stopping Kolibri..."
kolibri stop || true

green_echo "🔹 Cleaning environment..."
make clean

green_echo "🔹 Running generateWhl.sh..."
./my_scripts/generateWhl.sh

green_echo "🔹 Running sendWhlToNas.sh..."
./my_scripts/sendWhlToNas.sh

green_echo "🔹 Running startKolibriOnNas.sh via ssh on NAS..."
ssh "$NAS_USER@$NAS_HOST" "bash $NAS_SCRIPT_PATH"

green_echo "✅ Deployment finished! Kolibri has been started on NAS."