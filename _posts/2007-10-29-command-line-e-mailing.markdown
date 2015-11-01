---
author: admin
comments: true
date: 2007-10-29 08:40:42+00:00
layout: post
slug: command-line-e-mailing
title: Command Line e-mailing
wordpress_id: 31
categories:
- Review
tags:
- Tools
---

Ever wanted to send a quick email but then though, "nah.. cba to open my inbox right now"?

Now you can send emails via command line! It **doesn't have to be installed** though you could do so if you please. I give you [Blat](http://www.blat.net/)!

Here is a _simple example_ from the documentation:


<blockquote>@echo off
:::::::::::::: Lets set some variables ::::::::::::::
set eMail=tim@blat.tld
set subj=-s "Test Blat"
set server=-server localhost
set x=-x "X-Header-Test: Can Blat do it? Yes it Can!"
set debug=-debug -log blat.log -timestamp
::::::::::::::::: Now we run Blat!  :::::::::::::::::
blat %0 -to %eMail% -f %eMail% %subj% %server% %debug% %x%</blockquote>
