---
author: Karun Japhet
comments: true
date: 2014-10-02 07:02:51+00:00
layout: post
slug: desktoppr-downloader
title: Desktoppr Downloader v1.0
description: "Automatically download high-resolution wallpapers from Desktoppr API. Python script filters images by resolution and aspect ratio for your desktop."
wordpress_id: 582
category: Platform Engineering
tags:
  - python
  - api
  - open-source
  - automation
---

I recently found [Desktoppr](https://www.desktoppr.co), a service which has an insane number of curated wallpapers. What's even better is that they come with [an easy to consume API](https://www.desktoppr.co/api#wallpapers).

To fulfil my insatiable need for good high resolution wallpapers, I wrote a script to go through the thousands of pages of images they have, find the ones that are "right for my desktop" and download them. I define "right for my desktop" as being at least the same resolution as mine and if higher then the same aspect ratio. If your's is the same, feel free to use this script to download tons of wallpapers.

**[Desktoppr Downloader is now available on GitHub](https://github.com/javatarz/desktoppr-downloader)**

TODOs:



	
  * Read Resolution for machine

	
  * Support Multiple Monitors

	
  * Make program initialization interactive/parameter based

	
  * Image duplication is decided by file name. Attempt to use file hashes for this (I've contacted the Desktoppr team to check if this can be added in the API)


_Update:_ ~~The Desktoppr Downloader project now has it's own page!~~

_Update 2:_ The destoppr downloader page no longer exists. The code is still accessible from [Github](https://github.com/javatarz/desktoppr-downloader).
