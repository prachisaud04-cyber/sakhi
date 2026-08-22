'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { GPSLocation } from '@/types'
import { INITIAL_EMERGENCY_CONTACTS } from '@/constants/contacts'
import { triggerDeadZoneSmsBroadcast } from '@/lib/offlineSafetyEngine'

export interface UseCriticalBatteryAutoAlertProps {
  batteryLevel: number
  isCharging: boolean
  location: GPSLocation | null
  userName?: string
  thresholdPercent?: number // defaults to 5%
  onAlertTriggered?: (details: CriticalBatteryAlertDetails) => void
}

export interface CriticalBatteryAlertDetails {
  batteryLevel: number
  timestamp: number
  location: GPSLocation | null
  message: string
  recipients: string[]
  isSent: boolean
}

export function useCriticalBatteryAutoAlert({
  batteryLevel,
  isCharging,
  location,
  userName = 'Riya Sharma',
  thresholdPercent = 5,
  onAlertTriggered,
}: UseCriticalBatteryAutoAlertProps) {
  const [isAlertModalOpen, setIsAlertModalOpen] = useState<boolean>(false)
  const [alertDetails, setAlertDetails] = useState<CriticalBatteryAlertDetails | null>(null)
  const [hasAutoFiredRef] = useState<{ current: boolean }>({ current: false })

  const sendBatteryAlert = useCallback(
    async (simulatedLevel?: number) => {
      const currentLevel = typeof simulatedLevel === 'number' ? simulatedLevel : batteryLevel
      const locStr = location
        ? `${location.lat.toFixed(5)}, ${location.lng.toFixed(5)}`
        : '26.15200, 91.66400 (Gauhati University Area)'

      const mapLink = location
        ? `https://maps.google.com/?q=${location.lat},${location.lng}`
        : 'https://maps.google.com/?q=26.1520,91.6640'

      const message = `⚠️ SAKHI CRITICAL BATTERY ALERT: ${userName}'s phone battery has dropped to ${currentLevel}% (device shutdown imminent). Last known GPS: ${locStr}. Live Location: ${mapLink}. Please check on her if phone becomes unreachable.`

      const details: CriticalBatteryAlertDetails = {
        batteryLevel: currentLevel,
        timestamp: Date.now(),
        location,
        message,
        recipients: INITIAL_EMERGENCY_CONTACTS.map((c) => c.phone),
        isSent: true,
      }

      setAlertDetails(details)
      setIsAlertModalOpen(true)

      // 1. Send via Backend Dispatch API
      try {
        await fetch('/api/dispatch', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            recipients: INITIAL_EMERGENCY_CONTACTS.map((c) => c.normalizedPhone),
            message,
            triggerType: 'CRITICAL_BATTERY_SHUTDOWN',
            batteryLevel: currentLevel,
            location,
          }),
        })
      } catch (err) {
        console.warn('[Critical Battery Dispatch Notice]', err)
      }

      // 2. Also log report to Supabase
      try {
        await fetch('/api/reports', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            incidentType: 'CRITICAL_BATTERY_SHUTDOWN',
            description: `Auto-alert sent: Phone battery reached ${currentLevel}%`,
            safetyScore: 30,
            location,
          }),
        })
      } catch (err) {
        console.warn('[Critical Battery Report Notice]', err)
      }

      if (onAlertTriggered) {
        onAlertTriggered(details)
      }
    },
    [batteryLevel, location, userName, onAlertTriggered]
  )

  // Auto-trigger when battery level drops to or below threshold (e.g. 5% or 0%) and not charging
  useEffect(() => {
    if (batteryLevel <= thresholdPercent && !isCharging && !hasAutoFiredRef.current) {
      hasAutoFiredRef.current = true
      sendBatteryAlert()
    } else if (batteryLevel > thresholdPercent || isCharging) {
      // Reset trigger if device gets charged
      hasAutoFiredRef.current = false
    }
  }, [batteryLevel, isCharging, thresholdPercent, sendBatteryAlert])

  const triggerManualTest0Percent = useCallback(() => {
    sendBatteryAlert(0)
  }, [sendBatteryAlert])

  const broadcastSmsNow = useCallback(() => {
    if (alertDetails) {
      triggerDeadZoneSmsBroadcast(alertDetails.message)
    }
  }, [alertDetails])

  return {
    isAlertModalOpen,
    closeAlertModal: () => setIsAlertModalOpen(false),
    alertDetails,
    sendBatteryAlert,
    triggerManualTest0Percent,
    broadcastSmsNow,
    isCriticalLevel: batteryLevel <= thresholdPercent && !isCharging,
  }
}
