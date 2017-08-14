---
author: Karun Japhet
comments: true
date: 2013-04-06 09:16:42+00:00
layout: post
slug: file-list-generator-v1-3
title: File list generator v1.3
wordpress_id: 436
categories:
- Development
tags:
- File List Generator
- PowerShell
- Scripts
- Source
---

I noticed that my old file list generator page didn't have a valid link any more. Since I'd go through and upload it again, I guess it would be worth it to add some minor documentation and make the path variable optional as well :)

{{ site.excerpt_separator }}

Here are some sample scripts

<blockquote>C:\Windows\System32\WindowsPowerShell\v1.0\powershell.exe _-command_ “**& ‘C:\Users\Karun\My Scripts\filelist.ps1**‘”
C:\Windows\System32\WindowsPowerShell\v1.0\powershell.exe _-command_ “**& ‘C:\Users\Karun\My Scripts\filelist.ps1**‘” “**.**” “**true**”
C:\Windows\System32\WindowsPowerShell\v1.0\powershell.exe _-command_ “**& ‘C:\Users\Karun\My Scripts\filelist.ps1**‘” “**.**” “**true**” “**true**“
C:\Windows\System32\WindowsPowerShell\v1.0\powershell.exe _-command_ “**& ‘C:\Users\Karun\My Scripts\filelist.ps1**‘” “**H:\Movies\HQ**”
C:\Windows\System32\WindowsPowerShell\v1.0\powershell.exe _-command_ “**& ‘C:\Users\Karun\My Scripts\filelist.ps1**‘” “**H:\Movies******” “**true**”
C:\Windows\System32\WindowsPowerShell\v1.0\powershell.exe _-command_ “**& ‘C:\Users\Karun\My Scripts\filelist.ps1**‘” “**H:\Movies******” “**true**” “**true**“</blockquote>

Add a shortcut with any of those and it will get the job done! ;)

[View Script Source Code](https://github.com/javatarz/Scriptlets/blob/master/filelist.ps1) | [File List Generator page](http://karunab.com/dev/file-list-generator/)

If you’re having trouble executing the script, you should consider signing your PowerShell scripts. [Scott Hanselman has written a great post on how to do so](http://www.hanselman.com/blog/SigningPowerShellScripts.aspx). Go read it! You could simply _Set-ExecutionPolicy_ to _Unrestricted_ but then you’d be leaving your system open to attacks. Don’t blame anyone but yourself if you run someone else’s unsafe code and screw something up :) You have been warned :)
