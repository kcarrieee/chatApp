export const routes = {
  chatList: '/chats',
  chat: '/chat',
  profile: '/profile',
  audioCall: '/audio-call',
  videoCall: '/video-call',
} as const

export type ScreenPath = (typeof routes)[keyof typeof routes]
export function readRoute(): ScreenPath {
  const path = window.location.hash.slice(1).split('?')[0]
  return Object.values(routes).find((route) => route === path) ?? routes.chatList
}

/** Optional id after the route, e.g. `#/chat?id=alisa` opens the chat with Alisa. */
export function readRouteId(): string | undefined {
  const query = window.location.hash.split('?')[1]
  return new URLSearchParams(query).get('id') ?? undefined
}
