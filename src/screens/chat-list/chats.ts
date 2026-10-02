// Demo content for the chat list. Static on purpose: chats are not created in the prototype.
import { demoContact } from '../../data/demoContact'
import alisa from './assets/alisa.png'
import viki from './assets/viki.png'
import berries from './assets/berries.png'
import elizaveta from './assets/elizaveta.png'
import wbchat from './assets/wbchat.png'
import andrey from './assets/andrey.png'
import liza from './assets/liza.png'
import katrin from './assets/katrin.png'

export type FolderId = 'all' | 'personal' | 'work' | 'channels'

export type Chat = {
  id: string
  name: string
  avatar?: string
  /** Background for the initials avatar when there is no photo. */
  color?: string
  folder: Exclude<FolderId, 'all'>
  /** Author of the last message in group chats. */
  sender?: string
  message: string
  time: string
  unread?: number
  muted?: boolean
  verified?: boolean
  /** Our last message was read. */
  read?: boolean
  /** Number of unseen stories: 1 draws a solid ring, more draw a segmented one. */
  stories?: number
}

export const folders: { id: FolderId; label: string; badge?: number; accent?: boolean }[] = [
  { id: 'all', label: 'Все' },
  { id: 'personal', label: 'Личные', badge: 6 },
  { id: 'work', label: 'Work', badge: 2, accent: true },
  { id: 'channels', label: 'Каналы' },
]

export const chats: Chat[] = [
  { id: 'alisa', name: 'Алиса', avatar: alisa, folder: 'personal', message: 'Привет) сделал новую проект, зацени)) 😎⚡️', time: '9:41', unread: 1, stories: 1 },
  { id: 'viki', name: 'Вики', avatar: viki, folder: 'personal', message: 'Мы скоро начнем прямую трансляцию', time: '9:41', unread: 1, muted: true, stories: 1 },
  { id: 'berries', name: 'Ягодные кочевники', avatar: berries, folder: 'channels', sender: 'Мартин', message: 'Нас уже 2 500 участников! Ура!', time: '9:22', muted: true },
  { id: 'elizaveta', name: 'Елизавета', avatar: elizaveta, folder: 'personal', message: 'Столик на четверых, в 14:00, будем тебя ждать)', time: '9:12', read: true, stories: 5 },
  { id: 'wbchat', name: 'WB Chat', avatar: wbchat, folder: 'channels', message: 'Приветствуем вас в нашем официальном канале! 💜💜💜', time: '8:12', unread: 1, verified: true },
  { id: 'andrey', name: 'Андрей', avatar: andrey, folder: 'work', message: 'Отправила документы, проверь почту', time: '8:28', unread: 1 },
  { id: 'liza', name: 'Лиза', avatar: liza, folder: 'personal', message: 'Буду через 15 минут, подождите 🙏🏻', time: '9:12', stories: 3 },
  { id: 'katrin', name: 'Кэтрин', avatar: katrin, folder: 'work', message: 'Проект готов, можно отправлять клиенту', time: '8:28', unread: 1 },
  { id: demoContact.id, name: demoContact.name, color: '#0088ff', folder: 'personal', message: 'Созвонимся вечером? Есть пара идей по концепту', time: 'Вчера', read: true },
  { id: 'design-team', name: 'Команда дизайна', color: '#ff8d28', folder: 'work', sender: 'Карина', message: 'Скинула новые макеты в фигму, посмотрите до обеда', time: 'Вчера', unread: 3 },
  { id: 'mama', name: 'Мама', color: '#ff383c', folder: 'personal', message: 'Не забудь шапку, сегодня обещали холод', time: 'Вчера' },
  { id: 'books', name: 'Книжный клуб', color: '#34c759', folder: 'channels', sender: 'Оля', message: 'В субботу обсуждаем «Мастера и Маргариту», кто с нами?', time: 'Пн', muted: true, unread: 12 },
  { id: 'sergey', name: 'Сергей Петров', color: '#6155f5', folder: 'work', message: 'Договор подписал, скан в почте', time: 'Пн', read: true },
]

export function initials(name: string) {
  return name.split(' ').slice(0, 2).map((word) => word[0]).join('').toUpperCase()
}
