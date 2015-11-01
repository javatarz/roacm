---
author: admin
comments: true
date: 2011-07-14 09:04:00+00:00
layout: post
slug: reloading-unixlinux-profiles
title: Reloading Unix/Linux Profiles
wordpress_id: 338
categories:
- Tutorials
tags:
- Linux
- profile
- reload
- tips
- tricks
- unix
---

Here's something small but interesting and useful I learnt today. Often times, I update my linux profile so that I can have aliases to work with on my server. Problem is that the profile is only loaded when you login so, in normal circumstances, you would have to relogin to have your profile loaded. Now that's a pain!

An easier solution (which works at least on bash) is to do this:


source .bash_profile


It's something so simple and yet so powerful! I've heard that for KSH, you would need to simply invoke the profile file name and it would be reloaded. Will need Â test this out for confirmation though :)
