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
cd web-frontend

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
| `npm run dev` | Start the development server with HMR |
| `npm run build` | Type-check and build for production |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint across the codebase |

## Project Structure

```
web-frontend/
├── public/           # Static assets (favicon, svg sprites)
├── src/
│   ├── assets/       # Images and icons imported by components
│   ├── App.tsx       # Root application component
│   ├── main.tsx      # Entry point
│   └── index.css     # Tailwind import + global base styles
├── index.html        # HTML shell
├── vite.config.ts    # Vite configuration
└── tsconfig.json     # TypeScript configuration
```

## Contributing

We welcome contributions of all kinds — bug fixes, new features, documentation improvements, translations, and more. Please read our [Contributing Guide](CONTRIBUTING.md) to get started and our [Code of Conduct](CODE_OF_CONDUCT.md) before participating.

## Security

Found a vulnerability? Please follow our [Security Policy](SECURITY.md) and do **not** open a public issue.

## License

Brolyu is open source software licensed under the [MIT License](LICENSE).

---

Made with care by the Brolyu community.
