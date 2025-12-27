# Cross-Posting to dev.to and Medium

This document describes how blog posts are cross-posted to external platforms.

## Overview

Posts can be automatically cross-posted to:

- **dev.to** - Fully automated (publishes immediately with canonical URL)
- **Medium** - Semi-automated (creates draft, requires manual publish)

## Front Matter Format

Add `cross_post` to your post's front matter to enable cross-posting:

```yaml
---
title: 'Your Post Title'
# ... other front matter ...
cross_post: [devto, medium] # Platforms to publish to
---
```

Options:

- `cross_post: [devto]` - Only dev.to
- `cross_post: [medium]` - Only Medium
- `cross_post: [devto, medium]` - Both platforms

## How It Works

### Workflow

The cross-posting workflow (`.github/workflows/crosspost.yml`) runs when:

1. A post is pushed to `main` branch
2. Manually triggered via workflow dispatch

### Tracking Files

- `.devto-posts.json` - Tracks posts published to dev.to
- `.medium-posts.json` - Tracks posts published to Medium

These files prevent duplicate posting. Once a post is tracked, it won't be re-posted.

## Platform-Specific Details

### dev.to (Fully Automated)

- **Authentication**: `DEVTO_API_KEY` secret
- **Publish status**: Published immediately
- **Canonical URL**: Set automatically via API
- **Tags**: Max 4, lowercase alphanumeric only
- **No manual steps required**

### Medium (Semi-Automated)

- **Authentication**: `MEDIUM_INTEGRATION_TOKEN` secret
- **Publish status**: Created as DRAFT
- **Canonical URL**: Must be set manually (API limitation)
- **Tags**: Max 5, preserves format
- **Manual steps required** (see below)

## Manual Steps for Medium

After the workflow creates a Medium draft, you must complete these steps:

1. **Go to Medium drafts** - Check your personal account drafts
2. **Review formatting** - Ensure the post looks correct
3. **Set canonical URL**:
   - Click the three-dot menu (...)
   - Select "This story was originally published elsewhere"
   - Enter: `https://karun.me/blog/<post-slug>/`
4. **Set distribution**:
   - Ensure "Free" is selected (not member-only)
5. **Publish** the post
6. **(Optional)** Add to inspiredbrilliance publication afterwards

The workflow outputs a reminder with these steps in the GitHub Actions summary.

## Secrets Required

Add these secrets to your GitHub repository:

| Secret                     | Source                                                                | Platform |
| -------------------------- | --------------------------------------------------------------------- | -------- |
| `DEVTO_API_KEY`            | [dev.to Settings > Extensions](https://dev.to/settings/extensions)    | dev.to   |
| `MEDIUM_INTEGRATION_TOKEN` | [Medium Settings > Security](https://medium.com/me/settings/security) | Medium   |

## Markdown Conversion

The workflow automatically converts Jekyll-specific markdown:

- `{% highlight lang %}...{% endhighlight %}` → Code fences
- `{% post_url YYYY-MM-DD-slug %}` → Absolute URLs
- `{% include youtube.html id="..." %}` → Platform embeds
- `{{ site.url }}` → `https://karun.me`
- Relative image/link paths → Absolute URLs

## Platform-Specific Tags

You can override tags for specific platforms:

```yaml
tags:
  - ai-assisted-development
  - engineering-principles
devto_tags:
  - ai
  - programming
medium_tags:
  - Artificial Intelligence
  - Software Engineering
```

## Troubleshooting

### Post not appearing on dev.to

- Check if `DEVTO_API_KEY` is set correctly
- Verify the post has `cross_post: [devto]` or `cross_post: [devto, medium]`
- Check `.devto-posts.json` - if tracked, delete the entry to re-post

### Medium draft not created

- Check if `MEDIUM_INTEGRATION_TOKEN` is set correctly
- Verify the post has `cross_post: [medium]` or `cross_post: [devto, medium]`
- Check `.medium-posts.json` - if tracked, delete the entry to re-post

### Rate limiting

- dev.to: 15 second delay between posts
- Medium: 5 second delay between posts
