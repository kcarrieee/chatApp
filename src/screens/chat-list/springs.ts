// Shared motion presets: one spring feel across the prototype.
import type { Transition } from 'motion/react'

/** Snappy UI spring for indicators and small elements. */
export const spring: Transition = { type: 'spring', stiffness: 520, damping: 40, mass: 0.9 }
/** Softer spring for things that travel further, like sheets and new messages. */
export const softSpring: Transition = { type: 'spring', stiffness: 360, damping: 34 }
