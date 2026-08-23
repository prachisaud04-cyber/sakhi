'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { GPSLocation } from '@/types'
import { EmergencyContact, INITIAL_EMERGENCY_CONTACTS } from '@/constants/contacts'
import { triggerDeadZoneSmsBroadcast } from '@/lib/offlineSafetyEngine'

export interface VitalsSnapshot {
  heartRate: number | null
  bloodPressureSystolic: number | null
  bloodPressureDiastolic: number | null
  gForce: number
  batteryLevel: number
  triggerReason: string
}

export interface UseSafetyCheckAutoEscalationProps {
  location: GPSLocation | null
  vitals?: {
    heartRate: number | null
    bloodPressureSystolic: number | null
    bloodPressureDiastolic: number | null
    accelerationG: number
    batteryLevel: number
  }
  userName?: string
  contacts?: EmergencyContact[]
  isJourneyActive?: boolean
  initialDurationSeconds?: number // Default: 600 seconds (10 minutes)
  onEscalateToEmergency?: (reason: string, vitals: VitalsSnapshot) => void
  onSafeConfirmed?: () => void
}

export function useSafetyCheckAutoEscalation({
  location,
  vitals,
  userName = 'Riya Sharma',
  contacts = INITIAL_EMERGENCY_CONTACTS,
  isJourneyActive = true,
  initialDurationSeconds = 600, // 10 minutes
  onEscalateToEmergency,
  onSafeConfirmed,
}: UseSafetyCheckAutoEscalationProps) {
  const [isCheckModalOpen, setIsCheckModalOpen] = useState<boolean>(false)
  const [remainingSeconds, setRemainingSeconds] = useState<number>(initialDurationSeconds)
  const [triggerReason, setTriggerReason] = useState<string>('Sudden Vitals Spike Detected (Pulse > 115 BPM)')
  const [activeSnapshot, setActiveSnapshot] = useState<VitalsSnapshot | null>(null)

  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const lastHeartRateRef = useRef<number | null>(null)
  const cooldownUntilTimestampRef = useRef<number>(0)

  // 1. Trigger Vitals Anomaly Safety Pop-up
  const triggerSafetyCheck = useCallback(
    (reason: string, customDurationSeconds?: number, isForceManual = false) => {
      const now = Date.now()
      // If not manual test and still in cooldown from user clicking "Yes, I Am Safe", IGNORE
      if (!isForceManual && now < cooldownUntilTimestampRef.current) {
        return
      }

      const snapshot: VitalsSnapshot = {
        heartRate: vitals?.heartRate || 124,
        bloodPressureSystolic: vitals?.bloodPressureSystolic || 142,
        bloodPressureDiastolic: vitals?.bloodPressureDiastolic || 92,
        gForce: vitals?.accelerationG || 1.1,
        batteryLevel: vitals?.batteryLevel || 84,
        triggerReason: reason,
      }

      setTriggerReason(reason)
      setActiveSnapshot(snapshot)
      setRemainingSeconds(customDurationSeconds || initialDurationSeconds)
      setIsCheckModalOpen(true)

      // Hardware haptic buzz
      if (typeof window !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate([200, 100, 200, 100, 300])
      }
    },
    [vitals, initialDurationSeconds]
  )

  // 2. Monitor sudden Vitals spikes (Pulse jump, BP jump, or High Impact)
  useEffect(() => {
    if (!vitals || !isJourneyActive) return

    const now = Date.now()
    if (now < cooldownUntilTimestampRef.current || isCheckModalOpen) {
      return
    }

    const hr = vitals.heartRate
    if (hr !== null) {
      if (lastHeartRateRef.current !== null) {
        const hrDiff = hr - lastHeartRateRef.current
        if (hrDiff >= 30 && !isCheckModalOpen) {
          triggerSafetyCheck(`Sudden Heart Rate Spike by +${hrDiff} BPM (Tachycardia Pattern)`)
        }
      }
      lastHeartRateRef.current = hr
    }

    // High Impact > 2.8G
    if (vitals.accelerationG > 2.8 && !isCheckModalOpen) {
      triggerSafetyCheck(`Sudden Physical Impact / Rapid Deceleration (${vitals.accelerationG} G)`)
    }
  }, [vitals, isJourneyActive, isCheckModalOpen, triggerSafetyCheck])

  // 3. 10-Minute (600s) Countdown Timer & Auto-Escalation
  useEffect(() => {
    if (!isCheckModalOpen) {
      if (timerRef.current) clearInterval(timerRef.current)
      return
    }

    timerRef.current = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!)
          // 10 MINUTES TIMED OUT WITH ZERO USER RESPONSE -> AUTO-DISPATCH ALL DETAILS!
          handleAutoTimeoutEscalation()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [isCheckModalOpen])

  // 4. Auto-escalate when 10 minutes expires without response
  const handleAutoTimeoutEscalation = useCallback(async () => {
    setIsCheckModalOpen(false)

    const locStr = location
      ? `${location.lat.toFixed(5)}, ${location.lng.toFixed(5)}`
      : '26.15200, 91.66400'
    const mapLink = `https://maps.google.com/?q=${locStr}`
    const activeContacts = contacts && contacts.length > 0 ? contacts : INITIAL_EMERGENCY_CONTACTS

    const message = `🚨 SAKHI 10-MIN UNANSWERED SAFETY ALERT: ${userName} did not respond to safety check during her journey after "${triggerReason}". Last GPS: ${locStr}. Maps: ${mapLink}. Vitals: HR ${activeSnapshot?.heartRate || 120}bpm, BP ${activeSnapshot?.bloodPressureSystolic || 140}/${activeSnapshot?.bloodPressureDiastolic || 90}mmHg, Batt: ${activeSnapshot?.batteryLevel || 80}%. Immediate action required!`

    try {
      await fetch('/api/dispatch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipients: activeContacts.map((c) => c.normalizedPhone),
          message,
          triggerType: 'UNANSWERED_SAFETY_CHECK_TIMEOUT',
          location,
        }),
      })
    } catch (e) {
      console.warn('Dispatch timeout error:', e)
    }

    // Trigger cellular SMS broadcast
    triggerDeadZoneSmsBroadcast(message)

    if (onEscalateToEmergency && activeSnapshot) {
      onEscalateToEmergency('10-Minute Unanswered Vitals Check', activeSnapshot)
    }
  }, [location, triggerReason, activeSnapshot, onEscalateToEmergency, contacts, userName])

  // 5. User confirms: "Yes, I Am Safe" -> Guarantees close and suppresses re-triggers
  const confirmSafe = useCallback(() => {
    setIsCheckModalOpen(false)
    // 5-minute cooldown period so user can continue ride in peace
    cooldownUntilTimestampRef.current = Date.now() + 300000

    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(80)
    }

    if (onSafeConfirmed) {
      onSafeConfirmed()
    }
  }, [onSafeConfirmed])

  // 6. User confirms: "No, I Need Help" (Instant Action)
  const triggerNeedHelp = useCallback(async () => {
    setIsCheckModalOpen(false)
    cooldownUntilTimestampRef.current = Date.now() + 60000

    const locStr = location
      ? `${location.lat.toFixed(5)}, ${location.lng.toFixed(5)}`
      : '26.15200, 91.66400'
    const mapLink = `https://maps.google.com/?q=${locStr}`
    const activeContacts = contacts && contacts.length > 0 ? contacts : INITIAL_EMERGENCY_CONTACTS

    const message = `🚨 SAKHI USER DISTRESS ALERT: ${userName} confirmed "I NEED HELP" during safety check (${triggerReason})! Last GPS: ${locStr}. Maps: ${mapLink}. Vitals: HR ${activeSnapshot?.heartRate || 128}bpm. Call 112 or assist immediately!`

    try {
      await fetch('/api/dispatch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipients: activeContacts.map((c) => c.normalizedPhone),
          message,
          triggerType: 'USER_CONFIRMED_DISTRESS',
          location,
        }),
      })
    } catch (e) {
      console.warn('Dispatch error:', e)
    }

    triggerDeadZoneSmsBroadcast(message)

    if (onEscalateToEmergency && activeSnapshot) {
      onEscalateToEmergency('User Confirmed Distress', activeSnapshot)
    }
  }, [location, triggerReason, activeSnapshot, onEscalateToEmergency, contacts, userName])

  const formatRemainingTime = (secs: number) => {
    const mins = Math.floor(secs / 60)
    const s = secs % 60
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  return {
    isCheckModalOpen,
    remainingSeconds,
    formattedTime: formatRemainingTime(remainingSeconds),
    triggerReason,
    activeSnapshot,
    triggerSafetyCheck,
    confirmSafe,
    triggerNeedHelp,
    closeModal: confirmSafe,
  }
}
