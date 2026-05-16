import {
  type Auth,
  GoogleAuthProvider,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  createUserWithEmailAndPassword,
  signOut,
} from 'firebase/auth'
import { firebaseAuth } from './firebaseClient'

const auth = firebaseAuth as Auth | null
const googleProvider = new GoogleAuthProvider()

function getAuthClientInternal(): Auth {
  if (!auth) {
    throw new Error('Firebase Auth is not configured')
  }
  return auth
}

export async function loginWithEmail(email: string, password: string) {
  return signInWithEmailAndPassword(getAuthClientInternal(), email, password)
}

export async function registerWithEmail(email: string, password: string) {
  return createUserWithEmailAndPassword(getAuthClientInternal(), email, password)
}

export async function loginWithGoogle() {
  return signInWithPopup(getAuthClientInternal(), googleProvider)
}

export async function logout() {
  return signOut(getAuthClientInternal())
}

export async function resetPassword(email: string) {
  return sendPasswordResetEmail(getAuthClientInternal(), email)
}

export function getAuthClient() {
  return getAuthClientInternal()
}
