// Profile details for every chat and contact, shared by the profile and call screens.
// Made-up but stable: the same id always gets the same phone, username and birthday.
import { chats, contacts, storyUsers } from '../screens/chat-list/chats'

export type ProfileDetail = { label: string; value: string; accent?: boolean }
export type ProfilePost = { image: string; description: string; views: string; likes: string }
export type PeerProfile = {
  kind: 'person' | 'group' | 'channel'
  status: string
  details: ProfileDetail[]
  posts: ProfilePost[]
  /** Large photo for the video call, when the peer has one. */
  photo?: string
}

const about: Record<string, string> = {
  berries: 'Сообщество любителей ягод и пикников. Встречаемся по выходным 🍓',
  wbchat: 'Официальный канал WB Chat: новости, подборки и скидки для подписчиков',
  'design-team': 'Макеты, ревью и вечные споры про отступы',
  books: 'Читаем по книге в месяц и обсуждаем по субботам 📚',
  'product-team': 'Команда прототипа Chat Concept: планы, демо и фидбек',
  neighbors: 'Чат жильцов дома на Цветочной, 12',
  'wb-sales': 'Лучшие скидки недели — каждый день до −70%',
  coffee: 'Кофейня у дома: меню, акции и новые сезонные напитки ☕️',
  yoga: 'Утренние практики в парке и онлайн 🧘‍♀️',
}

const MONTHS = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря']
const LATIN: Record<string, string> = {
  а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', е: 'e', ё: 'e', ж: 'zh', з: 'z', и: 'i', й: 'y', к: 'k', л: 'l', м: 'm', н: 'n', о: 'o',
  п: 'p', р: 'r', с: 's', т: 't', у: 'u', ф: 'f', х: 'h', ц: 'ts', ч: 'ch', ш: 'sh', щ: 'sch', ъ: '', ы: 'y', ь: '', э: 'e', ю: 'yu', я: 'ya',
}

function hash(text: string) {
  let value = 7
  for (const char of text) value = (value * 31 + char.charCodeAt(0)) % 1_000_003
  return value
}

const translit = (text: string) => [...text.toLowerCase()].map((char) => LATIN[char] ?? (/[a-z0-9]/.test(char) ? char : '')).join('')
const digits = (seed: number, length: number) => String(seed % 10 ** length).padStart(length, '0')

export function profileOf(id: string): PeerProfile {
  const chat = chats.find((item) => item.id === id)
  const contact = contacts.find((item) => item.id === id)
  const name = chat?.name ?? contact?.name ?? ''
  const seed = hash(id)
  const stories = storyUsers.find((user) => user.id === id)?.stories ?? []
  const posts = stories
    .filter((story) => story.image.endsWith('.jpg'))
    .map((story, i) => ({
      image: story.image,
      description: story.caption ?? `Фото: ${name}`,
      views: String(120 + ((seed >> i) % 880)),
      likes: String(12 + ((seed >> (i + 3)) % 140)),
    }))

  // Groups have authors in the chat list; channels live in the "Каналы" folder.
  if (chat?.members || chat?.folder === 'channels') {
    const kind = chat.folder === 'channels' && !chat.sender ? 'channel' : 'group'
    return {
      kind,
      status: chat.members ?? (kind === 'channel' ? 'канал' : 'группа'),
      details: [
        { label: kind === 'channel' ? 'О канале' : 'Описание', value: about[id] ?? 'Здесь пока нет описания' },
        { label: 'Ссылка', value: `wbchat.ru/${translit(name).slice(0, 18) || id}`, accent: true },
      ],
      posts,
    }
  }

  return {
    kind: 'person',
    status: contact?.status ?? 'был(а) недавно',
    details: [
      { label: 'Телефон', value: `+7 9${digits(seed, 2)} ${digits(seed >> 3, 3)}-${digits(seed >> 5, 2)}-${digits(seed >> 7, 2)}`, accent: true },
      { label: 'Имя пользователя', value: `@${translit(name.split(' ')[0])}_${digits(seed, 2)}`, accent: true },
      { label: 'День рождения', value: `${1 + (seed % 28)} ${MONTHS[seed % 12]}` },
    ],
    posts,
    photo: posts[0]?.image,
  }
}
