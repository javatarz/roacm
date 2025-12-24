---
author: Karun Japhet
comments: true
date: 2009-12-07 14:43:05+00:00
layout: post
slug: playing-videos-in-rar-archives
title: Playing videos in RAR archives
description: "Play videos directly from RAR archives without extraction. RARFileSource DirectShow filter enables streaming from multi-part RAR files."
wordpress_id: 281
category: Developer Experience
tags:
  - tools
  - troubleshooting
---

Large video files are sometimes distributed in multi-part RAR archives. This can happen with video downloads, backups, or files shared across services with size limits. In such cases, you're left with RAR files that you have to extract every time you want to play them.

Some video players like [VLC](http://www.videolan.org/vlc/) and [XBMC](http://xbmc.org/) came up with a solution. On the fly extraction of multi-part archives to play videos. Not all players support this though. Just recently, I came across something that can solve this problem. You can now use [RARFileSource](http://www.v12pwr.com/RARFileSource/) to get your favourite video player to read videos in RAR files and play them.  RARFileSource is a DirectShow filter which let's most video players read RAR files on the fly. The only restriction is that the video should not be compressed. Thankfully, this is the scene norm so you need not worry. Just install the application (117 KB) and drag drop a RAR archive on to your favourite video player. Works fine with [MPC: HC](http://mpc-hc.sourceforge.net/) for me and [WMP](http://www.microsoft.com/windows/windowsmedia/player/) for [dt](http://blog.thedt.net) (who suggested this to me).


