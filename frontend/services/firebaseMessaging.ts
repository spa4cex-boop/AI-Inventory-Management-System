import { getMessaging, getToken, isSupported, onMessage } from 'firebase/messaging'
import { firebaseApp } from '../firebase/firebaseClient'

async function getFirebaseMessaging() {
  if (typeof window === 'undefined') {
    return null
  }
  if (!(await isSupported())) {
    return null
  }
  if (!firebaseApp) {
    return null
  }
  return getMessaging(firebaseApp)
}

export async function requestPushToken() {
  const messaging = await getFirebaseMessaging()
  if (!messaging || typeof Notification === 'undefined') {
    return null
  }

  const permission = await Notification.requestPermission()
  if (permission !== 'granted') {
    return null
  }

  return getToken(messaging, {
    vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY || '',
  })
}

export async function subscribeToMessages(callback: (payload: any) => void) {
  const messaging = await getFirebaseMessaging()
  if (!messaging) {
    return () => undefined
  }

  return onMessage(messaging, callback)
}
