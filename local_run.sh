#!/bin/sh

set -e
set -x

COLIMA_STATUS=$(colima status --json 2>/dev/null || echo '{}')
COLIMA_RUNNING=$(echo "$COLIMA_STATUS" | grep -q '"status": *"Running"' && echo 1 || echo 0)

if [ "$COLIMA_RUNNING" -eq 1 ]; then
    echo "Colima is running."
else
    echo "Starting Colima."
    colima start --arch x86_64
fi

docker build --platform linux/amd64 -t local-jekyll .
docker run --rm --platform linux/amd64 -p 4000:4000 -v $(pwd):/srv/jekyll --user $(id -u):$(id -g) local-jekyll jekyll serve --host 0.0.0.0 --watch --incremental --force-polling
