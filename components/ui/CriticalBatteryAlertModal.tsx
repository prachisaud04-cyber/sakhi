'use client'

import React from 'react'
import { motion } from 'framer-motion'
import {
  AlertTriangle,
  BatteryLow,
  CheckCircle2,
  ExternalLink,
  MapPin,
  MessageSquare,
  Phone,
  Radio,
  Send,
  ShieldAlert,
  Smartphone,
  X,
} from 'lucide-react'
import { CriticalBatteryAlertDetails } from '@/hooks/useCriticalBatteryAutoAlert'
import { INITIAL_EMERGENCY_CONTACTS } from '@/constants/contacts'

interface CriticalBatteryAlertModalProps {
  isOpen: boolean
  onClose: () => void
  details: CriticalBatteryAlertDetails | null
  onBroadcastSms: () => void
}

export const CriticalBatteryAlertModal: React.FC<CriticalBatteryAlertModalProps> = ({
  isOpen,
  onClose,
  details,
  onBroadcastSms,
}) => {
  if (!isOpen || !details) return null

  const handleWhatsAppBroadcast = () => {
    const encoded = encodeURIComponent(details.message)
    const primaryContact = INITIAL_EMERGENCY_CONTACTS[0].normalizedPhone
    window.open(`https://api.whatsapp.com/send?phone=${primaryContact}&text=${encoded}`, '_blank')
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 20 }}
        className="w-full max-w-md bg-[#0c1728] border-2 border-red-500/60 rounded-3xl p-6 shadow-2xl relative text-left font-sans"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-white/5 hover:bg-white/10 text-[#94a3b8] hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header with Battery Warning */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-red-500/20 border-2 border-red-500 flex items-center justify-center text-red-400 animate-pulse">
            <BatteryLow className="w-7 h-7" />
          </div>
          <div>
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-red-400 flex items-center gap-1">
              <Radio className="w-3 h-3 animate-ping" /> CRITICAL BATTERY PROTOCOL
            </span>
            <h3 className="text-lg font-extrabold text-white">
              Battery Reached {details.batteryLevel}% (Shutdown Guard)
            </h3>
          </div>
        </div>

        {/* Status Box */}
        <div className="p-3.5 rounded-2xl bg-red-950/40 border border-red-500/40 mb-4 space-y-2">
          <p className="text-xs text-red-200 leading-relaxed">
            Your device is critically low on power. SAKHI has automatically staged a low-battery emergency message containing your last known GPS coordinates to your emergency contacts before the device powers down.
          </p>

          <div className="bg-black/50 p-2.5 rounded-xl border border-white/10 text-xs font-mono text-cyan-300 flex items-start gap-2">
            <MapPin className="w-4 h-4 text-[#00d9d9] flex-shrink-0 mt-0.5" />
            <div>
              <span className="text-[10px] text-[#94a3b8] block">LAST KNOWN GPS:</span>
              <span>
                {details.location
                  ? `${details.location.lat.toFixed(5)}°, ${details.location.lng.toFixed(5)}°`
                  : '26.15200° N, 91.66400° E (Jalukbari Area)'}
              </span>
            </div>
          </div>
        </div>

        {/* Contacts Notified List */}
        <div className="mb-4 space-y-1.5">
          <small className="text-[10px] font-bold text-[#94a3b8] uppercase tracking-wider block">
            Contacts Queued For Notification (4 Guardians)
          </small>
          <div className="grid grid-cols-2 gap-1.5 text-[11px] font-sans">
            {INITIAL_EMERGENCY_CONTACTS.map((c) => (
              <div
                key={c.id}
                className="p-2 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between text-slate-300"
              >
                <div className="truncate">
                  <b className="text-white block truncate">{c.name}</b>
                  <small className="text-[9px] text-[#94a3b8]">{c.relation}</small>
                </div>
                <CheckCircle2 className="w-3.5 h-3.5 text-[#22c55e] flex-shrink-0 ml-1" />
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2">
          <button
            onClick={onBroadcastSms}
            className="primary w-full py-3 text-xs font-extrabold flex items-center justify-center gap-2 shadow-xl"
          >
            <Smartphone className="w-4 h-4" /> 1-Tap GSM Cellular SMS Broadcast
          </button>

          <button
            onClick={handleWhatsAppBroadcast}
            className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg transition-transform active:scale-95"
          >
            <MessageSquare className="w-4 h-4" /> Send WhatsApp SOS Notice
          </button>

          <button
            onClick={onClose}
            className="secondary w-full py-2 text-xs font-bold text-[#94a3b8]"
          >
            Acknowledge &amp; Dismiss
          </button>
        </div>
      </motion.div>
    </div>
  )
}
