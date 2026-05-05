#!/usr/bin/env bash
set -euo pipefail

SERVICE_NAME=${SERVICE_NAME:-frontend}
COMPOSE_FILE=${COMPOSE_FILE:-docker-compose.yml}
APP_DIR=${APP_DIR:-/workspace/shared/public/mvppgf/frontend-uc-prn-prd}
CONTAINER_NAME=${CONTAINER_NAME:-frontend-mvp}
IMAGE_REF=${FRONTEND_IMAGE:-}
HEALTHCHECK_URL=${HEALTHCHECK_URL:-}
IMAGE_CLEANUP=${IMAGE_CLEANUP:-true}
REGISTRY=${REGISTRY:-ghcr.io}
REGISTRY_USER=${REGISTRY_USER:-}
REGISTRY_TOKEN=${REGISTRY_TOKEN:-}

if [ -z "$IMAGE_REF" ]; then
  echo "FRONTEND_IMAGE is required"
  exit 1
fi

cd "$APP_DIR"

if [ -n "$REGISTRY_USER" ] && [ -n "$REGISTRY_TOKEN" ]; then
  echo "$REGISTRY_TOKEN" | docker login "$REGISTRY" -u "$REGISTRY_USER" --password-stdin
fi

prev_image=""
if docker ps -a --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
  prev_image=$(docker inspect --format '{{.Config.Image}}' "$CONTAINER_NAME" || true)
fi

export FRONTEND_IMAGE="$IMAGE_REF"

docker compose -f "$COMPOSE_FILE" pull "$SERVICE_NAME"
docker compose -f "$COMPOSE_FILE" up -d "$SERVICE_NAME"

if [ -n "$HEALTHCHECK_URL" ]; then
  if ! curl -fsS --max-time 5 "$HEALTHCHECK_URL" >/dev/null; then
    echo "Healthcheck failed: $HEALTHCHECK_URL"
    if [ -n "$prev_image" ]; then
      export FRONTEND_IMAGE="$prev_image"
      docker compose -f "$COMPOSE_FILE" up -d "$SERVICE_NAME"
    fi
    exit 1
  fi
fi

if [ "$IMAGE_CLEANUP" = "true" ]; then
  docker image prune -f --filter "until=168h"
fi
