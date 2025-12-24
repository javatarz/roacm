---
layout: post
comments: true
author: Karun Japhet
title: "The untold guide to troubleshoot Phillips Hue and Google Assistant Integration"
description: "Fix Phillips Hue and Google Assistant integration issues. Learn how to troubleshoot bridge connection problems and secure your smart home setup."
category: Device Hacks
tags:
  - iot
  - troubleshooting
  - product-review
---

Recently, I moved into a new home and was setting up my [Phillips Hue](https://www2.meethue.com/en-us) lights with my [Google Home assistants](https://assistant.google.com/#?modal_active=none) around my house for convenience. I noticed a couple of hick-ups since the last time I did this.

{{ site.excerpt_separator }}

## Logging into Phillips Hue app
If the app does not ask you to hit the button on your bridge, your account **already has a bridge** associated with it.

You can see what bridge is associated with your [MeetHue account](https://account.meethue.com) on the [bridges page](https://account.meethue.com/bridge).

![There can only be one](https://chapterbreak.net/wp-content/uploads/2015/12/only-one.gif "There can only be one")

Remove any older bridges you might have on your account and try logging into the Phillips Hue app again. Once complete, you should be able to link your Google Home assistant to your Phillips Hue app.

## Other House Keeping for security reasons

You can cleanup how many [apps have access to your account](https://account.meethue.com/apps) and [how many other users have access to your bridge](https://account.meethue.com/bridge). If you see anything that your don't recognize, remove it. After all, these apps and Hue account users can control the lights in your house. If you don't know them, remove their access.

In my case, the only users on my bridge are the family members in my house and the only apps I have are the Phillips Hue Android app (for mobile access remotely) and Google (assistant integration).