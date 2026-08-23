'use client'

import React, { useEffect, useRef, useState } from 'react'
import {
  AlertCircle,
  ArrowLeft,
  BatteryMedium,
  Check as CheckIcon,
  Clock3,
  ExternalLink,
  MapPin,
  MessageSquare,
  Navigation,
  Phone,
  RefreshCw,
  Send,
  ShieldCheck,
  Siren,
  Smartphone,
  Sparkles,
  Volume2,
  VolumeX,
} from 'lucide-react'
import { EmergencyProps } from '@/types'
import {
  EmergencyContact,
  initiateCellularCall,
} from '@/constants/contacts'
import { useAuth } from '@/contexts/AuthContext'
import { useAutomatedEmergencyDispatch } from '@/hooks/useAutomatedEmergencyDispatch'
import { useDeviceTelemetry } from '@/hooks/useDeviceTelemetry'
import { DesktopCallFallbackModal } from '@/components/ui/DesktopCallFallbackModal'
import { Card } from '@/components/ui/Card'
import { Pill } from '@/components/ui/Pill'
import { Ring } from '@/components/ui/Ring'

export const EmergencyScreen: React.FC<EmergencyProps> = ({
  go,
  goBack,
  score,
  location,
  sessionId,
}) => {
  const { user, contacts } = useAuth()
  const [fallbackContact, setFallbackContact] = useState<EmergencyContact | null>(null)
  const [manualBroadcastSent, setManualBroadcastSent] = useState<boolean>(false)
  const [whatsAppBroadcastSent, setWhatsAppBroadcastSent] = useState<boolean>(false)
  const [isSirenActive, setIsSirenActive] = useState<boolean>(false)
  const [journeyContext, setJourneyContext] = useState<{ origin: string; destination: string }>({
    origin: 'Gauhati University, Jalukbari',
    destination: 'Narengi Tiniali',
  })
  const hasAutoDispatched = useRef<boolean>(false)
  const stopSirenFnRef = useRef<(() => void) | null>(null)

  const telemetry = useDeviceTelemetry()

  const userName = user?.name || 'Riya Sharma'
  const userPhone = user?.phone || '+91 88227 17429'

  const {
    isDispatching,
    lastResult,
    receipts,
    error,
    dispatchAlert,
    triggerNativeSmsBroadcast,
    triggerDirectWhatsApp,
  } = useAutomatedEmergencyDispatch()

  const activeSessionId = sessionId || 'SAKHI-EMERGENCY-SOS'

  // Load journey context from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('sakhi_active_journey')
        if (stored) {
          const parsed = JSON.parse(stored)
          setJourneyContext({
            origin: parsed.origin || 'Gauhati University, Jalukbari',
            destination: parsed.destination || 'Narengi Tiniali',
          })
        }
      } catch (e) {
        console.warn('Could not read journey context', e)
      }
    }
  }, [])

  const buildDistressMessage = () => {
    const locText = location
      ? `${location.lat.toFixed(5)}° N, ${location.lng.toFixed(5)}° E`
      : '26.1520° N, 91.6640° E'
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://sakhi.app'
    const liveLink = `${origin}/live/${activeSessionId}`

    return `🚨 *SAKHI CRITICAL EMERGENCY SOS* 🚨\n\nI need urgent emergency help!\n\n📍 *Current GPS:* ${locText}\n🗺️ *Live Real-Time Tracker:* ${liveLink}\n🚗 *Journey:* From ${journeyContext.origin.split(',')[0]} to ${journeyContext.destination.split(',')[0]}\n🔋 *Device Battery:* ${telemetry.batteryStatusText}\n\nPlease call me or dial 112 if I do not respond.`
  }

  // Auto-dispatch on mount & trigger hardware haptic alert
  useEffect(() => {
    if (hasAutoDispatched.current) return
    hasAutoDispatched.current = true

    // Hardware Haptic SOS Pattern
    telemetry.hapticVibrate([400, 150, 400, 150, 400, 150, 800])

    const recipients = contacts.map((c) => ({
      name: c.name,
      phone: c.normalizedPhone,
    }))

    dispatchAlert({
      type: 'SOS_TRIGGERED',
      sessionId: activeSessionId,
      userName,
      userPhone,
      location: location ?? { lat: 26.152, lng: 91.664, accuracy: 12, timestamp: Date.now() },
      recipients,
      batteryLevel: telemetry.batteryLevel,
      channels: ['sms', 'whatsapp'],
    })

    // Automatically trigger real-time WhatsApp broadcast window
    const waText = buildDistressMessage()
    const primaryPhone = contacts.length > 0 ? contacts[0].normalizedPhone.replace('+', '') : '918822717429'
    setTimeout(() => {
      window.open(
        `https://api.whatsapp.com/send?phone=${primaryPhone}&text=${encodeURIComponent(waText)}`,
        '_blank'
      )
    }, 800)
  }, [dispatchAlert, activeSessionId, location, journeyContext, telemetry, contacts, userName, userPhone])

  // Toggle synthesized hardware siren
  const handleToggleSiren = () => {
    if (isSirenActive) {
      if (stopSirenFnRef.current) {
        stopSirenFnRef.current()
        stopSirenFnRef.current = null
      }
      setIsSirenActive(false)
    } else {
      const stopFn = telemetry.playEmergencySiren()
      stopSirenFnRef.current = stopFn
      setIsSirenActive(true)
    }
  }

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (stopSirenFnRef.current) {
        stopSirenFnRef.current()
      }
    }
  }, [])

  const handleResend = () => {
    const recipients = contacts.map((c) => ({
      name: c.name,
      phone: c.normalizedPhone,
    }))

    dispatchAlert({
      type: 'SOS_TRIGGERED',
      sessionId: activeSessionId,
      userName,
      userPhone,
      location: location ?? { lat: 26.152, lng: 91.664, accuracy: 12, timestamp: Date.now() },
      recipients,
      batteryLevel: telemetry.batteryLevel,
      channels: ['sms', 'whatsapp'],
    })
  }

  const handleCall = (contact: EmergencyContact) => {
    initiateCellularCall(contact, (c) => setFallbackContact(c))
  }

  const handleContactWhatsApp = (contact: EmergencyContact) => {
    const phoneClean = contact.normalizedPhone.replace('+', '')
    const waText = buildDistressMessage()
    window.open(
      `https://api.whatsapp.com/send?phone=${phoneClean}&text=${encodeURIComponent(waText)}`,
      '_blank'
    )
  }

  const handleContactSMS = (contact: EmergencyContact) => {
    const locText = location
      ? `${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}`
      : '26.1520, 91.6640'
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://sakhi.app'
    const message = `🚨 SAKHI SOS: ${userName} needs urgent emergency help! GPS: ${locText}. Track: ${origin}/live/${activeSessionId}. Battery: ${telemetry.batteryStatusText}.`

    triggerNativeSmsBroadcast([contact.normalizedPhone], message)
  }

  const handleBroadcastAllWhatsApp = () => {
    const waText = buildDistressMessage()
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(waText)}`, '_blank')
    setWhatsAppBroadcastSent(true)
    setTimeout(() => setWhatsAppBroadcastSent(false), 4000)
  }

  const handleNativeSmsBroadcast = () => {
    const phones = contacts.map((c) => c.normalizedPhone)
    const locText = location
      ? `${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}`
      : '26.1520, 91.6640'
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://sakhi.app'
    const message = `🚨 SAKHI SOS: ${userName} needs urgent emergency help! GPS: ${locText}. Live Track: ${origin}/live/${activeSessionId}. Battery: ${telemetry.batteryStatusText}. Contact: ${userPhone}`

    triggerNativeSmsBroadcast(phones, message)
    setManualBroadcastSent(true)
    setTimeout(() => setManualBroadcastSent(false), 4000)
  }

  const getContactDeliveryStatus = (phone: string) => {
    const cleanPhone = phone.replace(/[^0-9]/g, '')
    const contactReceipts = receipts.filter(
      (r) => r.recipientPhone.replace(/[^0-9]/g, '') === cleanPhone
    )

    const wa = contactReceipts.find((r) => r.channel === 'whatsapp')
    const sms = contactReceipts.find((r) => r.channel === 'sms')

    return { wa, sms }
  }

  return (
    <div className="focused emergency-screen">
      <div className="top">
        <div className="brand">
          <ShieldCheck />
          <b>SAKHI</b>
        </div>
        <div className="flex items-center gap-2">
          <Pill tone="danger">Protocol active</Pill>
          <button className="icon" onClick={goBack} aria-label="Go back">
            <ArrowLeft />
          </button>
        </div>
      </div>

      <div className="check">
        <Siren />
        <small className="eyebrow danger-text">EMERGENCY PROTOCOL ACTIVATED</small>
        <Pill tone="danger">Risk Level: CRITICAL</Pill>
        <h1>
          Help is
          <br />
          <em>on the way.</em>
        </h1>
        <p>
          Emergency distress telemetry active for journey from{' '}
          <strong className="text-white">{journeyContext.origin.split(',')[0]}</strong> to{' '}
          <strong className="text-white">{journeyContext.destination.split(',')[0]}</strong>.
        </p>

        {/* Real-time Hardware Controls: WhatsApp, SMS, and Loud Siren Alarm */}
        <div className="w-full grid grid-cols-3 gap-2 my-2 font-sans">
          <button
            onClick={handleBroadcastAllWhatsApp}
            className="p-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs flex flex-col sm:flex-row items-center justify-center gap-1.5 shadow-lg transition-transform active:scale-95"
          >
            <MessageSquare className="w-4 h-4" />
            <span>{whatsAppBroadcastSent ? '✓ Opened' : 'WhatsApp SOS'}</span>
          </button>

          <button
            onClick={handleNativeSmsBroadcast}
            className="p-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs flex flex-col sm:flex-row items-center justify-center gap-1.5 shadow-lg transition-transform active:scale-95"
          >
            <Smartphone className="w-4 h-4" />
            <span>{manualBroadcastSent ? '✓ Opened' : 'SMS Broadcast'}</span>
          </button>

          <button
            onClick={handleToggleSiren}
            className={`p-3 rounded-xl font-extrabold text-xs flex flex-col sm:flex-row items-center justify-center gap-1.5 shadow-lg transition-transform active:scale-95 ${
              isSirenActive
                ? 'bg-amber-500 hover:bg-amber-400 text-black animate-pulse'
                : 'bg-red-700 hover:bg-red-600 text-white'
            }`}
          >
            {isSirenActive ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            <span>{isSirenActive ? 'Stop Siren' : 'Loud Siren'}</span>
          </button>
        </div>

        {/* Live Device Hardware Telemetry Card */}
        <Card className="notified border-red-500/40 bg-red-950/40">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <CheckIcon className="text-emerald-400" />
              <div>
                <b className="text-sm text-white block">
                  Automated Gateway &amp; Telemetry Active
                </b>
                <small className="text-red-200 block text-[11px]">
                  Battery: <strong className="text-white font-mono">{telemetry.batteryStatusText}</strong> · Hardware: <strong className="text-white font-mono">{telemetry.platform}</strong>
                </small>
              </div>
            </div>
            <button
              onClick={handleResend}
              disabled={isDispatching}
              className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-red-900/60 hover:bg-red-800 text-red-100 flex items-center gap-1 border border-red-500/30 transition-colors disabled:opacity-50"
            >
              {isDispatching ? (
                <RefreshCw className="w-3 h-3 animate-spin text-red-300" />
              ) : (
                <Send className="w-3 h-3 text-red-300" />
              )}
              {isDispatching ? 'Sending...' : 'Resend'}
            </button>
          </div>

          {error && (
            <div className="mt-2 text-xs text-amber-300 bg-amber-950/40 p-2 rounded-lg border border-amber-500/30 flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </Card>

        {/* ONE-TAP TRUSTED GUARDIAN ACTIONS: WHATSAPP, SMS, CALL */}
        <div className="w-full space-y-2.5 text-left my-3 font-sans">
          <div className="flex items-center justify-between">
            <small className="text-[10px] font-bold text-red-400 uppercase tracking-wider block">
              EMERGENCY GUARDIANS (1-TAP REAL-TIME SEND)
            </small>
            <span className="text-[10px] font-mono text-emerald-400">
              ● {contacts.length} GUARDIANS SYNCED
            </span>
          </div>

          <div className="grid grid-cols-1 gap-2.5">
            {contacts.map((c) => {
              const { wa, sms } = getContactDeliveryStatus(c.normalizedPhone)

              return (
                <div
                  key={c.id}
                  className="p-3.5 rounded-xl bg-red-950/40 border border-red-500/30 hover:border-red-500/60 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-600 to-red-900 border border-white/20 flex items-center justify-center text-xs font-extrabold text-white shadow-md flex-shrink-0 mt-0.5">
                      {c.avatarInitials}
                    </div>
                    <div>
                      <b className="text-sm text-white block">{c.name}</b>
                      <small className="text-xs text-red-200 font-mono">{c.phone}</small>

                      {/* Real-time Gateway Receipts */}
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-950/60 text-emerald-300 border border-emerald-500/30 flex items-center gap-1 font-mono">
                          <MessageSquare className="w-2.5 h-2.5 text-emerald-400" />
                          {wa ? `WhatsApp: ${wa.status.toUpperCase()}` : 'WhatsApp: READY'}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-950/60 text-blue-300 border border-blue-500/30 flex items-center gap-1 font-mono">
                          <Smartphone className="w-2.5 h-2.5 text-blue-400" />
                          {sms ? `SMS: ${sms.status.toUpperCase()}` : 'SMS: READY'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* 3 Real-time Actions: WhatsApp, SMS, Call */}
                  <div className="flex items-center gap-1.5 self-end sm:self-center">
                    <button
                      onClick={() => handleContactWhatsApp(c)}
                      className="px-2.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs flex items-center gap-1 shadow-md transition-transform active:scale-95"
                      title={`Send WhatsApp SOS to ${c.name}`}
                    >
                      <MessageSquare className="w-3.5 h-3.5" /> WA
                    </button>

                    <button
                      onClick={() => handleContactSMS(c)}
                      className="px-2.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs flex items-center gap-1 shadow-md transition-transform active:scale-95"
                      title={`Send SMS SOS to ${c.name}`}
                    >
                      <Smartphone className="w-3.5 h-3.5" /> SMS
                    </button>

                    <button
                      onClick={() => handleCall(c)}
                      className="px-3 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-extrabold text-xs flex items-center gap-1 shadow-md transition-transform active:scale-95"
                      title={`Call ${c.name}`}
                    >
                      <Phone className="w-3.5 h-3.5" /> Call
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <Card>
          <small>CONTEXT AT DETECTION</small>
          <div className="summary">
            <Ring score={score} tone="danger" />
            <b>
              Potential emergency<small>No response after safety check</small>
            </b>
          </div>
          <p>
            <MapPin /> {journeyContext.origin.split(',')[0]} → {journeyContext.destination.split(',')[0]} · <Clock3 /> Live GPS Armed · <BatteryMedium /> {telemetry.batteryStatusText}
          </p>
        </Card>

        <button className="primary" onClick={() => go('contact')}>
          <Navigation className="w-5 h-5" /> View Live Shared Telemetry
        </button>

        <button className="secondary" onClick={() => window.open('tel:112')}>
          <Siren /> Call Emergency Services (112)
        </button>

        <DesktopCallFallbackModal
          contact={fallbackContact}
          onClose={() => setFallbackContact(null)}
        />
      </div>
    </div>
  )
}
