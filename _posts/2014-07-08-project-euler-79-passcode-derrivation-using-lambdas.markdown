---
author: Karun Japhet
comments: true
date: 2014-07-08 12:51:00+00:00
layout: post
slug: project-euler-79-passcode-derrivation-using-lambdas
title: 'Project Euler #79: Passcode Derrivation (using Lambdas)'
wordpress_id: 566
categories:
- Development
- Tutorials
tags:
- code sample
- Functional Programming
- java
- Java 8
- Lambda
- Project Euler
---

I've been solving Project Euler for years and I avoid posting solutions online as far as possible but this problem is old enough that it shouldn't be a problem. Plus, the problem statement interests me enough to write a functional solution using the new Java 8 Lambdas that I've been experimenting over the past few months.

Before I begin, I'd like to acknowledge [Alex Michael](http://alexmic.net/) for providing the base solution with a pretty nice explanation of how to crack the problem. You should read through [his post](http://alexmic.net/password-derivation-project-euler/) before you continue.

My solution provides a Java port of this solution using Lambdas. Here are the steps to the solution

<!-- more -->

# Solution Process

  1. Read file to a List of Strings viz. 'passcodes'
  2. Process each 'passcode' in 'passcodes' using a 'passcodeConsumer'
    1. separate digits of the passcode and add them to a 'digitUniverse' set which contains all digits that the solution has
    2. separate digits of the passcode and 'update connections'
    3. merge connections created for this passcode with past ones
  3. iterate through every key in the master connection relationship graph considering them as the parent before doing a BFS to find the possible solutions using recursion

# Solution Walkthrough

## Reading the passcodes

We've added [keylog.txt](https://projecteuler.net/project/keylog.txt) into the project's build path so we can read it. Thanks to the magic of Java 7's NIO Files API, it's a one line job to read files now.

{% highlight java %}
    final List<String> passcodes = Files.readAllLines(Paths.get("./keylog.txt"));
{% endhighlight %}

This can optionally be replaced with the following lines for testing the solution. The explanation further will hinge on these values

{% highlight java %}
    final List<String> passcodes = Arrays.asList(new String[] { "123", "125", "536" });
{% endhighlight %}

## Processing passcodes

This processing requires someone to first iterate through the passcodes, find all digits in the passcode to maintain a unique set of digits required for the overall solution (called the 'digit universe') and calculate 'connections' between digits (order of appearance of digits in the solution)

{% highlight java %}
    final Consumer passcodeConsumer = passcode -> {
    	digitSeparator.apply(passcode).forEach(addToDigitUniverse);
    	digitSeparator.apply(passcode).forEach(updateConnections);

    	connections.entrySet().forEach(connectionMerge);
    	connections.clear();
    };
{% endhighlight %}

Each of the lambdas and data structures used here are described below


### Digit Separator

{% highlight java %}
    final Function<String, IntStream> digitSeparator = str -> str.chars().map(c -> Integer.valueOf(String.valueOf((char) c)));
{% endhighlight %}

This function simply iterates through the characters of the string and converts them into integers. As you see, this function will be required multiple times later


### Maintaining a Digit Universe

{% highlight java %}
    final Set<Integer> digitUniverse = new HashSet<>();
    final IntConsumer addToDigitUniverse = i -> digitUniverse.add(i);
{% endhighlight %}

This is a straight forward function to update the data structure for the digit universe. The chosen data structure is a [Java Set](http://docs.oracle.com/javase/7/docs/api/java/util/Set.html) to ensure values are unique. Since the order of appearance isn't important to us and the [HashSet](http://docs.oracle.com/javase/7/docs/api/java/util/HashSet.html) implementation's performance is good enough for our requirement, we can use it.


### Updating Connections

{% highlight java %}
    final Map<Integer, Set<Integer>> connections = new HashMap<>();

    final IntConsumer updateConnections = digit -> {
    	connections.forEach((key, values) -> values.add(digit));

    	final Set<Integer> set = connections.get(digit);
    	if (set == null) {
    		connections.put(digit, new HashSet<>());
    	}
    };
{% endhighlight %}

The connections data structure maintains relationships between digits defining the order which digits occur. For a number 541, the relationship would suggest digits 4 and 1 come after 5 and that the digit 1 comes after 4. When the number 541 is processed, the connections map will contain the following content (assuming it was empty earlier)


>5 -> [1, 4]
>
>4 -> [1]
>
>1 -> []


The order of appearance inside the Set doesn't matter. The result here contains 1 before 4 only because the [Set](http://docs.oracle.com/javase/7/docs/api/java/util/Set.html) implementation used was a [HashSet](http://docs.oracle.com/javase/7/docs/api/java/util/HashSet.html) which naturally sorts data (meaning numbers get arranged in ascending order).

It is important to note that the data structure 'connections' is _temporary_ and only contains state for the current passcode being processed. This means that the solution cannot be parallelized as long as this state is being maintained. Then again, our solution can't be parallelized because [Java Maps](http://docs.oracle.com/javase/7/docs/api/java/util/Map.html) can't be streamed. Maybe I'll update this solution to make it parallel eventually.

The 'connections' state is processed to update the master data set of connections by using a custom merge logic.


### Connection merging

{% highlight java %}
    final Consumer<Map.Entry<Integer, Set>> connectionMerge = entry -> {
    	final Integer key = entry.getKey();
    	final Set<Integer> contenderValues = entry.getValue();
    	Set<Integer> targetValues = masterConnections.get(key);

    	if (targetValues == null) {
    		targetValues = new HashSet<>();
    		masterConnections.put(key, targetValues);
    	}

    	targetValues.addAll(contenderValues);
    };
{% endhighlight %}

The connection merge is applied on an entry of the connection data structure. the key and contenderValues are variables that hold information about an entry in the connections map. If the passcode being processed was 541, each of rows mentioned above as being in the connection map (such as "5 -> [1, 4]") will be an entry this consumer will consume.

The targetValues are a [Set](http://docs.oracle.com/javase/7/docs/api/java/util/Set.html) that contains any data that the masterConnections already has for the same key. If the targetValues [Set](http://docs.oracle.com/javase/7/docs/api/java/util/Set.html) is null then the digit in the key is being encountered for the first time and so the map will be updated with an empty [HashSet](http://docs.oracle.com/javase/7/docs/api/java/util/HashSet.html). Irrespective of whether targetValues existed or not, the next step is to add all the contenderValues into the targetValues [Set](http://docs.oracle.com/javase/7/docs/api/java/util/Set.html). The underlying masterConnections data structure is kept up to date because the maps are backed (the same object reference is used internally to ensure data is kept up to date).

Once the merge is complete the passcodeConsumer has to ensure that the consumer is cleared so it's ready for the processing of the next passcode


## Finding longest solutions

{% highlight java %}
    masterConnections.forEach((k, v) -> {
    	final String possibleSolution = findPossibleSolution(new LinkedHashSet<>(), k);
    	if (possibleSolution.length() > 0) {
    		System.out.println("Possible Solution: " + possibleSolution + " (Vertex: " + k + ")");
    	}
    });
{% endhighlight %}

This step iterates through every entry in the masterConnection map considering that its a master and finds the longest solution for each vertex in the graph. If the possibleSolution length is 0, there was no solution that used all digits in the digitUniverse.

{% highlight java %}
    private static final String findPossibleSolution(final Set<Integer> parentNodes, final Integer currentNode) {
    	final Set<Integer> childNodes = masterConnections.get(currentNode);
    	parentNodes.add(currentNode);

    	if (childNodes.isEmpty()) {
    		final String candidate = parentNodes.stream().map(i -> i.toString()).collect(Collectors.joining());
    		final boolean valid = digitUniverse.stream().allMatch(i -> candidate.contains(String.valueOf(i)));
    		return valid ? candidate : "";
    	}

    	return childNodes.stream().map(node -> findPossibleSolution(new LinkedHashSet<>(parentNodes), node)).reduce("", (a, b) -> (a.length() <= b.length() ? a : b));
    }
{% endhighlight %}

The findPossibleSolution method recursively digs through the child nodes of the currentNode to find child nodes.

When a leaf node is found, the parent nodes are used to trace out the path traversed along the map which represents a candidate solution. The [Set](http://docs.oracle.com/javase/7/docs/api/java/util/Set.html) implementation used was a [LinkedHashSet](http://docs.oracle.com/javase/7/docs/api/java/util/LinkedHashSet.html) to ensure the order of the path traced to the child node is maintained. Validity of each candidate solution is tested to confirm if every one of the digits of the digitUniverse are included in the candidate. If so, the candidate is returned or an empty string is returned.

When the current node is not a leaf node, all child nodes are iterated through and the findPossibleMethod is recursively invoked to generate a solution. The solutions are then reduced to ensure a solution of the least length is returned. If two solutions have the same length, the one which was found first is returned (the choice is arbitrary at that point since the question asks for any valid solution of minimum length is found).


## Bringing it all together


All you now need is a main function to do your bidding

{% highlight java %}
    public static void main(String[] args) throws IOException {
    	final List<String> passcodes = Files.readAllLines(Paths.get("./keylog.txt"));

    	passcodes.forEach(passcodeConsumer);

    	masterConnections.forEach((k, v) -> {
    		final String possibleSolution = findPossibleSolution(new LinkedHashSet<>(), k);
    		if (possibleSolution.length() > 0) {
    			System.out.println("Possible Solution: " + possibleSolution + " (Vertex: " + k + ")");
    		}
    	});
    }
{% endhighlight %}

## Update

Alex's original solution assumes that digits will not be repeated. This is an assumption that is validated by the input data set for the problem. But in real life, this does not hold true. If your input is **123** and **325** the only solution you can have is 12325 since the two inputs clearly show that the digit 2 appears before and after 3 (unless the digit 3 is also repeated; which though would be a valid solution, it wouldn't be an optimal one since the problem requires the shortest answer). This solution cannot be fetched as long as data is stored in [Set](http://docs.oracle.com/javase/7/docs/api/java/util/Set.html)s because they wade out repetitions. The implementation can be migrated to use [List](http://docs.oracle.com/javase/7/docs/api/java/util/List.html)s instead. The other change required would be the master connections data structure should now possess the ability to track which node connections have been traversed in the recursion. To ensure there is no inappropriate data sharing in the recursion, each recursive call is isolated by performing deep copy on the parent list (and master connections data structures).

include_code lang:java project-euler-79-passcode-derrivation-using-lambdas/PasscodeGenerator.java

The path class simply defines a structure to track nodes and whether they have been traversed yet.

include_code lang:java project-euler-79-passcode-derrivation-using-lambdas/Path.java
