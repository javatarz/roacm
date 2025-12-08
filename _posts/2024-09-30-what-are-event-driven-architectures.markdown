---
layout: post
comments: true
author: Karun Japhet
title: What are event driven architectures?
category: Software Design
tags:
  - data-engineering
  - event-driven
  - architecture
---

_A couple of years ago, I was part of group of individuals working on defining different Event Driven architectures during a weekend summit. A summary of the summit was already published by Martin Fowler as first as [a blog](https://martinfowler.com/articles/201701-event-driven.html) and later as [a talk](https://www.youtube.com/watch?v=STKCRSUsyP0), the blog takes a slightly different view than the explanation I needed and thus this post was created. This is a recreation of the contents in the talk. If you have watched it, you can skip reading this summary._

## What is event driven?

This technique is a popular technique to avoid coupling in systems. These systems tend to eventually become good
sources of data that the business would like to build data platforms, insights and models on.

This page exists to

1. Help understand the different patterns at a high level
2. Understand the implications on building data systems

### Events vs Commands

An event is when a system wants to announce what has happened but not what is to be done. For example, a new insurance
quote being generated is an event. It announces to the world that a quote has been generated but not what should
happen as a result.

A command is when a system wants something to be done and is asking a system to do it. For example, an upstream system
might ask the communications system to send an email with specific details and this is a command to the communications
system.

Both of these are usually implemented as events on a queue. The primary differences are how they are named and what
the intent is.

## Different types of event driven patterns

Let's start with an example to help visualise the problem in which the customer changes an address for their house
insurance in an insurance provider's system which leads to a new quote being generated. This quote needs to be sent
back to the user via an email.

![Sample flow]({{ site.url }}/assets/images/uploads/eda-sample-flow.png)

If the services are built as visualised with calls across services being made, the services will be tightly coupled in
their flow (since customer management needs to know of the existence of the quoting system which in-turn needs to know
about the existence and need for communication). Here is how that problem can be solved with event driven architectures.

### Event notification pattern

In this pattern, a source system will send a "notification" to all other systems that something has happened. The
consumer needs to setup an event listener and figure out how to react to it. An example of this can be seen by the
customer management system generating

![Event notification]({{ site.url }}/assets/images/uploads/eda-event-notification.png)

Since the events do not have any information about what has changed, the downstream systems still need to call the
upstream system to understand the details of what has changed to take action on the changes.

Here are a couple of versions of the customer changed event. The first version is one where the customer address
changed event could include only the ID of the customer who's address has changed. For every other part of the
information (including what's changed), the downstream systems need to contact the customer mamangement service.

![Event notification - fetch info]({{ site.url }}/assets/images/uploads/eda-event-notification-fetch-info.png)

Of course, these additional questions could be included in the event notification because they are related to the core
event itself. There will always be some fields that a downstream system might need that are not directly part of the
event but are required by the downstream system.

![Event notification - fetch all related info]({{ site.url }}/assets/images/uploads/eda-event-notification-fetch-more-info.png)

#### Advantages of using Event Notification

Systems built are decoupled. When there's other actions that need to be made based on an address being changed, it's
easy to add another system to take action on this event without changes being required on the customer management side.

![Event notification - decoupling]({{ site.url }}/assets/images/uploads/eda-event-notification-decoupled-scaling.png)

#### Downsides of using Event Notification

Systems built will be devoid of any behavior and there is no easy way to trace what happens downstream. There is no
easy way to trace all the changes that happen in the code (by looking at the source code) to understand the list of
changes that happen when the user changes their address.

[Distributed tracing systems](https://opentelemetry.io/docs/migration/opentracing/) like [zipkin](https://zipkin.io/)
aim to address these challenges by allowing visualisation of flows on environments with a full setup. Code can be traced
by using [mono-repos](https://monorepo.tools/) with the event names being the same across services. These are techniques
to deal with the inability to trace code/flows across systems and while neither of them are as effective as tracing
usages of your code, they help drive a balance between decoupling and ease of use.

Even when all the related information to the event have been added into the event payload, there will still be a need
for downstream systems to require information. This means additional API calls will have to be made to the upstream system.
As more downstream systems subscribe to a particular event, the upstream system will be under higher load to provide
access to information and the downstream system's availability is depedent on the upstream system.

### Event carried state transfer pattern

Event carried state transfer (or ECST, for short) is sends all information related to the domain object in the event to avoid
[Event Notification](#event-notification-pattern)'s need for call backs for additional information.

![Event notification - ECST]({{ site.url }}/assets/images/uploads/eda-ecst.png)

Downstream systems need to store the parts of the information they need for their usecase. If a difference between the
old and new data is required, the data-structures chosen should make calculating differences easier.

#### Advantages of using ECST

Systems using this pattern have a lower dependence on their upstream services and thus have higher availability.

#### Downsides of using ECST

The higher availability comes at the cost of making the system [eventually consistent](https://en.wikipedia.org/wiki/Eventual_consistency).
The data will also have higher replication.

### Event sourcing

An event sourced system is one where the events are stored on an event store/event log and where the current application
state can be completely recreated based on the event store.

![Event notification - Event sourcing]({{ site.url }}/assets/images/uploads/eda-event-sourcing.png)

The event store is an append only log of events that have occurred and, in the example, the customer DB is an example
of a snapshot. A snapshot is required for enhancing the performance of your store (since it stores the current state
of your system for quick access).

Both source control systems (like git, svn etc.) and financial accounting ledgers are good examples of event sourcing.

#### Advantages of using Event Sourcing

This system makes audit, debuggability and replayability simple.
Such systems are great to recreate issues and understand what order things happened in.
The ability to timetravel with data on a production system is quite useful.
Concepts like branching is possible with data and what-ifs are easy to simulate to figure out the difference.
Differences can then be applied through the creation of [compensating actions](https://blog.jonathanoliver.com/sagas-event-sourcing-and-failed-commands/).

#### Downsides of using Event Sourcing

This system will make [event versioning](https://docs.axoniq.io/reference-guide/axon-framework/events/event-versioning) mandatory.
Interacting with external systems becomes more complicated since these calls are side-effects and event sourced systems
should not cause this side-effect again when events are being replayed.

### Command Query Responsibility Segregation pattern

[Command Query Responsibility Segregation](https://martinfowler.com/bliki/CQRS.html) (or CQRS, for short) is a model in
which reads and writes are separated. This allows scaling and optimisation reads and writes separately as per requirements.

#### Advantages of using CQRS

This pattern is rarely necessary but extremely useful to allow write heavy vs read heavy transactions to be scaled separately.
The read side(s) can be optimised for the usecases they are being used for.

#### Downsides of using CQRS

Adds significant complexity building and maintaining a system.

## Reading material

1. [What is event driven?](https://martinfowler.com/articles/201701-event-driven.html)
2. [The many meanings of Event-Driven Architecture?](https://www.youtube.com/watch?v=STKCRSUsyP0)
3. [Axon framwork](https://www.axoniq.io/products/axon-framework) - Framework for event driven, event sourced,
[CQRS](#command-query-responsibility-segregation-pattern) powered applications in Java
4. [Event Sourcing: A Practical Guide to Actually Getting It Done](https://medium.com/ssense-tech/event-sourcing-a-practical-guide-to-actually-getting-it-done-27d23d81de04)
