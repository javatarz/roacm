# Cross-Posting to External Platforms

This document describes how blog posts are cross-posted to external platforms.

## dev.to (Automated)

Posts are automatically cross-posted to dev.to when pushed to main.

### Enabling Cross-Posting

Add `devto: true` to your post's front matter:

```yaml
---
title: 'Your Post Title'
description: 'Post description for SEO'
tags:
  - tag-one
  - tag-two
devto: true
---
```

### How It Works

1. **Trigger**: Push to `main` with changes in `_posts/`
2. **Workflow**: `.github/workflows/devto-crosspost.yml`
3. **Tracking**: `.devto-posts.json` prevents duplicate posts
4. **Canonical URL**: Set automatically to `https://karun.me/blog/YYYY/MM/DD/<slug>/`

### Workflow Behavior

- Only processes posts with `devto: true`
- Creates posts once (no updates on edit)
- Publishes immediately with canonical URL
- 15-second delay between posts (rate limiting)

### Tag Handling

- dev.to allows max 4 tags
- Tags converted to lowercase alphanumeric (hyphens removed)
- Use `devto_tags` to override:

```yaml
tags:
  - ai-assisted-development
  - engineering-principles
devto_tags:
  - ai
  - programming
  - webdev
  - productivity
```

### Markdown Conversion

The workflow automatically converts Jekyll-specific syntax:

| Jekyll Syntax                               | Converted To                                       |
| ------------------------------------------- | -------------------------------------------------- |
| `{% highlight lang %}...{% endhighlight %}` | ` ```lang ... ``` `                                |
| `{% post_url YYYY-MM-DD-slug %}`            | dev.to URL if post exists there, else karun.me URL |
| `{% include youtube.html id="..." %}`       | `{% embed https://youtube.com/watch?v=... %}`      |
| `{{ site.url }}`                            | `https://karun.me`                                 |
| `<!-- more -->`                             | (removed)                                          |
| Relative image paths                        | Absolute URLs                                      |
| Relative links                              | Absolute URLs                                      |

### Manual Trigger

To cross-post a specific post manually:

1. Go to Actions → "Cross-post to dev.to"
2. Click "Run workflow"
3. Enter post path: `_posts/YYYY-MM-DD-slug.markdown`

### Troubleshooting

**Post not appearing on dev.to:**

- Verify `devto: true` is in front matter
- Check `.devto-posts.json` - if tracked, delete the entry to re-post
- Check GitHub Actions logs for errors

**Re-posting a post:**

1. Remove the entry from `.devto-posts.json`
2. Commit and push
3. Manually trigger the workflow for that post

### Secret Required

`DEVTO_API_KEY` - Get from [dev.to Settings → Extensions](https://dev.to/settings/extensions)

---

## Medium (Manual Only)

**Note:** Medium removed API access (Integration Tokens) in early 2025, making automated cross-posting impossible.

### Manual Import Process

1. Go to https://medium.com/new-story
2. Click the "..." menu → "Import a story"
3. Paste your blog URL (e.g., `https://karun.me/blog/your-post/`)
4. Medium imports content and sets canonical URL automatically
5. Review formatting and publish

### Tips

- The import tool handles canonical URLs automatically
- Review formatting after import (code blocks, images)
- Can add to publications (e.g., inspiredbrilliance) after publishing
