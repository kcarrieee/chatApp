import { useState, type CSSProperties } from 'react'
import { ScreenLink } from '../../navigation/ScreenLink'
import { routes } from '../../navigation/routes'
import { chats, folders, type Chat, type FolderId } from './chats'
import { Avatar } from './Avatar'
import { CallsTab, ContactsTab, ProfileTab } from './tabs'
import { Search } from './Search'
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
import me from './assets/me.jpg'
import styles from './ChatListScreen.module.css'

type Tab = 'contacts' | 'calls' | 'chats' | 'profile'

const tabs: { id: Tab; label: string; icon: string }[] = [
  { id: 'contacts', label: 'Контакты', icon: contactsIcon },
  { id: 'calls', label: 'Звонки', icon: callsIcon },
  { id: 'chats', label: 'Чаты', icon: chatsIcon },
]

export function ChatListScreen() {
  const [tab, setTab] = useState<Tab>('chats')
  const [searching, setSearching] = useState(false)

  function open(next: Tab, screen: HTMLElement | null) {
    setTab(next)
    screen?.scrollTo({ top: 0 })
  }

  if (searching) {
    return (
      <section className={styles.screen} aria-label="Поиск">
        <Search onClose={() => setSearching(false)} />
      </section>
    )
  }

  return (
    <section className={styles.screen} aria-label={tabs.find((item) => item.id === tab)?.label ?? 'Профиль'}>
      {tab === 'chats' && <ChatsTab />}
      {tab === 'contacts' && <ContactsTab />}
      {tab === 'calls' && <CallsTab />}
      {tab === 'profile' && <ProfileTab />}

      <nav className={styles.tabBar} aria-label="Разделы">
        <div className={`${styles.tabs} ${styles.glass}`}>
          {tabs.map((item) => (
            <button key={item.id} type="button" className={styles.tab} aria-label={item.label}
              aria-current={tab === item.id ? 'page' : undefined}
              onClick={(event) => open(item.id, event.currentTarget.closest('section'))}>
              <span className={styles.tabIcon} style={{ '--icon': `url("${item.icon}")` } as CSSProperties} />
            </button>
          ))}
          <button type="button" className={styles.tab} aria-label="Мой профиль"
            aria-current={tab === 'profile' ? 'page' : undefined}
            onClick={(event) => open('profile', event.currentTarget.closest('section'))}>
            <img className={styles.me} src={me} alt="" width={28} height={28} />
          </button>
        </div>
        <button type="button" className={`${styles.search} ${styles.glass}`} aria-label="Поиск"
          onClick={() => setSearching(true)}>
          <img src={searchIcon} alt="" width={24} height={24} />
        </button>
      </nav>
    </section>
  )
}

function ChatsTab() {
  const [folder, setFolder] = useState<FolderId>('all')
  const visible = folder === 'all' ? chats : chats.filter((chat) => chat.folder === folder)

  return (
    <>
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
    </>
  )
}

function ChatRow({ chat }: { chat: Chat }) {
  return (
    <ScreenLink to={routes.chat} id={chat.id} className={styles.row}>
      <Avatar person={chat} />
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
