---
layout: post
comments: true
author: Karun Japhet
title: "The Unix Philosophy for Agentic Coding"
description: "Why AI coding agents should orchestrate deterministic tools instead of solving every problem themselves, and how the Unix philosophy applies to agentic workflows."
category: intelligent Engineering
tags:
  - ai-assisted-development
  - ai-patterns
  - coding-assistants
  - engineering-principles
image: /assets/images/posts/2026-03-05-the-unix-philosophy-for-agentic-coding/cover.png
devto: true
devto_tags:
  - ai
  - programming
  - productivity
  - architecture
---

Most people use AI coding agents backwards. They hand the agent a problem and ask it to solve the whole thing. The agent reads, reasons, generates, and hopes for the best.

There's a better way. One that's cheaper, more predictable, and already well understood. It's the [Unix philosophy](https://en.wikipedia.org/wiki/Unix_philosophy), applied to how we work with AI.

<!-- more -->

[![A robotic conductor directing an orchestra of developer tools]({{ site.url }}/assets/images/posts/2026-03-05-the-unix-philosophy-for-agentic-coding/cover.png){: .diagram-lg}]({{ site.url }}/assets/images/posts/2026-03-05-the-unix-philosophy-for-agentic-coding/cover.png)

## The Pattern

The Unix philosophy boils down to: do one thing well, compose small tools, let the shell orchestrate. When you work with an AI coding agent, the agent is the shell.

Here's how I think about it:

1. **Break the problem down.** Don't hand the agent a big, vague goal. Decompose it into sub-problems.
2. **If a tool exists, use it.** Refactoring, formatting, linting, deployment: these are solved problems. Don't ask the AI to reinvent them.
3. **If no tool exists, build one.** A small, deterministic script is better than an LLM making judgment calls where none are needed.
4. **The agent orchestrates.** It decides what to do, in what order, with which tools. That's where its intelligence adds value.

The principle is simple: **don't let AI make decisions it doesn't need to make.**

Every unnecessary decision is a degree of freedom. Every degree of freedom is an opportunity for the model to get something wrong, burn tokens, and produce a result you can't reproduce.

## What Goes Wrong Without This

When you ask an AI agent to do something a deterministic tool already handles, you get:

- **Inconsistency.** LLMs aren't deterministic. Run the same prompt twice, get different results. A tool gives you the same output every time.
- **Wasted tokens.** Generating 200 lines of reformatted code costs tokens. Running [Prettier](https://prettier.io) or [Ruff](https://docs.astral.sh/ruff/) costs nothing.
- **More failure modes.** The model might miss edge cases a dedicated tool handles by design. A refactoring tool knows about downstream dependencies. An LLM might not.
- **Slower feedback loops.** Generating code, reviewing it, finding the error, regenerating: that cycle is slower than calling a tool that gets it right the first time.

## Examples

### Refactoring

I want to rename a method. The method is used across dozens of files.

The naive approach: ask the agent to read the codebase, find all references, and rewrite them. The agent will try. It might miss some. It might introduce a formatting inconsistency along the way. You'll spend time reviewing a diff that's harder to trust.

The better approach: the agent calls [IntelliJ's refactoring tools via MCP](https://www.jetbrains.com/help/idea/mcp-server.html). One command. Every reference updated. Downstream dependencies handled. No formatting changes. No guesswork.

Refactoring is a solved problem. I wouldn't ask a teammate to do a manual find-and-replace across a codebase. I wouldn't ask an AI agent to either.

### Analysing CSV Data

I have a set of CSVs I need to extract insights from.

The naive approach: hand the files to the agent and ask it to read, validate, extract, and summarise everything. The agent will try. It might misparse a column, silently drop malformed rows, or hallucinate a trend that isn't there. You won't know unless you check every step. Large CSVs make this worse. Hundreds of thousands of rows won't fit in a context window, and even if they did, you're burning tokens on data the model doesn't need to see. The agent doesn't know which rows matter until it's processed all of them.

The better approach: build a small CLI that pre-processes the data first. Validate schemas, flag missing values, confirm row counts, filter to the relevant subset, compute the aggregations that don't need intelligence. This is deterministic work. Then pass the clean, reduced output to the agent for the part that actually needs judgment: identifying patterns and summarising insights.

No tool existed for this specific validation, so I asked the agent to build one. That's the pattern. Build the tool, then use the tool. The agent wrote a script I can run repeatedly with predictable results. Now it's free to focus on what it's good at.

### Code Formatting

I want my code to follow our team's style guide.

The naive approach: include the style guide in the prompt and ask the agent to follow it. It will mostly comply. It will sometimes get creative (especially as [context fills up]({{ site.url }}/blog/2025/12/31/context-engineering-for-ai-assisted-development/)). You'll find inconsistencies across files that are annoying to track down.

The better approach: let the agent write code however it wants, then run [Prettier](https://prettier.io), [Black](https://github.com/psf/black), [Ruff](https://docs.astral.sh/ruff/), or [ESLint](https://eslint.org). Zero ambiguity. The agent doesn't need to think about formatting at all, which means fewer tokens spent and fewer decisions that could go wrong.

## Skills, Hooks, and Tools

If you use [Claude Code](https://docs.anthropic.com/en/docs/claude-code), you'll know about skills (composable prompt-driven capabilities) and hooks (event-driven automation). These are the wiring. But wiring without workers doesn't accomplish much.

A good skill is composable. A great skill is composable and delegates to deterministic tools instead of taking on responsibilities it doesn't need. If a skill invokes a CLI tool, an API, or a build system instead of asking the LLM to reason through a solved problem, that skill will be faster, cheaper, and more reliable.

The same applies beyond Claude Code. Cursor rules, Windsurf workflows, any AI assistant: the pattern holds. Build your workflows so the AI orchestrates tools, not replaces them.

## The Bigger Picture

This isn't just about code formatting and refactoring. The same principle applies to deployment pipelines, database migrations, CI/CD workflows, building CLIs for business operations. Anywhere a deterministic tool can guarantee a correct result, use it. Reserve the LLM for the parts that genuinely need judgment: understanding intent, choosing an approach, reasoning about trade-offs, writing novel logic.

Not every problem needs this treatment. For exploratory work, prototyping, or genuinely novel problems, letting the agent roam is the right call. But for the repeatable parts of your workflow, reach for a tool.

The best AI workflows I've built look like Unix pipelines. Small, focused tools. A smart orchestrator composing them. The AI's value isn't in doing everything. It's in knowing what to do and calling the right tool to do it.

---

_Thanks to [Carmen Mardiros](https://www.linkedin.com/in/carmenmardiros/) whose [talk at Data Engineers London](https://www.meetup.com/data-engineers-london/events/313209661/) helped crystallize this thinking._
