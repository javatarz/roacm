---
layout: post
comments: true
author: Karun Japhet
title: "Agentic Patterns Developers Should Steal"
description: "Nine patterns from production agentic systems that most developers using AI coding assistants haven't adopted yet, and why they should."
category: intelligent Engineering
tags:
  - ai-assisted-development
  - ai-patterns
  - coding-assistants
  - engineering-principles
image: /assets/images/posts/2026-03-19-agentic-patterns-developers-should-steal/cover.png
devto: true
devto_tags:
  - ai
  - programming
  - productivity
  - architecture
---

Production agentic systems decompose problems and use the right tool for each step. Most developers hand the AI the whole problem.

That's the gap. Teams building production AI workflows have developed patterns for making AI reliable. Developers using AI coding assistants like Claude Code, Cursor, or Copilot mostly haven't adopted them yet.

These patterns aren't theoretical. They're practical and don't require special tooling.

<!-- more -->

[![A figure crossing a bridge from a chaotic single-screen setup to an organised multi-station workspace]({{ site.url }}/assets/images/posts/2026-03-19-agentic-patterns-developers-should-steal/cover.png){: .diagram-lg}]({{ site.url }}/assets/images/posts/2026-03-19-agentic-patterns-developers-should-steal/cover.png)

## The Patterns

| Pattern | What most devs currently do | What devs should be doing |
|---|---|---|
| [Deterministic tool delegation](#deterministic-tool-delegation) | Ask AI to do everything | Use tools for solved problems, AI orchestrates |
| [Verification loops](#verification-loops) | Accept first output | Generate → evaluate → revise |
| [Context engineering](#context-engineering) | Dump everything in | Curate what the model sees |
| [Upfront planning](#upfront-planning) | One big prompt | Reviewable plan before execution |
| [Persistent memory](#persistent-memory) | Start fresh each session | Cross-session learning, codified constraints |
| [Structured guardrails](#structured-guardrails) | Hope for the best | Execution-layer constraints, hooks, gates |
| [Observability](#observability) | Look at the output | Structured traces, quality measurement |
| [Multi-agent specialisation](#multi-agent-specialisation) | One agent does everything | Separate agents for separate concerns |
| [Human-in-the-loop checkpoints](#human-in-the-loop-checkpoints) | Trust everything or nothing | Consequence-based approval tiers |

Here's what each one looks like. Some link to deeper posts.

### Deterministic Tool Delegation

**The pattern:** Don't let the AI make decisions it doesn't need to make. If a deterministic tool can handle something (refactoring, formatting, linting, data validation), use the tool. The AI's job is orchestration, not execution.

**What most developers do instead:** Ask the AI to rewrite code for a rename, follow a style guide from memory, or process data it doesn't need to see.

**Why it matters:** Every unnecessary decision is a degree of freedom. Every degree of freedom is an opportunity to get something wrong, burn tokens, and produce a result you can't reproduce. Deterministic tools give you the same output every time.

I wrote about this in depth in [The Unix Philosophy for Agentic Coding]({{ site.url }}/blog/2026/03/05/the-unix-philosophy-for-agentic-coding/).

### Verification Loops

**The pattern:** Instead of accepting the first output, create a generate-evaluate-revise cycle. The agent produces work, a separate pass critiques it against explicit criteria, and the agent revises.

**What most developers do instead:** Prompt, receive, accept or reject. The interaction model is single-shot.

**Why it matters:** LLMs produce plausible output that can be subtly wrong. Research shows [10-20 percentage point improvements](https://www.anthropic.com/research/building-effective-agents) on coding benchmarks from reflection alone. Anthropic's own guidance identifies the evaluator-optimizer workflow as one of the core composable patterns.

**What this looks like in practice:** After asking your AI assistant to implement a feature, follow up with: "Review what you just wrote. Check for edge cases, error handling, and whether it follows patterns in this codebase. List problems, then fix them." For high-stakes changes, use a separate session as an independent reviewer.

This pattern is also the foundation of test-driven development with AI: write the test first, let the AI implement, then the test itself becomes the verification loop. I've touched on this in the [TDD workflow in intelligent Engineering: In Practice]({{ site.url }}/blog/2026/01/02/intelligent-engineering-in-practice/#3-tdd-implementation).

### Context Engineering

**The pattern:** Deliberately architect what information the model sees, when it sees it, and in what form. Treat context as a finite resource, not an infinite scratchpad.

**What most developers do instead:** Paste entire files, full error logs, and broad descriptions, trusting the model to extract what's relevant.

**Why it matters:** Including irrelevant data actively worsens output quality. Models have attention patterns that favour the start and end of context, with the middle getting less focus. More context is not always better context.

I wrote a full post on this: [Context Engineering for AI-Assisted Development]({{ site.url }}/blog/2025/12/31/context-engineering-for-ai-assisted-development/). The short version: curate your CLAUDE.md for signal density, use `.claudeignore` to exclude noise, provide the two or three most relevant files rather than the entire directory, and start fresh sessions when context degrades.

### Upfront Planning

**The pattern:** Before any code is written, create an explicit plan that decomposes the work into steps with dependencies and acceptance criteria. Review the plan before execution begins.

**What most developers do instead:** Give the AI a single prompt describing what they want and let it figure out the approach. "Add user authentication" becomes one big prompt rather than a sequence of reviewable steps.

**Why it matters:** Internal planning by the model is invisible and unreviewable. An explicit plan is where you catch architectural mistakes that are expensive to fix after implementation. It also prevents the "AI rewrote half the codebase and something is broken but I don't know where" problem.

**What this looks like in practice:** For any task that touches more than two files: "Before implementing, create a plan. List the files you'll modify, the changes in each, the order of changes, and how you'll verify each step works." Review the plan before saying "proceed."

This is central to the [design discussion workflow]({{ site.url }}/blog/2026/01/02/intelligent-engineering-in-practice/#2-design-discussion) I use.

### Persistent Memory

**The pattern:** Retain lessons, decisions, and discovered patterns across sessions. Build institutional knowledge over time rather than starting from zero each conversation.

**What most developers do instead:** Every session starts fresh. They rediscover the same issues, re-explain the same conventions, and re-learn the same codebase quirks.

**Why it matters:** Without cross-session memory, the AI makes the same mistakes repeatedly and you correct it repeatedly. Codified constraints prevent the same mistakes from recurring.

**What this looks like in practice:** Maintain a CLAUDE.md that evolves. When you discover a gotcha ("the payments service returns 200 even on failures, check the response body"), add it immediately. When the AI makes a mistake, codify the prevention rule. Over time, your context docs accumulate the institutional knowledge that makes the AI genuinely useful on your specific project.

I cover this in detail in the [Foundation]({{ site.url }}/blog/2026/01/02/intelligent-engineering-in-practice/#level-1-foundation) and [Context Documentation]({{ site.url }}/blog/2026/01/02/intelligent-engineering-in-practice/#level-2-context-documentation) layers of the intelligent Engineering stack.

### Structured Guardrails

**The pattern:** Define explicit boundaries around which decisions the AI can make autonomously and which it should escalate. This includes architectural constraints ("don't introduce a new database without discussing it"), scope boundaries ("only modify files in this module"), and approval gates for high-impact changes.

**What most developers do instead:** Give the AI full autonomy without defining what's in and out of scope. The agent makes architectural decisions, introduces new patterns, or changes public APIs without checking whether that's what you intended.

**Why it matters:** A prompt might be ignored as context fills up. A pre-commit hook won't be. Deterministic enforcement catches what prompt-based instructions miss.

**What this looks like in practice:** Define boundaries in your CLAUDE.md ("never modify migration files without asking"). Use pre-commit hooks for formatting, linting, and security checks. Set up Claude Code hooks for auto-formatting and blocking sensitive operations. Let low-risk operations run freely. Pause high-risk ones for review.

I wrote a hands-on tutorial on this: [Level Up Code Quality with an AI Assistant]({{ site.url }}/blog/2025/07/29/level-up-code-quality-with-an-ai-assistant/).

### Observability

**The pattern:** Systematic tracking of what the AI did, what worked, what failed, and using that data to improve future interactions.

**What most developers do instead:** Look at the output. No structured feedback, no trend tracking, no quality measurement over time.

**Why it matters:** The [METR study](https://metr.org/blog/2025-07-10-early-2025-ai-experienced-os-dev-study/) found developers estimated they were 24% faster with AI when they were actually 19% slower. Gut feel is unreliable. Without measurement, you don't know if the AI is helping, and you can't systematically improve your workflows.

This is the least mature pattern in the list. The tooling barely exists for individuals and is fragmented across teams. I explore the current state, the gaps, and what we'd like to see in [Observability for AI-Assisted Development]({{ site.url }}/blog/2026/03/12/observability-for-ai-assisted-development/).

### Multi-Agent Specialisation

**The pattern:** Instead of one generalist agent handling everything, use multiple specialised agents with focused context, specific tool access, and defined roles.

**What most developers do instead:** One session, one agent, planning, implementation, and review all in the same context window.

**Why it matters:** Each agent gets a fresh, focused context window rather than one bloated context trying to hold planning, implementation, review, and testing simultaneously. Specialisation also lets you use different models for different tasks (a thinking model for planning, a fast model for implementation).

**What this looks like in practice:** Claude Code recently started offering to clear context when you accept a plan, giving the implementation phase a fresh, focused window with only the plan carried forward. Planning and implementation benefit from separate contexts.

Take it further. Build an agentic team with a backlog: a planning agent that decomposes work into tasks, implementation agents that execute them, QA agents that test, and review agents that validate. Each agent has specific skills and focused context for its role. Claude Code's [Agent Teams](https://code.claude.com/docs/en/agent-teams) and subagent features support this natively. Anthropic's engineering team [built an entire C compiler](https://www.anthropic.com/engineering/building-c-compiler) using 16 agent teams, producing 100,000 lines of Rust code. Codex has [similar multi-agent capabilities](https://developers.openai.com/codex/multi-agent/).

Anthropic's internal benchmarks showed a [90% improvement](https://www.anthropic.com/engineering/multi-agent-research-system) with multi-agent (Opus lead + Sonnet subagents) over solo Opus on complex tasks. [Tekion](https://www.augmentcode.com/customers/Tekion-enabled-AI-agents) deployed persona-driven agents across 1,300 engineers and saw 50-85% productivity gains, compared to 30-40% with raw LLM prompting. The trade-off is tokens: multi-agent workflows use 2-3x more tokens, but for significant features, the quality improvement justifies the cost.

### Human-in-the-Loop Checkpoints

**The pattern:** Rather than either fully trusting the AI or micromanaging every line, define structured approval gates based on the consequence of the action.

**What most developers do instead:** Operate in one of two modes. Either review everything line-by-line (treating the AI as fancy autocomplete) or accept large chunks with only a cursory glance. A formatting change and a database schema change get the same level of scrutiny.

**Why it matters:** Not all changes carry the same risk. A tiered approach gives you speed where it's safe and control where it matters.

**What this looks like in practice:** Define personal approval tiers:

- **Auto-approve:** Formatting, import organisation, adding type annotations
- **Quick review:** New functions, test additions, single-file refactors
- **Careful review:** Public API changes, database operations, auth logic
- **Full review with plan:** Multi-file refactors, new architectural patterns, build/deploy changes

Use small, frequent git commits as checkpoints. If something goes wrong, you can revert to a known-good state without losing everything. Before accepting a change, ask yourself: if this is wrong, what breaks and how hard is it to fix?

## Where to Start

You don't need all nine patterns at once. Start with the ones that address your biggest pain points:

- **Code quality issues?** Start with [structured guardrails](#structured-guardrails) and [verification loops](#verification-loops).
- **AI keeps making the same mistakes?** Start with [persistent memory](#persistent-memory) and [context engineering](#context-engineering).
- **Large diffs that are hard to review?** Start with [upfront planning](#upfront-planning) and [human-in-the-loop checkpoints](#human-in-the-loop-checkpoints).
- **Spending too much on tokens?** Start with [deterministic tool delegation](#deterministic-tool-delegation) and [context engineering](#context-engineering).
- **Not sure if AI is helping?** [Observability](#observability) is still largely unsolved, but start by establishing baselines now so you can measure later.

Stop handing the AI the whole problem. Break it down and use the right tool for each step.

---

_This is part of a series on applying patterns from agentic systems to AI-assisted development. See also: [The Unix Philosophy for Agentic Coding]({{ site.url }}/blog/2026/03/05/the-unix-philosophy-for-agentic-coding/) and [Observability for AI-Assisted Development]({{ site.url }}/blog/2026/03/12/observability-for-ai-assisted-development/)._
