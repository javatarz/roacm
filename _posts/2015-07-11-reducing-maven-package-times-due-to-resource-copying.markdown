---
author: Karun Japhet
comments: true
date: 2015-07-11 07:06:33+00:00
layout: post
slug: reducing-maven-package-times-due-to-resource-copying
title: Reducing Maven Package times due to resource copying
wordpress_id: 663
categories:
- Development
- Hacks
tags:
- maven
- optimization
- performance
---

I once worked on a web application with a 250+MB _code base_. This consisted of 200,000 images. For every development cycle, you had to compile and deploy the code on the server which was painful to say the least. The size wasn't the problem as much as the number of resources. The code took less than 20 seconds to compile.

We figured that compilations overwriting class files were OK but having to edit any resource just took too long. In such cases, you can use maven's process-resources plugin to ask maven to only copy the new resources to your target directory.

This is **significantly** faster. Package times went down from **6 minutes** to **18 seconds**. Of course, a SSD would have helped but looking at the difference, it's well worth the effort :)

{% highlight bash %}
    mvn process-resources
{% endhighlight %}

Go try it out!
