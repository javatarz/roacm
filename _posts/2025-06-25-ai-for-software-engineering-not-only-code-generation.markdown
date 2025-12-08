---
layout: post
comments: true
author: Karun Japhet
title: "AI for Software Engineering, not (only) Code Generation"
category: intelligent Engineering
tags:
  - software-delivery
  - ai-tools
  - team-transformation
---

Rethinking the role of AI across the entire software lifecycle

[![AIfSE Cover Art: Team collaboration]({{ site.url }}/assets/images/uploads/aifse-cover-art-650x366.jpg)]({{ site.url }}/assets/images/uploads/aifse-cover-art.jpg)

Everyone has been talking about using coding assistants to aid with software delivery. There is more to delivering good software than writing code.

<!-- more -->

Every software development project requires a few different activities from analysis (what), to planning and design (how), to development (build), to testing (validate), to deployment (implement). Each of these activities depends on different skills and techniques that can benefit from the effective use of modern AI technologies.

[![Software Delivery Stages]({{ site.url }}/assets/images/uploads/aifse-1-software-delivery-stages.png)]({{ site.url }}/assets/images/uploads/aifse-1-software-delivery-stages.png)

All software development methodologies, from waterfall to the different agile techniques, fundamentally follow the same cycle. We feel this cycle is not changing yet but there are improvements waiting to be unlocked for organisations.

This post aims to demonstrate how teams of the future can gear themselves to build better products faster.

# Use of AI tools across software delivery

_The tools mentioned in this section are examples to help the reader understand the idea and not recommendations on what to use._

## During Analysis

### Improved analysis

Many teams have integrated AI into their analysis process. Starting with [single agent flows](https://medium.com/inspiredbrilliance/an-agile-kickstart-with-generative-ai-for-business-analysis-484f641ccf6e) that support definition of features, epic and stories, to multi-agent flows that help with addressing different parts of a problem space in parallel. My colleague Carmen Mardiros showcases [how to revise a plan using Claude Code](https://github.com/cmardiros/claude-code-power-pack) where individual agents perform specific tasks to help the analyst optimise a plan before execution. Effectively using AI in support of critical analysis and planning can provide benefits beyond basic requirements definition. [Multi-agent systems out-perform single agent systems but spend significantly more tokens](https://www.anthropic.com/engineering/built-multi-agent-research-system) (and thus money) to do so.

Taskmaster is an AI powered tool that, together with an interactive coding assistant such as Claude Code, can serve as a virtual technical project manager by helping with defining requirements, offering feedback on edge cases, writing stories and setting up and managing the product backlog.

Since you can also ask Claude Code to analyse the codebase to identify technical debt, you can use the same tools to manage both the technical and feature backlogs of the product. This is particularly important when working with mature (legacy) systems as teams and product owners often struggle with balancing technical debt reduction (payback) and new feature development. Although these tools do not replace the expertise required to effectively manage a backlog and prioritise work, they can significantly reduce the administrative burden of doing so.

If all requirements are documented as PRDs, it becomes easier to measure drift as well as look at cards that might be created but might have parts that have already been implemented. You can run this analysis as a weekly or monthly job to clean up your backlog of tasks that are no longer needed.

Not all administrative tasks have been eliminated. When you transition from PRDs to epics on your backlog, there is a time period when both remain active and during this time, the two need to be consciously kept in sync. Over a period of time, the importance of the PRD wanes and it can be killed off. The same is true for other transitions like the one between stories and code.

#### Changes in roles for Business Analysts and Project Managers

The roles of business analysts included note taking, summarising and analysing and helping shape the right product for the business. This role is shifting to focus on being more strategic in nature focusing on finding good opportunities for your products, taking away the transcription/administration parts of the role. Similarly, the roles of Project Managers will include less time on administrative tasks and more time on making sure the right features are being built.

_This is true for all roles we’re going to be speaking about in this post to some extent, calling this out explicitly since this is the first._

### Improved iterative UI/UX design

Tools such as Canva and Figma have helped minimise the time taken to go through a complete feedback cycle with users. AI tools have now started linking up with these tools to help spot implementation drift during development. These tools also have the ability to spot requirements gaps and help us foresee problems. _More on this during the feedback cycles section._

Clair Mary Sebastian also talks about [using generative AI for requirements analysis and wireframing](https://medium.com/inspiredbrilliance/an-agile-kickstart-with-generative-ai-for-business-analysis-484f641ccf6e) using OpenAI’s APIs alongside [Figma’s wireframe designer](https://www.figma.com/community/plugin/1228969298040149016/wireframe-designer).

### AI note taking apps for requirement analysis

[Copilot4Devops](https://appsource.microsoft.com/en-us/product/web-apps/2101440ontarioinc.copilot4devops_official) that will take text summaries and help generate user stories or feature specs. This can be a particularly powerful technique to aide in quicker iterations with generating stories and feature specs.

Note taking apps like [fireflies.ai](http://fireflies.ai) have fairly accurate notes across multiple languages with user detection in conversations and help improve user experience and recall for conversations.

While conversation summaries help with a quick read, they are often misleading or inaccurate. A best practice (or should we say “must have practice”) is for participants to review the notes shortly after the meeting and correct any errors before the notes are accepted. In addition to preventing the dissemination of inaccurate information, this practice improves information retention amongst participants and contributes to an improved shared understanding. This is in contrast to the anti-pattern of relying on unreviewed transcripts and meeting notes, an anti-pattern that discourages critical thinking and delays establishment of a shared understanding that is critical to successful delivery.

Transcripts are not a replacement for actually having real conversations, an anti-pattern we have seen come up on recent teams. Transcripts are also not a replacement for remembering context yourself. Context helps build intuition for decisions and one of our worries is that intuition will reduce over a period of time.

### Improved communication and context

Currently, users from the business (or product owners as a proxy) work with business analysts from delivery teams to collaboratively help shape the product. This communication usually requires experienced product owners who understand technology well enough at a distance to know what questions to ask and how to shape the conversation to build quick consensus on what the product’s vision is. This communication also requires experienced business analysts who know how to extract details of how the system should work, anticipate challenges during building the product and pre-empt them with questions. Teams who do a good job at analysing the system require individuals at the top of their game. If either of these individuals does not have the pre-requisite knowledge, communication is sub-optimal.

We see that this status-quo is ripe for disruption. Doing so requires us to build a system (or product) that absorbs domain context before it can be used.

[![AI collaboration for analysis]({{ site.url }}/assets/images/uploads/aifse-2-ai-collaboration-for-analysis.png)]({{ site.url }}/assets/images/uploads/aifse-2-ai-collaboration-for-analysis.png)

Since most teams are distributed, a conversational AI can help users prepare for their synchronous or asynchronous communication with the team given that the AI has the persona of a developer who is an expert at the specific tech that is used to work on the product. Similarly, delivery team members can use a conversational AI system to help understand the business context better and anticipate pushback and prep for it. Being able to understand the devil’s advocate stance in their head and prepare for it is something most people struggle with. Important conversations still happen through direct communication, however, both the users and the business analysts can help pair on preparing for the actual conversation with real people on the other side.

Over a period of time, the conversational AI system can help improve the quality of preparation conversations for both actors providing quicker feedback.

## During System Design

AI makes it possible to more quickly and thoroughly define and compare different solution designs for a given problem space. The ability to quickly and thoroughly evaluate the impact of different architectural decisions can multiply the value of experienced architects and may even enable more advanced practices such as emergent architecture as AI can help teams safely adjust the solution design as requirements change or new requirements emerge.

When a system is built, the system design is built to meet some constraints and have a target state. Both the target state and constraints evolve over time. Good teams will track these constraints in the beginning and through the evolution of the product as [ADR](https://github.com/joelparkerhenderson/architecture-decision-record)s and [fitness functions](https://evolutionaryarchitecture.com/ffkatas/index.html). Some teams find it hard to keep track of the delta between the current and target state (current debt). Using AI tools, this debt is easier to identify, track and address. Teams can use specific prompts in different areas to identify these challenges and help evolve the system in the right direction.

[![Software Delivery Stages]({{ site.url }}/assets/images/uploads/aifse-4-emergent-design-with-ai.png)]({{ site.url }}/assets/images/uploads/aifse-4-emergent-design-with-ai.png)

Tools like [eraser.io](http://eraser.io) exist to allow generation of architectural documents through text. Combining this with the ability to generate documentation based on the code, systems can ensure architectural documents are always up to date.

## During Development and validation

In today’s fast-evolving AI landscape, engineers must embrace a dual-mode workflow (planner and executor) to get the most out of coding assistants. As a planner, you leverage a high-reasoning model (for example, Claude Sonnet 4 over 3.7 or GPT-4o) to deconstruct monolithic docs into modular guides (e.g. splitting a bulky claude.md into coding-practices.md and development-workflow.md), map out architectural changes, and draft a detailed implementation roadmap. Once the blueprint is locked in, switch to a specialized coding model (like Sonnet, GitHub Copilot with tailored instructions, or Claude Code) for hands-on development, refactoring, and validation. By matching each task to the model best suited for it and scoping prompts to only the relevant files or services you streamline token usage, accelerate processing, and cut context-window bloat.

Executing at scale also demands a culture of experimentation and flexibility. Expect a learning curve as teams test different assistants (Copilot, Cursor, Claude-Code, etc.) and prompt strategies for different tasks like migrating an entire codebase versus tweaking a single method signature, for example. Build in continuous feedback loops around prompt-to-PR cycle times, code quality metrics, and token costs to identify what works best in each scenario. Agentic integrations via [Model Context Protocols](https://modelcontextprotocol.io/introduction) and tools like Puppeteer, Slack bots, and GitHub Actions can then automate routine tasks — from branch creation to dependency updates and test orchestration right within your existing toolchain.

## During Deployment and Operationalisation

Over the past decade, practices in the DevOps space have changed quite significantly with the focus on automation (CI/CD) observability and improved monitoring tools. As this data became more centralised in platforms like AppDynamics, DataDog and NewRelic, these systems have been able to spot errors, intelligently alert users and help spot anomalies.

Platforms like Harness now support [automated error analysis](https://developer.harness.io/docs/platform/harness-aida/ai-devops/#error-analyzer-demo) to help understand the root cause of issues and help provide steps to fix them.

## During Feedback Cycles

Traditionally, individuals caught drifts in software development. There are tools being built in place to help catch different types of drift. Tools such as [Cubyts](https://www.cubyts.com/) catch both requirement drift (between requirement specs and stories) and implementation drift (between requirement specs, application mock ups and implementation). This is possible because these tools connect with tools like JIRA, Figma, GitHub etc. to analyse the contents of that platform and find possible challenges using the capabilities LLMs provide.

# How do you enable this transformation
## Preparation

1.  Identify a candidate project
2.  Ensure the candidate project has good safety nets
3.  Ensure the candidate project has a stable product team with good shared context
4.  Identify the right stage of software development, which is most painful and will benefit from introducing AI tools
5.  Identify seed individuals with prior experience in the space, the right opinions and the ability to mentor team members
6.  Identify the tool to introduce
7.  Set up success criteria for this transformation

## The journey

1.  Set up time to up-skill team members (on the skills from the “For people on teams” section). [Pair](https://martinfowler.com/articles/on-pair-programming.html) team members with seed individuals for maximum effectiveness.
2.  Set up weekly retrospective meetings to catch trends and course correct as necessary. Timely feedback is critical.
3.  Set up a checkpoint to see if the team members require less support from seed individuals weekly. Until a threshold of independence is reached, keep repeating steps 1–3.
4.  Seed individuals depart from the team and only join retrospectives for support.
5.  Set up a checkpoint to check if seed individuals are required in the retros and to confirm that the team is meeting the success criteria.

_The 4-week period are indicative examples of what teams may need. Tweak the time period on a need basis._

[![Software Delivery Stages]({{ site.url }}/assets/images/uploads/aifse-3-ai-assisted-delivery-upskilling.png)]({{ site.url }}/assets/images/uploads/aifse-3-ai-assisted-delivery-upskilling.png)

AI’s role in software engineering goes far beyond code generation — it’s reshaping how we design systems, make decisions, and collaborate. To truly unlock its potential, we need to rethink not just our tools, but how our teams operate. In the next post, we’ll explore [**patterns for AI-assisted software delivery**]({{ site.url }}/blog/2025/07/07/patterns-for-ai-assisted-software-development/) — focusing on how to build more effective teams, and how individuals can work differently to make the most of AI in their day-to-day practice.

# Credits

This blog would not have been possible without the constant support and guidance from [Greg Reiser](https://www.linkedin.com/in/greg-reiser-6910462/), [Priyank Gupta](https://www.linkedin.com/in/priyaaank/), [Veda Kanala](https://www.linkedin.com/in/veda-kanala/) and [Akshay Karle](https://www.linkedin.com/in/akshaykarle/). I would also like [Swapnil Sankla](https://www.linkedin.com/in/swapnil-sankla-30525225/), [George Song](https://www.linkedin.com/in/gsong/), [Rhushikesh Apte](https://www.linkedin.com/in/rhushikesh-apte-685a5948/) and [Carmen Mardiros](https://www.linkedin.com/in/carmenmardiros/) for reviewing multiple versions of this document and providing patient feedback 😀.

This content has been written on the shoulders of giants (at and outside [Sahaj](https://sahaj.ai)) that I have done my best to quote throughout.