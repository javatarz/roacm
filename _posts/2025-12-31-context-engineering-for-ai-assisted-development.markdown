---
layout: post
comments: true
author: Karun Japhet
title: "Context Engineering for AI-Assisted Development"
description: "A practical guide to context engineering: understand system prompts, manage context windows, and get better results from AI coding assistants."
category: intelligent Engineering
tags:
  - ai-assisted-development
  - ai-patterns
  - coding-assistants
devto: true
devto_tags:
  - ai
  - programming
  - productivity
  - career
---

Same model, different tools, different results.

If you've used Claude Sonnet in [Claude Code](https://claude.ai/code), [Cursor](https://cursor.com), [Copilot](https://github.com/features/copilot), and [Windsurf](https://windsurf.com), you've noticed this. The model is identical, but the behavior varies. This isn't magic. It's context engineering.

<!-- more -->

<!-- TODO: Cover art from Shutterstock - search "whiteboard meeting brainstorming two people" - look for clear title at top, messy notes below -->

In [intelligent Engineering: Principles for Building With AI]({{ site.url }}/blog/2025/11/06/intelligent-engineering-building-skills-and-shaping-principles/), I mentioned that "context is everything" and that "context engineering matters more than prompt engineering." But I didn't explain what that means or how to do it. This post fills that gap.

## The Whiteboard

Imagine you're in a day-long strategy meeting. There's one whiteboard in the room. That's all the shared space you have.

Your teammate is brilliant. They can see everything on the board and reason about it. But here's the thing: they have no memory outside this whiteboard. What's written is all they know. Erase something, and it's gone.

Before the meeting started, someone wrote ground rules at the top: "Focus on Q1 priorities. Be specific. No tangents." This section doesn't get erased. It frames everything that follows. (That's the system prompt.)

The meeting begins. You add notes, diagrams, decisions. The board fills up. You need to add something new, but there's no space. What do you erase? The detailed debate from 9am, or the decision it produced? You keep the decision, erase the discussion. (That's compaction.)

Three hours in, you notice something odd. Your teammate keeps referencing the top and bottom of the board, but seems to miss what's in the middle. Important context from 10:30am is right there, but they're not looking at it. The middle of the board gets less attention.

Someone raises a topic that needs last quarter's data. Do you copy the entire Q4 report onto the board? No. You flip open your notebook, find the one relevant chart, add it to the board, discuss it, then erase it when you move on. (That's just-in-time retrieval.) The notebook stays on the table. You reference it when needed, but it doesn't consume board space.

By afternoon, old notes are causing problems. A 9am assumption turned out to be wrong, but it's still on the board. Your teammate keeps building on it. The board is poisoned with outdated information. You need to actively clean it up.

There's too much on the board now. Some notes are written in shorthand. Others are cramped into corners with tiny handwriting. Your teammate can technically see it all, but finding anything takes effort. Attention is diluted. (That's context distraction.)

For a complex sub-problem, you send two people to side rooms with fresh whiteboards. They work independently, then return with one-page summaries. You add the summaries to your board and integrate the findings. You never needed their full whiteboards. (That's sub-agents.)

The whiteboard is your teammate's entire context window. What's on it is all they can work with. Your job is to curate what goes on the board so they can focus on what matters.

## What This Means Technically

The whiteboard story maps directly to how AI models process information.

### System Prompts vs User Prompts

The ground rules at the top of the board are the **system prompt**. You didn't write them. They were there when you walked in, set by whoever built the tool. They define how the model behaves, what it prioritizes, what it can do.

What you add during the meeting is the **user prompt**. Your requests, your context, your questions. It works within the frame the system prompt establishes.

The model sees both. But system prompts carry more weight because they come first and set expectations.

### The Context Window

The whiteboard's physical dimensions are the **context window**. There's a fixed amount of space. Everything competes for it: system instructions, conversation history, files you've pulled in, tool definitions, and the model's own output. When it fills up, something has to go.

### Lost in the Middle

Remember how your teammate focused on the top and bottom of the board but missed the middle? That's a real phenomenon. Research shows a U-shaped attention curve: information at the start and end of context gets more attention than information in the middle.

[![U-shaped attention curve showing high attention at start and end of context, with 'Lost in the Middle' highlighting the attention dip](/assets/images/posts/2025-12-31-context-engineering/attention-curve.svg){: .diagram-sm}](/assets/images/posts/2025-12-31-context-engineering/attention-curve.svg)

This means:
- Cramming everything into context can hurt performance
- Position matters: put important information first or last
- As context grows, accuracy often decreases

In [Patterns for AI-assisted Software Development]({{ site.url }}/blog/2025/07/07/patterns-for-ai-assisted-software-development/), I described LLMs as "teammates with anterograde amnesia." They can hold information, but only within the context window. Understanding how to manage that window is key.

### The Attention Budget

Even with everything visible on the board, your teammate can only actively focus on so much while reasoning. Each item costs attention. Add more, and something else gets less focus. Think of it as a budget: every token you add depletes some of the model's capacity to focus on what matters.

## How Different Tools Set Up the Room

Here's why the same model behaves differently across tools: different rooms have different ground rules at the top of the board.

Take Claude Sonnet 4.5. Same teammate. But put them in different rooms:

| Room (Tool) | Top of the board says |
|-------------|----------------------|
| Claude Code | "Work autonomously. Read files, run terminal commands, complete multi-step tasks." |
| Cursor | "Stay in the editor. Complete code inline, understand the open file, suggest edits." |
| Copilot | "Autocomplete as they type. Quick suggestions, stay out of the way." |
| Windsurf | "Maintain flow. Remember preferences across sessions, keep continuity." |

Your teammate reads the top of the board and behaves accordingly. That's why the same model feels different in each tool. The system prompt shapes everything.

This also explains why prompts don't transfer directly between tools. A prompt that works well in Claude Code might fail in Cursor because the framing is different.

## What Goes Wrong

When context fails, it fails in predictable ways. Recognizing these patterns helps you diagnose problems.

### Context Poisoning

Early errors compound. Your teammate builds on incorrect assumptions, reinforcing mistakes with each exchange. By the time you notice, the board is thoroughly polluted with wrong information.

**Fix:** Use backtrack to undo recent turns. [Claude Code](https://code.claude.com/docs/en/checkpointing), [Cursor](https://cursor.com/docs/agent/chat/checkpoints), and [Windsurf](https://docs.windsurf.com/windsurf/cascade/cascade#named-checkpoints-and-reverts) all support this. If the pollution runs deeper, compact to summarize past the bad section. Clear is the nuclear option when context is unsalvageable.

### Context Distraction

Too much information competes for attention. The model can technically process it all, but signal gets lost in noise.

On the whiteboard: shorthand, tiny writing, notes crammed into corners. Your teammate can see it all, but finding anything takes effort.

**Fix:** Keep context lean. Compact proactively. Don't dump everything onto the board.

### Context Confusion

Mixed content types muddle the model's understanding. Code snippets, prose explanations, JSON configs, and error logs all blur together. The model can't distinguish what's an instruction versus an example versus context.

On the whiteboard: sticky notes, diagrams, tables, arrows, different colored markers. Your teammate can't parse what type of information to use for what purpose.

**Fix:** Use focused tools. Don't overload the board with too many formats or capabilities.

### Context Clash

Contradictory instructions coexist. "Prioritize speed" in one corner. "Prioritize quality" in another. Your teammate sees both, doesn't know which to follow, and produces something incoherent.

**Fix:** Keep instructions centralized and current. Review your context files periodically for contradictions.

## Managing Context Well

Five techniques make a difference.

### Just-in-Time Retrieval

Don't paste your whole codebase onto the board. Reference specific files and let the tool search.

Bad: "Here's my entire src/ directory. Now fix the bug."
Good: "There's a bug in the date parser. Check src/utils/dates.ts."

The notebook stays on the table. You flip it open when needed, find the relevant page, add it to the discussion, then move on.

### Compaction

Context fills up during long sessions. Compaction summarizes conversation history, preserving key decisions while discarding noise.

**When to compact:**
- After completing a major task (before starting the next one)
- During long sessions when you notice drift
- Before context hits limits (proactively, not reactively)

You can provide custom instructions when compacting: "focus on architectural decisions" or "preserve the error messages we encountered." This guides what gets kept versus summarized away.

My preference hierarchy:
1. **Small tasks with `/clear`** - fresh context beats compressed context
2. **Early compaction with custom instructions** - you control what matters
3. **Early compaction with default prompt** - still gives thinking room
4. **Late compaction** - avoid this

Late compaction (waiting until 95% capacity) is the worst option. The model has no thinking room, and the automatic summarization is opaque. You lose nuance without knowing what disappeared. Early compaction, ideally with custom instructions, gives you control and leaves space for the model to reason. Steve Kinney's [guide to Claude Code compaction](https://stevekinney.com/courses/ai-development/claude-code-compaction) covers the mechanics well.

### Structured Note-Taking

For complex, multi-hour work, maintain notes outside the conversation:

- A NOTES.md file tracking progress
- Decision logs capturing why you chose specific approaches
- TODO lists that persist across compactions

The model can reference these files when needed, but they're not consuming context constantly. The notebook on the table, not copied onto the board.

### Sub-Agents

For large tasks, send people to side rooms with fresh whiteboards:

- Main agent coordinates the overall task
- Sub-agents handle specific, focused work with clean context
- Sub-agents return condensed summaries
- Main agent integrates results without carrying full sub-task context

[![Sub-agent workflow: main agent delegates tasks to sub-agents with fresh context, receives summaries back, and integrates results](/assets/images/posts/2025-12-31-context-engineering/sub-agents.svg){: .diagram-md}](/assets/images/posts/2025-12-31-context-engineering/sub-agents.svg)

This mirrors how teams work: delegate, get summaries, integrate. Claude Code supports this pattern for [parallel issue work](https://www.geeky-gadgets.com/how-to-use-git-worktrees-with-claude-code-for-seamless-multitasking/) using git worktrees.

### Tool-Specific Tips

Each tool has different mechanisms for managing what goes on the board.

**Claude Code:**
- CLAUDE.md files load automatically at session start. Keep them focused and current.
- Hierarchical loading: user-level, project-level, directory-level. More specific overrides more general.
- Trust the tool's search. Don't paste file contents manually unless retrieval fails.
- Use `/compact` between logical units of work.

**Cursor:**
- Rules files inject instructions with different scopes: global, project, file-type specific.
- Use @-mentions deliberately. More files isn't better; relevant files are better.
- Keep rule files short. They add to every interaction.

**Copilot:**
- Lighter touch. Works best for autocomplete and quick suggestions.
- Less configurable context, so prompt quality matters more.

**Windsurf:**
- Memories persist across sessions automatically.
- Good for maintaining preferences and patterns over time.

**Aider, Cline, and similar terminal-based tools** follow the same principles. Different mechanisms, same underlying constraints. For a deeper comparison, see [How to choose your coding assistants]({{ site.url }}/blog/2025/07/17/how-to-choose-your-coding-assistants/).

## The Core Principle

Anthropic's engineering team puts it well in their [guide to context engineering](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents):

> Find the smallest set of high-signal tokens that maximize the likelihood of your desired outcome.

More context isn't better. Relevant context is better. Your job is to curate what goes on the board so your teammate can focus on what matters.

Context drives quality. But "quality context" doesn't mean volume. It means signal: information the model needs to reason correctly. Everything else dilutes attention.

## What's Next

Context engineering is a skill that develops with practice. Start by noticing when your tools perform well and when they drift. Ask why. Usually, the answer is in the context.

Take a few minutes to examine how your tool handles context. Where do instructions go? How do files get included? What happens during long sessions?

Understanding this is the difference between fighting your tools and working with them.

**Coming up:** Context engineering is one piece of the puzzle. In [intelligent Engineering: A Skill Map for Learning AI-Assisted Development]({{ site.url }}/blog/2026/01/01/intelligent-engineering-a-skill-map-for-learning-ai-assisted-development/), I map out the full landscape of skills worth building.
