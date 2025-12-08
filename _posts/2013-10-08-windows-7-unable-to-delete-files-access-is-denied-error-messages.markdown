---
author: Karun Japhet
comments: true
date: 2013-10-08 03:00:13+00:00
layout: post
slug: windows-7-unable-to-delete-files-access-is-denied-error-messages
title: 'Windows 7: Unable to delete files - "Access is denied" error messages'
wordpress_id: 468
category: Device Hacks
tags:
  - windows
  - windows-7
  - permissions
  - troubleshooting
---

Windows, at times, denies you the right to delete a file or a folder. I've noticed this happening especially when you copy the contents of the folder to empty it and later try to delete it. At this moment, you've got to ask yourself if you've got the necessary permissions to do so.




If you're like many, you have admin privileges to your machine but you still can't delete it. This is because Windows' permissions table for this directory is broken and as a result, is denying you access. You can right click the folder, go to properties and look under the 'Security' tab to confirm who has permissions but, if you're like me, this tab will look weird too because a regular tab shows a list of groups or users who have access and this one won't. [This post here](http://www.addictivetips.com/windows-tips/windows-7-access-denied-permission-ownership/) shows you, quite clearly, how the permissions page should look.




The most popular solution is one I've already written about. The [takeown method I've written about  in my previous post named "The Undeletables"](http://blog.karun.me/blog/2007/01/24/the-undeletables/) is one which has existed since Vista and continues to work for many on Windows 7. The ["Take Ownership" script](http://www.sevenforums.com/tutorials/1911-take-ownership-shortcut.html)  is an extension of this method and adds a "Take Ownership" option to the right click context menu of every file and folder in explorer. Last time I had this problem, it was because I had directories which were restricted ones (Windows directories) on a drive where an old Windows resided. This script helped me clear that. Alas, this time, it didn't work.




I was about to format my drive (because I had enough space to move data around and do that, quite rare if you ask me :)) but decided to try one last thing. Windows' error correction option. You might know this screen from when you pull out a flash drive without safely disconnecting it. Weirdly enough, running Error Check on the drive actually worked! :D




[![Error Checking option]({{ site.url }}/assets/images/uploads/Error-Checking-option-223x300.png)]({{ site.url }}/assets/images/uploads/Error-Checking-option.png)Right click on the drive, go to properties, open the "Tools" tab and under the error checking section, click "Check now". [  

]({{ site.url }}/assets/images/uploads/Error-Checking-option.png)




[![check disk window]({{ site.url }}/assets/images/uploads/check-disk-window.png)]({{ site.url }}/assets/images/uploads/check-disk-window.png)




You should be able to select the default options on the check disk window and run the scan. "Scan for and attempt recovery of bad sectors" is only recommended to be used when you're actually dealing with bad sectors. It's going to take a while to run that scan. The regular scan, however, should be done in 5-10 seconds on a 2TB HDD.[  

]({{ site.url }}/assets/images/uploads/check-disk-window.png)




These steps did work out for me. Let me know if they work for you too! :)



