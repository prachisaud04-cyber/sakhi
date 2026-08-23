'use client'

import React, { useEffect, useState } from 'react'
import {
  ArrowLeft,
  BatteryMedium,
  Clock3,
  Edit2,
  MapPin,
  MessageSquare,
  Navigation,
  Phone,
  Plus,
  ShieldCheck,
  Siren,
  Smartphone,
  Star,
  Users,
  Wifi,
} from 'lucide-react'
import { ContactProps } from '@/types'
import { useDeviceTelemetry } from '@/hooks/useDeviceTelemetry'
import { useAuth } from '@/contexts/AuthContext'
import { Card } from '@/components/ui/Card'
import { Map } from '@/components/ui/Map'
import { Pill } from '@/components/ui/Pill'
import { Ring } from '@/components/ui/Ring'

export const ContactScreen: React.FC<ContactProps> = ({ goBack, score, location }) => {
  const { user, contacts, openEmergencySetupModal } = useAuth()

  const [journeyContext, setJourneyContext] = useState<{ origin: string; destination: string }>({
    origin: 'Gauhati University, Jalukbari',
    destination: 'Narengi Tiniali',
  })

  const telemetry = useDeviceTelemetry()

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
        console.warn('Could not read journey context in ContactScreen', e)
      }
    }
  }, [])

  const userName = user?.name || 'Riya Sharma'
  const userPhone = user?.phone || '+91 88227 17429'
  const userPhoneClean = (user?.normalizedPhone || '+918822717429').replace('+', '')

  const locText = location
    ? `${location.lat.toFixed(4)}° N, ${location.lng.toFixed(4)}° E`
    : '26.1520° N, 91.6640° E'

  return (
    <div className="focused">
      <div className="top">
        <div className="brand">
          <ShieldCheck />
          <b>SAKHI</b>
        </div>
        <button className="icon" onClick={goBack} aria-label="Go back">
          <ArrowLeft />
        </button>
      </div>

      <div className="check">
        <small className="eyebrow danger-text">GUARDIAN EMERGENCY TELEMETRY</small>
        <Pill tone="danger">Potential Emergency Active</Pill>
        <h1>{userName.split(' ')[0]} needs your help</h1>
        <p>
          An emergency protocol was activated during her journey from{' '}
          <strong className="text-white">{journeyContext.origin.split(',')[0]}</strong> to{' '}
          <strong className="text-white">{journeyContext.destination.split(',')[0]}</strong>.
        </p>

        {/* Dynamic Real-time Incident Google Map */}
        <Map
          danger
          location={location}
          height="280px"
          showSafeZones={true}
          showRoutes={true}
          origin={journeyContext.origin}
          destination={journeyContext.destination}
        />

        <Card>
          <small>LIVE SHARED SAFETY TELEMETRY</small>
          <div className="summary">
            <Ring score={score} tone="danger" />
            <b>
              Potential Emergency<small>Safety check unanswered · Auto-escalated</small>
            </b>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs font-mono text-[#cbd5e1] my-2">
            <div className="bg-black/40 p-2.5 rounded-xl border border-white/5">
              <span className="text-[#94a3b8] text-[10px] block font-sans">Current Coordinates</span>
              <b className="text-[#00d9d9]">{locText}</b>
            </div>
            <div className="bg-black/40 p-2.5 rounded-xl border border-white/5">
              <span className="text-[#94a3b8] text-[10px] block font-sans">Device Battery</span>
              <b className="text-emerald-400 flex items-center gap-1">
                <BatteryMedium className="w-3.5 h-3.5" /> {telemetry.batteryStatusText}
              </b>
            </div>
          </div>

          <p className="text-xs text-[#94a3b8] flex items-center gap-1 mt-1">
            <MapPin className="w-3.5 h-3.5 text-[#00d9d9]" /> Corridor: {journeyContext.origin.split(',')[0]} → {journeyContext.destination.split(',')[0]}
          </p>
        </Card>

        {/* Dynamic Configured Guardians List */}
        <Card noTilt className="p-4 bg-[#0f172a] border border-white/10 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-[#00d9d9]" />
              <b className="text-xs text-white uppercase tracking-wider font-mono">
                Active Guardians ({contacts.length})
              </b>
            </div>
            <button
              onClick={openEmergencySetupModal}
              className="px-2.5 py-1 rounded-lg bg-[#00d9d9]/15 border border-[#00d9d9]/30 text-[#00d9d9] text-[11px] font-bold hover:bg-[#00d9d9]/25 flex items-center gap-1"
            >
              <Edit2 className="w-3 h-3" /> Edit Contacts
            </button>
          </div>

          <div className="space-y-2">
            {contacts.map((c, idx) => (
              <div
                key={c.id}
                className="p-2.5 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between gap-2 text-xs"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#1e293b] to-[#0f172a] border border-white/10 flex items-center justify-center font-bold text-xs text-[#00d9d9] font-mono shrink-0">
                    {c.avatarInitials}
                  </div>
                  <div className="truncate">
                    <div className="flex items-center gap-1">
                      <b className="text-white truncate">{c.name}</b>
                      {idx === 0 && (
                        <span className="px-1 py-0.2 rounded bg-amber-500/20 text-amber-300 text-[8px] font-mono border border-amber-500/30">
                          Primary
                        </span>
                      )}
                    </div>
                    <small className="text-[#94a3b8] font-mono block">{c.phone} · {c.relation}</small>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => (window.location.href = `tel:${c.normalizedPhone}`)}
                    className="p-2 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/25 text-[#00d9d9] border border-cyan-500/30"
                    title={`Call ${c.name}`}
                  >
                    <Phone className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => {
                      const cleanPhone = c.normalizedPhone.replace('+', '')
                      window.open(
                        `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(
                          `🚨 SAKHI SOS: ${userName} triggered emergency alert at ${locText}. Please assist!`
                        )}`,
                        '_blank'
                      )
                    }}
                    className="p-2 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 border border-emerald-500/30"
                    title={`WhatsApp ${c.name}`}
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* 1-Tap Real-time Response Actions */}
        <div className="w-full grid grid-cols-2 gap-2 my-2 font-sans">
          <button
            className="primary py-3 text-xs font-extrabold flex items-center justify-center gap-1.5 shadow-lg"
            onClick={() => (window.location.href = `tel:${userPhone}`)}
          >
            <Phone className="w-4 h-4" /> Call {userName.split(' ')[0]} Directly
          </button>

          <button
            className="p-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold flex items-center justify-center gap-1.5 shadow-lg transition-transform active:scale-95 cursor-pointer"
            onClick={() =>
              window.open(
                `https://api.whatsapp.com/send?phone=${userPhoneClean}&text=${encodeURIComponent(
                  `${userName.split(' ')[0]}, I received your SAKHI SOS alert. Are you safe? Please reply or call back.`
                )}`,
                '_blank'
              )
            }
          >
            <MessageSquare className="w-4 h-4" /> WhatsApp {userName.split(' ')[0]}
          </button>
        </div>

        <button
          className="secondary"
          onClick={() => (window.location.href = 'tel:112')}
        >
          <Siren /> Call Emergency Services (112)
        </button>

        <button className="quiet text-xs" onClick={goBack}>
          <Navigation className="w-3.5 h-3.5" /> Return to Safety Screen
        </button>
      </div>
    </div>
  )
}
