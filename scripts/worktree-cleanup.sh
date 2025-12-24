#!/bin/bash
# Interactive cleanup of Git worktrees

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
GRAY='\033[0;90m'
NC='\033[0m' # No Color

echo ""
echo "🧹 Worktree Cleanup Tool"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Find all issue worktrees (matching our naming pattern)
WORKTREES=()
while IFS= read -r line; do
    WORKTREES+=("$line")
done < <(git worktree list --porcelain | awk '
BEGIN {
    worktree = ""
    branch = ""
}
/^worktree / {
    if (worktree != "" && worktree ~ /roacm-[0-9]{4}-issue-[0-9]+/) {
        print worktree "|" branch
    }
    worktree = substr($0, 10)
}
/^branch / {
    branch = substr($0, 8)
    sub(/^refs\/heads\//, "", branch)
}
END {
    if (worktree != "" && worktree ~ /roacm-[0-9]{4}-issue-[0-9]+/) {
        print worktree "|" branch
    }
}')

if [ ${#WORKTREES[@]} -eq 0 ]; then
    echo -e "${GREEN}✓ No issue worktrees found${NC}"
    echo ""
    exit 0
fi

echo "Found ${#WORKTREES[@]} issue worktree(s):"
echo ""

# Check each worktree for merged status
for i in "${!WORKTREES[@]}"; do
    IFS='|' read -r path branch <<< "${WORKTREES[$i]}"

    # Extract issue number and port
    if [[ "$path" =~ roacm-([0-9]{4})-issue-([0-9]+) ]]; then
        PORT="${BASH_REMATCH[1]}"
        ISSUE="${BASH_REMATCH[2]}"

        # Check if branch is merged into main
        MERGED=false
        if git branch --merged main | grep -q "^[* ]*$branch\$"; then
            MERGED=true
        fi

        # Check if branch exists on remote
        REMOTE_EXISTS=false
        if git ls-remote --heads origin "$branch" | grep -q "$branch"; then
            REMOTE_EXISTS=true
        fi

        # Format output with status
        echo -n "$((i+1)). "
        if [ "$MERGED" = true ]; then
            echo -e "${GREEN}✓${NC} $path"
            echo -e "   Branch: ${GRAY}$branch${NC} (merged into main)"
        else
            echo -e "${YELLOW}•${NC} $path"
            echo -e "   Branch: ${BLUE}$branch${NC} (not merged)"
        fi
        echo -e "   Port: $PORT | Issue: #$ISSUE"

        # Show uncommitted changes
        pushd "$path" > /dev/null 2>&1
        if ! git diff-index --quiet HEAD -- 2>/dev/null; then
            echo -e "   ${YELLOW}⚠️  Has uncommitted changes${NC}"
        fi
        popd > /dev/null 2>&1

        echo ""
    fi
done

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Options:"
echo "  [a] Remove all merged worktrees"
echo "  [#] Remove specific worktree by number"
echo "  [q] Quit without changes"
echo ""
read -p "Choose an option: " choice

case "$choice" in
    a|A)
        echo ""
        echo "Removing merged worktrees..."
        REMOVED=0
        for worktree_info in "${WORKTREES[@]}"; do
            IFS='|' read -r path branch <<< "$worktree_info"

            # Check if merged
            if git branch --merged main | grep -q "^[* ]*$branch\$"; then
                echo -n "  Removing $path... "
                if git worktree remove "$path" 2>/dev/null; then
                    echo -e "${GREEN}✓${NC}"
                    REMOVED=$((REMOVED + 1))
                else
                    echo -e "${RED}✗ (failed)${NC}"
                fi
            fi
        done
        echo ""
        if [ $REMOVED -gt 0 ]; then
            echo -e "${GREEN}✓ Removed $REMOVED worktree(s)${NC}"
        else
            echo -e "${YELLOW}No merged worktrees to remove${NC}"
        fi
        ;;

    [0-9]*)
        idx=$((choice - 1))
        if [ $idx -ge 0 ] && [ $idx -lt ${#WORKTREES[@]} ]; then
            IFS='|' read -r path branch <<< "${WORKTREES[$idx]}"
            echo ""
            echo -e "Removing worktree at: ${BLUE}$path${NC}"

            # Check for uncommitted changes
            pushd "$path" > /dev/null 2>&1
            if ! git diff-index --quiet HEAD -- 2>/dev/null; then
                echo -e "${YELLOW}⚠️  Warning: This worktree has uncommitted changes!${NC}"
                read -p "Are you sure you want to remove it? [y/N] " confirm
                if [[ ! "$confirm" =~ ^[Yy]$ ]]; then
                    echo "Cancelled."
                    popd > /dev/null 2>&1
                    exit 0
                fi
            fi
            popd > /dev/null 2>&1

            if git worktree remove "$path"; then
                echo -e "${GREEN}✓ Worktree removed${NC}"

                # Ask if user wants to delete the branch
                echo ""
                read -p "Delete branch '$branch' too? [y/N] " delete_branch
                if [[ "$delete_branch" =~ ^[Yy]$ ]]; then
                    if git branch -D "$branch"; then
                        echo -e "${GREEN}✓ Branch deleted${NC}"
                    fi
                fi
            else
                echo -e "${RED}✗ Failed to remove worktree${NC}"
            fi
        else
            echo "Invalid worktree number"
        fi
        ;;

    q|Q)
        echo "No changes made."
        ;;

    *)
        echo "Invalid option"
        ;;
esac

echo ""

# Clean up stale worktree metadata
git worktree prune

echo -e "${GREEN}✓ Cleanup complete${NC}"
echo ""
