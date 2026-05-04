# Deployment

Cloudflare Workers via Wrangler. `wrangler.jsonc` configures SPA fallback (`not_found_handling: "single-page-application"`).

## Commands

```bash
npm run preview   # build, then serve via wrangler dev (Cloudflare Workers runtime)
npm run deploy    # build and deploy to Cloudflare Workers
```

## Releases

Releases are cut by `semantic-release` from Conventional Commits (`.releaserc.json`); do **not** edit `CHANGELOG.md` or `package.json` `version` by hand.

## Environment

`.env.production` is committed and points the production build at `https://api.brolyu.com`. Vite picks it up automatically during `npm run build` / `npm run deploy`.
