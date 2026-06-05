---
layout: post
comments: true
author: Karun Japhet
title: 'The Judgement Pyramid: Reasoning vs Measurement'
description: 'Every check in an AI-assisted workflow runs at one of three layers: deterministic tools, LLM, or human. Push every check to the lowest layer it can run on.'
category: intelligent Engineering
tags:
  - ai-assisted-development
  - ai-patterns
  - engineering-principles
  - code-quality
image: /assets/images/posts/2026-05-20-the-judgement-pyramid/cover.png
series: "Human Judgment in the AI Age"
series_part: 1
devto: true
devto_tags:
  - ai
  - programming
  - productivity
  - architecture
---

[![A three-tiered cutaway workshop with a glowing envelope descending between layers]({{ site.url }}/assets/images/posts/2026-05-20-the-judgement-pyramid/cover.png){: .diagram-lg}]({{ site.url }}/assets/images/posts/2026-05-20-the-judgement-pyramid/cover.png)

A team I was talking to had built a code-review skill in Claude Code. It looked good: a careful prompt, a set of rules, and examples. Then it shipped a PR with a nested recursive loop inside another recursive loop. Cyclomatic complexity any static analyser ([PMD](https://pmd.github.io/), [radon](https://radon.readthedocs.io/), [ESLint's complexity rule](https://eslint.org/docs/latest/rules/complexity)) would have flagged in milliseconds. The skill missed it.

The team's response was to iterate the skill. More examples. More rules. A few more lines of prompt. The [context window kept ballooning]({{ site.url }}/blog/2025/12/31/context-engineering-for-ai-assisted-development/#what-goes-wrong). I think the skill wasn't the problem. The placement was. The LLM was being asked to *reason* about something a tool can *measure*.

## The Judgement Pyramid

Every check in your AI-assisted workflow runs at one of three layers.

![Three-tier pyramid: deterministic tools at the bottom, LLM judgement in the middle, human judgement at the top. Cost and judgement required both climb upward.](/assets/images/posts/2026-05-20-the-judgement-pyramid/judgement-pyramid.svg)

The metaphor borrows from the [testing pyramid](https://martinfowler.com/bliki/TestPyramid.html): a stack ordered by cost and reliability. This one orders by *how much judgement the check needs*. The bottom is measurement: questions with a deterministic answer for a given input. The middle is soft judgement: style, design quality, naming, abstraction fit. The top is irreducible human judgement: does this serve the user, the team, the business.

Cost climbs with judgement too. Not money, necessarily. Cognitive load. Time. Attention. The bottom layer runs in milliseconds and costs nothing. The middle burns tokens and produces a different answer each time you ask. The top costs a person's focus, which is the most finite thing in the system.

The rule is simple: push every check to the lowest layer that can do it reliably.

## Reasoning vs measurement

The useful question isn't *can the LLM do this*. Usually it can. The question is *should it*.

You wouldn't format code by hand. You'd run a formatter. Not because you can't think about indentation, but because thinking about indentation is wasted thinking. A formatter is the right tool because formatting is a measurement, not a judgement.

Cyclomatic complexity is a measurement. Coverage delta is a measurement. So is dead-code detection. So is whether two functions are near-duplicates, whether the import resolves, whether the test contains an assertion, whether the file ends with a newline. All of these have deterministic answers for a given input.

> If a check has a deterministic answer for a given input, it's measurement. If it depends on context, taste, or domain knowledge, it's judgement.

Measurement belongs at the bottom of the pyramid. Judgement belongs higher.

## Apex creep

Work creeps up the pyramid. The LLM is the most visible tool in the room, so checks gravitate toward it, even when a linter would do the job faster, cheaper, and more reliably. I'll call this *apex creep*: the steady drift of work toward the most expensive layer that can technically do it.

You recognise the symptom. A review skill that keeps growing. A prompt that gains a few lines every sprint. A team that keeps tuning the LLM to catch a class of bug a static analyser would flag for free. Each iteration adds more rules and more examples. The skill works harder. The placement is still wrong.

Apex creep is a placement bug. The fix is not a smarter LLM. The fix is moving the check to the layer that handles it deterministically.

## The push-down move

Two questions to ask of every check in your harness.

**Is this reasoning, or measurement?** If measurement, push it to a deterministic tool. [Sonar](https://www.sonarsource.com/products/sonarqube/), [Spotless](https://github.com/diffplug/spotless), [Ruff](https://docs.astral.sh/ruff/), [ESLint](https://eslint.org/), coverage gates, pre-commit hooks, complexity calculators. Write a script if no tool exists. That's how [`just lint`]({{ site.url }}/blog/2025/07/29/level-up-code-quality-with-an-ai-assistant/) got built, and that's [the Unix-philosophy move]({{ site.url }}/blog/2026/03/05/the-unix-philosophy-for-agentic-coding/) for agentic coding. Hooks fire on tool calls; CI fires on PRs; pre-commit fires on commit. Pick the cheapest layer that catches the failure and run it there.

This is [shift-left](https://en.wikipedia.org/wiki/Shift-left_testing) for AI checks: push verification as early and as cheap as it goes.

**What goes to the LLM?** Everything that genuinely needs context, taste, or cross-cutting judgement. REST endpoint shape. Naming. Abstraction fit. Whether the test asserts what the story actually asked for. Whether the change matches the intent of the design. The LLM is good at this kind of work. Once you stop using it as a linter, you've given it room to be good at it.

What goes to the human is the top of the pyramid: does this serve the goal, and is the LLM's middle-tier work good enough.

## The bottom rung isn't free

Some failures hide *below* the bottom, in places where the obvious deterministic tool won't catch them.

A hallucinated import name fails on `import` or test run. A [slopsquatted](https://snyk.io/articles/slopsquatting-mitigation-strategies/) package (a real package whose name mimics a popular one, but malicious) doesn't. Both are LLM-shaped failures. The hallucinated import is caught by the bottom layer you already have. The slopsquatted package isn't.

That's not an argument for moving the check upward. It's an argument for adding the right deterministic tool to the bottom: lockfiles, allowlists, supply-chain scanners, sandboxed installs. Match the deterministic tool to the failure mode. Don't reach for the LLM because the bottom seems thin.

## This isn't a new idea

The top and the bottom have always existed. Humans have done judgement work since there's been work. Compilers, type checkers, linters, formatters, test runners, CI pipelines: the deterministic floor under us has been growing for fifty years. Most of what we call "engineering practice" is arguments about where to draw the line: what to automate, what to keep manual, what the cost-benefit looks like.

Some teams over-rotated. They under-automated and called it craft, paying a cognitive tax forever to avoid investing in a tool once. Others [over-rotated the other way](https://xkcd.com/1319/) and spent more building the automation than they ever saved.

The LLM didn't replace either layer. It added a new one in the middle: cheaper than a human, more flexible than a script, but slower and less reliable than a script on anything a script can already check. The pyramid is the same shape it's always been. We just have a new layer to misplace work on.

## Audit your harness

[Harness engineering](https://openai.com/index/harness-engineering/) is the work of 2026. Agents take longer tasks, run for longer horizons, and make more decisions before a human sees the output. The deterministic floor underneath them is the difference between an autonomous workflow you trust and one you babysit. Get placement right and autonomy compounds. Get it wrong and every increment of agent capability costs you more in review.

So open your review skill. Open your pre-commit hooks. Open the prompts you've written for grooming, testing, ops investigation. Go line by line. For each check, ask: *reasoning, or measurement?* If measurement, the LLM doesn't belong on it. Push it down.

Most teams discover their pyramid is top-heavy not because they planned it that way, but because the LLM was the easiest place to add a rule. Apex creep is what happens when "add a rule" defaults to "add a prompt."

Push it down.
