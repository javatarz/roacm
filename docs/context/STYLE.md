# Writing Style Guide

Personal style definition plus patterns from recent posts. Use when writing or reviewing content.

## Author's Voice (from /review-writing)

**Tone**: Grounded, modest, technical. Clear and direct—no fluff or corporate jargon. Calm and confident, never boastful. Simple but not simplistic.

**Voice**: Understatement over big claims. Clarity over cleverness. No dramatic, salesy, or self-important language. No hero narratives ("I drive clarity," "I transform engineering"). Specific examples over abstract generalities.

**Phrasing preferences**:

- Shorter over longer
- Concrete over vague
- Technical but accessible, not academic
- Avoid overselling adjectives ("revolutionary," "world-class," "groundbreaking")
- Prefer: "Here's what I'm exploring…", "Here's how I think about…", "A practical approach is…"

**Content focus**: Intelligent engineering, AI-assisted software delivery, architecture, developer experience. Writing should capture thinking + practical value. Honest, thoughtful, useful.

---

## Post Structure

### Opening

Start with a bold, declarative statement that sets context:

> "Software engineering is changing — again."

> "The habits, tools, and practices that set great engineering teams apart."

Avoid weak openings like "In this post, we will discuss..." - get straight to the point.

## Structure

- **Clear hierarchy**: H1 for title, H2 for major sections, H3 for subsections
- **Short paragraphs**: 2-4 sentences typical
- **Bulleted/numbered lists**: For principles, steps, key points
- **Block quotes**: For key takeaways or emphasis
- **`<!-- more -->`**: Place after intro paragraph for excerpt break

### Typical Post Structure

1. Opening hook (1-2 paragraphs)
2. Cover image (optional)
3. Context/problem statement
4. `<!-- more -->` break
5. Main content with clear sections
6. Practical examples ("What this looks like...")
7. Call to action / closing thought
8. Credits (when applicable)

## Tone

- **Confident but not arrogant**: State opinions clearly, acknowledge uncertainty
- **Practical and actionable**: Give readers something to do
- **Inclusive**: Use "we" to include the reader in the journey
- **Direct**: Address the reader ("Start by imagining...", "Take 10 minutes today...")
- **Opinionated**: Don't hedge everything - take positions

## Formatting

| Element        | Usage                                         |
| -------------- | --------------------------------------------- |
| **Bold**       | Key terms, emphasis on important points       |
| _Italics_      | Softer emphasis, book/tool names, asides      |
| `code`         | Commands, file names, technical terms         |
| > Block quotes | Key takeaways, memorable statements           |
| [Links]()      | Inline to external resources, don't over-link |
| — Em dash      | Asides, parenthetical thoughts                |

## Sentence Patterns

**Short for impact:**

> "AI doesn't make engineering easier. It makes disciplined engineering more valuable."

**Longer for explanation:**

> "If your application is stateful, please generate the test data on startup. This way, you are ready to test what you need the moment your application starts."

**Rhetorical questions (sparingly):**

> "So, why doesn't every team invest in it?"

## Content Patterns

### Principles Format

When presenting principles or guidelines, use clear headings with brief explanations:

```markdown
#### AI augments, humans stay accountable.

AI can extend your reach... but it cannot own the outcome.
```

### Practical Examples

Include "What this looks like in practice" sections:

```markdown
- We use AI to explore ideas, but we validate assumptions ourselves.
- We generate code fast, then review it twice as hard.
```

### Calls to Action

End with specific, actionable next steps:

> "Take 10 minutes today to write down your team's DevEx wishlist."

### Credits

Acknowledge contributors at the end:

> "_Thanks to [Name](link) for providing feedback..._"

## Technical Level

- Assume a technical reader (developer, EM, or technical leader)
- Don't over-explain fundamentals
- Link to external resources for deep dives
- Include code examples when they clarify

## Things to Avoid

- Weak hedging ("I think maybe...", "It could be argued...")
- Wall-of-text paragraphs
- Over-linking (every other word is a link)
- Starting with "In this post..."
- Passive voice when active is clearer
- Jargon without context for the audience

## Review Checklist

When reviewing a draft:

1. Does the opening hook grab attention?
2. Is the structure clear with good headings?
3. Are paragraphs short and scannable?
4. Is there a clear takeaway or call to action?
5. Does the tone feel confident but approachable?
6. Are technical terms explained or linked?
7. Would this feel at home alongside the iE posts?

## Reference Posts

These posts exemplify the target style:

- "intelligent Engineering: Principles for Building With AI" (2025-11)
- "What makes Developer Experience World-Class?" (2025-06)
- "What are event driven architectures?" (2024-09)
