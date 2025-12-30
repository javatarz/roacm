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
| Commas/parens  | For asides; avoid em-dashes (AI tell)         |

## Sentence Patterns

**Short for impact:**

> "AI doesn't make engineering easier. It makes disciplined engineering more valuable."

**Longer for explanation:**

> "If your application is stateful, please generate the test data on startup. This way, you are ready to test what you need the moment your application starts."

**Rhetorical questions (sparingly):**

> "So, why doesn't every team invest in it?"

## Content Patterns

### Principles Format

When presenting principles or guidelines, use clear headings with concrete explanations:

```markdown
#### Shape AI deliberately.

I've seen teams adopt whatever AI tools are trending without asking whether they fit. Six months later, half the codebase assumes a specific assistant's quirks, onboarding docs reference prompts that no longer work, and no one remembers why certain patterns exist. Decide upfront: where does AI help us? Where does it not? What happens when we switch tools?
```

### Practical Examples

Include "What this looks like in practice" sections with personal voice:

```markdown
- I use AI to draft implementations, then spend more time reviewing than I saved generating. The review is where the real work happens.
- When AI suggests an approach, I ask "why?" If I can't explain the choice to a teammate, I don't use it.
- I treat AI output like code from a confident junior developer — often correct, sometimes subtly wrong, occasionally completely off base.
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

## ChatGPT Tells to Avoid

AI-generated content has recognizable patterns. Watch for these:

### Structural Tells

- **Abstract wisdom without specifics**: "Better thinking in produces better thinking out" — sounds profound, says nothing
- **Missing the "I" voice**: Abstract "we" throughout instead of personal experience and opinions
- **Overly parallel/poetic structures**: "Not X. Not Y. Z." for dramatic effect; forced symmetry
- **Triple constructions**: "extend your reach, accelerate your ideas, and surface possibilities" — marketing-speak
- **Blockquote overuse**: Too many quotes for emphasis dilutes their impact

### Language Tells

- **Buzzword soup**: "curiosity, continuous improvement, and lightweight experimentation"
- **Generic thought leadership**: "AI is reshaping how we think while we deliver"
- **Salesy phrases**: "That's the real craft of...", "Become harder to compete with over time"
- **Passive corporate constructions**: "Intentional adoption prevents accidental dependencies being created"
- **Redundancy dressed as emphasis**: "hallucinated APIs that do not exist"
- **Em-dash overuse**: Most humans don't write with em-dashes; prefer commas, periods, or parentheses

### Content Tells

- **No friction or uncertainty**: Reads like settled truth from on high
- **No personal anecdotes**: Principles without stories of when they applied (or failed)
- **Aspirational framing**: "The engineers I admire most..." instead of "The engineers I've seen do this well..."

## What Makes Writing Authentic

- **Personal anecdotes**: Specific experiences — what worked, what didn't, what surprised you
- **"I" for opinions, "we" to include the reader**: "I've found..." not "One might find..."
- **Concrete failure modes**: "Prototypes that demo well but collapse under real load"
- **Specific comparisons**: Show bad vs good ("Write a function to parse dates" vs "Parse ISO 8601 dates, handle timezone offsets, return None for invalid input")
- **Acknowledge uncertainty**: "These principles aren't final. I expect to revise them..."
- **Name tools and techniques**: Don't be generic when you have specific recommendations

## Review Checklist

When reviewing a draft:

1. Does the opening hook grab attention?
2. Is the structure clear with good headings?
3. Are paragraphs short and scannable?
4. Is there a clear takeaway or call to action?
5. Does the tone feel confident but approachable?
6. Are technical terms explained or linked?
7. Would this feel at home alongside the iE posts?
8. **ChatGPT check**: Any abstract wisdom, buzzword soup, or missing "I" voice?
9. **Authenticity check**: Are there personal anecdotes and concrete examples?
10. **Concision check**: Can any sentence be tightened? Any redundancy?

## Reference Posts

These posts exemplify the target style:

- "intelligent Engineering: Principles for Building With AI" (2025-11)
- "What makes Developer Experience World-Class?" (2025-06)
- "What are event driven architectures?" (2024-09)
