#!/bin/sh

set -e
set -x

docker build -t local-jekyll .
docker run --rm -p 4000:4000 -v $(pwd):/srv/jekyll --user $(id -u):$(id -g) local-jekyll jekyll serve --host 0.0.0.0 --watch --incremental --force-polling
