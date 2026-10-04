// Bottom sheet for buttons that do nothing yet in the prototype.
// Any button calls showStub(); one <StubSheet /> per screen listens and opens.
import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { softSpring } from './springs'
import { STUB_EVENT } from './stub'
import styles from './StubSheet.module.css'

const variants = [
  { emoji: '🙈', title: 'Упс, пока не работает' },
  { emoji: '🧪', title: 'Упс, это пока только тест' },
  { emoji: '🚧', title: 'Здесь ещё идёт стройка' },
  { emoji: '🍓', title: 'Скоро тут будет что-то вкусное' },
]

export function StubSheet() {
  const [content, setContent] = useState<{ emoji: string; title: string } | null>(null)
  const ok = useRef<HTMLButtonElement>(null)
  const close = () => setContent(null)

  useEffect(() => {
    function onShow(event: Event) {
      const variant = variants[Math.floor(Math.random() * variants.length)]
      const title = (event as CustomEvent<string | undefined>).detail
      setContent(title ? { ...variant, title } : variant)
    }
    window.addEventListener(STUB_EVENT, onShow)
    return () => window.removeEventListener(STUB_EVENT, onShow)
  }, [])

  useEffect(() => {
    if (!content) return
    // No autoFocus: focusing the off-screen button mid-animation would scroll the whole phone screen.
    ok.current?.focus({ preventScroll: true })
    const onKey = (event: KeyboardEvent) => event.key === 'Escape' && setContent(null)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [content])

  return (
    <AnimatePresence>
      {content && (
        <motion.div key="stub" className={styles.backdrop} onClick={close}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
          {/* Drag down to dismiss: far or fast enough closes, otherwise it springs back. */}
          <motion.div className={styles.sheet} role="dialog" aria-modal="true" aria-labelledby="stub-title"
            onClick={(event) => event.stopPropagation()}
            initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={softSpring}
            drag="y" dragConstraints={{ top: 0, bottom: 0 }} dragElastic={{ top: 0.05, bottom: 0.6 }}
            onDragEnd={(_, info) => (info.offset.y > 90 || info.velocity.y > 500) && close()}>
            <span className={styles.grabber} aria-hidden="true" />
            <span className={styles.emoji} aria-hidden="true">{content.emoji}</span>
            <h2 id="stub-title" className={styles.title}>{content.title}</h2>
            <p className={styles.text}>Это прототип: кнопка появится в следующих версиях. А пока можно посмотреть чаты, истории и поиск.</p>
            <button ref={ok} type="button" className={styles.ok} onClick={close}>Понятно</button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
