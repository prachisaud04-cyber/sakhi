export interface EmergencyContact {
  id: string
  name: string
  phone: string
  normalizedPhone: string
  relation: string
  isTrusted: boolean
  avatarInitials: string
}

export const INITIAL_EMERGENCY_CONTACTS: EmergencyContact[] = [
  {
    id: 'c1',
    name: 'Prachi Saud',
    phone: '+91 88227 17429',
    normalizedPhone: '+918822717429',
    relation: 'Emergency Contact',
    isTrusted: true,
    avatarInitials: 'PS',
  },
  {
    id: 'c2',
    name: 'Abhijeet Das',
    phone: '+91 70020 38675',
    normalizedPhone: '+917002038675',
    relation: 'Emergency Contact',
    isTrusted: true,
    avatarInitials: 'AD',
  },
  {
    id: 'c3',
    name: 'Licha Pathak',
    phone: '+91 6002 597001',
    normalizedPhone: '+916002597001',
    relation: 'Emergency Contact',
    isTrusted: true,
    avatarInitials: 'LP',
  },
  {
    id: 'c4',
    name: 'Hridip Sarma',
    phone: '+91 70869 32912',
    normalizedPhone: '+917086932912',
    relation: 'Emergency Contact',
    isTrusted: true,
    avatarInitials: 'HS',
  },
]

/**
 * Triggers native cellular phone call using tel: protocol
 * Handles desktop browser fallbacks gracefully.
 */
export function initiateCellularCall(
  contact: EmergencyContact,
  onDesktopFallback?: (contact: EmergencyContact) => void
) {
  const telUrl = `tel:${contact.normalizedPhone}`

  // Detect basic mobile OS user agent
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    typeof navigator !== 'undefined' ? navigator.userAgent : ''
  )

  if (typeof window !== 'undefined') {
    if (isMobile) {
      window.location.href = telUrl
    } else {
      // Try opening tel link on desktop (opens FaceTime/Skype/Default handler)
      window.location.href = telUrl

      // Trigger laptop copy fallback after short delay if handler doesn't capture focus
      if (onDesktopFallback) {
        onDesktopFallback(contact)
      }
    }
  }
}
