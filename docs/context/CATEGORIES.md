# Category Taxonomy

This document defines the canonical category list for ROACM blog posts. Categories are parent topics that group related content at a high level.

## Categories vs Tags

### Categories (Parent Topics)

- Broad parent topics that appear in post URLs
- Can have spaces and capital letters
- Group related content at a high level
- Do NOT overlap with tags (categories are parents, tags are children)

### Tags (Specific Topics)

- Specific canonical tags from `TAGS.md`
- Lowercase with hyphens (no spaces)
- Used for filtering and discovery
- Multiple tags per post allowed

## Current Categories (2 active)

### AI for Software Engineering

**Description**: AI's impact on software engineering beyond code generation

**Related tags**:

- ai-tools
- ai-assisted-development
- coding-assistants
- machine-learning
- mlops

**Posts**: 1

---

### intelligent Engineering

**Description**: Principles and practices for building with AI

**Related tags**:

- ai-patterns
- ai-assisted-development
- engineering-principles

**Posts**: 1

---

## Legacy Categories (in older posts)

These categories appear in older posts but may not be actively used for new content:

- **Device Hacks** - Hardware customizations and mobile device hacking
- **Developer Experience** - Developer tooling and workflow optimization
- **Personal** - Personal updates and reflections
- **Platform Engineering** - Infrastructure and platform work
- **Software Design** - Software architecture and design patterns
- **Tech Reviews** - Product reviews and technology evaluations

## Guidelines for Categories

### When to Create a New Category

Create a new category when:

1. You have 3+ posts on a cohesive parent topic
2. The topic is broad enough to encompass multiple tags
3. It represents a distinct area of focus in your writing
4. It provides meaningful navigation for readers

### Naming Conventions

- Use Title Case: "AI for Software Engineering", not "ai for software engineering"
- Can include spaces (unlike tags)
- Should be descriptive but concise
- Represents a "topic area" not a specific post type

### Category → Tags Mapping

Each category should map to 2-5 related canonical tags. When writing a post:

1. **Choose 1-2 categories** (broad parent topics)
2. **Choose 2-4 tags** (specific topics from `TAGS.md`)
3. **Ensure no overlap** between categories and tags

Example:

```yaml
categories:
  - AI for Software Engineering # Parent topic
tags:
  - coding-assistants # Specific tag
  - code-quality # Specific tag
  - developer-experience # Specific tag
```

## Adding New Categories

When adding a new category:

1. **Update this document** with description and related tags
2. **Ensure it's distinct** from existing categories
3. **Map to canonical tags** from TAGS.md
4. **Add to archive layout** if needed (handled automatically by jekyll-archives)

## Validation

To see all current categories and their usage:

```bash
python3 << 'PYEOF'
from pathlib import Path
import re

cat_counts = {}
for post_file in Path('_posts').glob('*.markdown'):
    with open(post_file, 'r', encoding='utf-8') as f:
        content = f.read()

    # Extract categories (both singular and plural)
    cat_match = re.search(r'^categor(?:y|ies):\s*(.+)$', content, re.MULTILINE)
    if cat_match:
        cat_value = cat_match.group(1).strip()
        # Handle both single category and list format
        if cat_value.startswith('['):
            # List format
            cats = re.findall(r"'([^']+)'", cat_value)
        else:
            # Single category or YAML list
            cats = [cat_value]

        for cat in cats:
            cat_counts[cat] = cat_counts.get(cat, 0) + 1

    # Also handle YAML list format
    cat_match = re.search(r'^categories:\n((?:  - .+\n)+)', content, re.MULTILINE)
    if cat_match:
        for line in cat_match.group(1).split('\n'):
            if line.strip().startswith('- '):
                cat = line.strip()[2:]
                cat_counts[cat] = cat_counts.get(cat, 0) + 1

print("Categories in use:")
for cat, count in sorted(cat_counts.items(), key=lambda x: -x[1]):
    print(f"  {cat}: {count} posts")
PYEOF
```

## Historical Context

**Last reviewed**: December 2024

Most posts use the legacy single-category format (`category: Software Design`). New posts use the multi-category format (`categories:`). Both are supported by Jekyll.
