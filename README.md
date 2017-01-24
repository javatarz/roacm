# Ramblings of a Coder's Mind (Source)

[![Build Status](https://snap-ci.com/JAnderton/roacm/branch/master/build_image)](https://snap-ci.com/JAnderton/roacm/branch/master)

Source for the "Ramblings of a Coder's Mind" blog that's hosted at blog.karun.me (previously karunab.com)

## Local Preview

The project supports vagrant to start-up octopress locally.

You can provision a local image with `vagrant up && vagrant ssh`. Login to the box with `vagrant ssh` and go to the blog content at `cd /vagrant`. Jekyll should then allow you to serve the content with `jekyll s` and you should be able to read your blog [on your browser](http://localhost:9000).
