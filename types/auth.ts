export interface UserProfile {
  id: string
  name: string
  phone: string
  normalizedPhone: string
  age: number
  hasCompletedEmergencySetup: boolean
  createdAt: string
}

export interface StoredUserAccount extends UserProfile {
  passwordHash: string
}

export interface EmergencyContactItem {
  id: string
  name: string
  phone: string
  normalizedPhone: string
  relation: string
  isTrusted: boolean
  avatarInitials: string
  isPrimary?: boolean
}
