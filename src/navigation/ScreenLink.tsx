import type { ReactNode } from 'react'
import type { ScreenPath } from './routes'

export function ScreenLink({ to, children, className }: {
  to: ScreenPath
  children: ReactNode
  className?: string
}) {
  return <a href={`#${to}`} className={className}>{children}</a>
}
