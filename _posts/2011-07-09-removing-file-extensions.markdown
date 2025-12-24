---
author: Karun Japhet
comments: true
date: 2011-07-09 06:59:32+00:00
layout: post
slug: removing-file-extensions
title: Removing file extensions
description: "Batch remove file extensions from 100+ files with one command. Windows batch script solution for stripping .tmp, .bak, and padded extensions."
wordpress_id: 335
category: Developer Experience
tags:
  - windows
  - productivity
---

A problem I've faced quite a few times is having a folder full of files with a padded extension that needs to be removed before I can use the files. This can happen with `.tmp`, `.bak`, or other temporary extensions added by various applications.

It's easy to rename all files when there are 10 of them. For folders with 100+ files, it gets a lot more tedious.

In comes my laziness! Let's write a batch file to rename files for me. :) Reusability++; Folks in a similar dilemma can try this batch file.


<blockquote>for /f "delims==" %%F in ('dir /b *.tmp') do ren "%%~nxF" "%%~nF"</blockquote>


No inputs required. Paste this line in notepad and save it as a .bat file (not a .txt file :) though you might be tempted to do so :P). Double click the batch file and voila! All files will have the extra extension removed. Replace `.tmp` in the command with whatever extension you need to strip.
