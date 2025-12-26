---
author: Karun Japhet
comments: true
date: 2014-11-13 21:02:19+00:00
layout: post
slug: mass-downloading-google-drive-files
title: Mass downloading Google Drive Files
description: "Download hundreds of Google Drive files at once using Scala script. Automate bulk downloads when Gmail clips long email lists with file links."
wordpress_id: 608
category: Engineering Practices
tags:
  - scala
  - productivity
---

Has anyone ever shared with you hundreds of Google Drive files instead of sharing the directory? It happened to me today and I noticed [Gmail clips the HTML part of the message at 102 KB](https://econsultancy.com/blog/65360-prevent-gmail-clipping-your-message-with-an-email-diet#i.1cn7apepjlfqbz). Usually Gmail provides a way to download all attachments (Google Drive or otherwise) or the ability to save them on your Google Drive from where you can mass download them. If the email is clipped, you can only save a subset of these files into your Google Drive so no mass downloads. Bummer.

It's simple enough to fix with some Scala magic. First you should save the email source as _email.html_. This file can then be read line by line to find any google docs links along with the file name. In my case the files were named "File - 1.JPG". Next update the file saving location (for me it was "dl/File 1.jpg" for which I created the folder _dl_). Assuming your regular expressions are correct, you're good to go!

{% highlight scala %}
import java.io.File
import java.net.URL

import scala.io.Source
import scala.sys.process._

object Launcher extends App {
  def processLine(line: String) = """https\://docs.google.com/file/d/(\w*)/edit\?usp\=drive_web.*?File - (\d*)\.JPG""".r
    .findAllMatchIn(line).map(_.subgroups)
    .map(list => (s"https://drive.google.com/uc?export=download&id=${list(0)}", s"dl/File ${list(1)}.jpg"))

  def download(url: String, fileName: String) = new URL(url) #> new File(fileName) !!

  val downloadFromTuple = (download _).tupled

  Source.fromFile("email.html").getLines().map(processLine).filterNot(_.isEmpty).foreach(_.foreach(downloadFromTuple))
}
{% endhighlight %}

Yes, this is a quick hack and can be improved for readability (such as extracting the regular expression, download link and file read and save locations) but for a quick hack that seems unnecessary.
