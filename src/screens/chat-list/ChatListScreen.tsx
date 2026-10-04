import { useCallback, useEffect, useRef, useState, type CSSProperties } from 'react'
import { ScreenLink } from '../../navigation/ScreenLink'
import { routes } from '../../navigation/routes'
import { chats, folders, storyUsers, type Chat, type FolderId, type StoryUser } from './chats'
import { Avatar } from './Avatar'
import { CallsTab, ContactsTab } from './tabs'
import { MyProfile } from './MyProfile'
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
import { StubSheet } from './StubSheet'
import './theme'
import { showStub } from './stub'
import { SlidingPill } from './SlidingPill'
import { motion, MotionConfig } from 'motion/react'
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
  // Respect the system "reduce motion" setting for every motion component inside.
  return <MotionConfig reducedMotion="user"><ChatListContent /></MotionConfig>
}

function ChatListContent() {
  const [tab, setTab] = useState<Tab>('chats')
  const [searching, setSearching] = useState(false)
  // Lives here, so the stories row stays open after closing the viewer.
  const [storiesOpen, setStoriesOpen] = useState(false)
  // The stories row plays everyone in a row, an avatar in the list plays one person only.
  const [viewing, setViewing] = useState<{ users: StoryUser[]; start: number } | null>(null)
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
        <StoryViewer users={viewing.users} start={viewing.start} onSeen={markSeen} onClose={() => setViewing(null)} />
        <StubSheet />
      </section>
    )
  }

  if (searching) {
    return (
      <section className={styles.screen} aria-label="Поиск">
        <Search onClose={() => setSearching(false)} />
        <StubSheet />
      </section>
    )
  }

  return (
    <section className={styles.screen} aria-label={tabs.find((item) => item.id === tab)?.label ?? 'Профиль'}>
      {/* Tab content fades up on switch instead of popping in. */}
      <motion.div key={tab} className={styles.tabContent}
        initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.22, ease: 'easeOut' }}>
        {tab === 'chats' && (
          <ChatsTab storiesOpen={storiesOpen} onStoriesOpen={setStoriesOpen} seen={seen} onOpenStory={(users, start) => setViewing({ users, start })} />
        )}
        {tab === 'contacts' && <ContactsTab />}
        {tab === 'calls' && <CallsTab />}
        {tab === 'profile' && <MyProfile onBack={() => setTab('chats')} />}
      </motion.div>

      <nav className={styles.tabBar} aria-label="Разделы">
        <div className={`${styles.tabs} ${styles.glass}`}>
          {tabs.map((item) => (
            <button key={item.id} type="button" className={styles.tab} aria-label={item.label}
              aria-current={tab === item.id ? 'page' : undefined}
              onClick={(event) => open(item.id, event.currentTarget.closest('section'))}>
              {tab === item.id && <SlidingPill group="tab-bar" className={styles.pillBg} />}
              <span className={styles.tabIcon} style={{ '--icon': `url("${item.icon}")` } as CSSProperties} />
            </button>
          ))}
          <button type="button" className={styles.tab} aria-label="Мой профиль"
            aria-current={tab === 'profile' ? 'page' : undefined}
            onClick={(event) => open('profile', event.currentTarget.closest('section'))}>
            {tab === 'profile' && <SlidingPill group="tab-bar" className={styles.pillBg} />}
            <img className={styles.me} src={me} alt="" width={28} height={28} />
          </button>
        </div>
        <button type="button" className={`${styles.search} ${styles.glass}`} aria-label="Поиск"
          onClick={() => setSearching(true)}>
          <img src={searchIcon} alt="" width={24} height={24} />
        </button>
      </nav>
      <StubSheet />
    </section>
  )
}

function ChatsTab({ storiesOpen, onStoriesOpen, seen, onOpenStory }: {
  storiesOpen: boolean
  onStoriesOpen: (open: boolean) => void
  seen: string[]
  onOpenStory: (users: StoryUser[], start: number) => void
}) {
  const [folder, setFolder] = useState<FolderId>('all')
  const visible = folder === 'all' ? chats : chats.filter((chat) => chat.folder === folder)
  const header = useRef<HTMLElement>(null)

  // Pulling the list down at the very top unfolds the stories row: touch swipe,
  // mouse drag, or trackpad / wheel scroll up.
  useEffect(() => {
    const screen = header.current?.closest('section')
    if (storiesOpen || !screen) return
    const PULL = 48
    let startY: number | null = null
    const begin = (y: number) => { startY = screen.scrollTop <= 0 ? y : null }
    const move = (y: number) => {
      if (startY !== null && y - startY > PULL) {
        startY = null
        onStoriesOpen(true)
      }
    }
    const end = () => { startY = null }
    const onTouchStart = (event: TouchEvent) => begin(event.touches[0].clientY)
    const onTouchMove = (event: TouchEvent) => move(event.touches[0].clientY)
    const onPointerDown = (event: PointerEvent) => event.pointerType === 'mouse' && begin(event.clientY)
    const onPointerMove = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse' || startY === null) return
      if (event.clientY - startY > PULL) {
        // Releasing the mouse over a chat row would otherwise open that chat.
        screen.addEventListener('click', (click) => click.preventDefault(), { capture: true, once: true })
      }
      move(event.clientY)
    }
    const onWheel = (event: WheelEvent) => screen.scrollTop <= 0 && event.deltaY < -20 && onStoriesOpen(true)
    screen.addEventListener('touchstart', onTouchStart, { passive: true })
    screen.addEventListener('touchmove', onTouchMove, { passive: true })
    screen.addEventListener('touchend', end)
    screen.addEventListener('pointerdown', onPointerDown)
    screen.addEventListener('pointermove', onPointerMove)
    window.addEventListener('pointerup', end)
    screen.addEventListener('wheel', onWheel, { passive: true })
    return () => {
      screen.removeEventListener('touchstart', onTouchStart)
      screen.removeEventListener('touchmove', onTouchMove)
      screen.removeEventListener('touchend', end)
      screen.removeEventListener('pointerdown', onPointerDown)
      screen.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pointerup', end)
      screen.removeEventListener('wheel', onWheel)
    }
  }, [storiesOpen, onStoriesOpen])

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
          <button type="button" onClick={() => showStub()} className={styles.iconButton} aria-label="Новый чат">
            <img src={editIcon} alt="" width={24} height={24} />
          </button>
          <button type="button" onClick={() => showStub()} className={styles.iconButton} aria-label="Ещё">
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
              <button key={user.id} type="button" className={styles.storyItem} onClick={() => onOpenStory(viewable, i)}>
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
              {folder === item.id && <SlidingPill group="folders" className={styles.pillBg} />}
              {item.label}
              {!!item.badge && (
                <span className={`${styles.mark} ${item.accent ? styles.accent : ''}`}>{item.badge}</span>
              )}
            </button>
          ))}
        </div>
      </header>

      <ul className={styles.list}>
        {visible.map((chat) => {
          const storyUser = viewable.find((user) => user.id === chat.id)
          return (
            <li key={chat.id} className={styles.rowItem}>
              <ChatRow chat={chat} seen={seen.includes(chat.id)} />
              {/* Sibling of the row link (a button can't sit inside a link), laid over the avatar. */}
              {storyUser && (
                <button type="button" className={styles.avatarStory} aria-label={`История: ${chat.name}`}
                  onClick={() => onOpenStory([storyUser], 0)} />
              )}
            </li>
          )
        })}
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
