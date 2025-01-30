#!/bin/bash

set -eux;

PROJECT_DIRECTORY="$(dirname "$0")";
DESTINATION_DIRECTORY="$PROJECT_DIRECTORY/dist/";

USER_ID="$(id -u)";
GROUP_ID="$(id -g)";

DOCKER_COMPOSE="docker compose";
if which docker-compose ; then
  DOCKER_COMPOSE="docker-compose";
fi
DOCKER_COMPOSE="sudo USER_ID=$USER_ID GROUP_ID=$GROUP_ID $DOCKER_COMPOSE";

if ! test -d "$DESTINATION_DIRECTORY"; then
  mkdir "$DESTINATION_DIRECTORY";
fi

$DOCKER_COMPOSE pull;
$DOCKER_COMPOSE run --rm --build upgrader;
$DOCKER_COMPOSE run --rm --build node npm i;
$DOCKER_COMPOSE run --rm --build node npx gulp;
$DOCKER_COMPOSE run --rm --build node npx electron-builder;
