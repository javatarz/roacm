---
author: Karun Japhet
comments: true
date: 2011-08-15 19:30:42+00:00
layout: post
slug: fix-for-chrome-redirecting-to-url-when-opening-a-new-tab
title: Fix for Chrome redirecting to URL when opening a new tab
wordpress_id: 397
categories:
- Hacks
- Tutorials
tags:
- chrome
- fix
- hacked
- solution
- trojan
- virus
---

I was helping a friend fix his hacked site when I had to disable ESET to check where his injected code was (because the website ran an img iframe hack to download a trojan on the user's machines). I found the issue and told him what to do but had my own machine infected in the mean while :(

Chrome kept redirecting me to his website when I opened a new tab (which thankfully Chrome kept warning me was a malicious page). If I kept a tab open with his site, it wouldn't redirect me again. The problem was localized to Chrome only so it was a browser based problem.

Simple fix, clear cache and clear old plug-in data. Voila! ;)
