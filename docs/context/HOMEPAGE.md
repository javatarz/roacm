# Homepage Curation

Rules and guidelines for the blog homepage layout and content selection.

## Layout Structure

The homepage consists of:

1. **Topic Navigation Pills** - Curated category links
2. **Featured Post** - Hero section with latest/pinned post
3. **Recent Posts Grid** - 6 posts in responsive 3x2 layout
4. **View All Link** - Link to /archive/

## Topic Navigation Pills

### Curation Philosophy

Pills are **editorial, not algorithmic**. They are curated based on:

- What's relevant in the market now
- Topics the author wants to highlight
- Where readers should focus attention

They are NOT based on:

- Post count per category
- Recency of posts in category
- Alphabetical order

### Current Pills (as of Dec 2024)

1. **intelligent Engineering** - Hot topic, current focus
2. **Software Design** - Timeless, core engineering content
3. **Platform Engineering** - Modern infrastructure relevance
4. **Developer Experience** - Always relevant for practitioners

### Updating Pills

Update pills when:

- A new topic becomes the author's focus
- Market trends shift significantly
- A category becomes stale or irrelevant

Don't add pills just because a category has many posts. Legacy categories (Device Hacks, Tech Reviews, Personal, Projects) are accessible via archive but not highlighted.

## Featured Post

### Selection Rules

1. Check for `featured: true` in front matter (pinned post)
2. If none pinned, use the most recent post
3. Featured post gets larger typography and 50-word excerpt

### When to Pin

Pin a post when:

- It's a cornerstone piece for a topic
- You want it visible regardless of publish date
- It represents the blog's current direction

## Recent Posts Grid

### Display Rules

- Shows 6 most recent posts
- Skips the featured post (no duplicates)
- 3 columns on desktop, 2 on tablet, 1 on mobile
- Each card shows: title, date, reading time, 25-word excerpt

### Content Quality

The grid is prime real estate. If recent posts don't represent the blog well:

- Consider publishing new content
- Or pin a better featured post to push grid content down

## Archive Page

The `/archive/` page shows all posts and serves as the complete index. Homepage curation doesn't hide content - it highlights priorities.

## Implementation Files

- `_includes/topic_nav.html` - Pill navigation
- `_includes/featured_post.html` - Hero section
- `_includes/recent_posts_grid.html` - Post grid
- `_includes/post_card.html` - Individual card component
- `index.html` - Composes all components
- `assets/css/overrides.css` - Styling (search for "Blog Index")
