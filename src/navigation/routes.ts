export const routes = {
  chatList: '/chats',
  chat: '/chat',
  profile: '/profile',
  audioCall: '/audio-call',
  videoCall: '/video-call',
} as const

export type ScreenPath = (typeof routes)[keyof typeof routes]
export function readRoute(): ScreenPath {
  const path = window.location.hash.slice(1)
  return Object.values(routes).find((route) => route === path) ?? routes.chatList
}
