# Как работаем вдвоём

## Кто что делает

- Коллега: `src/screens/chat-list/` и `src/screens/chat/`.
- Карина: `src/screens/profile/`, `src/screens/audio-call/`, `src/screens/video-call/`.
- Общий каркас, навигацию и общие данные меняет Карина после согласования.

## Первый запуск

После того как общая основа попадёт в GitHub, в уже клонированном проекте:

```sh
git switch main
git pull --ff-only origin main
npm ci
npm run dev
```

Открой адрес, который напишет терминал. По умолчанию откроется список чатов.

## Работа над экраном

Начинай новую задачу с актуальной `main` и чистой рабочей папки:

```sh
git switch main
git pull --ff-only origin main
git switch -c feature/chat-list
```

Для чата используй отдельную ветку `feature/chat`. Для последующих задач выбирай новое имя, например `feature/chat-messages`.

Меняй свой `.tsx` и соседний `.module.css`. Внутренние компоненты и картинки тоже клади в свою папку. Корпус телефона и мобильный режим уже подключены — повторять их не нужно.

Переходы уже работают. Для новой ссылки используй:

```tsx
<ScreenLink to={routes.profile}>Профиль</ScreenLink>
```

Импорты уже есть в заготовках. Один и тот же собеседник доступен из `src/data/demoContact.ts`.

Прямые адреса (добавь к адресу локального сервера):

- `/#/chats` — список чатов
- `/#/chat` — чат
- `/#/profile` — профиль
- `/#/audio-call` — аудиозвонок
- `/#/video-call` — видеозвонок

## Отправить готовый этап

```sh
npm run build
npm run lint
git add src/screens/chat-list
git commit -m "Add chat list screen"
git push -u origin feature/chat-list
```

Для чата замени папку и ветку на `src/screens/chat` и `feature/chat`.

На GitHub нажми **Compare & pull request**, выбери направление **твоя ветка → main**. Напиши, что готово, и приложи скриншот. Карина проверяет и объединяет PR. Следующая задача — новая ветка от обновлённой `main`.

## Получить изменения Карины в свою рабочую ветку

Сначала сохрани свою работу коммитом, затем, оставаясь в своей ветке:

```sh
git fetch origin
git merge origin/main
npm ci
```

Если появился конфликт — разберите его вместе, не заменяйте файл целиком чужой или своей версией вслепую.

## Три правила

1. Работаем в своих папках и отдельных ветках, готовые этапы отправляем через PR.
2. `App.tsx`, `App.css`, `index.css`, `PhoneFrame`, `PrototypeScreen`, `navigation/` и `data/` согласовываем с Кариной.
3. Новые библиотеки согласовываем; при установке коммитим и `package.json`, и `package-lock.json`. `node_modules` и `dist` не коммитим.
