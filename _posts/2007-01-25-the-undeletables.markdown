---
author: Karun Japhet
comments: true
date: 2007-01-25 00:39:10+00:00
layout: post
slug: the-undeletables
title: The Undeletables
wordpress_id: 13
categories:
- Hacks
tags:
- Windows Vista
---

I had to reinstall vista once and so vista copied its already existing files into Windows.old like any other decent OS does. This was of course a move to help me keep the data I already had in C drive at that time.

Now that my work with it was done, I couldn't delete it. [UAC](http://en.wikipedia.org/wiki/User_Account_Control) was constantly telling me I didn't have the rights to do so. The sad part is that I am the administrator and those files aren't of any use to me. I tried switching off UAC but that requires a reboot so I started searching for alternatives since Vista wouldn't let me edit the rights directly either.

Thanks to [Rotem](http://msghelp.net/member.php?action=profile&uid=2577) for linking me to [Tim Sneath's MSDN blog](http://blogs.msdn.com/tims/) which explains a method to reset rights over a folder.
The problem quite clearly is that Vista doesn't remember which group holds rights to editing those folders/files.
The secret lies in two command-line utilities.

takeown is an old command which resets ownership of the mentioned file/folder while icacls is used to provide a group with the rights to that file/folder.

As Tim points out, you can create a batch file with the following two lines.


<blockquote>takeown /f %1 /r /d y
icacls %1 /grant administrators:F /t</blockquote>


It is imperative to note that the batch file needs to be **run as an administrator**. This can be done by right clicking the file and clicking on run as administrator.

You could also do what I did. Open command prompt in administrator mode (start > type "cmd" without quotes > right click > run as administrator), browse till the folder/file in question and then use the same two commands by substituting "%1" with the name of the target file/folder.

Hopefully you were smart enough to figure out that you do need administrator rights to pull this off. So if you're a script kiddie planning to pull off something on vista, this is not what you're looking for.

So the next time you cannot delete a file in Windows Vista even though you have administrator rights, try using takeown and icacls ;)

**Update (8th October, 2013):** Over 6 and a half years later, This solution didn't work for me. Another, rather weird one, did. I've written about it in my post [Windows 7: Unable to delete files – “Access is denied” error messages](http://blog.karun.me/blog/2013/10/08/windows-7-unable-to-delete-files-access-is-denied-error-messages/) so do check it out!
