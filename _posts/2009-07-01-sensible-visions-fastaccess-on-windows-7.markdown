---
author: Karun Japhet
comments: true
date: 2009-07-01 08:18:47+00:00
layout: post
slug: sensible-visions-fastaccess-on-windows-7
title: Sensible Vision's FastAccess on Windows 7
wordpress_id: 232
categories:
- Thoughts
tags:
- Biometric
- FastAccess
- Windows 7
- Windows Biometric Foundation
---

Sensible Vision came out with this pretty amazing software called FastAccess that does a decent job at facial recognition. But using it on Windows 7 has given me a few issues so I thought I should just talk about it.

I've been using Windows 7 ever since the first beta was made public. I have been using Sensible Vision's FastAccess on every build I've used so far. Currently, my laptop is on Windows 7 build 7137.

I have 3 major issues with FastAccess.



	
  1. On every boot, it refuses to log me in. But if I logout/lock workstation and return a few times, it starts recognizing me. It seems as though it is not able to store its data and every reboot needs it to be recalibrated (even though there are different texts for the first software boot as opposed to every other time it starts up, it just seems that way).

	
  2. This is not really a Windows 7 specific bug but why can't Sensible Vision start its software **after** the camera boots up? Not doing so seems pointless to me.

	
  3. Fine, you can't bring the camera drivers up the boot order. I think I'll just type in my password if you don't mind. But FastAccess does mind. It actually logs me out 5 seconds after I logged in. I find this **extremely** irritating.


I have tried googling up for Windows 7 support and there seems to be none. In fact, when searching for ["Sensible Vision FastAccess Windows 7" on Google](http://www.google.com/search?q=Sensible+Vision+FastAccess+Windows+7) the second result you see is of this blog :|

First, I'd like to hear feedback from any FastAccess users out there who are on Windows 7.
Second, I'd like Sensible Vision to let its users know about its Windows 7 plans and whether it is planning to use something like the [Windows Biometric Foundation (WBF)](http://www.microsoft.com/whdc/device/input/smartcard/WBFIntro.mspx) (Assuming they are applicable).

**Note:** As far as I've read so far, WBF seems to be for Fingerprint sensors though I'm hoping they might provide support for other kinds of biometric data such as facial recognition. Still looking into things though.
