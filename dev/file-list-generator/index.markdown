---
author: admin
comments: true
date: 2013-04-06 09:15:55+00:00
layout: page
slug: file-list-generator
title: File List Generator
wordpress_id: 442
---

Got a bunch of movies and want them in a list along with how much space they are taking? You've come to the right place. Here's a PowerShell script that does exactly that quite easily.

Here are some sample commands


<blockquote>C:\Windows\System32\WindowsPowerShell\v1.0\powershell.exe _-command_ “**& ‘C:\Users\Karun\My Scripts\filelist.ps1**‘”
C:\Windows\System32\WindowsPowerShell\v1.0\powershell.exe _-command_ “**& ‘C:\Users\Karun\My Scripts\filelist.ps1**‘” “**.**” “**true**”
C:\Windows\System32\WindowsPowerShell\v1.0\powershell.exe _-command_ “**& ‘C:\Users\Karun\My Scripts\filelist.ps1**‘” “**.**” “**true**” “**true**“
C:\Windows\System32\WindowsPowerShell\v1.0\powershell.exe _-command_ “**& ‘C:\Users\Karun\My Scripts\filelist.ps1**‘” “**H:\Movies\HQ**”
C:\Windows\System32\WindowsPowerShell\v1.0\powershell.exe _-command_ “**& ‘C:\Users\Karun\My Scripts\filelist.ps1**‘” “**H:\Movies******” “**true**”
C:\Windows\System32\WindowsPowerShell\v1.0\powershell.exe _-command_ “**& ‘C:\Users\Karun\My Scripts\filelist.ps1**‘” “**H:\Movies******” “**true**” “**true**“</blockquote>


Add a shortcut with any of those and it will get the job done! ;)

[View Script Source Code](https://github.com/JAnderton/Scriptlets/blob/master/filelist.ps1) | [List of File List Generator Releases](http://karunab.com/tag/file-list-generator/)

If you’re having trouble executing the script, you should consider signing your PowerShell scripts. [Scott Hanselman has written a great post on how to do so](http://www.hanselman.com/blog/SigningPowerShellScripts.aspx). Go read it! You could simply _Set-ExecutionPolicy_ to _Unrestricted_ but then you’d be leaving your system open to attacks. Don’t blame anyone but yourself if you run someone else’s unsafe code and screw something up :) You have been warned :)
