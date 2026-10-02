// Bottom sheet for buttons that do nothing yet in the prototype.
// Any button calls showStub(); one <StubSheet /> per screen listens and opens.
import { useEffect, useRef, useState } from 'react'
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
  const [closing, setClosing] = useState(false)
  const ok = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    function onShow(event: Event) {
      const variant = variants[Math.floor(Math.random() * variants.length)]
      const title = (event as CustomEvent<string | undefined>).detail
      setClosing(false)
      setContent(title ? { ...variant, title } : variant)
    }
    window.addEventListener(STUB_EVENT, onShow)
    return () => window.removeEventListener(STUB_EVENT, onShow)
  }, [])

  useEffect(() => {
    if (!content) return
    // No autoFocus: focusing the off-screen button mid-animation would scroll the whole phone screen.
    ok.current?.focus({ preventScroll: true })
    const onKey = (event: KeyboardEvent) => event.key === 'Escape' && setClosing(true)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [content])

  if (!content) return null

  return (
    <div className={`${styles.backdrop} ${closing ? styles.closing : ''}`} onClick={() => setClosing(true)}
      onAnimationEnd={(event) => closing && event.target === event.currentTarget && setContent(null)}>
      <div className={styles.sheet} role="dialog" aria-modal="true" aria-labelledby="stub-title"
        onClick={(event) => event.stopPropagation()}>
        <span className={styles.grabber} aria-hidden="true" />
        <span className={styles.emoji} aria-hidden="true">{content.emoji}</span>
        <h2 id="stub-title" className={styles.title}>{content.title}</h2>
        <p className={styles.text}>Это прототип: кнопка появится в следующих версиях. А пока можно посмотреть чаты, истории и поиск.</p>
        <button ref={ok} type="button" className={styles.ok} onClick={() => setClosing(true)}>Понятно</button>
      </div>
    </div>
  )
}
