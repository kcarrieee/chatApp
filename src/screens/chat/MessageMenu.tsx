// Long-press menu: dims the chat, shows the message and its actions, iOS-style.
import { useEffect, useRef } from 'react'
import { motion } from 'motion/react'
import { softSpring } from '../chat-list/springs'
import styles from './MessageMenu.module.css'

export type MenuAction = 'reply' | 'copy' | 'forward' | 'delete'

const actions: { id: MenuAction; label: string; icon: string; danger?: boolean }[] = [
  { id: 'reply', label: 'Ответить', icon: 'M9 7 4 12l5 5M4 12h10a6 6 0 0 1 6 6' },
  { id: 'copy', label: 'Копировать', icon: 'M9 9h10v10H9zM5 15V5h10' },
  { id: 'forward', label: 'Переслать', icon: 'm15 7 5 5-5 5M20 12H10a6 6 0 0 0-6 6' },
  { id: 'delete', label: 'Удалить', icon: 'M5 7h14M10 7V5h4v2M7 7l1 12h8l1-12', danger: true },
]

export function MessageMenu({ author, text, out, canCopy, onAction, onClose }: {
  author: string
  text: string
  out?: boolean
  canCopy: boolean
  onAction: (action: MenuAction) => void
  onClose: () => void
}) {
  const first = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    first.current?.focus({ preventScroll: true })
    const onKey = (event: KeyboardEvent) => event.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <motion.div className={styles.backdrop} onClick={onClose}
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }}>
      <motion.div className={`${styles.stack} ${out ? styles.out : ''}`} role="menu" aria-label="Действия с сообщением"
        onClick={(event) => event.stopPropagation()}
        initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.94, opacity: 0 }}
        transition={softSpring}>
        <div className={styles.preview}>
          <span className={styles.author}>{author}</span>
          <span className={styles.previewText}>{text}</span>
        </div>
        <div className={styles.menu}>
          {actions.filter((action) => canCopy || action.id !== 'copy').map((action, i) => (
            <button key={action.id} ref={i === 0 ? first : undefined} type="button" role="menuitem"
              className={`${styles.item} ${action.danger ? styles.danger : ''}`} onClick={() => onAction(action.id)}>
              {action.label}
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
                strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d={action.icon} />
              </svg>
            </button>
          ))}
        </div>
      </motion.div>
    </motion.div>
  )
}
