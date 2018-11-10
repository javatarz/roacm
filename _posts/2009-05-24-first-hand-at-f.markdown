---
author: Karun Japhet
comments: true
date: 2009-05-24 12:21:36+00:00
layout: post
slug: first-hand-at-f
title: First hand at F#
wordpress_id: 219
categories:
- Development
tags:
- F#
- Functional Programming
- Visual Studio
---

With the release of the first beta of Visual Studio 2010 which includes support for F#, it was only a matter of time till I tried my hand at it.

I don't go for Hello World programs. Apart from C, the first code I've written in every other language (since I heard this question) has been the same. Keeping up tradition, here's the F# port.

{{ site.excerpt_separator }}

{% highlight fsharp %}
let Check (x: int) = float(int(sqrt(float x))) = sqrt(float x)
for x = 32 to 99 do
let sqVal = pown x 2
if (Check(sqVal / 100) && Check(sqVal % 100)) then
System.Console.WriteLine(sqVal);
done
{% endhighlight %}

This code aims to find every 4 digit number that is a perfect square whose upper and lower two digits are both perfect squares. This question was part of my sem 1 C paper and got me a 0/10. Clearly the examiner didn't understand my answer. :P In honor of the great act of stupidity on my side (of writing such a solution in an exam), I recreate this in every concievable language as my first code :)

This is my first piece of code in a functional language so if I could have done this better, please let me know. Now to try out Haskell :)

A note about the VS 2010 F# editor. I know its not meant for performance but compiling clearly takes a couple of seconds. The IDE also could do with a bit more work with its intellisense because it didn't like remembering System.Console and instead searched for the string everytime meaning I would hit System.Configuration instead (I am used to hitting enter after 'Con' due to C# :))
