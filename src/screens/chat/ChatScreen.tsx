import { useEffect, useRef, useState, useSyncExternalStore, type FormEvent, type ReactNode } from 'react'
import { AnimatePresence, motion, MotionConfig, useMotionValue, useTransform } from 'motion/react'
import { softSpring } from '../chat-list/springs'
import { ScreenLink } from '../../navigation/ScreenLink'
import { readRouteId, routes } from '../../navigation/routes'
import { chats, contacts, initials, type Chat } from '../chat-list/chats'
import searchIcon from '../chat-list/assets/search.svg'
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
import { products, scripts, type Product, type ProductId, type ScriptItem } from './conversations'
import { currentDayLabel, olderDays } from './history'
import { hash, playMelody, seconds, waveform } from './melody'
import { canReply, replier, replyText } from './replies'
import { MessageMenu, type MenuAction } from './MessageMenu'
import '../chat-list/theme'
import { TextMorph } from 'torph/react'
import styles from './ChatScreen.module.css'

type Reaction = { emoji: string; avatar: string }
/** A quoted message inside a reply. */
type Quote = { id: number; author: string; text: string }

type Message = { id: number; out?: boolean; time: string; read?: boolean; sender?: string; reactions?: Reaction[]; replyTo?: Quote } & (
  | { kind: 'text'; text: string }
  | { kind: 'sticker' }
  | { kind: 'product'; product: ProductId }
  | { kind: 'voice'; duration: string; seed: number }
  | { kind: 'day'; label: string }
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

function fromScript(item: ScriptItem, id: number, seedKey: string): Message {
  const out = item.from === 'me'
  const base = { id, time: item.time, out, read: out, sender: out ? undefined : item.from }
  if ('text' in item) return { ...base, kind: 'text', text: item.text }
  if ('voice' in item) return { ...base, kind: 'voice', duration: item.voice, seed: hash(seedKey) }
  if ('product' in item) return { ...base, kind: 'product', product: item.product }
  return { ...base, kind: 'sticker' }
}

/** Two earlier days from history.ts, each under a date chip; ids stay clear of the current day's. */
function earlier(chat: Chat): Message[] {
  let id = 10_000
  return olderDays(chat).flatMap((day) => [
    { id: id++, kind: 'day', label: day.label, time: '' } satisfies Message,
    ...day.items.map((item) => fromScript(item, id++, `${chat.id}-old-${id}`)),
  ])
}

const dayChip = (chat: Chat): Message => ({ id: 9_999, kind: 'day', label: currentDayLabel(chat), time: '' })

// Earlier days, then today's script from conversations.ts, ending with the last message from the chat list.
function conversation(chat: Chat): Message[] {
  const today = (scripts[chat.id] ?? []).map((item, i) => fromScript(item, i + 1, `${chat.id}-${i}`))
  const last: Message = { id: today.length + 1, kind: 'text', text: chat.message, time: chat.time, sender: chat.sender, out: chat.read, read: chat.read }
  return [...earlier(chat), dayChip(chat), ...today, last]
}

const clock = (total: number) => `${Math.floor(total / 60)}:${String(Math.floor(total % 60)).padStart(2, '0')}`
const now = () => new Date().toLocaleTimeString('ru', { hour: 'numeric', minute: '2-digit' })

/** One-line description of any message, for quotes and the menu preview. */
function summary(message: Message) {
  if (message.kind === 'text') return message.text
  if (message.kind === 'day') return message.label
  if (message.kind === 'voice') return `🎤 Голосовое, ${message.duration}`
  if (message.kind === 'product') return `🛍 ${products[message.product].title}`
  return 'Стикер'
}

function peerStatus(chat: Chat | undefined, status: string | undefined) {
  if (status) return status[0].toUpperCase() + status.slice(1)
  if (chat?.members) return chat.members
  return 'Недавно в сети'
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
    !chat ? [] : chat.id === 'alisa' ? [...earlier(chat), { ...dayChip(chat), label: 'Сегодня' }, ...alisaMessages] : conversation(chat))
  const [draft, setDraft] = useState('')
  // Recording is simulated: the timer runs and sending adds a voice message with its own tune.
  const [recordingSince, setRecordingSince] = useState<number | null>(null)
  const [recorded, setRecorded] = useState(0)
  const [replyTarget, setReplyTarget] = useState<Message | null>(null)
  const [menuFor, setMenuFor] = useState<Message | null>(null)
  const [highlighted, setHighlighted] = useState<number | null>(null)
  const [toast, setToast] = useState<string | null>(null)
  // Who is typing an auto-reply right now ('' = the contact in a personal chat).
  const [typing, setTyping] = useState<string | null>(null)
  // Someone who just typed back is obviously online.
  const [active, setActive] = useState(false)
  const screen = useRef<HTMLElement>(null)
  const list = useRef<HTMLOListElement>(null)
  const input = useRef<HTMLInputElement>(null)
  const replyTimers = useRef<number[]>([])
  const turn = useRef(0)
  // Messages present on open stay still; only ones sent afterwards animate in.
  const [initialIds] = useState(() => new Set(messages.map((message) => message.id)))

  const authorOf = (message: Message) => (message.out ? 'Вы' : message.sender ?? peer.name)
  const quoteOf = (message: Message): Quote => ({ id: message.id, author: authorOf(message), text: summary(message) })

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

  // Pending auto-replies die with the chat.
  useEffect(() => () => replyTimers.current.forEach((timer) => window.clearTimeout(timer)), [])

  useEffect(() => {
    if (!toast) return
    const timer = window.setTimeout(() => setToast(null), 1600)
    return () => window.clearTimeout(timer)
  }, [toast])

  /** Read receipts, "typing…", then an answer in the contact's voice. A newer message restarts it. */
  function scheduleReply(sent: Message) {
    replyTimers.current.forEach((timer) => window.clearTimeout(timer))
    replyTimers.current = []
    setTyping(null)
    if (!canReply(chat)) return
    const later = (ms: number, run: () => void) => replyTimers.current.push(window.setTimeout(run, ms))
    const text = sent.kind === 'text' ? sent.text : ''
    const n = turn.current++
    const author = replier(chat, n)
    const typingFor = sent.kind === 'voice' ? 2600 : Math.min(3200, 900 + text.length * 40)

    later(700, () => setMessages((all) => all.map((item) => (item.out ? { ...item, read: true } : item))))
    later(1100, () => {
      setTyping(author ?? '')
      setActive(true)
    })
    later(1100 + typingFor, () => {
      setTyping(null)
      // Voice gets a voice answer every other time; questions are answered with a quote.
      const reply: Message = sent.kind === 'voice' && n % 2 === 0
        ? { id: Date.now(), kind: 'voice', duration: clock(3 + (n % 6)), seed: Date.now(), time: now(), sender: author }
        : { id: Date.now(), kind: 'text', text: replyText(peer.id, text, n), time: now(), sender: author, replyTo: text.includes('?') ? quoteOf(sent) : undefined }
      setMessages((all) => [...all, reply])
    })
  }

  function addOwn(message: Message) {
    setMessages((all) => [...all, message])
    setReplyTarget(null)
    scheduleReply(message)
  }

  function send(event: FormEvent) {
    event.preventDefault()
    const replyTo = replyTarget ? quoteOf(replyTarget) : undefined
    if (recordingSince !== null) {
      const length = Math.min(59, Math.max(1, Math.round((Date.now() - recordingSince) / 1000)))
      addOwn({ id: Date.now(), kind: 'voice', out: true, duration: clock(length), seed: Date.now(), time: now(), replyTo })
      setRecordingSince(null)
      return
    }
    const text = draft.trim()
    if (!text) return
    addOwn({ id: Date.now(), kind: 'text', out: true, text, time: now(), replyTo })
    setDraft('')
  }

  function startRecording() {
    setRecorded(0)
    setRecordingSince(Date.now())
  }

  function startReply(message: Message) {
    setReplyTarget(message)
    input.current?.focus({ preventScroll: true })
  }

  /** Scrolls to the quoted message and flashes it. */
  function jumpTo(messageId: number) {
    const target = list.current?.querySelector(`[data-id="${messageId}"]`)
    if (!target) return setToast('Сообщение удалено')
    target.scrollIntoView({ block: 'center', behavior: 'smooth' })
    setHighlighted(messageId)
    window.setTimeout(() => setHighlighted((current) => (current === messageId ? null : current)), 1400)
  }

  function onMenuAction(action: MenuAction) {
    const message = menuFor
    setMenuFor(null)
    if (!message) return
    if (action === 'reply') startReply(message)
    if (action === 'copy' && message.kind === 'text') {
      void navigator.clipboard?.writeText(message.text).catch(() => {})
      setToast('Скопировано')
    }
    if (action === 'forward') showStub('Пересылка скоро появится')
    if (action === 'delete') {
      setMessages((all) => all.filter((item) => item.id !== message.id))
      if (replyTarget?.id === message.id) setReplyTarget(null)
    }
  }

  const idle = active && !chat?.members ? 'В сети' : peerStatus(chat, contact?.status)
  const status = typing === null ? idle : typing ? `${typing} печатает…` : 'печатает…'

  return (
    <section ref={screen} className={styles.screen} aria-label={`Чат: ${peer.name}`}>
      <header className={styles.header}>
        <ScreenLink to={routes.chatList} className={`${styles.back} ${styles.glass}`}>
          <svg width="12" height="20" viewBox="0 0 12 20" fill="none" stroke="#1a1a1a" strokeWidth="2.4"
            strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M10 2 2 10l8 8" />
          </svg>
          <span className={styles.visuallyHidden}>Все чаты</span>
        </ScreenLink>
        {/* Opens the contact profile (Karina's screen). */}
        <ScreenLink to={routes.profile} id={peer.id} className={`${styles.contact} ${styles.glass}`}>
          <span className={styles.contactAvatar}>
            {peer.avatar
              ? <img src={peer.avatar} alt="" />
              : <span className={styles.initials} style={{ background: peer.color }}>{initials(peer.name)}</span>}
          </span>
          <span className={styles.contactText}>
            <span className={styles.contactName}>{peer.name}</span>
            <span className={`${styles.contactStatus} ${typing !== null ? styles.typing : ''}`} aria-live="polite">
              <TextMorph as="span">{status}</TextMorph>
            </span>
          </span>
        </ScreenLink>
        <div className={`${styles.actions} ${styles.glass}`}>
          <button type="button" onClick={() => showStub()} aria-label="Поиск по чату"><img src={searchIcon} alt="" width={24} height={24} /></button>
        </div>
      </header>

      <ol ref={list} className={styles.messages}>
        {messages.length === 0 && <li className={styles.empty}>Здесь пока пусто — начните переписку 👋</li>}
        {messages.map((message) => (
          <MessageRow key={message.id} message={message} fresh={!initialIds.has(message.id)}
            highlighted={highlighted === message.id} onReply={startReply} onMenu={setMenuFor} onJump={jumpTo} />
        ))}
      </ol>

      <form className={styles.composer} onSubmit={send}>
        <AnimatePresence initial={false}>
          {replyTarget && (
            <motion.div key="reply" className={`${styles.replyBar} ${styles.glass}`}
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 12 }} transition={softSpring}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M9 7 4 12l5 5M4 12h10a6 6 0 0 1 6 6" /></svg>
              <span className={styles.replyText}>
                <span className={styles.replyAuthor}>Ответ {authorOf(replyTarget) === 'Вы' ? 'себе' : authorOf(replyTarget)}</span>
                <span className={styles.replySnippet}>{summary(replyTarget)}</span>
              </span>
              <button type="button" className={styles.replyClose} aria-label="Отменить ответ" onClick={() => setReplyTarget(null)}>×</button>
            </motion.div>
          )}
        </AnimatePresence>
        {recordingSince === null ? (
          <>
            <button type="button" onClick={() => showStub()} className={`${styles.round} ${styles.glass}`} aria-label="Прикрепить">
              <img src={paperclipIcon} alt="" width={24} height={24} />
            </button>
            <label className={`${styles.field} ${styles.glass}`}>
              <span className={styles.visuallyHidden}>Сообщение</span>
              <input ref={input} value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="Сообщение" enterKeyHint="send"
                onKeyDown={(event) => event.key === 'Escape' && setReplyTarget(null)} />
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

      <AnimatePresence>
        {toast && (
          <motion.div key={toast} className={styles.toast} role="status"
            initial={{ opacity: 0, y: -10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -10 }}>
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {menuFor && (
          <MessageMenu key="menu" author={authorOf(menuFor)} text={summary(menuFor)} out={menuFor.out}
            canCopy={menuFor.kind === 'text'} onAction={onMenuAction} onClose={() => setMenuFor(null)} />
        )}
      </AnimatePresence>
      <StubSheet />
    </section>
  )
}

/** A new message springs out of its bubble corner; the history renders as plain rows. */
function Row({ fresh, out, className, id, children }: { fresh: boolean; out?: boolean; className: string; id: number; children: ReactNode }) {
  if (!fresh) return <li className={className} data-id={id}>{children}</li>
  return (
    <motion.li className={className} data-id={id} style={{ transformOrigin: out ? '100% 100%' : '0 100%' }}
      initial={{ opacity: 0, y: 18, scale: 0.92 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={softSpring}>
      {children}
    </motion.li>
  )
}

const LONG_PRESS = 450
const SWIPE_TO_REPLY = 56

/**
 * Message gestures: swipe right to reply, long press (or right click) for the menu.
 * The bubble follows the finger and springs back; a reply arrow fades in behind it.
 */
function Gestures({ onReply, onMenu, children }: { onReply: () => void; onMenu: () => void; children: ReactNode }) {
  const x = useMotionValue(0)
  const arrow = useTransform(x, [0, SWIPE_TO_REPLY], [0, 1])
  const press = useRef(0)
  const start = useRef<{ x: number; y: number } | null>(null)

  const cancelPress = () => window.clearTimeout(press.current)
  const openMenu = (target: EventTarget | null) => {
    // The release after a long press must not also press a button inside the bubble.
    ;(target as HTMLElement | null)?.closest('li')?.addEventListener('click', (event) => event.preventDefault(), { capture: true, once: true })
    onMenu()
  }

  return (
    <motion.div className={styles.gesture} style={{ x, touchAction: 'pan-y' }}
      drag="x" dragDirectionLock dragConstraints={{ left: 0, right: 0 }} dragElastic={{ left: 0, right: 0.55 }} dragSnapToOrigin
      onDragStart={cancelPress}
      onDragEnd={(_, info) => info.offset.x > SWIPE_TO_REPLY && onReply()}
      onPointerDown={(event) => {
        start.current = { x: event.clientX, y: event.clientY }
        const target = event.target
        press.current = window.setTimeout(() => openMenu(target), LONG_PRESS)
      }}
      onPointerMove={(event) => {
        if (start.current && Math.hypot(event.clientX - start.current.x, event.clientY - start.current.y) > 8) cancelPress()
      }}
      onPointerUp={cancelPress} onPointerCancel={cancelPress}
      onContextMenu={(event) => {
        event.preventDefault()
        cancelPress()
        onMenu()
      }}>
      <motion.span className={styles.replyArrow} style={{ opacity: arrow, scale: arrow }} aria-hidden="true">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"
          strokeLinecap="round" strokeLinejoin="round"><path d="M9 7 4 12l5 5M4 12h10a6 6 0 0 1 6 6" /></svg>
      </motion.span>
      {children}
    </motion.div>
  )
}

function QuoteBlock({ quote, onJump }: { quote: Quote; onJump: (id: number) => void }) {
  return (
    <button type="button" className={styles.quote} onClick={() => onJump(quote.id)} aria-label={`Ответ на сообщение: ${quote.text}`}>
      <span className={styles.quoteAuthor}>{quote.author}</span>
      <span className={styles.quoteText}>{quote.text}</span>
    </button>
  )
}

function MessageRow({ message, fresh, highlighted, onReply, onMenu, onJump }: {
  message: Message
  fresh: boolean
  highlighted: boolean
  onReply: (message: Message) => void
  onMenu: (message: Message) => void
  onJump: (id: number) => void
}) {
  const side = message.out ? styles.out : styles.in
  const rowClass = `${styles.row} ${side} ${highlighted ? styles.highlighted : ''}`
  const gestures = { onReply: () => onReply(message), onMenu: () => onMenu(message) }

  if (message.kind === 'day') {
    return <li className={styles.day} data-id={message.id}><span>{message.label}</span></li>
  }

  if (message.kind === 'sticker') {
    return (
      <Row fresh={fresh} out={message.out} id={message.id} className={rowClass}>
        <Gestures {...gestures}>
          <div className={styles.sticker}>
            <img src={sticker} alt="Стикер: мишка шлёт воздушный поцелуй" width={190} height={190} draggable={false} />
            <span className={styles.timeChip}>{message.time}</span>
          </div>
        </Gestures>
      </Row>
    )
  }

  if (message.kind === 'product') {
    return (
      <Row fresh={fresh} out={message.out} id={message.id} className={rowClass}>
        <Gestures {...gestures}>
          <div className={`${styles.bubble} ${styles.productBubble}`}>
            <ProductCard product={products[message.product]} />
          </div>
        </Gestures>
        {message.reactions && <Reactions reactions={message.reactions} dark />}
      </Row>
    )
  }

  return (
    <Row fresh={fresh} out={message.out} id={message.id} className={rowClass}>
      <Gestures {...gestures}>
        <div className={`${styles.bubble} ${message.kind === 'voice' ? styles.voiceBubble : ''}`}>
          {message.sender && !message.out && <div className={styles.sender}>{message.sender}</div>}
          {message.replyTo && <QuoteBlock quote={message.replyTo} onJump={onJump} />}
          {message.kind === 'text' && <p className={styles.text}>{message.text}<span className={styles.spacer} /></p>}
          {message.kind === 'voice' && <Voice duration={message.duration} seed={message.seed} />}
          {message.reactions && <Reactions reactions={message.reactions} />}
          <span className={styles.meta}>
            {message.time}
            {message.read && <img src={readIcon} alt="Прочитано" width={14} height={8} />}
          </span>
        </div>
      </Gestures>
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
          ? <img src={product.image} alt={product.title} draggable={false} />
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
