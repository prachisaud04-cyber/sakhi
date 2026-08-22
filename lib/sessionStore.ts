import { GPSLocation, RiskMode } from '@/types'

export interface LiveSharingSessionData {
  sessionId: string
  userName: string
  recipients: string[]
  recipientPhones?: string[]
  startTime: number
  expirationTime: number | null
  durationMinutes: number
  isSharing: boolean
  lastUpdated: number
  location: GPSLocation | null
  riskMode: RiskMode
  batteryLevel?: number
  emergencyTriggered?: boolean
  pathHistory: { lat: number; lng: number; timestamp: number }[]
}

// In-memory global store across API invocations in Node / Next.js
declare global {
  // eslint-disable-next-line no-var
  var __SAKHI_SESSIONS__: Map<string, LiveSharingSessionData> | undefined
  // eslint-disable-next-line no-var
  var __SAKHI_SSE_LISTENERS__: Map<string, Set<(data: LiveSharingSessionData) => void>> | undefined
}

const sessions: Map<string, LiveSharingSessionData> =
  globalThis.__SAKHI_SESSIONS__ ?? (globalThis.__SAKHI_SESSIONS__ = new Map())

const sseListeners: Map<string, Set<(data: LiveSharingSessionData) => void>> =
  globalThis.__SAKHI_SSE_LISTENERS__ ?? (globalThis.__SAKHI_SSE_LISTENERS__ = new Map())

/**
 * Clean up expired sessions
 */
function cleanupExpired() {
  const now = Date.now()
  for (const [id, s] of sessions.entries()) {
    if (s.expirationTime && now > s.expirationTime) {
      s.isSharing = false
      notifyListeners(id, s)
      sessions.delete(id)
    }
  }
}

/**
 * Notify all SSE clients connected for this session ID
 */
function notifyListeners(sessionId: string, data: LiveSharingSessionData) {
  const listeners = sseListeners.get(sessionId)
  if (listeners && listeners.size > 0) {
    listeners.forEach((callback) => {
      try {
        callback(data)
      } catch (err) {
        console.warn('[SSE Dispatch Error]', err)
      }
    })
  }
}

export function saveSession(data: Partial<LiveSharingSessionData> & { sessionId: string }): LiveSharingSessionData {
  cleanupExpired()

  const existing = sessions.get(data.sessionId)
  const now = Date.now()

  let pathHistory = existing?.pathHistory ?? []
  if (data.location) {
    // Add to breadcrumb trail if sufficiently different or first point
    const lastPoint = pathHistory[pathHistory.length - 1]
    if (
      !lastPoint ||
      Math.abs(lastPoint.lat - data.location.lat) > 0.0001 ||
      Math.abs(lastPoint.lng - data.location.lng) > 0.0001
    ) {
      pathHistory = [
        ...pathHistory.slice(-100), // Keep latest 100 breadcrumbs
        { lat: data.location.lat, lng: data.location.lng, timestamp: now },
      ]
    }
  }

  const updated: LiveSharingSessionData = {
    sessionId: data.sessionId,
    userName: data.userName ?? existing?.userName ?? 'Riya Sharma',
    recipients: data.recipients ?? existing?.recipients ?? [],
    recipientPhones: data.recipientPhones ?? existing?.recipientPhones ?? [],
    startTime: data.startTime ?? existing?.startTime ?? now,
    expirationTime:
      data.expirationTime !== undefined
        ? data.expirationTime
        : existing?.expirationTime ?? null,
    durationMinutes: data.durationMinutes ?? existing?.durationMinutes ?? 30,
    isSharing: data.isSharing !== undefined ? data.isSharing : existing?.isSharing ?? true,
    lastUpdated: now,
    location: data.location !== undefined ? data.location : existing?.location ?? null,
    riskMode: data.riskMode ?? existing?.riskMode ?? 'normal',
    batteryLevel: data.batteryLevel ?? existing?.batteryLevel ?? 74,
    emergencyTriggered: data.emergencyTriggered ?? existing?.emergencyTriggered ?? false,
    pathHistory,
  }

  sessions.set(data.sessionId, updated)
  notifyListeners(data.sessionId, updated)
  return updated
}

export function getSession(sessionId: string): LiveSharingSessionData | null {
  cleanupExpired()
  const s = sessions.get(sessionId)
  if (!s) return null
  if (s.expirationTime && Date.now() > s.expirationTime) {
    s.isSharing = false
    sessions.delete(sessionId)
    return null
  }
  return s
}

export function deleteSession(sessionId: string): boolean {
  const existing = sessions.get(sessionId)
  if (existing) {
    existing.isSharing = false
    existing.lastUpdated = Date.now()
    notifyListeners(sessionId, existing)
    sessions.delete(sessionId)
    return true
  }
  return false
}

export function subscribeToSession(
  sessionId: string,
  callback: (data: LiveSharingSessionData) => void
): () => void {
  if (!sseListeners.has(sessionId)) {
    sseListeners.set(sessionId, new Set())
  }
  const set = sseListeners.get(sessionId)!
  set.add(callback)

  return () => {
    set.delete(callback)
    if (set.size === 0) {
      sseListeners.delete(sessionId)
    }
  }
}
