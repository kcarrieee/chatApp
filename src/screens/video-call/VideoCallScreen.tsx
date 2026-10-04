import { usePeer } from '../../data/usePeer'
import { demoContact } from '../../data/demoContact'
import { profileOf } from '../../data/profiles'
import { initials } from '../chat-list/chats'
import { useEffect, useRef, useState } from 'react'
import { ScreenLink } from '../../navigation/ScreenLink'
import { routes } from '../../navigation/routes'
import { useCamera } from './useCamera'
import styles from './VideoCallScreen.module.css'

const assets = `${import.meta.env.BASE_URL}assets/video-call/`
const callAssets = `${import.meta.env.BASE_URL}assets/audio-call/`
const effects = [
  { image: 'pink', label: 'Розовый' },
  { image: 'flowers', label: 'Цветы' },
  { image: 'bubbles', label: 'Мыльный пузырь' },
  { image: 'butterflies', label: 'Бабочки' },
  { image: 'stars', label: 'Звёзды' },
]
function Icon({ name }: { name: string }) {
  return <img src={`${callAssets}${name}.svg`} alt="" draggable={false} />
}

export function VideoCallScreen() {
  const peer = usePeer()
  const [cameraOn, setCameraOn] = useState(true)
  const [facing, setFacing] = useState<'user' | 'environment'>('user')
  const [attempt, setAttempt] = useState(0)
  const camera = useCamera(cameraOn, facing, attempt)
  const [muted, setMuted] = useState(false)
  const [speaker, setSpeaker] = useState(false)
  const [effectsOpen, setEffectsOpen] = useState(false)
  const [effect, setEffect] = useState(2)
  const [seconds, setSeconds] = useState(0)
  const [connected, setConnected] = useState(false)
  const carousel = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const start = Date.now() + 3000
    const timer = window.setInterval(() => {
      if (Date.now() >= start) { setConnected(true); setSeconds(Math.floor((Date.now() - start) / 1000)) }
    }, 1000)
    return () => window.clearInterval(timer)
  }, [])
  useEffect(() => {
    if (effectsOpen && carousel.current) {
      const item = carousel.current.children[effect] as HTMLElement
      carousel.current.scrollLeft = item.offsetLeft - (carousel.current.clientWidth - item.clientWidth) / 2
    }
    // Only center when opening. Scrolling itself updates the selection.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [effectsOpen])
  const duration = `${Math.floor(seconds / 60).toString().padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`
  const remote = !effectsOpen ? 'remote' : effect === 2 ? 'bubble-portrait' : effects[effect].image
  // The Figma video belongs to the demo contact; others show their own photo or a camera-off state.
  const isDemoContact = peer.id === demoContact.id
  const photo = isDemoContact ? `${assets}${remote}.webp` : profileOf(peer.id).photo

  return (
    <section className={styles.screen} data-effects={effectsOpen} aria-label={`Видеозвонок: ${peer.name}`}>
      {photo
        ? <img className={styles.remote} src={photo} alt={`Видео: ${peer.name}`} draggable={false} />
        : (
          <div className={styles.peerCameraOff} role="img" aria-label={`${peer.name}: камера выключена`}
            style={{ background: 'color' in peer ? peer.color : undefined }}>
            {peer.avatar && <img className={styles.peerBlur} src={peer.avatar} alt="" />}
            <span className={styles.peerAvatar}>
              {peer.avatar ? <img src={peer.avatar} alt="" /> : initials(peer.name)}
            </span>
            <span className={styles.peerCameraText}>Камера выключена</span>
          </div>
        )}
      {isDemoContact && effectsOpen && effect === 2 && <div className={styles.bubble} aria-hidden="true">
        <img className={styles.bubbleGlow} src={`${assets}bubble-glow.webp`} alt="" />
        <img src={`${assets}bubble.webp`} alt="" />
      </div>}
      <header className={styles.toolbar}>
        <ScreenLink to={routes.profile} id={peer.id} className={styles.toolbarButton}><Icon name="minimize" /><span className={styles.srOnly}>Вернуться в профиль</span></ScreenLink>
        <div className={styles.identity}><h1>{peer.name}</h1><p>{connected ? duration : 'Звоним…'}</p></div>
        <button className={styles.toolbarButton} type="button" aria-label="Переключить камеру" disabled={!cameraOn} onClick={() => setFacing(facing === 'user' ? 'environment' : 'user')}><Icon name="switch" /></button>
      </header>
      <button className={styles.effectsToggle} type="button" aria-label="Эффекты" aria-expanded={effectsOpen} aria-controls="call-effects" onClick={() => setEffectsOpen(!effectsOpen)}><img src={`${assets}effects.svg`} alt="" /></button>
      <div className={styles.selfView} aria-label="Ваша камера">
        <video ref={camera.videoRef} autoPlay muted playsInline data-mirrored={facing === 'user'} hidden={!cameraOn || camera.status !== 'ready'} />
        {(!cameraOn || camera.status !== 'ready') && <div className={styles.cameraState} role="status">
          <Icon name="video-off" />
          <span>{!cameraOn ? 'Камера выключена' : camera.status === 'loading' ? 'Доступ к камере…' : camera.error}</span>
          {cameraOn && camera.status === 'error' && <button type="button" onClick={() => setAttempt(attempt + 1)}>Повторить</button>}
        </div>}
      </div>
      {effectsOpen && <div className={styles.carousel} id="call-effects" ref={carousel} aria-label="Эффекты звонка" onScroll={event => {
        const container = event.currentTarget
        const center = container.scrollLeft + container.clientWidth / 2
        const distances = Array.from(container.children, child => Math.abs((child as HTMLElement).offsetLeft + child.clientWidth / 2 - center))
        setEffect(distances.indexOf(Math.min(...distances)))
      }}>
        {effects.map((item, index) => <button key={item.image} type="button" className={styles.effect} aria-label={item.label} aria-pressed={effect === index} onClick={event => {
          const container = carousel.current
          if (container) container.scrollTo({ left: event.currentTarget.offsetLeft - (container.clientWidth - event.currentTarget.clientWidth) / 2, behavior: 'smooth' })
        }}><img src={`${assets}${item.image}.webp`} alt="" draggable={false} /></button>)}
      </div>}
      <nav className={styles.controls} aria-label="Управление видеозвонком">
        <button type="button" className={styles.control} aria-label="Громкая связь" aria-pressed={speaker} onClick={() => setSpeaker(!speaker)}><Icon name="audio-output" /></button>
        <button type="button" className={styles.control} aria-label={cameraOn ? 'Выключить камеру' : 'Включить камеру'} aria-pressed={!cameraOn} onClick={() => setCameraOn(!cameraOn)}><Icon name="video-off" /></button>
        <button type="button" className={`${styles.control} ${styles.microphone}`} aria-label="Выключить микрофон" aria-pressed={muted} onClick={() => setMuted(!muted)}><Icon name="microphone" />{muted && <span className={styles.mutedSlash} aria-hidden="true" />}</button>
        <ScreenLink to={routes.profile} id={peer.id} className={`${styles.control} ${styles.endCall}`}><Icon name="end-call" /><span className={styles.srOnly}>Завершить звонок</span></ScreenLink>
      </nav>
    </section>
  )
}
