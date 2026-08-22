'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Check, Copy, ExternalLink, Phone, X } from 'lucide-react'
import { EmergencyContact } from '@/constants/contacts'

interface DesktopCallFallbackModalProps {
  contact: EmergencyContact | null
  onClose: () => void
}

export const DesktopCallFallbackModal: React.FC<DesktopCallFallbackModalProps> = ({
  contact,
  onClose,
}) => {
  const [copied, setCopied] = useState<boolean>(false)

  if (!contact) return null

  const handleCopy = () => {
    navigator.clipboard.writeText(contact.phone)
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  const handleForceOpenTel = () => {
    window.location.href = `tel:${contact.normalizedPhone}`
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-[#0f172a] border border-cyan-500/30 rounded-2xl p-6 max-w-md w-full shadow-2xl relative text-center"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#94a3b8] hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="w-16 h-16 rounded-full bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-[#00d9d9] mx-auto mb-3">
          <Phone className="w-8 h-8 animate-pulse" />
        </div>

        <b className="text-xl font-bold text-white block mb-1">Calling {contact.name}</b>
        <p className="text-xs text-[#94a3b8] mb-4">
          SAKHI triggered your device native telephone handler:
        </p>

        <div className="p-4 bg-black/40 border border-white/10 rounded-xl space-y-2 mb-6">
          <span className="text-2xl font-extrabold font-mono text-[#00d9d9] block">
            {contact.phone}
          </span>
          <small className="text-[11px] text-[#cbd5e1] block">
            If using a mobile phone, your native dialer will open automatically.
          </small>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleCopy}
            className="secondary flex-1 text-xs font-bold py-3 flex items-center justify-center gap-1.5"
          >
            {copied ? <Check className="w-4 h-4 text-[#22c55e]" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Copied to Clipboard' : 'Copy Number'}
          </button>
          <button
            onClick={handleForceOpenTel}
            className="primary flex-1 text-xs font-bold py-3 flex items-center justify-center gap-1.5"
          >
            <ExternalLink className="w-4 h-4" /> Open Dialer App
          </button>
        </div>
      </motion.div>
    </div>
  )
}
