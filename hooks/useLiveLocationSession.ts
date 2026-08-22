'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { GPSLocation, RiskMode } from '@/types'

export interface LiveSharingSession {
  sessionId: string
  userName: string
  recipients: string[]
  recipientPhones?: string[]
  startTime: number
  expirationTime: number | null // null = until stopped
  durationMinutes: number
  isSharing: boolean
  lastUpdated: number
  location: GPSLocation | null
  riskMode?: RiskMode
  batteryLevel?: number
  emergencyTriggered?: boolean
  pathHistory?: { lat: number; lng: number; timestamp: number }[]
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

  const lastSyncTimestampRef = useRef<number>(0)

  // Sync to Backend Server API
  const pushSessionToBackend = useCallback(async (sessionData: LiveSharingSession) => {
    try {
      await fetch('/api/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sessionData),
      })
    } catch (err) {
      console.warn('[Sync Backend Warning] Failed to push session to backend:', err)
    }
  }, [])

  const startSharing = useCallback(
    (
      recipients: string[],
      durationMinutes: number,
      currentLocation: GPSLocation | null,
      recipientPhones?: string[],
      riskMode: RiskMode = 'normal'
    ) => {
      const randomToken = Math.random().toString(36).substring(2, 9).toUpperCase()
      const sessionId = `SAKHI-LIVE-${randomToken}`
      const now = Date.now()
      const expirationTime = durationMinutes > 0 ? now + durationMinutes * 60 * 1000 : null

      const newSession: LiveSharingSession = {
        sessionId,
        userName: 'Riya Sharma',
        recipients,
        recipientPhones,
        startTime: now,
        expirationTime,
        durationMinutes,
        isSharing: true,
        lastUpdated: now,
        location: currentLocation,
        riskMode,
        batteryLevel: 74,
        emergencyTriggered: riskMode === 'critical',
        pathHistory: currentLocation
          ? [{ lat: currentLocation.lat, lng: currentLocation.lng, timestamp: now }]
          : [],
      }

      setSession(newSession)
      if (typeof window !== 'undefined') {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newSession))
      }

      // Push to backend API for multi-device synchronization
      pushSessionToBackend(newSession)

      return newSession
    },
    [pushSessionToBackend]
  )

  const stopSharing = useCallback(() => {
    if (session?.sessionId) {
      fetch(`/api/session?token=${session.sessionId}`, { method: 'DELETE' }).catch(() => {})
    }
    setSession(null)
    if (typeof window !== 'undefined') {
      localStorage.removeItem(LOCAL_STORAGE_KEY)
    }
  }, [session?.sessionId])

  const updateLocation = useCallback(
    (location: GPSLocation, riskMode?: RiskMode) => {
      setSession((prev) => {
        if (!prev || !prev.isSharing) return prev

        const now = Date.now()
        if (prev.expirationTime && now > prev.expirationTime) {
          if (typeof window !== 'undefined') localStorage.removeItem(LOCAL_STORAGE_KEY)
          return null
        }

        const updated: LiveSharingSession = {
          ...prev,
          location,
          riskMode: riskMode ?? prev.riskMode ?? 'normal',
          emergencyTriggered:
            riskMode === 'critical' ? true : prev.emergencyTriggered ?? false,
          lastUpdated: now,
          pathHistory: [
            ...(prev.pathHistory || []).slice(-100),
            { lat: location.lat, lng: location.lng, timestamp: now },
          ],
        }

        if (typeof window !== 'undefined') {
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated))
        }

        // Throttle backend push to at most once per 1.5 seconds
        if (now - lastSyncTimestampRef.current > 1500) {
          lastSyncTimestampRef.current = now
          pushSessionToBackend(updated)
        }

        return updated
      })
    },
    [pushSessionToBackend]
  )

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
