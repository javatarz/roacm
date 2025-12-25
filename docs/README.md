# Context Documentation

Context files for Claude Code when working on this blog. These are **not** user-facing - the entire `docs/` directory is excluded from the Jekyll build.

## Files

| File                                           | Purpose                                                       |
| ---------------------------------------------- | ------------------------------------------------------------- |
| [context/CATEGORIES.md](context/CATEGORIES.md) | Category taxonomy with definitions, scopes, and distinctions  |
| [context/TAGS.md](context/TAGS.md)             | Canonical tag list organized by topic area                    |
| [context/CONTENT.md](context/CONTENT.md)       | Editorial guidelines - audience, voice, post structure        |
| [context/STYLE.md](context/STYLE.md)           | Writing style patterns - tone, formatting, sentence structure |
| [context/HOMEPAGE.md](context/HOMEPAGE.md)     | Homepage curation rules - pills, featured posts, grid         |

## Usage

Claude Code should reference these files when:

- **Writing or reviewing posts** → CONTENT.md, STYLE.md, CATEGORIES.md, TAGS.md
- **Modifying homepage** → HOMEPAGE.md
- **Categorizing content** → CATEGORIES.md (definitions and distinctions)

## For Developers

When creating or editing blog posts:

1. Check `TAGS.md` for valid tags
2. Choose 1 category from `CATEGORIES.md`
3. Choose 2-4 tags from canonical list
4. Follow structure in `CONTENT.md`
5. Match tone/style in `STYLE.md`

## Maintenance

Update these docs when:

- Category definitions change
- New tags are added
- Editorial direction shifts
- Homepage curation rules evolve
