---
layout: post
comments: true
author: Karun Japhet
title: 'Optimising Cost for Agent Teams'
description: 'Fast agents get expensive fast. Routing each job to the cheapest model that can do it, and cutting context, took the cost per story from about $4.30 to about $2 without slowing down.'
category: intelligent Engineering
image: /assets/images/posts/2026-11-10-optimising-cost-for-agent-teams/cover.png
tags:
  - ai-assisted-development
  - coding-assistants
  - engineering-principles
  - productivity
series: "Trust Ladder"
series_part: 3
devto: true
devto_tags:
  - ai
  - programming
  - productivity
  - llm
---

![A workshop where a foreman automaton sorts work at a counter beside a coin counter. Most pieces go to a small automaton at the busy front bench, fewer to a medium bench, and one complex piece to a large master automaton at the back.]({{ site.url }}/assets/images/posts/2026-11-10-optimising-cost-for-agent-teams/cover.png){: .diagram-lg}

[The last post]({{ site.url }}/blog/2026/11/09/optimising-feedback-time-for-agent-teams/) made the agents fast. Fast got expensive. At peak, the work cost about $2.50 per PR, or $450 to $520 a day, at API-equivalent list price.

Then I changed which model did which job, and how much each session read. Cost per story went from about $4.30 to about $2 on the first day after, and the volume held.

If your agents are fast and the bill is climbing, this post is for you. On the [two ladders from the first post]({{ site.url }}/blog/2026/11/08/ai-maturity-is-a-lagging-indicator-of-engineering-maturity/), it's the climb to E5.

<!-- more -->

## Speed made the bill climb

In week three, my busiest days reached about 150 PRs. The cost rose with them, to between $2.40 and $2.60 per PR.

More volume was the goal, so the number to bring down was the cost of each unit of work.

## Find where the money goes first

Subagents spent about 90% of the money. The orchestrator, the one session that hands out work, spent the rest.

Caching wasn't the lever. The cache hit rate was 90 to 98% the whole time. That left two things to change: how much each request read, and which model answered it.

## Rules became checks

A rule in the rules file works only if the agent reads it and chooses to follow it. That's a [deletable net]({{ site.url }}/blog/2026/07/23/the-software-still-has-to-be-right/#not-all-nets-are-equal). A check refuses a change that breaks the rule, in seconds, whether the agent read the rule or not.

Every rule I could write as a check, I did.

When a session starts:

- the commit checks are installed, and fixed if they're missing
- a setup skill checks that the environment is healthy before agents start work

Before the agent runs a command:

- no skipping the commit checks
- no destructive commands

On every commit:

- layer and import rules
- naming
- size and complexity limits for functions and classes
- a budget for suppressed warnings
- the commit message format
- no commits to main

Before a push:

- no pushing to main, deleting it, or force pushing

The rules file shrank because the checks grew. It went from about 3,200 tokens to about 1,900. Every session loads it, so every session starts cheaper. Rules that didn't fit a check moved to files agents read only when they need them.

## Load context only when it's needed

Picking a task used to mean reading the whole task tracker, a single file of about 55,500 tokens. A query script now returns the row an agent needs in about 125.

A hook denies the bulk read. A denial on its own only blocks the agent, so the denial message also names the script. In a test, six fresh sessions answered questions about the tracker correctly with none of it loaded. The ones that tried to read the whole file were denied and switched to the script from the message alone.

Subagents now start smaller too. Their median starting context went from about 40K tokens to about 31.5K. At that volume, that's worth roughly $20 to $35 a day. It's real, but small next to the auto-compact cap and model routing.

**Make the wrong path fail, with a pointer to the right one.**

## Cap long sessions

Every request in a session sends the conversation so far, so long sessions cost the most. Some reached 400 to 530K tokens of context on a single request.

I set the auto-compact limit to 200K tokens, so a session summarises its history before it grows past that. Peak context per request fell to about 166K.

I picked 200K by experiment. Compacting too often loses time, and each summary can drop something the agent needed. Compacting too rarely means every request carries more context. After the change, the number of cards shipped a day held, so compaction didn't cost much time. The share of feedback and tech-debt PRs went down rather than up, so the summaries didn't lose much either. The cost per story fell, though the model tiers landed at the same time.

## Split files that agents share

Agents working in parallel collided on one shared file. In 14 days, 437 of 563 merges touched the tracker, and 125 of them had to reconcile changes made on main since the branch was created.

I split the tracker into 21 files by area, so cards in different areas no longer edit the same file. I haven't measured the effect yet.

A card's status also used to be written in two places that could drift apart. It now lives in one. A commit check blocks a second copy, and its error says where the value belongs.

A central ticketing system would have avoided these collisions. The trade-off is that every agent has to query an external system, and early in a project, when the team is moving fast, that overhead adds up. We plan to move to one later and bring the history across in bulk. I wasn't there at the start of this project. If I had been, I'd probably have suggested a light tracker built for agents, such as [beads](https://github.com/gastownhall/beads), with its data kept in this repo or a separate one. Once there are several developers, it's easy to host centrally.

Later, you can move to a full tracker such as Jira if you can live with the overhead, or put a thin command-line tool in front of it for your agents, like the query script I added to this repo to keep reads cheap.

## Send each job to the cheapest model that can do it

At first, I asked the orchestrator in its instructions to pick the right model for each job. It mostly didn't. The orchestrator ran on Opus, and its subagents almost always did too. Opus took 83% of requests. That was another rule the agent had to choose to follow.

So I wrote the tiers into the agent definitions, the files that set each subagent's model and instructions:

- **Cheap tier (Haiku):** small, well-defined jobs, such as a one-file fix, a merge, or watching a deploy. If a job turns out bigger than described, it stops and says so instead of guessing.
- **Mid tier (Sonnet):** research, multi-step work, and jobs that failed on the cheap tier. Its model is pinned. Without the pin, a subagent inherits the model of the session that started it, which here was Opus. That's a silent cost leak.
- **Top tier (Opus):** hard builds, reviews of large or risky changes, and jobs that have already failed on the tier below. It doesn't start agents. If a job splits, it returns the breakdown to the orchestrator.

The orchestrator sizes each job and splits the work to keep the cost down.

![How work is routed across model tiers. The orchestrator sizes each job and sends it to the cheap, mid or top tier. The cheap tier stops if a job is bigger than described. A job that fails on the cheap tier moves up to the mid tier, and one that fails on the mid tier moves up to the top tier. The top tier returns a breakdown to the orchestrator instead of starting agents.]({{ site.url }}/assets/images/posts/2026-11-10-optimising-cost-for-agent-teams/routing.svg){: .diagram-lg}

Because the cheap tier stops rather than guesses, I can trust it with real work. A job moves up one tier only after the tier below has failed at it, so moving up needs evidence. Only the orchestrator starts agents, so the decision about cost stays in one place. It's the [Judgement Pyramid]({{ site.url }}/blog/2026/05/20/the-judgement-pyramid/) again, applied to models: give each job to the cheapest one that does it reliably.

![Share of requests by model. In the mostly-Opus phase: Opus 83%, Sonnet 12%, Haiku 5%. On the first day after the tiers: Opus 30%, Sonnet 39%, Haiku 31%.]({{ site.url }}/assets/images/posts/2026-11-10-optimising-cost-for-agent-teams/requests-by-model.svg)

The work per PR stayed the same, at about 50 requests. The cost of each request halved. Cost per story went from about $4.30 in the mostly-Opus phase to about $2 on the first day after.

**Give each job to the cheapest model you trust with it. Move it up only when it fails.**

## Cheap models need fast checks

A cheap model can go first only when its mistakes are cheap to catch. Here, the commit checks from the last post run in seconds, before anything merges.

Without those checks, a cheap model's mistakes would reach review, and the cost would move there. [One comparison of a dozen models on the same feature](https://blog.apac.insight.com/2026/07/06/cost-to-a-merged-feature) found exactly that. As the coding model got cheaper, more of the cost to merge moved to the review gate.

The work on feedback time paid off twice. It made the agents fast, and it made cheap models safe to use.

**Cheap models can go first only where failure is cheap to detect.**

## Restart after changing the harness

The auto-compact limit and the tiers reached subagents only in a fresh session. In the session that was already running, the orchestrator was capped at about 167K tokens, but its subagents still ran up to about 500K. Until I restarted, I kept paying for the old setup. Claude Code needs the restart. Some newer harnesses pick up changes without one.

Both changes took effect at the same restart, so I can't say how much of the saving came from each.

**Change the harness, then restart.**

## Speed held

On the first day after the restart, 130 PRs merged at about $1.13 each, down from about $2.50 at peak. The day cost about $180, including the other repos I worked in.

That's one day. I don't have enough days after the change to call it a steady state. Across the three weeks, no PR was reverted.

## Auto-routing without the orchestrator

In theory, a dedicated classifier (like a System 1 model) that picks the model for each job should be cheaper than asking the orchestrator to do it, as long as its decisions are just as good. That's hard to test, and I couldn't get there. I tried [Laya](https://github.com/NandhaKishorM/laya) locally, but with its shorter context window, its decisions weren't good enough. TypeSafe's [Jev](https://typesafe.ai/) was next on my list, but I only had access to Anthropic's models on this project. It's an open area, and I'll keep looking into it.

## Cost is a design choice

On the ladders, this is E5. Checks report their own timings, cost is tracked per unit of work, and failure is cheap enough to detect that cheap models go first. [The first post in this series]({{ site.url }}/blog/2026/11/08/ai-maturity-is-a-lagging-indicator-of-engineering-maturity/) covers why AI can only climb as high as that engineering.

If your agents are fast and the bill is climbing, find where the money goes. Then make each job's model a rule the agent can't skip, and make sure a check catches the cheap model when it's wrong.

## Principles from this part

- **Make the wrong path fail, with a pointer to the right one.**
- **Give each job to the cheapest model you trust with it. Move it up only when it fails.**
- **Cheap models can go first only where failure is cheap to detect.**
- **Change the harness, then restart.**

*Costs are recomputed from token counts at API-equivalent list price, for this project only unless stated. Cost per story is counted from PRs linked to a story; most stories took one PR. The figures after the change come from a single day. All figures are rounded.*
