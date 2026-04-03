# Outcomes

A weighted multi-criteria decision analysis tool that helps break complex decisions into smaller, assessable pieces.

## Concept

When facing complex decisions with many variables, Outcomes helps by decomposing the problem into:

- **Options** -- the choices you're deciding between
- **Factors** -- the criteria you care about, each with a **priority** (how much you care) and **uncertainty** (how likely the score will change over time)
- **Alignments** -- how well each option delivers on each factor (-1 to +1)

The system computes a weighted score for each option, applying a decay function to account for uncertainty over a configurable time horizon:

```
Score(option, t) = Σ priority(f) × alignment(option, f) × (1 - uncertainty(f))^t
```

This reveals not just which option is best *today*, but how rankings shift as uncertain factors decay over time.

## Getting started

Requires [Bun](https://bun.sh) and [just](https://github.com/casey/just).

```sh
cd outcomes
bun install
just dev
```

## Commands

```
just help        # List all available commands
just dev         # Start dev server with hot reload
just build       # Build static output (HTML/JS/CSS) into dist/
just preview     # Preview the production build
just check       # Run type check + lint + tests
just clean       # Remove build artifacts
```

## Usage

1. **Add options** -- the choices you're evaluating
2. **Add factors** -- the criteria that matter to you, with priority and uncertainty sliders
3. **Set alignments** -- rate how well each option delivers on each factor
4. **View results** -- see ranked options, adjust the time horizon slider to see how rankings change over time
5. **Save/Open** -- download your scenario as JSON, load it back later

## Tech stack

- React + TypeScript
- Vite
- Tailwind CSS v4
- shadcn/ui
- Recharts
- Bun (runtime, package manager, test runner)
