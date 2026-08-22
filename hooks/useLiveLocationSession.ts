import { useCallback, useEffect, useState } from 'react'
import { GPSLocation } from '@/types'

export interface LiveSharingSession {
  sessionId: string
  recipients: string[]
  recipientPhones?: string[]
  startTime: number
  expirationTime: number | null // null = until stopped
  durationMinutes: number
  isSharing: boolean
  lastUpdated: number
  location: GPSLocation | null
}

const LOCAL_STORAGE_KEY = 'sakhi_active_live_session'

export function useLiveLocationSession() {
  const [session, setSession] = useState<LiveSharingSession | null>(() => {
    if (typeof window === 'undefined') return null
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored) as LiveSharingSession
        if (parsed.expirationTime && Date.now() > parsed.expirationTime) {
          localStorage.removeItem(LOCAL_STORAGE_KEY)
          return null
        }
        return parsed
      }
    } catch (e) {
      console.warn('Failed to parse active live session from storage', e)
    }
    return null
  })

  const startSharing = useCallback(
    (
      recipients: string[],
      durationMinutes: number,
      currentLocation: GPSLocation | null,
      recipientPhones?: string[]
    ) => {
      const randomToken = Math.random().toString(36).substring(2, 9).toUpperCase()
      const sessionId = `SAKHI-LIVE-${randomToken}`
      const now = Date.now()
      const expirationTime = durationMinutes > 0 ? now + durationMinutes * 60 * 1000 : null

      const newSession: LiveSharingSession = {
        sessionId,
        recipients,
        recipientPhones,
        startTime: now,
        expirationTime,
        durationMinutes,
        isSharing: true,
        lastUpdated: now,
        location: currentLocation,
      }

      setSession(newSession)
      if (typeof window !== 'undefined') {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newSession))
      }
      return newSession
    },
    []
  )

  const stopSharing = useCallback(() => {
    setSession(null)
    if (typeof window !== 'undefined') {
      localStorage.removeItem(LOCAL_STORAGE_KEY)
    }
  }, [])

  const updateLocation = useCallback((location: GPSLocation) => {
    setSession((prev) => {
      if (!prev || !prev.isSharing) return prev

      if (prev.expirationTime && Date.now() > prev.expirationTime) {
        if (typeof window !== 'undefined') localStorage.removeItem(LOCAL_STORAGE_KEY)
        return null
      }

      const updated = {
        ...prev,
        location,
        lastUpdated: Date.now(),
      }

      if (typeof window !== 'undefined') {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated))
      }

      return updated
    })
  }, [])

  // Auto-expire check
  useEffect(() => {
    if (!session || !session.expirationTime) return

    const interval = setInterval(() => {
      if (Date.now() > session.expirationTime!) {
        stopSharing()
      }
    }, 4000)

    return () => clearInterval(interval)
  }, [session, stopSharing])

  return {
    session,
    startSharing,
    stopSharing,
    updateLocation,
  }
}
