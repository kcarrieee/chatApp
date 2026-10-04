// Contacts, recent calls and own profile: invented screens in the style of the chat list.
import { useState, type ReactNode } from 'react'
import { ScreenLink } from '../../navigation/ScreenLink'
import { routes } from '../../navigation/routes'
import { Avatar } from './Avatar'
import { calls, contacts, type Call } from './chats'
import callsIcon from './assets/calls.svg'
import { showStub } from './stub'
import styles from './ChatListScreen.module.css'

function Header({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <header className={styles.header}>
      <div className={styles.titleRow}>
        <h1 className={`${styles.title} ${styles.grow}`}>{title}</h1>
        {children}
      </div>
    </header>
  )
}

const PlusIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M12 5v14M5 12h14" />
  </svg>
)

const VideoIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <rect x="2" y="6" width="14" height="12" rx="3.5" />
    <path d="M17.5 10.2 21 8v8l-3.5-2.2z" />
  </svg>
)

const ArrowIcon = ({ direction }: { direction: Call['direction'] }) => (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.6"
    strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"
    style={{ transform: direction === 'in' ? 'rotate(180deg)' : undefined }}>
    <path d="M3 9 9 3M4.5 3H9v4.5" />
  </svg>
)

export function ContactsTab() {
  // Group the sorted list by first letter.
  const groups = new Map<string, typeof contacts>()
  for (const contact of contacts) {
    const letter = contact.name[0].toUpperCase()
    groups.set(letter, [...(groups.get(letter) ?? []), contact])
  }

  return (
    <>
      <Header title="Контакты">
        <button type="button" onClick={() => showStub()} className={styles.iconButton} aria-label="Добавить контакт"><PlusIcon /></button>
      </Header>
      <div className={styles.list}>
        <button type="button" onClick={() => showStub()} className={`${styles.compactRow} ${styles.action}`}>
          <span className={styles.actionIcon}><PlusIcon /></span>
          Пригласить друзей
        </button>
        {[...groups].map(([letter, people]) => (
          <section key={letter} aria-label={letter}>
            <h2 className={styles.letter}>{letter}</h2>
            {people.map((person) => (
              <ScreenLink key={person.id} to={routes.chat} id={person.id} className={styles.compactRow}>
                <Avatar person={person} size="small" />
                <span className={styles.compactText}>
                  <span className={styles.nameText}>{person.name}</span>
                  <span className={`${styles.status} ${person.status === 'в сети' ? styles.online : ''}`}>
                    {person.status}
                  </span>
                </span>
              </ScreenLink>
            ))}
          </section>
        ))}
      </div>
    </>
  )
}

export function CallsTab() {
  const [missedOnly, setMissedOnly] = useState(false)
  const visible = missedOnly ? calls.filter((call) => call.missed) : calls

  return (
    <>
      <header className={styles.header}>
        <div className={styles.titleRow}>
          <h1 className={`${styles.title} ${styles.grow}`}>Звонки</h1>
          <button type="button" onClick={() => showStub()} className={styles.iconButton} aria-label="Новый звонок"><PlusIcon /></button>
        </div>
        <div className={`${styles.folders} ${styles.glass}`} role="group" aria-label="Фильтр звонков">
          <button type="button" className={styles.folder} aria-pressed={!missedOnly} onClick={() => setMissedOnly(false)}>Все</button>
          <button type="button" className={styles.folder} aria-pressed={missedOnly} onClick={() => setMissedOnly(true)}>Пропущенные</button>
        </div>
      </header>
      <ul className={styles.list}>
        {visible.map((call) => (
          <li key={call.id} className={styles.compactRow}>
            <Avatar person={call.person} size="small" />
            <span className={styles.compactText}>
              <span className={`${styles.nameText} ${call.missed ? styles.missed : ''}`}>
                {call.person.name}{call.count && call.count > 1 ? ` (${call.count})` : ''}
              </span>
              <span className={styles.status}>
                <ArrowIcon direction={call.direction} />{' '}
                {call.missed ? 'Пропущенный' : call.direction === 'in' ? 'Входящий' : 'Исходящий'}
                {call.kind === 'video' ? ' · Видео' : ''}
              </span>
            </span>
            <span className={styles.time}>{call.time}</span>
            <ScreenLink to={call.kind === 'video' ? routes.videoCall : routes.audioCall} id={call.person.id} className={styles.callBack}>
              {call.kind === 'video' ? <VideoIcon /> : <img src={callsIcon} alt="" width={22} height={22} />}
              <span className={styles.visuallyHidden}>Позвонить {call.person.name}</span>
            </ScreenLink>
          </li>
        ))}
      </ul>
    </>
  )
}
