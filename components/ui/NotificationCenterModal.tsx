'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {
  AlertTriangle,
  BatteryMedium,
  Bell,
  BellOff,
  Check,
  CheckCheck,
  ChevronRight,
  Clock,
  Compass,
  ExternalLink,
  MapPin,
  MessageSquare,
  Plus,
  Radio,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Siren,
  Smartphone,
  Sparkles,
  Trash2,
  X,
} from 'lucide-react'

export interface SafetyNotification {
  id: string
  title: string
  message: string
  category: 'safety' | 'gateway' | 'community' | 'system'
  timestamp: number
  timeAgo: string
  read: boolean
  priority?: 'high' | 'normal'
  targetAction?: string
}

const INITIAL_NOTIFICATIONS: SafetyNotification[] = [
  {
    id: 'notif-1',
    title: 'Automated SMS & WhatsApp Gateway Active',
    message: 'Emergency dispatch gateway is armed and synchronized with 4 trusted guardians (Prachi, Abhijeet, Licha, Hridip).',
    category: 'gateway',
    timestamp: Date.now() - 2 * 60 * 1000,
    timeAgo: '2m ago',
    read: false,
    priority: 'high',
    targetAction: 'Emergency dispatch ready',
  },
  {
    id: 'notif-2',
    title: 'High-Accuracy GPS Feed Connected',
    message: 'Real-time GPS telemetry is active with Supabase Realtime cloud synchronization.',
    category: 'safety',
    timestamp: Date.now() - 8 * 60 * 1000,
    timeAgo: '8m ago',
    read: false,
    priority: 'normal',
    targetAction: 'Live GPS active',
  },
  {
    id: 'notif-3',
    title: 'New Safe Corridor Verified (GS Road)',
    message: 'GS Road / VIP corridor updated with 96% street lighting rating and verified 24/7 police presence.',
    category: 'community',
    timestamp: Date.now() - 25 * 60 * 1000,
    timeAgo: '25m ago',
    read: false,
    priority: 'normal',
    targetAction: 'Safety score 92/100',
  },
  {
    id: 'notif-4',
    title: 'Community Hazard Alert (Jalukbari)',
    message: 'Users reported low lighting near Jalukbari bypass. SAKHI dynamic routing has updated safe pathways.',
    category: 'community',
    timestamp: Date.now() - 60 * 60 * 1000,
    timeAgo: '1h ago',
    read: true,
    priority: 'normal',
    targetAction: 'Avoid low-light detour',
  },
  {
    id: 'notif-5',
    title: 'Battery & Device Protection Optimal',
    message: 'Battery level at 74% with continuous background battery saving optimizations.',
    category: 'system',
    timestamp: Date.now() - 2 * 60 * 60 * 1000,
    timeAgo: '2h ago',
    read: true,
    priority: 'normal',
  },
]

interface NotificationCenterModalProps {
  isOpen: boolean
  onClose: () => void
  onUnreadChange?: (hasUnread: boolean) => void
}

export const NotificationCenterModal: React.FC<NotificationCenterModalProps> = ({
  isOpen,
  onClose,
  onUnreadChange,
}) => {
  const [notifications, setNotifications] = useState<SafetyNotification[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('sakhi_notifications')
        if (stored) return JSON.parse(stored)
      } catch (e) {
        console.warn('Failed to parse notifications', e)
      }
    }
    return INITIAL_NOTIFICATIONS
  })

  const [activeTab, setActiveTab] = useState<'all' | 'safety' | 'community'>('all')
  const [simulatedCount, setSimulatedCount] = useState<number>(0)

  // Sync to local storage & parent unread state
  const saveNotifs = (updated: SafetyNotification[]) => {
    setNotifications(updated)
    if (typeof window !== 'undefined') {
      localStorage.setItem('sakhi_notifications', JSON.stringify(updated))
    }
    const hasUnread = updated.some((n) => !n.read)
    if (onUnreadChange) onUnreadChange(hasUnread)
  }

  const markAllAsRead = () => {
    const updated = notifications.map((n) => ({ ...n, read: true }))
    saveNotifs(updated)
  }

  const toggleRead = (id: string) => {
    const updated = notifications.map((n) =>
      n.id === id ? { ...n, read: !n.read } : n
    )
    saveNotifs(updated)
  }

  const deleteNotification = (id: string) => {
    const updated = notifications.filter((n) => n.id !== id)
    saveNotifs(updated)
  }

  const clearAll = () => {
    saveNotifs([])
  }

  const addTestSafetyAlert = () => {
    const newCount = simulatedCount + 1
    setSimulatedCount(newCount)

    const testAlerts = [
      {
        title: 'Safety Check-in Scheduled',
        message: 'Your automated safety timer is set for 15 minutes. Check-in prompts will activate if route slows.',
        category: 'safety' as const,
        priority: 'normal' as const,
      },
      {
        title: 'Safe Zone Approached (Panbazar All Women PS)',
        message: 'You are within 350 meters of a 24/7 verified Women Safety Desk and police assistance point.',
        category: 'community' as const,
        priority: 'high' as const,
      },
      {
        title: 'Automated Gateway Test Broadcast OK',
        message: 'Simulated WhatsApp & SMS emergency test signal acknowledged by all 4 emergency gateways.',
        category: 'gateway' as const,
        priority: 'high' as const,
      },
    ]

    const pick = testAlerts[(newCount - 1) % testAlerts.length]
    const newNotif: SafetyNotification = {
      id: `notif-${Date.now()}`,
      title: pick.title,
      message: pick.message,
      category: pick.category,
      timestamp: Date.now(),
      timeAgo: 'Just now',
      read: false,
      priority: pick.priority,
    }

    saveNotifs([newNotif, ...notifications])
  }

  if (!isOpen) return null

  const unreadCount = notifications.filter((n) => !n.read).length
  const filtered = notifications.filter((n) => {
    if (activeTab === 'all') return true
    if (activeTab === 'safety') return n.category === 'safety' || n.category === 'gateway'
    if (activeTab === 'community') return n.category === 'community' || n.category === 'system'
    return true
  })

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 10 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-[#0f172a] border border-cyan-500/40 rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden flex flex-col max-h-[85vh] relative"
      >
        {/* Header */}
        <div className="p-5 border-b border-white/10 flex items-center justify-between bg-[#090d1a]">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-[#00d9d9]">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <b className="text-lg font-extrabold text-white">Notifications</b>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-[#00d9d9] text-[#050914] text-xs font-mono font-extrabold">
                    {unreadCount} NEW
                  </span>
                )}
              </div>
              <small className="text-xs text-[#94a3b8]">Real-time safety alerts and journey updates</small>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-[#94a3b8] hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Close notifications"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Filters and Actions */}
        <div className="px-5 py-3 border-b border-white/5 bg-[#0b1222] flex items-center justify-between gap-2 flex-wrap text-xs">
          <div className="flex items-center gap-1 bg-black/40 p-1 rounded-xl border border-white/10">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1 rounded-lg font-bold transition-colors ${
                activeTab === 'all'
                  ? 'bg-[#00d9d9] text-[#050914] shadow-md'
                  : 'text-[#94a3b8] hover:text-white'
              }`}
            >
              All ({notifications.length})
            </button>
            <button
              onClick={() => setActiveTab('safety')}
              className={`px-3 py-1 rounded-lg font-bold transition-colors ${
                activeTab === 'safety'
                  ? 'bg-[#ef4444] text-white shadow-md'
                  : 'text-[#94a3b8] hover:text-white'
              }`}
            >
              Safety &amp; SOS
            </button>
            <button
              onClick={() => setActiveTab('community')}
              className={`px-3 py-1 rounded-lg font-bold transition-colors ${
                activeTab === 'community'
                  ? 'bg-[#3b82f6] text-white shadow-md'
                  : 'text-[#94a3b8] hover:text-white'
              }`}
            >
              Community
            </button>
          </div>

          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-[11px] font-bold text-[#00d9d9] hover:underline flex items-center gap-1"
              >
                <CheckCheck className="w-3.5 h-3.5" /> Mark all read
              </button>
            )}
            {notifications.length > 0 && (
              <button
                onClick={clearAll}
                className="text-[11px] font-bold text-[#94a3b8] hover:text-red-400 flex items-center gap-1 transition-colors"
                title="Clear all notifications"
              >
                <Trash2 className="w-3.5 h-3.5" /> Clear
              </button>
            )}
          </div>
        </div>

        {/* Notifications Scrollable Feed */}
        <div className="p-4 space-y-2.5 overflow-y-auto flex-1 font-sans">
          {filtered.length === 0 ? (
            <div className="py-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[#94a3b8] mx-auto">
                <BellOff className="w-6 h-6" />
              </div>
              <b className="text-white block text-sm">No notifications in this category</b>
              <p className="text-xs text-[#94a3b8]">All safety channels are clear and up to date.</p>
            </div>
          ) : (
            filtered.map((item) => (
              <div
                key={item.id}
                className={`p-3.5 rounded-xl border transition-all relative ${
                  !item.read
                    ? 'bg-[#0e1b30] border-cyan-500/40 shadow-lg'
                    : 'bg-black/30 border-white/5 opacity-80 hover:opacity-100'
                }`}
              >
                <div className="flex items-start gap-3">
                  {/* Category Badge Icon */}
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${
                      item.category === 'gateway'
                        ? 'bg-emerald-500/15 text-[#22c55e]'
                        : item.category === 'safety'
                        ? 'bg-red-500/15 text-red-400'
                        : item.category === 'community'
                        ? 'bg-blue-500/15 text-[#3b82f6]'
                        : 'bg-cyan-500/15 text-[#00d9d9]'
                    }`}
                  >
                    {item.category === 'gateway' ? (
                      <Smartphone className="w-4 h-4" />
                    ) : item.category === 'safety' ? (
                      <ShieldAlert className="w-4 h-4" />
                    ) : item.category === 'community' ? (
                      <MapPin className="w-4 h-4" />
                    ) : (
                      <Radio className="w-4 h-4" />
                    )}
                  </div>

                  {/* Body Content */}
                  <div className="flex-1 pr-6">
                    <div className="flex items-center gap-2 mb-1">
                      <b className="text-xs font-bold text-white block leading-snug">
                        {item.title}
                      </b>
                      {!item.read && (
                        <span className="w-2 h-2 rounded-full bg-[#00d9d9] animate-ping" />
                      )}
                    </div>
                    <p className="text-xs text-[#cbd5e1] leading-relaxed mb-2">
                      {item.message}
                    </p>

                    <div className="flex items-center justify-between text-[10px] font-mono text-[#94a3b8]">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-[#00d9d9]" /> {item.timeAgo}
                      </span>
                      {item.targetAction && (
                        <span className="text-[#00d9d9] font-sans font-bold">
                          ✓ {item.targetAction}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Dismiss Action */}
                  <button
                    onClick={() => deleteNotification(item.id)}
                    className="absolute top-3.5 right-3 text-[#64748b] hover:text-red-400 transition-colors p-1"
                    title="Dismiss alert"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-white/10 bg-[#090d1a] flex items-center justify-between gap-3">
          <button
            onClick={addTestSafetyAlert}
            className="text-xs text-[#00d9d9] hover:underline font-bold flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#00d9d9]" /> Simulate Test Notification
          </button>
          <button
            onClick={onClose}
            className="secondary px-5 py-2 text-xs font-bold"
          >
            Close
          </button>
        </div>
      </motion.div>
    </div>
  )
}
