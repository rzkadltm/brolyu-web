import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ROOMS } from '../data/rooms'
import type { Room } from '../data/rooms'

type TagColor = 'blue' | 'green' | 'purple' | 'amber' | 'rose'

const TAG_CLASSES: Record<TagColor, string> = {
  blue:   'bg-[oklch(62%_0.22_265_/_0.1)] text-accent border-[oklch(62%_0.22_265_/_0.2)]',
  green:  'bg-[oklch(70%_0.18_152_/_0.1)] text-green border-[oklch(70%_0.18_152_/_0.2)]',
  purple: 'bg-[oklch(62%_0.22_300_/_0.1)] text-accent2 border-[oklch(62%_0.22_300_/_0.2)]',
  amber:  'bg-[oklch(75%_0.18_70_/_0.1)] text-[oklch(68%_0.18_70)] border-[oklch(75%_0.18_70_/_0.2)]',
  rose:   'bg-[oklch(62%_0.22_15_/_0.1)] text-[oklch(62%_0.22_15)] border-[oklch(62%_0.22_15_/_0.2)]',
}

const SIDEBAR_FILTERS = ['All Rooms', 'Language', 'Study', 'Games', 'Friends']

const LISTENER_POOL = [
  { i: 'T', c: '#f59e0b' }, { i: 'A', c: '#ec4899' }, { i: 'K', c: '#14b8a6' },
  { i: 'R', c: '#8b5cf6' }, { i: 'S', c: '#f97316' }, { i: 'N', c: '#6366f1' },
  { i: 'B', c: '#ef4444' },
]

const STAGE_WAVE_HEIGHTS = [8, 13, 6, 13, 8]
const STAGE_WAVE_DELAYS  = [0, 0.15, 0.3, 0.15, 0]

type ChatMessage = {
  id: number
  type?: 'sys' | 'chat'
  name?: string
  color?: string
  initials?: string
  text: string
  time?: string
  me?: boolean
  translation?: string
  correction?: string
}

function buildInitialMessages(room: Room): ChatMessage[] {
  const sp = room.speakers
  const msgs: ChatMessage[] = []
  if (sp[0]) msgs.push({ id: 1, type: 'chat', name: sp[0].name, color: sp[0].color, initials: sp[0].initial, text: 'Hey everyone! Welcome to the room 👋', time: '14:30', me: false })
  if (sp[1]) msgs.push({ id: 2, type: 'chat', name: sp[1].name, color: sp[1].color, initials: sp[1].initial, text: 'Happy to be here! Let\'s get started 😊', time: '14:31', me: false })
  if (sp[2]) msgs.push({ id: 3, type: 'chat', name: sp[2].name, color: sp[2].color, initials: sp[2].initial, text: 'Same here! This is my first time in this room.', time: '14:32', me: false })
  msgs.push({ id: 4, type: 'sys', text: 'You joined the room' })
  return msgs
}

function SpeakerNode({ name, color, initials, speaking, isHost }: {
  name: string; color: string; initials: string; speaking: boolean; isHost: boolean
}) {
  return (
    <div className="rp-speaker-node rp-fade-in">
      <div className="rp-speaker-ring-wrap">
        {speaking && (
          <>
            <div className="rp-speaking-ring" style={{ width: 100, height: 100 }} />
            <div className="rp-speaking-ring rp-speaking-ring-2" style={{ width: 100, height: 100 }} />
          </>
        )}
        <div
          className={`rp-speaker-av${speaking ? ' speaking' : ''}`}
          style={{ background: color }}
        >
          {isHost && <span className="rp-speaker-crown">👑</span>}
          {initials}
        </div>
      </div>
      {speaking ? (
        <div className="rp-speaker-wave">
          {STAGE_WAVE_HEIGHTS.map((h, i) => (
            <div key={i} className="rp-sw-bar" style={{ height: `${h}px`, animationDelay: `${STAGE_WAVE_DELAYS[i]}s` }} />
          ))}
        </div>
      ) : (
        <div style={{ height: 14 }} />
      )}
      <div className="rp-speaker-name">{name}</div>
    </div>
  )
}

function RoomCard({ room, active, onClick }: { room: Room; active: boolean; onClick: () => void }) {
  return (
    <div className={`rp-room-card${active ? ' active' : ''}`} onClick={onClick}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, marginBottom: 8 }}>
        <div className="rp-room-card-name">{room.name}</div>
      </div>
      <div className="rp-room-avatars" style={{ marginBottom: 8 }}>
        {room.speakers.map((sp, i) => (
          <div key={i} className="rp-room-av" style={{ background: sp.color }}>{sp.initial}</div>
        ))}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div className="rp-room-tags">
          {room.tags.slice(0, 1).map((t, i) => (
            <span key={i} className={`rp-room-tag${t.color === 'green' ? ' green' : t.color === 'purple' ? ' purple' : ''}`}>
              {t.label}
            </span>
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {room.live && (
            <div className="rp-room-live-badge">
              <div className="rp-live-dot" />
              Live
            </div>
          )}
          <span style={{ fontSize: 11, color: 'var(--text-d)' }}>👥 {room.listeners + room.speakers.length}</span>
        </div>
      </div>
    </div>
  )
}

export default function RoomPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const room = ROOMS.find(r => r.id === Number(id))

  const [theme, setTheme]               = useState<'dark' | 'light'>('dark')
  const [sidebarFilter, setSidebarFilter] = useState('All Rooms')
  const [sidebarSearch, setSidebarSearch] = useState('')
  const [muted, setMuted]               = useState(false)
  const [activeSpeaker, setActiveSpeaker] = useState(0)
  const [msgs, setMsgs]                 = useState<ChatMessage[]>(() => room ? buildInitialMessages(room) : [])
  const [inputVal, setInputVal]         = useState('')
  const [copied, setCopied]             = useState(false)
  const msgsEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!room) return
    const t = setInterval(() => setActiveSpeaker(s => (s + 1) % room.speakers.length), 2800)
    return () => clearInterval(t)
  }, [room])

  useEffect(() => {
    msgsEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [msgs])

  function copyLink() {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  function sendMsg() {
    if (!inputVal.trim()) return
    setMsgs(m => [...m, {
      id: Date.now(), type: 'chat', name: 'You', color: '#6366f1', initials: 'U',
      text: inputVal.trim(),
      time: new Date().toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' }),
      me: true,
    }])
    setInputVal('')
  }

  const filteredSidebar = ROOMS.filter(r => {
    const matchFilter =
      sidebarFilter === 'All Rooms' ||
      r.category === sidebarFilter ||
      r.tags.some(t => t.label.toLowerCase() === sidebarFilter.toLowerCase())
    const matchSearch =
      !sidebarSearch ||
      r.name.toLowerCase().includes(sidebarSearch.toLowerCase()) ||
      r.speakers.some(s => s.name.toLowerCase().includes(sidebarSearch.toLowerCase()))
    return matchFilter && matchSearch
  })

  const NAV_ITEMS = [
    { icon: '🏠', active: false, route: '/app' },
    { icon: '💬', active: false, badge: 3, route: '/messages' },
    { icon: '🔍', active: false, route: null },
    { icon: '📚', active: false, route: null },
    { icon: '🎮', active: false, route: null },
  ]

  if (!room) {
    return (
      <div className="ap-root" data-theme={theme} style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16 }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 700, color: 'var(--text)' }}>Room not found</div>
        <Link to="/app" style={{ color: 'var(--color-accent)', fontSize: 14 }}>← Back to rooms</Link>
      </div>
    )
  }

  const speakers = room.speakers.map((s, i) => ({ ...s, speaking: i === activeSpeaker }))
  const visibleListeners = LISTENER_POOL.slice(0, Math.min(6, room.listeners))
  const extraListeners = room.listeners - visibleListeners.length

  return (
    <div className="ap-root" data-theme={theme} style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>

      {/* Icon Rail */}
      <div className="ap-rail">
        <Link to="/app" style={{ textDecoration: 'none' }}>
          <div className="ap-rail-logo">B</div>
        </Link>
        <div className="ap-rail-sep" />
        {NAV_ITEMS.map((item, i) => (
          <div key={i} className={`ap-rail-btn${item.active ? ' active' : ''}`} onClick={() => { if (item.route) navigate(item.route) }}>
            {item.icon}
            {item.badge !== undefined && <div className="ap-rail-badge">{item.badge}</div>}
          </div>
        ))}
        <div className="mt-auto flex flex-col items-center gap-2">
          <div className="ap-rail-btn" onClick={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}>
            {theme === 'dark' ? '☀️' : '🌙'}
          </div>
          <div className="ap-rail-avatar">U</div>
        </div>
      </div>

      {/* Sidebar */}
      <div className="rp-sidebar">
        <div className="rp-sidebar-header">
          <div className="rp-sidebar-title">Voice Rooms</div>
          <div className="rp-search-bar">
            <span style={{ fontSize: 14, color: 'var(--text-d)', flexShrink: 0 }}>🔍</span>
            <input
              className="rp-search-input"
              placeholder="Search rooms..."
              value={sidebarSearch}
              onChange={e => setSidebarSearch(e.target.value)}
            />
          </div>
        </div>
        <div className="rp-filter-row">
          {SIDEBAR_FILTERS.map(f => (
            <div
              key={f}
              className={`rp-filter-chip${sidebarFilter === f ? ' active' : ''}`}
              onClick={() => setSidebarFilter(f)}
            >
              {f}
            </div>
          ))}
        </div>
        <div className="rp-room-list">
          {filteredSidebar.map(r => (
            <RoomCard
              key={r.id}
              room={r}
              active={r.id === room.id}
              onClick={() => navigate(`/room/${r.id}`)}
            />
          ))}
        </div>
      </div>

      {/* Center Stage */}
      <div className="rp-stage">
        {/* Header */}
        <div className="rp-stage-header">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div className="rp-stage-title">{room.name}</div>
            <div style={{ display: 'flex', gap: 6 }}>
              {room.tags.map((t, i) => (
                <span key={i} className={`rp-stage-tag ${TAG_CLASSES[t.color]}`}>{t.label}</span>
              ))}
              <span className="rp-stage-tag" style={{ background: 'oklch(70% 0.18 152 / 0.1)', color: 'var(--color-green)', borderColor: 'oklch(70% 0.18 152 / 0.2)' }}>
                🟢 Live · {room.listeners + room.speakers.length}
              </span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <button className="rp-stage-action-btn">📋 Lesson</button>
            <button className="rp-stage-action-btn">✨ AI Assist</button>
            <button className={`rp-copy-btn${copied ? ' copied' : ''}`} onClick={copyLink}>
              {copied ? '✓ Copied!' : '🔗 Copy Link'}
            </button>
            <button className="rp-leave-btn" onClick={() => navigate('/app')}>Leave ✕</button>
          </div>
        </div>

        {/* Speaker area */}
        <div className="rp-speaker-stage">
          <div className="rp-speaker-section-label">Speaking</div>
          <div className="rp-speaker-grid">
            {speakers.map((sp, i) => (
              <SpeakerNode
                key={i}
                name={sp.name}
                color={sp.color}
                initials={sp.initial}
                speaking={sp.speaking ?? false}
                isHost={i === 0}
              />
            ))}
          </div>
        </div>

        {/* Listeners */}
        <div className="rp-listener-section">
          <div className="rp-listener-label">Listening</div>
          <div className="rp-listener-avatars">
            {visibleListeners.map((l, i) => (
              <div key={i} className="rp-listener-av" style={{ background: l.c }}>{l.i}</div>
            ))}
            {extraListeners > 0 && (
              <div className="rp-listener-more">+{extraListeners}</div>
            )}
          </div>
          <button className="rp-raise-hand-btn">✋ Raise Hand</button>
        </div>

        {/* Controls */}
        <div className="rp-controls">
          <div className="rp-ctrl-btn" title="Video">📹</div>
          <div className="rp-ctrl-btn" title="Screen share">🖥️</div>
          <button
            className={`rp-ctrl-mic${muted ? ' muted' : ''}`}
            onClick={() => setMuted(m => !m)}
            title={muted ? 'Unmute' : 'Mute'}
          >
            {muted ? '🔇' : '🎙️'}
          </button>
          <div className="rp-ctrl-btn active" title="Chat">💬</div>
          <div className="rp-ctrl-btn" title="AI tools">🤖</div>
          <div className="rp-ctrl-btn danger" title="End">📵</div>
        </div>
      </div>

      {/* Right Chat */}
      <div className="rp-chat-panel">
        <div className="rp-chat-header">
          <div className="rp-chat-header-title">Room Chat</div>
          <div style={{ fontSize: 12, color: 'var(--text-d)' }}>Chat</div>
        </div>
        <div className="rp-chat-messages">
          {msgs.map((m, i) => {
            if (m.type === 'sys') {
              return <div key={m.id ?? i} className="rp-sys-msg">{m.text}</div>
            }
            return (
              <div
                key={m.id ?? i}
                className="rp-chat-msg"
                style={{ flexDirection: m.me ? 'row-reverse' : 'row' }}
              >
                <div className="rp-chat-msg-av" style={{ background: m.color }}>{m.initials}</div>
                <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', alignItems: m.me ? 'flex-end' : 'flex-start' }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 7, marginBottom: 4, flexDirection: m.me ? 'row-reverse' : 'row' }}>
                    <span className="rp-chat-msg-name">{m.name}</span>
                    <span className="rp-chat-msg-time">{m.time}</span>
                  </div>
                  <div className={`rp-chat-bubble${m.me ? ' me' : ''}`}>{m.text}</div>
                  {m.translation && (
                    <div className="rp-chat-translation">🔤 {m.translation}</div>
                  )}
                  {m.correction && (
                    <div className="rp-ai-correction">💡 <strong>AI:</strong> {m.correction}</div>
                  )}
                </div>
              </div>
            )
          })}
          <div ref={msgsEndRef} />
        </div>
        <div className="rp-chat-input-row">
          <input
            className="rp-chat-input"
            placeholder="Type in any language..."
            value={inputVal}
            onChange={e => setInputVal(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') sendMsg() }}
          />
          <button className="rp-send-btn" onClick={sendMsg}>➤</button>
        </div>
      </div>
    </div>
  )
}
