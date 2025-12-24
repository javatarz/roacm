---
author: Karun Japhet
comments: true
date: 2008-02-02 07:07:28+00:00
layout: post
slug: whatpulse-data-parse-class
title: WhatPulse data parse class
description: "PHP class for parsing WhatPulse WebAPI data with caching. Efficiently fetch keystroke and click statistics for forum signatures and widgets."
wordpress_id: 33
category: Developer Experience
tags:
  - php
  - api
  - tools
---

On 10th of December, 2008, 2 days before my Computer Networks paper I made a WhatPulse class in php to get data from the WhatPulse WebAPI for you to work with. With the information at your finger tips make a forum signature, why don't you? ;)
I've added a few functions to the class and written a small example for people to use. Most people must have it already because the WebAPI came out around 2 years ago but in case there is someone who doesn't have **caching of the WhatPulse data** then this is useful.

Caching of data means lesser resources used by your php script to
a) Read from the WhatPulse server.
b) Write to the server's hard-disk.
c) Use the server's tubes (even though the xml is less than a kilobyte).

So what are you waiting for? Go have a look ;)
[WhatPulse.class.php on svn](http://svn.jalife.net/Random__Code/markup/HEAD/PHP___WhatPulse.class.php)
[WhatPulse_example.php on svn](http://svn.jalife.net/Random__Code/markup/HEAD/PHP___WhatPulse_Example.php)

_[My WhatPulse profile](http://whatpulse.org/stats/users/127187/)_

**PS:** This whole thing started with me updating to WhatPulse 1.5b1 after noticing that the WhatPulse team wasn't going to release any more betas any time soon and the fact that I am currently 18th in the world :-o! (in keystrokes)
More such releases to come soon. I'm planning to have a collection in the dev section. I make tons of useless scripts in php. Might as well put them up just in case someone finds them useful ;)

Everything written in this post except this line and the first line were written 2 months ago. I just didn't put it up for so long :-(
