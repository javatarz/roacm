#!/bin/bash
# List all Git worktrees with port assignments and status

set -euo pipefail

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
GRAY='\033[0;90m'
NC='\033[0m' # No Color

echo ""
echo "📋 Active Git Worktrees"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Get current worktree path
CURRENT_PATH=$(git rev-parse --show-toplevel 2>/dev/null || echo "")

# Track used ports
USED_PORTS=()

# Parse git worktree list
git worktree list --porcelain | awk '
BEGIN {
    worktree = ""
    branch = ""
    head = ""
}
/^worktree / {
    if (worktree != "") {
        print worktree "|" branch "|" head
    }
    worktree = substr($0, 10)
}
/^branch / {
    branch = substr($0, 8)
    # Remove refs/heads/ prefix
    sub(/^refs\/heads\//, "", branch)
}
/^HEAD / {
    head = substr($0, 6)
}
END {
    if (worktree != "") {
        print worktree "|" branch "|" head
    }
}
' | while IFS='|' read -r path branch head; do
    # Extract port from path if it matches pattern ../roacm-PORT-issue-N
    if [[ "$path" =~ roacm-([0-9]{4})-issue-([0-9]+) ]]; then
        PORT="${BASH_REMATCH[1]}"
        ISSUE="${BASH_REMATCH[2]}"
        USED_PORTS+=("$PORT")

        # Check if this is the current worktree
        if [ "$path" = "$CURRENT_PATH" ]; then
            echo -e "${GREEN}➜ $path${NC}"
            echo -e "   Branch: ${BLUE}$branch${NC}"
            echo -e "   Port:   ${YELLOW}$PORT${NC} (Issue #$ISSUE)"
            echo -e "   ${GREEN}[CURRENT LOCATION]${NC}"
        else
            echo -e "${GRAY}  $path${NC}"
            echo -e "   Branch: $branch"
            echo -e "   Port:   $PORT (Issue #$ISSUE)"
        fi
    elif [[ "$path" =~ /roacm$ ]]; then
        # Main repository
        if [ "$path" = "$CURRENT_PATH" ]; then
            echo -e "${GREEN}➜ $path${NC}"
            echo -e "   Branch: ${BLUE}$branch${NC}"
            echo -e "   Port:   ${YELLOW}4000${NC} (main repository)"
            echo -e "   ${GREEN}[CURRENT LOCATION]${NC}"
        else
            echo -e "${GRAY}  $path${NC}"
            echo -e "   Branch: $branch"
            echo -e "   Port:   4000 (main repository)"
        fi
    else
        # Other worktree (doesn't match our naming pattern)
        if [ "$path" = "$CURRENT_PATH" ]; then
            echo -e "${GREEN}➜ $path${NC}"
            echo -e "   Branch: ${BLUE}$branch${NC}"
            echo -e "   ${GREEN}[CURRENT LOCATION]${NC}"
        else
            echo -e "${GRAY}  $path${NC}"
            echo -e "   Branch: $branch"
        fi
    fi
    echo ""
done

# Calculate available ports
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Read used ports into array (need to re-run because subshell)
USED_PORTS=($(git worktree list --porcelain | grep '^worktree' | sed 's/^worktree //' | grep -oE 'roacm-([0-9]{4})-issue' | sed 's/roacm-//' | sed 's/-issue//'))

# Find available ports
AVAILABLE_PORTS=()
for port in {4001..4010}; do
    found=0
    for used in "${USED_PORTS[@]}"; do
        if [ "$port" -eq "$used" ]; then
            found=1
            break
        fi
    done
    if [ $found -eq 0 ]; then
        AVAILABLE_PORTS+=("$port")
    fi
done

if [ ${#AVAILABLE_PORTS[@]} -gt 0 ]; then
    echo -e "${GREEN}Available ports:${NC} ${AVAILABLE_PORTS[*]}"
else
    echo -e "${YELLOW}⚠️  All ports (4001-4010) are in use!${NC}"
    echo -e "   Run ${BLUE}./scripts/worktree-cleanup.sh${NC} to remove old worktrees"
fi

echo ""
