import type { ReactNode } from 'react'
import type { ScreenPath } from './routes'

export function ScreenLink({ to, id, children, className }: {
  to: ScreenPath
  /** Which chat or contact the screen should show, read with readRouteId(). */
  id?: string
  children: ReactNode
  className?: string
}) {
  const href = id ? `#${to}?id=${encodeURIComponent(id)}` : `#${to}`
  return <a href={href} className={className}>{children}</a>
}
