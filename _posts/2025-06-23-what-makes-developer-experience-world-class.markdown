---
layout: post
comments: true
author: Karun Japhet
title: "What makes Developer Experience World-Class?"
description: "The five non-negotiables for world-class developer experience: project readme, automated setup, fast iteration, pre-commit checks, and local-first tools."
category: Engineering Practices
tags:
  - developer-experience
  - engineering-culture
evergreen: true
devto: true
---
The habits, tools, and practices that set great engineering teams apart.

[![DevEx Cover Art: Good DevEx = Happy Developer]({{ site.url }}/assets/images/uploads/devex-cover-art-650x434.jpg)]({{ site.url }}/assets/images/uploads/devex-cover-art.jpg)


Developer experience (DevEx) isn’t just about fancy tools or slick UIs - it’s about removing friction so teams can move with confidence, speed, and clarity. In high-performing teams, great DevEx means fewer context switches, faster feedback loops, and more time spent actually building. In this post, we’ll explore the five non-negotiables every codebase should have to support world-class collaboration, and we’ll map out a practical DevEx stack to help your team deliver better products, faster.

<!-- more -->

# The Five Non-negotiables

## I. Project readme


> Short, sweet and simple

Write a short note with a few lines on what this codebase is responsible for. Indicate the setup process and lifecycle to go to production. Code should act as documentation and anything that code will not document as obviously (what are the first set of things you should read) should be in here.

## II. Automated setup

> A single command to get your entire workstation setup.

I am a huge fan of using shell scripts for smaller projects and [justfile](https://github.com/casey/just)s for larger ones. This isn’t about tools. This is about your experience.

Run `just setup` and have a workstation that is ready to go (including requiring node/python, installing all the dependencies and setting up a database, if required. I expect other obvious commands like `just run`, `just lint`, `just test` and `just build`. I admit that I have been spoiled by [gradle](https://gradle.org/) and [maven](https://maven.apache.org/) in JVM land and clearly have withdrawal symptoms in the [land of the snakes](https://www.python.org/).

Take this a step further and automate test data creation. If your application is stateful, please generate the test data on startup. This way, you are ready to test what you need the moment your application starts. Test data setup might add a few seconds to your startup but it will save you minutes in testing things and much more than that in your emotional happiness. If you are building an e-commerce website, create a few product categories, products in each of the categories and a few test users. Make sure your test user has elevated privileges to begin with making it easier for you to start testing things. The single `just run` command should have you ready to test your scenarios.

## III. Iterate fast

> Faster the feedback, the better

I like fast iterations. Left on my own, I’d commit every 5–10 minutes; sooner, if I can get away with it. This includes the time it takes me to lint and test. This means fast code linting and tests. I love code linting tools that take less than a second and unit tests that take less than 5 seconds across the entire project. If running all tests takes more than 5 seconds, I’ll run them before a push. If it takes more than a minute, I’m refactoring/optimising something.

There are enough engineering techniques to go fast. Got a large number of tests? Run them [in parallel](https://pytest-xdist.readthedocs.io/en/latest/). Integration tests take time? [Share container context and database test containers](https://stackoverflow.com/a/62443261/499797).

Once you get used to this, you will not go back.

## IV. Enforced pre-commit/pre-push checks

> Shift feedback leftward

Use frameworks like [pre-commit](https://pre-commit.com/) (others exist for most toolchains) to run your entire CI safety net locally. Early feedback is key. Lint code with every commit. Linters should spot issues (like increased complexity, dead code, etc.) early and format code consistently. Test everything before pushing.

## V. Everything runs locally

> Nothing should require the internet or external resources if possible

Can you run your code locally? Sounds like a silly suggestion but I bet that there is at least one team still working with an old system that’s written in C that logs into a remote machine and writes code in `vim` without any setup for code completion, early compilation feedback or running code in an “IDE like setup” with world-class debugging support.

Use a proper IDE. I personally love the [IntelliJ suite of tools](https://www.jetbrains.com/ides/) for most languages. Some of my teammates are emacs and vim power users who have the same setups (code completion, auto-compilation, error detection, running code, and debugging support). IntelliJ even comes with its own set of profiling tools that are a real timesaver for me and easily worth the cost of usage.

A teammate once asked “If you were to get on a flight, could you continue to write code”. This was not a hypothetical question as we used to travel every week and spend 3+ hours on a flight, time you’d like to make good use of. Having a toolset that you can go offline and work comfortably in, even when travelling is a really nice experience as a developer.

# The DevEx Stack

Want to go beyond the non negotiable items and dive deeper into improving your team’s DevEx? Here’s a stack with some techniques, tools and practices to try out.

_This section is going to be heavy with crosslinks to other articles to keep this article short for people who already know some of these concepts._

```
        Layer                          Tools/Practices
Code Quality            Linters, Formatters, Typing, Modular Design
Automation              Pre-commit, CI/CD, Makefiles, Containerisation
Testing and Validation  Fast tests, Coverage, Contracts, Security Scans
Documentation           Onboarding, Readmes, ADRs, Comments, PR Templates
Culture and Workflow    Git hygiene, Blameless retros, Tech debt tracking
```

## Foundational code practices

People have their preference in how code is styled and a good codebase is one that looks like a single person has written it.

Have a clear and consistent code style that is enforced via linters and formatters that work across the CLI and IDEs that the team uses. Use a configuration that is checked into version control to ensure consistency.

Duck typing enthusiasts can look away but please prefer strong typing (Typescript over Javascript, `mypy` on Python etc.). Your IDE suggestions and ease of exploration of language APIs will thank you, especially if your team aren’t experts at the language.

Build a codebase that has clean code architecture ([layered](https://imtarundhiman.substack.com/p/understanding-layered-architecture), [hexagonal](https://en.wikipedia.org/wiki/Hexagonal_architecture_(software)), etc.). The codebase should clearly showcase design preferences (composition over inheritance) and even codify them through tests or [fitness functions](https://www.oreilly.com/library/view/building-evolutionary-architectures/9781491986356/) when possible.

When the code isn’t obvious, do not add comments. Write [better tests](https://www.thecoder.cafe/p/unit-tests-as-documentation) and [refactor your code](https://flatirons.com/blog/what-is-code-refactoring/).

## Tooling and automation

Run formatters, linters, and tests automatically (using tools like [pre-commit](https://pre-commit.com/) and [husky](https://github.com/typicode/husky)). Build CI/CD pipelines that are fast and reliable which provide meaningful feedback when things fail. Automatic deployments to non-prod environments. Automated rollbacks strategies when deploying to production. It’s 2025 and there are very few reasons to need downtime [even when running most standard migrations](https://ivelum.com/blog/zero-downtime-db-migrations/). [Build observability into your pipelines](https://www.youtube.com/watch?v=IA_z8KHAEWg&list=PLj6h78yzYM2NFT2PGItX2idBf7v8fHcy7&index=2) to help diagnose issues (like pipelines slowing down) quicker.

A local developer experience that is consistent with production ([docker](https://www.docker.com/), [docker compose](https://docs.docker.com/compose/), and [vagrant](https://developer.hashicorp.com/vagrant) environments for more bespoke OS’). Use scripts for common workflows (`just`, `npm` scripts).

Builds need to be [deterministic and reproducible](https://en.wikipedia.org/wiki/Reproducible_builds). [Lock your dependencies](https://svenluijten.com/posts/what-is-a-lock-file-and-why-should-you-care) and avoid [dependency hell](https://medium.com/knerd/the-nine-circles-of-python-dependency-hell-481d53e3e025). This might not be a big deal to the experience of developers on a daily basis but add periodic checks for outdated or vulnerable dependencies (using tools like [snyk](https://snyk.io/blog/snyk-cli-cheat-sheet/)).

## Testing and verification

Automate your tests with good quality [unit tests](https://www.artofunittesting.com/) for your logic, [integration tests](https://kentcdodds.com/blog/write-tests) for the boundaries and (hopefully [consumer driven](https://pactflow.io/blog/what-is-contract-testing/)) [contract tests](https://medium.com/@abo.saad.muaath/contract-testing-in-microservices-fundamentals-benefits-and-best-practices-f5928a12522e) for external APIs that together, make up a good [test pyramid](https://martinfowler.com/articles/practical-test-pyramid.html) or [test trophy](https://kentcdodds.com/blog/write-tests). Do not chase test coverage numbers. Use coverage to catch critical paths that are not well tested. [Flaky tests suck](https://www.codewithjason.com/how-i-fix-flaky-tests/), please [eliminate them](https://www.lambdatest.com/learning-hub/flaky-test) like a plague. Make them easy to run using an obvious command (like `just test`, `npm test` or `./gradlew test`).

Use [test doubles](https://martinfowler.com/bliki/TestDouble.html) when necessary. [Mocks and stubs](https://martinfowler.com/articles/mocksArentStubs.html) are required but [try to be stateful when possible](https://the-dext.github.io/TDD_Mocking-vs-No-Mocking/) (the last bit is a debatable opinion; one of the few endless debates in this blog). Use [snapshot tests](https://jestjs.io/docs/snapshot-testing) when possible but do not abuse this technique.

Lint your code. Do so early. Add security linters (like [bandit](https://bandit.readthedocs.io/en/latest/) or [semgrep](https://semgrep.dev/))

## Collaboration and documentation

Every project should have a `README.md`, a TL;DR of your quick start guide for developers. Add a `CONTRIBUTION.md` for guidelines on how people can be good contributors (do you practice [trunk based development](https://trunkbaseddevelopment.com/) or [git flow](https://www.gitkraken.com/learn/git/git-flow)? The answer will not be obvious to everyone when starting off on the project). Set up PR templates and code review guidelines to help aid internal conversations.

Automate your setup. New developers on your team should be productive in less than 5 minutes of the repository checkout (including [the time taken to download dependencies](https://www.youtube.com/watch?v=dAJED82HDYg)).

If you’re creating an SDK or API, please generate auto-generated documentation. Capture decisions as [Architectural Decision Records (ADRs) and C4 diagrams](https://medium.com/decathlondigital/software-architecture-architecture-decision-record-c4-11ceff211baf). This makes continued context maintenance and acquiring historical context easier.

## Team workflows and culture

Decide on [Trunk Based Development](https://trunkbaseddevelopment.com/) (TBD) or [Git Flow](https://www.gitkraken.com/learn/git/git-flow) (GF). If you’re going with TBD, merge early and merge often but do so with [feature toggles](https://martinfowler.com/articles/feature-toggles.html). If you’re going with GF, create [short-lived feature branches](https://trunkbaseddevelopment.com/short-lived-feature-branches/).

Set up a culture of [blameless retros](https://www.goretro.ai/post/how-to-run-a-blameless-sprint-retrospective) to learn from your mistakes effectively.

Track tech debt actively on the backlog and manage it regularly. Acknowledge and prioritise debt alongside features.

Ensure the team is used to [sharing feedback openly](https://madssingers.com/management/feedback/). Set up [retrospectives](https://retromat.org/blog/what-is-a-retrospective/) as a group and time to [introspect](https://www.verywellmind.com/what-is-introspection-2795252) as individuals.

This might all sound obvious in hindsight. So, why doesn’t every team invest in it? In truth, many developers have never experienced what great DevEx feels like. They don’t know it can be better, or they’ve accepted the friction as normal. But once you’ve worked in an environment where someone has sweated the details - where every part of the workflow feels seamless - you can’t unsee it. You start to expect it. And that expectation changes everything.

# What’s next?

Every team deserves a developer experience that brings out their best work. Start by imagining what “great” looks like for your codebase - your north star. Then chart a course. Build a roadmap. Rally others. The path from chaos to clarity is paved with small, deliberate steps.

Take 10 minutes today to write down your team’s DevEx wishlist. Start a conversation with the team: What’s slowing us down? Pick one thing from the DevEx stack and implement it this week.

Change starts with **you**.

_In the next blog, we’ll dive into_ [**_how AI coding assistants can help amplify your impact_**](https://medium.com/@javatarz/level-up-code-quality-with-an-ai-assistant-a7b1fa3f9886) _- accelerating code quality, catching issues early, and automating the boring stuff - so you can focus on what really matters: building things that matter._

# Credits

_Thanks to_ [_Vinayak Kadam_](https://www.linkedin.com/in/vinayakkadam03/) _for providing feedback and_ [_Priyadarshan Patil_](https://www.linkedin.com/in/priyadarshanpatil/) _for requesting me to write about this, after my passionate filled monologue in a conversation about Developer Experience._