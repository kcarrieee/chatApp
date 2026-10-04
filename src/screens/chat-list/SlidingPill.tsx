import { motion } from 'motion/react'
import { spring } from './springs'

/**
 * Selected-item background that glides between siblings sharing the same `group`.
 * Render it inside the selected item; the item needs `position: relative`.
 */
export function SlidingPill({ group, className }: { group: string; className?: string }) {
  return <motion.span layoutId={group} className={className} transition={spring} aria-hidden="true" />
}
