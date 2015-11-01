---
author: admin
comments: true
date: 2014-11-30 10:38:17+00:00
layout: post
slug: mass-renaming-file-extensions-with-powershell
title: Mass renaming file extensions with PowerShell
wordpress_id: 612
categories:
- Tutorials
tags:
- PowerShell
- Scripts
---

PowerShell is one of Windows' most underused tools in my opinion. In many cases it rivals if not betters support that bash scripts provide.

If you want to remove the extension of a file (say removing '!ut' from file names), it's a simple one line command.<!-- more -->

```powershell
    dir *.!ut | rename-item -newname { $_.BaseName }
```

If you want to add an extension, that's pretty straight forward too

```powershell
    dir * | rename-item -newname { $_.Name + '.txt' }
```

Combine the two and you can change extensions too..

```powershell
    dir *.jar | rename-item -newname { $_.BaseName + '.zip' }
```
