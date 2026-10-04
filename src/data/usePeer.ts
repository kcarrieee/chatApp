import { useSyncExternalStore } from 'react'
import { readRouteId } from '../navigation/routes'
import { chats, contacts } from '../screens/chat-list/chats'
import { demoContact } from './demoContact'

function subscribe(onChange: () => void) {
  window.addEventListener('hashchange', onChange)
  return () => window.removeEventListener('hashchange', onChange)
}

/** Keep the same contact throughout profile and call navigation. */
export function usePeer() {
  const id = useSyncExternalStore(subscribe, readRouteId) ?? demoContact.id
  return chats.find(contact => contact.id === id)
    ?? contacts.find(contact => contact.id === id)
    ?? demoContact
}
