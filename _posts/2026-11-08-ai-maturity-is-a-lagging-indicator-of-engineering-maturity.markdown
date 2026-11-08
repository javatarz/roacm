---
layout: post
comments: true
author: Karun Japhet
title: 'AI Maturity Is a Lagging Indicator of Engineering Maturity'
description: 'Teams want more autonomous agents and faster delivery. What makes agents autonomous, fast and affordable is the engineering underneath them.'
category: intelligent Engineering
image: /assets/images/posts/2026-11-08-ai-maturity-is-a-lagging-indicator-of-engineering-maturity/cover.png
tags:
  - ai-assisted-development
  - engineering-principles
  - leadership
  - productivity
series: "Trust Ladder"
series_part: 1
devto: true
devto_tags:
  - ai
  - programming
  - productivity
  - career
---

![Engineers bolt the next level of scaffolding onto a tall stone tower while brass robots climb ladders fixed to it. One ladder stands on its own beyond the top of the scaffolding, and the robot on it wobbles.]({{ site.url }}/assets/images/posts/2026-11-08-ai-maturity-is-a-lagging-indicator-of-engineering-maturity/cover.png){: .diagram-lg}

Two engineers worked on the same repo with the same AI tool, Claude Code. The engineer who created the repo had a strong setup. After I changed the engineering around the agents, I shipped about twice as many cards a day as they had. Then the cost per story fell by more than half, and the speed held.

Teams want more autonomous agents and faster delivery. What makes agents autonomous, fast and affordable is the engineering underneath them. AI maturity climbs only as far as engineering maturity lets it.

If you're deciding where to invest so your teams can work well with agents, this post is for you. [The next post]({{ site.url }}/blog/2026/11/09/optimising-feedback-time-for-agent-teams/) covers how the speed came, and [the one after]({{ site.url }}/blog/2026/11/10/optimising-cost-for-agent-teams/) covers how the cost came down.

<!-- more -->

## AI maturity and engineering maturity are separate ladders

- **AI maturity is the autonomy you grant.** It's how much of the delivery loop runs without a person checking each step.
- **Engineering maturity is the trust you've automated.** It's how much of that checking is automated, fast and deterministic. It isn't process or review ceremony.

The AI autonomy levels run from A0 to A5. Each is defined by the check a person no longer does.

| Level | Name | AI does | A person still checks |
|---|---|---|---|
| A0 | No AI | Nothing | Everything |
| A1 | Autocomplete | Suggests the next lines | Every line |
| A2 | Task assistant | Bounded tasks on request, in chat | Every task's output, and fits it in by hand |
| A3 | Pair | One agent makes whole changes | Every change |
| A4 | Agent teams | Agents research, build and review in parallel | Direction and outcomes |
| A5 | Self-improving agent teams | Agents tune their own setup: which model, which check, what to fix next | Goals and limits |

The engineering maturity levels run from E0 to E5. Each is defined by how much checking is automated, and how fast.

| Level | Name | What it looks like |
|---|---|---|
| E0 | Manual | Build, test and deploy by hand. Rules live in people's heads. |
| E1 | Tests in CI | Automated tests run after a push, in tens of minutes. Review catches most problems. |
| E2 | Fast local feedback | Fast feedback for a person on their own machine. Formatting and linting are automated. Tests are trusted. |
| E3 | Checks on every commit | Checks nobody can skip run before every commit, in minutes. Rules are written as code. Small changes merge to main. |
| E4 | Scoped, parallel checks | Checks scoped to what changed run in parallel, in seconds to a minute. Agents work in separate copies of the repo without colliding. Small stories are ready before agents need them. Slow checks run once per deploy. |
| E5 | Measured feedback | Checks report their own timings. Cost and quality are tracked per unit of work. Failures are cheap enough to catch that cheap models go first. The agents' setup has its own checks, so agents can change it safely. |

A team can stand at different levels on each ladder. The engineer who created this repo ran A4 on E3. At the bottom, the link between the two is loose. At A1, a person reads every line, so the person is the check. Linting helps, but nothing has left the person's hands. From A2 up, the AI writes more than a person can check by reading, and the link gets tighter. At A4 and A5 it's strict.

![Two ladders side by side. On the left, AI autonomy levels A0 to A5: no AI, autocomplete, task assistant, pair, agent teams, self-improving agent teams. On the right, engineering maturity levels E0 to E5: manual, tests in CI, fast local feedback, checks on every commit, scoped parallel checks, measured feedback. Each A level is joined to the E level with the same number. The joins get stronger up the ladder: faint for A0 and A1, lighter for A2, and solid from A3 up.]({{ site.url }}/assets/images/posts/2026-11-08-ai-maturity-is-a-lagging-indicator-of-engineering-maturity/two-ladders.svg){: .diagram-lg}

The term comes from [poteto's trust ladder](https://barnabyrobson.org/on-pstack/), which describes the verification and preparation that make it reasonable to trust agents with more. Here, each rung pairs a check that left a person's hands with a measured change in speed or cost. Other ladders, such as [Dan Shapiro's five levels](https://www.danshapiro.com/blog/2026/01/the-five-levels-from-spicy-autocomplete-to-the-software-factory/), are defined by what the operator does. These are defined by which check has been replaced.

## Every step up in speed needs better engineering

We used to judge speed against what a person could do. Now the expectation is that agents should go as fast as they can. But speed is relative, and each step up needs an investment in the fundamentals.

You can go faster on weaker engineering, but each change costs more. Many teams that look faster are paying for it in one of three ways:

- Bugs, when problems are caught after deploy. [DORA's 2025 report](https://cloud.google.com/blog/products/ai-machine-learning/announcing-the-2025-dora-report) found that without strong automated testing and fast feedback, more changes lead to more instability.
- Rework, when problems are caught before deploy. [A Stanford study of developer productivity](https://ai.engineer/talks/tbDDYKRFjhk-ai-developer-productivity) found a gross gain from AI of 30 to 40%, which fell to 15 to 20% once rework was counted. [Faros](https://www.faros.ai/blog/ai-software-engineering) found teams merged 98% more PRs and spent 91% more time on review, with no improvement at company level.
- A bigger bill, when slow loops and expensive models do work that fast checks and cheaper models could. In this repo, a story cost about $19 at the end of week one. Once the checks ran in seconds, it cost about $4.30, on the same model. Routing work across cheaper models then brought it to about $2. The cheaper models could take on that work only because the checks caught their mistakes quickly.

Each step up the AI ladder takes a check off a person. That's only safe when something cheaper does the check reliably. It's the [Judgement Pyramid]({{ site.url }}/blog/2026/05/20/the-judgement-pyramid/) applied to autonomy: push every check to the cheapest layer that does it reliably.

**The less a person checks, the more the engineering has to.** At the top of the ladders, that's strict: A4 needs E4, and A5 needs E5. Without it, the extra speed turns into rework.

## A strong setup was still two levels short

The engineer who created the repo worked with Claude Code from the first day. They wrote the rules file every agent session loads and ran several agents at once, and every commit ran checks nobody could skip. That's A4 running on E3. It worked, but every change waited 4 to 5 minutes on its checks, and the agents waited with it.

Getting to E4 meant checks in seconds, scoped to what changed, and stories ready before the agents needed them. Getting to E5 meant tracking cost per unit of work, and catching failures cheaply enough that cheaper models could go first. Cards a day doubled, the cost per story more than halved, and no PR was reverted.

On a base this strong, the climb was small, and agents did most of the engineering work. On a weaker base, the foundations are where you invest first, and more AI doesn't skip them.

## AI on weak engineering turns into rework

Engineering maturity works like a ceiling on AI maturity.

![A chart with engineering maturity on the horizontal axis and AI autonomy on the vertical axis. A thick curved line marks the ceiling. It starts at about A1 on E0, rises through A2 at E2 and A3 at E3, and reaches A4 at E4 and A5 at E5. Above the line is the unsafe zone, where rework, waiting and cost rise. On the line, AI uses what the engineering supports. Below it is headroom, engineering that could support more autonomy than the team uses.]({{ site.url }}/assets/images/posts/2026-11-08-ai-maturity-is-a-lagging-indicator-of-engineering-maturity/ceiling.svg){: .diagram-lg}

Above the line, teams adopt agents faster than their checks. Output goes up, and so do rework, review load and cost. On the line is where you want to be, with AI using what the engineering supports. Below it is headroom: engineering that could support more autonomy than the team uses.

The repo's creator sat just above the line, at A4 on E3. Their checks couldn't be skipped, so it showed up as waiting rather than rework.

The wider data points the same way. DORA's report also found that AI amplifies what's already there: strong teams get better, and struggling teams find their problems get worse. [CircleCI's 2026 report](https://circleci.com/blog/five-takeaways-2026-software-delivery-report/) found throughput rose 97% for the top 5% of teams, 4% for the median team, and not at all for the bottom quarter.

**Raise the engineering ceiling before buying more autonomy.**

## Answers to the usual objections

**Agents speed teams up at every level of maturity.** [One 2026 study](https://arxiv.org/html/2608.25241) found agents raised commits by 28 to 38% at every level. Quality diverged, though: repos without AI configuration saw about twice the rise in complexity. Speed without the checks shows up later, as rework and review load.

**Frontier models make the foundations matter less.** [One study](https://arxiv.org/abs/2601.02200) found code quality made no difference to whether Claude Code finished a task. I used frontier models throughout. There, the problem is cost, and cheap models can go first only when failure is cheap to catch.

**Less experienced developers gain more.** Studies find they do, in raw speed. But then safety becomes the problem, and the checks are what make it safe. Everyone in my data is a senior engineer, so I'm not claiming the same result for less experienced developers.

**Mature teams are slower with AI.** [METR's slowdown study](https://metr.org/blog/2025-07-10-early-2025-ai-experienced-os-dev-study/) was run on repos with high standards. Maturity here doesn't mean more review or process. It means checks that are automated, fast and deterministic.

## Find the level that caps your teams

Each column shows the answers a team needs to run that AI level well. "N/A" means the question doesn't matter yet, and "Same" means no change from the level before. Find the first column where your answers stop matching. That's your ceiling, and the row that doesn't match is where to invest before buying more autonomy.

| Question for your teams | A1<br><small style="font-size: 0.7em">Autocomplete</small> | A2<br><small style="font-size: 0.7em">Task assistant</small> | A3<br><small style="font-size: 0.7em">Pair</small> | A4<br><small style="font-size: 0.7em">Agent teams</small> | A5<br><small style="font-size: 0.7em">Self-improving</small> |
|---|---|---|---|---|---|
| How long until someone, or an agent, learns a change is broken? | N/A | Minutes, on your own machine | Minutes, before every commit | Seconds to a minute | Same |
| What stops a change from breaking a team rule? | N/A | Formatting and linting are automated | Rules are checks nobody can skip | Same | Same |
| How big is a typical change, and how fast does it reach main? | N/A | N/A | Hours to days of work, merged in hours | Minutes to hours of work, merged in minutes | Same |
| Is ready work piling up faster than you can build it? | N/A | N/A | N/A | Small, refined stories queue ahead of capacity | Same |
| When AI gets something wrong, what catches it first? | A person<br>reading | A person<br>helped by tests | Tests run by agent | Optimised pre-commit | Same |
| What tracks AI cost and quality? | A person, with an observability dashboard | Same | Same | Same | Agents, with cost and quality per change |

The thresholds are fixed so you can check them. The real bar moves: feedback has to come back faster than an agent writes its next change, and agents keep getting faster.

## Invest in engineering first

If you want your engineers working with agent teams, start with the engineering. Make the checks ones nobody can skip, make them run in seconds, and write rules as code. Then measure cost and quality per unit of work. On a strong base, AI helps build the next level quickly. On a weak one, the base is where you invest first.

[The next post]({{ site.url }}/blog/2026/11/09/optimising-feedback-time-for-agent-teams/) shows how the checks got fast, and [the one after]({{ site.url }}/blog/2026/11/10/optimising-cost-for-agent-teams/) shows how the cost came down.

## Principles from this part

- **Each step up the AI ladder takes a check off a person. It's only safe when something cheaper does the check reliably.**
- **The less a person checks, the more the engineering has to.**
- **Raise the engineering ceiling before buying more autonomy.**

*Cards a day are estimated from each week's share of PRs linked to a story. Costs are recomputed from token counts at API-equivalent list price, and cost per story is counted from PRs linked to a story. The $19 and $2 figures each come from a single day, and part of the early drop is fixed overhead spread over more stories. All figures are rounded.*
