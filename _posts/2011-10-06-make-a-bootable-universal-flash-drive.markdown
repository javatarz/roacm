---
author: admin
comments: true
date: 2011-10-06 10:48:07+00:00
layout: post
slug: make-a-bootable-universal-flash-drive
title: Make a bootable Universal Flash Drive
wordpress_id: 403
categories:
- Hacks
- Tutorials
tags:
- Bootable
- Flash Drive
- Pen Drive
- UFD
- USB
---

This is a really old trick for Universal Flash Drives (UFDs) and I've been using it for years. I just thought I should document the steps so it's available as quick reference for me :)



	
  1. Insert your UFD and make sure all your data is backed up because we're going to format it.

	
  2. Run command prompt

	
  3. Open diskpart (will ask for elevation)

	
  4. Type "list disk"

	
  5. find what disk is your USB based on the size. Mine is number 3.

	
  6. type "select disk 3" (where 3 is the number that the system associates with my flash drive)

	
  7. type "clean"

	
  8. type "create partition primary"

	
  9. type "select partition 1"

	
  10. type "active"

	
  11. type "format fs=ntfs". Might take some time based on the size of your drive

	
  12. type "assign". This gives your drive a letter on the system.

	
  13. type "exit". Closes diskpart.




For step 11, you might get away with "format fs=ntfs quick" as well since full format takes forever. Now your UFD is ready for installing Windows, Linux or anything else you want. You can now even boot an operating system off it ;)
