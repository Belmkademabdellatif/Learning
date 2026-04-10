#!/bin/sh
set -e

# Start Docker daemon in background
dockerd &

# Wait for Docker daemon to be ready
until docker info > /dev/null 2>&1; do
  echo "Waiting for Docker daemon..."
  sleep 1
done

echo "Docker daemon ready. Pre-pulling execution images..."

docker pull node:18-alpine
docker pull node:22-alpine
docker pull python:3.11-alpine

echo "All execution images ready."

# Keep container running
wait
