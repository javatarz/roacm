---
author: Karun Japhet
comments: true
date: 2014-06-16 06:32:47+00:00
layout: post
slug: set-java-home-to-a-specific-version-on-mac
title: Set Java Home to a specific version on Mac
wordpress_id: 558
categories:
- Tutorials
tags:
- java
- Java Home
- Mac
- OS X
---

Installing Oracle's version of Java on your machine does (for most machines I've encountered) add a Java Home system variable. Rarely however it doesn't work on some machines. Such folks are recommended to add the path themselves.

On a Mac, you can do this by using the following

{% highlight bash %}
    export JAVA_HOME=$(/usr/libexec/java_home)
{% endhighlight %}

This information is littered across the internet and isn't hard to find at all. However, this specific machine, when upgraded from Java 1.7 to Java 1.8 kept insisting it's home is Java 1.7. The Java Home script at `/usr/libexec` on the mac should take care of this but it hadn't. In such situations you can explicitly tell it which version to load by passing a version parameter to it

{% highlight bash %}
    export JAVA_HOME=$(/usr/libexec/java_home -v 1.8)
{% endhighlight %}
