'use client'

import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  AlertTriangle,
  Bus,
  Car,
  Check as CheckIcon,
  ChevronRight,
  Clock,
  Compass,
  HeartPulse,
  LockKeyhole,
  MapPin,
  MessageSquare,
  Navigation,
  Phone,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Users,
} from 'lucide-react'
import { StartProps } from '@/types'
import { INITIAL_EMERGENCY_CONTACTS } from '@/constants/contacts'
import { Card } from '@/components/ui/Card'
import { Header } from '@/components/ui/Header'
import { PlaceAutocompleteInput, PlaceSelection } from '@/components/ui/PlaceAutocompleteInput'

const POPULAR_DESTINATIONS = [
  { name: 'Gauhati University Campus, Jalukbari', distance: '0.8 km', eta: '3 mins', risk: 'Campus Safe Zone', lat: 26.152, lng: 91.664 },
  { name: 'The Hub Cafe & Jalukbari Rotary', distance: '1.2 km', eta: '4 mins', risk: 'Police Outpost Nearby', lat: 26.151, lng: 91.666 },
  { name: 'Sundarbari Housing Society, Jalukbari', distance: '1.5 km', eta: '5 mins', risk: 'Residential Well-Lit', lat: 26.157, lng: 91.658 },
  { name: 'Assam Engineering College (AEC), Jalukbari', distance: '2.0 km', eta: '6 mins', risk: 'Campus Safe Corridor', lat: 26.143, lng: 91.662 },
  { name: 'Maligaon Chariali & Railway HQ', distance: '4.2 km', eta: '10 mins', risk: 'Police Outpost Nearby', lat: 26.1595, lng: 91.7015 },
  { name: 'City Centre Mall, GS Road', distance: '11.5 km', eta: '20 mins', risk: '24/7 CCTV & Security', lat: 26.158, lng: 91.776 },
  { name: 'Narengi Tiniali & Housing Colony', distance: '14.8 km', eta: '26 mins', risk: 'Low Risk Corridor', lat: 26.202, lng: 91.825 },
  { name: 'Dispur Secretariat / GS Road', distance: '12.2 km', eta: '22 mins', risk: 'High Police Patrol', lat: 26.142, lng: 91.7915 },
  { name: 'Paltan Bazaar / Central Station', distance: '9.5 km', eta: '18 mins', risk: '24/7 CCTV Safe Zone', lat: 26.183, lng: 91.751 },
  { name: 'Khanapara Bus Terminus', distance: '16.0 km', eta: '28 mins', risk: 'Highway Lighting 92%', lat: 26.115, lng: 91.82 },
]

export const StartScreen: React.FC<StartProps> = ({
  go,
  goBack,
  startTracking,
  locationSharingEnabled,
  location,
}) => {
  const [origin, setOrigin] = useState<string>('Gauhati University, Jalukbari')
  const [destination, setDestination] = useState<string>('Narengi Tiniali, Guwahati')
  const [originCoords, setOriginCoords] = useState<{ lat: number; lng: number } | null>(
    location ? { lat: location.lat, lng: location.lng } : { lat: 26.152, lng: 91.664 }
  )
  const [destinationCoords, setDestinationCoords] = useState<{ lat: number; lng: number } | null>({
    lat: 26.202,
    lng: 91.825,
  })
  const [transportMode, setTransportMode] = useState<'cab' | 'bus' | 'walk' | 'car'>('cab')
  const [durationMinutes, setDurationMinutes] = useState<number>(30)
  const [selectedContacts, setSelectedContacts] = useState<string[]>(
    INITIAL_EMERGENCY_CONTACTS.map((c) => c.id)
  )
  const [autoAlertGuardians, setAutoAlertGuardians] = useState<boolean>(true)
  const [protectionLevel, setProtectionLevel] = useState<'balanced' | 'strict'>('balanced')

  // Auto-fill origin from live GPS location if available
  useEffect(() => {
    if (location && origin === 'Gauhati University, Jalukbari') {
      setOrigin(`Current GPS Location (${location.lat.toFixed(4)}°, ${location.lng.toFixed(4)}°)`)
      setOriginCoords({ lat: location.lat, lng: location.lng })
    }
  }, [location, origin])

  const toggleContact = (id: string) => {
    setSelectedContacts((prev) =>
      prev.includes(id)
        ? prev.length > 1
          ? prev.filter((c) => c !== id)
          : prev
        : [...prev, id]
    )
  }

  const handleUseLiveGps = () => {
    if (location) {
      setOrigin(`Live GPS Position (${location.lat.toFixed(5)}° N, ${location.lng.toFixed(5)}° E)`)
      setOriginCoords({ lat: location.lat, lng: location.lng })
    } else {
      startTracking()
      setOrigin('Detecting live GPS coordinates...')
    }
  }

  const handleSelectQuickDestination = (dest: typeof POPULAR_DESTINATIONS[0]) => {
    setDestination(dest.name)
    setDestinationCoords({ lat: dest.lat, lng: dest.lng })
  }

  const handleContinue = () => {
    // 1. Prepare Journey Metadata
    const journeyData = {
      origin,
      destination,
      transportMode,
      durationMinutes,
      startTime: Date.now(),
      selectedContactIds: selectedContacts,
      selectedContactNames: INITIAL_EMERGENCY_CONTACTS.filter((c) =>
        selectedContacts.includes(c.id)
      ).map((c) => c.name),
      autoAlertGuardians,
      protectionLevel,
      originCoords: originCoords || (location ? { lat: location.lat, lng: location.lng } : { lat: 26.152, lng: 91.664 }),
      destinationCoords: destinationCoords || { lat: 26.202, lng: 91.825 },
    }

    if (typeof window !== 'undefined') {
      localStorage.setItem('sakhi_active_journey', JSON.stringify(journeyData))
      localStorage.setItem('sakhi_destination_name', destination)
    }

    // 2. Start GPS Tracking
    if (locationSharingEnabled) {
      startTracking()
    }

    // 3. Move to Safe Route Selection
    go('routes')
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.25 }}
    >
      <Header title="Plan Safety Journey" back={goBack} />
      <div className="content">
        {/* Intro */}
        <div className="intro">
          <Shield className="text-[#00d9d9]" />
          <h1>
            Travel with
            <br />
            <em>complete confidence.</em>
          </h1>
          <p>
            Choose your starting point and destination using Google Maps verified suggestions. SAKHI monitors in-between route anomalies and automatically alerts emergency contacts if something goes wrong.
          </p>
        </div>

        {/* 1. STARTING LOCATION (ORIGIN) WITH GOOGLE MAPS AUTOCOMPLETE */}
        <PlaceAutocompleteInput
          label="Starting Point / Origin"
          value={origin}
          onChange={(val, selection) => {
            setOrigin(val)
            if (selection?.lat && selection?.lng) {
              setOriginCoords({ lat: selection.lat, lng: selection.lng })
            }
          }}
          placeholder="Search starting location (e.g. Gauhati University, Airport, Hotel)..."
          icon={<MapPin className="w-3.5 h-3.5 text-[#00d9d9]" />}
          userLocation={location}
          showGpsButton={true}
          onUseCurrentGps={handleUseLiveGps}
        />

        {/* 2. FINAL DESTINATION WITH GOOGLE MAPS AUTOCOMPLETE */}
        <div className="space-y-1.5 font-sans">
          <PlaceAutocompleteInput
            label="Final Destination"
            value={destination}
            onChange={(val, selection) => {
              setDestination(val)
              if (selection?.lat && selection?.lng) {
                setDestinationCoords({ lat: selection.lat, lng: selection.lng })
              }
            }}
            placeholder="Search destination (e.g. Narengi, Dispur, Khanapara, Mall, Home)..."
            icon={<Navigation className="w-3.5 h-3.5 text-[#22c55e]" />}
            userLocation={location}
          />

          {/* Quick Destination Suggestions */}
          <div className="pt-1">
            <small className="text-[10px] font-bold text-[#94a3b8] block mb-1.5 uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-[#00d9d9]" /> Quick Recommendations Nearby:
            </small>
            <div className="grid grid-cols-2 gap-1.5">
              {POPULAR_DESTINATIONS.slice(0, 4).map((dest) => (
                <button
                  key={dest.name}
                  type="button"
                  onClick={() => handleSelectQuickDestination(dest)}
                  className={`p-2 rounded-xl text-left border transition-all ${
                    destination.includes(dest.name)
                      ? 'bg-cyan-950/60 border-[#00d9d9] text-white shadow-md'
                      : 'bg-black/40 border-white/5 text-[#cbd5e1] hover:border-cyan-500/30'
                  }`}
                >
                  <b className="text-[11px] block leading-tight truncate">{dest.name}</b>
                  <span className="text-[10px] text-[#00d9d9] font-mono">
                    {dest.distance} · {dest.eta}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 3. TRANSPORT MODE */}
        <div className="space-y-1.5 font-sans">
          <label className="text-xs font-extrabold text-white block uppercase">
            Mode of Transit
          </label>
          <div className="grid grid-cols-4 gap-2">
            {[
              { id: 'cab', label: 'Cab / Auto', icon: Car },
              { id: 'bus', label: 'Public Bus', icon: Bus },
              { id: 'walk', label: 'Walking', icon: Navigation },
              { id: 'car', label: 'Personal', icon: Shield },
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => setTransportMode(id as typeof transportMode)}
                className={`p-2.5 rounded-xl border text-center transition-all flex flex-col items-center gap-1 ${
                  transportMode === id
                    ? 'bg-[#00d9d9] text-[#050914] border-[#00d9d9] font-extrabold shadow-lg scale-102'
                    : 'bg-black/40 border-white/10 text-[#cbd5e1] hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="text-[10px] block leading-none">{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 4. ESTIMATED DURATION */}
        <div className="space-y-1.5 font-sans">
          <div className="flex items-center justify-between">
            <label className="text-xs font-extrabold text-white block uppercase">
              Expected Travel Duration
            </label>
            <span className="text-xs font-mono text-[#00d9d9] font-bold">
              {durationMinutes} Minutes
            </span>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {[15, 30, 45, 60].map((mins) => (
              <button
                key={mins}
                type="button"
                onClick={() => setDurationMinutes(mins)}
                className={`py-2 rounded-xl text-xs font-mono font-bold border transition-all ${
                  durationMinutes === mins
                    ? 'bg-cyan-500/20 border-[#00d9d9] text-[#00d9d9]'
                    : 'bg-black/40 border-white/10 text-[#94a3b8] hover:text-white'
                }`}
              >
                {mins} mins
              </button>
            ))}
          </div>
        </div>

        {/* 5. EMERGENCY GUARDIANS SELECTION (Auto-notified on incident) */}
        <div className="space-y-2 font-sans">
          <div className="flex items-center justify-between">
            <label className="text-xs font-extrabold text-white flex items-center gap-1.5 uppercase">
              <Users className="w-3.5 h-3.5 text-red-400" /> Emergency Contacts Armed
            </label>
            <span className="text-[10px] font-mono text-emerald-400 font-bold">
              {selectedContacts.length} of {INITIAL_EMERGENCY_CONTACTS.length} SELECTED
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {INITIAL_EMERGENCY_CONTACTS.map((c) => {
              const isSelected = selectedContacts.includes(c.id)
              return (
                <div
                  key={c.id}
                  onClick={() => toggleContact(c.id)}
                  className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-red-950/40 border-red-500/50 shadow-md'
                      : 'bg-black/30 border-white/5 opacity-60'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-red-600 to-red-900 text-white font-extrabold text-xs flex items-center justify-center border border-white/20">
                      {c.avatarInitials}
                    </div>
                    <div>
                      <b className="text-xs text-white block">{c.name}</b>
                      <small className="text-[10px] text-red-200 font-mono">{c.phone}</small>
                    </div>
                  </div>
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center border ${
                      isSelected
                        ? 'bg-red-500 border-red-400 text-white'
                        : 'border-white/20 text-transparent'
                    }`}
                  >
                    <CheckIcon className="w-3 h-3" />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* 6. IN-BETWEEN ANOMALY PROTECTION PROTOCOL BANNER */}
        <Card noTilt className="p-4 border-amber-500/40 bg-amber-950/25 space-y-2.5 font-sans">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-amber-300 font-extrabold text-xs uppercase tracking-wider">
              <ShieldAlert className="w-4 h-4 text-amber-400" /> In-Between Incident Guard
            </div>
            <button
              type="button"
              onClick={() => setAutoAlertGuardians(!autoAlertGuardians)}
              className={`w-11 h-6 rounded-full transition-colors relative ${
                autoAlertGuardians ? 'bg-[#00d9d9]' : 'bg-white/20'
              }`}
            >
              <span
                className={`w-4 h-4 rounded-full bg-[#050914] absolute top-1 transition-transform ${
                  autoAlertGuardians ? 'right-1' : 'left-1'
                }`}
              />
            </button>
          </div>

          <p className="text-xs text-amber-100/90 leading-relaxed">
            If an unexpected stop (&gt; 3 mins), route deviation, or missed safety check occurs between{' '}
            <strong className="text-white">{origin.split(',')[0]}</strong> and{' '}
            <strong className="text-white">{destination.split(',')[0]}</strong>, SAKHI will automatically
            dispatch emergency SMS &amp; WhatsApp alerts with your live coordinates.
          </p>

          <div className="flex items-center gap-2 pt-1 text-[11px] text-[#00d9d9] font-mono font-bold">
            <MessageSquare className="w-3 h-3" /> SMS &amp; WhatsApp Gateway Armed
          </div>
        </Card>

        {/* 7. PROTECTION LEVEL */}
        <Card
          className={`row cursor-pointer transition-all ${
            protectionLevel === 'balanced' ? 'selected border-cyan-500/50' : ''
          }`}
          onClick={() =>
            setProtectionLevel(protectionLevel === 'balanced' ? 'strict' : 'balanced')
          }
        >
          <ShieldCheck className="text-[#00d9d9]" />
          <span>
            <b>{protectionLevel === 'balanced' ? 'Balanced Protection' : 'Strict Protection'}</b>
            <small>
              {protectionLevel === 'balanced'
                ? 'Smart contextual route monitoring'
                : 'Frequent pulse safety checks (every 10 mins)'}
            </small>
          </span>
          <CheckIcon className="text-[#00d9d9]" />
        </Card>

        <div className="note">
          <LockKeyhole />
          Location telemetry is collected only during this Safety Journey and auto-deleted upon arrival.
        </div>

        {/* CONTINUE BUTTON */}
        <button className="primary py-3.5 text-sm font-extrabold shadow-xl" onClick={handleContinue}>
          Continue to Route Safety <ChevronRight className="w-4 h-4 ml-1 inline" />
        </button>
      </div>
    </motion.div>
  )
}
