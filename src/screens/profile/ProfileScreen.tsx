import { usePeer } from '../../data/usePeer'
import { ScreenLink } from '../../navigation/ScreenLink'
import { routes } from '../../navigation/routes'
import { demoContact } from '../../data/demoContact'
import { initials } from '../chat-list/chats'
import { profileOf } from '../../data/profiles'
import { StubSheet } from '../chat-list/StubSheet'
import { showStub } from '../chat-list/stub'
import styles from './ProfileScreen.module.css'

const assets = `${import.meta.env.BASE_URL}assets/profile/`

function Icon({ name }: { name: string }) {
  return <img src={`${assets}${name}.svg`} alt="" draggable={false} />
}

const NAME_SIZE = 58.1232

const demoDetails = [
  { label: 'Телефон', value: '+7 928 989-11-22', accent: true },
  { label: 'Имя пользователя', value: '@alyo_artist', accent: true },
  { label: 'День рождения', value: '23 сентября' },
]

const publications = [
  { image: 'post-1', description: 'Татьяна рядом с металлической скульптурой', views: '344', likes: '78' },
  { image: 'post-2', description: 'Портрет с разноцветными наклейками', views: '44', likes: '8' },
  { image: 'post-3', description: 'Татьяна у жёлтого автомобиля', views: '344K', likes: '1.78K' },
  { image: 'post-4', description: 'Татьяна в солнечных очках', views: '344K', likes: '1.78K' },
]

export function ProfileScreen() {
  const peer = usePeer()
  const isDemoContact = peer.id === demoContact.id
  const profile = profileOf(peer.id)
  const status = isDemoContact ? demoContact.status : profile.status
  const details = isDemoContact ? demoDetails : profile.details
  const posts = isDemoContact ? publications.map((post) => ({ ...post, image: `${assets}${post.image}.svg` })) : profile.posts
  // Long names (groups, channels) shrink to stay on one line under the avatar.
  const nameSize = Math.min(NAME_SIZE, 300 / (0.6 * peer.name.length))
  const screenRef = useRef<HTMLElement>(null)
  const headerRef = useRef<HTMLElement>(null)
  useLayoutEffect(() => {
    const scroller = screenRef.current!.closest<HTMLElement>('.phone-content')!
    const header = headerRef.current!
    const update = () => header.style.setProperty('--collapse', String(Math.min(1, scroller.scrollTop / 40)))
    update()
    scroller.addEventListener('scroll', update, { passive: true })
    return () => scroller.removeEventListener('scroll', update)
  }, [])

  return (
    <section ref={screenRef} className={styles.screen} aria-label={`Профиль: ${peer.name}`}
      style={{ '--name-size': nameSize } as CSSProperties}>
      <header ref={headerRef} className={styles.toolbar}>
        <ScreenLink to={routes.chat} id={peer.id} className={styles.toolbarButton}>
          <Icon name="back" /><span className={styles.srOnly}>Назад в чат</span>
        </ScreenLink>
        <div className={styles.toolbarActions}>
          <button className={styles.toolbarButton} type="button" aria-label="QR-код" onClick={() => showStub()}><Icon name="qr" /></button>
          <button className={styles.toolbarButton} type="button" aria-label="Меню" onClick={() => showStub()}><Icon name="menu" /></button>
        </div>
      </header>

      <div className={styles.content}>
        <div className={styles.identity}>
          <div className={styles.portrait}>
            {isDemoContact
              ? <img src={demoContact.portrait} alt={peer.name} draggable={false} />
              : <div className={styles.peerAvatar} style={{ background: 'color' in peer ? peer.color : undefined }}>
                {peer.avatar ? <img src={peer.avatar} alt={peer.name} draggable={false} /> : <span>{initials(peer.name)}</span>}
              </div>}
          </div>
          <h1 className={styles.name}>{peer.name}</h1>
          <p className={styles.status}>{status}</p>
        </div>

        <nav className={styles.actions} aria-label="Действия с собеседником">
          <ScreenLink to={routes.chat} id={peer.id} className={styles.action}><Icon name="chat" /><span className={styles.srOnly}>Открыть чат</span></ScreenLink>
          <ScreenLink to={routes.audioCall} id={peer.id} className={styles.action}><Icon name="phone" /><span className={styles.srOnly}>Аудиозвонок</span></ScreenLink>
          <ScreenLink to={routes.videoCall} id={peer.id} className={styles.action}><Icon name="video" /><span className={styles.srOnly}>Видеозвонок</span></ScreenLink>
          <button className={styles.action} type="button" aria-label="Отключить уведомления" onClick={() => showStub()}><Icon name="mute" /></button>
          <button className={styles.action} type="button" aria-label="Ещё" onClick={() => showStub()}><Icon name="more" /></button>
        </nav>

        <dl className={styles.details}>
          {details.map((detail) => (
            <div key={detail.label}><dt>{detail.label}</dt><dd className={detail.accent ? styles.accent : undefined}>{detail.value}</dd></div>
          ))}
        </dl>

        <section className={styles.publications} aria-label="Публикации">
          <div className={styles.tabs} aria-label="Разделы профиля">
            <span className={styles.selected}>Публикации</span>
            <span>Медиа</span><span>Файлы</span><span>Ссылки</span>
          </div>
          {posts.length === 0 && <p className={styles.emptyPosts}>Публикаций пока нет</p>}
          <div className={styles.grid}>
            {posts.map((post) => (
              <article className={styles.post} key={post.image}>
                <img className={styles.postImage} src={post.image} alt={post.description} loading="lazy" draggable={false} />
                <div className={styles.statistics}>
                  <span aria-label={`${post.views} просмотров`}><Icon name="eye" />{post.views}</span>
                  <span aria-label={`${post.likes} отметок нравится`}><Icon name="heart" />{post.likes}</span>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
      <StubSheet />
    </section>
  )
}
import { useLayoutEffect, useRef, type CSSProperties } from 'react'
