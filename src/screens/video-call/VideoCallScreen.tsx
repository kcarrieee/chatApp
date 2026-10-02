import { ScreenLink } from '../../navigation/ScreenLink'
import { routes } from '../../navigation/routes'
import { demoContact } from '../../data/demoContact'
import styles from './VideoCallScreen.module.css'

export function VideoCallScreen() {
  return (
    <section className={styles.screen} aria-label="Видеозвонок">
      <p className={styles.eyebrow}>Chat Concept · Заготовка</p>
      <h1 className={styles.title}>Видеозвонок</h1>
      <p className={styles.description}>Звонок: {demoContact.name}. Экран-заготовка, камера и микрофон не включаются.</p>
      <nav className={styles.actions} aria-label="Переходы экрана">
        <ScreenLink className={styles.link} to={routes.chat}>Завершить → В чат</ScreenLink>
        <ScreenLink className={styles.link} to={routes.audioCall}>Перейти к аудиозвонку</ScreenLink>
      </nav>
    </section>
  )
}
