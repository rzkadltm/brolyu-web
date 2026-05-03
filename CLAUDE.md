# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Start Vite dev server at http://localhost:5173 with HMR
npm run build     # Type-check (tsc -b) then build for production
npm run lint      # Run ESLint across all .ts/.tsx files
npm run preview   # Build, then serve via wrangler dev (Cloudflare Workers runtime)
npm run deploy    # Build and deploy to Cloudflare Workers
```

Before submitting any change, ensure `npm run lint` and `npm run build` both pass with no errors.

There is no test runner configured yet.

## Environment

Copy `.env.example` to `.env.local` and fill in values. All env vars must be prefixed with `VITE_` to be exposed to the client. Key vars:

- `VITE_API_BASE_URL` — Brolyu backend URL (default `http://localhost:3000`)
- `VITE_STUN_SERVER_URL` / `VITE_TURN_SERVER_*` — WebRTC ICE server config
- `VITE_ENABLE_SCREEN_SHARE` / `VITE_ENABLE_VIDEO_CALL` — feature flags

`.env.production` is committed and points the production build at `https://api.brolyu.com`. Vite picks it up automatically during `npm run build` / `npm run deploy`.

## Architecture

React 19 + TypeScript SPA built with Vite. Entry point is `src/main.tsx` → `src/App.tsx`.

**Source layout** — top-level pages live in `src/pages/`, composable UI in `src/components/`, route layouts in `src/layouts/` (`AppShell` wraps the authed routes), feature-scoped UI in `src/features/<feature>/`, React contexts and their hooks in `src/contexts/`, the API client in `src/lib/api.ts`, and static fixtures in `src/data/`.

**Routing** — `react-router-dom` v7. The route tree is declared in `src/App.tsx`: `/` (Home), `/auth` + `/auth/callback` (sign-in + OAuth return), and an authed branch under `<AppShell>` containing `/app`, `/messages`, `/profile`, and `/room/:id`. Authed routes are gated by `<RequireAuth>` from `src/components/RequireAuth.tsx`. `/app` is intentionally guest-accessible.

**Auth** — `AuthProvider` (`src/contexts/AuthProvider.tsx`) hydrates the current user from a bearer token in `localStorage` (`brolyu_token`) by calling `GET /api/v1/auth/me`. Sign-in is **Google OAuth only** — the client redirects to `${VITE_API_BASE_URL}/api/v1/auth/oauth/google`, the backend handles the exchange, and `AuthCallback` applies the returned token. Email/password code paths exist but are commented out. Use the `useAuth()` hook from `src/contexts/useAuth.ts` to read user state and call sign-in/profile/avatar mutations.

**API client** — `src/lib/api.ts` exposes a single `api` object plus `tokenStore`, `ApiError`, and shared types (`User`, `AuthSuccess`). It auto-attaches `Authorization: Bearer <token>` and base-URLs every request against `${VITE_API_BASE_URL}/api/v1` — the prefix is baked into the `BASE` constant, so paths in the file are written as `/auth/me`, `/auth/oauth/:provider`, etc. The server mounts unversioned operational probes (`/`, `/health`) and a legacy `/auth/google*` alias outside this prefix; if you ever need to call those, do it directly rather than going through `BASE`. Add new endpoints to this file, not via ad-hoc `fetch` calls.

**Styling** — **Tailwind CSS v4** (via `@tailwindcss/vite`). Use Tailwind utility classes directly in JSX. Design tokens (colors, shadows, fonts) are defined in `@theme` in `src/index.css` and are available as both Tailwind utilities (e.g. `text-accent`, `bg-border`) and CSS variables (e.g. `var(--color-accent)`). Dark mode is handled via `@media (prefers-color-scheme: dark)` overriding the same CSS variables. Only add CSS to `src/index.css` `@layer base` for styles that genuinely cannot be expressed as utilities (e.g. pseudo-element tricks, element-level resets).

**SEO** — `react-helmet-async` via the `<SEO>` component in `src/components/SEO.tsx`. Apply per-page; pass `noIndex` for auth/private routes. `public/sitemap.xml`, `public/robots.txt`, and `public/og-image.svg` back this up.

**Animation** — `motion` (Framer Motion successor). Import directly where needed; no global wrapper.

**Static assets** — Files imported by components go in `src/assets/`. Files served as-is go in `public/`. The SVG icon system uses a sprite at `public/icons.svg` consumed via `<use href="/icons.svg#<id>">`.

**Deployment** — Cloudflare Workers via Wrangler. `wrangler.jsonc` configures SPA fallback (`not_found_handling: "single-page-application"`). `npm run preview` builds and runs the Worker locally; `npm run deploy` ships it. Releases are cut by `semantic-release` from Conventional Commits (`.releaserc.json`); do **not** edit `CHANGELOG.md` or `package.json` `version` by hand.

**WebRTC** — voice/video/screen share is **planned but not yet implemented**. `.env.example` stubs the ICE server config in anticipation.

## Code Conventions

**TypeScript** — strict mode enabled (`noUnusedLocals`, `noUnusedParameters`, `erasableSyntaxOnly`). Avoid `any`; use explicit types.

**React** — functional components only. `PascalCase` for components, `camelCase` for functions/variables, `SCREAMING_SNAKE_CASE` for constants.

**Imports order** — external packages → internal modules → styles.

**CSS** — Tailwind utility classes in JSX. No CSS Modules or separate `.css` files per component. Scoped overrides go in `src/index.css` `@layer base` only when necessary.

## Git Workflow

Branch naming: `feat/<name>`, `fix/<name>`, `refactor/<name>`, `chore/<name>`, `docs/<name>`, `test/<name>`, `hotfix/<name>`. Always branch from `main`.

Commits follow [Conventional Commits](https://www.conventionalcommits.org/): `<type>(<scope>): <summary>` — summary under 72 chars, imperative mood. Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`.

PRs must: link a related issue, pass lint + build, stay focused (one feature or fix), and have at least one maintainer review before merge.
