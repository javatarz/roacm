---
layout: post
comments: true
author: Karun Japhet
title: 'Optimising Feedback Time for Agent Teams'
description: 'Same repo, same AI tool, about the same code a day. About twice as many cards reached users, because checks ran in seconds instead of minutes.'
category: intelligent Engineering
image: /assets/images/posts/2026-11-09-optimising-feedback-time-for-agent-teams/cover.png
tags:
  - ai-assisted-development
  - engineering-principles
  - productivity
  - ci-cd
series: "Trust Ladder"
series_part: 2
devto: true
devto_tags:
  - ai
  - programming
  - productivity
  - testing
---

![In a lit pit lane, crews work on one part of each robot-driven race car and send it straight back out. Behind them, a long queue of cars waits outside an old single garage under a large hourglass.]({{ site.url }}/assets/images/posts/2026-11-09-optimising-feedback-time-for-agent-teams/cover.png){: .diagram-lg}

Two engineers worked on the same codebase with the same tool, Claude Code. Once the changes in this post were in place, I shipped about twice as many cards to users each day as the engineer who created the repo, about 37 against 18. Each one passed every check before it merged, and none of them were reverted.

Checks that ran in seconds made that safe. That's where the speed came from.

If agents write your code and you're still the bottleneck, this post is for you. [The first post in this series]({{ site.url }}/blog/2026/11/08/ai-maturity-is-a-lagging-indicator-of-engineering-maturity/) covers why engineering maturity sets the ceiling on AI, and [the next one]({{ site.url }}/blog/2026/11/10/optimising-cost-for-agent-teams/) covers bringing the cost down.

<!-- more -->

## The baseline was already good

The engineer who created the repo is a strong engineer. They worked with Claude Code from the first day and wrote the rules file that every agent session loads. Every commit ran a set of checks nobody could skip, in about 4 to 5 minutes. They ran several agents at once. By most standards, that's a good setup.

| | The repo's creator | After the changes in this post |
|---|---|---|
| Cards delivered per active day | ~18 | ~37 |
| Lines changed per active day | ~12K | ~13K |
| Median PR size | 9 files | 6 files |

A card is a change a user can see. Most cards took a single PR.

Two caveats. The creator's work was more greenfield than mine, over a different few weeks, so lines are a rough comparison. And I didn't start from zero. The rules file and the agent-first way of working already existed, and I built on them.

On the [two ladders from the first post]({{ site.url }}/blog/2026/11/08/ai-maturity-is-a-lagging-indicator-of-engineering-maturity/), the creator sat at E3 with A4. Agent teams ran, but every change waited minutes on its checks. A4 needs E4, and this post is that climb. [The next one]({{ site.url }}/blog/2026/11/10/optimising-cost-for-agent-teams/) is the climb to E5.

## I started at 2 cards a day

I joined the project partway through. I [onboarded myself with Claude Code]({{ site.url }}/blog/2026/11/07/use-the-agent-to-build-your-own-understanding/) in two days, and then shipped about 2 cards a day. That's a normal start for anyone new to a project.

## The backlog was the first bottleneck

I was deciding and refining every card myself. The agents could build faster than I could tell them what to build.

So the backlog work moved to agents too. An orchestrator session, one agent session that hands work to others, sends subagents to research, run spikes and draft stories. When a card would change the shape of the system, a subagent runs the impact analysis in the background and comes back with the trade-off and a question, rather than a guess. A question like this one:

> This card calls a slow external service. Doing it inline adds seconds to every request. A background job keeps requests fast, but users see the result later and we need a way to show progress. Which do you want?

I answer with the data in front of me, and refine each card for the outcome we want.

Within the first week, about 2 cards a day became 5 to 14.

Many people running lots of agents report the opposite problem. Steve Yegge's [Gas Town essay](https://yegge.ai/essays/welcome-to-gas-town/) and [a post on 3,000 PRs a month](https://mrinal.com/articles/3000-pull-requests-a-month/) both describe struggling to keep the agents fed. Here, the stories got ahead of the builders.

I run agent teams the way teams at [Sahaj](https://sahaj.ai) have always worked. A pool of people refines cards, runs spikes, builds features and shapes them with me. We take the hardest problems first, the ones that unblock the most value or other work.

## Then the agents waited on checks

By the end of the first week, I was shipping about 14 cards a day, and every commit still ran 4 to 5 minutes of checks. Each PR took 4 to 8 commits, so a single PR spent 16 to 40 minutes waiting on checks. A 4-minute check makes [every commit expensive]({{ site.url }}/blog/2025/06/23/what-makes-developer-experience-world-class/#iii-iterate-fast). You either batch changes up to pay it less often, or you wait. We kept the batches small to make [human reviews easier](https://google.github.io/eng-practices/review/developer/small-cls.html) when required, so we waited. With several agents committing in parallel, those minutes added up to agents idle and PRs sitting in the queue. [One write-up on feedback loops](https://swarmz.net/blog/fast-feedback-loop-for-an-ai-coding-agent) found that when feedback takes long enough, agents stop waiting and guess.

<picture>
  <source srcset="{{ site.url }}/assets/images/posts/2026-11-09-optimising-feedback-time-for-agent-teams/waiting-on-checks.png" media="(prefers-reduced-motion: reduce)">
  <source srcset="{{ site.url }}/assets/images/posts/2026-11-09-optimising-feedback-time-for-agent-teams/waiting-on-checks.webp" type="image/webp">
  <img src="{{ site.url }}/assets/images/posts/2026-11-09-optimising-feedback-time-for-agent-teams/waiting-on-checks.gif" alt="Animation of four agents with checks that take about 4 minutes per commit, next to the same four agents with checks that take about 50 seconds. With slow checks the agents spend 66% of their time waiting and ship 8 cards in 77 minutes. With fast checks they wait 29% of the time and ship 16." loading="lazy">
</picture>

On the ladders, this is E3 trying to carry A4. Checks in minutes work for one agent. Agent teams need checks in seconds, scoped to what changed.

## Most checks now take seconds

The [Judgement Pyramid]({{ site.url }}/blog/2026/05/20/the-judgement-pyramid/) says to push every check to the cheapest layer that does it reliably. Applied to time, the cheapest check is one that runs in seconds, before the commit lands.

| Commit type | Before | After |
|---|---|---|
| Docs only | ~4 min | 6 s |
| Infrastructure only | ~4.5 min | ~20 s |
| Code, warm workspace | ~4 min | ~50 s |
| Code, fresh workspace | ~6.5 min | ~1.5-2.5 min |

![Commit check time by commit type, before and after. Docs only went from about 4 minutes to 6 seconds, infrastructure only from about 4.5 minutes to about 20 seconds, code in a warm workspace from about 4 minutes to about 50 seconds, and code in a fresh workspace from about 6.5 minutes to 1.5 to 2.5 minutes.]({{ site.url }}/assets/images/posts/2026-11-09-optimising-feedback-time-for-agent-teams/commit-check-time.svg)

Five techniques did most of the work.

### Test the blast radius

Test everything a change touches and everything downstream of it, and nothing else. A docs-only commit can't break the code, so it no longer runs the test suite. It went from about 4 minutes to 6 seconds.

### Run cheap checks first

All the fast checks run first and report together. If any of them fails, no slow check runs. A commit with type and format errors now fails in about 8 seconds, and one with a failing test in about 34.

### Run checks in parallel

The test hooks use one worker per CPU, which took them from about 110 seconds to about 15. The infrastructure validation checks every directory at once, which took it from about 15 seconds to about 4.

### Remove needless waits

A smoke test used a real `sleep` across 30 retries. Replacing it with a fake took the test from 60 seconds to 0.04.

### Warm up new workspaces

Each agent works in its own [git worktree](https://git-scm.com/docs/git-worktree), a separate checkout of the same repo. A new worktree now starts with the type checker's caches copied from the main checkout, so its first type check takes about 1.5 seconds instead of about 18.

## Each check runs in one place

Speed also came from deciding where each check runs, and making sure none runs twice.

| Layer | When it runs | What it checks |
|---|---|---|
| Agent hooks | Before a tool call runs | Denies the bypass flag and bulk reads of large files, checks the commit message, lints the one file just edited |
| Pre-commit | Every commit, on the developer's machine | Format, lint, types, tests, secrets, architecture rules and mutation testing, all scoped to what the commit touches |
| CI | After each manual deploy | The slow, paid end-to-end evals of the system (10+ minutes) |

CI doesn't repeat the local checks. The expensive evals run once per deploy instead of once per change.

**Run each check as often as it's cheap, and never twice.** Fast checks belong on every commit. Expensive ones belong where they run least often and still catch the failure.

Some of it is still slow. On a warm code commit, the tests take 22 to 26 seconds. The first commit in a fresh worktree pays about a minute for each target of the mutation-testing gate. A deploy takes 11 to 17 minutes, most of it the eval run.

## Measure slow checks before fixing them

The agents building features started reporting commits that waited 2 to 25 minutes on the mutation-testing gate. [Mutation testing](https://stryker-mutator.io/docs/) breaks your code on purpose to prove your tests notice. Ours scores only the code changed since the branch left main. I had measured it at about a minute.

Each guess about the cause was tested on its own:

| Guess | Result |
|---|---|
| The gate rescores every earlier function on a long branch | Not seen. Earlier results were reused. |
| Each mutant runs the whole test suite | Not seen. Only the mapped tests run. |
| Starting the container is slow | Not seen. It took 0.3 seconds. |
| A cold cache is the main cost | Confirmed. Building the mutants took about 107 of 110 seconds. |
| Editing a test re-runs earlier work | Confirmed. Every function whose tests changed is scored again. |
| Gates running at the same time slow each other down | Confirmed, but small, about 20%. |

A commit reported at 20 to 25 minutes replayed in about 4. The rest couldn't be reproduced, because the reports only had the total time.

We didn't know why it was slow, so the fix was to make the gate tell us. It now prints the time for each phase, the machine's load and its mutant counts, so the next slow commit can be explained. Seeding the cache in new worktrees would have saved about 45 seconds on each one. I turned it down to keep the system simple.

**Instrument slow feedback before you optimise it.** It's the same advice as [setting a baseline before you change anything]({{ site.url }}/blog/2026/03/12/observability-for-ai-assisted-development/), applied to your own tooling.

## Quality held

Shipping more often didn't cost quality:

- No PR was reverted.
- 19 of about 1,200 PRs were closed without merging.
- About 2 bad story implementations in about 480 stories shipped.
- PRs with no story attached, meaning feedback and tech debt, were about 45% of mine in the first two weeks. In week three they fell to about 26%, while story PRs doubled.

People still refined cards for the outcome, triggered deploys and ran product demos. Code style and taste went into the commit checks. The rest of review went to agents asked to argue against the change, and they caught risks, incomplete acceptance criteria and security issues.

Cards shipped rose with the fast checks. In week two they went from about 14 a day to between 35 and 60, and in week three the busiest days reached about 110. No model upgrade landed during those three weeks.

Everyone in this data is a senior engineer. I'm not claiming the same result for less experienced developers.

## The checks are for agents

Branch protection wasn't available on the plan we used, so every check runs on the developer's machine. A determined person can still get past them. They're there to stop agents taking shortcuts.

A few other limits are deliberate. Known gaps in the push guard are written down and left open. CI doesn't re-run the local checks yet. That waits until the harness can safely work on itself.

**Trust has edges. Write them down.**

## Speed up checks before adding agents

The repo and the tool didn't change. About twice as many cards still reached users. The speed came from where the checks sit, not from more agents or a better model. Each small change spent less time waiting. [Gene Kim and Steve Yegge](https://itrevolution.com/product/vibe-coding-book/) and [poteto](https://barnabyrobson.org/on-pstack/) both describe this work as running a kitchen. In those terms, the cooks and the knives stayed the same. The kitchen changed.

If agents write your code and you're still the bottleneck, find the slowest check a person or an agent waits on, and make it fast before adding the next agent.

The speed came at a price. At peak, it cost about $2.50 per PR at API-equivalent list price. [The next post]({{ site.url }}/blog/2026/11/10/optimising-cost-for-agent-teams/) is how that came down to $1.13 without slowing down.

## Principles from this part

- **Push every check to the cheapest layer that does it reliably** ([the Judgement Pyramid]({{ site.url }}/blog/2026/05/20/the-judgement-pyramid/)).
- **Run each check as often as it's cheap, and never twice.**
- **Instrument slow feedback before you optimise it** ([baseline first]({{ site.url }}/blog/2026/03/12/observability-for-ai-assisted-development/)).
- **Trust has edges. Write them down.**

*PR counts, sizes and timing come from the repo's history. Cards a day are estimated from each week's share of PRs linked to a story. Commit times were measured on the developer's machine. All figures are rounded. Costs are recomputed from token counts at API-equivalent list price.*
