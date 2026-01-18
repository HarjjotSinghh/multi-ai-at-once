#!/bin/bash
# Wrapper script for multi-ai CLI
# Usage: ./multi-ai.sh [command] [options]

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
node "$SCRIPT_DIR/packages/cli/dist/index.js" "$@"
