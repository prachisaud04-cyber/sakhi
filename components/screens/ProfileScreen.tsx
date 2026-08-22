'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {
  ChevronRight,
  HeartPulse,
  LockKeyhole,
  LucideIcon,
  MapPin,
  Navigation,
  Phone,
  Plus,
  ShieldCheck,
  Trash2,
  Users,
  X,
} from 'lucide-react'
import { ProfileProps } from '@/types'
import {
  EmergencyContact,
  INITIAL_EMERGENCY_CONTACTS,
  initiateCellularCall,
} from '@/constants/contacts'
import { DesktopCallFallbackModal } from '@/components/ui/DesktopCallFallbackModal'
import { Card } from '@/components/ui/Card'
import { Header } from '@/components/ui/Header'

interface SettingItem {
  title: string
  subtitle: string
  icon: LucideIcon
  action?: () => void
}

export const ProfileScreen: React.FC<ProfileProps> = ({
  go,
  goBack,
  locationSharingEnabled,
  toggleLocationSharing,
}) => {
  const [isManagingContacts, setIsManagingContacts] = useState<boolean>(false)
  const [contacts, setContacts] = useState<EmergencyContact[]>(INITIAL_EMERGENCY_CONTACTS)
  const [fallbackContact, setFallbackContact] = useState<EmergencyContact | null>(null)
  const [newContactName, setNewContactName] = useState('')
  const [newContactPhone, setNewContactPhone] = useState('')
  const [newContactRelation, setNewContactRelation] = useState('Emergency Contact')
  const [autoShareEmergency, setAutoShareEmergency] = useState<boolean>(true)

  const handleCallContact = (contact: EmergencyContact) => {
    initiateCellularCall(contact, (c) => setFallbackContact(c))
  }

  const handleImportContacts = async () => {
    if ('contacts' in navigator && 'select' in (navigator as any).contacts) {
      try {
        const props = ['name', 'tel']
        const imported = await (navigator as any).contacts.select(props, { multiple: false })
        if (imported && imported.length > 0) {
          const c = imported[0]
          const name = c.name ? c.name[0] : 'Imported Contact'
          const tel = c.tel ? c.tel[0] : '+91 90000 00000'
          const norm = tel.replace(/\s+/g, '')
          setContacts((prev) => [
            ...prev,
            {
              id: Date.now().toString(),
              name,
              phone: tel,
              normalizedPhone: norm,
              relation: 'Imported',
              isTrusted: true,
              avatarInitials: name.substring(0, 2).toUpperCase(),
            },
          ])
        }
      } catch (err) {
        console.warn('Contact picker cancelled or unpermitted:', err)
      }
    } else {
      alert('Contacts Picker API is unsupported on desktop browsers. Use manual contact entry below!')
    }
  }

  const handleAddContact = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newContactName || !newContactPhone) return
    const norm = newContactPhone.replace(/\s+/g, '')
    setContacts([
      ...contacts,
      {
        id: Date.now().toString(),
        name: newContactName,
        phone: newContactPhone,
        normalizedPhone: norm,
        relation: newContactRelation,
        isTrusted: true,
        avatarInitials: newContactName.substring(0, 2).toUpperCase(),
      },
    ])
    setNewContactName('')
    setNewContactPhone('')
  }

  const handleRemoveContact = (id: string) => {
    setContacts(contacts.filter((c) => c.id !== id))
  }

  const toggleTrusted = (id: string) => {
    setContacts(
      contacts.map((c) => (c.id === id ? { ...c, isTrusted: !c.isTrusted } : c))
    )
  }

  const safetySetupItems: SettingItem[] = [
    {
      title: 'Emergency contacts',
      subtitle: `${contacts.length} configured (Prachi Saud, Abhijeet Das, Licha Pathak, Hridip Sarma)`,
      icon: Users,
      action: () => setIsManagingContacts(true),
    },
    {
      title: 'Health data',
      subtitle: 'Not connected (Wearable setup)',
      icon: HeartPulse,
      action: () => go('profile'),
    },
    {
      title: 'Location permissions',
      subtitle: locationSharingEnabled
        ? 'ON — Only during active journeys'
        : 'OFF — Sharing disabled',
      icon: MapPin,
      action: toggleLocationSharing,
    },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.25 }}
    >
      <Header title="Profile & privacy" back={goBack} />
      <div className="content">
        <div className="profile flex items-center gap-4 py-4">
          <span className="w-14 h-14 rounded-full bg-gradient-to-br from-[#00d9d9] to-[#3b82f6] border-2 border-[#050914] flex items-center justify-center font-extrabold text-[#050914] text-lg shadow-lg">
            RS
          </span>
          <div>
            <b className="text-xl font-extrabold text-white block">Riya Sharma</b>
            <small className="text-sm text-[#00d9d9]">Privacy-first mode active</small>
          </div>
        </div>

        <Card className="privacy">
          <LockKeyhole />
          <span>
            <b>Your privacy is protected</b>
            <small>Only share live location telemetry when explicitly authorized or during SOS escalation.</small>
          </span>
        </Card>

        {/* Dedicated Live Location Privacy Controls */}
        <Card noTilt className="p-5 space-y-4">
          <b className="text-base font-extrabold text-white block">Live Location Privacy &amp; Sharing</b>

          <div className="space-y-3 font-sans text-xs">
            <div className="flex items-center justify-between p-3 rounded-xl bg-black/40 border border-white/10">
              <div>
                <b className="text-white block">Emergency Auto-Share</b>
                <small className="text-[#94a3b8]">Automatically start location sharing when SOS is triggered</small>
              </div>
              <button
                onClick={() => setAutoShareEmergency(!autoShareEmergency)}
                className={`w-12 h-6 rounded-full transition-colors relative ${autoShareEmergency ? 'bg-[#00d9d9]' : 'bg-white/20'}`}
              >
                <span className={`w-5 h-5 rounded-full bg-[#050914] absolute top-0.5 transition-transform ${autoShareEmergency ? 'right-0.5' : 'left-0.5'}`} />
              </button>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-black/40 border border-white/10">
              <div>
                <b className="text-white block">Default Sharing Duration</b>
                <small className="text-[#94a3b8]">30 Minutes (Configured)</small>
              </div>
              <span className="text-[11px] font-bold text-[#00d9d9] bg-cyan-950/40 px-2.5 py-1 rounded-lg border border-cyan-500/30">
                30 MINS
              </span>
            </div>
          </div>
        </Card>

        <div className="field">SAFETY SETUP</div>
        <Card>
          {safetySetupItems.map(({ title, subtitle, icon: Icon, action }) => (
            <button
              className="setting"
              key={title}
              onClick={() => {
                if (action) action()
              }}
            >
              <Icon />
              <span>
                <b>{title}</b>
                <small>{subtitle}</small>
              </span>
              <ChevronRight />
            </button>
          ))}
        </Card>

        <div className="field">PRIVACY CONTROLS</div>
        <Card>
          <button className="setting" onClick={() => go('privacy')}>
            <LockKeyhole />
            <span>
              <b>Safety Capsule</b>
              <small>Temporary encrypted information</small>
            </span>
            <ChevronRight />
          </button>
        </Card>

        {/* Manage Emergency Contacts Modal */}
        {isManagingContacts && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-[#0f172a] border border-cyan-500/30 rounded-2xl p-6 max-w-md w-full shadow-2xl relative max-h-[85vh] overflow-y-auto"
            >
              <button
                onClick={() => setIsManagingContacts(false)}
                className="absolute top-4 right-4 text-[#94a3b8] hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>

              <b className="text-xl font-bold text-white flex items-center gap-2 mb-2">
                <Users className="w-6 h-6 text-[#00d9d9]" /> Emergency Contact Book
              </b>

              <div className="flex items-center justify-between mb-4">
                <span className="text-xs text-[#94a3b8]">Real Emergency Contacts</span>
                <button
                  type="button"
                  onClick={handleImportContacts}
                  className="px-2.5 py-1 rounded-lg bg-cyan-500/15 border border-cyan-500/30 text-[#00d9d9] text-xs font-bold hover:bg-cyan-500/25 transition-colors"
                >
                  Import Device Contact
                </button>
              </div>

              <div className="space-y-3 mb-6 max-h-64 overflow-y-auto pr-1">
                {contacts.map((c) => (
                  <div
                    key={c.id}
                    className="p-3.5 rounded-xl bg-black/40 border border-white/10 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#00d9d9] to-[#3b82f6] border border-white/10 flex items-center justify-center text-xs font-extrabold text-[#050914]">
                          {c.avatarInitials}
                        </div>
                        <div>
                          <b className="text-sm text-white block">{c.name}</b>
                          <small className="text-xs text-[#00d9d9] font-mono">
                            {c.phone}
                          </small>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleCallContact(c)}
                          className="px-3 py-1.5 rounded-xl bg-[#00d9d9] text-[#050914] font-extrabold text-xs hover:bg-cyan-300 transition-colors flex items-center gap-1 shadow-md"
                        >
                          <Phone className="w-3.5 h-3.5" /> Call
                        </button>
                        <button
                          onClick={() => handleRemoveContact(c.id)}
                          className="text-red-400 hover:text-red-300 p-1.5 rounded-lg hover:bg-red-500/10"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-white/5 text-[11px]">
                      <span className="text-[#94a3b8]">Emergency Alert Status:</span>
                      <button
                        onClick={() => toggleTrusted(c.id)}
                        className={`px-2 py-0.5 rounded font-bold transition-colors ${
                          c.isTrusted
                            ? 'bg-[#00d9d9]/20 text-[#00d9d9] border border-[#00d9d9]/30'
                            : 'bg-white/5 text-[#94a3b8]'
                        }`}
                      >
                        {c.isTrusted ? '✓ Active Trusted' : 'Off'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <form onSubmit={handleAddContact} className="space-y-3 pt-2 border-t border-white/10">
                <small className="block font-bold text-xs text-[#00d9d9] uppercase">
                  Add Emergency Contact
                </small>
                <input
                  placeholder="Full Name (e.g. Rahul Sharma)"
                  value={newContactName}
                  onChange={(e) => setNewContactName(e.target.value)}
                  className="w-full bg-[#1e293b] border border-white/10 rounded-xl p-2.5 text-white text-sm focus:border-[#00d9d9] outline-none"
                />
                <input
                  placeholder="Phone Number (+91...)"
                  value={newContactPhone}
                  onChange={(e) => setNewContactPhone(e.target.value)}
                  className="w-full bg-[#1e293b] border border-white/10 rounded-xl p-2.5 text-white text-sm focus:border-[#00d9d9] outline-none"
                />

                <button type="submit" className="primary w-full text-sm">
                  <Plus className="w-4 h-4 mr-1 inline" /> Save Contact
                </button>
              </form>
            </motion.div>
          </div>
        )}

        <DesktopCallFallbackModal
          contact={fallbackContact}
          onClose={() => setFallbackContact(null)}
        />
      </div>
    </motion.div>
  )
}
