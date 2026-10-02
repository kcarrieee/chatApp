import { ScreenLink } from '../../navigation/ScreenLink'
import { routes } from '../../navigation/routes'
import { demoContact } from '../../data/demoContact'
import styles from './AudioCallScreen.module.css'

export function AudioCallScreen() {
  return (
    <section className={styles.screen} aria-label="Аудиозвонок">
      <p className={styles.eyebrow}>Chat Concept · Заготовка</p>
      <h1 className={styles.title}>Аудиозвонок</h1>
      <p className={styles.description}>Звонок: {demoContact.name}. Экран-заготовка, соединение не устанавливается.</p>
      <nav className={styles.actions} aria-label="Переходы экрана">
        <ScreenLink className={styles.link} to={routes.chat}>Завершить → В чат</ScreenLink>
        <ScreenLink className={styles.link} to={routes.videoCall}>Перейти к видеозвонку</ScreenLink>
      </nav>
    </section>
  )
}
