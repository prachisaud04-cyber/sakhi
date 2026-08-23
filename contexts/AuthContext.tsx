'use client'

import React, { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { EmergencyContact, INITIAL_EMERGENCY_CONTACTS } from '@/constants/contacts'
import { StoredUserAccount, UserProfile } from '@/types/auth'

interface AuthContextType {
  user: UserProfile | null
  contacts: EmergencyContact[]
  isAuthenticated: boolean
  isLoading: boolean
  isEmergencySetupModalOpen: boolean
  register: (name: string, phone: string, age: number, password: string) => Promise<{ success: boolean; error?: string }>
  login: (phone: string, password: string) => Promise<{ success: boolean; error?: string }>
  loginDemo: () => Promise<void>
  logout: () => void
  updateUserProfile: (data: Partial<UserProfile>) => Promise<void>
  addEmergencyContact: (data: { name: string; phone: string; relation: string; isPrimary?: boolean }) => Promise<{ success: boolean; contact?: EmergencyContact; error?: string }>
  updateEmergencyContact: (id: string, data: Partial<EmergencyContact>) => Promise<{ success: boolean; error?: string }>
  deleteEmergencyContact: (id: string) => Promise<{ success: boolean; error?: string }>
  setPrimaryEmergencyContact: (id: string) => Promise<void>
  openEmergencySetupModal: () => void
  closeEmergencySetupModal: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const DEMO_USER: StoredUserAccount = {
  id: 'usr-demo-prachi',
  name: 'Prachi Saud',
  phone: '+91 88227 17429',
  normalizedPhone: '+918822717429',
  age: 21,
  passwordHash: 'password123',
  hasCompletedEmergencySetup: true,
  createdAt: new Date().toISOString(),
}

function normalizePhoneNumber(raw: string): string {
  const digits = raw.replace(/\D/g, '')
  if (digits.length === 10) {
    return `+91${digits}`
  }
  if (digits.startsWith('91') && digits.length === 12) {
    return `+${digits}`
  }
  if (raw.startsWith('+')) {
    return `+${digits}`
  }
  return `+91${digits}`
}

function formatDisplayPhone(norm: string): string {
  if (norm.startsWith('+91') && norm.length === 13) {
    return `+91 ${norm.slice(3, 8)} ${norm.slice(8)}`
  }
  return norm
}

function getAvatarInitials(name: string): string {
  const parts = name.trim().split(/\s+/)
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
  }
  return name.slice(0, 2).toUpperCase() || 'PS'
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [contacts, setContacts] = useState<EmergencyContact[]>(INITIAL_EMERGENCY_CONTACTS)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [isEmergencySetupModalOpen, setIsEmergencySetupModalOpen] = useState<boolean>(false)

  // Load session from localStorage on mount
  useEffect(() => {
    if (typeof window === 'undefined') return

    try {
      // 1. Check stored active session
      const storedUser = localStorage.getItem('sakhi_auth_user')
      if (storedUser) {
        const parsedUser: UserProfile = JSON.parse(storedUser)
        // Auto-upgrade legacy Riya demo name if present
        if (parsedUser.name === 'Riya Sharma' || parsedUser.name === 'Riya') {
          parsedUser.name = 'Prachi Saud'
          localStorage.setItem('sakhi_auth_user', JSON.stringify(parsedUser))
        }
        setUser(parsedUser)

        // Load user-specific emergency contacts
        const storedContacts = localStorage.getItem(`sakhi_contacts_${parsedUser.id}`)
        if (storedContacts) {
          setContacts(JSON.parse(storedContacts))
        } else {
          setContacts(INITIAL_EMERGENCY_CONTACTS)
          localStorage.setItem(`sakhi_contacts_${parsedUser.id}`, JSON.stringify(INITIAL_EMERGENCY_CONTACTS))
        }

        // If user hasn't completed emergency contact setup, prompt them
        if (!parsedUser.hasCompletedEmergencySetup) {
          setIsEmergencySetupModalOpen(true)
        }
      } else {
        // Auto-seed demo user accounts if empty
        const accountsRaw = localStorage.getItem('sakhi_user_accounts')
        if (!accountsRaw) {
          localStorage.setItem('sakhi_user_accounts', JSON.stringify([DEMO_USER]))
        }
        // Default to Demo user so first-time visitors can immediately explore, or they can log out/register
        setUser(DEMO_USER)
        setContacts(INITIAL_EMERGENCY_CONTACTS)
        localStorage.setItem('sakhi_auth_user', JSON.stringify(DEMO_USER))
        localStorage.setItem(`sakhi_contacts_${DEMO_USER.id}`, JSON.stringify(INITIAL_EMERGENCY_CONTACTS))
      }
    } catch (err) {
      console.warn('Auth initialization notice:', err)
      setUser(DEMO_USER)
      setContacts(INITIAL_EMERGENCY_CONTACTS)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // REGISTER
  const register = useCallback(
    async (name: string, phone: string, age: number, password: string) => {
      const cleanName = name.trim()
      const normPhone = normalizePhoneNumber(phone)

      if (!cleanName) {
        return { success: false, error: 'Full name is required' }
      }
      if (normPhone.replace(/\D/g, '').length < 10) {
        return { success: false, error: 'Please provide a valid 10-digit phone number' }
      }
      if (isNaN(age) || age < 12 || age > 110) {
        return { success: false, error: 'Please enter a valid age (minimum 12 years)' }
      }
      if (!password || password.length < 4) {
        return { success: false, error: 'Password must be at least 4 characters long' }
      }

      try {
        const accountsRaw = localStorage.getItem('sakhi_user_accounts')
        const accounts: StoredUserAccount[] = accountsRaw ? JSON.parse(accountsRaw) : []

        // Check if phone already registered
        const existing = accounts.find((a) => a.normalizedPhone === normPhone)
        if (existing) {
          return { success: false, error: 'An account with this phone number already exists. Please sign in.' }
        }

        const newUser: StoredUserAccount = {
          id: `usr-${Date.now()}`,
          name: cleanName,
          phone: formatDisplayPhone(normPhone),
          normalizedPhone: normPhone,
          age: Number(age),
          passwordHash: password,
          hasCompletedEmergencySetup: false,
          createdAt: new Date().toISOString(),
        }

        accounts.push(newUser)
        localStorage.setItem('sakhi_user_accounts', JSON.stringify(accounts))

        // Set active session
        const { passwordHash, ...profile } = newUser
        setUser(profile)
        localStorage.setItem('sakhi_auth_user', JSON.stringify(profile))

        // Initialize with default emergency helplines
        const defaultContacts: EmergencyContact[] = [
          {
            id: `c-police-${Date.now()}`,
            name: 'National Emergency Helpline',
            phone: '112',
            normalizedPhone: '112',
            relation: 'Police & Emergency',
            isTrusted: true,
            avatarInitials: '112',
          },
          {
            id: `c-women-${Date.now()}`,
            name: 'Women Safety Helpline',
            phone: '1091',
            normalizedPhone: '1091',
            relation: 'Women Safety Desk',
            isTrusted: true,
            avatarInitials: 'WS',
          },
        ]

        setContacts(defaultContacts)
        localStorage.setItem(`sakhi_contacts_${profile.id}`, JSON.stringify(defaultContacts))

        // Prompt emergency contacts setup modal
        setIsEmergencySetupModalOpen(true)

        return { success: true }
      } catch (err) {
        return { success: false, error: 'Failed to create account. Please try again.' }
      }
    },
    []
  )

  // LOGIN
  const login = useCallback(async (phone: string, password: string) => {
    const normPhone = normalizePhoneNumber(phone)

    if (!normPhone || normPhone.replace(/\D/g, '').length < 8) {
      return { success: false, error: 'Please enter a valid phone number' }
    }
    if (!password) {
      return { success: false, error: 'Please enter your password' }
    }

    try {
      const accountsRaw = localStorage.getItem('sakhi_user_accounts')
      const accounts: StoredUserAccount[] = accountsRaw ? JSON.parse(accountsRaw) : [DEMO_USER]

      const account = accounts.find(
        (a) => a.normalizedPhone === normPhone || a.phone.replace(/\D/g, '') === normPhone.replace(/\D/g, '')
      )

      if (!account) {
        return { success: false, error: 'No account found with this phone number. Please register.' }
      }

      if (account.passwordHash !== password) {
        return { success: false, error: 'Incorrect password. Please check and try again.' }
      }

      const { passwordHash, ...profile } = account
      setUser(profile)
      localStorage.setItem('sakhi_auth_user', JSON.stringify(profile))

      // Load user's emergency contacts
      const storedContacts = localStorage.getItem(`sakhi_contacts_${profile.id}`)
      if (storedContacts) {
        const parsed = JSON.parse(storedContacts)
        setContacts(parsed)
        if (parsed.length === 0 || !profile.hasCompletedEmergencySetup) {
          setIsEmergencySetupModalOpen(true)
        }
      } else {
        setContacts(INITIAL_EMERGENCY_CONTACTS)
        localStorage.setItem(`sakhi_contacts_${profile.id}`, JSON.stringify(INITIAL_EMERGENCY_CONTACTS))
      }

      return { success: true }
    } catch (err) {
      return { success: false, error: 'Sign in failed. Please try again.' }
    }
  }, [])

  // LOGIN DEMO
  const loginDemo = useCallback(async () => {
    const { passwordHash, ...profile } = DEMO_USER
    setUser(profile)
    setContacts(INITIAL_EMERGENCY_CONTACTS)
    localStorage.setItem('sakhi_auth_user', JSON.stringify(profile))
    localStorage.setItem(`sakhi_contacts_${profile.id}`, JSON.stringify(INITIAL_EMERGENCY_CONTACTS))
  }, [])

  // LOGOUT
  const logout = useCallback(() => {
    setUser(null)
    setContacts([])
    localStorage.removeItem('sakhi_auth_user')
  }, [])

  // UPDATE USER PROFILE
  const updateUserProfile = useCallback(async (data: Partial<UserProfile>) => {
    setUser((prev) => {
      if (!prev) return null
      const updated = { ...prev, ...data }
      localStorage.setItem('sakhi_auth_user', JSON.stringify(updated))

      // Update in accounts store too
      try {
        const accountsRaw = localStorage.getItem('sakhi_user_accounts')
        if (accountsRaw) {
          const accounts: StoredUserAccount[] = JSON.parse(accountsRaw)
          const idx = accounts.findIndex((a) => a.id === prev.id)
          if (idx !== -1) {
            accounts[idx] = { ...accounts[idx], ...data }
            localStorage.setItem('sakhi_user_accounts', JSON.stringify(accounts))
          }
        }
      } catch (e) {
        console.warn('Update accounts error:', e)
      }

      return updated
    })
  }, [])

  // ADD EMERGENCY CONTACT
  const addEmergencyContact = useCallback(
    async (data: { name: string; phone: string; relation: string; isPrimary?: boolean }) => {
      const cleanName = data.name.trim()
      const normPhone = normalizePhoneNumber(data.phone)

      if (!cleanName) {
        return { success: false, error: 'Contact name is required' }
      }
      if (normPhone.replace(/\D/g, '').length < 3) {
        return { success: false, error: 'Please enter a valid phone number' }
      }

      const newContact: EmergencyContact = {
        id: `cnt-${Date.now()}`,
        name: cleanName,
        phone: formatDisplayPhone(normPhone),
        normalizedPhone: normPhone,
        relation: data.relation || 'Emergency Contact',
        isTrusted: true,
        avatarInitials: getAvatarInitials(cleanName),
      }

      setContacts((prev) => {
        let updated: EmergencyContact[] = []
        if (data.isPrimary) {
          updated = [newContact, ...prev]
        } else {
          updated = [...prev, newContact]
        }

        if (user) {
          localStorage.setItem(`sakhi_contacts_${user.id}`, JSON.stringify(updated))
        }
        return updated
      })

      // Mark emergency setup as completed
      if (user && !user.hasCompletedEmergencySetup) {
        updateUserProfile({ hasCompletedEmergencySetup: true })
      }

      return { success: true, contact: newContact }
    },
    [user, updateUserProfile]
  )

  // UPDATE EMERGENCY CONTACT
  const updateEmergencyContact = useCallback(
    async (id: string, data: Partial<EmergencyContact>) => {
      setContacts((prev) => {
        const updated = prev.map((c) => {
          if (c.id === id) {
            const norm = data.phone ? normalizePhoneNumber(data.phone) : c.normalizedPhone
            const name = data.name !== undefined ? data.name : c.name
            return {
              ...c,
              ...data,
              name,
              phone: data.phone ? formatDisplayPhone(norm) : c.phone,
              normalizedPhone: norm,
              avatarInitials: getAvatarInitials(name),
            }
          }
          return c
        })

        if (user) {
          localStorage.setItem(`sakhi_contacts_${user.id}`, JSON.stringify(updated))
        }
        return updated
      })
      return { success: true }
    },
    [user]
  )

  // DELETE EMERGENCY CONTACT
  const deleteEmergencyContact = useCallback(
    async (id: string) => {
      setContacts((prev) => {
        const updated = prev.filter((c) => c.id !== id)
        if (user) {
          localStorage.setItem(`sakhi_contacts_${user.id}`, JSON.stringify(updated))
        }
        return updated
      })
      return { success: true }
    },
    [user]
  )

  // SET PRIMARY CONTACT
  const setPrimaryEmergencyContact = useCallback(
    async (id: string) => {
      setContacts((prev) => {
        const target = prev.find((c) => c.id === id)
        if (!target) return prev
        const others = prev.filter((c) => c.id !== id)
        const updated = [target, ...others]
        if (user) {
          localStorage.setItem(`sakhi_contacts_${user.id}`, JSON.stringify(updated))
        }
        return updated
      })
    },
    [user]
  )

  const openEmergencySetupModal = useCallback(() => {
    setIsEmergencySetupModalOpen(true)
  }, [])

  const closeEmergencySetupModal = useCallback(() => {
    setIsEmergencySetupModalOpen(false)
  }, [])

  return (
    <AuthContext.Provider
      value={{
        user,
        contacts,
        isAuthenticated: !!user,
        isLoading,
        isEmergencySetupModalOpen,
        register,
        login,
        loginDemo,
        logout,
        updateUserProfile,
        addEmergencyContact,
        updateEmergencyContact,
        deleteEmergencyContact,
        setPrimaryEmergencyContact,
        openEmergencySetupModal,
        closeEmergencySetupModal,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
