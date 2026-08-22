'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Phone, PhoneCall, ShieldAlert, X } from 'lucide-react'
import {
  EmergencyContact,
  INITIAL_EMERGENCY_CONTACTS,
  initiateCellularCall,
} from '@/constants/contacts'
import { DesktopCallFallbackModal } from '@/components/ui/DesktopCallFallbackModal'

interface EmergencyCallingModalProps {
  isOpen: boolean
  onClose: () => void
}

export const EmergencyCallingModal: React.FC<EmergencyCallingModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [fallbackContact, setFallbackContact] = useState<EmergencyContact | null>(null)

  if (!isOpen) return null

  const handleCall = (contact: EmergencyContact) => {
    initiateCellularCall(contact, (c) => setFallbackContact(c))
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-[#0f172a] border border-red-500/30 rounded-2xl p-6 max-w-md w-full shadow-2xl relative"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#94a3b8] hover:text-white"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-full bg-red-500/15 border border-red-500/30 flex items-center justify-center text-red-400">
            <PhoneCall className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-white">Emergency Calling Numbers</h2>
            <p className="text-xs text-[#94a3b8]">Choose a trusted contact to call</p>
          </div>
        </div>

        <div className="space-y-3 my-4 max-h-80 overflow-y-auto pr-1 font-sans">
          {INITIAL_EMERGENCY_CONTACTS.map((c) => (
            <div
              key={c.id}
              className="p-4 rounded-xl bg-black/40 border border-white/10 hover:border-red-500/40 transition-all flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-gradient-to-br from-red-600 to-red-900 border border-white/20 flex items-center justify-center text-xs font-extrabold text-white shadow-md">
                  {c.avatarInitials}
                </div>
                <div>
                  <b className="text-base font-extrabold text-white block">{c.name}</b>
                  <span className="text-xs text-red-200 font-mono font-bold block">{c.phone}</span>
                </div>
              </div>

              <button
                onClick={() => handleCall(c)}
                className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-extrabold text-xs shadow-lg transition-transform active:scale-95 flex items-center gap-1.5"
              >
                <Phone className="w-4 h-4" /> CALL
              </button>
            </div>
          ))}
        </div>

        <div className="pt-2 border-t border-white/10 text-center">
          <button onClick={onClose} className="secondary w-full text-xs font-bold py-2.5">
            Close
          </button>
        </div>

        <DesktopCallFallbackModal
          contact={fallbackContact}
          onClose={() => setFallbackContact(null)}
        />
      </motion.div>
    </div>
  )
}
