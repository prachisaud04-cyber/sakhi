'use client'

import React from 'react'
import { motion } from 'framer-motion'
import {
  AlertTriangle,
  Hospital,
  LockKeyhole,
  MapPin,
  Mic,
  Navigation,
  PhoneCall,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Siren,
  Users,
  X,
} from 'lucide-react'
import { Screen } from '@/types'

interface QuickToolsModalProps {
  isOpen: boolean
  onClose: () => void
  go: (s: Screen) => void
  onOpenEmergencyCalling: () => void
  onOpenAudioRecorder: () => void
  toggleLocationSharing: () => void
  locationSharingEnabled: boolean
}

export const QuickToolsModal: React.FC<QuickToolsModalProps> = ({
  isOpen,
  onClose,
  go,
  onOpenEmergencyCalling,
  onOpenAudioRecorder,
  toggleLocationSharing,
  locationSharingEnabled,
}) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-[#0f172a] border border-cyan-500/30 rounded-2xl p-6 max-w-lg w-full shadow-2xl relative max-h-[85vh] overflow-y-auto"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#94a3b8] hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-4">
          <small className="eyebrow text-[#00d9d9] font-bold">SAKHI QUICK SAFETY SUITE</small>
          <h2 className="text-2xl font-extrabold text-white">All Safety Tools</h2>
          <p className="text-xs text-[#94a3b8]">Access priority safety utilities and features.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Share Location */}
          <button
            onClick={() => {
              toggleLocationSharing()
              onClose()
            }}
            className="p-4 rounded-xl bg-black/40 border border-white/10 hover:border-cyan-500/40 text-left transition-all group"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="p-2 rounded-lg bg-cyan-500/10 text-[#00d9d9]">
                <MapPin className="w-5 h-5" />
              </span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${locationSharingEnabled ? 'bg-emerald-500/15 text-[#22c55e]' : 'bg-amber-500/15 text-[#f59e0b]'}`}>
                {locationSharingEnabled ? 'ACTIVE' : 'OFF'}
              </span>
            </div>
            <b className="text-sm text-white block group-hover:text-[#00d9d9] transition-colors">
              Share Live Location
            </b>
            <small className="text-xs text-[#94a3b8] block mt-0.5">
              Stream encrypted GPS telemetry
            </small>
          </button>

          {/* Emergency Calling Numbers */}
          <button
            onClick={() => {
              onClose()
              onOpenEmergencyCalling()
            }}
            className="p-4 rounded-xl bg-black/40 border border-red-500/30 hover:border-red-500/60 text-left transition-all group"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="p-2 rounded-lg bg-red-500/15 text-red-400">
                <PhoneCall className="w-5 h-5" />
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-500/15 text-red-400">
                EMERGENCY
              </span>
            </div>
            <b className="text-sm text-white block group-hover:text-red-400 transition-colors">
              Emergency Calling Numbers
            </b>
            <small className="text-xs text-[#94a3b8] block mt-0.5">
              Call a trusted contact
            </small>
          </button>

          {/* Record Audio */}
          <button
            onClick={() => {
              onClose()
              onOpenAudioRecorder()
            }}
            className="p-4 rounded-xl bg-black/40 border border-white/10 hover:border-cyan-500/40 text-left transition-all group"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="p-2 rounded-lg bg-blue-500/10 text-[#3b82f6]">
                <Mic className="w-5 h-5" />
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/15 text-[#3b82f6]">
                AUDIO
              </span>
            </div>
            <b className="text-sm text-white block group-hover:text-[#3b82f6] transition-colors">
              Record Safety Audio
            </b>
            <small className="text-xs text-[#94a3b8] block mt-0.5">
              Secure ambient microphone audio log
            </small>
          </button>

          {/* Find Safe Zone */}
          <button
            onClick={() => {
              onClose()
              go('map')
            }}
            className="p-4 rounded-xl bg-black/40 border border-white/10 hover:border-cyan-500/40 text-left transition-all group"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="p-2 rounded-lg bg-emerald-500/10 text-[#22c55e]">
                <Hospital className="w-5 h-5" />
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-[#22c55e]">
                MAP
              </span>
            </div>
            <b className="text-sm text-white block group-hover:text-[#22c55e] transition-colors">
              Find Safe Zone
            </b>
            <small className="text-xs text-[#94a3b8] block mt-0.5">
              Locate nearby hospitals &amp; police stations
            </small>
          </button>

          {/* Manage Emergency Contacts */}
          <button
            onClick={() => {
              onClose()
              go('profile')
            }}
            className="p-4 rounded-xl bg-black/40 border border-white/10 hover:border-cyan-500/40 text-left transition-all group"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="p-2 rounded-lg bg-cyan-500/10 text-[#00d9d9]">
                <Users className="w-5 h-5" />
              </span>
            </div>
            <b className="text-sm text-white block group-hover:text-[#00d9d9] transition-colors">
              Emergency Contacts
            </b>
            <small className="text-xs text-[#94a3b8] block mt-0.5">
              Manage 4 active emergency contacts
            </small>
          </button>

          {/* Privacy Capsule */}
          <button
            onClick={() => {
              onClose()
              go('privacy')
            }}
            className="p-4 rounded-xl bg-black/40 border border-white/10 hover:border-cyan-500/40 text-left transition-all group"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="p-2 rounded-lg bg-cyan-500/10 text-[#00d9d9]">
                <LockKeyhole className="w-5 h-5" />
              </span>
            </div>
            <b className="text-sm text-white block group-hover:text-[#00d9d9] transition-colors">
              Privacy Settings
            </b>
            <small className="text-xs text-[#94a3b8] block mt-0.5">
              Review 6-step encryption capsule
            </small>
          </button>
        </div>
      </motion.div>
    </div>
  )
}
