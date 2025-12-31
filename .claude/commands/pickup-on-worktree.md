# Pick Up Card on Worktree

Create a dedicated Git worktree for working on a GitHub issue in parallel.

## Usage

- `/pickup-on-worktree <issue-number>` - Create worktree for specific issue
- `/pickup-on-worktree` - Show currently active worktrees and their ports

## Instructions

### When issue number is provided:

1. **Fetch issue details**: Run `gh issue view <issue-number>` to verify issue exists and show details

2. **Assign the issue**: Run `gh issue edit <issue-number> --add-assignee @me` to claim the issue before starting work

3. **Check existing worktrees and ports**:
   - Run `git worktree list` to get all active worktrees
   - Parse worktree paths to extract used ports from naming pattern `roacm-PORT-issue-N`
   - Find next available port in range 4001-4010

4. **Validate port availability**:
   - If all ports (4001-4010) are in use, FAIL with error:

     ```
     ❌ All worktree ports (4001-4010) are in use!

     Active worktrees:
     - ../roacm-4001-issue-123 (branch: issue-123)
     - ../roacm-4002-issue-124 (branch: issue-124)
     ...

     Clean up old worktrees first:
       git worktree remove ../roacm-PORT-issue-N
     Or use: ./scripts/worktree-list.sh
     ```

5. **Create worktree**:
   - Use naming pattern: `../roacm-<PORT>-issue-<NUMBER>`
   - Create branch: `issue-<NUMBER>` (matches existing convention)
   - Command: `git worktree add ../roacm-<PORT>-issue-<NUMBER> -b issue-<NUMBER>`

6. **Install dependencies in worktree**:
   - Run `cd ../roacm-<PORT>-issue-<NUMBER> && bundle install` for Ruby/Jekyll dependencies
   - Run `cd ../roacm-<PORT>-issue-<NUMBER> && npm install` for Node.js dependencies
   - If either fails, report error but continue

7. **Switch working context to worktree**:
   - **IMPORTANT**: From this point forward, ALL subsequent commands in this conversation should be run from the worktree
   - Prefix every command with: `cd ../roacm-<PORT>-issue-<NUMBER> &&`
   - This context persists until user explicitly switches to a different location
   - Store the worktree path and port in conversation memory for easy reference

8. **Success message and context confirmation**:

   ```
   ✅ Worktree created for issue #<NUMBER>

   Location: ../roacm-<PORT>-issue-<NUMBER>
   Branch: issue-<NUMBER>
   Port: <PORT>

   🎯 Now working in worktree context
   All subsequent commands will run from this worktree automatically.

   To start Jekyll server:
     ./local_run_native.sh --port <PORT>

   To switch contexts, tell me:
     "Switch to main repo"
     "Switch to worktree 4002"
     "Go back to main"
   ```

9. **Maintain context**:
   - For ALL future commands, automatically prepend: `cd ../roacm-<PORT>-issue-<NUMBER> &&`
   - Periodically confirm location in responses: "Working in worktree 4001..."
   - Track this context throughout the conversation
   - Do NOT return to main repo unless user explicitly requests it

10. **For content cards** (issues with `content` label): Follow the collaborative content workflow below

## Content Card Workflow

When the issue has a `content` label (blog posts, documentation, etc.), do NOT jump straight into writing. Instead:

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

### When no issue number provided:

1. **List active worktrees**: Run `git worktree list` and format output to show:
   - Worktree path
   - Branch name
   - Assigned port (parsed from path)
   - Whether it's the current worktree

2. **Example output**:

   ```
   Active worktrees:

   - ../roacm-4001-issue-123 [issue-123] → Port 4001
   - ../roacm-4002-issue-124 [issue-124] → Port 4002  (current)
   - /Users/karun/projects/personal/roacm [main] → Port 4000

   Available ports: 4003-4010
   ```

## Context Switching

When user requests to switch contexts, update the working directory for all subsequent commands:

- **"Switch to main repo"** / **"Go back to main"** / **"Return to main"**:
  - Update context to: `/Users/karun/projects/personal/roacm`
  - Confirm: "🎯 Switched to main repository"
  - Stop prepending worktree path to commands

- **"Switch to worktree 4001"** / **"Work in worktree 4002"**:
  - Parse the port number from request
  - Find the worktree path matching that port: `../roacm-<PORT>-issue-*`
  - Update context to that worktree path
  - Confirm: "🎯 Switched to worktree <PORT> (issue #N)"
  - Start prepending that worktree path to all commands

- **"/pickup-on-worktree <issue-number>"** (when in a different context):
  - Create the new worktree as described above
  - Automatically switch context to the new worktree
  - Previous worktree remains active, just not in current conversation context

## Important Rules

1. **Port allocation**: Always use ports 4001-4010 (main repo uses 4000)
2. **Fail fast**: If no ports available, stop and require cleanup
3. **No auto-start**: Never automatically start Jekyll - let user control this
4. **Context persistence**: After switching to a worktree, ALL commands run there until context explicitly changes
5. **Branch naming**: Always use `issue-N` format to match existing convention
6. **Worktree location**: Always create parallel to main repo, not inside it
7. **Context awareness**: Periodically confirm which worktree you're working in to avoid confusion

## Related Commands

- `./scripts/worktree-list.sh` - List all worktrees with details
- `./scripts/worktree-cleanup.sh` - Remove old/merged worktrees
- `git worktree remove <path>` - Manually remove a worktree
- `git worktree prune` - Clean up stale worktree metadata
