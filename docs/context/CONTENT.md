# Content Guidelines

Editorial guidance for ROACM (Ramblings of a Coder's Mind) blog.

## Target Audience

The blog serves a varied audience across the tech spectrum:

- **Developers** - Technical how-tos, code patterns, tooling
- **Engineering Managers** - Team practices, process, culture
- **Tech Enthusiasts** - Hardware tinkering, device hacks, reviews
- **Engineering Leadership** - Architecture decisions, platform strategy

Content varies because writing spans multiple decades. This diversity is intentional.

## Content Philosophy

### Legacy Content

- Historical posts are valued and retained
- The blog's history reflects the author's growth
- Don't delete or hide old content - it's worth preserving
- Old posts may have outdated information - that's acceptable

### Current Focus

- **intelligent Engineering** is the current priority topic
- Focus on what's relevant in the market now
- New content should provide lasting value where possible

## Voice & Tone

- Technical but accessible
- Practical and example-driven
- Opinionated when warranted
- Personal perspective welcome (it's "Ramblings of a Coder's Mind")

## Post Structure

### Required Front Matter

```yaml
---
layout: post
comments: true
author: Karun Japhet
title: 'Post Title Here'
description: 'SEO description - 150-160 chars, compelling summary'
category: Category Name
tags:
  - tag-one
  - tag-two
---
```

### Guidelines

- **Title**: Clear, descriptive, searchable
- **Description**: SEO-focused, 150-160 characters, no truncation
- **Category**: Single category from `CATEGORIES.md`
- **Tags**: 2-4 canonical tags from `TAGS.md`

### Optional Front Matter

```yaml
evergreen: true # For timeless content that stays relevant
```

## Reviewing Content

When reviewing a post draft, check:

1. **Category fit** - Does it match the category definition in `CATEGORIES.md`?
2. **Tag accuracy** - Are tags canonical and relevant?
3. **Description quality** - SEO-friendly, compelling, correct length?
4. **Technical accuracy** - Is the content correct?
5. **Writing quality** - Clear, concise, well-structured?
6. **Accessibility** - Alt text for images, heading hierarchy?

## Writing Style

The `/review-writing` skill can analyze drafts against the author's personal style for:

- Tone consistency
- Clarity
- Authenticity

Use this for significant posts before publishing.

## Categories at a Glance

| Category                | Focus                               |
| ----------------------- | ----------------------------------- |
| intelligent Engineering | Building with AI - current priority |
| Software Design         | Code architecture, patterns         |
| Platform Engineering    | Infrastructure, CI/CD, cloud        |
| Developer Experience    | Local workflow, tooling             |
| Device Hacks            | Hardware tinkering                  |
| Tech Reviews            | Product evaluations                 |
| Projects                | Released tools/utilities            |
| Personal                | Life updates, reflections           |

See `CATEGORIES.md` for detailed definitions and distinctions.
