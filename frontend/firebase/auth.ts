import { type Auth, GoogleAuthProvider, signInWithEmailAndPassword, signInWithPopup, createUserWithEmailAndPassword, signOut } from 'firebase/auth'
import { firebaseAuth } from './firebaseClient'

const auth = firebaseAuth as Auth
const googleProvider = new GoogleAuthProvider()

if (!auth) {
  throw new Error('Firebase Auth is not configured')
}

export async function loginWithEmail(email: string, password: string) {
  return signInWithEmailAndPassword(auth, email, password)
}

export async function registerWithEmail(email: string, password: string) {
  return createUserWithEmailAndPassword(auth, email, password)
}

export async function loginWithGoogle() {
  return signInWithPopup(auth, googleProvider)
}

export async function logout() {
  return signOut(auth)
}

export function getAuthClient() {
  return auth
}
