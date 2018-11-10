---
author: Karun Japhet
comments: true
date: 2009-11-03 10:15:48+00:00
layout: post
slug: trying-minefield-3-7a1pre
title: Trying Minefield 3.7a1pre
wordpress_id: 260
categories:
- Hacks
- Review
tags:
- Alpha
- Firefox
- Windows 7
---

Ever since I started using Win7 ([first public beta](http://blog.karun.me/blog/2009/01/10/windows-7-public-beta-serial-key-fiasco/)) I have liked one thing about Internet Explorer that Firefox couldn't do. This was the ability to use Win7's Aero prowess completely rendering each tab in the Aero preview for Firefox. At the time, Microsoft hadn't come out with the [Win7 UX Interaction Guide](http://msdn.microsoft.com/en-us/library/aa511258.aspx) but it's been out for a few months and I was quite disappointed that Mozilla didn't jump at the opportunity to release an upgrade.

A couple of weeks back, I saw screen shots of my friends' browsers and noticed they were using Minefield. They confirmed that 3.7a1pre does indeed have full Aero support so I finally upgraded. I must say, it's a great update.

As you can see from the screen shot, it doesn't really like some pages in the Aero preview. I am pretty sure it's an AJAX thing.

Of course, if you consider updating, quite a few of your plug-ins will not work simply because of the version compatibility checks. A simple way to by pass this is to install the [Nightly Tester Tools](https://addons.mozilla.org/en-US/firefox/addon/6543) to skip Firefox's version compatibility checks. Most add-ons should work fine.

There are a few add-ons I'd like to recommend with this alpha. Try checking out [Strata40](https://addons.mozilla.org/en-US/firefox/addon/14284), [StrataBuddy](https://addons.mozilla.org/en-US/firefox/addon/14762) and [StrataGlass](https://addons.mozilla.org/en-US/firefox/addon/14288). StrataGlass is amazing (works on any machine running on Vista/7) but it did give me problems on some pages so I disabled it. However, it is a great idea and it looked really nice. If someone irons out the wrinkles, I'd love to wear it everyday with my Firefox :)

Another small change I'd definitely recommend to users is going to _about:config_, past the warning, searching for the _browser.ctrlTab.previews_ setting and setting the value to true (simply double click on it to toggle). After this, try **Ctrl+Tab** to get tab previews. If you think this is cool, try **Ctrl+Shift+Tab** to get previews with the ability to search between them. Doesn't that make life easier when you have loads of tabs? ;)

I'd like to thank my friend [Nitro](http://www.nitrolinken.net/) for showing me the Strata add-ons and telling me about the Ctrl+Tab setting ;) Ctrl+Shift+Tab was purely luck ;)

PS: [Manan](http://beingmanan.com/) [asked me over twitter](http://twitter.com/manan/status/5387425273) about the memory usage of Minefield 3.7a1pre and I must say, it's quite low. In fact, with 8 tabs (none of which are heavy on AJAX other than the Wordpress panel), I'm using 125MB RAM. Though I've not confirmed it, I'd say that's slightly lesser or the same as regular Firefox and Minefield even seems a tad bit faster and more responsive even with all my regular add-ons ;) Impressive :)
