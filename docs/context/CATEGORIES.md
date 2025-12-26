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

## Category Definitions

### intelligent Engineering

**Scope**: Building software with AI assistance - principles, patterns, and tools

**Examples**: Coding assistants, AI-assisted development patterns, prompt engineering

**Related tags**: ai-patterns, ai-assisted-development, ai-tools, coding-assistants, engineering-principles

---

### Software Design

**Scope**: Code architecture, patterns, and programming techniques

**Examples**: Design patterns, event-driven architecture, language features, testing strategies

**Related tags**: architecture, data-engineering, testing

---

### Platform Engineering

**Scope**: Infrastructure, CI/CD, cloud, and operations at scale

**Examples**: Terraform, Kubernetes, CI/CD pipelines, cloud hosting, MLOps platforms

**Related tags**: devops, infrastructure, cloud

**Distinction from Software Design**: System-level (deploy, operate, scale) not code-level

**Distinction from Engineering Practices**: Team/org infrastructure not workflow/culture

---

### Engineering Practices

**Scope**: How individuals and teams work effectively - tooling, workflows, and culture

**Examples**: IDE setup, shell scripts, git workflows, dev environment optimization, team ceremonies, organizational transparency

**Related tags**: tools, productivity, developer-experience, engineering-culture, leadership

**Distinction from Platform Engineering**: How we work (individual + team), not infrastructure

---

### Device Hacks

**Scope**: Hardware tinkering and consumer device modifications

**Examples**: Phone mods, router configs, hardware builds, gaming setups

**Related tags**: hardware, mobile, tutorials

**Distinction from Platform Engineering**: Consumer hardware not server/cloud infrastructure

---

### Tech Reviews

**Scope**: Evaluating products, services, or technologies

**Examples**: OS reviews, product comparisons, technology evaluations

**Related tags**: product-review

---

### Projects

**Scope**: Tools and utilities built and released publicly

**Examples**: Open source tools, utility scripts, side projects

**Related tags**: tools, open-source

---

### Personal

**Scope**: Life updates and non-technical reflections

**Examples**: Announcements, personal challenges, reflections

**Related tags**: personal

---

## Legacy Note

Most posts use the legacy single-category format (`category: Software Design`). New posts may use multi-category format (`categories:`). Both are supported by Jekyll.

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
