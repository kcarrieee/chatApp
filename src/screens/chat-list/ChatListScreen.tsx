import { ScreenLink } from '../../navigation/ScreenLink'
import { routes } from '../../navigation/routes'
import { demoContact } from '../../data/demoContact'
import styles from './ChatListScreen.module.css'

export function ChatListScreen() {
  return (
    <section className={styles.screen} aria-label="Список чатов">
      <p className={styles.eyebrow}>Chat Concept · Заготовка</p>
      <h1 className={styles.title}>Список чатов</h1>
      <p className={styles.description}>Здесь будет список чатов.</p>
      <nav className={styles.actions} aria-label="Переходы экрана">
        <ScreenLink className={styles.link} to={routes.chat}>Открыть чат: {demoContact.name}</ScreenLink>
      </nav>
    </section>
  )
}
