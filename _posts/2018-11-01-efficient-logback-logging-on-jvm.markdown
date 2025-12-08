---
layout: post
comments: true
author: Karun Japhet
title: "Efficient logback logging on JVM"
category: Software Design
tags:
  - logging
  - jvm
  - performance
  - scala
---

Efficient logging that doesn't bring your application down is simple to setup but is often overlooked. Here are some quick tips on how to achieve exactly that
{{ site.excerpt_separator }}

## Async Logging

Most applications these days should have a single (console) appender. This can be linked up with your log aggregator of choice. If your application cannot aggregate logs off the console stream, file is your next best alternative.

Wrap each of your appenders with an async appender and add the async appender to your root logger.

Every call to the logger creates a log event. In synchronous logging, that log event was processed and writes were made to all appender streams before the application continued. Since most stream writes involve I/O, this meant the application would wait for I/O before continuining thereby slowing it down. With async logging, the event gets pushed to a log level specific in memory queue. These events are processed and consumed by the appenders asynchronously. Since the application can continue after a log event has been published to the queue, asynchronous logging works quicker (as long as I/O is the long pole in the tent that is publishing log messages)

Here's a sample configuration:
```xml
<configuration>
  <appender name="FILE" class="ch.qos.logback.core.FileAppender">
    <file>myapp.log</file>
    <encoder>
      <pattern>%logger{35} - %msg%n</pattern>
    </encoder>
  </appender>

  <appender name="ASYNC-FILE" class="ch.qos.logback.classic.AsyncAppender">
    <appender-ref ref="FILE" />
    <queueSize>1024</queueSize>
    <neverBlock>false</neverBlock>
  </appender>

  <root>
    <appender-ref ref="ASYNC-FILE" />
  </root>
</configuration>
```

Every queue has a configurable depth. The depth of the queue is based on how much memory you have and expected ratio in rates of messages coming in through the application and the messages being published through the I/O bottleneck.

If you hit max queue depth on either the `WARN` or `ERROR` queues, further statements for those levels become synchronous.

If you hit more than 80% of the max queue depth on any other level, the system will start dropping log statements (due to `discardingThreshold=20` by default and `neverBlock=true`). Therefore, under high load, you can lose `INFO`, `DEBUG` and `TRACE` log messages. This behaviour is acceptable for most cases except specific critical statements (like audit logs). For such cases, you can add asynchronous appenders that are allowed to block.

The percentage of depth after which messages are dropped is configurable. You can make info/debug logs synchronous at 100% too if needed by changing the `neverBlock=false` (which is the default behaviour).

All of this information is available on [logback’s documentation](https://logback.qos.ch/manual/appenders.html#AsyncAppender).

## Writing log statements

Async logs only work more efficiently because the production of events is synchronous (and hopefully a quick task) and the processing of events (which requires IO) is a slow task.

However if production of log messages takes **long time**, async logging will not make things better. When you’re printing a large amount of data or if the creation of the log message is an expensive operation, use the following kind of log statement

```java
// style 1: java string interpolation; inefficient and hard to read :P
logger.info("Large object value was " + largeObject1 + " and long operation printed " + largeObject2.longOperation())
// style 2: scala string interpolation; inefficient but easy to read
logger.info(s"Large object value was $largeObject1 and long operation printed ${largeObject2.longOperation()}")
// style 3: logback based string interpolation; efficient but inconvenient to read
logger.info("Large object value was {} and long operation printed {}", largeObject1, largeObject2.longOperation())
```

While the scala interpolation (style 2) is the easiest to read, we should only do it when the objects being printed are small (small-ish strings or primitives).

Rule of thumb:

* For quick statements, use style 2.
* For large statements, use style 3 (sacrifices readability for efficiency)
* Never use style 1 :P

## Using LazyLogging as opposed to creating loggers yourself

Use [lazy logging](https://github.com/lightbend/scala-logging). It internally uses loggers that wraps yours code (during compile time) with if checks to not process log statements if the specific log level doesn’t need to be printed ([using macros](https://github.com/lightbend/scala-logging/blob/master/src/main/scala/com/typesafe/scalalogging/LoggerMacro.scala#L44)). Worried about performance due to extra if conditions? You shouldn’t. Modern processors contain black magic called [branch prediction](https://stackoverflow.com/questions/11227809/why-is-it-faster-to-process-a-sorted-array-than-an-unsorted-array) that reduce the effect of statements such as this to be effectively nothing.

IMO, every scala project should use lazy logging. It’s [light on dependencies](https://github.com/lightbend/scala-logging/blob/master/project/Dependencies.scala) and has a nice implementation that makes your logging more efficient [run faster for fractionally slower compilation](https://github.com/lightbend/scala-logging/blob/master/src/main/scala/com/typesafe/scalalogging/LoggerMacro.scala).