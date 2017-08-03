---
author: Karun Japhet
comments: true
date: 2014-06-13 08:01:30+00:00
layout: post
slug: java-8-generic-method-returns-with-lambdas-and-strategy-design-pattern-implementation
title: 'Java 8: Generic Method Returns with Lambdas and Strategy Design Pattern implementation'
wordpress_id: 522
categories:
- Development
- Tutorials
tags:
- code sample
- Design Pattern
- Functional Programming
- Generics
- Java 8
- Lambda
- Strategy Pattern
---

With the introduction of Functional Programming in Java 8 new possibilities have opened up. One use case I recently encountered was that of processing JSONs to return data inside them. Let us, for the sake of argument, say the data in an element could be one of the following:

  * An `Integer` e.g. `1`
  * A `String` e.g. `The quick brown fox jumps over the lazy dog`
  * A `JsonObject` representing a Java Object e.g. `{"payload":[{"lastName\":\"AB","firstName":"Karun","email":"test[at]email.com"}`
  * A `JsonArray` containing `Integer`s e.g. `[1, 2, 3]`
  * A `JsonArray` containing `String`s e.g. `["String 1", "String 2"]`
  * A `JsonArray` containing `JsonObject`s representing Java Objects e.g. `[{"lastName":"AB","firstName":"Karun","email":"test[at]email.com"},{"lastName":"FooBar","firstName":"Kung","email":"kung[at]foobar.com"}]`

If you want such a wide variety of data parsed and handled (_relatively_) safely (i.e. with compile time type safety where possible), here is what you do.

<!-- more -->

### Functional interface for Lambda definition

First you need a `FunctionalInterface` that defines your operation. Here is a sample.

{% highlight java %}
import com.google.gson.JsonElement;

@FunctionalInterface
public interface DataProcessor {
  public <T> T processData(final JsonElement data, final TypeReference<T> typeRef);
}
{% endhighlight %}

This methods defines the task to be performed for parsing data which is a `JsonElement` (I'm using [google-gson](https://code.google.com/p/google-gson/) for my JSON parsing needs).


### Super Type Token management

If your key eyes have picked it up, I have an undefined class here called `TypeReference` which is inspired from [Neal Gafter](https://www.blogger.com/profile/08579466817032124881)'s [old blog post](http://gafter.blogspot.in/2006/12/super-type-tokens.html) but has a extra method to check the super type for generics. I recommend reading through his blog post before proceeding.

Here is my version. The only changes I've made are around the `superType` variable being added. If you apply wish to use `List<String>` as your return type reference, the `type` would be `List` and the `superType` would be `String`. If you use `String` as your return type reference, the `type` will be `String` and the `superType` will be `null`.

{% gist javatarz/fa5598cf32a1c6988ebdebd0e69f38a0 %}

Now we need a simple `User` class which maps to the sample data I provided earlier.

{% gist javatarz/755648033a0c324e40473c7564ebe16a %}

### Defining your data processor

Here's why you just bumped your project up to use Java 8 as a minimum. You can pass functional parameters to methods ensuring the caller decides how their data is to be processed.

{% highlight java %}
    private static <T> T parseData(final DataProcessor<T> processor, final String data, final TypeReference<T> typeRef) {
        final JsonElement payload = new JsonParser().parse(data).getAsJsonObject().get("payload");

        return processor.processData(payload, typeRef);
    }
{% endhighlight %}

This method parses your data as a JSON and takes the payload out (you'll see the complete structure of data in the main function below). The caller also provides you the processor to process his data along with the return type that is expected.


### Sample Lambdas


Time to define some lambdas based on the sample data we talked about earlier

{% highlight java %}
    private static final DataProcessor listProcessor = (data, typeRef) -> {
        final JsonArray payload = data.getAsJsonArray();
        final int resultSize = payload.size();
        final Gson gson = new Gson();
        final List result = new ArrayList<>();

        for (int i = 0; i < resultSize; i++) {
            result.add(gson.fromJson(payload.get(i), typeRef.getSuperType()));
        }

        return result;
    };

    private static final DataProcessor itemProcessor = (data, typeRef) -> {
        return new Gson().fromJson(data, typeRef.getTypeClass());
    };
{% endhighlight %}

If your return type is a single item (not a `List`), you should be using `itemProcessor`. `listProcessor` returns a `List` of items defined as the `superType` of the `typeRef`.


### Using your lambdas


Let us bring it all together and show you how to call your method now

{% highlight java %}
    public static void main(String[] args) {
        final String request1 = "{\"payload\":1}";
        final Integer result1 = parseData(itemProcessor, request1, new TypeReference<Integer>() {
        });
        System.out.println("\nResult 1: " + result1 + " | Data Type: " + result1.getClass());

        final String request2 = "{\"payload\":\"The quick brown fox jumps over the lazy dog\"}";
        final String result2 = parseData(itemProcessor, request2, new TypeReference<String>() {
        });
        System.out.println("\nResult 2: " + result2 + " | Data Type: " + result2.getClass());

        final String request3 = "{\"payload\":{\"lastName\":\"AB\",\"firstName\":\"Karun\",\"email\":\"test[at]email.com\"}}";
        final User result3 = parseData(itemProcessor, request3, new TypeReference() {
        });
        System.out.println("\nResult 3: " + result3 + " | Data Type: " + result3.getClass());

        final String request4 = "{\"payload\":[1,2,3]}";
        final List<Integer> result4 = parseData(listProcessor, request4, new TypeReference<List<Integer>>() {
        });
        System.out.println("\nResult 4: ");
        result4.forEach(i -> System.out.println("  => " + i + " | Data Type: " + i.getClass()));

        final String request5 = "{\"payload\":[\"String 1\", \"String 2\"]}";
        final List<String> result5 = parseData(listProcessor, request5, new TypeReference<List<String>>() {
        });
        System.out.println("\nResult 5: ");
        result5.forEach(str -> System.out.println("  => " + str + " | Data Type: " + str.getClass()));

        final String request6 = "{\"payload\":[{\"lastName\":\"AB\",\"firstName\":\"Karun\",\"email\":\"test[at]email.com\"},{\"lastName\":\"FooBar\",\"firstName\":\"Kung\",\"email\":\"kung[at]foobar.com\"}]}";
        final List<User> result6 = parseData(listProcessor, request6, new TypeReference<List<User>>() { });
        System.out.println("\nResult 6: ");
        result6.forEach(user -> System.out.println(" => " + user + " | Data Type: " + user.getClass()));
    }
{% endhighlight %}

As you can see, `parseData` returns different data types (**that are type safe as long as you provided the correct _processor_ for the correct type of _data_**) that are compile time safe.


### Why use the superType in TypeReference?


At this point you could argue that the `superType` could be skipped because the `listProcessor` only uses `typeRef.getSuperType()` and instead could easily use `typeRef.getTypeClass()` and get away with it. You'd be correct. But it would mean everyone would have to live with my choice of the collection (in this case, an `ArrayList`). Instead you can use `typeRef.newInstance()` to generate new instances of any class with a default constructor (like `ArrayList`, `Vector`, `HashMap` etc.) and operate on it.

This way, you can have a `listProcessor` that can let the caller decide which `List` implementation they want to use. All the more power to [Strategy Pattern](http://en.wikipedia.org/wiki/Strategy_pattern)! Your lambdas now represent individual strategies.


#### Sample Output

{% highlight java %}
    Result 1: 1 | Data Type: class java.lang.Integer

    Result 2: The quick brown fox jumps over the lazy dog | Data Type: class java.lang.String

    Result 3: User{firstName=Karun, lastName=AB, email=test[at]email.com} | Data Type: class com.karunab.test.lambda.User

    Result 4:
      => 1 | Data Type: class java.lang.Integer
      => 2 | Data Type: class java.lang.Integer
      => 3 | Data Type: class java.lang.Integer

    Result 5:
      => String 1 | Data Type: class java.lang.String
      => String 2 | Data Type: class java.lang.String

    Result 6:
      => User{firstName=Karun, lastName=AB, email=test[at]email.com} | Data Type: class com.karunab.test.lambda.User
      => User{firstName=Kung, lastName=FooBar, email=kung[at]foobar.com} | Data Type: class com.karunab.test.lambda.User
{% endhighlight %}
