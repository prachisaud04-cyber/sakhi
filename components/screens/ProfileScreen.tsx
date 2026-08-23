'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Bell,
  Calendar,
  ChevronRight,
  Edit2,
  HeartPulse,
  Laptop,
  LockKeyhole,
  LogOut,
  LucideIcon,
  MapPin,
  Moon,
  Navigation,
  Palette,
  Phone,
  Plus,
  Shield,
  ShieldCheck,
  Sparkles,
  Sun,
  Trash2,
  User,
  UserCheck,
  Users,
  X,
} from 'lucide-react'
import { ProfileProps } from '@/types'
import { EmergencyContact, initiateCellularCall } from '@/constants/contacts'
import { useAuth } from '@/contexts/AuthContext'
import { useTheme } from '@/contexts/ThemeContext'
import { DesktopCallFallbackModal } from '@/components/ui/DesktopCallFallbackModal'
import { NotificationCenterModal } from '@/components/ui/NotificationCenterModal'
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
  const { user, contacts, logout, openEmergencySetupModal } = useAuth()
  const { theme, setTheme } = useTheme()

  const [isViewingNotifications, setIsViewingNotifications] = useState<boolean>(false)
  const [fallbackContact, setFallbackContact] = useState<EmergencyContact | null>(null)
  const [autoShareEmergency, setAutoShareEmergency] = useState<boolean>(true)

  const handleCallContact = (contact: EmergencyContact) => {
    initiateCellularCall(contact, (c) => setFallbackContact(c))
  }

  const handleSignOut = () => {
    if (confirm('Are you sure you want to sign out of SAKHI?')) {
      logout()
      if (go) go('auth')
    }
  }

  const safetySetupItems: SettingItem[] = [
    {
      title: 'Emergency Contacts & Guardians',
      subtitle: `${contacts.length} configured (${contacts.map((c) => c.name.split(' ')[0]).join(', ') || 'None'})`,
      icon: Users,
      action: () => openEmergencySetupModal(),
    },
    {
      title: 'Biometric Wearables Telemetry',
      subtitle: 'Universal BLE Smartwatch & Heart Rate Monitor',
      icon: HeartPulse,
      action: () => go('home'),
    },
    {
      title: 'Safety Notifications & Gateway',
      subtitle: 'Cellular SMS & WhatsApp Emergency Dispatch',
      icon: Bell,
      action: () => setIsViewingNotifications(true),
    },
    {
      title: 'Location Telemetry Permissions',
      subtitle: locationSharingEnabled
        ? 'ON — Live during active journeys'
        : 'OFF — Sharing disabled',
      icon: MapPin,
      action: toggleLocationSharing,
    },
  ]

  const userInitials = user?.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'PS'

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.25 }}
      className="pb-24"
    >
      <Header title="Profile & Privacy" back={goBack} />
      <div className="content">
        {/* User Profile Card */}
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-[#090d1a] to-[#0f172a] border border-[#00d9d9]/30 shadow-xl mb-4 relative">
          <div className="flex items-center gap-4">
            <span className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#00d9d9] to-[#3b82f6] border-2 border-[#050914] flex items-center justify-center font-extrabold text-[#050914] text-xl shadow-lg shadow-cyan-500/20 shrink-0 font-mono">
              {userInitials}
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <b className="text-xl font-extrabold text-white truncate">{user?.name || 'Prachi Saud'}</b>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-mono border border-emerald-500/30 flex items-center gap-1">
                  <UserCheck className="w-3 h-3" /> Verified
                </span>
              </div>
              <div className="text-xs text-[#94a3b8] font-mono mt-0.5 space-y-0.5">
                <div className="flex items-center gap-2">
                  <Phone className="w-3 h-3 text-[#00d9d9]" />
                  <span>{user?.phone || '+91 88227 17429'}</span>
                </div>
                <div className="flex items-center gap-3 text-[#cbd5e1]">
                  <span>Age: {user?.age ? `${user.age} yrs` : '21 yrs'}</span>
                  <span>•</span>
                  <span className="text-cyan-400">{contacts.length} Guardians</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Emergency Contacts Access Banner */}
        <Card noTilt className="p-4 bg-[#0f172a] border border-cyan-500/30">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-[#00d9d9]" />
              <b className="text-sm text-white">Emergency Contacts ({contacts.length})</b>
            </div>
            <button
              onClick={openEmergencySetupModal}
              className="px-3 py-1.5 rounded-xl bg-[#00d9d9] hover:bg-cyan-300 text-[#050914] font-extrabold text-xs flex items-center gap-1 shadow-md shadow-cyan-500/20 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 stroke-[3]" /> Manage Contacts
            </button>
          </div>

          <div className="space-y-2">
            {contacts.slice(0, 3).map((c, idx) => (
              <div
                key={c.id}
                className="p-2.5 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center font-bold text-[10px] text-[#00d9d9] font-mono">
                    {c.avatarInitials}
                  </div>
                  <div className="truncate">
                    <b className="text-white block truncate">{c.name}</b>
                    <span className="text-[#94a3b8] text-[10px] font-mono">{c.phone}</span>
                  </div>
                </div>
                <button
                  onClick={() => handleCallContact(c)}
                  className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-[#00d9d9]/20 text-[#00d9d9] font-bold text-[11px] flex items-center gap-1 border border-white/10"
                >
                  <Phone className="w-3 h-3" /> Call
                </button>
              </div>
            ))}
            {contacts.length > 3 && (
              <button
                onClick={openEmergencySetupModal}
                className="w-full text-center text-xs text-[#00d9d9] font-mono py-1 hover:underline"
              >
                + View all {contacts.length} contacts
              </button>
            )}
          </div>
        </Card>

        {/* Live Location Privacy Controls */}
        <Card noTilt className="p-4 space-y-3">
          <b className="text-sm font-extrabold text-white block">Live Telemetry &amp; Privacy</b>
          <div className="space-y-2.5 font-sans text-xs">
            <div className="flex items-center justify-between p-3 rounded-xl bg-black/40 border border-white/10">
              <div>
                <b className="text-white block">Emergency Auto-Share</b>
                <small className="text-[#94a3b8]">Auto-start location broadcast on SOS trigger</small>
              </div>
              <button
                onClick={() => setAutoShareEmergency(!autoShareEmergency)}
                className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                  autoShareEmergency ? 'bg-[#00d9d9]' : 'bg-white/20'
                }`}
              >
                <span
                  className={`w-5 h-5 rounded-full bg-[#050914] absolute top-0.5 transition-transform ${
                    autoShareEmergency ? 'right-0.5' : 'left-0.5'
                  }`}
                />
              </button>
            </div>
          </div>
        </Card>

        <div className="field">APPEARANCE &amp; THEME</div>
        <Card noTilt className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Palette className="w-4 h-4 text-[#00d9d9]" />
              <b className="text-sm text-white">Visual Interface Theme</b>
            </div>
            <span className="text-[10px] text-[#00d9d9] font-mono uppercase bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
              {theme === 'system' ? 'System Match' : theme === 'dark' ? 'Dark Cyber' : 'Light Mode'}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => setTheme('dark')}
              className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                theme === 'dark'
                  ? 'bg-[#00d9d9]/20 border-[#00d9d9] text-[#00d9d9] shadow-md shadow-cyan-500/10'
                  : 'bg-black/30 border-white/10 text-[#94a3b8] hover:text-white'
              }`}
            >
              <Moon className="w-5 h-5" />
              <span className="text-xs font-bold font-mono">Dark Cyber</span>
            </button>

            <button
              onClick={() => setTheme('light')}
              className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                theme === 'light'
                  ? 'bg-[#00d9d9]/20 border-[#00d9d9] text-[#00d9d9] shadow-md shadow-cyan-500/10'
                  : 'bg-black/30 border-white/10 text-[#94a3b8] hover:text-white'
              }`}
            >
              <Sun className="w-5 h-5" />
              <span className="text-xs font-bold font-mono">Light Mode</span>
            </button>

            <button
              onClick={() => setTheme('system')}
              className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                theme === 'system'
                  ? 'bg-[#00d9d9]/20 border-[#00d9d9] text-[#00d9d9] shadow-md shadow-cyan-500/10'
                  : 'bg-black/30 border-white/10 text-[#94a3b8] hover:text-white'
              }`}
            >
              <Laptop className="w-5 h-5" />
              <span className="text-xs font-bold font-mono">Auto System</span>
            </button>
          </div>
        </Card>

        <div className="field">SAFETY &amp; GUARDIAN CONTROLS</div>
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

        <div className="field">ACCOUNT ACTIONS</div>
        <Card>
          <button className="setting text-red-400 hover:text-red-300" onClick={handleSignOut}>
            <LogOut className="text-red-400" />
            <span>
              <b className="text-red-400">Sign Out / Switch Account</b>
              <small>Log out of current SAKHI profile on this device</small>
            </span>
            <ChevronRight />
          </button>
        </Card>

        <DesktopCallFallbackModal
          contact={fallbackContact}
          onClose={() => setFallbackContact(null)}
        />

        <NotificationCenterModal
          isOpen={isViewingNotifications}
          onClose={() => setIsViewingNotifications(false)}
        />
      </div>
    </motion.div>
  )
}
