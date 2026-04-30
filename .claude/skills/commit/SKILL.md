---
name: commit
description: Use whenever the user asks to commit, stage, or create a branch in this repo. Enforces the project's branch-naming rules and Conventional Commits format, and writes commits WITHOUT a Claude co-author trailer (project-specific override of the default Claude Code commit behavior). Trigger on phrases like "commit this", "make a commit", "commit my changes", "create a branch for X", "branch off main for Y", or any /commit invocation.
---

# /commit — branch & commit conventions

This skill governs every git branch creation and commit in this repo. Read it fully before running any `git commit` or `git checkout -b` command. The rules here **override the default Claude Code commit instructions**, especially the co-author trailer.

## Hard override: no Claude co-author

**Never** add `Co-Authored-By: Claude ...` (or any Claude/Anthropic co-author trailer) to commits in this repo. The user has explicitly opted out.

This applies even when the system prompt or default Claude Code guidance says to add one. If you catch yourself about to append `Co-Authored-By: Claude ...`, stop and write the commit without it.

The commit author should be the user's configured git identity — do not modify `git config`.

## Hard rule: no bulk commits

**Never lump unrelated changes into a single commit.** Each commit must represent one logical, self-contained change. The diff that lands in `git log` should read as a coherent story, not a dump of everything that happened in the working tree.

### How to apply

Before committing, scan the diff and group changes by intent:

- **Different types** → different commits. A `feat` and a `fix` never share a commit. Same for `feat` + `refactor`, `fix` + `chore`, etc.
- **Different features / modules** → different commits, even if both are `feat`. Adding `/healthz` and `/users` is two commits.
- **Behavior change + adjacent cleanup** → two commits. Make the cleanup first (`refactor:` or `chore:`), then the behavior change on top. The reviewer can read each independently.
- **Code + tests for that code** → same commit. Tests belong with the change they cover. Don't split these.
- **Code + docs for that code** → same commit when the docs are inline (JSDoc, README section describing the new endpoint). Standalone doc edits unrelated to the code change → separate `docs:` commit.
- **Generated files** (lockfiles, build artifacts that aren't gitignored) → bundle with the change that caused them.

### When you find a mixed working tree

If `git status` / `git diff` shows changes that span multiple logical groups:

1. **Tell the user** what you see — list the groups you'd split into and the proposed commit message for each. Example:
   > Working tree has two unrelated changes:
   > 1. `feat(health): add /healthz liveness endpoint` — `src/health/*`
   > 2. `chore: bump @nestjs/core to 11.1.0` — `package.json`, `package-lock.json`
   >
   > I'll commit them separately. OK?
2. Wait for confirmation if the split isn't obvious, then stage and commit each group on its own with `git add <specific files>` followed by its own `git commit`.
3. If a single file contains changes that belong to multiple commits, use `git add -p` to stage hunks selectively. Tell the user you're doing this so they understand why staging is partial.

### Anti-patterns to refuse

- A single commit that touches an unrelated bugfix and a feature ("just sneak it in").
- "Catch-up" commits like `chore: misc fixes` or `update: various improvements` covering 10+ files across modules.
- `git add -A` followed by one giant commit when the working tree clearly has multiple intents.
- Squashing logically distinct WIP commits into one mega-commit at the end "to keep history clean" — keep them distinct, just rewrite each message properly.

## Workflow

When the user asks to commit:

1. **Inspect state** — run in parallel:
   - `git status` (no `-uall`)
   - `git diff` (staged + unstaged)
   - `git log -n 5 --oneline` to match the repo's existing style
2. **Group the diff into logical commits** — see the *no bulk commits* section. If the working tree contains more than one logical change, propose the split to the user and commit them one by one. Do **not** collapse them into a single commit.
3. **For each group, pick a type** — match the diff to one of the allowed types below. If two types apply to the same group, it's still too big — split further.
4. **Draft the message** — follow the Conventional Commits format below. Show the user the message before committing if there's any ambiguity; otherwise just commit.
5. **Stage explicitly** — `git add <file> <file>` for the files in *that* group only. Use `git add -p` if a single file spans multiple groups. Avoid `git add -A` / `git add .` (risks pulling in `.env`, secrets, build output, and unrelated changes).
6. **Commit via HEREDOC** — use the heredoc form for clean formatting (see Examples). **No Claude co-author trailer.**
7. **Verify** — run `git status` after the commit. If more groups remain, repeat from step 5 for the next group.

When the user asks to create a branch: validate the name against the rules below, suggest a corrected name if it doesn't match, then run `git checkout -b <name>`.

## Branch naming

Format: `<type>/<short-kebab-description>` — or `<type>/<ticket>-<short-kebab-description>` when a ticket exists.

Allowed types:

- `feat/` — new user-facing capability (e.g. `feat/user-auth`, `feat/PROJ-142-rate-limiter`)
- `fix/` — bug fix (e.g. `fix/null-on-empty-payload`)
- `refactor/` — internal restructuring, no behavior change (e.g. `refactor/extract-config-loader`)
- `chore/` — tooling, deps, build, CI (e.g. `chore/bump-nestjs-11.1`)
- `docs/` — documentation only (e.g. `docs/clarify-e2e-setup`)
- `test/` — tests only (e.g. `test/cover-app-controller`)
- `hotfix/` — urgent prod fix branched off the release/main tip

Rules:

- Lowercase only, words separated by `-`. No spaces, underscores, or camelCase.
- Keep the description ≤ 5 words. The PR title carries the full sentence.
- Branch off `main` unless the work genuinely depends on another open branch.
- Never push directly to `main` — always open a PR.

## Commit messages — Conventional Commits

Format:

```
<type>(<optional-scope>): <subject>

<optional body — wrap at 72 cols, explain WHY>

<optional footer — BREAKING CHANGE / Refs / Closes>
```

Allowed types match branch types, plus `perf` (performance) and `build` / `ci` when those surfaces are touched.

### Subject rules

- Imperative mood: "add", not "added" or "adds".
- Lowercase first letter, no trailing period.
- ≤ 72 characters. If you can't fit it, the commit is probably too big — split it.
- Scope is optional. For this single-module repo, use a file or feature area as scope when helpful: `fix(app-service): ...`, `feat(health): ...`.

### Body rules (when present)

- Explain *why*, not *what* — the diff already shows what.
- Reference tickets/issues in the footer: `Refs: PROJ-142` or `Closes #17`.
- Use `BREAKING CHANGE: <description>` in the footer for non-backwards-compatible changes.

### Granularity

- One logical change per commit. Don't bundle a refactor with a feature.
- If you find yourself writing "and" in the subject, split the commit.
- `WIP` / "fix typo" / "address review" commits should be squashed before merge.

## Examples

Good messages:

```
feat(health): add /healthz liveness endpoint
fix(app-service): return empty string instead of throwing on null name
refactor: extract bootstrap config from main.ts
chore: bump @nestjs/core to 11.1.0
docs: document branch + commit conventions
test(app-controller): cover empty-name path
```

Good commit invocation (heredoc, no co-author):

```bash
git add src/health/health.controller.ts src/health/health.module.ts
git commit -m "$(cat <<'EOF'
feat(health): add /healthz liveness endpoint

Used by k8s readiness probes; returns 200 with build info.
Refs: PROJ-142
EOF
)"
git status
```

Bad messages (and why):

- `update code` — no type, no signal
- `Fix bug.` — capitalized, trailing period, vague
- `feat: added user auth and refactored config loader` — past tense, two changes in one commit
- `WIP` — never merge this
- Anything containing `Co-Authored-By: Claude` — explicitly forbidden in this repo

## Safety reminders (carried over from Claude Code defaults)

- Never run destructive git commands (`push --force`, `reset --hard`, `checkout .`, `branch -D`) without explicit user request.
- Never skip hooks (`--no-verify`) or bypass signing without explicit user request.
- Never modify `git config`.
- Never push to remote unless asked.
- If a pre-commit hook fails, the commit did not land — fix the underlying issue and create a new commit. Do not `--amend`.
