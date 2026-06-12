#!/bin/bash
# Check if the Jekyll dev server is running on the given port.
# Usage: ./scripts/server-status.sh [PORT]
# Exit 0 if running, exit 1 if not.

PORT="${1:-4000}"

if lsof -i :"$PORT" >/dev/null 2>&1; then
    echo "Server running at http://localhost:$PORT"
    exit 0
else
    echo "No server running on port $PORT"
    exit 1
fi
