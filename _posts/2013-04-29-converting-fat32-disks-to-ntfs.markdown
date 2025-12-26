---
author: Karun Japhet
comments: true
date: 2013-04-29 11:50:30+00:00
layout: post
slug: converting-fat32-disks-to-ntfs
title: Converting FAT32 disks to NTFS
description: "Convert FAT32 to NTFS in under 3 seconds without losing data. Simple one-line Windows command for instant filesystem conversion."
wordpress_id: 450
category: Engineering Practices
tags:
  - windows
  - infrastructure
  - tools
---

There used to be a slightly long way to do this earlier but I found a simple one line command to do it. It is probably old but it's one I didn't know of.


<blockquote>convert L: /fs:NTFS</blockquote>


This converts L: to NTFS without removing any data from the drive. This process, all in all, requires less than 3 seconds.
