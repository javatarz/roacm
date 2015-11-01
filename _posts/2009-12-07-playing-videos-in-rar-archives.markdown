---
author: admin
comments: true
date: 2009-12-07 14:43:05+00:00
layout: post
slug: playing-videos-in-rar-archives
title: Playing videos in RAR archives
wordpress_id: 281
categories:
- Tutorials
tags:
- DirectShow
- MPC
- On-The-Fly
- RAR
- Video
---

A lot of people today download videos (TV shows and movies) off the internet using torrents or Usenet. Most sources pack the videos in multi-part RAR archives to minimize loss in case of error prone transfer. Though this does not make much sense usually on protocols such as the bittorrent protocol but it does on the [scene](http://en.wikipedia.org/wiki/Warez_scene) where data is transferred using FTP. In such cases, you are left with a lot of rar files that you have to keep (if you're seeding on trackers) and extract every time you want to play them.

Some video players like [VLC](http://www.videolan.org/vlc/) and [XBMC](http://xbmc.org/) came up with a solution. On the fly extraction of multi-part archives to play videos. Not all players support this though. Just recently, I came across something that can solve this problem. You can now use [RARFileSource](http://www.v12pwr.com/RARFileSource/) to get your favourite video player to read videos in RAR files and play them.Â  RARFileSource is a DirectShow filter which let's most video players read RAR files on the fly. The only restriction is that the video should not be compressed. Thankfully, this is the scene norm so you need not worry. Just install the application (117 KB) and drag drop a RAR archive on to your favourite video player. Works fine with [MPC: HC](http://mpc-hc.sourceforge.net/) for me and [WMP](http://www.microsoft.com/windows/windowsmedia/player/) for [dt](http://blog.thedt.net) (who suggested this to me).

Now you can seed your files and play them from the RAR archives directly only extracting them when you need to give them to someone else ;) Cool, eh? :D
