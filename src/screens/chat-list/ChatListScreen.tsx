import { useCallback, useEffect, useRef, useState, type CSSProperties } from 'react'
import { ScreenLink } from '../../navigation/ScreenLink'
import { routes } from '../../navigation/routes'
import { chats, folders, storyUsers, type Chat, type FolderId } from './chats'
import { Avatar } from './Avatar'
import { CallsTab, ContactsTab, ProfileTab } from './tabs'
import { Search } from './Search'
import { StoryViewer } from './StoryViewer'
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

// Own story is creation-only (flow skipped in the prototype), so the viewer shows the others.
const viewable = storyUsers.filter((user) => !user.mine)

const tabs: { id: Tab; label: string; icon: string }[] = [
  { id: 'contacts', label: 'Контакты', icon: contactsIcon },
  { id: 'calls', label: 'Звонки', icon: callsIcon },
  { id: 'chats', label: 'Чаты', icon: chatsIcon },
]

export function ChatListScreen() {
  const [tab, setTab] = useState<Tab>('chats')
  const [searching, setSearching] = useState(false)
  // Lives here, so the stories row stays open after closing the viewer.
  const [storiesOpen, setStoriesOpen] = useState(false)
  const [viewing, setViewing] = useState<number | null>(null)
  const [seen, setSeen] = useState<string[]>([])
  const markSeen = useCallback((id: string) => setSeen((ids) => ids.includes(id) ? ids : [...ids, id]), [])

  function open(next: Tab, screen: HTMLElement | null) {
    setTab(next)
    setStoriesOpen(false)
    screen?.scrollTo({ top: 0 })
  }

  if (viewing !== null) {
    return (
      <section className={styles.screen} aria-label="Истории">
        <StoryViewer users={viewable} start={viewing} onSeen={markSeen} onClose={() => setViewing(null)} />
      </section>
    )
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
      {tab === 'chats' && (
        <ChatsTab storiesOpen={storiesOpen} onStoriesOpen={setStoriesOpen} seen={seen} onOpenStory={setViewing} />
      )}
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

function ChatsTab({ storiesOpen, onStoriesOpen, seen, onOpenStory }: {
  storiesOpen: boolean
  onStoriesOpen: (open: boolean) => void
  seen: string[]
  onOpenStory: (index: number) => void
}) {
  const [folder, setFolder] = useState<FolderId>('all')
  const visible = folder === 'all' ? chats : chats.filter((chat) => chat.folder === folder)
  const header = useRef<HTMLElement>(null)

  // Any scroll down folds the stories row back into the title.
  useEffect(() => {
    const screen = header.current?.closest('section')
    if (!storiesOpen || !screen) return
    const start = screen.scrollTop
    const onScroll = () => screen.scrollTop > start + 4 && onStoriesOpen(false)
    screen.addEventListener('scroll', onScroll)
    return () => screen.removeEventListener('scroll', onScroll)
  }, [storiesOpen, onStoriesOpen])

  return (
    <>
      <header ref={header} className={styles.header}>
        <div className={styles.titleRow}>
          <h1 className={styles.title}>Чаты</h1>
          <button type="button" className={`${styles.stories} ${storiesOpen ? styles.storiesHidden : ''}`}
            aria-label="Показать истории" aria-expanded={storiesOpen} onClick={() => onStoriesOpen(true)}>
            <img src={stories} alt="" width={60} height={32} />
          </button>
          <button type="button" className={styles.iconButton} aria-label="Новый чат">
            <img src={editIcon} alt="" width={24} height={24} />
          </button>
          <button type="button" className={styles.iconButton} aria-label="Ещё">
            <img src={dotsIcon} alt="" width={24} height={24} />
          </button>
        </div>
        <div className={`${styles.storyRow} ${storiesOpen ? styles.storyRowOpen : ''}`} inert={!storiesOpen}>
          <div className={styles.storyRowInner} aria-label="Истории">
            {storyUsers.filter((user) => user.mine).map((user) => (
              // Story creation flow is out of scope, so this one is not interactive.
              <div key={user.id} className={styles.storyItem}>
                <span className={styles.myStory}>
                  <img src={user.avatar} alt="" />
                  <span className={styles.plus} aria-hidden="true">+</span>
                </span>
                <span className={styles.storyName}>{user.name}</span>
              </div>
            ))}
            {viewable.map((user, i) => (
              <button key={user.id} type="button" className={styles.storyItem} onClick={() => onOpenStory(i)}>
                <Avatar person={{ ...user, stories: user.stories.length }} seen={seen.includes(user.id)} />
                <span className={styles.storyName}>{user.name}</span>
              </button>
            ))}
          </div>
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
        {visible.map((chat) => <li key={chat.id}><ChatRow chat={chat} seen={seen.includes(chat.id)} /></li>)}
      </ul>
    </>
  )
}

function ChatRow({ chat, seen }: { chat: Chat; seen: boolean }) {
  return (
    <ScreenLink to={routes.chat} id={chat.id} className={styles.row}>
      <Avatar person={chat} seen={seen} />
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
