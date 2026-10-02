import { initials, type Person } from './chats'
import styles from './ChatListScreen.module.css'

const RING_LENGTH = 2 * Math.PI * 30

export function Avatar({ person, size = 'large', seen }: {
  person: Pick<Person, 'name' | 'avatar' | 'color' | 'stories'>
  size?: 'large' | 'small'
  /** All stories watched: the ring turns grey. */
  seen?: boolean
}) {
  const stories = person.stories ?? 0
  // Several stories split the ring into segments with small round-capped gaps.
  const dash = stories > 1 ? `${RING_LENGTH / stories - 6} 6` : undefined

  return (
    <span className={`${styles.avatar} ${styles[size]} ${stories ? styles.withStory : ''}`}>
      {person.avatar
        ? <img className={styles.photo} src={person.avatar} alt="" />
        : <span className={styles.photo} style={{ background: person.color }}>{initials(person.name)}</span>}
      {stories > 0 && (
        <svg className={`${styles.ring} ${seen ? styles.seen : ''}`} viewBox="0 0 62 62" aria-label="Есть истории">
          <circle cx="31" cy="31" r="30" strokeDasharray={dash} />
        </svg>
      )}
    </span>
  )
}
