---
layout: post
comments: true
author: Karun Japhet
title: "Lombok usage in large enterprises"
categories:
  - Development
tags:
  - Java
  - Lombok
  - Enterprise
  - Code Cleanliness
---

## Verbosity of Java

Java is a verbose language. No one disputes it.

Despite the clunky nature of the language syntax, it still is the language of choice in most enterprises. If you work in the services industry or are a technology consultant, chances are that you have to work with Java on a regular basis.

If you're also a fan of functional programming language and have worked any *modern* programming language, you'll recognize that Java's syntax hinders your productivity because of the large amounts of boilerplate the language will generate. While newer JVM based lanaguages like [Kotlin](https://kotlinlang.org/docs/reference/data-classes.html) solve these problems in different ways, the open source community created [Project Lombok](https://projectlombok.org/features/all) to provide similar syntactic sugar in the world's most popular enterprise programming language.

<!-- more -->

## What is Lombok?

Lombok is a Java dependency that uses Java annotations to generate byte code straight into the class files during the compilation phase there by allowing the [boilerplate code](https://en.wikipedia.org/wiki/Boilerplate_code) from your codebase to be significantly reduced.

An example from the [Software Engineering Trends post from Jan 2010](http://jnb.ociweb.com/jnb/jnbJan2010.html#data) shows

{% highlight java %}
@Data(staticConstructor="of")
public class Company {
  private final Person founder;
  private String name;
  private List<Person> employees;
}
{% endhighlight %}

would generate the same code as

{% highlight java %}
public class Company {
  private final Person founder;
  private String name;
  private List<Person> employees;

  private Company(final Person founder) {
    this.founder = founder;
  }

  public static Company of(final Person founder) {
    return new Company(founder);
  }

  public Person getFounder() {
    return founder;
  }

  public String getName() {
    return name;
  }

  public void setName(final String name) {
    this.name = name;
  }

  public List<Person> getEmployees() {
    return employees;
  }

  public void setEmployees(final List<Person> employees) {
    this.employees = employees;
  }

  @java.lang.Override
  public boolean equals(final java.lang.Object o) {
    if (o == this) return true;
    if (o == null) return false;
    if (o.getClass() != this.getClass()) return false;
    final Company other = (Company)o;
    if (this.founder == null ? other.founder != null : !this.founder.equals(other.founder)) return false;
    if (this.name == null ? other.name != null : !this.name.equals(other.name)) return false;
    if (this.employees == null ? other.employees != null : !this.employees.equals(other.employees)) return false;
    return true;
  }

  @java.lang.Override
  public int hashCode() {
    final int PRIME = 31;
    int result = 1;
    result = result * PRIME + (this.founder == null ? 0 : this.founder.hashCode());
    result = result * PRIME + (this.name == null ? 0 : this.name.hashCode());
    result = result * PRIME + (this.employees == null ? 0 : this.employees.hashCode());
    return result;
  }

  @java.lang.Override
  public java.lang.String toString() {
      return "Company(founder=" + founder + ", name=" + name + ", employees=" + employees + ")";
  }
}
{% endhighlight %}

### The good

You shouldn't have to write code that can be generated automatically. Of course, [modern IDEs will do this for you with a few clicks of the keyboard](https://www.jetbrains.com/help/idea/generating-getters-and-setters.html)

We're trying to optimize more than a few clicks though. Have a look at the equals method below:

{% highlight java %}
  @java.lang.Override
  public boolean equals(final java.lang.Object o) {
    if (o == this) return true;
    if (o == null) return false;
    if (o.getClass() != this.getClass()) return false;
    final Company other = (Company)o;
    if (this.founder == null ? other.founder != null : !this.founder.equals(other.founder)) return false;
    if (this.name == null ? other.name != null : !this.name.equals(other.name)) return false;
    if (this.employees == null ? other.employees != null : !this.employees.equals(other.employees)) return false;
    return true;
  }
{% endhighlight %}

Is this a standard equals method (one where every field in the class is checked for equality)? Did we skip a field? Did we do a non standard check on one of the fields? Unless you go through the method line by line, there is no way to know.

Generating code saves you the hassle of checking. If there is an annotation, you know the what the implementation will be (assuming you know how the framework works). If there's code, chances are that it's a non-standard implementation (or someone made a mistake).

### The bad

If you wish to check the generated code, you need an [IDE that decompiles byte code](https://plugins.jetbrains.com/plugin/7100-java-decompiler-intellij-plugin) or a [tool that does the same](http://jd.benow.ca/).

If something's wonky, debugging the issue might not be straight forward.

### The downright ugly

Modern IDEs like IntelliJ are [built for refactoring](https://www.jetbrains.com/help/idea/refactoring-source-code.html). One of the most common refactoring options is the option to [Change Signature](https://www.jetbrains.com/help/idea/change-signature.html). It's an extremely useful option that allows you to reorder method (or constructor) parameters and the IDE takes care of the appropriate changes throughout the codebase.

The order of the constructor parameters in a lombok-fied class is the order in which the parameters are declared. Changing this order changes the constructor signature.

For a class with different parameter types, this is not a problem. Refactoring the following class
{% highlight java %}
@Data
public class Company {
  private final Person founder;
  private String name;
  private List<Person> employees;
}
{% endhighlight %}

to the following signature
{% highlight java %}
@Data
public class Company {
  private final Person founder;
  private List<Person> employees;
  private String name;
}
{% endhighlight %}

is not a problem. The usage of the constructor will fail to compile and provide feedback.

If you have primitive types in your lombok-fied class, you have a problem. Refactoring the following class
{% highlight java %}
@Data
public class Person {
  private final String employeeId;
  private final String firstName;
  private final String lastName;
}
{% endhighlight %}

to the following signature
{% highlight java %}
@Data
public class Person {
  private final String firstName;
  private final String lastName;
  private final String employeeId;
}
{% endhighlight %}

will provide no feedback. The code will compile and set `employeeId`s to `firstName`s, `firstName`s to `lastName`s and `lastName`s to `employeeId`s. If you don't have tests on the behavior of the `Person` class, you won't notice this issue until it's too late. Hopefully, you don't have [tests for a data container with no behavior](https://blog.karun.me/blog/2016/02/28/commonly-made-mistakes-in-unit-testing/).

## Where is Lombok appropriate?

1. Do you have a project where you have a strict set of contributors?
2. Do your contributors understand Lombok well and how it works?
3. Do your contributors understand how to properly unit test and do they understand the automation test pyramid?
4. Do you have strict code quality control?
5. Is the team willing to invest time and effort into training new team members about Lombok and potential downsides?
6. Do most of your models use [value objects](https://www.martinfowler.com/bliki/ValueObject.html) and avoid primitives?

If your team can answer _yes_ to all of the above, you should use Lombok.

I must admit, most large teams can't answer _yes_ to all of the questions. Have you [considered using Kotlin instead](https://try.kotlinlang.org/)? :)
