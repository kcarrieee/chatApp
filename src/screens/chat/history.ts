// Earlier days of every chat, so the history is long enough to scroll.
// Picked from pools by chat type; the same chat always gets the same days.
import type { Chat } from '../chat-list/chats'
import { scripts, type ProductId, type ScriptItem } from './conversations'

/** One message without a time; `from`: omitted = the contact, 'me' = us, A/B/C = group members. */
type Line = { from?: string } & ({ text: string } | { voice: string } | { product: ProductId } | { sticker: true })
type Exchange = Line[]

const personal: Exchange[] = [
  [{ text: 'Привет! Как прошли выходные?' }, { from: 'me', text: 'Отлично, ездили за город 🌲' }, { text: 'О, супер! Фотки скинешь?' }, { from: 'me', text: 'Вечером скину, сейчас бегу' }],
  [{ text: 'Слушай, подскажи хорошую кофейню в центре' }, { from: 'me', text: 'Попробуй «Зерно» на Садовой, там вкусный раф' }, { text: 'Спасибо! Завтра схожу ☕️' }],
  [{ from: 'me', text: 'Напомни, во сколько завтра встречаемся?' }, { text: 'В 19:00 у метро' }, { from: 'me', text: 'Ок, буду 👌' }],
  [{ text: 'Смотри, какая погода сегодня ☀️' }, { from: 'me', text: 'Наконец-то! Пойдём гулять?' }, { text: 'Давай после работы' }, { from: 'me', voice: '0:06' }],
  [{ text: 'Как тебе вчерашний фильм?' }, { from: 'me', text: 'Концовка неожиданная, но мне понравилось' }, { text: 'Мне тоже! Надо пересмотреть' }, { from: 'me', text: 'Давай на выходных 🍿' }],
  [{ text: 'Нашла классный рецепт 🍰' }, { from: 'me', text: 'Делись!' }, { text: 'Чизкейк без выпечки, вечером скину' }, { from: 'me', text: 'Жду 😋' }],
  [{ from: 'me', text: 'Ты дома?' }, { text: 'Да, а что?' }, { from: 'me', text: 'Занесу книгу, которую брала' }, { text: 'Давай, я тут до восьми' }],
  [{ text: 'Смотри, что присмотрела себе' }, { product: 'lamp' }, { from: 'me', text: 'Милота! Бери 😍' }],
  [{ voice: '0:09' }, { from: 'me', text: 'Ахах, поняла, тогда до встречи' }, { sticker: true }],
]

const work: Exchange[] = [
  [{ text: 'Доброе утро! Есть пара минут на созвон?' }, { from: 'me', text: 'Да, давай в 11' }, { text: 'Отлично, кидаю ссылку' }],
  [{ from: 'me', text: 'Отправила презентацию, посмотри, пожалуйста' }, { text: 'Посмотрел, пара правок по слайду 5' }, { from: 'me', text: 'Поправлю до обеда' }],
  [{ text: 'Не забудь про отчёт к пятнице' }, { from: 'me', text: 'Помню, почти готов 👍' }],
  [{ from: 'me', text: 'Можем перенести встречу на завтра?' }, { text: 'Да, без проблем' }, { text: 'Тогда в то же время' }, { from: 'me', text: 'Спасибо!' }],
  [{ text: 'Клиент одобрил макеты 🎉' }, { from: 'me', text: 'Ура! Отличная новость' }, { text: 'Передай команде спасибо' }],
  [{ from: 'me', text: 'Где лежит последний договор?' }, { text: 'В общей папке, раздел «Юристы»' }, { from: 'me', text: 'Нашла, спасибо' }],
  [{ voice: '0:12' }, { from: 'me', text: 'Поняла, добавлю в задачи' }],
]

const group: Exchange[] = [
  [{ from: 'A', text: 'Всем привет! Кто будет на встрече в субботу?' }, { from: 'B', text: 'Я буду 🙋' }, { from: 'C', text: 'Я тоже, возьму сок' }, { from: 'me', text: 'Постараюсь прийти' }],
  [{ from: 'A', text: 'Напоминаю про взносы до пятницы' }, { from: 'B', text: 'Перевела!' }, { from: 'C', text: 'Сегодня вечером переведу' }],
  [{ from: 'B', text: 'Смотрите, какое фото получилось 📸' }, { from: 'A', text: 'Красота!' }, { from: 'me', text: 'Вау 😍' }],
  [{ from: 'C', text: 'Кто-нибудь знает хорошего мастера по ремонту?' }, { from: 'A', text: 'Скину контакт в личку' }, { from: 'C', text: 'Спасибо!' }],
  [{ from: 'A', text: 'Предлагаю следующую встречу провести в парке' }, { from: 'B', text: 'Поддерживаю 🌳' }, { from: 'me', text: 'Отличная идея' }],
  [{ from: 'B', voice: '0:08' }, { from: 'A', text: 'Ахаха, точно 😄' }],
]

const channel: Exchange[] = [
  [{ text: 'Подборка недели уже здесь 🛍️' }, { product: 'scarf' }],
  [{ text: 'Спасибо, что вы с нами! 💜' }],
  [{ text: 'Сегодня работаем до 22:00' }],
  [{ text: 'Новый выпуск: как выбрать подарок к празднику 🎁' }, { product: 'headphones' }],
  [{ text: 'Хиты продаж месяца 👇' }, { product: 'grinder' }, { product: 'lamp' }],
]

const support: Exchange[] = [
  [{ from: 'me', text: 'Здравствуйте, как отследить заказ?' }, { text: 'Номер заказа есть в разделе «Доставки». Подсказать подробнее?' }, { from: 'me', text: 'Спасибо, разобралась' }],
  [{ text: 'Как вам наша поддержка? Оцените, пожалуйста, от 1 до 5' }, { from: 'me', text: '5 ⭐️' }, { text: 'Спасибо! Хорошего дня 💜' }],
]

// Before every label used in today's scripts and the chat list (weekdays, 27.09, 28.09).
const DAYS = ['20 сентября', '23 сентября']

function hash(text: string) {
  let value = 7
  for (const char of text) value = (value * 31 + char.charCodeAt(0)) % 1_000_003
  return value
}

function poolFor(chat: Chat): Exchange[] {
  if (chat.id === 'support') return support
  if (chat.folder === 'channels' && !chat.sender) return channel
  if (chat.members) return group
  return chat.folder === 'work' ? work : personal
}

/** Group members known from the chat's script, so the same people keep talking. */
function membersOf(chat: Chat) {
  const known = [...new Set((scripts[chat.id] ?? []).map((item) => item.from).filter((from): from is string => !!from && from !== 'me'))]
  return [...known, chat.sender, 'Аня', 'Миша', 'Света'].filter((name): name is string => !!name)
}

/** Label of the day the script and the last message belong to. */
export function currentDayLabel(chat: Chat) {
  const time = scripts[chat.id]?.[0]?.time ?? chat.time
  return time.includes(':') ? 'Сегодня' : time
}

/** Two earlier days of made-up history, each with a separator label. */
export function olderDays(chat: Chat): { label: string; items: ScriptItem[] }[] {
  const pool = poolFor(chat)
  const seed = hash(chat.id)
  const members = membersOf(chat)
  const pick = (i: number) => pool[(seed + i * 3) % pool.length]
  const exchanges = Array.from({ length: Math.min(5, pool.length) }, (_, i) => pick(i))
  const author = (from: string | undefined) =>
    from === 'A' ? members[0] : from === 'B' ? members[1] : from === 'C' ? members[2] : from

  return DAYS.map((label, day) => {
    const lines = (day === 0 ? exchanges.slice(0, 2) : exchanges.slice(2)).flat()
    let minutes = (day === 0 ? 12 * 60 + 10 : 18 * 60 + 30) + (seed % 40)
    const items = lines.map((line): ScriptItem => {
      minutes += 1 + ((seed + minutes) % 4)
      const time = `${Math.floor(minutes / 60)}:${String(minutes % 60).padStart(2, '0')}`
      return { ...line, from: author(line.from), time } as ScriptItem
    })
    return { label, items }
  })
}
