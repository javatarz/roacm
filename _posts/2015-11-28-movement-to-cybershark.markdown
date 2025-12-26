---
author: Karun Japhet
comments: true
layout: post
title: Movement to Cybershark
description: "Migrating to automated Chef deployment and cheaper servers. Goodbye PHP and WordPress, welcome Octopress and Node.JS infrastructure automation."
date: 2015-11-28T11:09:58+05:30
category: Platform Engineering
tags:
  - infrastructure
  - devops
---

I had been procrastinating movement to a dev-ops style Chef deployment for my servers to ease it's management because of the age old "If it ain't broke..". Well, upgrades on Bumblebee were getting more expensive so I finally decided to take the leap. I introduce the [trion cookbook](https://github.com/javatarz/trion-cookbooks) that I'm using to setup my servers.

I also realized that [Kimsufi](http://kimsufi.ie/) came up with cheaper servers (now as low as €4.99). Without automation to setup my servers, the thought of migration and building another [snowflake server](http://martinfowler.com/bliki/SnowflakeServer.html) scares me purely because of it's frailty. No more.

I've now officially moved to my new server, Cybershark!

I have made it a point not to have PHP on this server. It's time to stop my dependency on it. Good bye [Wordpress](https://wordpress.org/). Welcome [Octopress](https://github.com/octopress/octopress). Good bye Soccer Scraper. Google Now will do fine :)

This means some of the internal dependencies I had (such as PHP mailers) needs to now be moved to another technology. Hello [Node.JS](https://nodejs.org/). I think we might be good friends :)
