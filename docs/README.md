# Documentation

This directory contains development documentation and context for working with the ROACM blog.

## Structure

```
docs/
├── README.md           # This file
└── context/            # Context for Claude Code and developers
    ├── TAGS.md         # Canonical tag taxonomy and guidelines
    └── CATEGORIES.md   # Category taxonomy and guidelines
```

## Context Files

### `context/TAGS.md`

Defines the 45 canonical tags used across all blog posts. All posts must use tags from this list. Includes:

- Complete tag taxonomy organized by category
- Guidelines for adding new tags
- Validation script to check compliance
- Categories → Tags mapping

### `context/CATEGORIES.md`

Defines the canonical category list for blog posts. Categories are parent topics that group content. Includes:

- Current active categories
- Legacy categories from older posts
- Guidelines for creating new categories
- Category → Tags mapping

## Claude Code Integration

The `/CLAUDE.md` file in the project root is automatically loaded by Claude Code and references these context files. When working with posts, Claude Code will:

1. Automatically load `/CLAUDE.md` (project-specific instructions)
2. Reference `docs/context/TAGS.md` for tag validation
3. Reference `docs/context/CATEGORIES.md` for category guidelines

## For Developers

When creating or editing blog posts:

1. **Check** `docs/context/TAGS.md` for valid tags
2. **Choose** 1-2 categories (broad topics)
3. **Choose** 2-4 tags (specific topics from canonical list)
4. **Ensure** categories and tags don't overlap (parents vs children)
5. **Validate** using the scripts in TAGS.md or CATEGORIES.md

## Adding New Context

To add new context files:

1. Create file in `docs/context/`
2. Update this README
3. Reference from `/CLAUDE.md` if needed for automatic loading
4. Keep content focused and actionable

## Excluded from Jekyll Build

The entire `docs/` directory is excluded from the Jekyll build (see `_config.yml`), so these files won't appear on the published blog.
