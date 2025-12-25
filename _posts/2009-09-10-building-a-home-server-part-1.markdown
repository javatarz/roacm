---
author: Karun Japhet
comments: true
date: 2009-09-10 18:49:29+00:00
layout: post
slug: building-a-home-server-part-1
title: 'Building a Home Server: Part 1'
description: "Build your own NAS home server from old hardware. Compare Windows Home Server, Ubuntu, and FreeNAS for centralized storage solutions."
wordpress_id: 240
category: Device Hacks
tags:
  - infrastructure
  - linux
---

The first question in your head would be **"Why the world do I need a Home Server?"**

Good question. I'd like to ask you a couple of things. Do you have multiple machines in your house? Do you ever feel like you should have centralized storage in your house? Do you have old hardware simply lying around the house waiting to be tinkered with? Do you like playing with your machines?

If you said yes to (most) of the above questions, having a Home Server could help you :) It can handle not only centralized storage of media and documents but also backups. Have you ever needed a file from _computer x_ in your house and found it was shut down after being used by a family member? Well, you wouldn't have this issue if you had a central server. People could go around switching off their machines all they want as long as you have the file you want on your Storage Server.

Lets get into it then. From now, I'll walk you through how to make your old machine into a [Network Attached Server (NAS)](http://en.wikipedia.org/wiki/Network-attached_storage).

{{ site.excerpt_separator }}


### _1) Hardware_


Any hardware is fine for a Home Server. The main purpose (at least in this case) is central file storage for all devices and this doesn't require much resources on the processing side. Lets start with the specifications of this machine:
<table width="436" border="1" >
<tbody >
<tr >

<td width="63" >CPU
</td>

<td width="371" >Pentium 4; 3.06 GHz; 512MB Cache; 533 MT/s
</td>
</tr>
<tr >

<td width="63" >Motherboard
</td>

<td width="371" >MSI 865 Chipset motherboard; 2xIDE + 1xSATA controllers
</td>
</tr>
<tr >

<td width="63" >RAM
</td>

<td width="371" >2x512MB DDR1 @ 400MHz
</td>
</tr>
<tr >

<td width="63" >GPU
</td>

<td width="371" >NViDIA GeForce 5300 with 256MB GDDR RAM
</td>
</tr>
</tbody></table>
Now that is a pretty good processor for this purpose, I agree. You should be fine using a Celeron or even a Pentium 3.


### _2) Operating System_


The next important question is the choice of operating systems. To answer these, you need to look at your usage of the server.
<table width="988" border="1" >
<tbody >
<tr >

<td width="162" >


**Operating System**



</td>

<td width="416" >


**Advantages**



</td>

<td width="408" >


**Disadvantages**



</td>
</tr>
<tr >

<td width="162" >Windows Server 2003
</td>

<td width="416" >Lighter than other WinServers
</td>

<td width="408" >Already 6 years into the product cycle
</td>
</tr>
<tr >

<td width="162" >Windows Server 2008
</td>

<td width="416" >Handles advanced requirements
</td>

<td width="408" >Requires lot of resources; Requires lots of effort to set up
</td>
</tr>
<tr >

<td width="162" >Windows Server 2008 R2
</td>

<td width="416" >Latest WinServer OS; Handles advanced requirements
</td>

<td width="408" >Requires x64 or x86-64 processors
</td>
</tr>
<tr >

<td width="162" >Windows Home Server
</td>

<td width="416" >Supports headless mode; Easy NAS setup; Handles Windows Backups; Integrates well with Windows Media Center across the network
</td>

<td width="408" >Horrible Setup; Requires PP3 for Win7 support (still in beta; available on Microsoft [Connect](http://connect.microsoft.com/)); Requires at least 80GB on primary drive.
</td>
</tr>
<tr >

<td width="162" >Ubuntu/Xubuntu
</td>

<td width="416" >Medium/Light weight; Free; Multipurpose
</td>

<td width="408" >Would require some effort to set up
</td>
</tr>
<tr >

<td width="162" >FreeNAS
</td>

<td width="416" >Light weight; Free; Fast; Made for NAS; Made for headless mode; Small size; Web GUI; Supports multiple protocols
</td>

<td width="408" >Isn't easy to customize beyond packages provided already
</td>
</tr>
</tbody></table>
I really wanted to run Windows Server 2008 R2 but since this processor is an x86 one, I couldn't. Windows Server 2008 gave me sluggish performance so I gave it the axe by the end of the night. I didn't want to try Windows Server 2003 since it was quite old. More importantly, I found Windows Home Server by that time, a product made specifically for Home Servers and it was made using Windows Server 2003 as base ;)

I must say, Windows Home Server (WHS) really has the most horrible OS installer I have seen on a Windows operating system. When it was all set and done, I ran updates and everything but whilst using it, I really wasn't impressed :( Don't get me wrong, it is pretty darn good but India is a place where Windows Media Center doesn't give you everything that it does in countries like the United States. It surely has potential and may be some day, it will even make its way on to my server. But for now, I can't do so especially since I don't have a IDE drive greater than 80GB that can run the WHS. If you read my system specs correctly, you'd have noticed this old machine has only one IDE port, which I'm reserving for at least a 1TB drive.

I started considering Linux! (yes, I said Linux). I considered using [Ubuntu](http://www.ubuntu.com/)/[Xubuntu](http://www.xubuntu.org/) on the machine, as an obvious choice for any Linux newbie. For those who don't know the difference between the two, [Ubuntu](http://www.ubuntu.com/) uses [Gnome](http://en.wikipedia.org/wiki/GNOME) for its UI and [Xubuntu](http://www.xubuntu.org/) uses [KDE](http://en.wikipedia.org/wiki/KDE). Other than that, they are identical. If you don't have a choice towards either, I'd tell you to go for Xubuntu if you've got an older machine (or just like a machine with free resources). KDE requires lesser resources and should run almost anywhere. I saw this pretty detailed article about setting up a home server on Xubuntu that you should check out if Ubuntu/Xubuntu is your OS of choice.

Then comes the final choice, FreeNAS. If you want a NAS, you can't go wrong with FreeNAS. Weighing in at around 70 megabytes for a live CD with installer, its a really good choice. It is built on [FreeBSD](http://www.freebsd.org/) and I must say, its pretty extensive. Just have a look at [FreeNAS' list of features](http://en.wikipedia.org/wiki/FreeNAS#Features); its insane!

I'd suggest you go with FreeNAS if you just want to use your server as a NAS. It uses Samba to give you CIFS (in non technical jargon, it allows you to share files in a network like Windows does) and provides support for protocols like FTP, SSH and iTunes. It can be extended to support [XMBC](http://en.wikipedia.org/wiki/XBMC) and [SlimServer](http://en.wikipedia.org/wiki/SlimServer). It also allows you to host a web server using [lighttpd](http://www.lighttpd.net/) and even supports [UPS](http://en.wikipedia.org/wiki/Uninterruptible_power_supply), [SMART](http://en.wikipedia.org/wiki/Self-Monitoring,_Analysis,_and_Reporting_Technology), [ZFS](http://en.wikipedia.org/wiki/ZFS), [RAID](http://en.wikipedia.org/wiki/RAID) and most NICs and IDE/SATA disk controllers. If there is anything that you need to do that you can't see on this list and can't manage to get FreeNAS to do (I believe it will run almost anything which runs on FreeBSD) then you can move to Ubuntu/Xubuntu. You _could_ even run ASP .NET pages off Linux web servers (haven't tried it yet) with the limited support that Mono provides :)

Part 2 of the tutorial will have the basic setup for FreeNAS and how to get CIFS working. Subsequent parts will talk about setting up FTP, SSH and Web Server with MySQL and phpmyadmin. You never know, if I can get it to execute ASP .NET as well, you guys will be the first to know! ;)
