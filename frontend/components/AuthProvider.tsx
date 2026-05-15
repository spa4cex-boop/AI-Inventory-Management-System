"use client"

import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { firebaseAuth } from '../firebase/firebaseClient'
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  type User,
} from 'firebase/auth'

interface AuthContextValue {
  user: User | null
  loading: boolean
  error: string | null
  signInWithEmail: (email: string, password: string) => Promise<void>
  signRegisterWithEmail: (email: string, password: string) => Promise<void>
  signInWithGoogle: () => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function useAuthContext() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuthContext must be used within AuthProvider')
  }
  return context
}

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!firebaseAuth) {
      setLoading(false)
      setError('Firebase is not initialized')
      return
    }

    const unsubscribe = onAuthStateChanged(firebaseAuth, (nextUser) => {
      setUser(nextUser)
      setLoading(false)
      setError(null)
    })

    return () => unsubscribe()
  }, [])

  const signInWithEmail = async (email: string, password: string) => {
    if (!firebaseAuth) throw new Error('Firebase Auth is not configured')
    setLoading(true)
    try {
      await signInWithEmailAndPassword(firebaseAuth, email, password)
      setError(null)
    } catch (err) {
      setError('Unable to sign in with email and password')
      throw err
    } finally {
      setLoading(false)
    }
  }

  const signRegisterWithEmail = async (email: string, password: string) => {
    if (!firebaseAuth) throw new Error('Firebase Auth is not configured')
    setLoading(true)
    try {
      await createUserWithEmailAndPassword(firebaseAuth, email, password)
      setError(null)
    } catch (err) {
      setError('Unable to register with email and password')
      throw err
    } finally {
      setLoading(false)
    }
  }

  const signInWithGoogle = async () => {
    if (!firebaseAuth) throw new Error('Firebase Auth is not configured')
    setLoading(true)
    try {
      const provider = new GoogleAuthProvider()
      await signInWithPopup(firebaseAuth, provider)
      setError(null)
    } catch (err) {
      setError('Unable to sign in with Google')
      throw err
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    if (!firebaseAuth) return
    setLoading(true)
    try {
      await signOut(firebaseAuth)
      setError(null)
    } finally {
      setLoading(false)
    }
  }

  const value = useMemo(
    () => ({
      user,
      loading,
      error,
      signInWithEmail,
      signRegisterWithEmail,
      signInWithGoogle,
      logout,
    }),
    [user, loading, error]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
