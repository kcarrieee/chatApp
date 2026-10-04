import { initials } from '../chat-list/chats'
import { usePeer } from '../../data/usePeer'
import { useState } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { ScreenLink } from '../../navigation/ScreenLink'
import { routes } from '../../navigation/routes'
import { useCallSeconds, useCallSession } from './callSession'
import { StubSheet } from '../chat-list/StubSheet'
import { showStub } from '../chat-list/stub'
import { TextMorph } from 'torph/react'
import styles from './AudioCallScreen.module.css'

const assets = `${import.meta.env.BASE_URL}assets/audio-call/`
export type CallTheme = 'light' | 'dark'

function Icon({ name }: { name: string }) {
  return <img src={`${assets}${name}.svg`} alt="" draggable={false} />
}

/** Local call simulation. The theme prop is ready for the future app-wide setting. */
export function AudioCallScreen({ theme = 'dark' }: { theme?: CallTheme }) {
  const peer = usePeer()
  const reducedMotion = useReducedMotion()
  const connectedAt = useCallSession(peer.id)
  const seconds = useCallSeconds(connectedAt)
  const [muted, setMuted] = useState(false)
  const [speaker, setSpeaker] = useState(false)

  const connected = connectedAt !== null
  const duration = `${Math.floor(seconds / 60).toString().padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`

  return (
    <section className={styles.screen} data-call-theme={theme} data-connected={connected} aria-label={`Аудиозвонок: ${peer.name}`}>
      <img className={styles.glow} src={`${assets}glow.svg`} alt="" aria-hidden="true" />
      <header className={styles.toolbar}>
        <ScreenLink to={routes.profile} id={peer.id} className={styles.toolbarButton}>
          <Icon name="minimize" /><span className={styles.srOnly}>Вернуться в профиль</span>
        </ScreenLink>
        <button type="button" className={styles.toolbarButton} aria-label="Сменить камеру" onClick={() => showStub('Камера включается в видеозвонке')}><Icon name="switch" /></button>
      </header>

      <div className={styles.portrait}>
        {connected && <motion.div className={styles.rings} aria-hidden="true"
          initial={reducedMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }} transition={{ duration: 0.8 }}>
          <motion.div className={styles.ringLayer}
            animate={reducedMotion ? { rotate: 0, scale: 1 } : { rotate: [0, 360], scale: [0.94, 1.06, 0.98, 1.03, 0.94] }}
            transition={{ rotate: { duration: 24, repeat: Infinity, ease: 'linear' }, scale: { duration: 4.8, repeat: Infinity, ease: 'easeInOut' } }}>
            <img className={styles.outerRing} src={`${assets}${theme === 'dark' ? 'bg' : 'bg-2'}.svg`} alt="" draggable={false} />
          </motion.div>
          <motion.div className={styles.ringLayer}
            animate={reducedMotion ? { rotate: 0, scale: 1 } : { rotate: [0, -360], scale: [1.02, 0.96, 1.07, 1.02] }}
            transition={{ rotate: { duration: 18, repeat: Infinity, ease: 'linear' }, scale: { duration: 3.6, repeat: Infinity, ease: 'easeInOut' } }}>
            <img className={styles.innerRing} src={`${assets}bg-1.svg`} alt="" draggable={false} />
          </motion.div>
        </motion.div>}
        <div className={styles.avatar}>
          {peer.avatar ? <img src={peer.avatar} alt={peer.name} draggable={false} />
            : <span className={styles.initials} style={{ background: 'color' in peer ? peer.color : undefined }}>{initials(peer.name)}</span>}
        </div>
      </div>
      <div className={styles.identity}>
        <h1>{peer.name}</h1>
        <p aria-live={connected ? 'off' : 'polite'}><TextMorph as="span">{connected ? duration : 'Звоним…'}</TextMorph></p>
      </div>

      <nav className={styles.controls} aria-label="Управление аудиозвонком">
        <button type="button" className={styles.control} aria-label="Громкая связь" aria-pressed={speaker} onClick={() => setSpeaker(!speaker)}><Icon name="audio-output" /></button>
        <ScreenLink to={routes.videoCall} id={peer.id} className={styles.control}><Icon name="video-off" /><span className={styles.srOnly}>Перейти к видеозвонку</span></ScreenLink>
        <button type="button" className={`${styles.control} ${styles.microphone}`} aria-label="Выключить микрофон" aria-pressed={muted} onClick={() => setMuted(!muted)}>
          <Icon name={theme === 'light' ? 'microphone-light' : 'microphone'} />
          {muted && <span className={styles.mutedSlash} aria-hidden="true" />}
        </button>
        <ScreenLink to={routes.profile} id={peer.id} className={`${styles.control} ${styles.endCall}`}><Icon name="end-call" /><span className={styles.srOnly}>Завершить звонок</span></ScreenLink>
      </nav>
      <StubSheet />
    </section>
  )
}
