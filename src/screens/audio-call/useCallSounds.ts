import { useEffect } from 'react'

const sounds = `${import.meta.env.BASE_URL}assets/sounds/`

function play(name: string, loop = false) {
  const audio = new Audio(`${sounds}${name}.mp3`)
  audio.loop = loop
  // Browsers block sound until the first tap; a call opened by a tap is fine.
  void audio.play().catch(() => {})
  return audio
}

/** Ringback while connecting, a chime on connect, and a hang-up tone when the call screen closes. */
export function useCallSounds(connected: boolean) {
  useEffect(() => {
    if (connected) {
      play('connected')
      return
    }
    const ringing = play('ringing', true)
    return () => ringing.pause()
  }, [connected])

  useEffect(() => {
    const openedAt = Date.now()
    return () => {
      // StrictMode remounts instantly in development; only a real hang-up plays the tone.
      if (Date.now() - openedAt > 300) play('call-end')
    }
  }, [])
}
