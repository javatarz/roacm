---
layout: post
comments: true
author: Karun Japhet
title: "Patterns for AI assisted software development"
description: "Essential patterns for AI-assisted development: team strategies for quality guardrails, the new teammate mindset, and measuring AI's impact on delivery."
category: intelligent Engineering
tags:
  - ai-patterns
  - engineering-culture
cross_post: [devto, medium]
---

Moving beyond tools: habits, prompts, and patterns for working well with AI

[![Patterns AIfSE Cover Art: Team collaboration]({{ site.url }}/assets/images/uploads/patterns-aifse-cover-art-650x339.jpg)]({{ site.url }}/assets/images/uploads/patterns-aifse-cover-art.jpg)

In the last post — [**AI for Software Engineering, not (only) Code Generation**]({{ site.url }}/blog/2025/06/25/ai-for-software-engineering-not-only-code-generation/) — we explored how AI is transforming software engineering beyond just writing code. Now, let’s look at what that means for teams and individuals in practice.

There are a few patterns that people running teams and on teams that are going to build software with assistance from AI tools should remember.

<!-- more -->

# For people building teams

## Focus on value

With the AI ecosystem shifting weekly, C-level and VP-level stakeholders who prioritise modular documentation, model pairing, scoped context, and tooling agility will drive the highest ROI while keeping teams nimble and ready for whatever comes next. Make it work, make it right and **then** make it fast/cheap.

## Journey per software delivery stage, one stage at a time per team

This journey is going to be transformational for teams. Like most transformations, you do not want to change too much too quickly.

When bringing change to a single team, introduce it one software delivery stage at a time to easily verify effectiveness. In a large organisation, you could try different tools for the same stage on different teams to A/B test effectiveness while taking into account the nuances of the individual teams themselves. We don’t recommend this approach if you would like to converge towards a single tool throughout the organisation because changing tool choices after the team gets used to it causes more friction.

When you have multiple teams willing to take this journey, you can have each of them pick tools in different stages to help reduce the time that your organisation takes to make a decision on a toolset. A couple of teams can try AI tools for requirements analysis while others can try agentic coding tools for development.

## Expect a learning curve

Especially if you’re an experienced developer, you will feel slower when you start off on this journey. This is no different than working with a new teammate and feeling that your overall productivity is lower. You trade off your own speed against the value you will get when your teammate is onboarded and can deliver by themselves.

From our experience, you are looking at a 2–4 week drop in perceived productivity before the gains will start showing up. As a result, the costs will go up (slower delivery and cost of tools) before they come back down (faster delivery and more time to focus on quality).

## Quality guardrails are a prerequisite

Do not bolt on quality and security guardrails after the fact. Start with them. Ensure a [robust test pyramid](https://martinfowler.com/articles/practical-test-pyramid.html) and implement shift-left strategies for both testing and [security](https://snyk.io/articles/shift-left-security/), enabling quick and early feedback. These guardrails will be invaluable when your team is moving at breakneck speeds through newer features.

If you don’t have these guardrails first, you can use AI to help generate them and review these plans. Like the [Maker-Checker](https://en.wikipedia.org/wiki/Maker-checker) process, if an AI coding assistant has helped you plan and create these guardrails, they should be thoroughly reviewed by someone who has the expertise in these fields to catch the small bugs that can have disastrous consequences later.

## Autonomous agents are far away

Humans are required in the loop for software development. 10+ years after the first demos of driverless cars, we’re still waiting for a general purpose implementation. While we have made massive progress, it takes time. While agents have made massive progress in the last 2 years, we still need to exist to make sure things work well and that the systems are maintainable. The skill to build maintainable systems is more important now than ever.

## Watch out for ‘AI Slop’

Without the right guardrails and structures in place, teams will produce more code, faster while sacrificing quality and security. Teams that have been given access to AI tools without helping them build skills first often point out longer pull requests coming in faster than ever before making people reviewing the code a bottleneck. Eventually, the reviewers end up accepting pull requests due to pressure or fatigue leading to important issues being missed.

Individuals should focus on small chunks of work and teams should look at key metrics to measure the effectiveness of their tool usage _(we talk about both of these later in the post)_.

## Changes to individual responsibilities and team composition over time

If teams in your organisation currently contain distinct individuals playing different roles like business analyst, architect, developer, quality analyst, infrastructure engineer and production support engineer, you will see that the distinct responsibilities of these roles will rely less on administrative tasks freeing each of them to focus on thinking strategically and the core responsibilities of their roles. Different organisations will see a merger of different roles. Some will see a merger of the business analyst and product manager roles. Some will see product and project managers merge. Some will see project managers’ responsibilities be split between technical leads and product owners.

In doing so, individuals will emerge that pick up or demonstrate their ability wear multiple hats for example, talk to the business, design the system, develop, validate, deploy and monitor it. These individuals will understand the challenges of the business and work end to end to address it. We have been calling such individuals [Solution Consultants at Sahaj](https://www.youtube.com/watch?v=FTdpjlq8IcY) and believe that most teams will need such individuals on their team in the near future once they leverage AI in their delivery.

## Beware of reduced intuition for decision making

As teams move towards using automated notetakers to help capture more detailed conversations, we should be on the lookout for a few anti-patterns

While conversation summaries help with a quick read, they are often misleading or inaccurate. Please read the full transcription to help improve confidence in what was spoken about. Transcripts are not a replacement for actually having real conversations, an anti-pattern we have seen come up on recent teams.

Transcripts are also not a replacement for remembering context yourself. Context helps build intuition for decisions and one of our worries is that intuition will reduce over a period of time.

# For people on teams

## The ‘new teammate’ mindset

Treat the AI system as a new team mate or a collaborative partner and not a tool. You can use a tool, be unhappy about the way the tool works and stop using it. When a new team mate joins your team, the fundamental thought process is different. You try to onboard the team mate and give it better context. Writing good instructions or prompts is key to success.

LLMs are like team mates with [anterograde amnesia](https://my.clevelandclinic.org/health/diseases/23221-anterograde-amnesia). They can have some memories but these are fairly limited by the size of their [context windows](https://towardsdatascience.com/de-coded-understanding-context-windows-for-transformer-models-cd1baca6427e/). Understanding how to manage context windows is key to being able to work with our new team mates effectively. Keep only what is necessary in the context window and clear it when it isn’t required. Common context should be added to a file (check rules section below) and included only when necessary.

If your prompts to a coding assistant are vague, the tool will keep going around in circles and not make any progress on the task or do the wrong thing.

For example, when you ask the agent: `I have noticed that [http://localhost:4000/create-profile](http://localhost:4000/create-profile) has alignment issues and contains text that is spreading outside the buttons. Can you please fix this?`

If the agent has access to the [puppeteer MCP](https://mcpcursor.com/server/puppeteer), it will open up the UI, take a screenshot, process and fix it. If your application has a login page, it will see that the Create Profile view is not being loaded and decide to “fix” this issue by removing authentication 😞. Adding “`Please wait for me to login if required`” to the prompt helps avoid this issue.

If your prompts have not told the system that you need a solution that has been simplified or one that does not hard code solutions, it will not follow these instructions. Add your general coding standards to a document and include that in the base context. If you have rules around test quality, split that into a smaller document explaining what good tests look like for the team.

## Small chunks of work

Break your work down. Reviewing a 1000 line review has always been hard. You can generate large code diffs with AI quickly. You, the developer, are the bottleneck. You are still responsible for quality and security.

Work on smaller chunks. Review regularly. Do small commits. [Age old practices still apply](https://softwareengineering.stackexchange.com/a/74765/95571).

## Configure the tool based on your team’s rules

Each tool requires configuration. Configurations take time to test. It might take a few tries over multiple days to get these configurations correct. Each tool has a different way to be configured and there is no standardisation. In the Agentic code pairing tool space, every tool has its own configuration mechanism. Cursor has [Cursor Rules](https://cursor.directory), Claude has [memory](https://docs.anthropic.com/en/docs/claude-code/memory), Windsurf has [Memories & Rules](https://docs.windsurf.com/windsurf/cascade/memories) and IntelliJ’s Junie has [guidelines](https://www.jetbrains.com/guide/ai/article/junie/intellij-idea/). Each of these looks like a markdown file but has slightly different formats. If you’re experimenting between multiple tools (or different teammates prefer different tools), you will have to keep these rules in sync by hand. What’s worse is that the same instructions do not have the same effectiveness across different tools because their system prompts are different. Testing regularly and tweaking is key. Tools also rapidly update. Claude Code releases [every couple of days](https://www.npmjs.com/package/@anthropic-ai/claude-code?activeTab=versions) (at the time of writing). Rules may need to be updated based on changes to the tool of your choice.

## Shift in time spent on different responsibilities

Teams will increasingly spend more time upfront in planning what needs to be built and what the right thing to build is than in actually building things. This does not mean that teams are walking away from agile but truly embracing it. The time spent on analysis and planning will go up as a proportion but the overall time taken to deliver a version will go down. Each of the individual activities (analysis, development etc.) will be done in thin slices helping build the system up incrementally.

## Over-reliance on AI instead of thinking and remembering yourself

Since AI works fast, it’s easier to be lulled into a sense of security and thus have a sense of reliance on the tools. Over time, some individuals may spend less time thinking critically and making decisions.

For example, if a good note-taking app takes notes and summarises them correctly 95% of the time, it is easy to forget that the 5% of mistakes, especially if they happen in critical parts of the conversation, can be quite expensive to fix. Summaries are good but they are not a replacement for reading the transcript which itself cannot beat actually having a conversation with people.

We need to use these systems to help us be better at our roles. Critical thinking is not optional, now more so than ever. We need to put guardrails in place to spot and correct intellectual laziness. If an issue is found that you missed during review, check if you thought about it critically enough. Do so for teammates too and help provide feedback if they are slipping.

# How do you know AI is helping software delivery?

Use both qualitative and quantitative measures. Early stages focus on “leading” indicators: developer sentiment, tool usage, and workflow metrics. Conduct developer surveys and track AI usage statistics (active users, acceptance rates) as [GitHub recommends](https://resources.github.com/learn/pathways/copilot/essentials/measuring-the-impact-of-github-copilot/). Complement these with engineering metrics: cycle time (time from commit to deploy), pull-request size and review duration, deployment frequency, and change‑failure rates. [These DORA‑style metrics help ensure speedups don’t sacrifice quality](https://waydev.co/ai-coding-tools-are-impacting-productivity/#:~:text=,whether%20AI%20increases%20this%20measure). Align these KPIs to business outcomes (e.g. shorter time-to-market, fewer critical bugs). Set “clear, measurable goals” for AI use and monitor both productivity and code quality over time.

Up next, we’ll dive into strategies for [managing tech debt and elevating developer experience]({{ site.url }}/blog/2025/07/17/how-to-choose-your-coding-assistants/) in a world where AI is part of the team. We’ll explore why it’s now easier than ever to stay ahead of the curve — and share the exact prompts and techniques that make it possible.

# Credits

_This blog would not have been possible without the constant support and guidance from_ [_Greg Reiser_](https://www.linkedin.com/in/greg-reiser-6910462/)_,_ [_Priyank Gupta_](https://www.linkedin.com/in/priyaaank/)_,_ [_Veda Kanala_](https://www.linkedin.com/in/veda-kanala/) _and_ [_Akshay Karle_](https://www.linkedin.com/in/akshaykarle/)_. I would also like_ [_George Song_](https://www.linkedin.com/in/gsong/) _and_ [_Carmen Mardiros_](https://www.linkedin.com/in/carmenmardiros/) _for reviewing multiple versions of this post and providing patient feedback 😀._

_This content has been written on the shoulders of giants (at and outside_ [_Sahaj_](https://sahaj.ai)_) that I have done my best to quote throughout._