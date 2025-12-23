# Pick Up Next Card

Help me select the next GitHub issue to work on.

## Instructions

1. **Fetch open issues**: Run `gh issue list --state open --limit 100 --json number,title,labels,createdAt`

2. **Organize by priority**: Sort issues into groups:
   - **Priority 1 (Critical)**: `priority-1-critical` label - fix first
   - **Priority 2 (High)**: `priority-2-high` label
   - **Priority 3 (Medium)**: `priority-3-medium` label
   - **Priority 4 (Low)**: `priority-4-low` label
   - **Unprioritized**: No priority label

3. **Within each priority, prefer bugs over enhancements**: Issues with `bug` label come before `enhancement`

4. **Within same type, sort by age**: Oldest issues first (by `createdAt`)

5. **Present options**: Show the top 5-7 issues in a formatted list with:
   - Issue number and title
   - Priority level
   - Category labels (e.g., `ux`, `seo`, `performance`, `content`, `a11y`)
   - Age (days since created)

6. **Ask for selection**: Use the question tool to let me pick which issue to work on

7. **After selection**: Display the full issue details using `gh issue view <number>`

## Example Output Format

```
## Available Cards

### Priority 1 - Critical
(none)

### Priority 2 - High
1. #42 - Fix broken dark mode toggle [bug, ux] (3 days old)
2. #38 - Image optimization failing on CI [bug, performance] (5 days old)

### Priority 3 - Medium
3. #87 - Add related posts section [enhancement, ux] (18 days old)
4. #88 - Add author bio card [enhancement, ux] (18 days old)

### Priority 4 - Low
5. #93 - Bundle and minify JavaScript [enhancement, performance] (18 days old)
```
