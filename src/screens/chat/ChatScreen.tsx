import { useEffect, useRef, useState, useSyncExternalStore, type FormEvent, type ReactNode } from 'react'
import { motion, MotionConfig } from 'motion/react'
import { softSpring } from '../chat-list/springs'
import { ScreenLink } from '../../navigation/ScreenLink'
import { readRouteId, routes } from '../../navigation/routes'
import { chats, contacts, initials, type Chat } from '../chat-list/chats'
import searchIcon from '../chat-list/assets/search.svg'
import dotsIcon from '../chat-list/assets/dots.svg'
import readIcon from '../chat-list/assets/read.svg'
import sticker from './assets/sticker.png'
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
import { StubSheet } from '../chat-list/StubSheet'
import { showStub } from '../chat-list/stub'
import { products, scripts, type Product, type ProductId } from './conversations'
import { hash, playMelody, seconds, waveform } from './melody'
import '../chat-list/theme'
import { TextMorph } from 'torph/react'
import styles from './ChatScreen.module.css'

type Reaction = { emoji: string; avatar: string }

type Message = { id: number; out?: boolean; time: string; read?: boolean; sender?: string; reactions?: Reaction[] } & (
  | { kind: 'text'; text: string }
  | { kind: 'sticker' }
  | { kind: 'product'; product: ProductId }
  | { kind: 'voice'; duration: string; seed: number }
)

// The conversation from Figma.
const alisaMessages: Message[] = [
  { id: 1, kind: 'sticker', time: '9:41' },
  { id: 2, kind: 'text', out: true, read: true, text: 'Закидывай все свои идеи 😍👀', time: '9:41' },
  { id: 3, kind: 'product', product: 'blouse', time: '9:41', reactions: [{ emoji: heartFire, avatar: reactionMe }] },
  { id: 4, kind: 'text', out: true, read: true, text: 'Образ огонь 🔥🔥🔥\nОсобенно блузка', time: '9:41', reactions: [{ emoji: heart, avatar: reactionAlisa }] },
  { id: 5, kind: 'text', text: 'Спасибо))) 💜', time: '9:41' },
  { id: 6, kind: 'voice', out: true, duration: '0:04', seed: 41, time: '9:41' },
]

// Made-up history from conversations.ts, ending with the last message from the chat list.
function conversation(chat: Chat): Message[] {
  const history = (scripts[chat.id] ?? []).map((item, i): Message => {
    const out = item.from === 'me'
    const base = { id: i + 1, time: item.time, out, read: out, sender: out ? undefined : item.from }
    if ('text' in item) return { ...base, kind: 'text', text: item.text }
    if ('voice' in item) return { ...base, kind: 'voice', duration: item.voice, seed: hash(`${chat.id}-${i}`) }
    if ('product' in item) return { ...base, kind: 'product', product: item.product }
    return { ...base, kind: 'sticker' }
  })
  const last: Message = { id: history.length + 1, kind: 'text', text: chat.message, time: chat.time, sender: chat.sender, out: chat.read, read: chat.read }
  return [...history, last]
}

const clock = (total: number) => `${Math.floor(total / 60)}:${String(Math.floor(total % 60)).padStart(2, '0')}`
const now = () => new Date().toLocaleTimeString('ru', { hour: 'numeric', minute: '2-digit' })

function peerStatus(chat: Chat | undefined, status: string | undefined) {
  if (status) return status[0].toUpperCase() + status.slice(1)
  if (chat?.members) return chat.members
  return 'Был(а) недавно'
}

function subscribe(onChange: () => void) {
  window.addEventListener('hashchange', onChange)
  return () => window.removeEventListener('hashchange', onChange)
}

export function ChatScreen() {
  // Opened from the chat list or contacts as #/chat?id=…; Alisa from Figma by default.
  const id = useSyncExternalStore(subscribe, readRouteId) ?? 'alisa'
  // A new id starts a fresh conversation state.
  // Respect the system "reduce motion" setting for every motion component inside.
  return <MotionConfig reducedMotion="user"><Conversation key={id} id={id} /></MotionConfig>
}

function Conversation({ id }: { id: string }) {
  const chat = chats.find((item) => item.id === id)
  const contact = contacts.find((item) => item.id === id)
  const peer = chat ?? contact ?? chats[0]
  const [messages, setMessages] = useState(() =>
    peer.id === 'alisa' ? alisaMessages : chat ? conversation(chat) : [])
  const [draft, setDraft] = useState('')
  // Recording is simulated: the timer runs and sending adds a voice message with its own tune.
  const [recordingSince, setRecordingSince] = useState<number | null>(null)
  const [recorded, setRecorded] = useState(0)
  const screen = useRef<HTMLElement>(null)
  const list = useRef<HTMLOListElement>(null)
  // Messages present on open stay still; only ones sent afterwards animate in.
  const [initialIds] = useState(() => new Set(messages.map((message) => message.id)))

  // Stay at the newest message, also when images and fonts load and grow the list.
  useEffect(() => {
    const scroller = screen.current
    if (!scroller || !list.current) return
    const observer = new ResizeObserver(() => scroller.scrollTo({ top: scroller.scrollHeight }))
    observer.observe(list.current)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (recordingSince === null) return
    const timer = window.setInterval(() => setRecorded((Date.now() - recordingSince) / 1000), 200)
    return () => window.clearInterval(timer)
  }, [recordingSince])

  function send(event: FormEvent) {
    event.preventDefault()
    if (recordingSince !== null) {
      const length = Math.min(59, Math.max(1, Math.round((Date.now() - recordingSince) / 1000)))
      setMessages([...messages, { id: Date.now(), kind: 'voice', out: true, duration: clock(length), seed: Date.now(), time: now() }])
      setRecordingSince(null)
      return
    }
    const text = draft.trim()
    if (!text) return
    setMessages([...messages, { id: Date.now(), kind: 'text', out: true, text, time: now() }])
    setDraft('')
  }

  function startRecording() {
    setRecorded(0)
    setRecordingSince(Date.now())
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
          <button type="button" onClick={() => showStub()} aria-label="Поиск по чату"><img src={searchIcon} alt="" width={24} height={24} /></button>
          <button type="button" onClick={() => showStub()} aria-label="Ещё"><img src={dotsIcon} alt="" width={24} height={24} /></button>
        </div>
      </header>

      <ol ref={list} className={styles.messages}>
        {messages.length === 0 && <li className={styles.empty}>Здесь пока пусто — напишите первым 👋</li>}
        {messages.map((message) => <MessageRow key={message.id} message={message} fresh={!initialIds.has(message.id)} />)}
      </ol>

      <form className={styles.composer} onSubmit={send}>
        {recordingSince === null ? (
          <>
            <button type="button" onClick={() => showStub()} className={`${styles.round} ${styles.glass}`} aria-label="Прикрепить">
              <img src={paperclipIcon} alt="" width={24} height={24} />
            </button>
            <label className={`${styles.field} ${styles.glass}`}>
              <span className={styles.visuallyHidden}>Сообщение</span>
              <input value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="Сообщение" enterKeyHint="send" />
              <img src={stickerIcon} alt="" width={20} height={20} />
            </label>
          </>
        ) : (
          <>
            <button type="button" onClick={() => setRecordingSince(null)} className={`${styles.round} ${styles.glass}`} aria-label="Отменить запись">
              <span className={styles.cancel} aria-hidden="true">×</span>
            </button>
            <div className={`${styles.field} ${styles.glass} ${styles.recording}`} role="status">
              <i className={styles.recDot} />
              <TextMorph as="span">{clock(recorded)}</TextMorph>
              <span className={styles.recHint}>Запись голосового…</span>
            </div>
          </>
        )}
        {recordingSince !== null || draft.trim() ? (
          <button type="submit" className={`${styles.round} ${styles.sendButton}`} aria-label="Отправить">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M10 16V4M4.5 9.5 10 4l5.5 5.5" />
            </svg>
          </button>
        ) : (
          <button type="button" onClick={startRecording} className={`${styles.round} ${styles.glass}`} aria-label="Записать голосовое">
            <img src={micIcon} alt="" width={24} height={24} />
          </button>
        )}
      </form>
      <StubSheet />
    </section>
  )
}

/** A new message springs out of its bubble corner; the history renders as plain rows. */
function Row({ fresh, out, className, children }: { fresh: boolean; out?: boolean; className: string; children: ReactNode }) {
  if (!fresh) return <li className={className}>{children}</li>
  return (
    <motion.li className={className} style={{ transformOrigin: out ? '100% 100%' : '0 100%' }}
      initial={{ opacity: 0, y: 18, scale: 0.92 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={softSpring}>
      {children}
    </motion.li>
  )
}

function MessageRow({ message, fresh }: { message: Message; fresh: boolean }) {
  const side = message.out ? styles.out : styles.in

  if (message.kind === 'sticker') {
    return (
      <Row fresh={fresh} out={message.out} className={`${styles.row} ${side}`}>
        <div className={styles.sticker}>
          <img src={sticker} alt="Стикер: мишка шлёт воздушный поцелуй" width={190} height={190} />
          <span className={styles.timeChip}>{message.time}</span>
        </div>
      </Row>
    )
  }

  if (message.kind === 'product') {
    return (
      <Row fresh={fresh} out={message.out} className={`${styles.row} ${side}`}>
        <div className={`${styles.bubble} ${styles.productBubble}`}>
          <ProductCard product={products[message.product]} />
        </div>
        {message.reactions && <Reactions reactions={message.reactions} dark />}
      </Row>
    )
  }

  return (
    <Row fresh={fresh} out={message.out} className={`${styles.row} ${side}`}>
      <div className={`${styles.bubble} ${message.kind === 'voice' ? styles.voiceBubble : ''}`}>
        {message.sender && !message.out && <div className={styles.sender}>{message.sender}</div>}
        {message.kind === 'text' && <p className={styles.text}>{message.text}<span className={styles.spacer} /></p>}
        {message.kind === 'voice' && <Voice duration={message.duration} seed={message.seed} />}
        {message.reactions && <Reactions reactions={message.reactions} />}
        <span className={styles.meta}>
          {message.time}
          {message.read && <img src={readIcon} alt="Прочитано" width={14} height={8} />}
        </span>
      </div>
    </Row>
  )
}

function Reactions({ reactions, dark }: { reactions: Reaction[]; dark?: boolean }) {
  return (
    <div className={styles.reactions}>
      {reactions.map((reaction) => (
        <button key={reaction.emoji} type="button" onClick={() => showStub()} className={`${styles.reaction} ${dark ? styles.reactionDark : ''}`}>
          <img src={reaction.emoji} alt="" width={24} height={24} />
          <img className={styles.reactionAvatar} src={reaction.avatar} alt="" width={24} height={24} />
        </button>
      ))}
    </div>
  )
}

function ProductCard({ product }: { product: Product }) {
  return (
    <article className={styles.product}>
      <div className={styles.productPhoto} style={{ background: product.tint }}>
        {product.image
          ? <img src={product.image} alt={product.title} />
          : <span className={styles.productEmoji} role="img" aria-label={product.title}>{product.emoji}</span>}
        {product.size && <span className={styles.size}>{product.size}</span>}
        <span className={styles.discount}>{product.discount}</span>
      </div>
      <div className={styles.productInfo}>
        <div className={styles.price}>
          <img src={walletIcon} alt="" width={16} height={16} />
          <strong>{product.price}</strong>
          <s>{product.oldPrice}</s>
        </div>
        <div className={styles.brand}>
          <img src={verifiedIcon} alt="" width={16} height={16} />
          {product.brand}
        </div>
        <div className={styles.productTitle}>{product.title}</div>
        <div className={styles.rating}>
          <img src={starIcon} alt="" width={16} height={16} />
          {product.rating} <span>· {product.reviews}</span>
        </div>
        <button type="button" onClick={() => showStub()} className={styles.buy}>
          <img src={cartIcon} alt="" width={16} height={16} />
          {product.delivery}
        </button>
      </div>
    </article>
  )
}

function Voice({ duration, seed }: { duration: string; seed: number }) {
  const length = seconds(duration)
  const bars = waveform(seed)
  // null = idle, 0..1 = playback position.
  const [progress, setProgress] = useState<number | null>(null)
  const stop = useRef<(() => void) | null>(null)

  // Leaving the chat silences the tune.
  useEffect(() => () => stop.current?.(), [])

  function toggle() {
    if (progress !== null) return stop.current?.()
    const started = performance.now()
    let frame = 0
    const tick = () => {
      // Quantized to waveform bars: re-render ~6 times a second instead of every frame.
      const bars = 86
      setProgress(Math.round(Math.min(1, (performance.now() - started) / 1000 / length) * bars) / bars)
      frame = requestAnimationFrame(tick)
    }
    stop.current = playMelody(seed, length, () => {
      cancelAnimationFrame(frame)
      stop.current = null
      setProgress(null)
    })
    tick()
  }

  const played = progress === null ? 0 : Math.round(progress * bars.length)

  return (
    <div className={styles.voice}>
      <button type="button" onClick={toggle} className={styles.play} aria-label={progress === null ? 'Воспроизвести' : 'Пауза'}>
        {progress === null ? <img src={playIcon} alt="" width={45} height={45} /> : (
          <svg width="45" height="45" viewBox="0 0 45 45" aria-hidden="true">
            <circle cx="22.5" cy="22.5" r="22.5" fill="#a161f3" />
            <rect x="16" y="14" width="4.5" height="17" rx="1.5" fill="#fff" />
            <rect x="24.5" y="14" width="4.5" height="17" rx="1.5" fill="#fff" />
          </svg>
        )}
      </button>
      <div className={styles.voiceInfo}>
        <span className={styles.wave} aria-hidden="true">
          {bars.map((height, i) => <i key={i} className={i < played ? styles.played : ''} style={{ height }} />)}
        </span>
        <span className={styles.voiceTime}><TextMorph as="span">{progress === null ? duration : clock(progress * length)}</TextMorph><i /></span>
      </div>
      <button type="button" onClick={() => showStub()} className={styles.transcribe} aria-label="Расшифровать">→A</button>
    </div>
  )
}
