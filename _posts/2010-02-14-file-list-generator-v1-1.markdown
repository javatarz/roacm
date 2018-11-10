---
author: Karun Japhet
comments: true
date: 2010-02-14 07:46:06+00:00
layout: post
slug: file-list-generator-v1-1
title: File list generator v1.1
wordpress_id: 284
categories:
- Development
tags:
- File List Generator
- PowerShell
- Scripts
- Source
---

On a lazy Sunday afternoon when you've got nothing better to do, you either write [rather useless scripts](http://blog.karun.me/blog/2009/12/06/clean-file-list-generation-with-powershell-script/) or update them. I chose to do the latter.

The [file list generation script](Clean File List Generation with PowerShell Script) I wrote some time back was mainly to generate a list of movies I have. When I generated a list of all the HD movies I have on disk, I realized, my list was being ruined by loads of sample files which escape the file filter because they are the same extension as the videos themselves. So I decided to write a simple fix to remove all files with "sample" in it. Of course, this is activated by a command line switch which is by default off. The extension list now ignores all images (pngs, jpgs and bmps) so my file list no longer has any screen shots.

Here's a couple of sample script calls


<blockquote>C:\Windows\System32\WindowsPowerShell\v1.0\powershell.exe _-command_ "**& 'C:\Users\Karun\My Scripts\filelist.ps1**'" "**H:\Movies\HQ**"
C:\Windows\System32\WindowsPowerShell\v1.0\powershell.exe _-command_ "**& 'C:\Users\Karun\My Scripts\filelist.ps1**'" "**H:\Movies******" "**true**"
C:\Windows\System32\WindowsPowerShell\v1.0\powershell.exe _-command_ "**& 'C:\Users\Karun\My Scripts\filelist.ps1**'" "**H:\Movies******" "**true**" "**true**"</blockquote>


The first one will call on the script and generate an output. The second will do so recursively. The third one will ignore all files with the word "sample" in them. Simple enough? Go [get the code](http://svn.jalife.net/Random__Code/markup/HEAD/PowerShell___filelist.ps1) and have fun with it!

[View Script Source Code](http://svn.jalife.net/Random__Code/markup/HEAD/PowerShell___filelist.ps1) | [Download Script Source Code](http://svn.jalife.net/Random__Code/downloadfile/HEAD/PowerShell___filelist.ps1)

If you're having trouble executing the script, you should consider signing your PowerShell scripts. [Scott Hanselman has written a great post on how to do so](http://www.hanselman.com/blog/SigningPowerShellScripts.aspx). Go read it! You could simply _Set-ExecutionPolicy_ to _Unrestricted_ but then you'd be leaving your system open to attacks. Don't blame anyone but yourself if you run someone else's unsafe code and screw something up :) You have been warned :)
