import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { SEO } from '../components/SEO'
import type { Room } from '../data/rooms'
import { useAuth } from '../contexts/useAuth'
import { apiRoomToUiRoom, roomsApi, type ApiRoom } from '../features/rooms/api'
import { useVoice, type ChatMsg } from '../features/voice/useVoice'

function RemoteAudio({ stream }: { stream: MediaStream }) {
  const ref = useRef<HTMLAudioElement>(null)
  useEffect(() => {
    if (ref.current) ref.current.srcObject = stream
  }, [stream])
  return <audio ref={ref} autoPlay playsInline />
}

type TagColor = 'blue' | 'green' | 'purple' | 'amber' | 'rose'

const TAG_CLASSES: Record<TagColor, string> = {
  blue:   'bg-[oklch(62%_0.22_265_/_0.1)] text-accent border-[oklch(62%_0.22_265_/_0.2)]',
  green:  'bg-[oklch(70%_0.18_152_/_0.1)] text-green border-[oklch(70%_0.18_152_/_0.2)]',
  purple: 'bg-[oklch(62%_0.22_300_/_0.1)] text-accent2 border-[oklch(62%_0.22_300_/_0.2)]',
  amber:  'bg-[oklch(75%_0.18_70_/_0.1)] text-[oklch(68%_0.18_70)] border-[oklch(75%_0.18_70_/_0.2)]',
  rose:   'bg-[oklch(62%_0.22_15_/_0.1)] text-[oklch(62%_0.22_15)] border-[oklch(62%_0.22_15_/_0.2)]',
}

const SIDEBAR_FILTERS = ['All Rooms', 'Language', 'Study', 'Games', 'Friends']

const LISTENER_COLORS = [
  '#f59e0b', '#ec4899', '#14b8a6', '#8b5cf6', '#f97316', '#6366f1', '#ef4444',
]

function colorForPeer(peerId: string): string {
  let h = 0
  for (let i = 0; i < peerId.length; i++) h = (h * 31 + peerId.charCodeAt(i)) | 0
  return LISTENER_COLORS[Math.abs(h) % LISTENER_COLORS.length]
}

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


function SpeakerNode({ name, color, initials, avatarUrl, speaking, isHost }: {
  name: string; color: string; initials: string; avatarUrl?: string | null; speaking: boolean; isHost: boolean
}) {
  const [imgErrored, setImgErrored] = useState(false)
  const showImage = !!avatarUrl && !imgErrored
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
          style={{ background: showImage ? 'transparent' : color, overflow: 'hidden', position: 'relative' }}
        >
          {isHost && <span className="rp-speaker-crown">👑</span>}
          {showImage ? (
            <img
              src={avatarUrl ?? undefined}
              alt=""
              referrerPolicy="no-referrer"
              onError={() => setImgErrored(true)}
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            />
          ) : (
            initials
          )}
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
          <div
            key={i}
            className="rp-room-av"
            style={{ background: sp.avatarUrl ? 'transparent' : sp.color, overflow: 'hidden' }}
          >
            {sp.avatarUrl ? (
              <img
                src={sp.avatarUrl}
                alt=""
                referrerPolicy="no-referrer"
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              />
            ) : (
              sp.initial
            )}
          </div>
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
  const { user } = useAuth()

  const [apiRoom, setApiRoom] = useState<ApiRoom | null>(null)
  const [room, setRoom] = useState<Room | null>(null)
  const [roomLoading, setRoomLoading] = useState(true)
  const [sidebarRooms, setSidebarRooms] = useState<Room[]>([])
  const [endingRoom, setEndingRoom] = useState(false)

  const [sidebarOpen, setSidebarOpen]   = useState(true)
  const [chatOpen, setChatOpen]         = useState(false)
  const [unreadCount, setUnreadCount]   = useState(0)
  const [requestsOpen, setRequestsOpen] = useState(false)
  const [sidebarFilter, setSidebarFilter] = useState('All Rooms')
  const [sidebarSearch, setSidebarSearch] = useState('')
  const {
    connected,
    muted,
    remotes,
    error: voiceError,
    toggleMute,
    speakerUserIds,
    myRole,
    pendingHands,
    handRaised,
    raiseHand,
    approveHand,
    denyHand,
    chatMsgs,
    sendChatMessage,
  } = useVoice(apiRoom?.publicId, user?.id)
  const [activeSpeaker, setActiveSpeaker] = useState(0)
  const [msgs, setMsgs]                 = useState<ChatMessage[]>([{ id: 0, type: 'sys', text: 'You joined the room' }])
  const [inputVal, setInputVal]         = useState('')
  const [copied, setCopied]             = useState(false)
  const msgsEndRef = useRef<HTMLDivElement>(null)
  const chatMsgsLenRef = useRef(0)

  useEffect(() => {
    if (!id) return
    let cancelled = false
    roomsApi
      .get(id)
      .then(api => {
        if (cancelled) return
        const ui = apiRoomToUiRoom(api)
        setApiRoom(api)
        setRoom(ui)
      })
      .catch(() => {
        if (cancelled) return
        setApiRoom(null)
        setRoom(null)
      })
      .finally(() => {
        if (!cancelled) setRoomLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [id])

  useEffect(() => {
    let cancelled = false
    roomsApi
      .list()
      .then(list => {
        if (cancelled) return
        setSidebarRooms(list.map(apiRoomToUiRoom))
      })
      .catch(() => {
        // Sidebar is non-critical; swallow errors silently.
      })
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (!room) return
    const t = setInterval(() => setActiveSpeaker(s => (s + 1) % room.speakers.length), 2800)
    return () => clearInterval(t)
  }, [room])

  async function handleEndRoom() {
    if (!apiRoom || endingRoom) return
    setEndingRoom(true)
    try {
      await roomsApi.end(apiRoom.publicId)
      navigate('/app')
    } catch {
      setEndingRoom(false)
    }
  }

  useEffect(() => {
    msgsEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [msgs, chatOpen])

  useEffect(() => {
    const newMsgs = chatMsgs.slice(chatMsgsLenRef.current)
    chatMsgsLenRef.current = chatMsgs.length
    if (newMsgs.length === 0) return
    setMsgs(m => [
      ...m,
      ...newMsgs.map((cm: ChatMsg) => ({
        id: cm.ts,
        type: 'chat' as const,
        name: cm.username ?? 'Unknown',
        color: colorForPeer(cm.userId ?? cm.username ?? ''),
        initials: (cm.username?.[0] ?? '?').toUpperCase(),
        text: cm.text,
        time: new Date(cm.ts).toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' }),
        me: false,
      })),
    ])
    if (!chatOpen) setUnreadCount(c => c + newMsgs.length)
  }, [chatMsgs, chatOpen])

  function copyLink() {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  function sendMsg() {
    if (!inputVal.trim()) return
    const text = inputVal.trim()
    const now = Date.now()
    setMsgs(m => [...m, {
      id: now,
      type: 'chat',
      name: user?.name || user?.username || 'You',
      color: colorForPeer(user?.id ?? 'me'),
      initials: (user?.name?.[0] ?? user?.username?.[0] ?? 'U').toUpperCase(),
      text,
      time: new Date(now).toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' }),
      me: true,
    }])
    sendChatMessage(text)
    setInputVal('')
  }

  const filteredSidebar = sidebarRooms.filter(r => {
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

  if (roomLoading) {
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-d)', fontSize: 14 }}>
        Loading room…
      </div>
    )
  }

  if (!room || !apiRoom) {
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16 }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 700, color: 'var(--text)' }}>Room not found</div>
        <Link to="/app" style={{ color: 'var(--color-accent)', fontSize: 14 }}>← Back to rooms</Link>
      </div>
    )
  }

  const isHost = !!user && apiRoom.host.id === user.id

  // Build speaker entries: host first (from apiRoom) only if they're actually
  // present (in speakerUserIds), then approved non-host speakers. If we ARE
  // the host, treat ourselves as present immediately — otherwise we'd flicker
  // through the listener section while waiting for the initial speakers-state.
  const hostPresent = isHost || speakerUserIds.has(apiRoom.host.id)
  const hostSpeaker = hostPresent
    ? {
        key: `speaker-${apiRoom.host.id}`,
        initial: (apiRoom.host.name?.[0] ?? apiRoom.host.username[0] ?? '?').toUpperCase(),
        color: room.speakers[0]?.color ?? '#6366f1',
        name: apiRoom.host.name || apiRoom.host.username,
        avatarUrl: apiRoom.host.avatarUrl,
        isHost: true,
        isSelf: !!user && user.id === apiRoom.host.id,
      }
    : null
  const otherSpeakers = Array.from(speakerUserIds)
    .filter(uid => uid !== apiRoom.host.id)
    // Skip ghosts: a speaker userId with no live peer connection and that
    // isn't us. Guards against role-changed-listener arriving after peer-left.
    .filter(uid => uid === user?.id || remotes.some(r => r.userId === uid))
    .map(uid => {
      if (user && uid === user.id) {
        return {
          key: `speaker-${uid}`,
          initial: (user.name?.[0] ?? user.username[0] ?? '?').toUpperCase(),
          color: colorForPeer(uid),
          name: user.name || user.username,
          avatarUrl: user.avatarUrl,
          isHost: false,
          isSelf: true,
        }
      }
      const peer = remotes.find(r => r.userId === uid)
      return {
        key: `speaker-${uid}`,
        initial: (peer?.username?.[0] ?? '?').toUpperCase(),
        color: colorForPeer(uid),
        name: peer?.username ?? 'Speaker',
        avatarUrl: peer?.avatarUrl ?? null,
        isHost: false,
        isSelf: false,
      }
    })
  const speakerList = hostSpeaker ? [hostSpeaker, ...otherSpeakers] : otherSpeakers
  const speakers = speakerList.map((s, i) => ({
    ...s,
    speaking: speakerList.length > 0 && i === activeSpeaker % speakerList.length,
  }))

  // Listeners = peers (and self) whose userId is not in the speaker set.
  const remoteListeners = remotes
    .filter(r => !r.userId || !speakerUserIds.has(r.userId))
    .map(r => ({
      key: r.peerId,
      initial: (r.username?.[0] ?? '?').toUpperCase(),
      color: colorForPeer(r.userId ?? r.peerId),
      avatarUrl: r.avatarUrl,
      isSelf: false,
    }))
  const selfListener = user && myRole === 'listener' && !isHost
    ? {
        key: `self-${user.id}`,
        initial: (user.name?.[0] ?? user.username[0] ?? '?').toUpperCase(),
        color: colorForPeer(user.id),
        avatarUrl: user.avatarUrl,
        isSelf: true,
      }
    : null
  const allListeners = selfListener ? [selfListener, ...remoteListeners] : remoteListeners
  const visibleListeners = allListeners.slice(0, 6)
  const extraListeners = Math.max(0, allListeners.length - visibleListeners.length)

  return (
    <div className="relative" style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
      <SEO
        title={room ? `${room.name} — Voice Room` : 'Voice Room'}
        description={
          room
            ? `Join "${room.name}" on Brolyu — a live voice room with ${room.listeners} listeners. ${room.tags.map(t => t.label).join(', ')}.`
            : 'Join a live voice room on Brolyu and connect with people worldwide.'
        }
        path={`/room/${id ?? ''}`}
      />

      {/* Sidebar */}
      <div className="relative flex-shrink-0 hidden md:block" style={{ width: sidebarOpen ? 300 : 0 }}>
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
                🟢 Live · {speakers.length + allListeners.length}
              </span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <button className={`rp-copy-btn${copied ? ' copied' : ''}`} onClick={copyLink}>
              {copied ? '✓ Copied!' : '🔗 Copy Link'}
            </button>
            {isHost && (
              <button
                className="rp-leave-btn"
                onClick={handleEndRoom}
                disabled={endingRoom}
                style={{ background: 'oklch(62% 0.22 15)', color: 'white' }}
              >
                {endingRoom ? 'Ending…' : 'End Room ⏹'}
              </button>
            )}
            <button className="rp-leave-btn" onClick={() => navigate('/app')}>Leave ✕</button>
          </div>
        </div>

        {/* Speaker area */}
        <div className="rp-speaker-stage">
          <div className="rp-speaker-section-label">Speaking</div>
          <div className="rp-speaker-grid">
            {speakers.map(sp => (
              <SpeakerNode
                key={sp.key}
                name={sp.name}
                color={sp.color}
                initials={sp.initial}
                avatarUrl={sp.avatarUrl}
                speaking={sp.speaking ?? false}
                isHost={sp.isHost}
              />
            ))}
          </div>
        </div>

        {/* Listeners */}
        <div className="rp-listener-section">
          <div className="rp-listener-label">Listening</div>
          <div className="rp-listener-avatars">
            {visibleListeners.map(l => (
              <div
                key={l.key}
                className="rp-listener-av"
                style={{ background: l.avatarUrl ? 'transparent' : l.color, overflow: 'hidden' }}
                title={l.isSelf ? 'You' : undefined}
              >
                {l.avatarUrl ? (
                  <img
                    src={l.avatarUrl}
                    alt=""
                    referrerPolicy="no-referrer"
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                  />
                ) : (
                  l.initial
                )}
              </div>
            ))}
            {extraListeners > 0 && (
              <div className="rp-listener-more">+{extraListeners}</div>
            )}
            {allListeners.length === 0 && (
              <div style={{ fontSize: 12, color: 'var(--text-d)' }}>No listeners yet</div>
            )}
          </div>
          {myRole === 'listener' && !isHost && (
            <button
              className="rp-raise-hand-btn"
              onClick={raiseHand}
              disabled={handRaised}
              style={handRaised ? { opacity: 0.6, cursor: 'default' } : undefined}
            >
              {handRaised ? '✋ Waiting for host…' : '✋ Request to Talk'}
            </button>
          )}
        </div>

        {/* Hidden audio sinks for remote peers — autoplay starts after user
            gesture (the click that opened the room or unmuted). */}
        {remotes.map(r => (
          <RemoteAudio key={r.peerId} stream={r.stream} />
        ))}

        {/* Voice status banner */}
        <div style={{ padding: '4px 16px', fontSize: 12, color: 'var(--text-d)', display: 'flex', gap: 12, alignItems: 'center' }}>
          <span>{connected ? '🟢 Voice connected' : '⚪ Voice connecting…'}</span>
          <span>{remotes.length} peer{remotes.length === 1 ? '' : 's'}</span>
          {voiceError && <span style={{ color: 'oklch(62% 0.22 15)' }}>⚠ {voiceError.message}</span>}
        </div>

        {/* Controls */}
        <div className="rp-controls">
          {myRole === 'speaker' && (
            <button
              className={`rp-ctrl-mic${muted ? ' muted' : ''}`}
              onClick={toggleMute}
              title={muted ? 'Unmute' : 'Mute'}
            >
              🎙️
            </button>
          )}
          <button type="button" className={`rp-ctrl-btn${chatOpen ? ' active' : ''}`} title="Chat" onClick={() => { setChatOpen(o => !o); setUnreadCount(0) }} style={{ position: 'relative' }}>
            💬
            {unreadCount > 0 && !chatOpen && (
              <span style={{
                position: 'absolute', top: -4, right: -4,
                minWidth: 18, height: 18, padding: '0 5px',
                borderRadius: 9, background: 'oklch(62% 0.22 15)',
                color: 'white', fontSize: 11, fontWeight: 700,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                lineHeight: 1, pointerEvents: 'none',
              }}>
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </button>
          <div className="rp-ctrl-btn" title="Video">📹</div>
          <div className="rp-ctrl-btn" title="Screen share">🖥️</div>
          {isHost && (
            <div style={{ position: 'relative' }}>
              <button
                type="button"
                className={`rp-ctrl-btn${requestsOpen ? ' active' : ''}`}
                title="Hand requests"
                onClick={() => setRequestsOpen(o => !o)}
                style={{ position: 'relative' }}
              >
                ✋
                {pendingHands.length > 0 && (
                  <span style={{
                    position: 'absolute',
                    top: -4, right: -4,
                    minWidth: 18, height: 18,
                    padding: '0 5px',
                    borderRadius: 9,
                    background: 'oklch(62% 0.22 15)',
                    color: 'white',
                    fontSize: 11, fontWeight: 700,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    lineHeight: 1,
                  }}>
                    {pendingHands.length}
                  </span>
                )}
              </button>
              {requestsOpen && (
                <div style={{
                  position: 'absolute',
                  bottom: 'calc(100% + 8px)',
                  right: 0,
                  width: 280,
                  background: 'var(--color-bg-elev)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 10,
                  boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
                  padding: 10,
                  zIndex: 40,
                  display: 'flex', flexDirection: 'column', gap: 6,
                }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-d)', textTransform: 'uppercase', letterSpacing: 0.5, padding: '2px 4px' }}>
                    Hand requests {pendingHands.length > 0 ? `(${pendingHands.length})` : ''}
                  </div>
                  {pendingHands.length === 0 ? (
                    <div style={{ fontSize: 13, color: 'var(--text-d)', padding: '8px 4px' }}>
                      No requests yet
                    </div>
                  ) : (
                    pendingHands.map(h => (
                      <div
                        key={h.userId}
                        style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 4px' }}
                      >
                        <div
                          className="rp-listener-av"
                          style={{
                            background: h.avatarUrl ? 'transparent' : colorForPeer(h.userId),
                            width: 28, height: 28, fontSize: 12, flexShrink: 0,
                            overflow: 'hidden',
                          }}
                        >
                          {h.avatarUrl ? (
                            <img
                              src={h.avatarUrl}
                              alt=""
                              referrerPolicy="no-referrer"
                              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                            />
                          ) : (
                            (h.username?.[0] ?? '?').toUpperCase()
                          )}
                        </div>
                        <span style={{ flex: 1, fontSize: 13, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {h.username ?? 'Unknown'}
                        </span>
                        <button
                          type="button"
                          onClick={() => approveHand(h.userId)}
                          style={{ padding: '4px 10px', borderRadius: 6, fontSize: 12, background: 'oklch(70% 0.18 152)', color: 'white', border: 'none', cursor: 'pointer' }}
                        >
                          Approve
                        </button>
                        <button
                          type="button"
                          onClick={() => denyHand(h.userId)}
                          style={{ padding: '4px 8px', borderRadius: 6, fontSize: 12, background: 'transparent', color: 'var(--text-d)', border: '1px solid var(--color-border)', cursor: 'pointer' }}
                        >
                          Deny
                        </button>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Right Chat */}
      {chatOpen && <div className="rp-chat-panel absolute inset-0 z-30 w-full md:static md:inset-auto md:z-auto md:w-[300px]">
        <div className="rp-chat-header">
          <div className="rp-chat-header-title">Room Chat</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ fontSize: 12, color: 'var(--text-d)' }}>Chat</div>
            <button
              type="button"
              aria-label="Close chat"
              onClick={() => setChatOpen(false)}
              className="md:hidden inline-flex items-center justify-center w-7 h-7 rounded-md text-[color:var(--text-d)] hover:text-[color:var(--text)] hover:bg-[color:var(--color-border)]/40 transition-colors"
            >
              <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M3 3l10 10M13 3L3 13" />
              </svg>
            </button>
          </div>
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
      </div>}
    </div>
  )
}
