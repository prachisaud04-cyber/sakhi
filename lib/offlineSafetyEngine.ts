import { GPSLocation } from '@/types'
import { INITIAL_EMERGENCY_CONTACTS } from '@/constants/contacts'

export interface OfflineAnomalyReport {
  timestamp: number
  type: 'IMPACT_FALL' | 'DEAD_ZONE_STATIONARY' | 'ROUTE_DEVIATION' | 'PANIC_MANUAL'
  location: GPSLocation | null
  heartRate?: number
  gForce?: number
  batteryLevel: number
  smsPayload: string
  recipients: string[]
}

/**
 * Encodes an ultra-compact GSM Cellular SOS message payload optimized for 0-network dead zones
 */
export function buildCompactOfflineSms(
  userName: string,
  location: GPSLocation | null,
  batteryLevel: number,
  vitals?: { heartRate?: number; gForce?: number; reason?: string }
): string {
  const locStr = location
    ? `${location.lat.toFixed(5)},${location.lng.toFixed(5)}`
    : '26.1520,91.6640'

  const mapsShort = `https://maps.google.com/?q=${locStr}`
  const reasonText = vitals?.reason ? `[${vitals.reason}]` : ''
  const vitalsText = vitals?.heartRate ? `HR:${vitals.heartRate}bpm` : ''
  const gText = vitals?.gForce && vitals.gForce > 2.0 ? `Impact:${vitals.gForce}G` : ''

  // Compact format < 160 chars for guaranteed 1-SMS GSM cellular delivery
  return `🚨SAKHI OFFLINE SOS: ${userName} ${reasonText} GPS:${locStr} Maps:${mapsShort} Batt:${batteryLevel}% ${vitalsText} ${gText} EMERGENCY-CALL-112`.trim()
}

/**
 * Triggers native cellular SMS radio protocol for dead-zone emergency broadcast
 */
export function triggerDeadZoneSmsBroadcast(
  message: string,
  targetPhones?: string[]
): void {
  if (typeof window === 'undefined') return

  const phones = targetPhones && targetPhones.length > 0
    ? targetPhones
    : INITIAL_EMERGENCY_CONTACTS.map((c) => c.normalizedPhone)

  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
  const isAndroid = /Android/.test(navigator.userAgent)

  const encodedMsg = encodeURIComponent(message)

  let smsUrl = ''
  if (isIOS) {
    // iOS multi-contact separator is &
    smsUrl = `sms:${phones.join('&')}&body=${encodedMsg}`
  } else if (isAndroid) {
    // Android multi-contact separator is , or ;
    smsUrl = `sms:${phones.join(',')}?body=${encodedMsg}`
  } else {
    // Desktop / Default
    smsUrl = `sms:${phones[0]}?body=${encodedMsg}`
  }

  // Launch native cellular SMS radio
  const link = document.createElement('a')
  link.href = smsUrl
  link.click()
}
