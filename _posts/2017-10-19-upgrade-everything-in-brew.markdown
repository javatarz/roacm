---
layout: post
comments: true
author: Karun Japhet
title: "Upgrade everything in brew"
categories:
  - Tutorials
tags:
  - Brew
  - Mac OS
  - Automation
---
[Homebrew](https://brew.sh/) is a the missing package manager for Mac OS. [Brew cask](https://caskroom.github.io/) extends [Homebrew](https://brew.sh/) and brings its elegance, simplicity, and speed to Mac OS applications and large binaries alike.

If you're using these tools and would like to upgrade all of the applications you have, run the following command.

```bash
brew update && brew upgrade && (brew cask outdated | cut -f 1 -d " " | xargs brew cask reinstall) && brew cleanup && brew cask cleanup
```

{{ site.excerpt_separator }}

## Breaking it down
1. Update brew with information from the latest taps: `brew update`
2. Upgrade apps in brew: `brew upgrade`
3. Update brew cask apps: `brew cask outdated | cut -f 1 -d " " | xargs brew cask reinstall`
  1. Find outdated cask apps: `brew cask outdated`
  2. Cut out the app names: `cut -f 1 -d " "`
  3. Upgrade brew cask apps: `xargs brew cask reinstall`
4. Remove installers for brew apps (to release disk space): `brew cleanup`
5. Remove installers for brew cask apps (to release disk space): `brew cask cleanup`
