# Outcomer - Decision Analysis Tool

help:
    just --list --unsorted

# ── Development ──────────────────────────────────────

# Start the development server with hot reload
dev:
    bun run --bun vite

# Preview the production build locally
preview:
    bun run --bun vite preview

# ── Build ────────────────────────────────────────────

# Build static output (HTML/JS/CSS) into dist/
build:
    bun run --bun vite build

# ── Quality ──────────────────────────────────────────

# Run TypeScript type checking (no emit)
typecheck:
    bun run --bun tsc --noEmit

# Run ESLint on source files
lint:
    bun run --bun eslint src/

# Run all tests
test:
    bun test

# Run tests in watch mode
test-watch:
    bun test --watch

# Run type check + lint + tests
check: typecheck lint test

# ── Maintenance ──────────────────────────────────────

# Remove build artifacts and caches
clean:
    rm -rf dist node_modules/.tmp

# Remove everything (node_modules included)
nuke:
    rm -rf dist node_modules
