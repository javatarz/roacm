---
author: Karun Japhet
comments: true
date: 2010-07-04 06:35:51+00:00
layout: post
slug: windows-file-sharing-addremove-folders-via-command-line
title: 'Windows File Sharing: Add/Remove folders via Command Line'
description: "Manage Windows network shares from command line using net share. Bypass administrator restrictions with this simple workaround."
wordpress_id: 307
category: Engineering Practices
tags:
  - windows
  - infrastructure
  - tools
---

Your first thought on reading this probably is "Why in the world would I need to do that?" Well, I would have thought of it the same way a week back. But it seems some times, Windows does not want to give access to certain features such as Advanced File Sharing options. It states that the administrator on my machine has disallowed this operation. Guess what? I'm the only administrator on this machine! Since I was unable to find the option to get that feature working, I decided to resort to some good old Command Line usage :)

To remove a file/folder from share ![]({{ site.url }}/assets/images/uploads/2010/07/Windows-File-Sharing-Blocked-by-administrator-300x156.png)and type the following command in an elevated instance of command  prompt:


<blockquote>net share _<shareName>_ /delete</blockquote>


To add a file/folder to share and type the following command in an elevated instance of command prompt:


<blockquote>net share _<shareName>_=_<pathToSharedFile>_</blockquote>


An example of an add and delete command would be as follows


<blockquote>net share "Completed Downloads"="D:\Completed Downloads"
net share "Completed Downloads" /delete</blockquote>


At times, I was not required to use an elevated command prompt instance but if you get message stating "Access Denied", you should run the command after elevation. To do so, type out "Command Prompt" in your start menu and then use the right click > Run as administrator option or you could simply use Shift+Enter to do the same :)

Simple enough, right? ;)
