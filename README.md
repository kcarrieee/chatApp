# Chat Concept

Клиентский прототип на React, Vite и TypeScript. Без сервера и библиотек анимации.

## Запуск

```sh
npm install
npm run dev
```

## Проверки и сборка

```sh
npm run lint
npm run build
npm run preview
```

Содержимое `dist/` готово для статического хостинга. Относительный `base` позволяет размещать сборку в подпапке.

Инструкция для совместной работы: [COLLABORATION.md](./COLLABORATION.md).

Экраны лежат в `src/screens/`, каждый со своим CSS Module. Навигация использует URL после `#`, поэтому прямые ссылки работают на статическом хостинге без дополнительных настроек.

## Структура

- `src/App.tsx` — рабочая область с точечным фоном из dresser.mishanaer.com.
- `src/components/PhoneFrame.tsx` — корпус iPhone, статус-бар и домашний индикатор.
- `src/components/PrototypeScreen.tsx` — переключение пяти экранов по URL.
- `src/App.css` — оформление и адаптивный размер устройства.
- `public/assets/iphone/` — локальные оригинальные ресурсы Figma.

Макет: https://www.figma.com/design/1NZmtql1cKSZ6KtLA2a6CD/Portfolio-site?node-id=934-21508

Экран сохраняет пропорции 400 × 874 и масштабируется вместе с корпусом под размер окна. Корпус не перехватывает клики по будущему интерфейсу.

На мобильных (ширина до 767 px, а также горизонтальная ориентация сенсорных устройств высотой до 500 px) экран занимает всё окно. Корпус, декоративный статус-бар и домашний индикатор скрыты.

## Автопубликация на GitHub Pages

Workflow `.github/workflows/deploy-pages.yml` после каждого push в `main` устанавливает
зависимости через `npm ci`, запускает линтер, собирает приложение и публикует `dist/`.
Другие ветки не меняют опубликованный сайт. Можно запустить публикацию вручную:
**Actions → Deploy to GitHub Pages → Run workflow → main**.

Однократно в репозитории откройте **Settings → Pages → Build and deployment → Source**
и выберите **GitHub Actions**. Затем добавьте workflow в Git и отправьте его в `main`.
Дополнительные токены и секреты не нужны: используется встроенный `GITHUB_TOKEN`.

Адрес сайта: https://kcarrieee.github.io/chatApp/

Путь для ресурсов сборки берётся из настроек Pages, поэтому файлы работают в `/chatApp/`
и при использовании собственного домена. Локальный запуск остаётся без изменений.
Для проверки такой сборки локально:

```sh
npm run build -- --base /chatApp/
npm run preview -- --base /chatApp/
```

Откройте `http://localhost:4173/chatApp/`. Состояние публикации видно во вкладке Actions.
