import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Chip from '../components/Chip/Chip'
import IconRail from '../components/IconRail/IconRail'
import { useTheme } from '../contexts/useTheme'
import { ROOMS } from '../data/rooms'
import type { Room, TagColor } from '../data/rooms'

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

const WAVE_HEIGHTS = [8, 13, 6, 13, 8]
const WAVE_DELAYS  = [0, 0.15, 0.3, 0.15, 0]

type ChatMessage = {
  id: number
  type: 'sys' | 'chat'
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
  if (sp[0]) msgs.push({ id: 1, type: 'chat', name: sp[0].name, color: sp[0].color, initials: sp[0].initial, text: 'Hey everyone! Welcome to the room 👋', time: '14:30' })
  if (sp[1]) msgs.push({ id: 2, type: 'chat', name: sp[1].name, color: sp[1].color, initials: sp[1].initial, text: "Happy to be here! Let's get started 😊", time: '14:31' })
  if (sp[2]) msgs.push({ id: 3, type: 'chat', name: sp[2].name, color: sp[2].color, initials: sp[2].initial, text: 'Same here! This is my first time in this room.', time: '14:32' })
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
        <div className={`rp-speaker-av${speaking ? ' speaking' : ''}`} style={{ background: color }}>
          {isHost && <span className="rp-speaker-crown">👑</span>}
          {initials}
        </div>
      </div>
      {speaking
        ? (
          <div className="rp-speaker-wave">
            {WAVE_HEIGHTS.map((h, i) => (
              <div key={i} className="rp-sw-bar" style={{ height: h, animationDelay: `${WAVE_DELAYS[i]}s` }} />
            ))}
          </div>
        )
        : <div style={{ height: 14 }} />}
      <div className="rp-speaker-name">{name}</div>
    </div>
  )
}

function SidebarRoomCard({ room, active, onClick }: { room: Room; active: boolean; onClick: () => void }) {
  return (
    <div className={`rp-room-card${active ? ' active' : ''}`} onClick={onClick}>
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="rp-room-card-name">{room.name}</div>
      </div>
      <div className="rp-room-avatars mb-2">
        {room.speakers.map((sp, i) => (
          <div key={i} className="rp-room-av" style={{ background: sp.color }}>{sp.initial}</div>
        ))}
      </div>
      <div className="flex items-center justify-between">
        <div className="rp-room-tags">
          {room.tags.slice(0, 1).map((t, i) => (
            <span key={i} className={`rp-room-tag${t.color === 'green' ? ' green' : t.color === 'purple' ? ' purple' : ''}`}>
              {t.label}
            </span>
          ))}
        </div>
        <div className="flex items-center gap-2">
          {room.live && (
            <div className="rp-room-live-badge">
              <div className="rp-live-dot" />
              Live
            </div>
          )}
          <span style={{ fontSize: 11, color: 'var(--text-d)' }}>
            👥 {room.listeners + room.speakers.length}
          </span>
        </div>
      </div>
    </div>
  )
}

function RoomPage() {
  const { id } = useParams<{ id: string }>()
  const { theme } = useTheme()
  const navigate = useNavigate()

  const room = ROOMS.find(r => r.id === Number(id))

  const [sidebarFilter, setSidebarFilter] = useState('All Rooms')
  const [sidebarSearch, setSidebarSearch] = useState('')
  const [chatOpen, setChatOpen] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [muted, setMuted] = useState(false)
  const [activeSpeaker, setActiveSpeaker] = useState(0)
  const [msgs, setMsgs] = useState<ChatMessage[]>(() => room ? buildInitialMessages(room) : [])
  const [inputVal, setInputVal] = useState('')
  const [copied, setCopied] = useState(false)
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
      id: Date.now(),
      type: 'chat',
      name: 'You',
      color: '#6366f1',
      initials: 'U',
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

  if (!room) {
    return (
      <div className="ap-root flex h-screen items-center justify-center flex-col gap-4" data-theme={theme}>
        <div className="font-display text-2xl font-bold" style={{ color: 'var(--text)' }}>Room not found</div>
        <button type="button" className="text-accent text-sm" onClick={() => navigate('/app')}>
          ← Back to rooms
        </button>
      </div>
    )
  }

  const speakers = room.speakers.map((s, i) => ({ ...s, speaking: i === activeSpeaker }))
  const visibleListeners = LISTENER_POOL.slice(0, Math.min(6, room.listeners))
  const extraListeners = Math.max(0, room.listeners - visibleListeners.length)

  return (
    <div className="ap-root flex h-screen overflow-hidden" data-theme={theme}>
      <IconRail />

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar — room list */}
        <div className="relative flex-shrink-0" style={{ width: sidebarOpen ? 300 : 0 }}>
          {sidebarOpen && (
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
                  <Chip key={f} active={sidebarFilter === f} onClick={() => setSidebarFilter(f)}>
                    {f}
                  </Chip>
                ))}
              </div>
              <div className="rp-room-list">
                {filteredSidebar.map(r => (
                  <SidebarRoomCard
                    key={r.id}
                    room={r}
                    active={r.id === room.id}
                    onClick={() => navigate(`/room/${r.id}`)}
                  />
                ))}
              </div>
            </div>
          )}
          <button
            type="button"
            className="rp-sidebar-toggle"
            aria-label={sidebarOpen ? 'Hide sidebar' : 'Show sidebar'}
            onClick={() => setSidebarOpen(o => !o)}
          >
            {sidebarOpen ? '‹' : '›'}
          </button>
        </div>

        {/* Stage */}
        <div className="rp-stage">
          <div className="rp-stage-header">
            <div className="flex flex-col gap-[6px]">
              <div className="rp-stage-title">{room.name}</div>
              <div className="flex gap-[6px]">
                {room.tags.map((t, i) => (
                  <span key={i} className={`rp-stage-tag ${TAG_CLASSES[t.color]}`}>{t.label}</span>
                ))}
                <span className="rp-stage-tag" style={{ background: 'oklch(70% 0.18 152 / 0.1)', color: 'var(--color-green)', borderColor: 'oklch(70% 0.18 152 / 0.2)' }}>
                  🟢 Live · {room.listeners + room.speakers.length}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button type="button" className="rp-stage-action-btn">📋 Lesson</button>
              <button type="button" className="rp-stage-action-btn">✨ AI Assist</button>
              <button type="button" className={`rp-copy-btn${copied ? ' copied' : ''}`} onClick={copyLink}>
                {copied ? '✓ Copied!' : '🔗 Copy Link'}
              </button>
              <button type="button" className="rp-leave-btn" onClick={() => navigate('/app')}>Leave ✕</button>
            </div>
          </div>

          <div className="rp-speaker-stage">
            <div className="rp-speaker-section-label">Speaking</div>
            <div className="rp-speaker-grid">
              {speakers.map((sp, i) => (
                <SpeakerNode
                  key={sp.name}
                  name={sp.name}
                  color={sp.color}
                  initials={sp.initial}
                  speaking={sp.speaking ?? false}
                  isHost={i === 0}
                />
              ))}
            </div>
          </div>

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
            <button type="button" className="rp-raise-hand-btn">✋ Raise Hand</button>
          </div>

          <div className="rp-controls">
            <button type="button" className="rp-ctrl-btn" aria-label="Video">📹</button>
            <button type="button" className="rp-ctrl-btn" aria-label="Screen share">🖥️</button>
            <button
              type="button"
              className={`rp-ctrl-mic${muted ? ' muted' : ''}`}
              aria-label={muted ? 'Unmute' : 'Mute'}
              onClick={() => setMuted(m => !m)}
            >
              {muted ? '🔇' : '🎙️'}
            </button>
            <button type="button" className={`rp-ctrl-btn${chatOpen ? ' active' : ''}`} aria-label="Chat" onClick={() => setChatOpen(o => !o)}>💬</button>
            <button type="button" className="rp-ctrl-btn" aria-label="AI tools">🤖</button>
            <button type="button" className="rp-ctrl-btn danger" aria-label="End">📵</button>
          </div>
        </div>

        {/* Chat */}
        {chatOpen && <div className="rp-chat-panel">
          <div className="rp-chat-header">
            <div className="rp-chat-header-title">Room Chat</div>
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
                  <div className="flex flex-col flex-1 min-w-0" style={{ alignItems: m.me ? 'flex-end' : 'flex-start' }}>
                    <div
                      className="flex items-baseline gap-[7px] mb-1"
                      style={{ flexDirection: m.me ? 'row-reverse' : 'row' }}
                    >
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
            <button type="button" className="rp-send-btn" onClick={sendMsg}>➤</button>
          </div>
        </div>}
      </div>
    </div>
  )
}

export default RoomPage
