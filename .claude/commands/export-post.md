# Export Post for WYSIWYG Editors

Convert a blog post from markdown to clean HTML optimized for pasting into WYSIWYG editors (Medium, LinkedIn, etc.).

## Usage

- `/export-post` - Select from 5 most recent posts
- `/export-post <filename>` - Export specific post file

## Instructions

### 1. Determine input file

**If filename is provided as argument:**

- Use the provided filename
- If it doesn't include path, assume `_posts/` directory
- Verify file exists, error if not found

**If no filename provided:**

- Run: `ls -t _posts/*.markdown | head -5` to get 5 most recent files
- For each file, extract:
  - Date from filename (YYYY-MM-DD)
  - Title from frontmatter (read first 10 lines, find `title:` line)
- Show simple numbered selection:

  ```
  Select a post to export:

  1. [2025-11-06] intelligent Engineering: Principles for Building With AI
  2. [2025-07-29] Level Up Code Quality with an AI Assistant
  3. [2025-07-17] How to Choose Your Coding Assistants
  4. [2025-07-07] Patterns for AI-Assisted Software Development
  5. [2025-06-25] AI for Software Engineering: Not Only Code Generation

  Enter number (1-5):
  ```

- Wait for user to select a number (1-5)
- Continue with selected file

### 2. Show preview

Display post metadata before converting:

```
📝 Exporting: _posts/2025-11-06-intelligent-engineering-building-skills-and-shaping-principles.markdown

Title: intelligent Engineering: Principles for Building With AI
Date: November 6, 2025
Tags: ai-assisted-development, engineering-principles, ai-patterns

Converting to WYSIWYG HTML...
```

### 3. Run conversion script

Execute: `node scripts/export-post.mjs "<full-path-to-post>"`

The script will:

- Parse frontmatter (title, date, tags)
- Convert markdown to HTML
- Process Jekyll/Liquid tags
- Convert relative URLs to absolute (https://blog.karun.me/...)
- Format metadata at top (title, date, `Tags: tag1, tag2, tag3`)
- Copy result to clipboard

### 4. Show success message

```
✓ HTML copied to clipboard!

Ready to paste into:
- Medium (paste directly into editor)
- LinkedIn (paste into article editor)
- Any WYSIWYG editor

Note: Images converted to absolute URLs. Consider uploading them natively to the target platform for best results.
```

## Error Handling

- **File not found**: Show clear error with available recent posts
- **Conversion fails**: Display error from script and exit gracefully
- **Clipboard copy fails**: Show the HTML output instead with instructions to manually copy
