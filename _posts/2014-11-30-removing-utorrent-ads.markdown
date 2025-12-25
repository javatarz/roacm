---
author: Karun Japhet
comments: true
date: 2014-11-30 11:09:04+00:00
layout: post
slug: removing-utorrent-ads
title: Removing uTorrent ads
description: "Remove all ads and featured content from uTorrent with these hidden settings. Complete guide to disable sponsored torrents and promotional banners."
wordpress_id: 615
category: Developer Experience
tags:
  - tutorials
---

When BitTorrent bought over μTorrent, they promised users that all adverts would be optional. They have, however, made it harder and harder to hide the adverts including now a set of hidden options. Thankfully users have found how to access those hidden options.

## Turn off ALL Ads/Featured Content/Bundle Crap in μtorrent/Bittorrent:

#### Options > Preferences > Advanced

Turn ALL settings to **false**:

* bt.enable_pulse
* distributed_share.enable
* gui.show_notorrents_node
* offers.left_rail_offer_enabled
* gui.show_plus_upsell
* offers.content_offer_autoexec
* offers.sponsored_torrent_offer_enabled
* offers.featured_content_badge_enabled
* offers.featured_content_notifications_enabled
* offers.featured_content_rss_enabled

#### Options > Preferences > Hold Shift+F2 while clicking Advanced (Hidden fields)

Turn ALL settings to **false**:

* gui.show_gate_notify
* gui.show_plus_av_upsell
* gui.show_plus_conv_upsell
* gui.show_plus_upsell_nodes

Source: [Forum post from Beasley](http://forum.utorrent.com/topic/81421-321-how-to-turn-off-ads-except-for-the-silly-upgrade-banner/page-3#entry496240)
