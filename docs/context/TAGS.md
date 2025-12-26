# Tag Taxonomy

This document defines the canonical tag list for ROACM blog posts. All posts must use tags from this list. New tags require conscious decision and should be added here.

## Canonical Tags (44 total)

### AI & Machine Learning (6 tags)

- `ai-tools` - AI products, services, and platforms
- `ai-patterns` - AI integration patterns and best practices
- `ai-assisted-development` - AI-assisted development practices
- `coding-assistants` - AI coding tools (Copilot, ChatGPT, Claude Code)
- `machine-learning` - ML concepts, model training
- `mlops` - MLOps practices and platforms

### Developer Experience (5 tags)

- `developer-experience` - Dev tooling, workflows, IDE setup
- `productivity` - Efficiency, automation, time-saving
- `troubleshooting` - Debugging, problem-solving guides
- `tutorials` - How-to guides and walkthroughs
- `tools` - Software tools and utilities

### Software Architecture (5 tags)

- `architecture` - System design, patterns, principles
- `design-patterns` - Specific design patterns
- `data-engineering` - Data pipelines, storage, processing
- `api` - API design and integration
- `algorithms` - Algorithmic problem-solving, data structures

### DevOps & Infrastructure (6 tags)

- `devops` - DevOps practices and culture
- `infrastructure` - Infrastructure setup and management
- `infrastructure-as-code` - Terraform, CloudFormation, IaC tools
- `ci-cd` - Continuous integration and deployment
- `cloud` - Cloud platforms and services (AWS, Azure, GCP)
- `iot` - Smart home, IoT devices, home automation

### Code Quality & Testing (5 tags)

- `code-quality` - Clean code, refactoring, linting, best practices
- `engineering-principles` - Engineering principles and philosophies
- `testing` - Testing strategies, frameworks, TDD, mocking
- `security` - Security practices and concerns
- `performance` - Performance optimization

### Programming Languages (7 tags)

- `java` - Java language and ecosystem
- `javascript` - JavaScript and Node.js
- `python` - Python language
- `dotnet` - .NET framework and languages
- `php` - PHP language
- `scala` - Scala language
- `f-sharp` - F# language

### Career & Team (3 tags)

- `career` - Career growth, advice, reflections
- `engineering-culture` - Team practices, culture, distributed teams
- `leadership` - Leadership and management

### Platforms & Operating Systems (5 tags)

- `windows` - Windows OS (all versions)
- `linux` - Linux and Unix systems
- `mac-os` - macOS
- `android` - Android platform (use `mobile` for cross-platform)
- `mobile` - All mobile platforms (Windows Mobile, Android, iOS)

### Content Types (3 tags)

- `product-review` - Reviews of products/services, releases
- `blog-meta` - Blog updates and meta-commentary
- `milestone` - Personal/career milestone moments

### Other (2 tags)

- `software-licensing` - Software licensing and IP concerns
- `imagine-cup` - Imagine Cup competition posts

## Categories vs Tags

### Categories (Parent Topics)

Categories are broad parent topics that:

- Can have spaces and capital letters
- Appear in post URLs
- Group related content at a high level
- Do NOT overlap with tags

**Current categories:**

- `AI for Software Engineering` → Use tags: ai-tools, ai-assisted-development, coding-assistants
- `intelligent Engineering` → Use tags: ai-patterns, ai-assisted-development

### Tags (Specific Topics)

Tags are specific canonical tags that:

- Must be lowercase with hyphens (no spaces)
- Must be from the canonical list above
- Are used for filtering and discovery
- Can appear on multiple posts

## Guidelines for New Tags

### Before Adding a New Tag

1. **Check existing tags** - Can an existing tag work?
2. **Verify it's not too specific** - Avoid version numbers, brand names, one-off events
3. **Ensure reusability** - Tag should apply to 2+ posts (or have clear future use)
4. **Maintain consistency** - Follow naming conventions (lowercase, hyphenated)
5. **Update this document** - Add new tag with description

### Naming Conventions

- Use lowercase with hyphens: `code-quality`, not `Code Quality` or `code_quality`
- Be specific but not too narrow: `infrastructure-as-code`, not `terraform`
- Avoid version numbers: `java`, not `java-8`
- Generic over brand: `developer-experience`, not `intellij`

### When to Consolidate

Consolidate tags when:

- Version-specific (java-8 → java)
- Brand-specific (eclipse → developer-experience for plugin posts)
- Formatting variants (coding assistants → coding-assistants)
- Low usage + overlapping concept (best-practices → code-quality)

### When to Keep Separate

Keep tags separate when they represent:

- Distinct concepts (machine-learning vs mlops)
- Different domains (iot vs infrastructure)
- Language diversity (java, python, scala - shows breadth)
- Meaningful specialization (algorithms vs architecture)

## Validation

To verify all posts use canonical tags, run:

```bash
python3 << 'PYEOF'
from pathlib import Path
import re

canonical_tags = {
    'ai-tools', 'ai-patterns', 'ai-assisted-development', 'coding-assistants',
    'machine-learning', 'mlops', 'developer-experience', 'productivity',
    'troubleshooting', 'tutorials', 'tools', 'architecture', 'design-patterns',
    'data-engineering', 'api', 'algorithms', 'devops', 'infrastructure',
    'infrastructure-as-code', 'ci-cd', 'cloud', 'iot', 'code-quality',
    'engineering-principles', 'testing', 'security', 'performance', 'java',
    'javascript', 'python', 'dotnet', 'php', 'scala', 'f-sharp', 'career',
    'engineering-culture', 'leadership', 'windows', 'linux', 'mac-os', 'android',
    'mobile', 'product-review', 'blog-meta', 'milestone',
    'software-licensing', 'imagine-cup'
}

non_canonical = set()
for post_file in Path('_posts').glob('*.markdown'):
    with open(post_file, 'r', encoding='utf-8') as f:
        content = f.read()

    tags_match = re.search(r'^tags:\n((?:  - .+\n)+)', content, re.MULTILINE)
    if tags_match:
        for line in tags_match.group(1).split('\n'):
            if line.strip().startswith('- '):
                tag = line.strip()[2:]
                if tag not in canonical_tags:
                    non_canonical.add((tag, post_file.name))

if non_canonical:
    print("❌ Non-canonical tags found:")
    for tag, post in sorted(non_canonical):
        print(f"  {tag} in {post}")
else:
    print("✅ All tags are canonical!")
PYEOF
```

## Historical Context

**Migration completed**: December 2024
**Original tag count**: 198
**Final tag count**: 44
**Reduction**: 78%
**Posts affected**: 110 posts

See issue #90 for full migration history and decisions.
