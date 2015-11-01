---
author: Karun Japhet
comments: true
date: 2015-07-11 06:46:42+00:00
layout: post
slug: maven-compilation-in-ram-drive
title: Maven Compilation in Ram Drive
wordpress_id: 658
categories:
- Development
- Hacks
tags:
- hard disk
- Linux
- maven
- optimization
- performance
- ram
- ram drive
- ramfs
- tempfs
- Windows
---

If you're working on huge maven projects and have a slow disk, compilation, packaging and install times can sore quite high. If getting faster hard disks isn't possible, why not try moving the compilation to a ram drive?

A code base which used to take **22 minutes** to compile went down to **3 minutes**. This just goes to show the effect that disk IO bottlenecks can have on your system.

<!-- more -->


# What is a RAM Drive?


RAM is significantly faster than spinning platter HDDs. Until the commercialisation of static state devices, it wasn't even a competition. [It's meant to be like that](https://en.wikipedia.org/wiki/Memory_hierarchy).

If you need higher writes speeds to _disk_ which don't need to be persisted over a long period of time, why not use some of your spare RAM as a hard disk? This can be achieved using software.


## How do I get a RAM drive on my machine?


RAM drive softwares are available for all major operating systems.

[SoftPerfect's RAM Disk](https://www.softperfect.com/products/ramdisk/) is a good free tool for non-commercial processes for Windows. Linux has [tempfs](https://en.wikipedia.org/wiki/Tmpfs) and [ramfs](https://wiki.debian.org/ramfs).


# Compiling your Maven project on to a RAM drive


Most big projects follow a multi-module POM structure. You can move your target directory in 2 ways.


## Change build directory


You can change the output directory to the desired path ensuring all compiled files go to your RAM drive. Just make sure you qualify your path well using the group and artifact IDs to ensure different projects don't overwrite each other's compiled code.

```xml
    <build>
      <directory>
        <strong>/mnt/ramdrive/compile/${project.groupId}/${project.artifactId}</strong>
      </directory>
    </build>
```

The issue with this approach is that all users on the team are now bound by

  1. Your compilation directory path (terrible idea)
  2. Using a ram drive (not everyone might need it)


The first issue can be fixed by creating a property for the base path. This parameter can be passed as a compile time parameter with a default set in the POM

```xml
    <build>
      <directory>
        <strong>${target.baseDir}</strong>/${project.groupId}/${project.artifactId}
      </directory>
    </build>
```

The second issue can't be fixed using this approach. This can be fixed with the second approach


## Compilation profiles


Maven allows you to have profiles for applying configs in specific scenarios.

```xml
    <profiles>
      <profile>
        <id><strong>ramDrive</strong></id>
        <build>
          <directory>
            ${target.baseDir}/${project.groupId}/${project.artifactId}
          </directory>
        </build>
      </profile>
    </profiles>
```

Now you can compile your code with a profile and it will use the specified directory for compilation

```bash
    mvn clean install -P<strong>ramDrive</strong> -D<strong>target.baseDir=/mnt/ramdrive/compile</strong>
```

Congratulations, your code is compiled on RAM drive. Is it still not fast enough? Is the installation process slow? Well, you could move your M2 directory to the ram drive too


# Local Maven repository to RAM drive


You can change your maven configuration to ask it to move your local maven repository home (which is the place where all the artifacts you build and/or download are stored).

Update your settings.xml with the location of your local repository

```xml
    <localRepository>/mnt/ramdrive/mvn-repo</localRepository>
```
