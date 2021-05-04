# Ramblings of a Coder's Mind (Source)

Source for the "Ramblings of a Coder's Mind" blog that's hosted at [blog.karun.me](https://blog.karun.me) (previously [karunab.com](https://karunab.com))

[![Build Status](https://travis-ci.org/javatarz/roacm.svg?branch=master)](https://travis-ci.org/javatarz/roacm)

## Local development

`JEKYLL_VERSION=3.8 docker run --rm -p 4000:4000 --volume="$PWD:/srv/jekyll" -it jekyll/jekyll:$JEKYLL_VERSION jekyll serve --watch`
