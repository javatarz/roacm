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

7. **Assign the issue**: Run `gh issue edit <number> --add-assignee @me` to claim the issue

8. **After selection**: Display the full issue details using `gh issue view <number>`

9. **For content cards** (issues with `content` label): Follow the collaborative content workflow below

## Content Card Workflow

When the selected issue has a `content` label (blog posts, documentation, etc.), do NOT jump straight into writing. Instead:

1. **Explain the purpose first**: Before writing anything, explain:
   - The point of the post (what problem it solves, why it matters)
   - The high-level idea and core insight
   - What readers should leave with
   - How it relates to other content (series, references, etc.)

2. **Get agreement on purpose**: Ask the user to confirm you're aligned before proceeding

3. **Plan research together**: Before writing, discuss what research is needed:
   - What's already written on this topic? (existing posts, external references)
   - What sources should we read to understand the landscape?
   - What's the best way to teach this topic? (visuals, analogies, examples?)
   - Are there gaps in existing explanations we should fill?
   - Present a research strategy and get user agreement before executing

4. **Do the research**: Execute the agreed research plan, summarize findings, and discuss implications for the post

5. **Outline structure**: Based on research, present the proposed sections/structure and get agreement

6. **Work section by section**: For complex posts, discuss each major section before writing it

7. **Write draft only after alignment**: Once there's full clarity on purpose, research, and structure, write the post

**Why**: Content requires more collaboration than code. Rushing to write often produces drafts that miss the mark, wasting time on revisions. Getting alignment upfront is faster. Good research prevents reinventing the wheel and ensures we're adding value.

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
