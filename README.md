# Ramblings of a Coder's Mind (Source)

Source for the "Ramblings of a Coder's Mind" blog that's hosted at [blog.karun.me](https://blog.karun.me) (previously [karunab.com](https://karunab.com))

## Local development

```
docker run --rm -p 4000:4000 --volume="$PWD:/srv/jekyll" --volume "$PWD/vendor:/usr/local/bundle" -it jekyll/jekyll:3.8 bundle install
docker run --rm -p 4000:4000 --volume="$PWD:/srv/jekyll" --volume "$PWD/vendor:/usr/local/bundle" -it jekyll/jekyll:3.8 jekyll serve --watch
```

Delete `vendor/` if you want to reset the gems in your environment
