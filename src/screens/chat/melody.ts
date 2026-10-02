// Voice messages play a short generated tune instead of real audio (Web Audio, no files).
// The same seed always gives the same tune and waveform.

let context: AudioContext | null = null
let stopCurrent: (() => void) | null = null

// C major pentatonic over two octaves: any sequence of these sounds pleasant.
const NOTES = [261.63, 293.66, 329.63, 392, 440, 523.25, 587.33, 659.25, 783.99, 880]

function random(seed: number) {
  let state = seed || 1
  return () => {
    state = (state * 1664525 + 1013904223) % 4294967296
    return state / 4294967296
  }
}

export function hash(text: string) {
  let value = 0
  for (const char of text) value = (value * 31 + char.charCodeAt(0)) % 4294967296
  return value
}

/** Seconds from a "m:ss" label. */
export function seconds(duration: string) {
  const [m, s] = duration.split(':').map(Number)
  return m * 60 + s
}

/** Bar heights (2–14px) for a waveform that matches the tune's seed. */
export function waveform(seed: number, bars = 43) {
  const next = random(seed)
  return Array.from({ length: bars }, () => 2 + Math.round(next() * 12))
}

/** Plays a tune of the given length; returns stop(). Starting a new tune stops the previous one. */
export function playMelody(seed: number, length: number, onEnd: () => void) {
  stopCurrent?.()
  context ??= new AudioContext()
  const audio = context
  void audio.resume()

  const next = random(seed)
  const output = audio.createGain()
  output.gain.value = 0.18
  output.connect(audio.destination)

  const start = audio.currentTime + 0.05
  let time = 0
  let note = Math.floor(next() * 5) + 2
  while (time < length - 0.1) {
    // Short steps up or down keep the tune singable.
    note = Math.min(NOTES.length - 1, Math.max(0, note + Math.floor(next() * 5) - 2))
    const step = [0.25, 0.25, 0.5, 0.375][Math.floor(next() * 4)]
    const noteLength = Math.min(step, length - time)
    const osc = audio.createOscillator()
    const env = audio.createGain()
    osc.type = 'triangle'
    osc.frequency.value = NOTES[note]
    env.gain.setValueAtTime(0, start + time)
    env.gain.linearRampToValueAtTime(1, start + time + 0.02)
    env.gain.exponentialRampToValueAtTime(0.001, start + time + noteLength * 0.95)
    osc.connect(env).connect(output)
    osc.start(start + time)
    osc.stop(start + time + noteLength)
    time += step
  }

  const timer = window.setTimeout(stop, length * 1000)
  function stop() {
    window.clearTimeout(timer)
    output.disconnect()
    if (stopCurrent === stop) stopCurrent = null
    onEnd()
  }
  stopCurrent = stop
  return stop
}

/** Stops whatever is playing, e.g. when leaving the chat. */
export function stopMelody() {
  stopCurrent?.()
}
