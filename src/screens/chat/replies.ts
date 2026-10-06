// Auto-replies: who answers and with what. Broadcast channels stay silent.
import type { Chat } from '../chat-list/chats'
import { scripts } from './conversations'

const personal: Record<string, string[]> = {
  alisa: ['Ахаха, точно 😄', 'Скину ещё пару идей вечером', 'Огонь, давай так и сделаем ⚡️', 'Мне нравится 💜'],
  viki: ['Уже готовлюсь к эфиру 🎥', 'Спасибо, что поддерживаешь!', 'Приходи обязательно 💗'],
  elizaveta: ['Будем ждать! 🥂', 'Я забронировала столик у окна', 'Оденься теплее 😉'],
  andrey: ['Принял, посмотрю', 'Документы уже в почте', 'Ок, созвонимся после обеда'],
  liza: ['Почти на месте 🏃‍♀️', 'Закажите мне тоже раф ☕️', 'Ещё 5 минут, обещаю 🙏'],
  katrin: ['Супер, тогда отправляю клиенту', 'Поправила, глянь ещё раз', 'Спасибо за фидбек!'],
  alex: ['Давай вечером обсудим голосом', 'Звучит круто 🔥', 'Скинь ссылку на прототип'],
  mama: ['Хорошо, доченька 😘', 'Ты покушала?', 'Позвони, как освободишься', 'Целую ❤️'],
  dad: ['Понял, жду звонка', 'Как будет минутка — набери', '👍'],
  masha: ['АХАХАХ', 'Лучшее, что я видела сегодня 😂', 'Скинь ещё!'],
  artem: ['Го! Во сколько?', 'Я возьму термос с чаем ☕️', 'Каток в парке или в ТЦ?'],
  nastya: ['Спасибо ещё раз!! 💜', 'Ты лучшая', 'Давай увидимся на выходных'],
  oleg: ['Ок, ссылка та же', 'Добавлю в повестку', 'Спасибо, учту'],
  sergey: ['Получил, спасибо', 'Подпишу сегодня', 'Отлично, договорились'],
  support: ['Спасибо за обращение! Чем ещё можем помочь?', 'Передали ваш вопрос специалисту, ответим в течение часа', 'Рады помочь 💜'],
}

const generic = ['Ага 🙂', 'Всё понятно!', 'Интересно, расскажи подробнее', 'Хорошо, договорились', 'Ахаха 😄']
const answers = ['Хороший вопрос 🤔 Давай обсудим вечером', 'Да, конечно!', 'Думаю, да 🙂', 'Пока не знаю, уточню и напишу']

/** Broadcast channels (no authors) never answer. */
export function canReply(chat: Chat | undefined) {
  return !chat || chat.folder !== 'channels' || Boolean(chat.sender)
}

/** In groups known members answer in turn; in personal chats the contact. */
export function replier(chat: Chat | undefined, turn: number) {
  if (!chat?.members) return undefined
  const authors = [...new Set((scripts[chat.id] ?? []).map((item) => item.from).filter((from) => from && from !== 'me'))]
  const pool = authors.length ? authors : [chat.sender ?? 'Участник']
  return pool[turn % pool.length]
}

export function replyText(chatId: string, sent: string, turn: number) {
  if (sent.includes('?')) return answers[turn % answers.length]
  const pool = personal[chatId] ?? generic
  return pool[turn % pool.length]
}
