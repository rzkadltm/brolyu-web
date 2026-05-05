import { useCallback, useEffect, useRef, useState } from 'react'
import { io, type Socket } from 'socket.io-client'
import { tokenStore } from '../../lib/api'
import { voiceApi, type IceServer } from './api'

export interface RemotePeer {
  peerId: string
  username: string | null
  stream: MediaStream
}

interface PeerEntry {
  pc: RTCPeerConnection
  username: string | null
  stream: MediaStream
  pendingIce: RTCIceCandidateInit[]
}

interface PeerInfo {
  peerId: string
  username: string | null
}

interface SignalMsg {
  from: string
  type: 'offer' | 'answer' | 'ice'
  sdp?: string
  candidate?: RTCIceCandidateInit
}

const SOCKET_URL = (
  import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000'
).replace(/\/$/, '')

// Mesh-topology WebRTC voice for a single room. Each tab is its own peer;
// all peers connect pairwise. Designed for ~2-6 participants — replace with
// an SFU when listener counts grow.
export function useVoice(roomId: string | undefined) {
  const [connected, setConnected] = useState(false)
  const [muted, setMuted] = useState(false)
  const [remotes, setRemotes] = useState<RemotePeer[]>([])
  const [error, setError] = useState<Error | null>(null)

  const socketRef = useRef<Socket | null>(null)
  const localStreamRef = useRef<MediaStream | null>(null)
  const peersRef = useRef<Map<string, PeerEntry>>(new Map())
  const iceServersRef = useRef<IceServer[]>([])

  const refreshRemotes = useCallback(() => {
    const next: RemotePeer[] = []
    peersRef.current.forEach((entry, peerId) => {
      next.push({ peerId, username: entry.username, stream: entry.stream })
    })
    setRemotes(next)
  }, [])

  const ensurePeer = useCallback(
    (peerId: string, username: string | null): PeerEntry => {
      const existing = peersRef.current.get(peerId)
      if (existing) {
        // Backfill username if signal-driven creation got there first with null.
        if (!existing.username && username) {
          existing.username = username
          refreshRemotes()
        }
        return existing
      }

      const pc = new RTCPeerConnection({ iceServers: iceServersRef.current })
      const stream = new MediaStream()
      const entry: PeerEntry = { pc, username, stream, pendingIce: [] }
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
        localStreamRef.current = stream

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
            const { pc } = ensurePeer(p.peerId, p.username)
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
          ensurePeer(info.peerId, info.username)
        })

        socket.on('peer-left', ({ peerId }: { peerId: string }) => {
          dropPeer(peerId)
        })

        socket.on('signal', async (msg: SignalMsg) => {
          const entry = ensurePeer(msg.from, null)
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
      socketRef.current?.disconnect()
      socketRef.current = null
      peersRef.current.forEach(({ pc }) => pc.close())
      peersRef.current.clear()
      localStreamRef.current?.getTracks().forEach((t) => t.stop())
      localStreamRef.current = null
      setConnected(false)
      setRemotes([])
    }
  }, [roomId, ensurePeer, dropPeer])

  const toggleMute = useCallback(() => {
    setMuted((prev) => {
      const next = !prev
      const tracks = localStreamRef.current?.getAudioTracks() ?? []
      tracks.forEach((t) => {
        t.enabled = !next
      })
      return next
    })
  }, [])

  return { connected, muted, remotes, error, toggleMute }
}
