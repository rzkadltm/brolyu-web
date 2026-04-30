# Contributing to Brolyu

Thank you for your interest in contributing to Brolyu! Every contribution — no matter how small — helps us build a better platform for connecting people around the world.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Ways to Contribute](#ways-to-contribute)
- [Development Setup](#development-setup)
- [Branching & Workflow](#branching--workflow)
- [Commit Messages](#commit-messages)
- [Pull Request Process](#pull-request-process)
- [Reporting Bugs](#reporting-bugs)
- [Suggesting Features](#suggesting-features)
- [Style Guide](#style-guide)

---

## Code of Conduct

By participating in this project you agree to abide by our [Code of Conduct](CODE_OF_CONDUCT.md). Please read it before contributing.

---

## Ways to Contribute

- **Bug reports** — Open an issue using the Bug Report template
- **Feature requests** — Open an issue using the Feature Request template
- **Code contributions** — Fix bugs or implement features via pull requests
- **Documentation** — Improve or translate the docs and README
- **Design** — Propose UI/UX improvements through issues with mockups
- **Testing** — Add or improve test coverage
- **Triage** — Help reproduce bugs and label open issues

---

## Development Setup

```bash
# 1. Fork the repo on GitHub, then clone your fork
git clone git@github.com:<your-username>/brolyu-web.git
cd web-frontend

# 2. Add the upstream remote
git remote add upstream git@github.com:rzkadltm/brolyu-web.git

# 3. Install dependencies
npm install

# 4. Copy environment variables
cp .env.example .env.local

# 5. Start the dev server
npm run dev
```

Before submitting a PR, make sure all checks pass locally:

```bash
npm run lint
npm run build
```

---

## Branching & Workflow

| Branch | Purpose | Example |
|---|---|---|
| `main` | Stable, always deployable | — |
| `feat/<name>` | New user-facing capability | `feat/user-auth`, `feat/PROJ-142-rate-limiter` |
| `fix/<name>` | Bug fix | `fix/null-on-empty-payload` |
| `refactor/<name>` | Internal restructuring, no behaviour change | `refactor/extract-config-loader` |
| `chore/<name>` | Tooling, deps, build, CI | `chore/bump-nestjs-11.1` |
| `docs/<name>` | Documentation only | `docs/clarify-e2e-setup` |
| `test/<name>` | Tests only | `test/cover-app-controller` |
| `hotfix/<name>` | Urgent prod fix branched off `main` | `hotfix/broken-login-redirect` |

1. Create your branch from the latest `main`:
   ```bash
   git fetch upstream
   git checkout -b feat/my-feature upstream/main
   ```
2. Make your changes in focused, logical commits.
3. Push to your fork and open a pull request against `main`.

---

## Commit Messages

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>(<scope>): <short summary>

[optional body]

[optional footer]
```

**Types:** `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

**Examples:**

```
feat(rooms): add mute toggle for voice calls
fix(auth): handle expired session tokens gracefully
docs(contributing): add branching guidelines
```

Keep the summary under 72 characters and write in the imperative mood ("add", not "added" or "adds").

---

## Pull Request Process

1. Fill in the pull request template completely.
2. Link the related issue (e.g. `Closes #42`).
3. Ensure `npm run lint` and `npm run build` pass with no errors.
4. Keep PRs focused — one feature or fix per PR.
5. Add or update tests if your change affects logic.
6. Request a review from at least one maintainer.
7. Maintainers may request changes; address them and re-request review.
8. Once approved, a maintainer will merge your PR.

---

## Reporting Bugs

Open an issue using the **Bug Report** template and include:

- A clear, descriptive title
- Steps to reproduce the issue
- Expected vs. actual behaviour
- Browser, OS, and Node version
- Screenshots or screen recordings if applicable

---

## Suggesting Features

Open an issue using the **Feature Request** template and describe:

- The problem you are trying to solve
- Your proposed solution and alternatives you considered
- Any mockups or references

---

## Style Guide

- **TypeScript** — Strict mode is enabled. Avoid `any`; prefer explicit types.
- **React** — Functional components only. Keep components small and focused.
- **CSS** — Use CSS Modules or scoped styles. Avoid global class name collisions.
- **Naming** — `PascalCase` for components, `camelCase` for functions and variables, `SCREAMING_SNAKE_CASE` for constants.
- **Imports** — Sort: external packages → internal modules → styles.
- **No dead code** — Remove console logs, commented-out code, and unused imports before submitting.

---

If you have any questions, open a discussion or reach out in our community channels. We're happy to help!
