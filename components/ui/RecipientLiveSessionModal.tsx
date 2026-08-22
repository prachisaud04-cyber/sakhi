'use client'

import React, { useEffect, useState } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import {
  Clock,
  Compass,
  MapPin,
  Navigation,
  RefreshCw,
  ShieldAlert,
  X,
} from 'lucide-react'
import { LiveSharingSession } from '@/hooks/useLiveLocationSession'

interface RecipientLiveSessionModalProps {
  token: string | null
  onClose: () => void
}

export const RecipientLiveSessionModal: React.FC<RecipientLiveSessionModalProps> = ({
  token,
  onClose,
}) => {
  const [session, setSession] = useState<LiveSharingSession | null>(null)
  const [secondsAgo, setSecondsAgo] = useState<number>(0)

  useEffect(() => {
    if (!token) return

    const loadSession = () => {
      try {
        const stored = localStorage.getItem('sakhi_active_live_session')
        if (stored) {
          const parsed = JSON.parse(stored) as LiveSharingSession
          if (parsed.sessionId === token || token.includes(parsed.sessionId)) {
            setSession(parsed)
          } else {
            setSession(null)
          }
        } else {
          setSession(null)
        }
      } catch (e) {
        console.warn('Error reading session token', e)
        setSession(null)
      }
    }

    loadSession()
    const interval = setInterval(loadSession, 3000)
    return () => clearInterval(interval)
  }, [token])

  // Seconds ago calculation
  useEffect(() => {
    if (!session) return
    const interval = setInterval(() => {
      if (session.lastUpdated) {
        const diff = Math.floor((Date.now() - session.lastUpdated) / 1000)
        setSecondsAgo(Math.max(0, diff))
      }
    }, 1000)
    return () => clearInterval(interval)
  }, [session])

  if (!token) return null

  const getRemainingMinutes = () => {
    if (!session || !session.expirationTime) return null
    const diffMs = session.expirationTime - Date.now()
    return Math.max(0, Math.ceil(diffMs / 60000))
  }

  const isExpired = session?.expirationTime ? Date.now() > session.expirationTime : false
  const isSessionActive = session?.isSharing && !isExpired

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-[#0f172a] border border-cyan-500/40 rounded-2xl p-6 max-w-lg w-full shadow-2xl relative overflow-hidden"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#94a3b8] hover:text-white"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Branding */}
        <div className="flex items-center gap-2 mb-3">
          <Image src="/sakhi-logo.png" alt="SAKHI" width={64} height={40} className="h-10 w-16 object-contain" />
          <b className="text-xl font-extrabold text-white tracking-wide">SAKHI Live Location</b>
        </div>

        {isSessionActive && session?.location ? (
          <div className="space-y-4">
            {/* Live Indicator Banner */}
            <div className="p-3 bg-emerald-950/40 border border-emerald-500/40 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#22c55e] animate-ping" />
                <b className="text-xs text-[#22c55e] uppercase tracking-wider font-extrabold">
                  🟢 LIVE LOCATION STREAMING
                </b>
              </div>
              <span className="text-[10px] font-mono text-[#94a3b8] bg-black/40 px-2 py-0.5 rounded border border-white/10">
                {session.sessionId}
              </span>
            </div>

            <p className="text-sm text-[#cbd5e1]">
              <strong className="text-white font-extrabold">Riya Sharma</strong> is sharing her live location with you.
            </p>

            {/* Recipient Interactive Map View */}
            <div className="relative w-full h-56 rounded-2xl bg-[#050914] border border-cyan-500/30 overflow-hidden flex items-center justify-center shadow-inner">
              {/* Animated Radar Pulse */}
              <div className="absolute inset-0 flex items-center justify-center opacity-30 pointer-events-none">
                <div className="w-48 h-48 rounded-full border border-[#00d9d9] animate-ping" />
                <div className="w-32 h-32 rounded-full border border-cyan-400 opacity-60" />
              </div>

              <div className="relative z-10 text-center space-y-1">
                <div className="w-12 h-12 rounded-full bg-[#00d9d9]/20 border-2 border-[#00d9d9] flex items-center justify-center text-[#00d9d9] mx-auto shadow-lg shadow-cyan-500/30">
                  <MapPin className="w-6 h-6 animate-bounce" />
                </div>
                <b className="text-sm font-extrabold text-white block">
                  {session.location.lat.toFixed(4)}°, {session.location.lng.toFixed(4)}°
                </b>
                <small className="text-xs text-[#00d9d9] font-mono block">
                  Accuracy ±{Math.round(session.location.accuracy || 12)} m
                </small>
              </div>

              {/* Map Footer Bar */}
              <div className="absolute bottom-2 left-2 right-2 p-2 bg-black/60 backdrop-blur-sm rounded-xl border border-white/10 text-[11px] text-[#cbd5e1] flex items-center justify-between font-mono">
                <span className="flex items-center gap-1">
                  <Compass className="w-3.5 h-3.5 text-[#00d9d9]" /> Continuous GPS
                </span>
                <span>Updated {secondsAgo}s ago</span>
              </div>
            </div>

            {/* Session Expiration Telemetry */}
            <div className="grid grid-cols-2 gap-3 text-xs font-mono">
              <div className="p-3 bg-black/40 border border-white/10 rounded-xl">
                <small className="text-[#94a3b8] font-sans block text-[10px]">SHARING DURATION</small>
                <b className="text-white">{session.durationMinutes > 0 ? `${session.durationMinutes} Minutes` : 'Until Stopped'}</b>
              </div>

              <div className="p-3 bg-black/40 border border-white/10 rounded-xl">
                <small className="text-[#94a3b8] font-sans block text-[10px]">SESSION EXPIRES IN</small>
                <b className="text-[#00d9d9]">
                  {getRemainingMinutes() !== null ? `${getRemainingMinutes()} Minutes` : 'Active'}
                </b>
              </div>
            </div>
          </div>
        ) : (
          /* Ended / Expired Session State */
          <div className="p-6 bg-black/40 border border-red-500/30 rounded-2xl text-center space-y-3 my-2">
            <div className="w-14 h-14 rounded-full bg-red-500/15 border border-red-500/30 flex items-center justify-center text-red-400 mx-auto">
              <ShieldAlert className="w-8 h-8" />
            </div>
            <b className="text-lg font-extrabold text-white block">Live Location Ended</b>
            <p className="text-xs text-[#94a3b8]">
              This location-sharing session is no longer active or has automatically expired.
            </p>
          </div>
        )}

        <div className="pt-4 border-t border-white/10 mt-4 flex justify-end">
          <button onClick={onClose} className="secondary px-6 py-2 text-xs font-bold">
            Close Recipient Map
          </button>
        </div>
      </motion.div>
    </div>
  )
}
