import { useEffect, useRef, useState } from 'react'

type DmConvo = {
  id: number
  type: 'dm'
  name: string
  initials: string
  color: string
  online: boolean
  time: string
  preview: string
  unread: number
}

type GroupConvo = {
  id: number
  type: 'group'
  name: string
  initials: [string, string]
  colors: [string, string]
  online: boolean
  time: string
  preview: string
  unread: number
}

type Convo = DmConvo | GroupConvo

type TextMsg = {
  id: number
  from: 'me' | 'them'
  type: 'text'
  text: string
  time: string
}

type VoiceMsg = {
  id: number
  from: 'me' | 'them'
  type: 'voice'
  duration: string
  time: string
}

type ImageMsg = {
  id: number
  from: 'me' | 'them'
  type: 'image'
  emoji: string
  caption: string
  time: string
}

type ReactMsg = {
  id: number
  from: 'me' | 'them'
  type: 'react'
  reactions: { e: string; n: number }[]
  time: string
}

type Msg = TextMsg | VoiceMsg | ImageMsg | ReactMsg

const CONVOS: Convo[] = [
  { id: 1, type: 'dm', name: 'Hussein', initials: 'H', color: '#6366f1', online: true, time: 'now', preview: "Let's hop in a room later?", unread: 2 },
  { id: 2, type: 'dm', name: 'Yuna', initials: 'Y', color: '#0ea5e9', online: true, time: '2m', preview: 'ありがとう！ Your Japanese is 🔥', unread: 1 },
  { id: 3, type: 'dm', name: 'Pablo', initials: 'P', color: '#f59e0b', online: false, time: '14m', preview: "I'll be in the Spanish room tmrw", unread: 0 },
  { id: 4, type: 'group', name: 'Study Squad', initials: ['A', 'M'], colors: ['#6366f1', '#8b5cf6'], online: false, time: '1h', preview: 'Aiko: Anyone ready for the quiz?', unread: 5 },
  { id: 5, type: 'dm', name: 'Zara', initials: 'Z', color: '#ec4899', online: true, time: '2h', preview: 'GG that was a fun game 🎮', unread: 0 },
  { id: 6, type: 'dm', name: 'Kofi', initials: 'K', color: '#14b8a6', online: false, time: '3h', preview: 'Same time next week?', unread: 0 },
  { id: 7, type: 'group', name: 'Language Pals 🌏', initials: ['Y', 'P'], colors: ['#0ea5e9', '#f59e0b'], online: false, time: '1d', preview: 'Pablo: Check this vocab tip!', unread: 0 },
  { id: 8, type: 'dm', name: 'Monday', initials: 'M', color: '#4b5563', online: false, time: '1d', preview: 'See you at the room ✌️', unread: 0 },
]

const INITIAL_MSGS: Msg[] = [
  { id: 1, from: 'them', type: 'text', text: 'Hey! I heard you joined the English room today 👋', time: '14:20' },
  { id: 2, from: 'them', type: 'text', text: 'How was it? Did you get to practice much?', time: '14:20' },
  { id: 3, from: 'me', type: 'text', text: 'Yeah it was great! I stayed for like 2 hours haha', time: '14:22' },
  { id: 4, from: 'me', type: 'text', text: 'My listening improved a lot already, I think', time: '14:22' },
  { id: 5, from: 'them', type: 'voice', duration: '0:18', time: '14:24' },
  { id: 6, from: 'me', type: 'text', text: "That's exactly how I felt when I started too 😄", time: '14:25' },
  { id: 61, from: 'me', type: 'text', text: 'Do you want to do a language exchange sometime this week?', time: '14:25' },
  { id: 7, from: 'them', type: 'text', text: "Absolutely! I'm free Thursday or Friday evenings", time: '14:27' },
  { id: 8, from: 'them', type: 'text', text: "I can help you with Arabic, you help me with English — deal? 🤝", time: '14:27' },
  { id: 81, from: 'them', type: 'react', reactions: [{ e: '🤝', n: 1 }, { e: '🔥', n: 1 }], time: '14:27' },
  { id: 9, from: 'me', type: 'text', text: 'Deal!! Thursday works perfectly for me 🎉', time: '14:29' },
  { id: 10, from: 'them', type: 'image', emoji: '🗓️', caption: 'Study schedule I made', time: '14:30' },
  { id: 11, from: 'me', type: 'text', text: 'This is so organised omg 😭 sending mine is scary lol', time: '14:31' },
]

const VOICE_HEIGHTS = [6, 10, 14, 8, 18, 10, 6, 14, 9, 16, 7, 12, 18, 8, 10, 14, 6]

const PROFILE_ACTIONS: [string, string][] = [
  ['🎙️', 'Voice'],
  ['📹', 'Video'],
  ['🔔', 'Mute'],
  ['🚫', 'Block'],
]

const PROFILE_INFO: [string, string, string][] = [
  ['🌍', 'From', 'Saudi Arabia'],
  ['📚', 'Learning', 'English, French'],
  ['🎯', 'Goal', 'Language exchange'],
  ['⭐', 'Member since', 'Jan 2025'],
]

function formatTime(): string {
  return new Date().toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' })
}

function VoiceBubble({ from }: { from: 'me' | 'them' }) {
  return (
    <div className={`mp-voice-msg${from === 'me' ? ' me' : ''}`}>
      <div className="mp-voice-play">▶</div>
      <div className="flex items-center gap-[2px] flex-1 h-6">
        {VOICE_HEIGHTS.map((h, i) => (
          <div key={i} className="mp-vw-bar" style={{ height: `${h}px` }} />
        ))}
      </div>
      <span className="mp-voice-duration">0:18</span>
    </div>
  )
}

function ImageBubble({ emoji, caption }: { emoji: string; caption: string }) {
  return (
    <div className="mp-img-msg">
      <span className="text-3xl">{emoji}</span>
      <div className="mp-img-msg-overlay">{caption}</div>
    </div>
  )
}

type ConvoItemProps = { convo: Convo; active: boolean; onClick: () => void }

function ConvoItem({ convo, active, onClick }: ConvoItemProps) {
  const body = (
    <div className="flex-1 min-w-0">
      <div className="flex items-center justify-between mb-[3px]">
        <span className="text-[13px] font-semibold" style={{ color: 'var(--text)' }}>{convo.name}</span>
        <span className="text-[10px]" style={{ color: 'var(--text-d)' }}>{convo.time}</span>
      </div>
      <div className="flex items-center justify-between gap-2">
        <span
          className="text-[12px] whitespace-nowrap overflow-hidden text-ellipsis max-w-[170px]"
          style={{ color: 'var(--text-m)' }}
        >
          {convo.preview}
        </span>
        {convo.unread > 0 && <div className="mp-unread">{convo.unread}</div>}
      </div>
    </div>
  )

  if (convo.type === 'group') {
    return (
      <div className={`mp-convo-item${active ? ' active' : ''}`} onClick={onClick}>
        <div className="relative w-11 h-11 flex-shrink-0">
          <div className="mp-group-av-inner" style={{ background: convo.colors[0] }}>{convo.initials[0]}</div>
          <div className="mp-group-av-inner" style={{ background: convo.colors[1] }}>{convo.initials[1]}</div>
        </div>
        {body}
      </div>
    )
  }

  return (
    <div className={`mp-convo-item${active ? ' active' : ''}`} onClick={onClick}>
      <div className="relative flex-shrink-0">
        <div
          className="w-11 h-11 rounded-full flex items-center justify-center text-base font-bold text-white"
          style={{ background: convo.color }}
        >
          {convo.initials}
        </div>
        {convo.online && <div className="mp-convo-online" />}
      </div>
      {body}
    </div>
  )
}

function MessagesPage() {
  const [activeConvoId, setActiveConvoId] = useState(1)
  const [tab, setTab] = useState<'All' | 'Direct' | 'Groups'>('All')
  const [msgs, setMsgs] = useState<Msg[]>(INITIAL_MSGS)
  const [input, setInput] = useState('')
  const [showTyping, setShowTyping] = useState(true)
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [msgs, showTyping])

  const activeConvo = CONVOS.find(c => c.id === activeConvoId) ?? CONVOS[0]
  const activeInitials = activeConvo.type === 'dm' ? activeConvo.initials : activeConvo.initials[0]
  const activeColor = activeConvo.type === 'dm' ? activeConvo.color : activeConvo.colors[0]

  const filteredConvos = CONVOS.filter(c =>
    tab === 'All' ||
    (tab === 'Direct' && c.type === 'dm') ||
    (tab === 'Groups' && c.type === 'group')
  )

  function send() {
    if (!input.trim()) return
    setMsgs(m => [...m, {
      id: Date.now(),
      from: 'me' as const,
      type: 'text' as const,
      text: input.trim(),
      time: formatTime(),
    }])
    setInput('')
    setShowTyping(true)
    setTimeout(() => {
      setShowTyping(false)
      setMsgs(m => [...m, {
        id: Date.now() + 1,
        from: 'them' as const,
        type: 'text' as const,
        text: "That's a great point! Let's practice together soon 🙌",
        time: formatTime(),
      }])
    }, 2200)
  }

  return (
    <div className="flex flex-1 overflow-hidden">

      {/* Conversation Panel */}
      <div className="mp-convo-panel">
        <div className="px-4 pt-5 pb-3 flex-shrink-0">
          <div className="font-display text-[18px] font-bold tracking-[-0.4px] mb-3" style={{ color: 'var(--text)' }}>
            Messages
          </div>
          <div className="mp-convo-search">
            <span className="text-[13px]" style={{ color: 'var(--text-d)' }}>🔍</span>
            <input className="mp-convo-search-inp" placeholder="Search conversations..." />
          </div>
        </div>
        <div className="flex gap-[2px] px-4 pb-3 flex-shrink-0 border-b" style={{ borderColor: 'var(--border2)' }}>
          {(['All', 'Direct', 'Groups'] as const).map(t => (
            <div key={t} className={`mp-convo-tab${tab === t ? ' active' : ''}`} onClick={() => setTab(t)}>
              {t}
            </div>
          ))}
        </div>
        <div className="mp-convo-list">
          {filteredConvos.map(c => (
            <ConvoItem
              key={c.id}
              convo={c}
              active={activeConvoId === c.id}
              onClick={() => setActiveConvoId(c.id)}
            />
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col overflow-hidden" style={{ background: 'var(--bg)' }}>

        {/* Chat Header */}
        <div
          className="px-6 py-[14px] flex items-center justify-between flex-shrink-0 border-b"
          style={{ borderColor: 'var(--border2)', backdropFilter: 'blur(12px)' }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-[15px] font-bold text-white relative"
              style={{ background: activeColor }}
            >
              {activeInitials}
              {activeConvo.online && <div className="mp-chat-header-online" />}
            </div>
            <div>
              <div className="font-display text-[16px] font-bold tracking-[-0.3px]" style={{ color: 'var(--text)' }}>
                {activeConvo.name}
              </div>
              <div className="text-[12px] flex items-center gap-[5px]" style={{ color: 'var(--text-m)' }}>
                {activeConvo.online ? (
                  <>
                    <div className="w-[6px] h-[6px] rounded-full" style={{ background: 'var(--color-green)' }} />
                    Active now
                  </>
                ) : (
                  <span style={{ color: 'var(--text-d)' }}>Last seen recently</span>
                )}
              </div>
            </div>
          </div>
          <div className="flex gap-[6px]">
            <button className="mp-hdr-btn accent">🎙️</button>
            <button className="mp-hdr-btn accent">📹</button>
            <button className="mp-hdr-btn">🔍</button>
            <button className="mp-hdr-btn">⋯</button>
          </div>
        </div>

        {/* Messages */}
        <div className="mp-messages-area">
          <div className="mp-date-divider">
            <span className="mp-date-label">Today</span>
          </div>

          {msgs.map((msg, i) => {
            if (msg.type === 'react') return null
            const prevMsg = i > 0 ? msgs[i - 1] : undefined
            const isConsec = prevMsg !== undefined && prevMsg.from === msg.from && prevMsg.type !== 'react'
            const nextMsg = i + 1 < msgs.length ? msgs[i + 1] : undefined

            return (
              <div
                key={msg.id}
                className={`mp-msg-row${msg.from === 'me' ? ' me' : ''}${isConsec ? ' consecutive' : ''}`}
              >
                <div
                  className={`mp-msg-av${isConsec ? ' hidden' : ''}`}
                  style={{ background: msg.from === 'them' ? activeColor : 'var(--color-accent)' }}
                >
                  {msg.from === 'them' ? activeInitials : 'U'}
                </div>
                <div className={`flex flex-col gap-[3px] max-w-[68%]${msg.from === 'me' ? ' items-end' : ''}`}>
                  {!isConsec && msg.from !== 'me' && (
                    <div className="text-[11px] font-semibold px-1" style={{ color: 'var(--text-m)' }}>
                      {activeConvo.name}
                    </div>
                  )}
                  {msg.type === 'text' && (
                    <div className={`mp-msg-bubble ${msg.from === 'me' ? 'me' : 'them'}`}>{msg.text}</div>
                  )}
                  {msg.type === 'voice' && <VoiceBubble from={msg.from} />}
                  {msg.type === 'image' && <ImageBubble emoji={msg.emoji} caption={msg.caption} />}
                  {nextMsg?.type === 'react' && (
                    <div className="flex gap-1 mt-1">
                      {nextMsg.reactions.map((r, j) => (
                        <button key={j} className="mp-reaction-chip">
                          {r.e}
                          <span className="text-[10px] font-semibold" style={{ color: 'var(--text-m)' }}>{r.n}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )
          })}

          {showTyping && (
            <div className="flex items-center gap-[10px] py-[6px]">
              <div
                className="w-[34px] h-[34px] rounded-full flex items-center justify-center text-[13px] font-bold text-white flex-shrink-0"
                style={{ background: activeColor }}
              >
                {activeInitials}
              </div>
              <div className="mp-typing-bubble">
                <div className="mp-typing-dot" />
                <div className="mp-typing-dot" />
                <div className="mp-typing-dot" />
              </div>
            </div>
          )}
          <div ref={endRef} />
        </div>

        {/* Input Bar */}
        <div className="px-6 pb-5 pt-3 flex-shrink-0">
          <div className="mp-input-row">
            <div className="flex gap-1 items-center">
              <button className="mp-input-action" title="Attach">📎</button>
              <button className="mp-input-action" title="Image">🖼️</button>
              <button className="mp-input-action" title="Emoji">😊</button>
            </div>
            <textarea
              className="mp-input-field"
              placeholder={`Message ${activeConvo.name}...`}
              rows={1}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  send()
                }
              }}
            />
            {input.trim() ? (
              <button className="mp-send-btn" onClick={send}>➤</button>
            ) : (
              <button className="mp-mic-btn">🎙️</button>
            )}
          </div>
        </div>
      </div>

      {/* Profile Panel */}
      <div className="mp-profile-panel">
        <div className="px-5 pt-7 pb-5 text-center border-b" style={{ borderColor: 'var(--border2)' }}>
          <div
            className="w-[72px] h-[72px] rounded-full flex items-center justify-center font-display text-[26px] font-bold text-white mx-auto mb-3 relative"
            style={{ background: activeColor, boxShadow: '0 8px 24px rgba(0,0,0,0.3)' }}
          >
            {activeInitials}
            {activeConvo.online && <div className="mp-profile-online-ring" />}
          </div>
          <div className="font-display text-[17px] font-bold tracking-[-0.3px] mb-1" style={{ color: 'var(--text)' }}>
            {activeConvo.name}
          </div>
          <div className="text-[12px] mb-[10px]" style={{ color: 'var(--text-m)' }}>
            @{activeConvo.name.toLowerCase().replace(/\s+/g, '_')} · Brolyu
          </div>
          <div className="mp-profile-status-badge">
            <div className="w-[6px] h-[6px] rounded-full" style={{ background: 'var(--color-green)' }} />
            {activeConvo.online ? 'Active now' : 'Offline'}
          </div>
          <div className="flex justify-center gap-[10px] mt-4">
            {PROFILE_ACTIONS.map(([icon, label]) => (
              <div key={label} className="flex flex-col items-center gap-[5px] cursor-pointer">
                <div className="mp-profile-action-icon">{icon}</div>
                <div className="text-[10px]" style={{ color: 'var(--text-d)' }}>{label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="px-5 py-4 border-b" style={{ borderColor: 'var(--border2)' }}>
          <div className="text-[10px] tracking-[1.5px] uppercase font-semibold mb-3" style={{ color: 'var(--text-d)' }}>
            About
          </div>
          {PROFILE_INFO.map(([icon, label, val]) => (
            <div key={label} className="flex items-center gap-[10px] mb-2">
              <span className="text-[14px] w-5 text-center" style={{ color: 'var(--text-d)' }}>{icon}</span>
              <span className="text-[12px]" style={{ color: 'var(--text-m)' }}>
                {label}: <strong style={{ color: 'var(--text)', fontWeight: 600 }}>{val}</strong>
              </span>
            </div>
          ))}
        </div>

        <div className="px-5 py-4 border-b" style={{ borderColor: 'var(--border2)' }}>
          <div className="text-[10px] tracking-[1.5px] uppercase font-semibold mb-3" style={{ color: 'var(--text-d)' }}>
            Languages
          </div>
          <div className="flex gap-[6px] flex-wrap">
            <span className="mp-lang-badge native">🟢 Arabic (native)</span>
            <span className="mp-lang-badge">EN · B2</span>
            <span className="mp-lang-badge">FR · A1</span>
          </div>
        </div>

        <div className="px-5 py-4">
          <div className="text-[10px] tracking-[1.5px] uppercase font-semibold mb-3" style={{ color: 'var(--text-d)' }}>
            Shared Media
          </div>
          <div className="grid grid-cols-3 gap-1">
            {['🗓️', '📊', '🖼️', '📸', '🎵', '📄'].map((e, i) => (
              <div key={i} className="mp-media-thumb">{e}</div>
            ))}
          </div>
        </div>
      </div>

    </div>
  )
}

export default MessagesPage
