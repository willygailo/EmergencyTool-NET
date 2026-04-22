#!/bin/bash

set -e

echo "🔄 Rolling back to previous version..."

cd "$(dirname "$0")/.."

if [ -f ".docker/previous-image" ]; then
  PREVIOUS_IMAGE=$(cat .docker/previous-image)
  echo " Rolling back to: $PREVIOUS_IMAGE"
  docker-compose down
  echo $PREVIOUS_IMAGE > .docker/current-image
  docker-compose up -d
  echo "✅ Rollback complete!"
else
  echo "❌ No previous version found"
  exit 1
fi