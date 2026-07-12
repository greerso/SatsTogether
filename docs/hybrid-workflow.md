# Claude + Grok hybrid workflow (SatsTogether)

Hermes orchestrates. **Claude Code** plans and reviews. **Grok Build** implements.

## Why

- Save Claude tokens on long implement loops
- Keep Claude judgment on design and diffs
- One clean handoff path so both tools don’t thrash the same files

## Roles

| Role | Tool |
|------|------|
| Conductor | Hermes (optional) or you |
| Plan + review | Claude Code |
| Implement + cheap fixes | Grok Build |

## Quick start

From repo root:

```bash
# 1) Status / env check
./scripts/hybrid-pipeline.sh status

# 2) Plan (Claude) — pass the goal
./scripts/hybrid-pipeline.sh plan "Add unit tests for governance voting helpers"

# 3) Implement (Grok) from saved plan
./scripts/hybrid-pipeline.sh implement

# 4) Review (Claude) on current diff
./scripts/hybrid-pipeline.sh review

# 5) Optional: fix from last review notes via Grok
./scripts/hybrid-pipeline.sh fix
```

Artifacts land in `.hybrid/` (gitignored):

- `plan.md` — builder-ready plan
- `diff.patch` — last reviewed diff
- `review.md` — Blockers / Issues / Verdict

## Manual commands (if you skip the script)

```bash
export PROJECT=~/dev/Bitcoin/SatsTogether

# Plan
claude -p "Write a builder-ready plan only for: …" \
  --cwd "$PROJECT" --allowedTools 'Read,Bash,Glob,Grep' --max-turns 8

# Implement
grok -p "Implement this plan exactly: …" \
  --cwd "$PROJECT" --always-approve --max-turns 15 --effort high

# Review (diff only)
git -C "$PROJECT" diff > /tmp/st.diff
claude -p "Review this diff: Blockers/Issues/Improvements/Verdict" \
  --cwd "$PROJECT" --allowedTools 'Read,Bash' --max-turns 5
```

## Rules of thumb

1. Claude writes the plan; Grok executes it.
2. Claude reviews **diffs**, not “explore the whole repo again.”
3. One writer per branch (use a worktree if Claude session is still open).
4. After two Grok fix rounds without progress → Claude or human redesign.
5. Preserve prototype honesty: design goal ≠ implemented.

## Hermes

In a Hermes session:

```text
Load skill claude-grok-pipeline.
Hybrid mode on ~/dev/Bitcoin/SatsTogether.
Goal: <your goal>
```

Hermes should run plan → implement → review and report the Verdict.
