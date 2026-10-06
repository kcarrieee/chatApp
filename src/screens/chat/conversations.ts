// Made-up chat histories shown before the last message from the chat list.
// `from`: omitted = the contact, 'me' = us, any other name = author in a group or channel.
import blouse from './assets/product.png'

export type Product = {
  title: string
  brand: string
  price: string
  oldPrice: string
  discount: string
  rating: string
  reviews: string
  delivery: string
  size?: string
  /** Photo, or an emoji on a tinted tile when we have no picture. */
  image?: string
  emoji?: string
  tint?: string
}

export const products = {
  blouse: { title: 'Блузка хлопок нежная', brand: 'Molly Spot', price: '2036 ₽', oldPrice: '25 200 ₽', discount: '−79%', rating: '4,5', reviews: '24 оценки', delivery: 'Послезавтра', size: 'XS', image: blouse },
  headphones: { title: 'Наушники беспроводные с шумоподавлением', brand: 'SoundLab', price: '4 290 ₽', oldPrice: '9 990 ₽', discount: '−57%', rating: '4,8', reviews: '1 203 оценки', delivery: 'Завтра', emoji: '🎧', tint: '#e8e3ff' },
  mat: { title: 'Коврик для йоги 6 мм', brand: 'FitZone', price: '1 190 ₽', oldPrice: '2 490 ₽', discount: '−52%', rating: '4,9', reviews: '860 оценок', delivery: 'Сегодня', emoji: '🧘‍♀️', tint: '#dff7f3' },
  grinder: { title: 'Кофемолка ручная керамическая', brand: 'BaristaPro', price: '1 650 ₽', oldPrice: '3 300 ₽', discount: '−50%', rating: '4,7', reviews: '318 оценок', delivery: 'Послезавтра', emoji: '☕️', tint: '#f3e9de' },
  skates: { title: 'Коньки фигурные белые', brand: 'IceStar', price: '3 490 ₽', oldPrice: '6 990 ₽', discount: '−50%', rating: '4,6', reviews: '97 оценок', delivery: 'Завтра', size: '38', emoji: '⛸️', tint: '#e3f1ff' },
  lamp: { title: 'Ночник-облако с пультом', brand: 'CozyHome', price: '890 ₽', oldPrice: '1 990 ₽', discount: '−55%', rating: '4,8', reviews: '2 541 оценка', delivery: 'Завтра', emoji: '☁️', tint: '#fff3d6' },
  scarf: { title: 'Шарф вязаный объёмный', brand: 'Nord Knit', price: '1 290 ₽', oldPrice: '3 200 ₽', discount: '−60%', rating: '4,7', reviews: '412 оценок', delivery: 'Сегодня', emoji: '🧣', tint: '#ffe3e3' },
} satisfies Record<string, Product>

export type ProductId = keyof typeof products

export type ScriptItem = { from?: string; time: string } & (
  | { text: string }
  | { voice: string }
  | { product: ProductId }
  | { sticker: true }
)

export const scripts: Record<string, ScriptItem[]> = {
  viki: [
    { time: '9:02', text: 'Привет! Сегодня в 10 большой эфир, придёшь? 🎥' },
    { from: 'me', time: '9:05', text: 'Конечно! Что будет?' },
    { time: '9:06', voice: '0:14' },
    { time: '9:07', text: 'Короче, разбор осенних образов и розыгрыш' },
    { time: '9:07', product: 'scarf' },
    { from: 'me', time: '9:10', text: 'Шарф огонь, забираю в избранное 🧣' },
    { from: 'me', time: '9:11', voice: '0:11' },
  ],
  berries: [
    { from: 'Мартин', time: '8:40', text: 'Друзья, доброе утро! Сегодня собираемся у фонтана в 12:00 🍓' },
    { from: 'Оксана', time: '8:52', text: 'Я возьму пледы и термос' },
    { from: 'Мартин', time: '9:01', voice: '0:05' },
    { from: 'Лёша', time: '9:10', text: 'А можно с собакой?' },
    { from: 'Мартин', time: '9:12', text: 'Конечно, мы за всех хвостатых 🐶' },
    { from: 'Оксана', time: '9:15', sticker: true },
  ],
  elizaveta: [
    { time: '8:30', text: 'Ты в субботу свободна?' },
    { from: 'me', time: '8:41', text: 'Да, а что задумала?' },
    { time: '8:45', voice: '0:07' },
    { from: 'me', time: '8:50', text: 'Ура, я за! Где собираемся?' },
    { time: '9:05', text: 'В «Облаках» на крыше, я забронирую' },
    { time: '9:06', text: 'Только оденься теплее, там ветрено' },
    { from: 'me', time: '9:08', product: 'scarf' },
    { from: 'me', time: '9:08', text: 'Вот, как раз взяла себе 😌' },
  ],
  andrey: [
    { from: 'me', time: '7:50', text: 'Андрей, привет! Пришлёшь договор и акт?' },
    { time: '8:02', text: 'Да, сейчас соберу всё в один архив' },
    { time: '8:15', voice: '0:09' },
    { from: 'me', time: '8:20', text: 'Поняла, тогда подпишу сегодня до вечера' },
    { from: 'me', time: '8:21', text: 'И напомни, пожалуйста, реквизиты для оплаты' },
  ],
  liza: [
    { from: 'me', time: '8:30', text: 'Ты где? Мы уже у входа 🙈' },
    { time: '8:45', voice: '0:09' },
    { from: 'me', time: '8:50', text: 'Ок, займём столик у окна' },
    { time: '9:00', text: 'Закажите мне раф, пожалуйста ☕️' },
    { from: 'me', time: '9:02', text: 'Тыквенный или обычный?' },
    { time: '9:05', text: 'Тыквенный конечно 🎃' },
  ],
  katrin: [
    { time: '7:30', text: 'Доброе! Финальные правки по лендингу внесла' },
    { from: 'me', time: '7:45', text: 'Супер, посмотрю после стендапа' },
    { from: 'me', time: '8:10', voice: '0:12' },
    { time: '8:15', text: 'Поправила кнопку и шрифты в футере' },
    { time: '8:20', text: 'Скидываю превью 👇' },
    { time: '8:21', sticker: true },
  ],
  alex: [
    { time: 'Вчера', text: 'Видела новый прототип мессенджера? Истории прям кайф' },
    { from: 'me', time: 'Вчера', text: 'Да! И поиск сделали по всем чатам' },
    { time: 'Вчера', voice: '0:09' },
    { from: 'me', time: 'Вчера', text: 'Давай обсудим голосом, так быстрее' },
  ],
  'design-team': [
    { from: 'Карина', time: 'Вчера', text: 'Всем привет! Обновила макеты профиля и звонков' },
    { from: 'Дима', time: 'Вчера', text: 'Ссылку можно в закреп?' },
    { from: 'Карина', time: 'Вчера', voice: '0:04' },
    { from: 'me', time: 'Вчера', text: 'Я забираю экран чата и поиск 🙋' },
    { from: 'Ника', time: 'Вчера', text: 'А истории кто делает?' },
    { from: 'me', time: 'Вчера', text: 'Тоже я, уже почти готово' },
  ],
  mama: [
    { time: 'Вчера', text: 'Доченька, ты поела?' },
    { from: 'me', time: 'Вчера', text: 'Да, мам 😊' },
    { time: 'Вчера', voice: '0:10' },
    { time: 'Вчера', text: 'Нашла тебе шарф, посмотри' },
    { time: 'Вчера', product: 'scarf' },
    { from: 'me', time: 'Вчера', text: 'Мам, он классный! Спасибо 💜' },
  ],
  books: [
    { from: 'Оля', time: 'Вс', text: 'Всем привет! Голосуем за книгу на следующую встречу 📚' },
    { from: 'Миша', time: 'Вс', text: 'Я за Булгакова' },
    { from: 'Света', time: 'Вс', text: 'Поддерживаю!' },
    { from: 'Оля', time: 'Вс', voice: '0:12' },
  ],
  sergey: [
    { time: 'Пн', text: 'Добрый день! Готов подписать договор на этой неделе' },
    { from: 'me', time: 'Пн', text: 'Отлично, отправила вам финальную версию' },
    { time: 'Пн', text: 'Получил, посмотрю сегодня' },
    { time: 'Пн', voice: '0:12' },
  ],
  'product-team': [
    { from: 'Олег', time: 'Пн', text: 'Ребята, демо в четверг, успеваем?' },
    { from: 'me', time: 'Пн', text: 'Чат, поиск и истории готовы 🚀' },
    { from: 'Карина', time: 'Пн', text: 'Профиль и звонки — завтра' },
    { from: 'Олег', time: 'Пн', voice: '0:04' },
    { from: 'Ника', time: 'Пн', text: 'Я подготовлю сценарий показа' },
  ],
  masha: [
    { time: 'Пн', text: 'Смотри что нашла 😂' },
    { time: 'Пн', sticker: true },
    { from: 'me', time: 'Пн', text: 'АХАХАХ мишка такой милый' },
    { time: 'Пн', voice: '0:12' },
    { time: 'Пн', text: 'И ещё вот, хочу себе на подоконник' },
    { time: 'Пн', product: 'lamp' },
  ],
  neighbors: [
    { from: 'Ирина', time: 'Пн', text: 'Добрый вечер, соседи! Кто-то оставил самокат у лифта 🛴' },
    { from: 'Пётр Иванович', time: 'Пн', text: 'Это внука, сейчас уберём' },
    { from: 'Анна', time: 'Пн', text: 'Напоминаю: в субботу субботник во дворе 🌳' },
    { from: 'Ирина', time: 'Пн', voice: '0:08' },
  ],
  'wb-sales': [
    { time: 'Вс', text: 'Горячие скидки недели 🔥' },
    { time: 'Вс', product: 'headphones' },
    { time: 'Вс', product: 'lamp' },
    { time: 'Вс', product: 'grinder' },
    { time: 'Вс', text: 'Успейте добавить в корзину, количество ограничено' },
  ],
  oleg: [
    { time: 'Вс', text: 'Привет! Есть минутка обсудить роадмап?' },
    { from: 'me', time: 'Вс', text: 'Да, давай после обеда' },
    { time: 'Вс', voice: '0:08' },
    { from: 'me', time: 'Вс', text: 'Договорились, жду ссылку' },
  ],
  artem: [
    { time: 'Сб', text: 'Как неделя?' },
    { from: 'me', time: 'Сб', text: 'Насыщенная, но всё успеваю' },
    { time: 'Сб', voice: '0:04' },
    { from: 'me', time: 'Сб', text: 'Кстати, смотри какие коньки нашла' },
    { from: 'me', time: 'Сб', product: 'skates' },
  ],
  coffee: [
    { time: 'Пт', text: 'Доброе утро! Открылись в 8:00, ждём вас ☀️' },
    { time: 'Пт', text: 'А для домашнего кофе советуем вот эту кофемолку' },
    { time: 'Пт', product: 'grinder' },
  ],
  nastya: [
    { from: 'me', time: 'Пт', text: 'С днём рождения!! 🎉🎂' },
    { from: 'me', time: 'Пт', voice: '0:15' },
    { time: 'Пт', text: 'Ааа спасибо большое!!' },
    { time: 'Пт', text: 'Подарок уже пришёл, курьер только что был' },
  ],
  support: [
    { from: 'me', time: 'Ср', text: 'Здравствуйте! Пришли наушники не того цвета' },
    { time: 'Ср', text: 'Здравствуйте! Сожалеем. Уточните, пожалуйста, номер заказа' },
    { from: 'me', time: 'Ср', text: '48213, наушники SoundLab' },
    { time: 'Ср', product: 'headphones' },
    { time: 'Чт', text: 'Оформили обмен, курьер привезёт новую пару завтра' },
  ],
  dad: [
    { time: 'Ср', text: 'Как дела на работе?' },
    { from: 'me', time: 'Ср', text: 'Всё хорошо, пап. Вечером наберу' },
    { time: 'Ср', voice: '0:09' },
  ],
  yoga: [
    { from: 'Аня', time: '27.09', text: 'Спасибо всем за практику! Сегодня было очень тепло 🧡' },
    { from: 'Аня', time: '27.09', text: 'Многие спрашивали про коврик — вот он' },
    { from: 'Аня', time: '27.09', product: 'mat' },
    { from: 'Лена', time: '28.09', voice: '0:15' },
  ],
}
