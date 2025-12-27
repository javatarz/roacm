# Context Documentation

Context files for Claude Code when working on this blog. These are **not** user-facing - the entire `docs/` directory is excluded from the Jekyll build.

## Quick Reference

### Writing Blog Posts

| File                                         | When to Use                                       |
| -------------------------------------------- | ------------------------------------------------- |
| [CONTENT.md](context/CONTENT.md)             | Editorial guidelines - audience, voice, structure |
| [STYLE.md](context/STYLE.md)                 | Writing patterns - tone, formatting, examples     |
| [CATEGORIES.md](context/CATEGORIES.md)       | Choose 1 category (definitions, scopes)           |
| [TAGS.md](context/TAGS.md)                   | Choose 2-4 tags from canonical list               |
| [CROSS-POSTING.md](context/CROSS-POSTING.md) | Enable dev.to cross-posting                       |

### Website Development

| File                                     | When to Use                                |
| ---------------------------------------- | ------------------------------------------ |
| [DEVELOPMENT.md](context/DEVELOPMENT.md) | Commands, file structure, architecture     |
| [TESTING.md](context/TESTING.md)         | Test requirements, running tests           |
| [HOMEPAGE.md](context/HOMEPAGE.md)       | Homepage curation - pills, featured, grid  |
| [BRANDING.md](context/BRANDING.md)       | Visual identity - colors, logo, typography |

### Analytics & Distribution

| File                                         | When to Use                              |
| -------------------------------------------- | ---------------------------------------- |
| [ANALYTICS.md](context/ANALYTICS.md)         | Umami setup, event tracking              |
| [SHARING.md](context/SHARING.md)             | UTM parameters for social sharing        |
| [CROSS-POSTING.md](context/CROSS-POSTING.md) | dev.to automation, Medium manual process |

## Task-Based Guide

**"I'm writing a new blog post"**
→ Read CONTENT.md, STYLE.md, then CATEGORIES.md + TAGS.md for metadata

**"I'm editing the homepage"**
→ Read HOMEPAGE.md, then BRANDING.md for visual consistency

**"I'm modifying theme/layouts"**
→ Read DEVELOPMENT.md first, TESTING.md before making changes

**"I'm setting up cross-posting"**
→ Read CROSS-POSTING.md for dev.to automation

**"I'm sharing a post on social media"**
→ Read SHARING.md for UTM tracking parameters

**"I'm adding analytics tracking"**
→ Read ANALYTICS.md for Umami event patterns

## All Context Files

| File                                         | Purpose                                     |
| -------------------------------------------- | ------------------------------------------- |
| [ANALYTICS.md](context/ANALYTICS.md)         | Umami analytics - events, tracking patterns |
| [BRANDING.md](context/BRANDING.md)           | Visual identity - logo, colors, typography  |
| [CATEGORIES.md](context/CATEGORIES.md)       | Category taxonomy with definitions          |
| [CONTENT.md](context/CONTENT.md)             | Editorial guidelines - audience, voice      |
| [CROSS-POSTING.md](context/CROSS-POSTING.md) | dev.to automation, Medium manual workflow   |
| [DEVELOPMENT.md](context/DEVELOPMENT.md)     | Dev commands, architecture, file structure  |
| [HOMEPAGE.md](context/HOMEPAGE.md)           | Homepage curation rules                     |
| [SHARING.md](context/SHARING.md)             | UTM tracking for social sharing             |
| [STYLE.md](context/STYLE.md)                 | Writing style patterns                      |
| [TAGS.md](context/TAGS.md)                   | Canonical tag list by topic                 |
| [TESTING.md](context/TESTING.md)             | Test requirements and workflows             |

## Maintenance

Update these docs when:

- Adding new context files (update this README)
- Category/tag definitions change
- Development workflows evolve
- New integrations are added
