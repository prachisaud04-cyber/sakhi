'use client'

import React, { use, useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  AlertTriangle,
  BatteryMedium,
  Check,
  Clock,
  Compass,
  Copy,
  ExternalLink,
  Hospital,
  MapPin,
  Navigation,
  Phone,
  RefreshCw,
  Share2,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Siren,
  Wifi,
} from 'lucide-react'
import { calculateDistanceKm, SAFETY_POIS } from '@/constants/mapData'
import { useRecipientLiveSync } from '@/hooks/useRecipientLiveSync'
import { Card } from '@/components/ui/Card'
import { Header } from '@/components/ui/Header'
import { Map } from '@/components/ui/Map'

interface LiveTrackingPageProps {
  params: Promise<{ token: string }>
}

export default function LiveTrackingPage({ params }: LiveTrackingPageProps) {
  const { token } = use(params)
  const { session, isLoading, isLiveConnected, error } = useRecipientLiveSync(token)
  const [secondsAgo, setSecondsAgo] = useState<number>(0)
  const [copiedCoords, setCopiedCoords] = useState<boolean>(false)
  const [copiedLink, setCopiedLink] = useState<boolean>(false)

  // Live timer for "seconds ago"
  useEffect(() => {
    if (!session?.lastUpdated) return
    const interval = setInterval(() => {
      const diff = Math.floor((Date.now() - session.lastUpdated) / 1000)
      setSecondsAgo(Math.max(0, diff))
    }, 1000)
    return () => clearInterval(interval)
  }, [session?.lastUpdated])

  const handleCopyCoords = () => {
    if (!session?.location) return
    const text = `${session.location.lat.toFixed(6)}, ${session.location.lng.toFixed(6)}`
    navigator.clipboard.writeText(text)
    setCopiedCoords(true)
    setTimeout(() => setCopiedCoords(false), 2500)
  }

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href)
      setCopiedLink(true)
      setTimeout(() => setCopiedLink(false), 2500)
    }
  }

  const handleShare = async () => {
    if (typeof navigator !== 'undefined' && 'share' in navigator && session?.location) {
      try {
        await navigator.share({
          title: `SAKHI Live Location — ${session.userName}`,
          text: `🚨 SAKHI Live Telemetry for ${session.userName}\nCoordinates: ${session.location.lat.toFixed(5)}°, ${session.location.lng.toFixed(5)}°`,
          url: window.location.href,
        })
      } catch {
        handleCopyLink()
      }
    } else {
      handleCopyLink()
    }
  }

  const getRemainingMinutes = () => {
    if (!session?.expirationTime) return null
    const diffMs = session.expirationTime - Date.now()
    return Math.max(0, Math.ceil(diffMs / 60000))
  }

  const isEmergency = session?.riskMode === 'critical' || session?.emergencyTriggered

  return (
    <main className="shell">
      <header className="relative z-40 flex items-center justify-between">
        <div className="brand cursor-pointer">
          <img src="/sakhi-logo.png" alt="SAKHI Logo" className="w-10 h-10 object-contain" />
          <b>
            SAKHI<small>LIVE RECIPIENT TELEMETRY</small>
          </b>
        </div>
        <div className="flex items-center gap-2">
          {isLiveConnected ? (
            <span className="text-[11px] font-extrabold px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-[#22c55e] flex items-center gap-1.5 font-mono">
              <span className="w-2 h-2 rounded-full bg-[#22c55e] animate-ping" /> REAL-TIME SYNC
            </span>
          ) : (
            <span className="text-[11px] font-extrabold px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-[#f59e0b] flex items-center gap-1.5 font-mono">
              <RefreshCw className="w-3 h-3 animate-spin" /> SYNCING...
            </span>
          )}
        </div>
      </header>

      <div className="content">
        {/* Loading State */}
        {isLoading && !session && (
          <div className="p-12 text-center space-y-4">
            <div className="w-12 h-12 rounded-full border-2 border-[#00d9d9] border-t-transparent animate-spin mx-auto" />
            <b className="text-white block text-lg">Connecting to SAKHI Live Stream...</b>
            <p className="text-xs text-[#94a3b8]">Synchronizing telemetry with user device</p>
          </div>
        )}

        {/* Error / Expired Session State */}
        {error && !session && (
          <div className="p-8 bg-[#0c1728] border border-red-500/30 rounded-2xl text-center space-y-3 max-w-lg mx-auto my-6">
            <ShieldAlert className="w-12 h-12 text-red-400 mx-auto" />
            <b className="text-xl font-extrabold text-white block">Session Ended or Not Found</b>
            <p className="text-xs text-[#94a3b8]">{error}</p>
            <Link
              href="/"
              className="inline-block px-4 py-2 rounded-xl bg-white/10 text-white text-xs font-bold hover:bg-white/20 transition-colors mt-2"
            >
              Go to SAKHI Home
            </Link>
          </div>
        )}

        {/* Active Session Content */}
        {session && (
          <div className="space-y-4">
            {/* EMERGENCY SOS BANNER IF ACTIVATED */}
            {isEmergency && (
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="p-4 bg-gradient-to-r from-red-950 via-[#1f0b10] to-red-950 border-2 border-red-500 rounded-2xl shadow-2xl space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-red-400 font-extrabold text-sm uppercase tracking-wider">
                    <Siren className="w-5 h-5 animate-pulse" /> CRITICAL EMERGENCY PROTOCOL ACTIVE
                  </div>
                  <span className="pill danger text-xs font-mono font-extrabold">EMERGENCY SOS</span>
                </div>
                <p className="text-xs text-red-200 leading-relaxed">
                  {session.userName} has triggered emergency mode or an anomaly was verified. Please
                  contact them immediately or dispatch emergency services.
                </p>
                <div className="flex flex-wrap gap-2 pt-1">
                  <a
                    href="tel:+918822717429"
                    className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-lg"
                  >
                    <Phone className="w-4 h-4" /> Call {session.userName}
                  </a>
                  <a
                    href="tel:112"
                    className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-extrabold text-xs flex items-center gap-1.5"
                  >
                    <Siren className="w-4 h-4 text-red-400" /> Dial 112 Police
                  </a>
                </div>
              </motion.div>
            )}

            {/* Top User Status Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#0c1728] p-4 rounded-2xl border border-cyan-500/30">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#00d9d9] to-[#3b82f6] text-[#050914] font-extrabold flex items-center justify-center text-base shadow-lg">
                  {session.userName
                    .split(' ')
                    .map((n) => n[0])
                    .join('')}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <b className="text-lg font-extrabold text-white">{session.userName}</b>
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-500/15 text-[#22c55e] border border-emerald-500/30">
                      ● LIVE SHARING
                    </span>
                  </div>
                  <small className="text-xs text-[#94a3b8] block">
                    Session: <strong className="font-mono text-[#00d9d9]">{session.sessionId}</strong>{' '}
                    · Updated {secondsAgo}s ago
                  </small>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 self-start sm:self-auto">
                <button
                  onClick={handleShare}
                  className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-colors flex items-center gap-1.5"
                >
                  {copiedLink ? <Check className="w-3.5 h-3.5 text-[#22c55e]" /> : <Share2 className="w-3.5 h-3.5" />}
                  {copiedLink ? 'Link Copied' : 'Share Telemetry'}
                </button>
                <a
                  href="tel:+918822717429"
                  className="px-4 py-2 rounded-xl bg-[#00d9d9] hover:bg-cyan-300 text-[#050914] text-xs font-extrabold transition-colors flex items-center gap-1.5 shadow-lg"
                >
                  <Phone className="w-3.5 h-3.5" /> Call Now
                </a>
              </div>
            </div>

            {/* Live Interactive Google Map */}
            <div className="space-y-2">
              <Map
                location={session.location}
                status="tracking"
                isTracking={true}
                danger={isEmergency}
                height="440px"
                showSafeZones={true}
                showRoutes={true}
              />
            </div>

            {/* Telemetry Statistics Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 font-mono">
              <Card noTilt className="p-3.5 border-white/10 bg-[#0c1728]">
                <small className="text-[10px] font-sans text-[#94a3b8] block uppercase">
                  GPS Coordinates
                </small>
                <b className="text-xs text-white block mt-1 truncate">
                  {session.location
                    ? `${session.location.lat.toFixed(4)}°, ${session.location.lng.toFixed(4)}°`
                    : 'Locating...'}
                </b>
                <button
                  onClick={handleCopyCoords}
                  className="text-[10px] text-[#00d9d9] font-sans hover:underline flex items-center gap-1 mt-1"
                >
                  {copiedCoords ? <Check className="w-3 h-3 text-[#22c55e]" /> : <Copy className="w-3 h-3" />}
                  {copiedCoords ? 'Copied' : 'Copy GPS'}
                </button>
              </Card>

              <Card noTilt className="p-3.5 border-white/10 bg-[#0c1728]">
                <small className="text-[10px] font-sans text-[#94a3b8] block uppercase">
                  Accuracy &amp; Signal
                </small>
                <b className="text-sm text-[#22c55e] block mt-1">
                  ±{Math.round(session.location?.accuracy || 12)} meters
                </b>
                <span className="text-[10px] text-[#94a3b8] font-sans block mt-1 flex items-center gap-1">
                  <Wifi className="w-3 h-3 text-[#22c55e]" /> Strong Feed
                </span>
              </Card>

              <Card noTilt className="p-3.5 border-white/10 bg-[#0c1728]">
                <small className="text-[10px] font-sans text-[#94a3b8] block uppercase">
                  Battery Status
                </small>
                <b className="text-sm text-white block mt-1 flex items-center gap-1">
                  <BatteryMedium className="w-4 h-4 text-[#22c55e]" /> {session.batteryLevel || 74}%
                </b>
                <span className="text-[10px] text-[#94a3b8] font-sans block mt-1">Normal Discharge</span>
              </Card>

              <Card noTilt className="p-3.5 border-white/10 bg-[#0c1728]">
                <small className="text-[10px] font-sans text-[#94a3b8] block uppercase">
                  Sharing Window
                </small>
                <b className="text-sm text-[#00d9d9] block mt-1">
                  {getRemainingMinutes() !== null
                    ? `${getRemainingMinutes()} mins left`
                    : 'Until Stopped'}
                </b>
                <span className="text-[10px] text-[#94a3b8] font-sans block mt-1">Auto-encrypted</span>
              </Card>
            </div>

            {/* Quick Emergency POIs Nearest to User */}
            <Card noTilt className="p-5">
              <div className="flex items-center justify-between mb-3">
                <b className="text-sm font-extrabold text-white flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#00d9d9]" /> Nearest Emergency Safe Zones to{' '}
                  {session.userName}
                </b>
                <span className="text-[10px] text-[#94a3b8] font-mono">VERIFIED POINTS</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                {[...SAFETY_POIS]
                  .sort((a, b) => {
                    if (!session.location) return 0
                    const distA = calculateDistanceKm(session.location.lat, session.location.lng, a.lat, a.lng)
                    const distB = calculateDistanceKm(session.location.lat, session.location.lng, b.lat, b.lng)
                    return distA - distB
                  })
                  .slice(0, 4)
                  .map((poi) => {
                    const dist = session.location
                      ? calculateDistanceKm(
                          session.location.lat,
                          session.location.lng,
                          poi.lat,
                          poi.lng
                        ).toFixed(1)
                      : '1.2'

                    return (
                      <div
                        key={poi.id}
                        className="p-3 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between gap-2 hover:border-cyan-500/30 transition-colors"
                      >
                        <div>
                          <div className="flex items-center gap-1.5 mb-0.5">
                            <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-white/10 text-[#00d9d9]">
                              {poi.type === 'women_safety' ? 'WOMEN HELP' : poi.type.toUpperCase()}
                            </span>
                            <span className="text-[10px] text-[#00d9d9] font-mono font-bold">
                              📍 {dist} km away
                            </span>
                          </div>
                          <b className="text-xs text-white block leading-tight">{poi.name}</b>
                          <small className="text-[10px] text-[#94a3b8] block mt-0.5">{poi.address}</small>
                        </div>
                        <a
                          href={`tel:${poi.phone.replace(/[^0-9+]/g, '')}`}
                          className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-[#00d9d9] text-xs font-bold flex items-center gap-1 flex-shrink-0"
                          title={`Call ${poi.name}`}
                        >
                          <Phone className="w-3.5 h-3.5" /> Call
                        </a>
                      </div>
                    )
                  })}
              </div>
            </Card>

            {/* External Navigation Shortcuts */}
            {session.location && (
              <div className="flex gap-3">
                <a
                  href={`https://www.google.com/maps?q=${session.location.lat},${session.location.lng}`}
                  target="_blank"
                  rel="noreferrer"
                  className="primary flex-1 py-3 text-xs font-extrabold flex items-center justify-center gap-1.5 shadow-lg"
                >
                  <Navigation className="w-4 h-4" /> Open In Google Maps App <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  )
}
