#!/bin/bash

set -e

echo "🚀 Deploying EmergencyTool..."

cd "$(dirname "$0")/.."

echo "📦 Building Docker images..."
docker-compose build

echo "🐳 Starting services..."
docker-compose up -d

echo "⏳ Waiting for services to be ready..."
sleep 10

echo "✅ Checking health..."
curl -f http://localhost:3000/health || echo "Backend not ready"
curl -f http://localhost:5173 || echo "Frontend not ready"

echo "🎉 Deployment complete!"
echo "Backend: http://localhost:3000"
echo "Frontend: http://localhost:5173"