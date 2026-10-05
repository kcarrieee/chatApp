import { useLayoutEffect, useRef, type ReactNode } from 'react'

const assets = `${import.meta.env.BASE_URL}assets/iphone/`
/** Screens are designed for a 400px wide phone. */
const DESIGN_WIDTH = 400

export function PhoneFrame({ children }: { children: ReactNode }) {
  const phone = useRef<HTMLElement>(null)

  // Publishes --phone-scale (phone width / 400) so px-based screens can zoom with the phone
  // the way cqw-based ones already do, e.g. on short laptop screens.
  useLayoutEffect(() => {
    const element = phone.current
    if (!element) return
    const observer = new ResizeObserver(([entry]) => {
      element.style.setProperty('--phone-scale', String(entry.contentRect.width / DESIGN_WIDTH))
    })
    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  return (
    <section ref={phone} className="phone" aria-label="iPhone 17 Pro">
      <div className="phone-screen">
        <div className="status-bar" aria-hidden="true">
          <span className="status-time">9:41</span>
          <div className="status-levels">
            <img src={`${assets}cellular.svg`} alt="" />
            <img src={`${assets}wifi.svg`} alt="" />
            <img src={`${assets}battery.svg`} alt="" />
          </div>
        </div>
        <div className="phone-content">{children}</div>
        <div className="home-indicator" aria-hidden="true" />
      </div>
      <img className="phone-bezel" src={`${assets}iphone-17-pro-silver.png`}
        alt="" aria-hidden="true" draggable={false} />
    </section>
  )
}
