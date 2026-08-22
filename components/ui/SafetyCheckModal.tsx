'use client'

import React from 'react'
import { motion } from 'framer-motion'
import {
  Activity,
  AlertTriangle,
  Check,
  Clock,
  FastForward,
  HeartPulse,
  MapPin,
  ShieldAlert,
  ShieldCheck,
  Siren,
  Sparkles,
  X,
  Zap,
} from 'lucide-react'
import { VitalsSnapshot } from '@/hooks/useSafetyCheckAutoEscalation'

interface SafetyCheckModalProps {
  isOpen: boolean
  remainingSeconds: number
  formattedTime: string
  triggerReason: string
  vitalsSnapshot: VitalsSnapshot | null
  onConfirmSafe: () => void
  onTriggerNeedHelp: () => void
  onFastForwardTimer?: () => void
}

export const SafetyCheckModal: React.FC<SafetyCheckModalProps> = ({
  isOpen,
  remainingSeconds,
  formattedTime,
  triggerReason,
  vitalsSnapshot,
  onConfirmSafe,
  onTriggerNeedHelp,
  onFastForwardTimer,
}) => {
  if (!isOpen) return null

  const isUrgent = remainingSeconds <= 60 // Last 60 seconds

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 20 }}
        className="w-full max-w-md bg-[#0c1728] border-2 border-amber-500/60 rounded-3xl p-6 shadow-2xl relative text-left font-sans"
      >
        {/* Top Close Button */}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            onConfirmSafe()
          }}
          className="absolute top-4 right-4 p-2 rounded-full bg-white/5 hover:bg-white/10 text-[#94a3b8] hover:text-white transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Badge */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-amber-400 animate-ping" />
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-amber-400 flex items-center gap-1 font-mono">
              <Sparkles className="w-3.5 h-3.5" /> SAKHI IN-TRANSIT SAFETY VERIFICATION
            </span>
          </div>
        </div>

        {/* Main Title */}
        <h2 className="text-2xl font-extrabold text-white mb-1">
          Are you safe?
        </h2>
        <p className="text-xs text-amber-200/90 mb-4 leading-relaxed">
          {triggerReason}
        </p>

        {/* 10-Minute Countdown Clock HUD */}
        <div
          className={`p-4 rounded-2xl border mb-4 flex items-center justify-between transition-colors ${
            isUrgent
              ? 'bg-red-950/60 border-red-500 text-red-200'
              : 'bg-amber-950/40 border-amber-500/50 text-amber-200'
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`w-12 h-12 rounded-2xl border-2 flex items-center justify-center font-mono font-extrabold text-base shadow-inner ${
                isUrgent
                  ? 'border-red-400 bg-red-500/20 text-red-300 animate-pulse'
                  : 'border-amber-400 bg-amber-500/20 text-amber-300'
              }`}
            >
              {formattedTime}
            </div>
            <div>
              <b className="text-xs text-white block">Auto-Dispatch Countdown</b>
              <small className="text-[11px] text-[#cbd5e1] block">
                Broadcasting to 4 guardians if unanswered
              </small>
            </div>
          </div>
          <Clock className="w-5 h-5 text-amber-400 animate-spin" />
        </div>

        {/* Snapshot Vitals Readout */}
        {vitalsSnapshot && (
          <div className="p-3 rounded-xl bg-black/50 border border-white/10 mb-4 grid grid-cols-3 gap-2 text-center text-xs font-mono text-[#cbd5e1]">
            <div className="bg-[#0f172a] p-2 rounded-lg">
              <span className="text-[#94a3b8] text-[9px] block font-sans">Heart Rate</span>
              <b className="text-red-400 flex items-center justify-center gap-1">
                <HeartPulse className="w-3.5 h-3.5 animate-pulse" />
                {vitalsSnapshot.heartRate ? `${vitalsSnapshot.heartRate} bpm` : '124 bpm'}
              </b>
            </div>
            <div className="bg-[#0f172a] p-2 rounded-lg">
              <span className="text-[#94a3b8] text-[9px] block font-sans">Blood Pressure</span>
              <b className="text-amber-300">
                {vitalsSnapshot.bloodPressureSystolic
                  ? `${vitalsSnapshot.bloodPressureSystolic}/${vitalsSnapshot.bloodPressureDiastolic}`
                  : '142/92'}
              </b>
            </div>
            <div className="bg-[#0f172a] p-2 rounded-lg">
              <span className="text-[#94a3b8] text-[9px] block font-sans">G-Force Motion</span>
              <b className="text-cyan-400">{vitalsSnapshot.gForce} G</b>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-2.5">
          {/* YES, I AM SAFE (Everything is normal) */}
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              onConfirmSafe()
            }}
            className="w-full py-3.5 rounded-2xl bg-[#22c55e] hover:bg-emerald-400 text-[#050914] font-extrabold text-sm flex items-center justify-center gap-2 shadow-xl shadow-emerald-500/20 transition-transform active:scale-95 cursor-pointer"
          >
            <Check className="w-5 h-5 stroke-[3]" /> Yes, I Am Safe (Everything is Normal)
          </button>

          {/* NO, I NEED HELP (Take Actions Immediately) */}
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              onTriggerNeedHelp()
            }}
            className="w-full py-3.5 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-xl shadow-red-600/30 transition-transform active:scale-95 cursor-pointer"
          >
            <Siren className="w-5 h-5" /> No, I Need Help (Instant Emergency SOS)
          </button>
        </div>

        {/* Optional Fast-Forward for Demo / Testing */}
        {onFastForwardTimer && (
          <div className="mt-3 pt-2 text-center">
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                onFastForwardTimer()
              }}
              className="text-[11px] text-[#94a3b8] hover:text-[#00d9d9] font-mono flex items-center justify-center gap-1 mx-auto transition-colors cursor-pointer"
            >
              <FastForward className="w-3 h-3" /> Fast-forward timer to 5s (Test 10-Min Auto-Dispatch)
            </button>
          </div>
        )}
      </motion.div>
    </div>
  )
}
