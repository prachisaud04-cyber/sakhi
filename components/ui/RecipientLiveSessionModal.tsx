'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  Clock,
  Compass,
  ExternalLink,
  MapPin,
  Navigation,
  Phone,
  RefreshCw,
  ShieldAlert,
  ShieldCheck,
  Siren,
  X,
} from 'lucide-react'
import { useRecipientLiveSync } from '@/hooks/useRecipientLiveSync'
import { Map } from '@/components/ui/Map'

interface RecipientLiveSessionModalProps {
  token: string | null
  onClose: () => void
}

export const RecipientLiveSessionModal: React.FC<RecipientLiveSessionModalProps> = ({
  token,
  onClose,
}) => {
  const { session, isLiveConnected } = useRecipientLiveSync(token)
  const [secondsAgo, setSecondsAgo] = useState<number>(0)

  // Live timer for seconds ago
  useEffect(() => {
    if (!session?.lastUpdated) return
    const interval = setInterval(() => {
      const diff = Math.floor((Date.now() - session.lastUpdated) / 1000)
      setSecondsAgo(Math.max(0, diff))
    }, 1000)
    return () => clearInterval(interval)
  }, [session?.lastUpdated])

  if (!token) return null

  const getRemainingMinutes = () => {
    if (!session || !session.expirationTime) return null
    const diffMs = session.expirationTime - Date.now()
    return Math.max(0, Math.ceil(diffMs / 60000))
  }

  const isExpired = session?.expirationTime ? Date.now() > session.expirationTime : false
  const isSessionActive = session?.isSharing && !isExpired
  const isEmergency = session?.riskMode === 'critical' || session?.emergencyTriggered

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
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-[#00d9d9]" />
            <b className="text-xl font-extrabold text-white tracking-wide">SAKHI Live Location</b>
          </div>
          {isLiveConnected && (
            <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-[#22c55e] flex items-center gap-1 font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e] animate-ping" /> LIVE SYNC
            </span>
          )}
        </div>

        {isSessionActive && session?.location ? (
          <div className="space-y-4">
            {/* Emergency alert banner if critical */}
            {isEmergency && (
              <div className="p-3 bg-red-950/60 border border-red-500 rounded-xl flex items-center justify-between gap-2 text-red-300 text-xs font-bold">
                <span className="flex items-center gap-1.5">
                  <Siren className="w-4 h-4 text-red-400 animate-pulse" /> Emergency SOS Active
                </span>
                <a
                  href="tel:+918822717429"
                  className="px-3 py-1 rounded-lg bg-red-600 text-white font-extrabold text-xs"
                >
                  Call Now
                </a>
              </div>
            )}

            {/* Live Indicator Banner */}
            <div className="p-3 bg-emerald-950/40 border border-emerald-500/40 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#22c55e] animate-ping" />
                <b className="text-xs text-[#22c55e] uppercase tracking-wider font-extrabold">
                  STREAMING TELEMETRY
                </b>
              </div>
              <span className="text-[10px] font-mono text-[#94a3b8] bg-black/40 px-2 py-0.5 rounded border border-white/10">
                {session.sessionId}
              </span>
            </div>

            <p className="text-sm text-[#cbd5e1]">
              <strong className="text-white font-extrabold">{session.userName}</strong> is sharing her live location with you.
            </p>

            {/* Recipient Interactive Google Map View */}
            <div className="relative w-full rounded-2xl overflow-hidden shadow-2xl border border-cyan-500/30">
              <Map
                location={session.location}
                status="tracking"
                isTracking={true}
                danger={isEmergency}
                height="220px"
                showSafeZones={true}
              />
            </div>

            <div className="flex items-center justify-between text-xs font-sans">
              <Link
                href={`/live/${encodeURIComponent(session.sessionId)}`}
                className="text-[#00d9d9] hover:underline font-bold flex items-center gap-1"
                onClick={onClose}
              >
                <ExternalLink className="w-3.5 h-3.5" /> Open Fullscreen Command Page
              </Link>
              <span className="text-[11px] font-mono text-[#94a3b8]">
                Updated {secondsAgo}s ago
              </span>
            </div>

            {/* Session Expiration Telemetry */}
            <div className="grid grid-cols-2 gap-3 text-xs font-mono">
              <div className="p-3 bg-black/40 border border-white/10 rounded-xl">
                <small className="text-[#94a3b8] font-sans block text-[10px]">SHARING DURATION</small>
                <b className="text-white">
                  {session.durationMinutes > 0 ? `${session.durationMinutes} Minutes` : 'Until Stopped'}
                </b>
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

        <div className="pt-4 border-t border-white/10 mt-4 flex justify-between items-center">
          {session?.sessionId && (
            <Link
              href={`/live/${encodeURIComponent(session.sessionId)}`}
              className="text-xs text-[#00d9d9] font-bold hover:underline flex items-center gap-1"
              onClick={onClose}
            >
              <Navigation className="w-3.5 h-3.5" /> Full Command Page →
            </Link>
          )}
          <button onClick={onClose} className="secondary px-6 py-2 text-xs font-bold ml-auto">
            Close
          </button>
        </div>
      </motion.div>
    </div>
  )
}
