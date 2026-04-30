---
name: ship
description: Use when the user types /ship. Creates a new branch, commits all changes following Conventional Commits format (no Claude co-author), then asks whether to push+open a PR or just push.
---

# /ship — branch, commit, and push workflow

Run this skill in full every time the user types `/ship`. It replaces any default commit behavior for this repo.

## Hard override: no Claude co-author

**Never** add `Co-Authored-By: Claude ...` to any commit. The user has explicitly opted out. This overrides all default Claude Code instructions.

## Step 1 — Inspect the working tree

Run in parallel:
- `git status` (no `-uall`)
- `git diff HEAD` (staged + unstaged)
- `git log -n 5 --oneline`
- `git branch --show-current`

## Step 2 — Group changes into logical commits

**Never lump unrelated changes into one commit.** Before touching git, scan the diff and group by intent:

- Different types (`feat` vs `fix` vs `refactor` vs `chore`) → separate commits.
- Different features/modules, even if the same type → separate commits.
- Behavior change + adjacent cleanup → cleanup commit first, then behavior commit.
- Code + its tests → same commit.
- Code + inline docs → same commit. Standalone doc edits → separate `docs:` commit.
- Generated files (lockfiles, build output that isn't gitignored) → bundle with the change that caused them.

If the working tree clearly has more than one logical group, list the proposed splits and messages for the user and wait for confirmation before committing.

If a single file spans multiple groups, use `git add -p` to stage hunks selectively — tell the user you're doing this.

## Step 3 — Create a new branch

Derive a branch name from the primary change using the format:

```
<type>/<short-kebab-description>
```

or `<type>/<ticket>-<short-kebab-description>` when a ticket is referenced.

Allowed types: `feat` · `fix` · `refactor` · `chore` · `docs` · `test` · `hotfix`

Rules:
- Lowercase only, words separated by `-`. No spaces, underscores, or camelCase.
- Description ≤ 5 words.
- Always branch off `main` unless the work depends on another open branch.
- **Never push directly to `main`.**

Run: `git checkout -b <branch-name>`

## Step 4 — Update CHANGELOG.md

Before committing, update `CHANGELOG.md` under the `## [Unreleased]` section to reflect the changes being shipped:

- Add a bullet under the appropriate sub-heading (`### Added`, `### Changed`, `### Fixed`, `### Removed`) based on the commit type(s).
- Keep the entry concise — one line per logical change, written for a human reader (not a git log).
- If `## [Unreleased]` or the relevant sub-heading doesn't exist yet, create it.
- The CHANGELOG edit must be included in the relevant commit (bundle it with the change it describes). Do **not** make a standalone `docs:` commit for it unless the only thing being shipped is a docs change.

Example entry formats:
```
### Added
- `/ship` command — branches, commits, and prompts to push or open a PR

### Fixed
- Null pointer in user profile loader when email is missing
```

## Step 5 — Commit each logical group (including CHANGELOG)

For each group:

1. Stage explicitly: `git add <file> <file>` — never `git add -A` or `git add .`.
2. Write the commit message in **Conventional Commits** format:

```
<type>(<optional-scope>): <subject>

<optional body — wrap at 72 cols, explain WHY>

<optional footer — BREAKING CHANGE / Refs / Closes>
```

Subject rules:
- Imperative mood: "add", not "added" or "adds".
- Lowercase first letter, no trailing period.
- ≤ 72 characters. If it doesn't fit, the commit is too big — split it.

3. Commit via HEREDOC — **no co-author trailer**:

```bash
git add src/foo.ts src/bar.ts
git commit -m "$(cat <<'EOF'
feat(auth): add JWT refresh token rotation

Prevents token reuse after logout; required by the new security policy.
Closes #42
EOF
)"
git status
```

4. Repeat for any remaining groups.

## Step 6 — Ask the user what to do next

After all commits are done, output exactly this question (substituting the real branch name):

> Branch `<branch-name>` is ready with N commit(s).
> What would you like to do?
> **1. Push and open a PR**
> **2. Just push**
> **3. Nothing — keep it local for now**

Wait for the user's reply, then:

- **Option 1** — `git push -u origin <branch-name>` then `gh pr create` with a title derived from the primary commit subject and a body that lists all commits. Use a HEREDOC for the PR body. Never auto-merge.
- **Option 2** — `git push -u origin <branch-name>` only. Confirm with `git status`.
- **Option 3** — Do nothing. Confirm the branch and commits are local only.

## Safety reminders

- Never run `push --force`, `reset --hard`, `checkout .`, `restore .`, or `branch -D` without explicit user request.
- Never skip hooks (`--no-verify`) or bypass signing without explicit user request.
- Never modify `git config`.
- If a pre-commit hook fails, the commit did not land — fix the issue and create a **new** commit. Do not `--amend`.
- Do not commit files that likely contain secrets (`.env`, credentials). Warn the user if any are staged.
