'use client'

import { useEffect, useRef, useState } from 'react'
import { LiveSharingSession } from '@/hooks/useLiveLocationSession'
import { getSupabaseClient, isSupabaseConfigured } from '@/lib/supabaseClient'

export function useRecipientLiveSync(token: string | null) {
  const [session, setSession] = useState<LiveSharingSession | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [isLiveConnected, setIsLiveConnected] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const eventSourceRef = useRef<EventSource | null>(null)

  useEffect(() => {
    if (!token) {
      setSession(null)
      setIsLoading(false)
      setIsLiveConnected(false)
      return
    }

    const cleanToken = token.trim()
    setIsLoading(true)
    setError(null)

    // 1. Check local storage first for zero-latency preview
    try {
      const stored = localStorage.getItem('sakhi_active_live_session')
      if (stored) {
        const parsed = JSON.parse(stored) as LiveSharingSession
        if (parsed.sessionId === cleanToken || cleanToken.includes(parsed.sessionId)) {
          setSession(parsed)
          setIsLoading(false)
        }
      }
    } catch (e) {
      console.warn('Local session read note:', e)
    }

    // 2. Initial fetch via REST API
    const fetchSession = async () => {
      try {
        const res = await fetch(`/api/session?token=${encodeURIComponent(cleanToken)}`)
        if (res.ok) {
          const json = await res.json()
          if (json.session) {
            setSession(json.session)
            setIsLoading(false)
          }
        } else if (res.status === 404) {
          setError('Live tracking session has ended or is invalid.')
          setIsLoading(false)
        }
      } catch (err) {
        console.warn('[Sync API Fetch Warning]', err)
      }
    }

    fetchSession()

    // 3. Connect to Supabase Realtime WebSocket Channel if configured
    let supabaseChannel: ReturnType<NonNullable<ReturnType<typeof getSupabaseClient>>['channel']> | null = null
    if (isSupabaseConfigured()) {
      const supabase = getSupabaseClient()
      if (supabase) {
        try {
          supabaseChannel = supabase
            .channel(`sakhi_session_${cleanToken}`)
            .on(
              'postgres_changes',
              {
                event: '*',
                schema: 'public',
                table: 'live_sessions',
                filter: `session_id=eq.${cleanToken}`,
              },
              (payload) => {
                const row = payload.new as Record<string, unknown>
                if (row && typeof row === 'object') {
                  const mapped: LiveSharingSession = {
                    sessionId: String(row.session_id || cleanToken),
                    userName: String(row.user_name || 'Riya Sharma'),
                    recipients: Array.isArray(row.recipients) ? (row.recipients as string[]) : [],
                    recipientPhones: Array.isArray(row.recipient_phones)
                      ? (row.recipient_phones as string[])
                      : [],
                    location: (row.location as LiveSharingSession['location']) ?? null,
                    riskMode: (row.risk_mode as LiveSharingSession['riskMode']) ?? 'normal',
                    batteryLevel: Number(row.battery_level) || 74,
                    emergencyTriggered: Boolean(row.emergency_triggered),
                    pathHistory: Array.isArray(row.path_history)
                      ? (row.path_history as LiveSharingSession['pathHistory'])
                      : [],
                    durationMinutes: Number(row.duration_minutes) || 30,
                    isSharing: Boolean(row.is_sharing),
                    startTime: Number(row.start_time) || Date.now(),
                    expirationTime: row.expiration_time ? Number(row.expiration_time) : null,
                    lastUpdated: Number(row.last_updated) || Date.now(),
                  }
                  setSession(mapped)
                  setIsLiveConnected(true)
                  setIsLoading(false)
                }
              }
            )
            .subscribe((status) => {
              if (status === 'SUBSCRIBED') {
                setIsLiveConnected(true)
                setIsLoading(false)
              }
            })
        } catch (e) {
          console.warn('[Supabase Realtime Subscription Error]', e)
        }
      }
    }

    // 4. Connect to real-time Server-Sent Events (SSE) stream as fast server bridge
    let sseActive = false
    try {
      if (typeof window !== 'undefined' && 'EventSource' in window) {
        const sse = new EventSource(`/api/session/stream?token=${encodeURIComponent(cleanToken)}`)
        eventSourceRef.current = sse

        sse.onopen = () => {
          setIsLiveConnected(true)
          setIsLoading(false)
          sseActive = true
        }

        sse.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data) as LiveSharingSession
            setSession(data)
            setIsLoading(false)
            if (!data.isSharing) {
              setIsLiveConnected(false)
            }
          } catch (e) {
            console.warn('[SSE Parse Error]', e)
          }
        }

        sse.onerror = () => {
          if (!supabaseChannel) {
            setIsLiveConnected(false)
          }
        }
      }
    } catch (err) {
      console.warn('[SSE Setup Warning]', err)
    }

    // 5. Polling fallback backup (every 3 seconds)
    const pollInterval = setInterval(() => {
      if (!sseActive && !supabaseChannel) {
        fetchSession()
      }
    }, 3000)

    return () => {
      clearInterval(pollInterval)
      if (eventSourceRef.current) {
        eventSourceRef.current.close()
        eventSourceRef.current = null
      }
      if (supabaseChannel) {
        const supabase = getSupabaseClient()
        if (supabase) supabase.removeChannel(supabaseChannel)
      }
    }
  }, [token])

  return {
    session,
    isLoading,
    isLiveConnected,
    error,
  }
}
