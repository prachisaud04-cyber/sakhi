'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Check,
  CheckCircle2,
  Clock,
  Copy,
  ExternalLink,
  MapPin,
  Navigation,
  Send,
  ShieldCheck,
  Users,
  X,
} from 'lucide-react'
import { GPSLocation } from '@/types'
import { INITIAL_EMERGENCY_CONTACTS } from '@/constants/contacts'
import { LiveSharingSession } from '@/hooks/useLiveLocationSession'

interface ShareLiveLocationModalProps {
  isOpen: boolean
  onClose: () => void
  location: GPSLocation | null
  activeSession: LiveSharingSession | null
  onStartSharing: (
    recipients: string[],
    durationMinutes: number,
    phones?: string[]
  ) => LiveSharingSession
  onStopSharing: () => void
}

export const ShareLiveLocationModal: React.FC<ShareLiveLocationModalProps> = ({
  isOpen,
  onClose,
  location,
  activeSession,
  onStartSharing,
  onStopSharing,
}) => {
  const [selectedContacts, setSelectedContacts] = useState<string[]>(['c1', 'c2'])
  const [durationMinutes, setDurationMinutes] = useState<number>(30)
  const [deliveryStatus, setDeliveryStatus] = useState<string | null>(null)
  const [copiedLink, setCopiedLink] = useState<boolean>(false)

  if (!isOpen) return null

  const toggleContact = (id: string) => {
    setSelectedContacts((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    )
  }

  const handleStartSharingWhatsApp = () => {
    if (selectedContacts.length === 0) return

    const selectedObj = INITIAL_EMERGENCY_CONTACTS.filter((c) =>
      selectedContacts.includes(c.id)
    )
    const selectedNames = selectedObj.map((c) => c.name)
    const selectedPhones = selectedObj.map((c) => c.normalizedPhone)

    // 1. Start real live location session
    const newSession = onStartSharing(selectedNames, durationMinutes, selectedPhones)

    // 2. Build secure temporary recipient link
    const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'
    const liveLink = `${origin}/#live-session?token=${newSession.sessionId}`

    // 3. Compose WhatsApp message
    const durationLabel = durationMinutes > 0 ? `${durationMinutes} minutes` : 'Until I stop'
    const waText = `🚨 SAKHI Live Location\n\nI am sharing my live location with you.\n\n📍 View my live location:\n${liveLink}\n\n⏱ Sharing for ${durationLabel}.\n\nPlease open the link to see my current location.`

    setDeliveryStatus('Opening WhatsApp...')

    setTimeout(() => {
      // If single contact selected, open direct WhatsApp chat, else general share
      if (selectedPhones.length === 1) {
        const phoneClean = selectedPhones[0].replace('+', '')
        window.open(
          `https://api.whatsapp.com/send?phone=${phoneClean}&text=${encodeURIComponent(waText)}`,
          '_blank'
        )
      } else {
        window.open(
          `https://api.whatsapp.com/send?text=${encodeURIComponent(waText)}`,
          '_blank'
        )
      }
      setDeliveryStatus('WhatsApp launched! Press Send in WhatsApp to share.')
      setTimeout(() => setDeliveryStatus(null), 4000)
    }, 600)
  }

  const shareableUrl = activeSession
    ? `${typeof window !== 'undefined' ? window.location.origin : ''}/#live-session?token=${activeSession.sessionId}`
    : ''

  const handleCopyLink = () => {
    if (shareableUrl) {
      navigator.clipboard.writeText(shareableUrl)
      setCopiedLink(true)
      setTimeout(() => setCopiedLink(false), 2500)
    }
  }

  const getRemainingMinutes = () => {
    if (!activeSession || !activeSession.expirationTime) return null
    const diffMs = activeSession.expirationTime - Date.now()
    return Math.max(0, Math.ceil(diffMs / 60000))
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-[#0f172a] border border-cyan-500/30 rounded-2xl p-6 max-w-md w-full shadow-2xl relative"
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-[#94a3b8] hover:text-white">
          <X className="w-5 h-5" />
        </button>

        <b className="text-xl font-bold text-white flex items-center gap-2 mb-1">
          <Navigation className="w-6 h-6 text-[#00d9d9]" /> Share Live Location
        </b>
        <p className="text-xs text-[#94a3b8] mb-4">
          Stream continuous encrypted GPS telemetry to your trusted emergency contacts via WhatsApp.
        </p>

        {activeSession ? (
          /* Active Live Location Session Panel */
          <div className="space-y-4 font-sans">
            <div className="p-4 bg-emerald-950/30 border border-emerald-500/30 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#22c55e] flex items-center gap-1.5 uppercase">
                  <span className="w-2 h-2 rounded-full bg-[#22c55e] animate-ping" /> LIVE LOCATION ACTIVE
                </span>
                <span className="text-[10px] font-mono text-[#94a3b8] bg-black/40 px-2 py-0.5 rounded border border-white/10">
                  {activeSession.sessionId}
                </span>
              </div>
              <small className="text-xs text-[#cbd5e1] block">
                Sharing with <strong>{activeSession.recipients.join(', ')}</strong>
              </small>
              <div className="text-xs font-mono text-[#94a3b8] flex items-center justify-between pt-1 border-t border-white/10">
                <span>
                  {location
                    ? `GPS: ${location.lat.toFixed(4)}°, ${location.lng.toFixed(4)}° (±${Math.round(location.accuracy || 12)} m)`
                    : 'GPS Active (±12 m)'}
                </span>
                <span>
                  {getRemainingMinutes() !== null
                    ? `Expires in ${getRemainingMinutes()}m`
                    : 'Until stopped'}
                </span>
              </div>
            </div>

            {/* Shareable Link Box */}
            <div className="p-3 bg-black/40 border border-white/10 rounded-xl space-y-1.5">
              <small className="text-[10px] font-bold text-[#00d9d9] uppercase tracking-wider block">
                Recipient Emergency Web Link
              </small>
              <div className="flex items-center gap-2 font-mono text-xs text-[#cbd5e1] overflow-x-auto p-2 bg-[#050914] rounded-lg border border-white/5">
                <span className="truncate flex-1">{shareableUrl}</span>
                <button
                  onClick={handleCopyLink}
                  className="px-2.5 py-1 rounded bg-[#00d9d9] text-[#050914] font-bold text-[11px] hover:bg-cyan-300 transition-colors flex items-center gap-1"
                >
                  {copiedLink ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  {copiedLink ? 'Copied' : 'Copy'}
                </button>
              </div>
            </div>

            <button
              onClick={() => {
                onStopSharing()
                onClose()
              }}
              className="px-4 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-extrabold text-xs w-full shadow-lg transition-colors flex items-center justify-center gap-1.5"
            >
              Stop Live Location Session
            </button>
          </div>
        ) : (
          /* Configure Live Location Session Form */
          <div className="space-y-4 font-sans">
            {deliveryStatus && (
              <div className="p-3 bg-cyan-950/40 border border-cyan-500/30 rounded-xl text-cyan-300 text-xs font-semibold flex items-center gap-2">
                <Send className="w-4 h-4 text-[#00d9d9] flex-shrink-0 animate-bounce" />
                <span>{deliveryStatus}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-[#94a3b8] uppercase mb-2">
                Choose Trusted Contacts
              </label>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {INITIAL_EMERGENCY_CONTACTS.map((c) => (
                  <div
                    key={c.id}
                    onClick={() => toggleContact(c.id)}
                    className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                      selectedContacts.includes(c.id)
                        ? 'bg-cyan-950/30 border-[#00d9d9] text-white'
                        : 'bg-black/30 border-white/10 text-[#94a3b8] hover:bg-black/50'
                    }`}
                  >
                    <div>
                      <b className="text-xs text-white block">{c.name}</b>
                      <small className="text-[10px] text-[#94a3b8]">
                        {c.phone}
                      </small>
                    </div>
                    <div
                      className={`w-5 h-5 rounded-md border flex items-center justify-center ${
                        selectedContacts.includes(c.id)
                          ? 'bg-[#00d9d9] border-[#00d9d9] text-[#050914]'
                          : 'border-white/20'
                      }`}
                    >
                      {selectedContacts.includes(c.id) && <Check className="w-3.5 h-3.5" />}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#94a3b8] uppercase mb-2">
                Share Duration
              </label>
              <div className="grid grid-cols-4 gap-2 font-sans text-xs">
                {[15, 30, 60, 0].map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setDurationMinutes(m)}
                    className={`py-2 rounded-xl font-bold border transition-colors ${
                      durationMinutes === m
                        ? 'bg-[#00d9d9] text-[#050914] border-[#00d9d9]'
                        : 'bg-white/5 border-white/10 text-[#94a3b8] hover:text-white'
                    }`}
                  >
                    {m === 0 ? 'Until Stop' : `${m}m`}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button onClick={onClose} className="secondary flex-1 text-sm font-bold">
                Cancel
              </button>
              <button
                onClick={handleStartSharingWhatsApp}
                disabled={selectedContacts.length === 0}
                className="primary flex-1 text-xs font-extrabold flex items-center justify-center gap-1.5 disabled:opacity-50 py-3 shadow-lg"
              >
                <Navigation className="w-4 h-4" /> START LIVE LOCATION &amp; WHATSAPP
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  )
}
