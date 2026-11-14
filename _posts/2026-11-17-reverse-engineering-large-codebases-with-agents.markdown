---
layout: post
comments: true
authors:
  - harshad
  - karun
title: 'Reverse Engineering a 10,000-File Codebase With Agents'
description: 'One prompt and a big context window fall over on a legacy monolith. Splitting the job into deterministic tools and narrow agents produced a reusable knowledge base.'
category: intelligent Engineering
tags:
  - ai-assisted-development
  - ai-patterns
  - architecture
devto: false
published: false # Under review with Harshad; remove to publish
---

Point a coding agent at a few hundred files and ask it to explain the system. It will read everything and give you a good answer. Point it at 10,000 files and it will give you an equally confident answer that is partly made up.

We hit this on a legacy enterprise monolith: frontend, backend, database migrations and infrastructure in one repository, written on Spring 2 before Spring Boot existed. The client wanted architecture documentation, domain boundaries and a map of the workflows, so they could plan a decomposition.

This post is the pipeline we built instead of the big prompt, and what we learned running it. I presented it at Sahaj Devday; the [full talk is on YouTube](https://www.youtube.com/watch?v=wjIx8WWP4FI) if you'd rather watch.

<!-- more -->

## Why the big prompt fails

The first instinct is to write a long, careful prompt: list the modules, find the important classes, describe the deployment, draw the architecture. On a small codebase it works.

On a large one, the agent starts reading file after file until compaction kicks in. After that it has lost details it read earlier, but it doesn't stop. It fills the gaps with plausible inventions and reports them with the same confidence as everything else.

A bigger context window doesn't fix this. It only moves the point where it happens. Output quality degrades as the window fills, well before you hit the limit, for a few reasons:

- Low signal to noise. Every file in an enterprise codebase carries a copyright header, imports and boilerplate. None of it helps you work out the architecture, and all of it competes for attention.
- Models give less weight to content in the middle of a long context. [Liu et al.](https://arxiv.org/abs/2307.03172) measured this and called it "lost in the middle".
- Even if every token is relevant, more tokens means less attention for each one.

The context window is a finite and fragile resource. Karun has written about [managing it on day-to-day work](/blog/2025/12/31/context-engineering-for-ai-assisted-development/); at this scale it becomes the constraint the whole design has to work around.

## Design around the constraint

There's an old version of this problem. The C++ standard library's `std::sort` assumes the whole data set fits in memory. When it doesn't, you don't buy more RAM forever. You use [external merge sort](https://en.wikipedia.org/wiki/External_sorting#External_merge_sort): split the data into chunks that fit, sort them independently, then merge. Distributed query engines do the same thing across many machines.

The algorithm gets its shape from the constraint it accepts. I call the pattern APS:

1. **Acknowledge** the hard limit of the container you're processing in.
2. **Partition** the problem into small, isolated pieces that fit inside that limit and can run in parallel.
3. **Synthesise** the partial results into one coherent output.

For agents, the container is the context window.

## Most of this isn't an LLM problem

The question that changed our approach: to describe the architecture, does the model need to read the code?

It needs the structure. Which modules exist, which classes, which methods, what calls what, what depends on what. Extracting that is parsing, and compilers have done parsing for decades. Spending your most expensive and least reliable resource on the cheapest, most mechanical part of the job is the mistake.

So the first partition is between two kinds of work:

- **Mechanical work** goes to deterministic tools and scripts: parsing, indexing, reading build files.
- **Cognitive work** goes to the LLM: interpreting what the structure means, drawing boundaries, naming domains.

The LLM still decides when to call a tool. It just doesn't do the tool's job.

## The pipeline

Each layer has narrow agents with one job, reads the previous layer's output, and writes its own. Outputs are read-only once written; no later layer edits an earlier one's results.

### Scout: the skeleton

The Scout never reads source code. It reads build files and build tool output, and produces the module list, module dependencies, file counts, and labels for what each directory is (frontend, infrastructure, migrations). Mostly pattern matching.

### Cartographer: the symbol index

One Cartographer per module. Each builds an index of classes, methods and call edges for its module, still without reading code into the context. The first version queried a language server (LSP) for symbols and incoming and outgoing calls. That changed later; more on that below.

### Specialists: domain knowledge

These agents read code, but only surgically. They use the index to jump to a specific class or method because they have a reason to: an `@Entity` annotation, a `@RestController`, a bean definition. Sweeping reads of a whole module aren't allowed.

- **Archaeologist** builds the domain model from entity classes and their relationships.
- **Taxonomist** labels thousands of classes by layer: controller, service, domain, Spring bean.
- **Bean wiring analyst** works out how the Spring XML context files and configuration classes wire things together at runtime, including which flags change the wiring. <!-- TODO(Harshad): what was this agent called in the talk? Captions read "beantoj". -->

### Surveyors: boundaries and flows

- **Surveyor** uses the call graph and class relationships to propose service boundaries inside the monolith.
- **Port Mapper** finds the doors in and out: incoming APIs, outgoing calls, Kafka topics, message queues.
- **Choreographer** traces business transactions and workflows, starting from `@Transactional` methods and following the call graph.

### Chronicler: the documents

A single agent that reads no code at all. It reads the outputs of every earlier layer and writes the documentation: architecture diagrams, domain documentation, the integration map.

### Conductor: holding it together

Someone has to decide how many Cartographers to start, notice when an Archaeologist fails, and re-run it. That's the Conductor. It does none of the work. It holds the pipeline state and starts subagents, which run in parallel and don't know about each other.

This is hub and spoke. Every worker's context is thrown away when it finishes, so the Conductor's own context only ever holds requests and short responses. It stays clean for the whole run.

## What came out

From one run over the codebase:

- A queryable index of millions of symbols across 10,000+ files.
- Around 200 documents, roughly 15 MB of documentation.
- 400+ database tables mapped to their entities.
- An API catalogue of 80+ REST endpoints and 60+ SOAP endpoints.
- 15+ candidate service boundaries for decomposing the monolith.
- 80+ business workflows.
- C4 architecture diagrams at three levels.

We didn't plan for the knowledge base to outlive the documentation, but it did. The team now uses the knowledge base to draft test plans for defects, estimate the blast radius of a change, write onboarding material, and generate the project's `CLAUDE.md`. That last one caught details a new agent session would otherwise get wrong, like using Mockito rather than the older mocking framework still present in parts of the codebase.

The pipeline also fingerprints every file it processes. When a commit changes a file, the Conductor re-runs only the agents that depend on it.

## What we learned running it

### Validate layer by layer

Deterministic output is easy to check. LLM-generated output went to the developers who knew the system, one layer at a time rather than as 200 documents at once.

That's how gaps surfaced. The Choreographer found far fewer workflows than the developers expected. Batch jobs they ran every day were missing. Those workflows were triggered through [Apache Camel](https://camel.apache.org/) routes, which the pipeline wasn't indexing. Once Camel routes got their own processing, the workflows showed up.


### Treat layer outputs as contracts

The LSP-based Cartographer took hours. Each LSP call took 50 to 100 milliseconds, and across 10,000 files that adds up. Language servers are built for an editor looking at one file, not for indexing a whole codebase.

We replaced it with [tree-sitter](https://tree-sitter.github.io/tree-sitter/), parsing every file and writing the symbol index into SQLite. The whole index now builds in about 10 seconds, and the Cartographer layer is a single script.

Nothing downstream had to change. The interface between layers was the schema of what each layer writes, and the new tool honoured it. Treating each layer's output as a contract is what made swapping the tool cheap.

### Respect the economics

A full run cost around $100 to $125. That's cheap for a one-off map of a monolith, and expensive as a default for everyday work.

We tested that directly. We took 12 defects that had already been fixed, so we knew the answers, and ran root cause analysis in 24 sessions: 12 with the knowledge base and 12 with plain Claude Code. Plain Claude Code used fewer tool calls and fewer tokens.

The reason: a bug usually lives in four or five files. Plain Claude Code greps, reads those files whole, and traces the call chain in context. With the knowledge base, the agent found methods by name, then asked what each one called, one hop at a time, burning a tool call per hop. We hadn't given it a tool to trace a full call chain.

Day-to-day work doesn't need the full pipeline anyway. Implementing a feature or estimating the blast radius of a fix needs a queryable symbol index with a taxonomy on top. That's the Cartographer and the three specialists. The Surveyors and the Chronicler produce the big picture: boundaries, flows and documentation. That's mostly for humans.

A partial run costs under $5, because the Cartographer does most of the heavy lifting and it's a deterministic script. We run it after every merge, so the agent always has a current index to query through a tool. The full run is on demand, when someone needs the documentation.

So keep the cheap layers fresh, and don't rebuild the whole knowledge base for daily work. Most of what the full run produces is read rarely, and only by people looking for the big picture.

## What's changed since

We built this in March 2026. Some of it is now closer to built in. Claude Code delegates exploration to subagents on its own to protect the main context, LSP support has shipped, and code graph tools keep appearing. If we started today, we'd lean on those for parts of the Scout and Cartographer work.

The constraint hasn't gone away, though. A single agent still can't hold a 10,000-file system in context and reason about all of it at once, so splitting the work still matters.

What we'd do next:

- Pin models per task. Use the strongest model only for cognitive layers and a small model to drive the deterministic work, to bring the per-run cost down.
- Run it in CI. The pipeline is non-interactive, so `claude -p` can run it on a schedule and publish the artifacts where non-engineers can read them too.

If you're facing a codebase too large for one agent, start where we did. Write down what the context window can't hold, split the work so each piece fits, and give the parsing to a parser.

_Thanks to Karun for helping me turn the talk into this post._
