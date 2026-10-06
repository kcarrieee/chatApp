import { useState } from 'react'
import { ScreenLink } from '../../navigation/ScreenLink'
import { routes } from '../../navigation/routes'
import { Avatar } from './Avatar'
import { chats, contacts, type Chat, type Person } from './chats'
import searchIcon from './assets/search.svg'
import sticker from '../chat/assets/sticker.png'
import product from '../chat/assets/product.png'
import { TextMorph } from 'torph/react'
import { SlidingPill } from './SlidingPill'
import styles from './Search.module.css'

type Category = 'chats' | 'channels' | 'posts' | 'media' | 'downloads'

const categories: { id: Category; label: string }[] = [
  { id: 'chats', label: 'Чаты' },
  { id: 'channels', label: 'Каналы' },
  { id: 'posts', label: 'Посты' },
  { id: 'media', label: 'Медиа' },
  { id: 'downloads', label: 'Загрузки' },
]

type Result = Pick<Chat, 'id' | 'name' | 'avatar' | 'color' | 'stories'> & { subtitle: string; online?: boolean }

const statusOf = new Map(contacts.map((contact) => [contact.id, contact.status]))

function toResult(item: Chat | Person): Result {
  const status = 'status' in item ? item.status : statusOf.get(item.id)
  const members = 'members' in item ? item.members : undefined
  return { ...item, subtitle: members ?? status ?? 'недавно в сети', online: status === 'в сети' }
}

// Every chat plus contacts we have not chatted with yet.
const people: Result[] = [
  ...chats.filter((chat) => chat.folder !== 'channels').map(toResult),
  ...contacts.filter((contact) => !chats.some((chat) => chat.id === contact.id)).map(toResult),
]
const channels = chats.filter((chat) => chat.folder === 'channels').map(toResult)
const byId = new Map([...people, ...channels].map((item) => [item.id, item]))

const topIds = ['liza', 'berries', 'viki', 'andrey', 'alisa', 'elizaveta', 'katrin']
// Session storage, so recents survive leaving search to open a chat.
const RECENT_KEY = 'search-recent'
const defaultRecent = ['viki', 'andrey', 'berries', 'katrin', 'elena']

function loadRecent(): string[] {
  try {
    const saved = JSON.parse(sessionStorage.getItem(RECENT_KEY) ?? 'null')
    return Array.isArray(saved) ? saved.filter((id) => byId.has(id)) : defaultRecent
  } catch {
    return defaultRecent
  }
}

function saveRecent(ids: string[]) {
  try {
    sessionStorage.setItem(RECENT_KEY, JSON.stringify(ids))
  } catch {
    // Private mode or blocked storage: recents just reset next time.
  }
}

const normalize = (text: string) => text.toLowerCase().replaceAll('ё', 'е')

export function Search({ onClose }: { onClose: () => void }) {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<Category>('chats')
  const [recent, setRecent] = useState(loadRecent)
  const q = normalize(query.trim())
  const matches = (text: string) => normalize(text).includes(q)

  function remember(id: string) {
    saveRecent([id, ...recent.filter((item) => item !== id)].slice(0, 8))
  }

  function clearRecent() {
    saveRecent([])
    setRecent([])
  }

  let content
  if (category === 'chats' && !q) {
    content = (
      <>
        <div className={styles.top} aria-label="Частые чаты">
          {topIds.map((id) => byId.get(id)!).map((item) => (
            <div key={item.id} onClick={() => remember(item.id)}>
              <ScreenLink to={routes.chat} id={item.id} className={styles.topItem}>
                <Avatar person={item} />
                <span className={styles.topName}>{item.name}</span>
              </ScreenLink>
            </div>
          ))}
        </div>
        {recent.length > 0 && (
          <>
            <div className={styles.section}>
              <h2>Недавние</h2>
              <button type="button" onClick={clearRecent}>Очистить</button>
            </div>
            <ResultList items={recent.map((id) => byId.get(id)!)} onOpen={remember} />
          </>
        )}
      </>
    )
  } else if (category === 'chats' || category === 'channels') {
    const items = (category === 'chats' ? people : channels).filter((item) => !q || matches(item.name))
    content = items.length ? <ResultList items={items} onOpen={remember} /> : <Empty query={query} />
  } else if (category === 'posts') {
    const posts = chats.filter((chat) => q && (matches(chat.message) || matches(chat.name)))
    content = !q ? <Hint text="Введите запрос, чтобы найти сообщения" />
      : posts.length ? (
        <ul className={styles.list}>
          {posts.map((chat) => (
            <li key={chat.id}>
              <ScreenLink to={routes.chat} id={chat.id} className={styles.row}>
                <Avatar person={chat} size="small" />
                <span className={styles.text}>
                  <span className={styles.titleRow}>
                    <span className={styles.name}>{chat.name}</span>
                    <span className={styles.time}>{chat.time}</span>
                  </span>
                  <span className={styles.subtitle}><Highlight text={chat.message} query={query.trim()} /></span>
                </span>
              </ScreenLink>
            </li>
          ))}
        </ul>
      ) : <Empty query={query} />
  } else if (category === 'media') {
    content = (
      <div className={styles.media}>
        {[sticker, product].map((src) => (
          <ScreenLink key={src} to={routes.chat} id="alisa" className={styles.mediaItem}>
            <img src={src} alt="" />
          </ScreenLink>
        ))}
      </div>
    )
  } else {
    content = <Hint text="Здесь появятся загруженные файлы" />
  }

  return (
    <div className={styles.search}>
      <header className={styles.header}>
        <button type="button" className={styles.back} aria-label="Назад" onClick={onClose}>
          <svg width="12" height="20" viewBox="0 0 12 20" fill="none" stroke="#828294" strokeWidth="2.2"
            strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M10 2 2 10l8 8" />
          </svg>
        </button>
        <label className={styles.field}>
          <img src={searchIcon} alt="" width={20} height={20} />
          <span className={styles.visuallyHidden}>Поиск</span>
          <input autoFocus type="search" placeholder="Поиск" value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={(event) => event.key === 'Escape' && (query ? setQuery('') : onClose())} />
          {query && (
            <button type="button" className={styles.clear} aria-label="Очистить запрос" onClick={() => setQuery('')}>×</button>
          )}
        </label>
      </header>

      <div className={styles.results}>{content}</div>

      <nav className={styles.categories} aria-label="Категории поиска">
        <div className={styles.pill}>
          {categories.map((item) => (
            <button key={item.id} type="button" aria-pressed={category === item.id} onClick={() => setCategory(item.id)}>
              {category === item.id && <SlidingPill group="search-categories" className={styles.pillBg} />}
              {item.label}
            </button>
          ))}
        </div>
      </nav>
    </div>
  )
}

function ResultList({ items, onOpen }: { items: Result[]; onOpen: (id: string) => void }) {
  return (
    <ul className={styles.list}>
      {items.map((item) => (
        <li key={item.id} onClick={() => onOpen(item.id)}>
          <ScreenLink to={routes.chat} id={item.id} className={styles.row}>
            <span className={styles.avatar}>
              <Avatar person={item} size="small" />
              {item.online && <span className={styles.online} aria-label="в сети" />}
            </span>
            <span className={styles.text}>
              <span className={styles.name}>{item.name}</span>
              <span className={`${styles.subtitle} ${item.online ? styles.onlineText : ''}`}>{item.subtitle}</span>
            </span>
          </ScreenLink>
        </li>
      ))}
    </ul>
  )
}

function Highlight({ text, query }: { text: string; query: string }) {
  const start = normalize(text).indexOf(normalize(query))
  if (start < 0) return text
  return <>{text.slice(0, start)}<mark>{text.slice(start, start + query.length)}</mark>{text.slice(start + query.length)}</>
}

const Empty = ({ query }: { query: string }) => <Hint text={`По запросу «${query.trim()}» ничего не найдено`} />
// The empty-state text morphs letter by letter as the query is typed.
const Hint = ({ text }: { text: string }) => <TextMorph as="p" className={styles.hint}>{text}</TextMorph>
