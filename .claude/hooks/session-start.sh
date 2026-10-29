#!/bin/bash
# Installs dependencies for Claude Code on the web so lint, typecheck and
# tests work immediately. No-op on local machines.
set -euo pipefail

if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

cd "$CLAUDE_PROJECT_DIR"

# `npm install` (not `ci`) so the cached container layer is reused between sessions
npm install --no-audit --no-fund

# Generate Next.js route types (PageProps/LayoutProps) so `tsc` works without a build
npx next typegen >/dev/null
