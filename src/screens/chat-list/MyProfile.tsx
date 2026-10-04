// Own profile, laid out like Karina's contact profile (screens/profile) and themed.
import type { CSSProperties } from 'react'
import { me, storyUsers } from './chats'
import meAvatar from './assets/me.jpg'
import { showStub } from './stub'
import { setTheme, useThemeChoice, type ThemeChoice } from './theme'
import styles from './MyProfile.module.css'

const profileAssets = `${import.meta.env.BASE_URL}assets/profile/`

// WB Sans from Karina's profile fonts, loaded relative to BASE_URL so subfolder hosting works.
const wbSans = new FontFace('My WB Sans', `url(${profileAssets}fonts/wb-sans.otf)`)
wbSans.load().then((font) => document.fonts.add(font)).catch(() => {})

const themes: { id: ThemeChoice; label: string }[] = [
  { id: 'light', label: 'Светлая' },
  { id: 'dark', label: 'Тёмная' },
  { id: 'system', label: 'Системная' },
]

const settings = ['Уведомления и звуки', 'Конфиденциальность', 'Данные и память', 'Устройства', 'Помощь']

const CameraIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round">
    <path d="M4 8.5A2.5 2.5 0 0 1 6.5 6h1.2l1.3-2h6l1.3 2h1.2A2.5 2.5 0 0 1 20 8.5v8A2.5 2.5 0 0 1 17.5 19h-11A2.5 2.5 0 0 1 4 16.5z" />
    <circle cx="12" cy="12.5" r="3.5" />
  </svg>
)
const PlusIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
    <circle cx="12" cy="12" r="8.5" />
    <path d="M12 8.5v7M8.5 12h7" />
  </svg>
)
const ShareIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 15V4M8 8l4-4 4 4M5 13v4.5A2.5 2.5 0 0 0 7.5 20h9a2.5 2.5 0 0 0 2.5-2.5V13" />
  </svg>
)
const EditIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14.5 5.5 18.5 9.5M5 19l1-4L16 5l3 3-10 10z" />
  </svg>
)

export function MyProfile() {
  const theme = useThemeChoice()
  const posts = storyUsers.find((user) => user.mine)?.stories ?? []
  // Long names shrink to stay on one line, as in the contact profile.
  const nameSize = Math.min(52, 330 / (0.6 * me.name.length))

  return (
    <div className={styles.profile} style={{ '--profile-bg': `url(${profileAssets}background.svg)` } as CSSProperties}>
      <header className={styles.toolbar}>
        <button type="button" className={styles.toolbarButton} aria-label="QR-код" onClick={() => showStub()}>
          <img src={`${profileAssets}qr.svg`} alt="" />
        </button>
        <button type="button" className={styles.toolbarButton} aria-label="Меню" onClick={() => showStub()}>
          <img src={`${profileAssets}menu.svg`} alt="" />
        </button>
      </header>

      <div className={styles.identity}>
        <span className={styles.avatar}>
          <img src={meAvatar} alt={me.name} />
          <span className={styles.plus} aria-hidden="true">+</span>
        </span>
        <h1 className={styles.name} style={{ fontSize: nameSize }}>{me.name}</h1>
        <p className={styles.status}>в сети</p>
      </div>

      <nav className={styles.actions} aria-label="Действия с профилем">
        <button type="button" className={styles.action} aria-label="Сменить фото" onClick={() => showStub()}><CameraIcon /></button>
        <button type="button" className={styles.action} aria-label="Добавить историю" onClick={() => showStub('Создание историй скоро')}><PlusIcon /></button>
        <button type="button" className={styles.action} aria-label="Изменить профиль" onClick={() => showStub()}><EditIcon /></button>
        <button type="button" className={styles.action} aria-label="Поделиться профилем" onClick={() => showStub()}><ShareIcon /></button>
        <button type="button" className={styles.action} aria-label="Ещё" onClick={() => showStub()}>
          <img src={`${profileAssets}more.svg`} alt="" />
        </button>
      </nav>

      <dl className={styles.card}>
        <div><dt>О себе</dt><dd>{me.about}</dd></div>
      </dl>

      <section className={styles.card} aria-labelledby="appearance">
        <div className={styles.cardRow}>
          <h2 id="appearance" className={styles.cardLabel}>Оформление</h2>
          <div className={styles.segmented} role="radiogroup" aria-label="Тема">
            {themes.map((item) => (
              <button key={item.id} type="button" role="radio" aria-checked={theme === item.id}
                onClick={() => setTheme(item.id)}>{item.label}</button>
            ))}
          </div>
        </div>
        {settings.map((label) => (
          <button key={label} type="button" className={styles.setting} onClick={() => showStub()}>
            {label}<span aria-hidden="true">›</span>
          </button>
        ))}
      </section>

      <section className={styles.publications} aria-label="Публикации">
        <div className={styles.tabs}>
          <span className={styles.selected}>Публикации</span>
          <span>Медиа</span><span>Файлы</span><span>Ссылки</span>
        </div>
        <div className={styles.grid}>
          {posts.map((post) => (
            <article key={post.image} className={styles.post}>
              <img src={post.image} alt={post.caption ?? 'Моя публикация'} loading="lazy" />
              <div className={styles.statistics}>
                <span><img src={`${profileAssets}eye.svg`} alt="" />12</span>
                <span><img src={`${profileAssets}heart.svg`} alt="" />5</span>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}
