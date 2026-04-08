---
layout: post
comments: true
author: Karun Japhet
title: "Multi-Agent Development Workflows with Claude Code"
description: "How to run multiple Claude Code agents on independent backlog cards in parallel, using worktrees for isolation, hooks for quality gates, and structured review."
category: intelligent Engineering
tags:
  - coding-assistants
  - ai-assisted-development
  - ai-patterns
devto: true
devto_tags:
  - ai
  - programming
  - productivity
  - tutorial
---

Single-agent Claude Code is pair programming. One developer, one task, full attention.

I've been running three or four agents against a project backlog simultaneously. Not because single-agent broke, but because groomed cards were sitting idle.

Here's what that looks like in practice.

<!-- more -->

## The shift: from writing code to shaping work

When you use Claude Code as a single agent, you're pair programming. That's powerful when you're exploring a problem or designing an approach. But if you have independent cards groomed and ready, you're leaving throughput on the table.

Your role shifts. Instead of writing code alongside one agent, you shape the work before it starts and judge it when it's done. You groom cards, make design decisions, dispatch work, and review output. The agents write the code. Addy Osmani calls this the [factory model](https://addyosmani.com/blog/factory-model/): you're no longer building software, you're building the factory that builds your software. The spec becomes the primary deliverable, and the harness (task tracking, isolation, quality gates, review) is the factory floor.

Steve Yegge's [Gas Town post](https://steve-yegge.medium.com/welcome-to-gas-town-4f25ee16dd04) maps this journey in eight stages, from IDE copilot to building your own orchestrator. I started multi-agent work at stage 6: three or four terminal windows, each running Claude Code on a different card. You realise quickly that you're the bottleneck. The agents can move faster than you can review, approve, and redirect. The answer isn't more attention from you. It's giving the agents more autonomy with safety nets: quality gates that catch problems automatically, structured dispatch so agents find their own work, and a review workflow for when they're done.

This post is my version of stage 8. The tooling is still maturing, and this harness will look different in six months. This is the April 2026 version.

Anthropic's [2026 Agentic Coding Trends Report](https://resources.anthropic.com/2026-agentic-coding-trends-report) says multi-agent "doesn't make sense for 95% of agent-assisted development tasks." That's probably true for ad-hoc coding. But if you have a groomed backlog of independent cards, running them in parallel is the logical next step to move through the backlog quicker.

## Two modes, not a progression

These aren't stages you graduate through. They're modes you switch between based on what you're doing right now.

### Thinking mode (single agent)

When you're exploring, designing, or working through a single problem. Grooming cards, writing acceptance criteria, debugging something complex. The value is in the conversation, not the throughput.

This is pair programming. Full attention on one thing.

### Throughput mode (parallel workers)

When you have multiple cards ready to go. Each worker gets a card, a worktree, and runs independently. You review their output when they're done.

Choose based on card complexity and dependencies:

**[Sub-agents](https://code.claude.com/docs/en/sub-agents)** for small, independent cards (roughly 15-minute tasks):

- Quick fixes, config changes, bounded features
- Research running in background
- Automated code review of completed work
- Short-lived: no auto-compaction, so longer tasks can exhaust the context window
- Cheaper: minimal context startup, returns summaries only

**[Agent teams](https://code.claude.com/docs/en/agent-teams)** for substantial cards or cards with cross-card dependencies:

- Multi-file features that need to read large parts of the codebase
- Cards where the agent needs sustained autonomy and may hit context limits
- Each teammate is a full Claude Code session with auto-compaction, so they can sustain longer work
- More expensive: each teammate loads full project context independently

Agent teams also handle coordination. When cards genuinely depend on each other, teammates can communicate directly via peer-to-peer messaging (`SendMessage`), shared task lists with dependency tracking, and auto-unblocking. [Vertically-sliced stories](https://www.jeremyjarrell.com/vertically-slicing-user-stories) following the [INVEST principle](https://en.wikipedia.org/wiki/INVEST_(mnemonic)) produce fewer cross-card dependencies than horizontal slicing, but they don't eliminate them. Real dependencies exist even in well-groomed backlogs.

Real coordination cases:

- One card updates a shared schema; other in-flight cards need to know before they merge
- Large refactors that can't be one card, where agents need to agree on new interfaces
- Adversarial debugging: competing hypotheses where agents share findings

Agent Teams require `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1` (v2.1.32+) and are still experimental. No session resumption, task status can lag, one team per session.

### How to choose

| Situation | Mode | Why |
|-----------|------|-----|
| Exploring, grooming, designing | Thinking | You need the dialogue |
| One thing that needs full attention | Thinking | Conversation > throughput |
| Multiple small, bounded cards ready | Throughput (sub-agents) | Fast, cheap, parallel |
| Multiple substantial cards | Throughput (agent teams) | Full context, sustained autonomy |
| Cards with cross-card dependencies | Throughput (agent teams) | Agents need to communicate |
| Research while you work | Throughput (sub-agents) | Background tasks |
| Review of completed work | Throughput (sub-agents) | Fresh context, separate reviewer |

**Rate limits are the real parallelism ceiling.** They're pooled across all sessions on your account. Opus has the strictest limits. Plan for this when dispatching multiple workers.

## The harness: making throughput mode reliable

Dispatching multiple agents is easy. Getting reliable output is hard. The harness (task tracking, isolation, quality gates, review) is what makes multi-agent development repeatable.

### Layer 0: the upstream gate

**The most important quality gate happens before any code is written.**

Careful grooming is what makes the whole pipeline work. Clear description, specific acceptance criteria, explicit non-goals. As Ankit Jain puts it, "[the most valuable human judgment is exercised before the first line of code is generated, not after](https://www.latent.space/p/reviews-dead)."

I spend more time grooming cards than I do reviewing agent output. That ratio feels right. Groom in your main Claude Code session, use the conversation to think through edge cases, and write precise acceptance criteria. The card is the spec.

### Layer 1: task tracking

Agents need to discover available work, claim it atomically, and track what's been tried. A TODO list isn't enough.

I'm using [Beads](https://github.com/steveyegge/beads) for this. It stores data locally via [Dolt](https://github.com/dolthub/dolt), gives agents programmatic access, and handles dependencies between tasks. The key commands:

- `bd ready` lists tasks with no open blockers
- `bd update <id> --claim` atomically claims a task
- `bd show <id>` gets full card details including previous notes and rejection feedback

A `/dispatch` skill wraps this into a workflow: find available cards via `bd ready`, present them for selection, claim each one, and spawn a worker per card with worktree isolation.

For multi-developer setups, a centralized tool (GitHub Issues, Linear) may be more practical. Beads' strength is agent-native programmatic access. See also [The Claude Protocol](https://github.com/AvivK5498/Claude-Code-Beads-Orchestration) and [Metaswarm](https://github.com/dsifry/metaswarm) for existing harness implementations.

### Layer 2: isolation

Without worktree isolation, parallel agents can't write to the same files. With it, each agent gets its own branch and working directory.

A worker agent definition (`.claude/agents/worker.md`):

```yaml
---
model: sonnet
isolation: worktree
background: true
tools:
  - Read
  - Write
  - Edit
  - Bash
  - Glob
  - Grep
permissionMode: acceptEdits
---
```

`isolation: worktree` gives each worker its own git [worktree](https://code.claude.com/docs/en/common-workflows). `background: true` means the dispatch doesn't block waiting for workers to finish. `model: sonnet` keeps costs down for development work (swap to `opus` for complex cards).

Supporting config:

- `.worktreeinclude` copies gitignored files (like `.env`) into new worktrees
- `WorktreeCreate` [hooks](https://code.claude.com/docs/en/hooks) handle dependency installation
- Scope each agent via CLAUDE.md to prevent merge conflicts across worktrees

Anthropic's [C compiler case study](https://www.anthropic.com/engineering/building-c-compiler) used this pattern with 16 parallel agents. They hit duplicate work and merge conflicts. Tighter scoping and atomic task claiming address both.

### Layer 3: quality gates

Two categories: automated (hooks that block the agent) and manual (human judgment during review). I underestimated how large agent-generated diffs get when the card isn't tightly scoped. The diff size guard was an afterthought; it's now one of the more useful gates.

#### Automated gates (fail-fast pyramid)

Run fastest and cheapest first, most expensive last:

1. **Formatting** (PostToolUse on Write/Edit, instant). Auto-fix, not a gate.
2. **Linting / static analysis** (seconds). Fast, deterministic.
3. **Type checking** (seconds). Catches interface mismatches.
4. **Secret detection** (PreToolUse on Edit/Write). Blocks before secrets hit disk.
5. **Unit tests** (minutes). The foundation.
6. **Diff size guard** (instant). Reject if change exceeds threshold. Prevents [comprehension debt](https://addyo.substack.com/p/the-80-problem-in-agentic-coding).
7. **Automated code review** (subagent, 30-90s). Separate agent reviews the diff.

The code review subagent must be a separate agent with its own context window. As Nick Tune [writes](https://www.oreilly.com/radar/auto-reviewing-claudes-code/), "asking the main agent to mark its own homework is obviously not a good approach." [Hamilton Greene's 9-agent approach](https://hamy.xyz/blog/2026-02_code-reviews-claude-subagents) achieves roughly 75% useful suggestions versus less than 50% from single-agent review.

Hook implementation:

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [{ "type": "command", "command": "./scripts/detect-secrets.sh" }]
      }
    ],
    "PostToolUse": [
      {
        "matcher": "Write|Edit",
        "hooks": [{ "type": "command", "command": "npx prettier --write \"$FILE_PATH\"" }]
      }
    ],
    "TaskCompleted": [
      {
        "matcher": "",
        "hooks": [{ "type": "command", "command": "./scripts/quality-gate.sh" }]
      }
    ]
  }
}
```

Exit code 0 proceeds. Exit code 2 blocks with feedback (the agent gets the stderr message and iterates). Lint, tests, and code review fire on `TaskCompleted` (runs once when the agent says "done"). Secret detection fires on `PreToolUse` (blocks before the write). See [hooks reference](https://code.claude.com/docs/en/hooks).

#### Manual gates

What automated checks can't catch:

- **[Scope adherence](https://addyosmani.com/blog/good-spec/).** Did the agent build what the card asked for, or add unrequested features?
- **[Architectural coherence](https://addyosmani.com/blog/factory-model/).** Does the implementation fit the architecture of the rest of the system, or did the agent invent its own patterns?
- **[Business logic correctness](https://earezki.com/ai-news/2026-04-04-ai-code-review-checklist/).** Models infer patterns statistically, not semantically.
- **[Comprehension check](https://addyo.substack.com/p/the-80-problem-in-agentic-coding).** If you can't understand the diff, it's too large or too novel.

### Layer 4: review gates

For trunk-based development without PRs, the worktree branch is the review surface. `git diff main` from the worktree shows exactly what would change on merge.

A `/review-worktree` skill handles this:

1. Cross-references `bd list --label review:pending` with `git worktree list`
2. Shows commit history and diff summary for the selected worktree
3. Options: view full diff, view specific file, run tests, run review agent, approve, reject
4. Approve: merge to main, close card, clean up worktree
5. Reject: reopen card with feedback comment visible to the next worker via `bd show`

For PR-based teams, the agent creates a PR from the worktree branch. Standard review process.

### Layer 5: the feedback loop

When work is rejected, the card reopens with a comment explaining why. On the next dispatch, the worker agent sees the rejection feedback via `bd show`. It has context on what was tried and why it failed.

When an agent is stuck, the card goes to `blocked` with a `needs-help` label and a note explaining what was tried. The human reviews and either re-grooms the card or splits it.

## What it looks like in practice

Here's a walkthrough on [credit-card-lending](https://github.com/javatarz/credit-card-lending). Three cards groomed and ready.

### Check the backlog

```
> bd ready --plain

bd-c4a1  P1  Add payment grace period calculation     customer
bd-e2f7  P1  Fix SSN validation accepting 000 prefix  customer
bd-b8d3  P2  Add CSV export to transaction history     reporting
```

### Dispatch workers

```
> /dispatch

Found 3 ready cards:

| # | Card    | Title                                   | Priority |
|---|---------|-----------------------------------------|----------|
| 1 | bd-c4a1 | Add payment grace period calculation    | P1       |
| 2 | bd-e2f7 | Fix SSN validation accepting 000 prefix | P1       |
| 3 | bd-b8d3 | Add CSV export to transaction history   | P2       |

Which cards to dispatch? (comma-separated IDs, or "all")
> all

Claiming bd-c4a1... done
Spawning worker -> work/bd-c4a1-payment-grace-period (worktree)

Claiming bd-e2f7... done
Spawning worker -> work/bd-e2f7-fix-ssn-validation (worktree)

Claiming bd-b8d3... done
Spawning worker -> work/bd-b8d3-csv-export-transactions (worktree)

| Card    | Branch                               | Status     |
|---------|--------------------------------------|------------|
| bd-c4a1 | work/bd-c4a1-payment-grace-period    | Dispatched |
| bd-e2f7 | work/bd-e2f7-fix-ssn-validation      | Dispatched |
| bd-b8d3 | work/bd-b8d3-csv-export-transactions | Dispatched |

Workers running in background. Check `bd list --label review:pending` for completed work.
```

### Continue working

While workers run, I stay in the main session. Groom next sprint's cards, explore a design problem, whatever needs thinking.

### Check for completed work

```
> bd list --label review:pending

bd-e2f7  Fix SSN validation accepting 000 prefix  [review:pending]
bd-b8d3  Add CSV export to transaction history     [review:pending]
```

Two done. One still in progress.

### Review

```
> /review-worktree

| # | Card    | Title                             | Branch                               |
|---|---------|-----------------------------------|--------------------------------------|
| 1 | bd-e2f7 | Fix SSN validation 000 prefix     | work/bd-e2f7-fix-ssn-validation      |
| 2 | bd-b8d3 | CSV export transaction history    | work/bd-b8d3-csv-export-transactions |

Which worktree to review?
> 1

Commits (main..HEAD):
  a3f8c21 Fix SSN validation to reject 000 and 999 prefixes
  e7b2d14 Add test cases for invalid SSN prefixes

Changed files:
  src/.../customer/validation/SsnValidator.java      | 12 ++++++--
  src/.../customer/validation/SsnValidatorTest.java  | 28 ++++++++++++++++

Options: [d]iff [f]ile [t]ests [r]eview-agent [a]pprove re[j]ect
> a

Merging work/bd-e2f7-fix-ssn-validation into main... done
Closing bd-e2f7... done
Removing worktree... done
```

Small, focused fix. Two files, clear test coverage. Approve.

```
Which worktree to review?
> 2

Commits (main..HEAD):
  b1c4e89 Add CSV export endpoint for transaction history
  d5a7f23 Add PDF export endpoint for transaction history
  f9e1b34 Add export format selection dropdown to UI

Changed files:
  12 files changed, 847 insertions(+), 23 deletions(-)

Options: [d]iff [f]ile [t]ests [r]eview-agent [a]pprove re[j]ect
> j

Feedback: Card asked for CSV export only. PDF export and UI dropdown
are out of scope. Remove those and keep only the CSV export.

Reopening bd-b8d3 with feedback... done
```

Scope creep. The card said CSV export. The agent added PDF export and a UI component. This is a common failure mode: agents are eager to build adjacent features. The rejection feedback goes back to the card. Next dispatch, the worker reads it and knows exactly what to cut.

## Where it falls apart

### Compound reliability

Each agent at 95% success. Five agents chained: [roughly 77%](https://towardsdatascience.com/the-multi-agent-trap/). Multi-agent trades reliability for parallelism. The benefit must justify the overhead.

### Context loss between agents

Every handoff is lossy compression. Google Research found [39-70% degradation](https://github.blog/ai-and-ml/generative-ai/multi-agent-workflows-often-fail-heres-how-to-engineer-ones-that-dont/) in sequential multi-agent tasks. Subagents summarize results back to the caller; teammates don't get the lead's conversation history. Isolation prevents context pollution but loses nuance.

### Token cost

Multi-agent consumes [2-5x more tokens](https://www.augmentcode.com/guides/single-agent-vs-multi-agent-ai) for equivalent work. No published harness has budget limits per task. `/usage` monitoring is the best we have. This is an unsolved problem.

### Time blindness

From the [C compiler case study](https://www.anthropic.com/engineering/building-c-compiler): Claude can't tell time and will spend hours running tests instead of making progress. The harness needs to print progress infrequently and offer fast-test options.

### Duplicate work

Without task claiming, multiple agents fix the same bug independently and overwrite each other. I've seen this even with bd's `--claim`, when two cards touch overlapping files. The C compiler case study hit it at scale with 16 agents targeting the same bug.

### The 18-month wall

Without quality gates, the pattern is: early velocity (months 1-3), plateau (4-9), decline (10-15), stall (16-18) as comprehension debt accumulates. [CodeRabbit's research](https://www.coderabbit.ai/blog/state-of-ai-vs-human-code-generation-report) found AI-generated code produces 1.7x more issues and performance inefficiencies 8x more often than human code. This is why quality gates matter. Without them, the velocity gains are temporary.

## The honest tradeoffs

### Model lock-in

Claude Code is locked to Claude models. The orchestration layer (sub-agents, agent teams, skills, hooks, worktrees) doesn't exist in other tools. Your model choice is portable (use Claude API keys with aider, opencode, etc.) but the harness is not. No open-source tool today gives you model flexibility and Claude Code's agent stack. If you're invested in this workflow, you're invested in Claude Code.

### When to stay in thinking mode

- You're exploring, designing, or grooming. The value is in the conversation.
- One task that needs your full attention and steering.
- Cost constraint. Throughput mode is 2-5x more expensive per equivalent output.
- The work isn't decomposed into independent cards yet. Dispatch without grooming is waste.

### The real cost

Anthropic's C compiler project: [$20K in API costs](https://www.anthropic.com/engineering/building-c-compiler) for 16 agents producing 100K lines of code. That excludes significant human effort for workflow design, task decomposition, agent management, output review, and integration. Budget for both.

## What's next

Today's harness is human-triggered. You run `/dispatch` when you're ready. The next step is agents that continuously pull from the backlog as cards become ready, with the human as reviewer rather than dispatcher.

The pieces exist: `bd ready` for discovery, worktrees for isolation, hooks for quality, agent teams for coordination. The missing piece is the continuous loop, and the trust to let it run.

Companies with agentic coding infrastructure report 30-50% acceleration in development cycles. But a [February 2026 NBER study](https://www.nber.org/) of nearly 6,000 executives found 89% of firms report zero productivity change from AI. The gap between those groups isn't model quality. It's the infrastructure around the model.

That's been the consistent lesson: harness design matters as much as prompt design.
