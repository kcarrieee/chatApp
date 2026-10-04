import { usePeer } from '../../data/usePeer'
import { ScreenLink } from '../../navigation/ScreenLink'
import { routes } from '../../navigation/routes'
import { demoContact } from '../../data/demoContact'
import { contacts, initials } from '../chat-list/chats'
import styles from './ProfileScreen.module.css'

const assets = `${import.meta.env.BASE_URL}assets/profile/`

function Icon({ name }: { name: string }) {
  return <img src={`${assets}${name}.svg`} alt="" draggable={false} />
}

const publications = [
  { image: 'post-1', description: 'Татьяна рядом с металлической скульптурой', views: '344', likes: '78' },
  { image: 'post-2', description: 'Портрет с разноцветными наклейками', views: '44', likes: '8' },
  { image: 'post-3', description: 'Татьяна у жёлтого автомобиля', views: '344K', likes: '1.78K' },
  { image: 'post-4', description: 'Татьяна в солнечных очках', views: '344K', likes: '1.78K' },
]

export function ProfileScreen() {
  const peer = usePeer()
  const status = contacts.find(contact => contact.id === peer.id)?.status ?? demoContact.status
  const isDemoContact = peer.id === demoContact.id
  const screenRef = useRef<HTMLElement>(null)
  const headerRef = useRef<HTMLElement>(null)
  const nameRef = useRef<HTMLHeadingElement>(null)

  useLayoutEffect(() => {
    const screen = screenRef.current!
    const header = headerRef.current!
    const name = nameRef.current!
    const scroller = screen.closest<HTMLElement>('.phone-content')!
    const button = header.querySelector('a')!
    let travel = 0
    let frame = 0

    const update = () => {
      frame = 0
      const remaining = Math.max(0, travel - Math.max(0, scroller.scrollTop))
      const progress = travel > 0 ? 1 - remaining / travel : 0
      header.style.setProperty('--title-offset', `${remaining}px`)
      header.style.setProperty('--title-scale', `${1 - progress * (1 - 20 / 58.1232)}`)
      header.style.setProperty('--collapse', `${Math.min(1, progress * 2)}`)
    }
    const measure = () => {
      const titleBox = name.getBoundingClientRect()
      const buttonBox = button.getBoundingClientRect()
      travel = titleBox.top + titleBox.height / 2 + scroller.scrollTop
        - (buttonBox.top + buttonBox.height / 2)
      update()
    }
    const onScroll = () => { if (!frame) frame = requestAnimationFrame(update) }
    const observer = new ResizeObserver(measure)
    observer.observe(scroller)
    measure()
    scroller.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      observer.disconnect()
      scroller.removeEventListener('scroll', onScroll)
      cancelAnimationFrame(frame)
    }
  }, [])

  return (
    <section ref={screenRef} className={styles.screen} aria-label={`Профиль: ${peer.name}`}>
      <header ref={headerRef} className={styles.toolbar}>
        <span className={styles.headerName} aria-hidden="true">{peer.name}</span>
        <ScreenLink to={routes.chat} id={peer.id} className={styles.toolbarButton}>
          <Icon name="back" /><span className={styles.srOnly}>Назад в чат</span>
        </ScreenLink>
        <div className={styles.toolbarActions}>
          <button className={styles.toolbarButton} type="button" disabled aria-label="QR-код — пока недоступно"><Icon name="qr" /></button>
          <button className={styles.toolbarButton} type="button" disabled aria-label="Меню — пока недоступно"><Icon name="menu" /></button>
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
          <h1 ref={nameRef} className={styles.name}>{peer.name}</h1>
          <p className={styles.status}>{status}</p>
        </div>

        <nav className={styles.actions} aria-label="Действия с собеседником">
          <ScreenLink to={routes.chat} id={peer.id} className={styles.action}><Icon name="chat" /><span className={styles.srOnly}>Открыть чат</span></ScreenLink>
          <ScreenLink to={routes.audioCall} id={peer.id} className={styles.action}><Icon name="phone" /><span className={styles.srOnly}>Аудиозвонок</span></ScreenLink>
          <ScreenLink to={routes.videoCall} id={peer.id} className={styles.action}><Icon name="video" /><span className={styles.srOnly}>Видеозвонок</span></ScreenLink>
          <button className={styles.action} type="button" disabled aria-label="Отключить уведомления — пока недоступно"><Icon name="mute" /></button>
          <button className={styles.action} type="button" disabled aria-label="Ещё — пока недоступно"><Icon name="more" /></button>
        </nav>

        <dl className={styles.details}>
          <div><dt>Телефон</dt><dd className={styles.accent}>+7 928 989-11-22</dd></div>
          <div><dt>Имя пользователя</dt><dd className={styles.accent}>@alyo_artist</dd></div>
          <div><dt>День рождения</dt><dd>23 сентября</dd></div>
        </dl>

        <section className={styles.publications} aria-label="Публикации">
          <div className={styles.tabs} aria-label="Разделы профиля">
            <span className={styles.selected}>Публикации</span>
            <span>Медиа</span><span>Файлы</span><span>Ссылки</span>
          </div>
          <div className={styles.grid}>
            {publications.map((post) => (
              <article className={styles.post} key={post.image}>
                <img className={styles.postImage} src={`${assets}${post.image}.svg`} alt={post.description} loading="lazy" draggable={false} />
                <div className={styles.statistics}>
                  <span aria-label={`${post.views} просмотров`}><Icon name="eye" />{post.views}</span>
                  <span aria-label={`${post.likes} отметок нравится`}><Icon name="heart" />{post.likes}</span>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </section>
  )
}
import { useLayoutEffect, useRef } from 'react'
