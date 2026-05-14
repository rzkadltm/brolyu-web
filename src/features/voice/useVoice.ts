import { useCallback, useEffect, useRef, useState } from 'react'
import { io, type Socket } from 'socket.io-client'
import { tokenStore } from '../../lib/api'
import { voiceApi, type IceServer } from './api'

export interface RemotePeer {
  peerId: string
  userId: string | null
  username: string | null
  avatarUrl: string | null
  stream: MediaStream
}

interface PeerEntry {
  pc: RTCPeerConnection
  userId: string | null
  username: string | null
  avatarUrl: string | null
  stream: MediaStream
  pendingIce: RTCIceCandidateInit[]
}

interface PeerInfo {
  peerId: string
  userId: string | null
  username: string | null
  avatarUrl: string | null
}

interface SignalMsg {
  from: string
  type: 'offer' | 'answer' | 'ice'
  sdp?: string
  candidate?: RTCIceCandidateInit
}

export interface PendingHand {
  userId: string
  username: string | null
  avatarUrl: string | null
}

export interface ChatMsg {
  userId: string | null
  username: string | null
  avatarUrl: string | null
  text: string
  ts: number
}

const SOCKET_URL = (
  import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000'
).replace(/\/$/, '')

// Mesh-topology WebRTC voice for a single room. Each tab is its own peer;
// all peers connect pairwise. Designed for ~2-6 participants — replace with
// an SFU when listener counts grow.
export function useVoice(roomId: string | undefined, selfUserId: string | undefined) {
  const [connected, setConnected] = useState(false)
  // Users join muted by default; they explicitly opt in to broadcasting.
  const [muted, setMuted] = useState(true)
  const [remotes, setRemotes] = useState<RemotePeer[]>([])
  const [error, setError] = useState<Error | null>(null)
  const [speakerUserIds, setSpeakerUserIds] = useState<Set<string>>(new Set())
  const [pendingHands, setPendingHands] = useState<PendingHand[]>([])
  const [handRaised, setHandRaised] = useState(false)
  const [chatMsgs, setChatMsgs] = useState<ChatMsg[]>([])
  const [talkingUserIds, setTalkingUserIds] = useState<Set<string>>(new Set())
  const vadMapRef = useRef<Map<string, { ctx: AudioContext; timer: number }>>(new Map())

  const socketRef = useRef<Socket | null>(null)
  const localStreamRef = useRef<MediaStream | null>(null)
  const peersRef = useRef<Map<string, PeerEntry>>(new Map())
  const iceServersRef = useRef<IceServer[]>([])
  const selfUserIdRef = useRef<string | undefined>(selfUserId)
  useEffect(() => { selfUserIdRef.current = selfUserId }, [selfUserId])

  const myRole: 'speaker' | 'listener' =
    selfUserId && speakerUserIds.has(selfUserId) ? 'speaker' : 'listener'

  const refreshRemotes = useCallback(() => {
    const next: RemotePeer[] = []
    peersRef.current.forEach((entry, peerId) => {
      next.push({
        peerId,
        userId: entry.userId,
        username: entry.username,
        avatarUrl: entry.avatarUrl,
        stream: entry.stream,
      })
    })
    setRemotes(next)
  }, [])

  const ensurePeer = useCallback(
    (peerId: string, userId: string | null, username: string | null, avatarUrl: string | null): PeerEntry => {
      const existing = peersRef.current.get(peerId)
      if (existing) {
        let changed = false
        if (!existing.userId && userId) {
          existing.userId = userId
          changed = true
        }
        if (!existing.username && username) {
          existing.username = username
          changed = true
        }
        if (!existing.avatarUrl && avatarUrl) {
          existing.avatarUrl = avatarUrl
          changed = true
        }
        if (changed) refreshRemotes()
        return existing
      }

      const pc = new RTCPeerConnection({ iceServers: iceServersRef.current })
      const stream = new MediaStream()
      const entry: PeerEntry = { pc, userId, username, avatarUrl, stream, pendingIce: [] }
      peersRef.current.set(peerId, entry)
      // Surface the peer to the UI now — don't wait for ontrack, otherwise
      // listeners only appear after WebRTC negotiation completes.
      refreshRemotes()

      const local = localStreamRef.current
      if (local) {
        for (const track of local.getTracks()) pc.addTrack(track, local)
      }

      pc.ontrack = (e) => {
        const remoteStream = e.streams[0]
        if (!remoteStream) return
        remoteStream.getTracks().forEach((t) => {
          if (!stream.getTracks().includes(t)) stream.addTrack(t)
        })
        refreshRemotes()
        if (!vadMapRef.current.has(peerId)) {
          try {
            const vadCtx = new AudioContext()
            void vadCtx.resume()
            const src = vadCtx.createMediaStreamSource(remoteStream)
            const analyser = vadCtx.createAnalyser()
            analyser.fftSize = 512
            src.connect(analyser)
            const buf = new Uint8Array(analyser.frequencyBinCount)
            const timer = setInterval(() => {
              analyser.getByteFrequencyData(buf)
              const rms = buf.reduce((a, b) => a + b, 0) / buf.length
              const uid = peersRef.current.get(peerId)?.userId
              if (!uid) return
              setTalkingUserIds(prev => {
                const talking = rms > 10
                if (talking === prev.has(uid)) return prev
                const next = new Set(prev)
                talking ? next.add(uid) : next.delete(uid)
                return next
              })
            }, 100)
            vadMapRef.current.set(peerId, { ctx: vadCtx, timer })
          } catch { /* VAD unavailable */ }
        }
      }

      pc.onicecandidate = (e) => {
        if (e.candidate) {
          socketRef.current?.emit('signal', {
            to: peerId,
            type: 'ice',
            candidate: e.candidate.toJSON(),
          })
        }
      }

      pc.onconnectionstatechange = () => {
        if (
          pc.connectionState === 'failed' ||
          pc.connectionState === 'closed'
        ) {
          peersRef.current.delete(peerId)
          refreshRemotes()
        }
      }

      return entry
    },
    [refreshRemotes],
  )

  const dropPeer = useCallback(
    (peerId: string) => {
      const entry = peersRef.current.get(peerId)
      if (entry) entry.pc.close()
      const vadEntry = vadMapRef.current.get(peerId)
      if (vadEntry) {
        clearInterval(vadEntry.timer)
        void vadEntry.ctx.close()
        vadMapRef.current.delete(peerId)
      }
      const uid = entry?.userId
      if (uid) setTalkingUserIds(prev => { const n = new Set(prev); n.delete(uid); return n })
      peersRef.current.delete(peerId)
      refreshRemotes()
    },
    [refreshRemotes],
  )

  useEffect(() => {
    if (!roomId) return
    let cancelled = false

    async function start() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: false,
        })
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop())
          return
        }
        stream.getAudioTracks().forEach((t) => { t.enabled = false })
        localStreamRef.current = stream

        try {
          const selfVadCtx = new AudioContext()
          void selfVadCtx.resume()
          const selfSrc = selfVadCtx.createMediaStreamSource(stream)
          const selfAnalyser = selfVadCtx.createAnalyser()
          selfAnalyser.fftSize = 512
          selfSrc.connect(selfAnalyser)
          const selfBuf = new Uint8Array(selfAnalyser.frequencyBinCount)
          const selfTimer = setInterval(() => {
            selfAnalyser.getByteFrequencyData(selfBuf)
            const rms = selfBuf.reduce((a, b) => a + b, 0) / selfBuf.length
            const uid = selfUserIdRef.current
            if (!uid) return
            setTalkingUserIds(prev => {
              const talking = rms > 10
              if (talking === prev.has(uid)) return prev
              const next = new Set(prev)
              talking ? next.add(uid) : next.delete(uid)
              return next
            })
          }, 100)
          vadMapRef.current.set('self', { ctx: selfVadCtx, timer: selfTimer })
        } catch { /* VAD unavailable */ }

        const ice = await voiceApi.turnCredentials()
        if (cancelled) return
        iceServersRef.current = ice.iceServers

        const token = tokenStore.get()
        const socket = io(`${SOCKET_URL}/voice`, {
          auth: { token },
          transports: ['websocket'],
        })
        socketRef.current = socket

        socket.on('connect', () => {
          if (cancelled) return
          setConnected(true)
          socket.emit('join', { roomId })
        })

        socket.on('disconnect', () => setConnected(false))

        socket.on('connect_error', (err: Error) => {
          if (!cancelled) setError(err)
        })

        socket.on('peers', async (peers: PeerInfo[]) => {
          // Existing peers already in the room — I initiate offers to them.
          for (const p of peers) {
            const { pc } = ensurePeer(p.peerId, p.userId, p.username, p.avatarUrl)
            try {
              const offer = await pc.createOffer()
              await pc.setLocalDescription(offer)
              socket.emit('signal', {
                to: p.peerId,
                type: 'offer',
                sdp: offer.sdp,
              })
            } catch (err) {
              if (!cancelled)
                setError(err instanceof Error ? err : new Error(String(err)))
            }
          }
        })

        socket.on('peer-joined', (info: PeerInfo) => {
          // New peer arrived after me — they will initiate, but pre-create
          // the pc so its tracks are ready when their offer lands.
          ensurePeer(info.peerId, info.userId, info.username, info.avatarUrl)
        })

        socket.on('peer-left', ({ peerId }: { peerId: string }) => {
          dropPeer(peerId)
        })

        socket.on(
          'speakers-state',
          (state: { hostUserId: string; speakerUserIds: string[] }) => {
            setSpeakerUserIds(new Set(state.speakerUserIds))
          },
        )

        socket.on('role-changed', ({ userId, role }: { userId: string; role: 'speaker' | 'listener' }) => {
          setSpeakerUserIds(prev => {
            const next = new Set(prev)
            if (role === 'speaker') next.add(userId)
            else next.delete(userId)
            return next
          })
          setPendingHands(prev => prev.filter(h => h.userId !== userId))
          if (userId === selfUserIdRef.current && role === 'speaker') {
            setHandRaised(false)
          }
        })

        socket.on('hand-raised', (info: PendingHand) => {
          setPendingHands(prev =>
            prev.some(p => p.userId === info.userId) ? prev : [...prev, info],
          )
        })

        socket.on('pending-hands', (list: PendingHand[]) => {
          setPendingHands(list)
        })

        socket.on('hand-denied', () => {
          setHandRaised(false)
        })

        socket.on('chat-msg', (msg: ChatMsg) => {
          setChatMsgs(prev => [...prev, msg])
        })

        socket.on('signal', async (msg: SignalMsg) => {
          const entry = ensurePeer(msg.from, null, null, null)
          const pc = entry.pc
          try {
            if (msg.type === 'offer' && msg.sdp) {
              await pc.setRemoteDescription({ type: 'offer', sdp: msg.sdp })
              for (const c of entry.pendingIce) await pc.addIceCandidate(c)
              entry.pendingIce.length = 0
              const answer = await pc.createAnswer()
              await pc.setLocalDescription(answer)
              socket.emit('signal', {
                to: msg.from,
                type: 'answer',
                sdp: answer.sdp,
              })
            } else if (msg.type === 'answer' && msg.sdp) {
              await pc.setRemoteDescription({ type: 'answer', sdp: msg.sdp })
              for (const c of entry.pendingIce) await pc.addIceCandidate(c)
              entry.pendingIce.length = 0
            } else if (msg.type === 'ice' && msg.candidate) {
              if (pc.remoteDescription) await pc.addIceCandidate(msg.candidate)
              else entry.pendingIce.push(msg.candidate)
            }
          } catch (err) {
            if (!cancelled)
              setError(err instanceof Error ? err : new Error(String(err)))
          }
        })
      } catch (err) {
        if (!cancelled)
          setError(err instanceof Error ? err : new Error(String(err)))
      }
    }

    void start()

    return () => {
      cancelled = true
      // Tell the server we're leaving so peer-left/role-changed broadcast
      // immediately, instead of waiting on the websocket disconnect timeout.
      socketRef.current?.emit('leave')
      socketRef.current?.disconnect()
      socketRef.current = null
      peersRef.current.forEach(({ pc }) => pc.close())
      peersRef.current.clear()
      localStreamRef.current?.getTracks().forEach((t) => t.stop())
      localStreamRef.current = null
      vadMapRef.current.forEach(({ ctx, timer }) => {
        clearInterval(timer)
        void ctx.close()
      })
      vadMapRef.current.clear()
      setConnected(false)
      setRemotes([])
      setSpeakerUserIds(new Set())
      setPendingHands([])
      setHandRaised(false)
      setMuted(true)
      setChatMsgs([])
      setTalkingUserIds(new Set())
    }
  }, [roomId, ensurePeer, dropPeer])

  const toggleMute = useCallback(() => {
    // Listeners can't broadcast — keep tracks disabled and force muted=true.
    if (selfUserIdRef.current && !speakerUserIds.has(selfUserIdRef.current)) {
      setMuted(true)
      const tracks = localStreamRef.current?.getAudioTracks() ?? []
      tracks.forEach((t) => { t.enabled = false })
      return
    }
    setMuted((prev) => {
      const next = !prev
      const tracks = localStreamRef.current?.getAudioTracks() ?? []
      tracks.forEach((t) => {
        t.enabled = !next
      })
      return next
    })
  }, [speakerUserIds])

  // Demotion safeguard: if the user is no longer a speaker (e.g. host revoked,
  // or initial state arrives after default), force-mute their tracks.
  useEffect(() => {
    const me = selfUserIdRef.current
    if (!me || speakerUserIds.has(me)) return
    setMuted(true)
    const tracks = localStreamRef.current?.getAudioTracks() ?? []
    tracks.forEach((t) => { t.enabled = false })
  }, [speakerUserIds])

  const sendChatMessage = useCallback((text: string) => {
    socketRef.current?.emit('chat-msg', { text })
  }, [])

  const raiseHand = useCallback(() => {
    if (!socketRef.current) return
    setHandRaised(true)
    socketRef.current.emit('raise-hand')
  }, [])

  const approveHand = useCallback((userId: string) => {
    socketRef.current?.emit('approve-hand', { userId })
  }, [])

  const denyHand = useCallback((userId: string) => {
    socketRef.current?.emit('deny-hand', { userId })
    setPendingHands(prev => prev.filter(h => h.userId !== userId))
  }, [])

  return {
    connected,
    muted,
    remotes,
    error,
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
    talkingUserIds,
  }
}
