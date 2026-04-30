# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Start dev server at http://localhost:5173 with HMR
npm run build     # Type-check (tsc -b) then build for production
npm run lint      # Run ESLint across all .ts/.tsx files
npm run preview   # Serve the production build locally
```

Before submitting any change, ensure `npm run lint` and `npm run build` both pass with no errors.

There is no test runner configured yet.

## Environment

Copy `.env.example` to `.env.local` and fill in values. All env vars must be prefixed with `VITE_` to be exposed to the client. Key vars:

- `VITE_API_BASE_URL` — Brolyu backend URL (default `http://localhost:3000`)
- `VITE_STUN_SERVER_URL` / `VITE_TURN_SERVER_*` — WebRTC ICE server config
- `VITE_ENABLE_SCREEN_SHARE` / `VITE_ENABLE_VIDEO_CALL` — feature flags

## Architecture

React 19 + TypeScript SPA built with Vite. Entry point is `src/main.tsx` → `src/App.tsx`.

Styling uses **CSS Modules** (scoped per component). Avoid global class names. Global resets and design tokens live in `src/index.css`.

Static assets imported directly by components go in `src/assets/`. Files served as-is (no import required) go in `public/`. The SVG icon system uses a sprite at `public/icons.svg` consumed via `<use href="/icons.svg#<id>">`.

WebRTC (voice/video/screen share) is **planned but not yet implemented** — the `.env.example` stubs the ICE server config in anticipation.

## Code Conventions

**TypeScript** — strict mode enabled (`noUnusedLocals`, `noUnusedParameters`, `erasableSyntaxOnly`). Avoid `any`; use explicit types.

**React** — functional components only. `PascalCase` for components, `camelCase` for functions/variables, `SCREAMING_SNAKE_CASE` for constants.

**Imports order** — external packages → internal modules → styles.

**CSS** — CSS Modules or scoped styles only.

## Git Workflow

Branch naming: `feat/<name>`, `fix/<name>`, `refactor/<name>`, `chore/<name>`, `docs/<name>`, `test/<name>`, `hotfix/<name>`. Always branch from `main`.

Commits follow [Conventional Commits](https://www.conventionalcommits.org/): `<type>(<scope>): <summary>` — summary under 72 chars, imperative mood. Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`.

PRs must: link a related issue, pass lint + build, stay focused (one feature or fix), and have at least one maintainer review before merge.
