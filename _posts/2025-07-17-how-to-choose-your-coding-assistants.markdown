---
layout: post
comments: true
author: Karun Japhet
title: "How to choose your coding assistants"
description: "Navigate the AI coding assistant market: compare models, costs, licensing, and IP indemnity to find the right tool for professional development."
category: intelligent Engineering
tags:
  - coding-assistants
  - developer-experience
  - software-licensing
devto: true
devto_tags:
  - ai
  - productivity
  - programming
  - discuss
---
Why it’s harder for a professional developer to use a tool despite the wide variety of choices

[![Chosing Coding Assistants Cover Art: Choose your tool]({{ site.url }}/assets/images/uploads/choose-coding-assistants-cover-art-650x433.jpg)]({{ site.url }}/assets/images/uploads/choose-coding-assistants-cover-art.jpg)

Coding assistants like [Cursor](https://cursor.com/), [Windsurf](https://windsurf.com/), [Claude Code](https://docs.anthropic.com/en/docs/claude-code/overview), [Gemini CLI](https://github.com/google-gemini/gemini-cli), [Codex](https://openai.com/index/openai-codex/), [Aider](https://aider.chat/), [OpenCode](https://github.com/sst/opencode), [JetBrains AI](https://www.jetbrains.com/ai/) etc. have been making the news for the last few months. Yet, the choice of tools is a lot harder and limited for some of us than it seems.

TL;DR: OpenCode > Claude Code > Aider > Copilot > *

<!-- more -->

# Understanding the tools

Not all tools are created equal. Tools evolve fairly rapidly so the examples listed here might be invalid fairly soon.

![Coding assistants scale]({{ site.url }}/assets/images/uploads/code-generation-scale.png)

You can plot the different types of coding assistants on a graph showcasing the amount of human involvement required (`lesser involvement = more automation`). The first GitHub Copilot release I used allowed tab completions. It would either complete single lines or entire blocks of code. You could describe your intent by creating a function with a good name or by writing a comment. GitHub Copilot then supported inline prompting or chat sessions.

Coding agents are the current state of the art toolset for most developers on a day to day basis. They allow you to have conversations with them and you should treat them as team mates, albeit ones with anterograde amnesia.

Some problems can be parallelised and background agents triggered locally are incredibly powerful. Claude code [supports subagents](https://www.anthropic.com/engineering/claude-code-best-practices) is frequently used for analysis and [solving multiple issues in parallel](https://www.geeky-gadgets.com/how-to-use-git-worktrees-with-claude-code-for-seamless-multitasking/) using `git worktree`s. Similarly, some people hook up agents to remote instances for things like code reviews using [Claude code](https://docs.anthropic.com/en/docs/claude-code/github-actions) or [Copilot](https://docs.github.com/en/copilot/how-tos/agents/copilot-code-review/using-copilot-code-review).

The extreme version of this is pure [vibe coding](https://x.com/karpathy/status/1886192184808149383). There is enough content out there about why this is a bad idea and the number of issues on real systems because of this.

# Challenges with using these tools

When picking up a tool, I have started looking at different aspects of these tools

## Choice of models

LLMs change quite quickly. Claude Sonnet 3.7 started off being the favourite model for most developers I know. When Claude Sonnet 4 came out at the same cost as 3.7, it became the new favourite model. Claude Opus 4 is great for larger codebases but expensive.

As I write this (mid-July 2025), the word on the street is that Grok 4 is currently the best model on the block. Choose something that has good coding insights and a large context window. Claude Sonnet has some of the smaller context windows but is tuned quite well for software development.

Cursor supports most of the best models and provides diversity. Tools like Claude Code and Gemini CLI are built and maintained primarily for use with a single model.

## Ease of use

This one is fairly subjective and dependent on the developer’s preference. Tools like Cursor are VS Code forks and thus provide tight integration with the editor. Others like Claude Code, Codex and Gemini CLI run on the terminal. Claude Code provides decent integration with the IDEs from the JetBrains family and thus provide good support to pair with your AI assistant.

Speed factors into ease of use too. While Jetbrains AI is the best integrated tool amongst all of these (if you prefer using their IDEs), their AI tool is one of the slowest. Slower tools mean slower feedback cycles. Slower feedback cycles are [some of the worst things for dev experience]({{ site.url }}/blog/2025/06/23/what-makes-developer-experience-world-class/).

## Cost per change

Cost pays a huge part in someone’s choice of tools and running LLMs are fairly expensive to run. Most tools charge you per use, some by tokens, some by APIs. Since we’re in the relatively early days of these tools and they are competing to capture the market, some still provide fixed investment offers in exchange for “unlimited plans.

Cursor used to be $20/month with _unlimited_ usage till June 2025. While all “unlimited” usage is rate limited, if the usage limits are generous or the rate limits are not severe, users can manage to have a decent developer experience. More recently, Cursor updated their prices to make the $20/month Pro plan for “light users”. Daily users are recommended to use their $60/month Pro+ plan and power users are recommended to use their $200/month Ultra plan. Users on reddit have complained about [how the Ultra plan is insufficient](https://www.reddit.com/r/cursor/comments/1lywpdj/ive_got_ultra_last_night_already_got_warned_about/), though Cursor’s documentation says that [it should be sufficient](https://docs.cursor.com/account/pricing#expected-usage-within-limits). This seems to primarily be because of heavy Claude Opus 4 usage, one of the most expensive models.

Another fixed usage tool is Claude Code for individuals with it’s Pro and Max plans. The $100/month Max plan seems to be the sweet spot for most heavy users and is probably the best value for money, at least until you look at the licensing.

Google’s Gemini CLI, at launched, announced the most insane free tier (that allows you to spend an estimated $620/day) but at the cost of training on your projects. More on this, in the next section. The free tier might not be this generous forever so if the “training on your data” bit isn’t a concern, enjoy Google’s generosity.

## IP ownership indemnity and licensing

Licensing is a complicated topic and I go off of the advice that people much more qualified than me give in this space. The current understanding of this space is that you want to be on

1.  company licensing (avoid individual licenses)
2.  a tool that does not train on your data
3.  provides you indemnity against IP claims

You should avoid individual licenses since the protections usually apply to you, not the organisation you work for. If you work with a services company and create IP for your clients, you want to avoid the risk of the protections not covering your clients.

Avoid tools that train on your data if you’re building something commercially. If you’re on a FOSS tool/system, you can ignore this fact. Google Gemini CLI’s free tier is a great example of this. They get to use your data to make the system better in exchange for you having a good coding assistant free of cost.

Anthropic, the creator of Claude Code, [indemnifies its commercial users](https://www.anthropic.com/legal/commercial-terms) against lawsuits. Most other tools tend to do this too. Interestingly, [Cursor does not](https://cursor.com/terms-of-service), at least as of the writing of this article. Their [MSA](https://www.cursor.com/terms/msa) provides this protection, however, they only do this for customers signing up for more than 250 seats. This may change in the future and talking to their support is the best way to clarify this.

# What do I use and recommend at this point?

For team members who are new to using coding assistants, start off with Copilot where users will appreciate the fixed cost. Learn, experiment. Strengthen your core skills in this new world: [Prompt Engineering](https://www.promptingguide.ai/techniques) and [Context Engineering](https://www.llamaindex.ai/blog/context-engineering-what-it-is-and-techniques-to-consider) (_more on these skills in another blog_).

When you have mastered these skills, you should consider moving to an API based tool that allows you to switch between models. Personally, I’m a fan of the Claude Sonnet and Opus models over OpenAI (and to some extent, Gemini). If you can manage costs well, move to Claude Code (or an open source tool like OpenCode or Aider). I would put OpenCode above Claude Code due to it’s flexibility.