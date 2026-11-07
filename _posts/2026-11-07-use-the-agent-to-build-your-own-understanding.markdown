---
layout: post
comments: true
author: Karun Japhet
title: 'Use the Agent to Build Your Own Understanding'
description: 'An agent can read a new codebase in minutes. I had it teach me one level at a time and quiz me before going deeper, so the understanding ended up in my head.'
category: intelligent Engineering
image: /assets/images/posts/2026-11-07-use-the-agent-to-build-your-own-understanding/cover.png
tags:
  - ai-assisted-development
  - coding-assistants
  - developer-experience
devto: true
devto_tags:
  - ai
  - programming
  - productivity
  - tutorial
---

![A brass automaton holds a lantern over one detailed district of a large city map, while an apprentice at the table sketches their own map of that district in a notebook. Red threads run from pins on the apprentice's map to open books and ledgers.]({{ site.url }}/assets/images/posts/2026-11-07-use-the-agent-to-build-your-own-understanding/cover.png){: .diagram-lg}

I joined a project partway through. The agent could read the whole repo in minutes. I couldn't. The decisions about what to build and how were still mine, and I couldn't make them on the agent's understanding.

So I turned the usual setup around. Instead of asking the agent questions, I had it teach me the codebase one level at a time and quiz me before it went deeper.

This post is how that worked.

<!-- more -->

## Reading code was always the slow part

Most of a developer's time has always gone into understanding code. A field study of 78 professionals found [58% of their time went to comprehension](https://xin-xia.github.io/publication/TSE17.pdf). IDE logs from another study put it at [about 70%](https://robertominelli.com/assets/downloads/publications/Mine2015b.pdf). At Google, new engineers took [about 19 weeks to ramp up](https://doi.org/10.1109/ms.2023.3291158).

The hardest questions are about why. When researchers [watched developers at Microsoft](https://www.microsoft.com/en-us/research/publication/information-needs-in-collocated-software-development-teams/), the questions they most often put off were about why code was written the way it was. The only person who knew was usually a coworker who wasn't available.

## The agent makes it easy to skip understanding

An agent can read a repo in minutes and answer most questions about what the code does. That makes it tempting to lean on its understanding instead of building your own.

The early research says that's a real risk. In [Anthropic's study of developers learning a new library](https://arxiv.org/abs/2601.20245), the group using AI scored 17% lower on a comprehension quiz, and the time it saved wasn't significant. In [another study](https://arxiv.org/html/2511.02922v2), students working on an unfamiliar legacy codebase with Copilot finished in about half the time and passed 71% more tests. Their comprehension didn't improve.

Jason Gorman calls the extra time it takes to understand code before you can safely change it [comprehension debt](https://codemanship.wordpress.com/2025/10/26/the-ai-ready-software-developer-10-comprehension-debt/). Addy Osmani [popularised the term](https://addyosmani.com/blog/comprehension-debt/) for code that AI wrote. Joining someone else's codebase is an older version of the same problem.

These studies looked at learners and libraries. No one has studied a senior engineer inheriting a system with an agent. What follows is what worked for me.

## Let the agent quiz you

Most advice on onboarding with an agent has you ask the questions. I reversed it, because at that point the agent knew more about the codebase than I did. The agent teaches, and I answer.

I set the workspace up as described in [Structuring Claude Code for Multi-Repo Workspaces]({{ site.url }}/blog/2026/03/26/structuring-claude-code-for-multi-repo-workspaces/), so the agent could see every repo. Then I started with a prompt like this one. It's a cleaned-up version of what I typed, so copy it and adjust it to your project.

```
Onboard me onto this codebase, one level at a time.

1. Start by reading only the top-level CLAUDE.md files and build an index of the repos and what each one does.
2. Teach me the high-level picture first: the main concepts, how the code is structured, the key design decisions, how it's deployed and runs, and the history behind it.
3. After you teach each level, point me to the few files I should read myself, so I learn to find my way around the code.
4. Then quiz me on both what you taught and the files I read. Only go deeper, or move to the next area, once I've answered well. If I get something wrong, explain it again.
5. Back every fact with the file and line that proves it. For why something was built a certain way, use ADRs, commit messages and docs. If nothing proves it, say UNKNOWN. Don't guess.
```

![The onboarding quiz loop. The agent teaches a level, recommends files for you to read, then quizzes you on both. If you pass, it goes one level deeper and teaches the next level. If you don't, it explains the level again.]({{ site.url }}/assets/images/posts/2026-11-07-use-the-agent-to-build-your-own-understanding/quiz-loop.svg){: .diagram-lg}

The first level is the whole system. After that, it's one area at a time. A quiz question might look like this one (made up, to keep the project private):

> A request comes in through the API. Which layer checks permissions, and which file would you open to change that rule?

If I named the wrong layer, the agent explained that level again and asked a new set of questions. If I got it right, it went one level down.

The quiz covered the files I'd read as well as what the agent taught. Reading the code myself gave me a rough map of where things live. Module diagrams show some of that, but when I had to make a decision, the map in my head was more useful.

The research points the same way. In Anthropic's study, developers who asked conceptual questions or checked their own understanding scored 65 to 86% on the quiz. Those who handed the work to the AI scored 24 to 39%. In the Copilot study, how often people verified their work predicted how much they understood.

**Have the agent quiz you, and go deeper only once you pass.**

## Every fact needs proof

Agents answer confidently, even when they're guessing. So the prompt asks for the file and line behind each fact, and allows `UNKNOWN` when there's nothing to point at. [A Mercari engineer](https://engineering.mercari.com/en/blog/entry/20251028-the-ai-lied-to-me-and-thats-when-i-learned-how-to-use-it/) calls that permission to say "I don't know" an escape hatch.

Code proves what the system does. It rarely proves why. For that, I start with [Architectural Decision Records (ADRs)](https://adr.github.io/), if the project has them. Then I go to commit messages, which rarely help, then docs, which are usually out of date, then the people who were there.

Some answers never turn up. Those stay `UNKNOWN` in my head too. I've worked this way my whole career. Some answers arrived a year or two later, when I found someone who had lived through the decision. An agent doesn't remove that tribal knowledge. It follows the same rule I do. Over time, I want to write that knowledge down, so agents and people both get a [first-class developer experience]({{ site.url }}/blog/2025/06/23/what-makes-developer-experience-world-class/) instead of having to go looking for it.

**Every fact needs proof. Without it, the fact stays `UNKNOWN`, for the agent and for you.**

## Big picture before the details

I don't read the whole codebase. I learn the whole shape of the system. That means the main concepts, how the code is structured, the key design decisions and their history, and how it's deployed and runs. Then I read the components where the business logic lives, and enough of the package structure to find my way around.

With that base in place, I start picking up cards. When I can't refine or build a card because I don't understand something, I go back to the learning session and continue from where I left off.

The first few days are intense, with a few hours between sessions so I don't forget what I learned. After that, I come back when a card is blocked.

**Build the big picture yourself. Go deep when a card needs it.**

## Check in the list of sources

Two things come out of this. One is a map of the system, which is useful to everyone on the team. The other is a record of what I've learned so far, which is only useful to me. That one stays on my machine.

If the repo already has good `CLAUDE.md` or `AGENTS.md` files, the map is quick to rebuild, so I don't keep it. I check in the list of sources the agent should read to build it, because those change less often than the map does. I check in the map itself only when it's expensive to rebuild, stamped with the commit it was built from, so anyone can tell when it's stale. Either way, the top-level `CLAUDE.md` points to it, and agents read it only when they need it.

A February 2026 study, [Evaluating AGENTS.md](https://arxiv.org/abs/2602.11988), found that context files generated by an LLM and loaded into every session made agents less successful in 5 of 8 settings and raised cost by over 20%. Nothing generated here is loaded by default.

**When the map is cheap to rebuild, check in the sources instead.**

## Understanding comes before speed

Over the next three weeks, I went from about 2 cards a day as a newcomer to between 35 and 60. Each change I made to speed things up depended on understanding the system first. You can't move a check to a cheaper layer if you don't know what it protects.

## Principles from this post

- **Have the agent quiz you, and go deeper only once you pass.**
- **Every fact needs proof. Without it, the fact stays `UNKNOWN`, for the agent and for you.**
- **Build the big picture yourself. Go deep when a card needs it.**
- **When the map is cheap to rebuild, check in the sources instead.**
