import { useState } from 'react'
import { ScreenLink } from '../../navigation/ScreenLink'
import { routes } from '../../navigation/routes'
import { chats, folders, initials, type Chat, type FolderId } from './chats'
import stories from './assets/stories.png'
import editIcon from './assets/edit.svg'
import dotsIcon from './assets/dots.svg'
import mutedIcon from './assets/muted.svg'
import verifiedIcon from './assets/verified.svg'
import readIcon from './assets/read.svg'
import contactsIcon from './assets/contacts.svg'
import callsIcon from './assets/calls.svg'
import chatsIcon from './assets/chats.svg'
import searchIcon from './assets/search.svg'
import me from './assets/me.png'
import styles from './ChatListScreen.module.css'

export function ChatListScreen() {
  const [folder, setFolder] = useState<FolderId>('all')
  const visible = folder === 'all' ? chats : chats.filter((chat) => chat.folder === folder)

  return (
    <section className={styles.screen} aria-label="Список чатов">
      <header className={styles.header}>
        <div className={styles.titleRow}>
          <h1 className={styles.title}>Чаты</h1>
          {/* Opens the stories viewer later. */}
          <button type="button" className={styles.stories} aria-label="Истории">
            <img src={stories} alt="" width={60} height={32} />
          </button>
          <button type="button" className={styles.iconButton} aria-label="Новый чат">
            <img src={editIcon} alt="" width={24} height={24} />
          </button>
          <button type="button" className={styles.iconButton} aria-label="Ещё">
            <img src={dotsIcon} alt="" width={24} height={24} />
          </button>
        </div>
        <div className={`${styles.folders} ${styles.glass}`} role="group" aria-label="Папки">
          {folders.map((item) => (
            <button key={item.id} type="button" aria-pressed={folder === item.id}
              className={styles.folder} onClick={() => setFolder(item.id)}>
              {item.label}
              {!!item.badge && (
                <span className={`${styles.mark} ${item.accent ? styles.accent : ''}`}>{item.badge}</span>
              )}
            </button>
          ))}
        </div>
      </header>

      <ul className={styles.list}>
        {visible.map((chat) => <li key={chat.id}><ChatRow chat={chat} /></li>)}
      </ul>

      <nav className={styles.tabBar} aria-label="Разделы">
        <div className={`${styles.tabs} ${styles.glass}`}>
          <button type="button" className={styles.tab} aria-label="Контакты">
            <img src={contactsIcon} alt="" width={24} height={24} />
          </button>
          <button type="button" className={styles.tab} aria-label="Звонки">
            <img src={callsIcon} alt="" width={24} height={24} />
          </button>
          <button type="button" className={styles.tab} aria-label="Чаты" aria-current="page">
            <img src={chatsIcon} alt="" width={24} height={24} />
          </button>
          <button type="button" className={styles.tab} aria-label="Мой профиль">
            <img className={styles.me} src={me} alt="" width={28} height={28} />
          </button>
        </div>
        <button type="button" className={`${styles.search} ${styles.glass}`} aria-label="Поиск">
          <img src={searchIcon} alt="" width={24} height={24} />
        </button>
      </nav>
    </section>
  )
}

function ChatRow({ chat }: { chat: Chat }) {
  return (
    <ScreenLink to={routes.chat} className={styles.row}>
      <Avatar chat={chat} />
      <div className={styles.content}>
        <div className={styles.main}>
          <div className={styles.name}>
            <span className={styles.nameText}>{chat.name}</span>
            {chat.verified && <img src={verifiedIcon} alt="Подтверждённый" width={12} height={12} />}
            {chat.muted && <img src={mutedIcon} alt="Без звука" width={11} height={12} />}
          </div>
          {chat.sender && <div className={styles.sender}>{chat.sender}</div>}
          <p className={`${styles.message} ${chat.sender ? styles.oneLine : ''}`}>{chat.message}</p>
        </div>
        <div className={styles.trailing}>
          <span className={styles.time}>
            {chat.read && <img src={readIcon} alt="Прочитано" width={17} height={10} />}
            {chat.time}
          </span>
          {!!chat.unread && (
            <span className={`${styles.count} ${chat.muted ? styles.countMuted : ''}`}
              aria-label={`Непрочитанных: ${chat.unread}`}>{chat.unread}</span>
          )}
        </div>
      </div>
    </ScreenLink>
  )
}

const RING_LENGTH = 2 * Math.PI * 30

function Avatar({ chat }: { chat: Chat }) {
  const stories = chat.stories ?? 0
  // Several stories split the ring into segments with small round-capped gaps.
  const dash = stories > 1 ? `${RING_LENGTH / stories - 6} 6` : undefined

  return (
    <span className={`${styles.avatar} ${stories ? styles.withStory : ''}`}>
      {chat.avatar
        ? <img className={styles.photo} src={chat.avatar} alt="" />
        : <span className={styles.photo} style={{ background: chat.color }}>{initials(chat.name)}</span>}
      {stories > 0 && (
        <svg className={styles.ring} viewBox="0 0 62 62" aria-label="Есть истории">
          <circle cx="31" cy="31" r="30" strokeDasharray={dash} />
        </svg>
      )}
    </span>
  )
}
