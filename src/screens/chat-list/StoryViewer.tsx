// Full-screen story viewer: no mockup yet, built in the style of the chat screens.
import { useEffect, useState } from 'react'
import type { StoryUser } from './chats'
import styles from './StoryViewer.module.css'

export function StoryViewer({ users, start, onSeen, onClose }: {
  users: StoryUser[]
  start: number
  onSeen: (id: string) => void
  onClose: () => void
}) {
  const [position, setPosition] = useState({ user: start, story: 0 })
  const [paused, setPaused] = useState(false)
  const [liked, setLiked] = useState<string[]>([])
  const user = users[position.user]
  const story = user.stories[position.story]
  const key = `${user.id}-${position.story}`

  useEffect(() => onSeen(user.id), [user.id, onSeen])

  function next() {
    if (position.story + 1 < user.stories.length) setPosition({ ...position, story: position.story + 1 })
    else if (position.user + 1 < users.length) setPosition({ user: position.user + 1, story: 0 })
    else onClose()
  }

  function prev() {
    if (position.story > 0) setPosition({ ...position, story: position.story - 1 })
    else if (position.user > 0) setPosition({ user: position.user - 1, story: 0 })
  }

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.target instanceof HTMLInputElement) return
      if (event.key === 'Escape') onClose()
      if (event.key === 'ArrowRight') next()
      if (event.key === 'ArrowLeft') prev()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  return (
    <div className={`${styles.viewer} ${paused ? styles.paused : ''}`} aria-label={`История: ${user.name}`}
      onPointerDown={() => setPaused(true)} onPointerUp={() => setPaused(false)} onPointerLeave={() => setPaused(false)}>
      <img key={key} className={styles.image} src={story.image} alt="" />

      <div className={styles.top}>
        <div className={styles.progress}>
          {user.stories.map((_, i) => (
            <span key={i} className={styles.segment}>
              {i < position.story && <i className={styles.done} />}
              {/* The running bar drives auto-advance: its animation end opens the next story. */}
              {i === position.story && <i key={key} className={styles.running} onAnimationEnd={next} />}
            </span>
          ))}
        </div>
        <div className={styles.author}>
          <img src={user.avatar} alt="" width={32} height={32} />
          <span className={styles.name}>{user.mine ? 'Моя история' : user.name}</span>
          <span className={styles.time}>{story.time}</span>
          <button type="button" className={styles.close} aria-label="Закрыть"
            onPointerDown={(event) => event.stopPropagation()} onClick={onClose}>×</button>
        </div>
      </div>

      <button type="button" className={styles.prevZone} aria-label="Предыдущая история" onClick={prev} />
      <button type="button" className={styles.nextZone} aria-label="Следующая история" onClick={next} />

      {story.caption && <p className={styles.caption}>{story.caption}</p>}

      <div className={styles.bottom} onPointerDown={(event) => event.stopPropagation()}>
        {user.mine ? (
          <span className={styles.views}>👁 12 просмотров</span>
        ) : (
          <>
            <input className={styles.reply} placeholder="Ответить…"
              onFocus={() => setPaused(true)} onBlur={() => setPaused(false)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') event.currentTarget.value = ''
              }} />
            <button type="button" className={styles.like} aria-pressed={liked.includes(key)} aria-label="Нравится"
              onClick={() => setLiked(liked.includes(key) ? liked.filter((item) => item !== key) : [...liked, key])}>
              {liked.includes(key) ? '❤️' : '🤍'}
            </button>
          </>
        )}
      </div>
    </div>
  )
}
