# Brolyu — Web Frontend

> Connect, learn, and play together through voice, video, and screen sharing.

Brolyu is an open-source social platform that brings people together through real-time communication. Make new friends, practice languages with native speakers, play games side by side, and share your screen — all in one place.

---

## Features

- **Voice & Video Calls** — High-quality peer-to-peer calls powered by WebRTC
- **Screen Sharing** — Share your screen for gaming, studying, or co-working sessions
- **Language Learning** — Connect with native speakers and language partners worldwide
- **Game Together** — Join rooms to play, watch, and react together in real time
- **Friend Discovery** — Find people who share your interests, language goals, or favourite games
- **Rooms & Communities** — Create public or private rooms around any topic

## Tech Stack

| Layer | Technology |
|---|---|
| UI Framework | React 19 + TypeScript |
| Build Tool | Vite |
| Styling | Tailwind CSS v4 |
| Routing | React Router v7 |
| Animation | Motion |
| SEO | React Helmet Async |
| Hosting | Cloudflare Workers (via Wrangler) |
| Releases | semantic-release |
| Real-time | WebRTC (planned) |
| Linting | ESLint + typescript-eslint |

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) >= 20
- [npm](https://www.npmjs.com/) >= 10 (or your preferred package manager)

### Installation

```bash
# Clone the repository
git clone git@github.com:rzkadltm/brolyu-web.git
cd brolyu-web

# Install dependencies
npm install

# Copy environment template
cp .env.example .env.local

# Start the development server
npm run dev
```

The app will be available at `http://localhost:5173`.

### Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the Vite dev server with HMR |
| `npm run build` | Type-check (`tsc -b`) then build for production |
| `npm run preview` | Build, then serve via `wrangler dev` (Workers runtime) |
| `npm run deploy` | Build and deploy to Cloudflare Workers |
| `npm run lint` | Run ESLint across the codebase |

## Project Structure

```
brolyu-web/
├── public/             # Static assets served as-is (favicon, icons.svg sprite, robots, sitemap)
├── src/
│   ├── assets/         # Images and icons imported by components
│   ├── components/     # Shared UI (Avatar, Chip, IconRail, SearchInput, SEO, RequireAuth)
│   ├── contexts/       # AuthProvider, ThemeProvider and their hooks
│   ├── data/           # Static fixtures (e.g. rooms.ts)
│   ├── features/       # Feature-scoped UI (discover, profile)
│   ├── layouts/        # Route layouts (AppShell)
│   ├── lib/            # Cross-cutting helpers (api.ts client + token store)
│   ├── pages/          # Top-level routed pages (Home, Auth, App, Messages, Room, …)
│   ├── App.tsx         # Routing tree
│   ├── main.tsx        # Entry point (mounts providers)
│   └── index.css       # Tailwind import, design tokens, base layer
├── index.html          # HTML shell
├── vite.config.ts      # Vite configuration
├── wrangler.jsonc      # Cloudflare Workers configuration
└── tsconfig*.json      # TypeScript project references
```

## Contributing

We welcome contributions of all kinds — bug fixes, new features, documentation improvements, translations, and more. Please read our [Contributing Guide](CONTRIBUTING.md) to get started and our [Code of Conduct](CODE_OF_CONDUCT.md) before participating.

## Security

Found a vulnerability? Please follow our [Security Policy](SECURITY.md) and do **not** open a public issue.

## License

Brolyu is open source software licensed under the [MIT License](LICENSE).

---

Made with care by the Brolyu community.
