'use client'

import React, { useEffect, useState } from 'react'
import {
  ArrowLeft,
  BatteryMedium,
  Clock3,
  MapPin,
  MessageSquare,
  Navigation,
  Phone,
  ShieldCheck,
  Siren,
  Smartphone,
  Wifi,
} from 'lucide-react'
import { ContactProps } from '@/types'
import { useDeviceTelemetry } from '@/hooks/useDeviceTelemetry'
import { Card } from '@/components/ui/Card'
import { Map } from '@/components/ui/Map'
import { Pill } from '@/components/ui/Pill'
import { Ring } from '@/components/ui/Ring'

export const ContactScreen: React.FC<ContactProps> = ({ goBack, score, location }) => {
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

  const userPhone = '+918822717429'
  const userPhoneClean = '918822717429'

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
        <h1>Riya needs your help</h1>
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

        {/* 1-Tap Real-time Response Actions */}
        <div className="w-full grid grid-cols-2 gap-2 my-2 font-sans">
          <button
            className="primary py-3 text-xs font-extrabold flex items-center justify-center gap-1.5 shadow-lg"
            onClick={() => (window.location.href = `tel:${userPhone}`)}
          >
            <Phone className="w-4 h-4" /> Call Riya Directly
          </button>

          <button
            className="p-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold flex items-center justify-center gap-1.5 shadow-lg transition-transform active:scale-95"
            onClick={() =>
              window.open(
                `https://api.whatsapp.com/send?phone=${userPhoneClean}&text=${encodeURIComponent(
                  `Riya, I received your SAKHI SOS alert. Are you safe? Please reply or call back.`
                )}`,
                '_blank'
              )
            }
          >
            <MessageSquare className="w-4 h-4" /> WhatsApp Riya
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
