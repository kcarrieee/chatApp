import { ScreenLink } from '../../navigation/ScreenLink'
import { routes } from '../../navigation/routes'
import { demoContact } from '../../data/demoContact'
import styles from './ChatScreen.module.css'

export function ChatScreen() {
  return (
    <section className={styles.screen} aria-label="Чат">
      <p className={styles.eyebrow}>Chat Concept · Заготовка</p>
      <h1 className={styles.title}>Чат</h1>
      <p className={styles.description}>Собеседник: {demoContact.name}.</p>
      <nav className={styles.actions} aria-label="Переходы экрана">
        <ScreenLink className={styles.link} to={routes.chatList}>← Все чаты</ScreenLink>
        <ScreenLink className={styles.link} to={routes.profile}>Профиль собеседника</ScreenLink>
        <ScreenLink className={styles.link} to={routes.audioCall}>Аудиозвонок</ScreenLink>
        <ScreenLink className={styles.link} to={routes.videoCall}>Видеозвонок</ScreenLink>
      </nav>
    </section>
  )
}
