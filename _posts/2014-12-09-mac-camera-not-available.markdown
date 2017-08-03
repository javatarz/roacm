---
author: Karun Japhet
comments: true
date: 2014-12-09 19:36:22+00:00
layout: post
slug: mac-camera-not-available
title: 'Mac: Camera not available'
wordpress_id: 622
categories:
- Tutorials
tags:
- Mac
- OS X
- sudo
- WebCamera
---

My Macbook Pro sometimes doesn't detect it's web camera when I'm trying to join a video call and it's painful to have to reboot the machine to fix it. A simpler way (especially if you have root access to your machine) is to kill VDCAssistant from the command line.

{% highlight bash %}
    sudo killall VDCAssistant
{% endhighlight %}

Once you're done, restart the application that was attempting to use your web camera :)
