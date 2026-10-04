// App theme: light, dark or follow the system. Applied as <html data-theme="light|dark">,
// screens read their colors from CSS variables. Call screens keep their own fixed look.
import { useSyncExternalStore } from 'react'
import './theme.css'

export type ThemeChoice = 'light' | 'dark' | 'system'

const KEY = 'chat-theme'
const EVENT = 'chat-theme-change'
const systemDark = window.matchMedia('(prefers-color-scheme: dark)')

function read(): ThemeChoice {
  try {
    const saved = localStorage.getItem(KEY)
    return saved === 'light' || saved === 'dark' ? saved : 'system'
  } catch {
    return 'system'
  }
}

function apply() {
  const choice = read()
  const dark = choice === 'dark' || (choice === 'system' && systemDark.matches)
  document.documentElement.dataset.theme = dark ? 'dark' : 'light'
}

export function setTheme(choice: ThemeChoice) {
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

apply()
systemDark.addEventListener('change', apply)
