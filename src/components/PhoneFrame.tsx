import type { ReactNode } from 'react'

const assets = `${import.meta.env.BASE_URL}assets/iphone/`

export function PhoneFrame({ children }: { children: ReactNode }) {
  return (
    <section className="phone" aria-label="iPhone 17 Pro">
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
