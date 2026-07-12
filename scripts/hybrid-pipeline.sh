#!/usr/bin/env bash
# Claude plan → Grok implement → Claude review pipeline for SatsTogether.
# Usage:
#   ./scripts/hybrid-pipeline.sh status
#   ./scripts/hybrid-pipeline.sh plan "goal text"
#   ./scripts/hybrid-pipeline.sh implement
#   ./scripts/hybrid-pipeline.sh review
#   ./scripts/hybrid-pipeline.sh fix
set -euo pipefail

PROJECT="$(cd "$(dirname "$0")/.." && pwd)"
HYBRID="$PROJECT/.hybrid"
mkdir -p "$HYBRID"

die() { echo "error: $*" >&2; exit 1; }

need_cmd() {
  command -v "$1" >/dev/null 2>&1 || die "missing command: $1"
}

cmd_status() {
  echo "PROJECT=$PROJECT"
  echo -n "claude: "; claude --version 2>/dev/null || echo "NOT FOUND"
  echo -n "grok:   "; grok --version 2>/dev/null || echo "NOT FOUND"
  echo -n "git:    "; git -C "$PROJECT" status -sb
  echo "artifacts:"
  ls -la "$HYBRID" 2>/dev/null || true
}

cmd_plan() {
  need_cmd claude
  local goal="${1:-}"
  if [[ -z "$goal" ]]; then
    if [[ -f "$HYBRID/goal.txt" ]]; then
      goal="$(cat "$HYBRID/goal.txt")"
    else
      die "usage: $0 plan \"your goal\"  (or put text in .hybrid/goal.txt)"
    fi
  fi
  printf '%s\n' "$goal" > "$HYBRID/goal.txt"

  local prompt
  prompt=$(cat <<EOF
Write a BUILDER-READY plan only. Do not implement.

Project: SatsTogether at $PROJECT
Early Bitcoin L1 prize-savings prototype (Taproot Assets + BitVM2 design; UI mockup). Unaudited. No real funds. Distinguish design goals vs implemented.

User goal:
$goal

Output exactly these sections:
## Goal
## Non-goals
## Files to touch (paths)
## Implementation steps (ordered, concrete)
## Verification commands
## Risks (funds safety, honesty about mock vs real)
## Out of scope

Be specific enough that Grok Build can execute without redesigning.
EOF
)

  echo "→ Claude planning (max 8 turns)…"
  claude -p "$prompt" \
    --cwd "$PROJECT" \
    --allowedTools 'Read,Bash,Glob,Grep' \
    --max-turns 8 \
    --effort medium \
    | tee "$HYBRID/plan.md"

  echo "✓ plan saved: $HYBRID/plan.md"
}

cmd_implement() {
  need_cmd grok
  [[ -f "$HYBRID/plan.md" ]] || die "no plan — run: $0 plan \"goal\""

  local plan
  plan="$(cat "$HYBRID/plan.md")"

  local prompt
  prompt=$(cat <<EOF
Implement the following plan EXACTLY. Do not redesign architecture.
Do not invent mainnet/real-funds paths. Preserve prototype honesty (mock vs design goal).

Working directory: $PROJECT

PLAN:
$plan

When done:
1. Summarize files changed
2. Run verification commands from the plan (if any)
3. Report failures honestly
EOF
)

  echo "→ Grok implementing (max 15 turns)…"
  grok -p "$prompt" \
    --cwd "$PROJECT" \
    --always-approve \
    --max-turns 15 \
    --effort high \
    | tee "$HYBRID/implement.log"

  echo "✓ implement log: $HYBRID/implement.log"
  git -C "$PROJECT" status -sb
}

cmd_review() {
  need_cmd claude
  cd "$PROJECT"

  # Prefer staged+unstaged working tree; fall back to unstaged only
  if ! git diff HEAD > "$HYBRID/diff.patch" 2>/dev/null; then
    die "git diff failed"
  fi

  if [[ ! -s "$HYBRID/diff.patch" ]]; then
    # try vs main/master
    if git rev-parse --verify main >/dev/null 2>&1; then
      git diff main...HEAD > "$HYBRID/diff.patch" || true
    elif git rev-parse --verify master >/dev/null 2>&1; then
      git diff master...HEAD > "$HYBRID/diff.patch" || true
    fi
  fi

  [[ -s "$HYBRID/diff.patch" ]] || die "empty diff — nothing to review"

  # Cap huge diffs for prompt safety (~200k chars)
  local diff_body
  if [[ $(wc -c < "$HYBRID/diff.patch") -gt 200000 ]]; then
    diff_body="$(git diff --stat HEAD; echo; head -c 150000 "$HYBRID/diff.patch"; echo; echo '… [truncated]')"
  else
    diff_body="$(cat "$HYBRID/diff.patch")"
  fi

  local prompt
  prompt=$(cat <<EOF
Review this git diff for SatsTogether (Bitcoin prize-savings prototype).

Lenses: Correctness, Internal Consistency, Completeness, Implementation Risk,
funds-safety honesty (no real-funds paths), multi-user safety if applicable.

Output:
## Blockers (must fix before merge)
## Issues (should fix)
## Improvements (optional)
## Verdict: merge-ready | needs-fix | redesign

For each Blocker, give a concrete fix instruction a builder can apply.
Do NOT reimplement the whole feature.

DIFF:
$diff_body
EOF
)

  echo "→ Claude reviewing diff (max 5 turns)…"
  claude -p "$prompt" \
    --cwd "$PROJECT" \
    --allowedTools 'Read,Bash' \
    --max-turns 5 \
    | tee "$HYBRID/review.md"

  echo "✓ review saved: $HYBRID/review.md"
}

cmd_fix() {
  need_cmd grok
  [[ -f "$HYBRID/review.md" ]] || die "no review — run: $0 review"

  local review plan
  review="$(cat "$HYBRID/review.md")"
  plan=""
  [[ -f "$HYBRID/plan.md" ]] && plan="$(cat "$HYBRID/plan.md")"

  local prompt
  prompt=$(cat <<EOF
Apply concrete fixes from the review below. Do not redesign.
Preserve prototype honesty. Working directory: $PROJECT

ORIGINAL PLAN (context):
$plan

REVIEW (fix Blockers and Issues with concrete instructions):
$review

When done: summarize changes and re-run any relevant checks.
EOF
)

  echo "→ Grok fixing from review (max 8 turns)…"
  grok -p "$prompt" \
    --cwd "$PROJECT" \
    --always-approve \
    --max-turns 8 \
    --effort high \
    | tee "$HYBRID/fix.log"

  echo "✓ fix log: $HYBRID/fix.log"
  echo "Re-run: $0 review"
}

usage() {
  cat <<EOF
Usage: $0 <command> [args]

Commands:
  status              Check CLIs + git + .hybrid artifacts
  plan "goal text"    Claude → .hybrid/plan.md
  implement           Grok → execute plan
  review              Claude → review working tree / branch diff
  fix                 Grok → apply review Blockers/Issues

Default project: $PROJECT
Docs: docs/hybrid-workflow.md
EOF
}

main() {
  local cmd="${1:-}"
  shift || true
  case "$cmd" in
    status) cmd_status "$@" ;;
    plan) cmd_plan "$@" ;;
    implement) cmd_implement "$@" ;;
    review) cmd_review "$@" ;;
    fix) cmd_fix "$@" ;;
    -h|--help|help|"") usage ;;
    *) die "unknown command: $cmd (try: status|plan|implement|review|fix)" ;;
  esac
}

main "$@"
