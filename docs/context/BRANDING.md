# Branding Guidelines

Visual identity for karun.me, covering both the professional hub (homepage) and the blog.

## Brand Elements

### Logo / Wordmark

The primary brand mark is a code-inspired closing tag: `</>`

**Usage:**

- **Homepage hero**: `</Karun Japhet>` - name wrapped in stylized closing tag
- **Blog sidebar**: `</>` icon above blog title, linking to homepage
- **Favicon**: Red square with white `</>` in monospace font

**Rationale:** The closing tag represents the developer identity while being memorable and unique. It mirrors the favicon design and creates visual continuity across the site.

### Color Palette

| Token                    | Light Mode | Dark Mode | Usage                               |
| ------------------------ | ---------- | --------- | ----------------------------------- |
| `--accent-color`         | `#c30000`  | `#ff6b6b` | Primary accent, links, brackets     |
| `--sidebar-accent-color` | `#ff5555`  | `#ff5555` | Sidebar highlights (always dark bg) |
| `--bg-primary`           | `#ffffff`  | `#1a1a1a` | Main background                     |
| `--bg-secondary`         | `#f5f5f5`  | `#2a2a2a` | Cards, sections                     |
| `--text-primary`         | `#222222`  | `#e0e0e0` | Body text                           |
| `--text-secondary`       | `#595959`  | `#b0b0b0` | Metadata, captions                  |

**Key decisions:**

- Red accent (`#c30000`) is the signature color, used consistently across both sections
- Dark mode uses brighter red (`#ff6b6b`) for contrast compliance
- Homepage hero and blog sidebar are always dark, regardless of theme

### Typography

| Element       | Font               | Weight      | Notes                        |
| ------------- | ------------------ | ----------- | ---------------------------- |
| Body text     | Open Sans          | 300 (Light) | Clean, readable              |
| Headings      | Open Sans          | 700 (Bold)  | Strong hierarchy             |
| Code/Brackets | Fira Code / Monaco | 400         | Monospace for code aesthetic |

**Bracket styling:**

- Font: `'Fira Code', Monaco, Consolas, monospace`
- Color: `var(--accent-color)` (red)
- Applied to `</` and `>` in hero wordmark

### Favicon

Files in repository root:

- `favicon.svg` - Primary vector (recommended)
- `favicon-32x32.png` - Standard browser
- `favicon-16x16.png` - Small tabs
- `apple-touch-icon.png` - iOS home screen
- `favicon.ico` - Legacy fallback

**Design:** Red square (`#c30000`) with 12px border-radius, white `</>` text in Monaco/Consolas monospace.

## Site Sections

### Homepage (karun.me)

- **Layout:** Centered, no sidebar, full-width hero
- **Hero:** Dark gradient background, `</Karun Japhet>` wordmark
- **Tagline:** "Engineering leader. Writing about AI-assisted delivery, architecture, and developer experience."
- **Navigation:** Theme toggle in top-right corner

### Blog (karun.me/blog)

- **Layout:** Left sidebar + main content area
- **Sidebar:** Always dark, contains `</>` logo linking to homepage
- **Title:** "Ramblings of a Coder's Mind"
- **Tagline:** "Engineering x AI x Scale" (with "Scale" highlighted)

## Navigation Flow

```
Homepage (/)
    |
    v
Blog (/blog/) <-- </> logo links back to homepage
    |
    +-- Blog posts
    +-- Categories
    +-- Archive
```

The `</>` logo in the blog sidebar provides a visual and functional link back to the professional hub, while the blog title links to the blog index.

## Design Principles

1. **Consistency over distinction** - Same color palette, same fonts, same card patterns
2. **Subtle evolution** - Homepage feels like a natural extension of the blog, not a different site
3. **Developer identity** - Code-inspired elements (brackets, monospace) reinforce the technical brand
4. **Dark hero, adaptable content** - Hero sections stay dark for impact; content areas respect user theme preference
