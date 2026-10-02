import { useSyncExternalStore } from 'react'
import { readRoute, routes } from '../navigation/routes'
import { ChatListScreen } from '../screens/chat-list/ChatListScreen'
import { ChatScreen } from '../screens/chat/ChatScreen'
import { ProfileScreen } from '../screens/profile/ProfileScreen'
import { AudioCallScreen } from '../screens/audio-call/AudioCallScreen'
import { VideoCallScreen } from '../screens/video-call/VideoCallScreen'

function subscribe(onChange: () => void) {
  window.addEventListener('hashchange', onChange)
  return () => window.removeEventListener('hashchange', onChange)
}

export function PrototypeScreen() {
  const route = useSyncExternalStore(subscribe, readRoute)
  switch (route) {
    case routes.chat: return <ChatScreen />
    case routes.profile: return <ProfileScreen />
    case routes.audioCall: return <AudioCallScreen />
    case routes.videoCall: return <VideoCallScreen />
    default: return <ChatListScreen />
  }
}
