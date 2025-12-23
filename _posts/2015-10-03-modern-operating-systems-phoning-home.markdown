---
author: Karun Japhet
comments: true
date: 2015-10-03 14:22:00+00:00
layout: post
slug: modern-operating-systems-phoning-home
title: Modern Operating Systems Phoning Home
description: "Disable privacy-invasive features in Windows 10 and OS X Yosemite. Step-by-step guide to stop telemetry and data collection on your OS."
wordpress_id: 665
category: Developer Experience
tags:
  - privacy
  - windows
  - mac-os
  - security
---

It seriously irks me when general public operating systems build in default features that send data to their servers without clearly indicating so. Both Microsoft (with Windows 10) and Apple (with Yosemite) have done so. Disabling these features doesn't take long so here's what you need to do.

{{ site.excerpt_separator }}

# Windows 10

There's a [well written reddit page](https://www.reddit.com/r/conspiracy/comments/3fhy27/how_do_disable_all_privacy_leaks_in_windows_10/) by user [hazehk](https://www.reddit.com/user/hazehk) which lists all the setting changes required. Takes around 10-15 minutes to run through them.

If you're a bit lazier, you could [use tools to do it for you](https://www.reddit.com/r/Windows10/comments/3fn46j/i_made_my_own_userfriendly_windows_10_privacy/) if you aren't paranoid about the tools themselves :)

# OS X Yosemite

[Fix my Mac OS X](https://fix-macosx.com/) talks about the simple changes required to alleviate your pain. You could either follow their steps or use their python script. Your choice!

It has only 2 steps so it should take you less than a minute to do both. I actually went as far as to disable Spotlight all together ([remove spotlight shortcut](https://apple.stackexchange.com/questions/177984/how-to-disable-spotlight-for-alfred); [disable spotlight indexing](http://osxdaily.com/2011/12/10/disable-or-enable-spotlight-in-mac-os-x-lion/) causes problems with Alfred because it needs spotlight's cache for application data) and move to [Alfred](http://alfredapp.com) (not the least of which was motivated by the privacy issues..)
