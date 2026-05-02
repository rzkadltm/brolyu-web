import { useState, useEffect, useRef, useCallback } from 'react'
import { SEO } from '../components/SEO'

const HOME_JSON_LD = [
  {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Brolyu — Make Friends, Learn Languages & Game Together',
    url: 'https://brolyu.com/',
    description:
      'Join Brolyu to connect with people worldwide through live voice rooms. Make friends, learn languages, study together, and play games — all in real-time.',
    isPartOf: { '@type': 'WebSite', url: 'https://brolyu.com' },
  },
  {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'What is Brolyu?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Brolyu is a platform that connects people worldwide through live voice rooms. You can make new friends, practice languages with native speakers, study together, and play voice games — all in real-time.',
        },
      },
      {
        '@type': 'Question',
        name: 'Is Brolyu free to use?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes, Brolyu is completely free. You can join and create voice rooms, connect with people globally, and access all core features at no cost.',
        },
      },
      {
        '@type': 'Question',
        name: 'How can I learn a language on Brolyu?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Brolyu connects you with native speakers through language exchange voice rooms. Practice real conversations, get real-time pronunciation feedback, and follow structured lessons while making friends who speak your target language.',
        },
      },
      {
        '@type': 'Question',
        name: 'Can I make friends on Brolyu?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Absolutely. Brolyu matches you with people based on shared interests. Join interest-based voice rooms, participate in spontaneous hangouts, and build lasting friendships through real voice conversations.',
        },
      },
      {
        '@type': 'Question',
        name: 'What kind of games can I play on Brolyu?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Brolyu offers voice-first multiplayer mini-games including word games, trivia battles, and voice challenges. Compete in weekly tournaments with global leaderboards or create custom game rooms for your friends.',
        },
      },
      {
        '@type': 'Question',
        name: 'How do I study with others on Brolyu?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Join or create study rooms with shared whiteboards and AI tutor support available 24/7. Study any subject, track streaks with friends, and stay motivated with a global community of learners.',
        },
      },
    ],
  },
]

// ── Types ──────────────────────────────────────────────────────────────────

interface UseCase {
  id: string
  label: string
  heading: string
  body: string
  points: string[]
}

interface UcUser {
  initials: string
  color: string
  name: string
  detail: string
  badge: string
  badgeStyle: 'study' | 'lang' | 'game'
}

// ── Data ───────────────────────────────────────────────────────────────────

const USE_CASES: UseCase[] = [
  {
    id: 'study',
    label: 'Study',
    heading: 'Your AI-powered\nstudy partner',
    body: "Connect with learners worldwide and get instant AI support. Whether you're cramming for exams or exploring new subjects, Brolyu keeps you motivated.",
    points: [
      'AI tutor available 24/7 for any subject',
      'Study rooms with shared whiteboards',
      'Track streaks and progress with friends',
    ],
  },
  {
    id: 'language',
    label: 'Languages',
    heading: 'Speak fluently\nfaster',
    body: 'Language exchange meets AI coaching. Practice speaking with native speakers in real conversations, get instant feedback, and level up naturally.',
    points: [
      'Match with native speakers in seconds',
      'Real-time pronunciation feedback',
      'Structured lessons + free conversation',
    ],
  },
  {
    id: 'games',
    label: 'Games',
    heading: 'Voice games\nthat connect',
    body: 'Play word games, trivia battles, and voice challenges with strangers who become friends. Compete, laugh, and level up together.',
    points: [
      'Voice-first multiplayer mini-games',
      'Weekly tournaments with global leaderboards',
      'Custom game rooms for friend groups',
    ],
  },
  {
    id: 'friends',
    label: 'Friends',
    heading: 'Meet people who\nget you',
    body: "Find your people based on interests, not algorithms. Real voice conversations that go deeper than text ever could.",
    points: [
      'Interest-based smart matching',
      'Voice rooms for spontaneous hangouts',
      'Stay close with friend circles',
    ],
  },
]

const UC_USERS: Record<string, UcUser[]> = {
  study: [
    { initials: 'AK', color: '#6366f1', name: 'Aiko', detail: 'Studying Linear Algebra', badge: 'Study', badgeStyle: 'study' },
    { initials: 'MR', color: '#8b5cf6', name: 'Marco', detail: 'Preparing for IELTS', badge: 'Language', badgeStyle: 'lang' },
    { initials: 'JS', color: '#a78bfa', name: 'Ji-su', detail: 'React fundamentals', badge: 'Study', badgeStyle: 'study' },
  ],
  language: [
    { initials: 'YU', color: '#06b6d4', name: 'Yuna', detail: 'Native JP · Learning EN', badge: 'Exchange', badgeStyle: 'lang' },
    { initials: 'PL', color: '#0ea5e9', name: 'Pablo', detail: 'Native ES · Learning JP', badge: 'Exchange', badgeStyle: 'lang' },
    { initials: 'EL', color: '#38bdf8', name: 'Elena', detail: 'Native RU · Learning ES', badge: 'Exchange', badgeStyle: 'lang' },
  ],
  games: [
    { initials: 'ZX', color: '#ec4899', name: 'Zara', detail: 'Word Blitz · #4 Global', badge: 'Gaming', badgeStyle: 'game' },
    { initials: 'KO', color: '#f43f5e', name: 'Kofi', detail: 'Voice Trivia · 1,240 pts', badge: 'Gaming', badgeStyle: 'game' },
    { initials: 'TM', color: '#e11d48', name: 'Tomás', detail: 'Waiting for opponent', badge: 'Gaming', badgeStyle: 'game' },
  ],
  friends: [
    { initials: 'NL', color: '#f59e0b', name: 'Nadia', detail: 'Music · travel · anime', badge: 'Online', badgeStyle: 'lang' },
    { initials: 'BO', color: '#f97316', name: 'Bo', detail: 'Photography · coffee · tech', badge: 'Online', badgeStyle: 'lang' },
    { initials: 'IW', color: '#fb923c', name: 'Iwa', detail: 'Gaming · cooking · cats', badge: 'Away', badgeStyle: 'study' },
  ],
}

const BADGE_CLASSES: Record<UcUser['badgeStyle'], string> = {
  study: 'bg-[oklch(62%_0.22_265_/_0.14)] text-[oklch(62%_0.22_265)]',
  lang: 'bg-[oklch(68%_0.18_150_/_0.14)] text-[oklch(68%_0.18_150)]',
  game: 'bg-[oklch(62%_0.22_320_/_0.14)] text-[oklch(62%_0.22_320)]',
}

// ── Sub-components ─────────────────────────────────────────────────────────

function WebMockup() {
  const rooms = [
    { emoji: '🇯🇵', name: 'JP ↔ EN', sub: '12 online', active: true },
    { emoji: '🇪🇸', name: 'ES ↔ EN', sub: '8 online' },
    { emoji: '📚', name: 'Study Hall', sub: '34 online', unread: 3 },
    { emoji: '🎮', name: 'Word Blitz', sub: 'Live now' },
    { emoji: '🤖', name: 'AI Tutor', sub: 'Always open' },
  ]

  return (
    <div
      className="absolute left-0 top-5 rounded-[18px] overflow-hidden border"
      style={{
        width: 'calc(100% - 130px)',
        background: 'var(--mock-bg)',
        borderColor: 'var(--border)',
        boxShadow: '0 32px 80px rgba(0,0,0,0.3)',
      }}
    >
      {/* Browser chrome */}
      <div
        className="h-9 flex items-center gap-2.5 px-3.5 border-b"
        style={{ background: 'var(--bg2)', borderColor: 'var(--border2)' }}
      >
        <div className="flex gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
          <div className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
          <div className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
        </div>
        <div
          className="flex-1 max-w-[240px] mx-auto h-5 rounded-md border flex items-center justify-center text-[10px]"
          style={{ background: 'var(--surface)', borderColor: 'var(--border2)', color: 'var(--text-dim)' }}
        >
          brolyu.app/language-exchange
        </div>
      </div>

      {/* Body: sidebar + chat + AI panel */}
      <div className="grid h-[380px]" style={{ gridTemplateColumns: '200px 1fr 180px' }}>
        {/* Sidebar */}
        <div
          className="flex flex-col gap-1.5 p-3.5 border-r"
          style={{ background: 'var(--mock-sidebar)', borderColor: 'var(--border2)' }}
        >
          <div
            className="text-[9px] uppercase tracking-[1.5px] px-2 py-1"
            style={{ color: 'var(--text-dim)' }}
          >
            Rooms
          </div>
          {rooms.map((room, i) => (
            <div
              key={i}
              className="flex items-center gap-2 p-2 rounded-lg"
              style={{
                background: room.active ? 'oklch(62% 0.22 265 / 0.15)' : undefined,
              }}
            >
              <div className="w-7 h-7 rounded-lg flex items-center justify-center text-[13px] shrink-0">
                {room.emoji}
              </div>
              <div className="min-w-0">
                <div className="text-[11px] font-semibold" style={{ color: 'var(--text)' }}>
                  {room.name}
                </div>
                <div className="text-[9px]" style={{ color: 'var(--text-muted)' }}>
                  {room.sub}
                </div>
              </div>
              {room.unread !== undefined && (
                <div className="ml-auto w-4 h-4 rounded-full bg-[oklch(62%_0.22_265)] flex items-center justify-center text-[8px] text-white font-bold">
                  {room.unread}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Main chat */}
        <div className="flex flex-col overflow-hidden">
          <div
            className="h-11 border-b flex items-center gap-2.5 px-4 shrink-0"
            style={{ borderColor: 'var(--border2)' }}
          >
            <div
              className="w-6.5 h-6.5 rounded-full flex items-center justify-center text-[11px] font-bold text-white"
              style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', width: 26, height: 26 }}
            >
              Y
            </div>
            <div>
              <div className="flex items-center gap-1">
                <span className="text-[12px] font-semibold" style={{ color: 'var(--text)' }}>Yuna</span>
                <div
                  className="w-[7px] h-[7px] rounded-full"
                  style={{ background: 'var(--color-green)' }}
                />
              </div>
              <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                🇯🇵 Native Japanese · Learning English
              </div>
            </div>
            <div className="ml-auto flex gap-2 text-sm">📞 🎥</div>
          </div>

          <div className="flex-1 overflow-hidden p-3 flex flex-col gap-2.5">
            <div className="flex flex-col gap-1">
              <div
                className="px-3 py-2 rounded-[4px_12px_12px_12px] text-[11px] leading-relaxed max-w-[75%]"
                style={{ background: 'var(--mock-msg-them)', color: 'var(--text)' }}
              >
                今日は一緒に勉強しませんか？
              </div>
              <div
                className="inline-flex items-center gap-1 text-[9px] px-1.5 py-0.5 rounded border"
                style={{ color: 'var(--text-dim)', background: 'var(--surface)', borderColor: 'var(--border2)' }}
              >
                🔤 "Shall we study together today?"
              </div>
            </div>
            <div className="flex flex-col gap-1 items-end">
              <div
                className="px-3 py-2 rounded-[12px_4px_12px_12px] text-[11px] leading-relaxed max-w-[75%] text-white"
                style={{ background: 'var(--mock-msg-me)' }}
              >
                Sure! I'd love to practice my Japanese too 😊
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <div
                className="px-3 py-2 rounded-[4px_12px_12px_12px] text-[11px] leading-relaxed max-w-[75%]"
                style={{ background: 'var(--mock-msg-them)', color: 'var(--text)' }}
              >
                Your Japanese is getting really good!
              </div>
              <div
                className="text-[9px] px-2 py-0.5 rounded border"
                style={{
                  background: 'oklch(62% 0.22 30 / 0.12)',
                  color: 'oklch(62% 0.22 30)',
                  borderColor: 'oklch(62% 0.22 30 / 0.2)',
                }}
              >
                💡 Tip: "上手になってきた" sounds more natural
              </div>
            </div>
            <div className="flex flex-col gap-1 items-end">
              <div
                className="px-3 py-2 rounded-[12px_4px_12px_12px] text-[11px] leading-relaxed max-w-[75%] text-white"
                style={{ background: 'var(--mock-msg-me)' }}
              >
                ありがとう！Let's do vocab first?
              </div>
            </div>
          </div>

          <div
            className="h-9.5 border-t flex items-center gap-2 px-3 shrink-0"
            style={{ borderColor: 'var(--border2)', height: 38 }}
          >
            <div
              className="flex-1 h-6 rounded-xl flex items-center px-2.5 text-[10px] border"
              style={{ background: 'var(--surface)', borderColor: 'var(--border2)', color: 'var(--text-dim)' }}
            >
              Type a message or switch to voice...
            </div>
            <div className="w-5.5 h-5.5 rounded-full bg-[oklch(62%_0.22_265)] flex items-center justify-center text-[10px]"
              style={{ width: 22, height: 22 }}
            >
              🎙️
            </div>
          </div>
        </div>

        {/* Right AI panel */}
        <div
          className="border-l flex flex-col gap-3 p-3.5"
          style={{ borderColor: 'var(--border2)' }}
        >
          <div className="text-[9px] uppercase tracking-[1.5px]" style={{ color: 'var(--text-dim)' }}>
            AI Vocabulary
          </div>
          {[
            { word: '上手 (jōzu)', def: 'Skilled, good at something', tag: 'N4 Level' },
            { word: '勉強 (benkyō)', def: 'Study, learning', tag: 'N5 Level' },
          ].map((v, i) => (
            <div
              key={i}
              className="flex flex-col gap-0.5 p-2 rounded-lg border"
              style={{ background: 'var(--surface)', borderColor: 'var(--border2)' }}
            >
              <div className="text-[12px] font-semibold" style={{ color: 'var(--text)' }}>{v.word}</div>
              <div className="text-[9px]" style={{ color: 'var(--text-muted)' }}>{v.def}</div>
              <div
                className="text-[8px] px-1.5 py-px rounded font-semibold w-fit mt-0.5"
                style={{ background: 'oklch(62% 0.22 265 / 0.15)', color: 'var(--color-accent)' }}
              >
                {v.tag}
              </div>
            </div>
          ))}
          <div
            className="rounded-lg p-2 text-[9px] leading-relaxed border"
            style={{
              background: 'oklch(62% 0.22 265 / 0.08)',
              borderColor: 'oklch(62% 0.22 265 / 0.2)',
              color: 'var(--text-muted)',
            }}
          >
            <div className="text-[8px] font-bold mb-1" style={{ color: 'var(--color-accent)' }}>AI Tip</div>
            Use "〜ませんか" to politely suggest doing something together. More natural than "〜しますか".
          </div>
        </div>
      </div>
    </div>
  )
}

function PhoneMockup() {
  return (
    <div
      className="absolute right-0 bottom-0 z-[2] rounded-[36px] overflow-hidden border"
      style={{
        width: 220,
        height: 460,
        background: 'var(--mock-bg)',
        borderWidth: 1.5,
        borderColor: 'var(--border)',
        boxShadow: '0 40px 100px rgba(0,0,0,0.4), 0 0 0 1px var(--border)',
      }}
    >
      {/* Notch */}
      <div
        className="absolute top-2.5 left-1/2 -translate-x-1/2 z-[3] rounded-[20px]"
        style={{ width: 72, height: 20, background: 'var(--bg)' }}
      />

      <div className="absolute inset-0 flex flex-col overflow-hidden">
        {/* Top bar */}
        <div
          className="flex items-center gap-2.5 border-b shrink-0"
          style={{ padding: '36px 14px 10px', background: 'var(--bg2)', borderColor: 'var(--border2)' }}
        >
          <span className="text-base font-semibold cursor-pointer" style={{ color: 'var(--color-accent)' }}>‹</span>
          <div
            className="relative shrink-0 rounded-full flex items-center justify-center text-[13px] font-bold text-white"
            style={{
              width: 34,
              height: 34,
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            }}
          >
            Y
            <div
              className="absolute bottom-0 right-0 rounded-full border-[1.5px]"
              style={{
                width: 9,
                height: 9,
                background: 'var(--color-green)',
                borderColor: 'var(--bg2)',
              }}
            />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[13px] font-semibold" style={{ color: 'var(--text)' }}>Yuna</div>
            <div className="flex items-center gap-1">
              <span className="text-[13px]">🇯🇵→🇬🇧</span>
              <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Exchange</span>
            </div>
          </div>
          <div
            className="rounded-full flex items-center justify-center text-[13px]"
            style={{
              width: 30,
              height: 30,
              background: 'oklch(68% 0.18 150 / 0.15)',
            }}
          >
            📞
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-hidden flex flex-col gap-2.5 p-3 pb-2">
          {/* Voice active indicator */}
          <div
            className="flex items-center gap-2 rounded-[10px] p-1.5"
            style={{
              background: 'oklch(68% 0.18 150 / 0.1)',
              border: '1px solid oklch(68% 0.18 150 / 0.2)',
            }}
          >
            <div
              className="rounded-full flex items-center justify-center text-[9px] font-bold text-white shrink-0"
              style={{ width: 22, height: 22, background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
            >
              Y
            </div>
            <div className="flex items-end gap-0.5 h-4">
              {[10, 16, 8, 18, 12].map((h, i) => (
                <div
                  key={i}
                  className="w-0.5 rounded-sm"
                  style={{
                    height: h,
                    background: 'var(--color-green)',
                    animation: `pmwave 0.9s ease-in-out infinite`,
                    animationDelay: `${[0, 0.12, 0.24, 0.12, 0][i]}s`,
                  }}
                />
              ))}
            </div>
            <span className="text-[9px] font-semibold" style={{ color: 'var(--color-green)' }}>Speaking...</span>
          </div>

          <div className="flex flex-col gap-0.5">
            <div
              className="px-3 py-2 rounded-[4px_14px_14px_14px] text-[11px] leading-relaxed max-w-[80%]"
              style={{ background: 'var(--mock-msg-them)', color: 'var(--text)' }}
            >
              今日は何を練習したい？
            </div>
            <div
              className="inline-flex items-center gap-1 text-[9px] px-1.5 py-0.5 rounded border"
              style={{ color: 'var(--text-dim)', background: 'var(--surface)', borderColor: 'var(--border2)' }}
            >
              🔤 What do you want to practice today?
            </div>
          </div>

          <div className="flex flex-col gap-0.5 items-end">
            <div
              className="px-3 py-2 rounded-[14px_4px_14px_14px] text-[11px] leading-relaxed max-w-[80%] text-white"
              style={{ background: 'var(--mock-msg-me)' }}
            >
              Let's work on casual conversation!
            </div>
          </div>

          <div
            className="flex items-center gap-1.5 rounded-lg p-1.5"
            style={{
              background: 'oklch(62% 0.22 265 / 0.06)',
              border: '1px solid oklch(62% 0.22 265 / 0.15)',
            }}
          >
            <span className="text-[12px]">💡</span>
            <div className="text-[9px] leading-snug" style={{ color: 'var(--text-muted)' }}>
              Try: <span className="font-semibold" style={{ color: 'var(--color-accent)' }}>「会話の練習しよう」</span> — sounds more casual
            </div>
          </div>

          <div className="flex flex-col gap-0.5">
            <div
              className="px-3 py-2 rounded-[4px_14px_14px_14px] text-[11px] leading-relaxed max-w-[80%]"
              style={{ background: 'var(--mock-msg-them)', color: 'var(--text)' }}
            >
              いいね！じゃあ始めよう 🎉
            </div>
            <div
              className="inline-flex items-center gap-1 text-[9px] px-1.5 py-0.5 rounded border"
              style={{ color: 'var(--text-dim)', background: 'var(--surface)', borderColor: 'var(--border2)' }}
            >
              🔤 Sounds good! Let's start
            </div>
          </div>
        </div>

        {/* Input bar */}
        <div
          className="flex items-center gap-2 shrink-0 border-t"
          style={{ padding: '8px 12px 16px', background: 'var(--bg2)', borderColor: 'var(--border2)' }}
        >
          <div
            className="flex-1 h-8 rounded-2xl flex items-center px-3 text-[10px] border"
            style={{ background: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--text-dim)' }}
          >
            Message or speak...
          </div>
          <div
            className="rounded-full flex items-center justify-center text-[13px] shrink-0"
            style={{
              width: 32,
              height: 32,
              background: 'var(--color-accent)',
              boxShadow: '0 4px 12px var(--color-accent-glow)',
            }}
          >
            🎙️
          </div>
        </div>
      </div>
    </div>
  )
}

function UseCasePanel({ uc }: { uc: UseCase }) {
  const users = UC_USERS[uc.id] ?? []
  const headerLabel =
    uc.id === 'study' ? 'Study Rooms' :
    uc.id === 'language' ? 'Language Exchange' :
    uc.id === 'games' ? 'Live Games' : 'Discover People'

  return (
    <div className="grid gap-10 md:gap-[60px] items-center grid-cols-1 md:grid-cols-2">
      <div>
        <h3
          className="font-bold leading-[1.15] mb-[18px] whitespace-pre-line"
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(24px, 5vw, 34px)',
            letterSpacing: '-1px',
            color: 'var(--text)',
          }}
        >
          {uc.heading}
        </h3>
        <p className="text-[15px] leading-[1.75] mb-6 font-light" style={{ color: 'var(--text-muted)' }}>
          {uc.body}
        </p>
        <ul className="flex flex-col gap-2.5 list-none">
          {uc.points.map((point, i) => (
            <li key={i} className="flex items-start gap-2.5 text-[14px]" style={{ color: 'var(--text-muted)' }}>
              <span
                className="w-1.5 h-1.5 rounded-full shrink-0 mt-[6px]"
                style={{ background: 'var(--color-accent)' }}
              />
              {point}
            </li>
          ))}
        </ul>
      </div>

      <div
        className="rounded-[24px] border flex flex-col p-5 md:p-6 gap-3 overflow-hidden h-auto md:h-[360px]"
        style={{ background: 'var(--bg2)', borderColor: 'var(--border)' }}
      >
        <div className="flex items-center justify-between text-[10px] uppercase tracking-[1.5px]" style={{ color: 'var(--text-dim)' }}>
          <span>{headerLabel}</span>
          <span className="flex items-center gap-1" style={{ color: 'var(--color-green)' }}>
            <span
              className="w-[5px] h-[5px] rounded-full"
              style={{ background: 'var(--color-green)', animation: 'pulse 1.5s infinite' }}
            />
            Live
          </span>
        </div>
        {users.map((u, i) => (
          <div
            key={i}
            className="flex items-center gap-2.5 rounded-[10px] border px-3.5 py-2.5 transition-[border-color] duration-200"
            style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
          >
            <div
              className="w-[34px] h-[34px] rounded-full flex items-center justify-center text-[13px] font-bold text-white shrink-0"
              style={{ background: u.color }}
            >
              {u.initials}
            </div>
            <div>
              <div className="text-[12px] font-semibold" style={{ color: 'var(--text)' }}>{u.name}</div>
              <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{u.detail}</div>
            </div>
            <span className={`ml-auto text-[9px] px-2 py-0.5 rounded-full font-semibold ${BADGE_CLASSES[u.badgeStyle]}`}>
              {u.badge}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Main component ─────────────────────────────────────────────────────────

function HomePage() {
  const [activeTab, setActiveTab] = useState('study')
  const revealRefs = useRef<Element[]>([])

  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) e.target.classList.add('is-visible')
        })
      },
      { threshold: 0.1 }
    )
    revealRefs.current.forEach((el) => obs.observe(el))
    return () => obs.disconnect()
  }, [])

  const addRevealRef = useCallback((el: Element | null) => {
    if (el && !revealRefs.current.includes(el)) revealRefs.current.push(el)
  }, [])

  const uc = USE_CASES.find((u) => u.id === activeTab) ?? USE_CASES[0]

  const FEATURES = [
    {
      icon: '🤖',
      iconBg: 'oklch(62% 0.22 265 / 0.12)',
      title: 'AI Study Partner',
      desc: 'Get instant explanations, practice problems, and smart feedback on any topic — powered by advanced AI that adapts to your level.',
    },
    {
      icon: '🌐',
      iconBg: 'oklch(62% 0.22 200 / 0.12)',
      title: 'Language Exchange',
      desc: 'Connect with native speakers worldwide. Real conversations with AI-assisted translation, pronunciation coaching, and corrections.',
    },
    {
      icon: '🎮',
      iconBg: 'oklch(62% 0.22 320 / 0.12)',
      title: 'Voice Games',
      desc: 'Compete in trivia, word battles, and voice challenges. Win games, earn points, and make friends who share your energy.',
    },
    {
      icon: '🎙️',
      iconBg: 'oklch(62% 0.22 160 / 0.12)',
      title: 'Voice Rooms',
      desc: 'Drop into live voice rooms on any topic — study sessions, casual chats, language practice, or open mic storytelling.',
    },
    {
      icon: '✨',
      iconBg: 'oklch(62% 0.22 30 / 0.12)',
      title: 'Smart Matching',
      desc: 'Our algorithm connects you with people at the right level, with complementary goals, and shared interests. No swiping.',
    },
    {
      icon: '🔒',
      iconBg: 'oklch(68% 0.18 150 / 0.12)',
      title: 'Safe & Open Source',
      desc: '100% open source. End-to-end encrypted rooms, AI moderation, and zero data selling. Community-verified and transparent.',
    },
  ]

  return (
    <div className="hp-root">
      <SEO
        title="Brolyu — Make Friends, Learn Languages &amp; Game Together"
        description="Join Brolyu to connect with people worldwide through live voice rooms. Make new friends, practice languages with native speakers, study together, and play games — all in real-time."
        path="/"
        jsonLd={HOME_JSON_LD}
      />
      {/* ── NAV ── */}
      <nav
        className="fixed top-0 left-0 right-0 z-[100] h-16 flex items-center border-b"
        style={{
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          background: 'var(--nav-bg)',
          borderColor: 'var(--border)',
        }}
      >
        <div className="w-full max-w-[1280px] mx-auto px-5 sm:px-8 flex items-center justify-between">
          <a
            href="/"
            className="flex items-center gap-2 text-[21px] font-bold no-underline"
            style={{
              fontFamily: 'var(--font-display)',
              letterSpacing: '-0.5px',
              color: 'var(--text)',
            }}
          >
            <span
              className="w-2 h-2 rounded-full"
              style={{
                background: 'var(--color-accent)',
                boxShadow: '0 0 10px var(--color-accent-glow)',
              }}
            />
            Brolyu
          </a>
          <ul className="hidden md:flex items-center gap-9 list-none">
            {['Features', 'Use Cases', 'Community'].map((link) => (
              <li key={link}>
                <a
                  href={`#${link.toLowerCase().replace(' ', '-')}`}
                  className="text-[14px] font-medium no-underline transition-colors duration-200"
                  style={{ color: 'var(--text-muted)' }}
                  onMouseEnter={(e) => ((e.target as HTMLAnchorElement).style.color = 'var(--text)')}
                  onMouseLeave={(e) => ((e.target as HTMLAnchorElement).style.color = 'var(--text-muted)')}
                >
                  {link}
                </a>
              </li>
            ))}
          </ul>
          <div className="flex items-center gap-3">
            <a
              href="/app"
              className="inline-flex items-center gap-1.5 rounded-full font-medium no-underline transition-all duration-200"
              style={{
                fontSize: 13,
                padding: '8px 18px',
                background: 'var(--color-accent)',
                color: '#fff',
                boxShadow: '0 4px 20px var(--color-accent-glow)',
              }}
            >
              Try Brolyu Web
            </a>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section
        className="relative flex items-center overflow-hidden min-h-screen pt-24 pb-12 px-5 sm:px-8 md:pt-[100px] md:pb-[60px]"
      >
        {/* Glow orbs */}
        <div
          className="absolute rounded-full pointer-events-none"
          style={{
            width: 800,
            height: 800,
            background: 'radial-gradient(circle, oklch(62% 0.22 265 / 0.14) 0%, transparent 65%)',
            top: -200,
            left: -200,
          }}
        />
        <div
          className="absolute rounded-full pointer-events-none"
          style={{
            width: 600,
            height: 600,
            background: 'radial-gradient(circle, oklch(62% 0.22 300 / 0.11) 0%, transparent 65%)',
            bottom: 0,
            right: -100,
          }}
        />

        <div
          className="max-w-[1280px] mx-auto w-full grid gap-10 lg:gap-16 items-center grid-cols-1 lg:grid-cols-[420px_1fr]"
        >
          {/* Left: headline + CTAs */}
          <div
            ref={addRevealRef}
            style={{
              transition: 'opacity 0.7s ease, transform 0.7s ease',
            }}
            className="opacity-0 translate-y-7 [&.is-visible]:opacity-100 [&.is-visible]:translate-y-0"
          >
            <div
              className="inline-flex items-center gap-2 rounded-full border text-[12px] font-medium mb-7"
              style={{
                background: 'var(--surface)',
                borderColor: 'var(--border)',
                color: 'var(--text-muted)',
                padding: '5px 14px',
              }}
            >
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{
                  background: 'var(--color-green)',
                  boxShadow: '0 0 8px oklch(68% 0.18 150 / 0.6)',
                  animation: 'pulse 2s infinite',
                }}
              />
              Now live on Web
            </div>

            <h1
              className="break-words"
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(36px, 9vw, 60px)',
                fontWeight: 700,
                lineHeight: 1.09,
                letterSpacing: '-1.5px',
                color: 'var(--text)',
                marginBottom: 22,
              }}
            >
              Talk your way<br />
              to{' '}
              <span
                style={{
                  background: 'linear-gradient(130deg, var(--color-accent) 0%, var(--color-accent2) 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                anything.
              </span>
            </h1>

            <p
              className="font-light mb-9 leading-[1.7]"
              style={{ fontSize: 17, color: 'var(--text-muted)' }}
            >
              Study smarter, speak new languages, play voice games, and make real friends — all through the power of conversation.
            </p>

            <div className="flex gap-3 flex-wrap mb-7">
              <a
                href="/app"
                className="inline-flex items-center gap-1.5 rounded-full font-semibold no-underline transition-all duration-200"
                style={{
                  fontSize: 18,
                  padding: '16px 36px',
                  background: 'var(--color-accent)',
                  color: '#fff',
                  boxShadow: '0 6px 28px var(--color-accent-glow)',
                  letterSpacing: '-0.2px',
                }}
              >
                Start Talking
              </a>
            </div>

            <div className="flex gap-2.5 flex-wrap">
              {[
                { icon: '🍎', name: 'iOS App' },
                { icon: '🤖', name: 'Android App' },
              ].map((store) => (
                <div
                  key={store.name}
                  className="flex items-center gap-2 rounded-full border"
                  style={{
                    background: 'var(--surface)',
                    borderColor: 'var(--border)',
                    padding: '7px 14px',
                    color: 'var(--text-dim)',
                  }}
                >
                  <span className="text-[15px]">{store.icon}</span>
                  <span className="text-[12px] font-semibold" style={{ color: 'var(--text-muted)' }}>
                    {store.name}
                  </span>
                  <span
                    className="text-[9px] font-bold tracking-[0.5px] rounded-full text-white px-1.5 py-0.5"
                    style={{ background: 'var(--color-accent)' }}
                  >
                    Soon
                  </span>
                </div>
              ))}
            </div>

            {/* Trust bar */}
            <div className="flex items-center gap-5 mt-9 flex-wrap">
              <div className="flex items-center gap-1.5 text-[12px] font-medium" style={{ color: 'var(--text-dim)' }}>
                <span
                  className="w-5 h-5 rounded-full flex items-center justify-center text-[11px]"
                  style={{ background: 'oklch(68% 0.18 150 / 0.18)', color: 'var(--color-green)' }}
                >
                  ✦
                </span>
                100% Open Source
              </div>
              <div className="w-px h-3.5" style={{ background: 'var(--border)' }} />
              <div className="flex items-center gap-1.5 text-[12px] font-medium" style={{ color: 'var(--text-dim)' }}>
                <span
                  className="w-5 h-5 rounded-full flex items-center justify-center text-[11px]"
                  style={{ background: 'oklch(62% 0.22 265 / 0.15)', color: 'var(--color-accent)' }}
                >
                  🔒
                </span>
                E2E Encrypted
              </div>
            </div>
          </div>

          {/* Right: app mockups */}
          <div className="relative hidden lg:flex items-center justify-end" style={{ height: 580 }}>
            <WebMockup />
            <PhoneMockup />
          </div>
        </div>
      </section>

      {/* ── OPEN SOURCE STRIP ── */}
      <div
        className="border-t border-b py-[18px]"
        style={{
          background: 'linear-gradient(90deg, oklch(68% 0.18 150 / 0.07) 0%, oklch(62% 0.22 265 / 0.07) 100%)',
          borderColor: 'var(--border)',
        }}
      >
        <div className="max-w-[1280px] mx-auto px-5 sm:px-8 flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4 flex-wrap">
            <div
              className="flex items-center gap-2 rounded-full font-bold text-[13px] px-4 py-1.5 tracking-[-0.2px]"
              style={{
                background: 'oklch(68% 0.18 150 / 0.12)',
                border: '1px solid oklch(68% 0.18 150 / 0.25)',
                color: 'var(--color-green)',
              }}
            >
              ✦ Open Source
            </div>
            <p className="text-[13px] md:text-[14px]" style={{ color: 'var(--text-muted)' }}>
              <strong style={{ color: 'var(--text)', fontWeight: 600 }}>Brolyu is fully transparent.</strong>{' '}
              Inspect, contribute, and trust the code.
            </p>
          </div>
          <div className="flex items-center gap-2 md:gap-3 flex-wrap">
            {['⭐ Star on GitHub', '🔒 E2E Encrypted', '🚫 No Ads'].map((item) => (
              <div
                key={item}
                className="flex items-center gap-1.5 rounded-full border text-[12px] px-3.5 py-1"
                style={{
                  background: 'var(--surface)',
                  borderColor: 'var(--border)',
                  color: 'var(--text-muted)',
                }}
              >
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── STATS BAR ── */}
      <div
        className="border-b py-11"
        style={{ background: 'var(--bg2)', borderColor: 'var(--border)' }}
      >
        <div className="max-w-[1280px] mx-auto px-5 sm:px-8 flex justify-center gap-x-10 gap-y-6 md:gap-20 flex-wrap">
          {[
            { num: '2M+', label: 'Active Learners' },
            { num: '40+', label: 'Languages Supported' },
            { num: '150+', label: 'Countries' },
            { num: '98%', label: 'Satisfaction Rate' },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 36,
                  fontWeight: 700,
                  letterSpacing: '-1.5px',
                  background: 'linear-gradient(135deg, var(--color-accent), var(--color-accent2))',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                {stat.num}
              </div>
              <div className="text-[13px] mt-1" style={{ color: 'var(--text-muted)' }}>{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── FEATURES ── */}
      <section id="features" className="py-16 md:py-[120px]">
        <div className="max-w-[1280px] mx-auto px-5 sm:px-8">
          <div
            ref={addRevealRef}
            style={{
              transition: 'opacity 0.7s ease, transform 0.7s ease',
            }}
            className="opacity-0 translate-y-7 [&.is-visible]:opacity-100 [&.is-visible]:translate-y-0"
          >
            <div
              className="text-[11px] font-bold tracking-[2.5px] uppercase mb-4"
              style={{ color: 'var(--color-accent)' }}
            >
              Features
            </div>
            <h2
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(28px, 6vw, 50px)',
                fontWeight: 700,
                letterSpacing: '-1.2px',
                color: 'var(--text)',
                lineHeight: 1.1,
                marginBottom: 16,
              }}
            >
              Everything you need<br />to grow through talk.
            </h2>
            <p className="text-[15px] md:text-[17px] font-light leading-[1.65] mb-10 md:mb-[60px] max-w-[480px]" style={{ color: 'var(--text-muted)' }}>
              One platform for study, language, games, and friendships — powered by voice and AI.
            </p>
          </div>

          <div className="grid gap-[18px] grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((feat, i) => (
              <div
                key={feat.title}
                ref={addRevealRef}
                className="relative overflow-hidden rounded-[16px] border p-[30px] group opacity-0 translate-y-7 [&.is-visible]:opacity-100 [&.is-visible]:translate-y-0"
                style={{
                  background: 'var(--surface)',
                  borderColor: 'var(--border)',
                  transition: `opacity 0.7s ease ${i * 0.1}s, transform 0.7s ease ${i * 0.1}s`,
                }}
                onMouseEnter={(e) => {
                  const el = e.currentTarget
                  el.style.borderColor = 'oklch(62% 0.22 265 / 0.28)'
                  el.style.transform = 'translateY(-3px)'
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget
                  el.style.borderColor = 'var(--border)'
                  el.style.transform = 'translateY(0)'
                }}
              >
                <div
                  className="w-[46px] h-[46px] rounded-[14px] flex items-center justify-center text-[21px] mb-[18px]"
                  style={{ background: feat.iconBg }}
                >
                  {feat.icon}
                </div>
                <div
                  className="text-[17px] font-semibold mb-2 tracking-[-0.2px]"
                  style={{ fontFamily: 'var(--font-display)', color: 'var(--text)' }}
                >
                  {feat.title}
                </div>
                <div className="text-[13px] leading-[1.7]" style={{ color: 'var(--text-muted)' }}>
                  {feat.desc}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── USE CASES ── */}
      <section id="use-cases" className="pb-16 md:pb-[120px]">
        <div className="max-w-[1280px] mx-auto px-5 sm:px-8">
          <div
            ref={addRevealRef}
            className="opacity-0 translate-y-7 [&.is-visible]:opacity-100 [&.is-visible]:translate-y-0"
            style={{
              transition: 'opacity 0.7s ease, transform 0.7s ease',
            }}
          >
            <div
              className="text-[11px] font-bold tracking-[2.5px] uppercase mb-4"
              style={{ color: 'var(--color-accent)' }}
            >
              Use Cases
            </div>
            <h2
              className="break-words"
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(26px, 6vw, 50px)',
                fontWeight: 700,
                letterSpacing: '-1.2px',
                color: 'var(--text)',
                lineHeight: 1.1,
                marginBottom: 16,
              }}
            >
              One app, endless possibilities.
            </h2>
            <p className="text-[15px] md:text-[17px] font-light leading-[1.65] mb-8 md:mb-[48px] max-w-[480px]" style={{ color: 'var(--text-muted)' }}>
              Pick your mode, or let Brolyu guide you to what fits best.
            </p>
          </div>

          {/* Tabs */}
          <div
            className="flex gap-[3px] rounded-full border w-fit max-w-full overflow-x-auto mb-8 md:mb-12 p-1"
            style={{ background: 'var(--bg2)', borderColor: 'var(--border)' }}
          >
            {USE_CASES.map((u) => (
              <button
                key={u.id}
                onClick={() => setActiveTab(u.id)}
                className="rounded-full border-none cursor-pointer text-[13px] md:text-[14px] font-medium transition-all duration-[220ms] whitespace-nowrap shrink-0 px-4 md:px-[22px] py-2"
                style={{
                  fontFamily: 'var(--font-body)',
                  background: activeTab === u.id ? 'var(--color-accent)' : 'transparent',
                  color: activeTab === u.id ? 'white' : 'var(--text-muted)',
                  boxShadow: activeTab === u.id ? '0 4px 14px var(--color-accent-glow)' : 'none',
                }}
              >
                {u.label}
              </button>
            ))}
          </div>

          <UseCasePanel uc={uc} />
        </div>
      </section>

      {/* ── CTA ── */}
      <section id="community" className="pt-10 pb-20 md:pt-[60px] md:pb-[130px]">
        <div className="max-w-[1280px] mx-auto px-5 sm:px-8">
          <div
            ref={addRevealRef}
            className="relative overflow-hidden rounded-[28px] border text-center opacity-0 translate-y-7 [&.is-visible]:opacity-100 [&.is-visible]:translate-y-0 px-6 py-12 md:p-[80px]"
            style={{
              background: 'linear-gradient(135deg, oklch(18% 0.08 265) 0%, oklch(14% 0.06 300) 100%)',
              borderColor: 'oklch(62% 0.22 265 / 0.22)',
              transition: 'opacity 0.7s ease, transform 0.7s ease',
            }}
          >
            <div
              className="absolute rounded-full pointer-events-none"
              style={{
                width: 500,
                height: 500,
                background: 'radial-gradient(circle, oklch(62% 0.22 265 / 0.22) 0%, transparent 70%)',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
              }}
            />
            <div className="relative z-[1]">
              <h2
                className="break-words"
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 'clamp(28px, 6vw, 50px)',
                  fontWeight: 700,
                  letterSpacing: '-1.2px',
                  color: 'var(--text)',
                  lineHeight: 1.1,
                  marginBottom: 14,
                }}
              >
                Ready to start talking?
              </h2>
              <p className="text-[15px] md:text-[17px] font-light mb-9" style={{ color: 'var(--text-muted)' }}>
                Join millions learning, playing, and connecting on Brolyu.
              </p>
              <div className="flex gap-3 justify-center flex-wrap">
                <a
                  href="/app"
                  className="inline-flex items-center gap-1.5 rounded-full font-semibold no-underline transition-all duration-200"
                  style={{
                    fontSize: 18,
                    padding: '16px 36px',
                    background: 'var(--color-accent)',
                    color: '#fff',
                    boxShadow: '0 6px 28px var(--color-accent-glow)',
                    letterSpacing: '-0.2px',
                  }}
                >
                  Start Talking
                </a>
                <a
                  href="https://github.com/rzkadltm/brolyu-web"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-full font-medium no-underline border transition-all duration-200"
                  style={{
                    fontSize: 15,
                    padding: '13px 28px',
                    background: 'var(--surface)',
                    color: 'var(--text)',
                    borderColor: 'var(--border)',
                  }}
                >
                  ⭐ Star on GitHub
                </a>
              </div>
              <div className="flex items-center justify-center gap-3 mt-7 flex-wrap">
                {[
                  { icon: '🍎', name: 'iOS App' },
                  { icon: '🤖', name: 'Android App' },
                ].map((store) => (
                  <div
                    key={store.name}
                    className="flex items-center gap-2 rounded-full border"
                    style={{
                      background: 'var(--surface)',
                      borderColor: 'var(--border)',
                      padding: '7px 14px',
                      color: 'var(--text-dim)',
                    }}
                  >
                    <span className="text-[15px]">{store.icon}</span>
                    <span className="text-[12px] font-semibold" style={{ color: 'var(--text-muted)' }}>
                      {store.name}
                    </span>
                    <span
                      className="text-[9px] font-bold tracking-[0.5px] rounded-full text-white px-1.5 py-0.5"
                      style={{ background: 'var(--color-accent)' }}
                    >
                      Soon
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t py-10" style={{ borderColor: 'var(--border)' }}>
        <div className="max-w-[1280px] mx-auto px-5 sm:px-8 flex items-center justify-between flex-wrap gap-5">
          <div className="text-[13px]" style={{ color: 'var(--text-dim)' }}>
            © 2026 Brolyu. Open source — MIT License.
          </div>
          <ul className="flex gap-7 list-none flex-wrap">
            {['Privacy', 'Terms', 'GitHub', 'Community'].map((link) => (
              <li key={link}>
                <a
                  href="#"
                  className="text-[13px] no-underline transition-colors duration-200"
                  style={{ color: 'var(--text-dim)' }}
                  onMouseEnter={(e) => ((e.target as HTMLAnchorElement).style.color = 'var(--text-muted)')}
                  onMouseLeave={(e) => ((e.target as HTMLAnchorElement).style.color = 'var(--text-dim)')}
                >
                  {link}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </footer>
    </div>
  )
}

export default HomePage
