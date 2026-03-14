---
layout: post
comments: true
author: Karun Japhet
title: "Observability for AI-Assisted Development"
description: "What we can measure about AI-assisted development today, what's missing, and the questions solution builders should be answering."
category: intelligent Engineering
tags:
  - ai-assisted-development
  - ai-patterns
  - coding-assistants
  - engineering-principles
image: /assets/images/posts/2026-03-12-observability-for-ai-assisted-development/cover.png
devto: true
devto_tags:
  - ai
  - programming
  - productivity
  - discuss
---

Developers using AI estimate they're 24% faster. A randomised controlled trial measured them at 19% slower.

That's from METR's [2025 study](https://metr.org/blog/2025-07-10-early-2025-ai-experienced-os-dev-study/). These were experienced open-source developers working on their own codebases with tools they chose. Their self-assessment was off by over 40 percentage points.

If your perception of AI's impact is that unreliable, what are you actually measuring?

<!-- more -->

[![A figure in a boat on foggy water, holding a lantern that barely illuminates the surrounding mist]({{ site.url }}/assets/images/posts/2026-03-12-observability-for-ai-assisted-development/cover.png){: .diagram-lg}]({{ site.url }}/assets/images/posts/2026-03-12-observability-for-ai-assisted-development/cover.png)

## You Need a Baseline First

If you didn't measure before AI, measuring with AI won't work.

You can't attribute improvements to AI if you don't know what "before" looked like. Cycle time, deployment frequency, change failure rate, MTTR, value delivered per sprint: these need to exist as baselines before you introduce a new variable. Otherwise you're guessing, and as the METR study shows, our guesses aren't great.

I've seen teams adopt AI coding assistants and then ask "how do we know it's helping?" three months later. The real question is six months earlier: "how do we measure effectiveness?" If you didn't have that defined before AI, you won't have it now.

## What Exists Today

The tooling for observability in AI-assisted development is fragmented. Cost visibility is reasonable. Quality visibility is nearly zero.

**Claude Code** is the most transparent. It ships with native [OpenTelemetry support](https://code.claude.com/docs/en/monitoring-usage), tracking tokens, cost, tool calls, and session duration. The `/cost` command shows real-time spend. `/stats` visualises daily usage, session history, and model preferences. `/insights` goes further, analysing your sessions to surface project areas, interaction patterns, and friction points. Commits are auto-tagged with a co-author line, giving you a built-in "was this AI-generated?" marker in your git history. Anthropic provides an [official monitoring guide](https://github.com/anthropics/claude-code-monitoring-guide) with Grafana dashboard configs and a Docker Compose setup, and the community has built [importable dashboards](https://grafana.com/grafana/dashboards/24640-claude-code-victoriastack/) and [plugins](https://grafana.com/grafana/plugins/timurdigital-claudestats-app/). The infrastructure for collecting data exists. What to do with it is the harder question.

**OpenAI Codex CLI** tags commits with a co-author line and supports [OTel export](https://developers.openai.com/codex/cli/) for logs and traces. The [enterprise dashboard](https://developers.openai.com/codex/enterprise/governance/) tracks daily users by product, code review completion rates, review priority and sentiment, and session-level message counts. It's adoption-focused: who's using what and how much. No quality metrics, no incident correlation, no rework tracking. Individual developers get `/status` for rate limits but no cost visibility.

**Aider** has the [most configurable commit attribution](https://aider.chat/docs/git.html) of any tool (co-author trailers include the model name). But no OTel, no dashboard, no persistent cost history.

**GitHub Copilot** offers [team-level dashboards](https://docs.github.com/en/copilot/concepts/copilot-usage-metrics/copilot-metrics): acceptance rates, DAU/MAU, feature adoption. It's oriented toward "is our license worth it?" rather than "is the output good?" No commit tagging.

**Cursor** exposes very little. A "Year in Code" summary and an "AI Share of Committed Code" metric. No tracing, no commit tagging, no event-level data.

**Cline** shows per-request cost in the UI (one of its standout features) and supports [OTel export at the enterprise tier](https://docs.cline.bot/more-info/telemetry). No commit tagging.

**Amazon Q Developer** has the [richest built-in analytics dashboard](https://docs.aws.amazon.com/amazonq/latest/qdeveloper-ug/dashboard.html) of any tool: acceptance rates, lines of code by feature type, code review counts, per-language breakdowns. But it's admin-only, subscription-based (no per-token tracking), and publishes to CloudWatch rather than OTel.

Some of us have built our own layers on top. We use [Claude Code Usage Monitor](https://github.com/Maciek-roboblog/Claude-Code-Usage-Monitor) to track token usage as a proxy for understanding consumption patterns. It isn't perfect, isn't always accurate, but it gives you a feeling for where your usage goes. A few engineers on our teams have personal Grafana dashboards tracking their own AI metrics. But these aren't centralised, aren't standardised, and aren't as useful as they could be.

The picture across the industry: cost visibility is reasonable if you're willing to set it up. Commit tagging is inconsistent (Claude Code and Codex do it by default, most others don't). Quality visibility is nearly zero everywhere.

## What's Missing

The gaps fall into three levels: what individual developers need, what teams need, and what organisations need.

### For the Individual Developer

**No effort distribution.** You know how much you spent in tokens. You don't know where that effort went. Imagine if your AI assistant could tell you: "This week, 40% of your AI time went to test writing, 30% to refactoring, 20% to feature work, 10% to debugging. Your test-writing sessions had the highest acceptance rate. Your debugging sessions cost the most tokens per useful output." That would let you consciously decide where AI is worth using and where you're better off working without it.

**Limited failure pattern detection.** Claude Code's `/insights` is the closest thing we have: it analyses sessions and surfaces friction points. That's a real start, and most other tools don't offer anything comparable. But it's still a snapshot of recent sessions, not a long-running trend line. If the AI keeps making the same category of mistake (wrong import paths, ignoring your test conventions, using a deprecated API), you want something that surfaces "you've corrected the AI on import paths 12 times this month" and suggests adding it to your CLAUDE.md. Some people maintain a manual `lessons-learned.md` where they log AI mistakes. It works, but it's ad hoc.

**No context effectiveness feedback.** CLAUDE.md files are checked in, reviewed in PRs, and engineered for effectiveness over time, much like prompts. The feedback loop exists but it's manual and slow. You notice the AI getting something wrong, update the file, and see if it improves. What's missing is the measurement that closes the loop: did that change actually improve output quality, or did it just feel like it did? The METR perception gap applies here too.

### For the Team

**No aggregate failure patterns.** If three engineers on the same team are all hitting the same AI failure mode, that's not three individual problems. It's a systemic context gap: a missing architectural convention, an undocumented pattern, a guardrail that should exist but doesn't. No tool surfaces this today.

**No RCA correlation.** Claude Code tags commits with a co-author line. That's the "was this AI-generated?" link in the RCA chain. But other tools don't do this consistently. And even with the tag, nobody is aggregating that data: correlating AI-tagged commits with incident rates, rework rates, or review times over time. Traditional RCA follows a clear chain (incident → deployment → commit → PR → review → root cause). AI adds a question to that chain: was the reviewer's miss caused by a large AI-generated diff? Was the AI missing context it should have had? Is this a known AI weakness that should be in the team's guardrails?

**The velocity flatline problem.** We've seen this firsthand. Teams get faster with AI. Then velocity flattens. Not because AI stopped helping, but because teams redirected the extra capacity to paying off debt or solving problems they found interesting. That's not necessarily bad, but if you're not tracking what work goes where, you can't tell the difference between "team is investing in sustainability" and "team is coasting."

The fix we found: track work against cards. Measure total value delivered, not just pace. Make sure the extra capacity from AI shows up as increased value, not just different work. This is a process fix, not a tooling fix. No observability tool surfaces this today.

### For the Organisation

**No cross-team maturity view.** Some teams will be excellent at AI-assisted development. Others will struggle. As a CTO, you need to know which is which, and more importantly, what the effective teams are doing differently. Are they better at context engineering? More disciplined about review? Today, finding this out requires manual investigation.

**No automated "are we improving?" picture.** This is the hardest gap. Drawing a full picture of whether an engineering organisation is improving has always required someone to build that view manually. AI hasn't changed that. It's just added another variable.

The data exists. Commits are tagged. Tickets track value. CI tracks quality. AI tools track cost and usage. But nobody is stitching them into a coherent picture that answers: "Is AI helping us deliver more value, or is it making us feel faster while quality degrades?"

## What We'd Like to See

Here's what I wish existed:

**AI timesheets.** Not for billing. For self-awareness. Show me where my AI time goes, which task types have the best return, and where I'm burning tokens for low value. Let me compare across weeks and see trends.

**Automated RCA tagging.** Correlate AI-tagged commits with downstream incidents, reverts, and rework. Not to blame the tool, but to know where to invest in better review, context, or guardrails.

**Context effectiveness scoring.** When I change my CLAUDE.md, show me whether output quality improved for the task types I was targeting. Even a rough signal (fewer corrections needed, lower rework rate) would be valuable.

**Failure pattern aggregation.** Surface repeated AI mistakes at the team level. If the same failure shows up across engineers, flag it as a context gap, not an individual problem.

**The org-wide picture, stitched together.** Combine git data, ticket data, CI data, and AI usage data into a view that answers: are we delivering more value? Is quality holding? Where should we invest next?

## Questions for Solution Builders

If you're building in this space, here are the questions I'd want answered:

1. **Can the "are we improving?" picture be automated?** The data is there (git, tickets, CI, AI usage). Can you stitch it together without someone manually maintaining a dashboard? Can you infer value delivery trends from data that already exists?

2. **How do you measure context effectiveness without controlled experiments?** A/B testing CLAUDE.md configurations isn't practical in real workflows. What proxy signals can tell us whether a context change helped?

3. **What does a useful AI timesheet look like?** Not session-level token counts, but task-level effort distribution. How do you classify AI sessions by task type without requiring the developer to manually tag them?

4. **How do you surface failure patterns across a team?** Individual correction patterns are noisy. Aggregate patterns are signal. What's the right level of abstraction?

5. **How do you separate "AI made us faster" from "we redirected capacity"?** Velocity metrics alone can't tell you this. What combination of signals can?

6. **How do you handle the perception gap?** Developers believe they're faster. Measurement sometimes shows otherwise. How do you present this data in a way that's constructive rather than demoralising?

These aren't rhetorical questions. If you're building tools in this space, I'd like to hear your answers.

---

_This is the second post in a series on applying patterns from agentic systems to everyday AI-assisted development. The first, [The Unix Philosophy for Agentic Coding]({{ site.url }}/blog/2026/03/05/the-unix-philosophy-for-agentic-coding/), covers deterministic tool delegation._
