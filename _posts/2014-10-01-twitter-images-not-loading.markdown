---
author: Karun Japhet
comments: true
date: 2014-10-01 13:40:37+00:00
layout: post
slug: twitter-images-not-loading
title: Twitter Images Not Loading
description: "Fix Twitter images not loading by switching to Google DNS. Simple DNS change resolves ISP blocking issues and website accessibility problems."
wordpress_id: 580
category: Tech Reviews
tags:
  - infrastructure
  - troubleshooting
---

I recently moved to Pune and of course to a new ISP (Tata Telecommunications in Pune). For strange reasons, images on Twitter wouldn't load. Also, certain other websites weren't visible. Simple enough fix was to ensure I wasn't using Tata's DNS' but [Google's](https://developers.google.com/speed/public-dns/).

If you have a 2 level setup (Devices -> WiFi Router -> DSL Modem) like I have here which is something even I'm new too, you should probably need it the DNS on one of the routers (logically would be preferred to be on the DSL Modem). Safe side, do it on both :p

Google DNS is win :)
