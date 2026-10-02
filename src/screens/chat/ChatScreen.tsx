import { useEffect, useRef, useState, useSyncExternalStore, type FormEvent } from 'react'
import { ScreenLink } from '../../navigation/ScreenLink'
import { readRouteId, routes } from '../../navigation/routes'
import { chats, contacts, initials, type Chat } from '../chat-list/chats'
import searchIcon from '../chat-list/assets/search.svg'
import dotsIcon from '../chat-list/assets/dots.svg'
import readIcon from '../chat-list/assets/read.svg'
import sticker from './assets/sticker.png'
import product from './assets/product.png'
import heartFire from './assets/heart-fire.png'
import heart from './assets/heart.png'
import reactionMe from './assets/reaction-me.png'
import reactionAlisa from './assets/reaction-alisa.png'
import walletIcon from './assets/wallet.svg'
import verifiedIcon from './assets/verified-blue.svg'
import starIcon from './assets/star.svg'
import cartIcon from './assets/cart.svg'
import playIcon from './assets/play.svg'
import paperclipIcon from './assets/paperclip.svg'
import stickerIcon from './assets/sticker-icon.svg'
import micIcon from './assets/mic.svg'
import styles from './ChatScreen.module.css'

type Reaction = { emoji: string; avatar: string }

type Message = { id: number; out?: boolean; time: string; read?: boolean; reactions?: Reaction[] } & (
  | { kind: 'text'; text: string; sender?: string }
  | { kind: 'sticker' }
  | { kind: 'product' }
  | { kind: 'voice'; duration: string }
)

// The conversation from Figma.
const alisaMessages: Message[] = [
  { id: 1, kind: 'sticker', time: '9:41' },
  { id: 2, kind: 'text', out: true, read: true, text: 'Закидывай все свои идеи 😍👀', time: '9:41' },
  { id: 3, kind: 'product', time: '9:41', reactions: [{ emoji: heartFire, avatar: reactionMe }] },
  { id: 4, kind: 'text', out: true, read: true, text: 'Образ огонь 🔥🔥🔥\nОсобенно блузка', time: '9:41', reactions: [{ emoji: heart, avatar: reactionAlisa }] },
  { id: 5, kind: 'text', text: 'Спасибо))) 💜', time: '9:41' },
  { id: 6, kind: 'voice', out: true, duration: '0:01', time: '9:41' },
]

// Short made-up history for other chats, ending with the last message from the chat list.
function conversation(chat: Chat): Message[] {
  const last: Message = { id: 3, kind: 'text', text: chat.message, time: chat.time, sender: chat.sender, out: chat.read, read: chat.read }
  if (chat.folder === 'channels') {
    return [{ id: 1, kind: 'text', text: 'Добро пожаловать! Здесь делимся новостями и подборками 🛍️', time: '8:00', sender: chat.sender }, last]
  }
  return [
    { id: 1, kind: 'text', text: 'Привет! 👋', time: '8:02' },
    { id: 2, kind: 'text', out: true, read: true, text: 'Привет) Как дела?', time: '8:05' },
    last,
  ]
}

function peerStatus(chat: Chat | undefined, status: string | undefined) {
  if (status) return status[0].toUpperCase() + status.slice(1)
  if (chat?.sender) return chat.folder === 'channels' ? '2 500 участников' : '5 участников'
  if (chat?.folder === 'channels') return 'Канал'
  return 'Был(а) недавно'
}

// Bar heights of the voice message waveform, from Figma.
const waveform = [4, 11, 14, 13, 11, 13, 9, 5, 2, 5, 4, 9, 5, 2, 5, 4, 7, 9, 6, 9, 8, 4, 11, 14, 13, 11, 2, 5, 4, 6, 9, 8, 4, 11, 14, 13, 7, 9, 6, 9, 8, 4, 11]

function subscribe(onChange: () => void) {
  window.addEventListener('hashchange', onChange)
  return () => window.removeEventListener('hashchange', onChange)
}

export function ChatScreen() {
  // Opened from the chat list or contacts as #/chat?id=…; Alisa from Figma by default.
  const id = useSyncExternalStore(subscribe, readRouteId) ?? 'alisa'
  // A new id starts a fresh conversation state.
  return <Conversation key={id} id={id} />
}

function Conversation({ id }: { id: string }) {
  const chat = chats.find((item) => item.id === id)
  const contact = contacts.find((item) => item.id === id)
  const peer = chat ?? contact ?? chats[0]
  const [messages, setMessages] = useState(() =>
    peer.id === 'alisa' ? alisaMessages : chat ? conversation(chat) : [])
  const [draft, setDraft] = useState('')
  const screen = useRef<HTMLElement>(null)
  const list = useRef<HTMLOListElement>(null)

  // Stay at the newest message, also when images and fonts load and grow the list.
  useEffect(() => {
    const scroller = screen.current
    if (!scroller || !list.current) return
    const observer = new ResizeObserver(() => scroller.scrollTo({ top: scroller.scrollHeight }))
    observer.observe(list.current)
    return () => observer.disconnect()
  }, [])

  function send(event: FormEvent) {
    event.preventDefault()
    const text = draft.trim()
    if (!text) return
    const time = new Date().toLocaleTimeString('ru', { hour: 'numeric', minute: '2-digit' })
    setMessages([...messages, { id: Date.now(), kind: 'text', out: true, text, time }])
    setDraft('')
  }

  return (
    <section ref={screen} className={styles.screen} aria-label={`Чат: ${peer.name}`}>
      <header className={styles.header}>
        <ScreenLink to={routes.chatList} className={`${styles.back} ${styles.glass}`}>
          <svg width="12" height="20" viewBox="0 0 12 20" fill="none" stroke="#1a1a1a" strokeWidth="2.4"
            strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M10 2 2 10l8 8" />
          </svg>
          <span className={styles.mark} aria-label="непрочитанных чатов: 8">8</span>
          <span className={styles.visuallyHidden}>Все чаты</span>
        </ScreenLink>
        {/* Opens the contact profile (Karina's screen). */}
        <ScreenLink to={routes.profile} id={peer.id} className={styles.contact}>
          <span className={`${styles.contactAvatar} ${styles.glass}`}>
            {peer.avatar
              ? <img src={peer.avatar} alt="" />
              : <span className={styles.initials} style={{ background: peer.color }}>{initials(peer.name)}</span>}
          </span>
          <span className={styles.contactText}>
            <span className={styles.contactName}>{peer.name}</span>
            <span className={styles.contactStatus}>{peerStatus(chat, contact?.status)}</span>
          </span>
        </ScreenLink>
        <div className={`${styles.actions} ${styles.glass}`}>
          <button type="button" aria-label="Поиск по чату"><img src={searchIcon} alt="" width={24} height={24} /></button>
          <button type="button" aria-label="Ещё"><img src={dotsIcon} alt="" width={24} height={24} /></button>
        </div>
      </header>

      <ol ref={list} className={styles.messages}>
        {messages.length === 0 && <li className={styles.empty}>Здесь пока пусто — напишите первым 👋</li>}
        {messages.map((message) => <MessageRow key={message.id} message={message} />)}
      </ol>

      <form className={styles.composer} onSubmit={send}>
        <button type="button" className={`${styles.round} ${styles.glass}`} aria-label="Прикрепить">
          <img src={paperclipIcon} alt="" width={24} height={24} />
        </button>
        <label className={`${styles.field} ${styles.glass}`}>
          <span className={styles.visuallyHidden}>Сообщение</span>
          <input value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="Сообщение" enterKeyHint="send" />
          <img src={stickerIcon} alt="" width={20} height={20} />
        </label>
        <button type="button" className={`${styles.round} ${styles.glass}`} aria-label="Записать голосовое">
          <img src={micIcon} alt="" width={24} height={24} />
        </button>
      </form>
    </section>
  )
}

function MessageRow({ message }: { message: Message }) {
  const side = message.out ? styles.out : styles.in

  if (message.kind === 'sticker') {
    return (
      <li className={`${styles.row} ${side}`}>
        <div className={styles.sticker}>
          <img src={sticker} alt="Стикер: мишка шлёт воздушный поцелуй" width={190} height={190} />
          <span className={styles.timeChip}>{message.time}</span>
        </div>
      </li>
    )
  }

  if (message.kind === 'product') {
    return (
      <li className={`${styles.row} ${side}`}>
        <div className={`${styles.bubble} ${styles.productBubble}`}>
          <ProductCard />
        </div>
        {message.reactions && <Reactions reactions={message.reactions} dark />}
      </li>
    )
  }

  return (
    <li className={`${styles.row} ${side}`}>
      <div className={`${styles.bubble} ${message.kind === 'voice' ? styles.voiceBubble : ''}`}>
        {message.kind === 'text' && message.sender && !message.out && <div className={styles.sender}>{message.sender}</div>}
        {message.kind === 'text' && <p className={styles.text}>{message.text}<span className={styles.spacer} /></p>}
        {message.kind === 'voice' && <Voice duration={message.duration} />}
        {message.reactions && <Reactions reactions={message.reactions} />}
        <span className={styles.meta}>
          {message.time}
          {message.read && <img src={readIcon} alt="Прочитано" width={14} height={8} />}
        </span>
      </div>
    </li>
  )
}

function Reactions({ reactions, dark }: { reactions: Reaction[]; dark?: boolean }) {
  return (
    <div className={styles.reactions}>
      {reactions.map((reaction) => (
        <button key={reaction.emoji} type="button" className={`${styles.reaction} ${dark ? styles.reactionDark : ''}`}>
          <img src={reaction.emoji} alt="" width={24} height={24} />
          <img className={styles.reactionAvatar} src={reaction.avatar} alt="" width={24} height={24} />
        </button>
      ))}
    </div>
  )
}

function ProductCard() {
  return (
    <article className={styles.product}>
      <div className={styles.productPhoto}>
        <img src={product} alt="Розовая блузка с длинным рукавом" />
        <span className={styles.size}>XS</span>
        <span className={styles.discount}>−79%</span>
      </div>
      <div className={styles.productInfo}>
        <div className={styles.price}>
          <img src={walletIcon} alt="" width={16} height={16} />
          <strong>2036 ₽</strong>
          <s>25 200 ₽</s>
        </div>
        <div className={styles.brand}>
          <img src={verifiedIcon} alt="" width={16} height={16} />
          Molly Spot
        </div>
        <div className={styles.productTitle}>Блузка хлопок нежная</div>
        <div className={styles.rating}>
          <img src={starIcon} alt="" width={16} height={16} />
          4,5 <span>· 24 оценки</span>
        </div>
        <button type="button" className={styles.buy}>
          <img src={cartIcon} alt="" width={16} height={16} />
          Послезавтра
        </button>
      </div>
    </article>
  )
}

function Voice({ duration }: { duration: string }) {
  return (
    <div className={styles.voice}>
      <button type="button" className={styles.play} aria-label="Воспроизвести">
        <img src={playIcon} alt="" width={45} height={45} />
      </button>
      <div className={styles.voiceInfo}>
        <span className={styles.wave} aria-hidden="true">
          {waveform.map((height, i) => <i key={i} style={{ height }} />)}
        </span>
        <span className={styles.voiceTime}>{duration}<i /></span>
      </div>
      <button type="button" className={styles.transcribe} aria-label="Расшифровать">→A</button>
    </div>
  )
}
