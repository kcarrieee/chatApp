import { ScreenLink } from '../../navigation/ScreenLink'
import { routes } from '../../navigation/routes'
import { demoContact } from '../../data/demoContact'
import styles from './ProfileScreen.module.css'

export function ProfileScreen() {
  return (
    <section className={styles.screen} aria-label="Профиль">
      <p className={styles.eyebrow}>Chat Concept · Заготовка</p>
      <h1 className={styles.title}>Профиль</h1>
      <p className={styles.description}>{demoContact.name} · {demoContact.status}</p>
      <nav className={styles.actions} aria-label="Переходы экрана">
        <ScreenLink className={styles.link} to={routes.chat}>← Перейти в чат</ScreenLink>
        <ScreenLink className={styles.link} to={routes.audioCall}>Аудиозвонок</ScreenLink>
        <ScreenLink className={styles.link} to={routes.videoCall}>Видеозвонок</ScreenLink>
      </nav>
    </section>
  )
}
