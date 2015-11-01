---
author: admin
comments: true
date: 2011-07-09 06:59:32+00:00
layout: post
slug: removing-file-extensions
title: Removing file extensions
wordpress_id: 335
categories:
- Hacks
- Tutorials
tags:
- Automate
- Batch File
- Script
---

A problem I've faced quite a few times is having a folder full of files with a padded extension that needs to be removed before I can use the files. This often happens because I have uTorrent set up for having the extension ".!ut" for files which are not downloaded.

For reasons I cannot comprehend, sometimes on old torrents, files are all marked with that extension even though I know they are completed. It's easy to rename all files when there are 10 of them. For torrents with 100+ files, it gets a lot more tedious.

In comes my laziness! Let's write a batch file to rename files for me. :) Reusability++; Folks in a similar dilemma can try this batch file.


<blockquote>for /f "delims==" %%F in ('dir /b *.**!ut**') do ren "%%~nxF" "%%~nF"</blockquote>


No inputs required. Paste this line in notepad and save it as a .bat file (not a .txt file :) though you might be tempted to do so :P). Double click the batch file and voila! All files will have !ut removed from their extension.
