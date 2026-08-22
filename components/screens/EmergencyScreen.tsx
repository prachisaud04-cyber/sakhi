'use client'

import React, { useState } from 'react'
import {
  ArrowLeft,
  BatteryMedium,
  Check as CheckIcon,
  Clock3,
  MapPin,
  Navigation,
  Phone,
  ShieldCheck,
  Siren,
} from 'lucide-react'
import { EmergencyProps } from '@/types'
import {
  EmergencyContact,
  INITIAL_EMERGENCY_CONTACTS,
  initiateCellularCall,
} from '@/constants/contacts'
import { DesktopCallFallbackModal } from '@/components/ui/DesktopCallFallbackModal'
import { Card } from '@/components/ui/Card'
import { Pill } from '@/components/ui/Pill'
import { Ring } from '@/components/ui/Ring'

export const EmergencyScreen: React.FC<EmergencyProps> = ({ go, goBack, score }) => {
  const [fallbackContact, setFallbackContact] = useState<EmergencyContact | null>(null)

  const handleCall = (contact: EmergencyContact) => {
    initiateCellularCall(contact, (c) => setFallbackContact(c))
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
        <p>Selected safety information and live telemetry have been prepared for emergency dispatch.</p>

        <Card className="notified">
          <CheckIcon />
          <b>
            Emergency contacts notified
            <small>Prachi Saud · Abhijeet Das · Licha Pathak · Hridip Sarma</small>
          </b>
        </Card>

        {/* ONE-TAP TRUSTED CONTACT CALL LIST */}
        <div className="w-full space-y-2.5 text-left my-3 font-sans">
          <small className="text-[10px] font-bold text-red-400 uppercase tracking-wider block">
            REAL EMERGENCY CONTACTS — ONE-TAP DIAL
          </small>

          <div className="grid grid-cols-1 gap-2">
            {INITIAL_EMERGENCY_CONTACTS.map((c) => (
              <div
                key={c.id}
                className="p-3.5 rounded-xl bg-red-950/40 border border-red-500/30 hover:border-red-500/60 transition-all flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-600 to-red-900 border border-white/20 flex items-center justify-center text-xs font-extrabold text-white shadow-md">
                    {c.avatarInitials}
                  </div>
                  <div>
                    <b className="text-sm text-white block">{c.name}</b>
                    <small className="text-xs text-red-200 font-mono">{c.phone}</small>
                  </div>
                </div>

                <button
                  onClick={() => handleCall(c)}
                  className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-lg transition-transform active:scale-95"
                >
                  <Phone className="w-3.5 h-3.5" /> Call Now
                </button>
              </div>
            ))}
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
            <MapPin /> Narengi · <Clock3 /> Last safe 8:47 PM · <BatteryMedium /> 74%
          </p>
        </Card>

        <button className="primary" onClick={() => go('contact')}>
          <Navigation className="w-5 h-5" /> View Live Shared Telemetry
        </button>

        <button className="secondary" onClick={() => window.open('tel:112')}>
          <Siren /> Call Emergency Services (112)
        </button>

        <button className="quiet" onClick={() => go('contact')}>
          View shared information
        </button>

        <DesktopCallFallbackModal
          contact={fallbackContact}
          onClose={() => setFallbackContact(null)}
        />
      </div>
    </div>
  )
}
