# Sharing Posts with UTM Tracking

When sharing blog posts, append UTM parameters to track engagement in Umami.

## UTM Parameters

| Parameter      | Question it Answers        | Required |
| -------------- | -------------------------- | -------- |
| `utm_source`   | Where did they come from?  | Yes      |
| `utm_medium`   | What type of channel?      | Yes      |
| `utm_campaign` | Which specific initiative? | Optional |

## Why Medium Exists (1-to-many relationship)

Medium distinguishes different channel types for the same source:

| Source     | Medium    | Meaning                      |
| ---------- | --------- | ---------------------------- |
| `linkedin` | `social`  | Organic post you shared      |
| `linkedin` | `paid`    | LinkedIn ad (paid promotion) |
| `google`   | `organic` | Search result click          |
| `google`   | `paid`    | Google Ad click              |

For a personal blog without paid ads, source and medium are mostly 1:1. But keeping medium is standard practice and allows future flexibility.

## Allowed Values

### utm_source

| Value        | Use when                      |
| ------------ | ----------------------------- |
| `linkedin`   | LinkedIn posts/comments       |
| `twitter`    | Twitter/X                     |
| `bluesky`    | Bluesky                       |
| `reddit`     | Reddit posts/comments         |
| `hackernews` | Hacker News                   |
| `newsletter` | Your email newsletter         |
| `conference` | Conference/meetup talk slides |

### utm_medium

| Value    | Meaning                          |
| -------- | -------------------------------- |
| `social` | Social media platforms (organic) |
| `email`  | Email/newsletter                 |
| `talk`   | Conference/meetup presentations  |
| `paid`   | Paid promotion (future use)      |

### utm_campaign (optional)

Use to track specific initiatives:

| Value                   | Use when                    |
| ----------------------- | --------------------------- |
| `pycon-india-2025`      | Specific conference name    |
| `series-ai-engineering` | Multi-post series promotion |
| `launch`                | New post launch push        |

## Templates

### LinkedIn

```
https://karun.me/blog/YYYY/MM/DD/post-slug/?utm_source=linkedin&utm_medium=social
```

### Twitter/X

```
https://karun.me/blog/YYYY/MM/DD/post-slug/?utm_source=twitter&utm_medium=social
```

### Bluesky

```
https://karun.me/blog/YYYY/MM/DD/post-slug/?utm_source=bluesky&utm_medium=social
```

### Reddit

```
https://karun.me/blog/YYYY/MM/DD/post-slug/?utm_source=reddit&utm_medium=social
```

### Newsletter

```
https://karun.me/blog/YYYY/MM/DD/post-slug/?utm_source=newsletter&utm_medium=email
```

### Conference Talk

```
https://karun.me/blog/YYYY/MM/DD/post-slug/?utm_source=conference&utm_medium=talk&utm_campaign=pycon-india-2025
```

## Example Analysis

With this schema you can answer:

| Question                              | How to filter                                           |
| ------------------------------------- | ------------------------------------------------------- |
| Which platform drives most traffic?   | Group by `utm_source`                                   |
| Social vs email - which works better? | Group by `utm_medium`                                   |
| How much traffic from conferences?    | Filter `utm_source=conference`                          |
| Which conference performed best?      | Filter `utm_source=conference`, group by `utm_campaign` |

## Viewing Results

1. Go to [Umami dashboard](https://umami-javatarz.vercel.app)
2. Select karun.me website
3. Check **Query parameters** section
4. Filter/group by `utm_source`, `utm_medium`, or `utm_campaign`

## Tips

- Keep values lowercase and hyphenated
- Use consistent naming across shares
- Conference talks: always include `utm_campaign` with the conference name
