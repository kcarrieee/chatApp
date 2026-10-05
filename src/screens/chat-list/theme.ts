// App theme: light, dark or follow the system. Applied as <html data-theme="light|dark">,
// Screens use CSS variables or useResolvedTheme for theme-specific assets.
import { useSyncExternalStore } from 'react'
import './theme.css'

export type ThemeChoice = 'light' | 'dark' | 'system'

const KEY = 'chat-theme'
const EVENT = 'chat-theme-change'
const systemDark = window.matchMedia('(prefers-color-scheme: dark)')

let sessionChoice: ThemeChoice | undefined

function read(): ThemeChoice {
  if (sessionChoice !== undefined) return sessionChoice
  try {
    const saved = localStorage.getItem(KEY)
    return saved === 'light' || saved === 'dark' || saved === 'system' ? saved : 'dark'
  } catch {
    return 'dark'
  }
}

function apply() {
  const choice = read()
  const dark = choice === 'dark' || (choice === 'system' && systemDark.matches)
  document.documentElement.dataset.theme = dark ? 'dark' : 'light'
}

export function setTheme(choice: ThemeChoice) {
  sessionChoice = choice
  try {
    localStorage.setItem(KEY, choice)
  } catch {
    // Storage blocked: the choice still applies until reload.
  }
  apply()
  window.dispatchEvent(new Event(EVENT))
}

function subscribe(onChange: () => void) {
  window.addEventListener(EVENT, onChange)
  return () => window.removeEventListener(EVENT, onChange)
}

export function useThemeChoice() {
  return useSyncExternalStore(subscribe, read)
}

export function useResolvedTheme(): 'light' | 'dark' {
  return useSyncExternalStore(subscribe, () => {
    const choice = read()
    return choice === 'dark' || (choice === 'system' && systemDark.matches) ? 'dark' : 'light'
  })
}

function refresh() {
  apply()
  window.dispatchEvent(new Event(EVENT))
}
apply()
systemDark.addEventListener('change', refresh)
window.addEventListener('storage', event => {
  if (event.key === KEY || event.key === null) {
    sessionChoice = undefined
    refresh()
  }
})
