// One call session shared by the audio and video screens, so switching between them
// continues the same call instead of dialing again.
import { useEffect, useState } from 'react'
import { readRouteId } from '../../navigation/routes'

const sounds = `${import.meta.env.BASE_URL}assets/sounds/`
const CONNECT_AFTER = 3000

type Session = { peer: string; startedAt: number; connectedAt: number | null }
let session: Session | null = null

function play(name: string, loop = false) {
  const audio = new Audio(`${sounds}${name}.mp3`)
  audio.loop = loop
  // Browsers block sound until the first tap; a call opened by a tap is fine.
  void audio.play().catch(() => {})
  return audio
}

/** Moving to the other call screen of the same peer keeps the call alive. */
function isSwitching(peer: string) {
  return /^#\/(audio|video)-call\b/.test(window.location.hash) && readRouteId() === peer
}

/**
 * Returns when the call connected (null while dialing). Plays ringback while dialing,
 * a chime on connect and a hang-up tone when the call really ends.
 */
export function useCallSession(peer: string) {
  const [connectedAt, setConnectedAt] = useState(() => (session?.peer === peer ? session.connectedAt : null))

  useEffect(() => {
    if (session?.peer !== peer) session = { peer, startedAt: Date.now(), connectedAt: null }
    const current = session
    let ringing: HTMLAudioElement | null = null
    let timer = 0
    if (current.connectedAt === null) {
      ringing = play('ringing', true)
      timer = window.setTimeout(() => {
        ringing?.pause()
        current.connectedAt = Date.now()
        setConnectedAt(current.connectedAt)
        play('connected')
      }, Math.max(0, current.startedAt + CONNECT_AFTER - Date.now()))
    }

    return () => {
      window.clearTimeout(timer)
      ringing?.pause()
      // StrictMode's instant remount and audio⇄video switches land here with a call route.
      if (isSwitching(peer)) return
      session = null
      play('call-end')
    }
  }, [peer])

  return connectedAt
}

/** Whole seconds since connect, ticking every second. */
export function useCallSeconds(connectedAt: number | null) {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    if (connectedAt === null) return
    const timer = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(timer)
  }, [connectedAt])
  return connectedAt === null ? 0 : Math.max(0, Math.floor((now - connectedAt) / 1000))
}
