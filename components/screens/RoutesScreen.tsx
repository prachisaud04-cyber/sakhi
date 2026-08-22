'use client'

import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Check,
  ChevronRight,
  Clock,
  Eye,
  Hospital,
  MapPin,
  Navigation,
  Shield,
  ShieldCheck,
  Sparkles,
  Zap,
} from 'lucide-react'
import { CalculatedRouteOption, RoutesProps } from '@/types'
import { assessRouteSafety } from '@/lib/routeSafetyEngine'
import { Card } from '@/components/ui/Card'
import { Header } from '@/components/ui/Header'
import { Map } from '@/components/ui/Map'

const DEFAULT_ROUTE_OPTIONS: CalculatedRouteOption[] = [
  {
    id: 'route-recommended',
    name: 'Recommended Safe Corridor',
    summary: '11.8 km · 22 mins · High Police Patrol & 96% Street Lighting',
    distanceText: '11.8 km',
    distanceMeters: 11800,
    durationText: '22 mins',
    durationMinutes: 22,
    tone: 'safe',
    safetyScore: 94,
    lightingScore: 96,
    cctvCoverage: 88,
    policePresence: true,
    coordinates: [
      { lat: 26.152, lng: 91.664 },
      { lat: 26.158, lng: 91.701 },
      { lat: 26.175, lng: 91.765 },
      { lat: 26.202, lng: 91.825 },
    ],
  },
  {
    id: 'route-fastest',
    name: 'Fastest Direct Route',
    summary: '10.5 km · 18 mins · Direct Highway Corridor',
    distanceText: '10.5 km',
    distanceMeters: 10500,
    durationText: '18 mins',
    durationMinutes: 18,
    tone: 'safe',
    safetyScore: 88,
    lightingScore: 84,
    cctvCoverage: 79,
    policePresence: true,
    coordinates: [
      { lat: 26.152, lng: 91.664 },
      { lat: 26.162, lng: 91.725 },
      { lat: 26.188, lng: 91.792 },
      { lat: 26.202, lng: 91.825 },
    ],
  },
  {
    id: 'route-alternate',
    name: 'Alternate Well-Lit Avenue',
    summary: '12.6 km · 25 mins · Commercial Thoroughfare with CCTV',
    distanceText: '12.6 km',
    distanceMeters: 12600,
    durationText: '25 mins',
    durationMinutes: 25,
    tone: 'warn',
    safetyScore: 78,
    lightingScore: 80,
    cctvCoverage: 74,
    policePresence: false,
    coordinates: [
      { lat: 26.152, lng: 91.664 },
      { lat: 26.145, lng: 91.695 },
      { lat: 26.172, lng: 91.778 },
      { lat: 26.202, lng: 91.825 },
    ],
  },
]

export const RoutesScreen: React.FC<RoutesProps> = ({
  go,
  goBack,
  location,
  status,
  error,
  isTracking,
  startTracking,
  locationSharingEnabled,
}) => {
  const [selectedRouteId, setSelectedRouteId] = useState<string>('route-recommended')
  const [destination, setDestination] = useState<string>('Narengi Tiniali')
  const [origin, setOrigin] = useState<string>('Gauhati University')
  const [originCoords, setOriginCoords] = useState<{ lat: number; lng: number } | null>(null)
  const [destinationCoords, setDestinationCoords] = useState<{ lat: number; lng: number } | null>(null)
  const [calculatedRoutes, setCalculatedRoutes] = useState<CalculatedRouteOption[]>(DEFAULT_ROUTE_OPTIONS)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('sakhi_active_journey')
        if (stored) {
          const parsed = JSON.parse(stored)
          if (parsed.destination) setDestination(parsed.destination)
          if (parsed.origin) setOrigin(parsed.origin)
          if (parsed.originCoords) setOriginCoords(parsed.originCoords)
          if (parsed.destinationCoords) setDestinationCoords(parsed.destinationCoords)
        }
      } catch (e) {
        console.warn('Could not read stored journey', e)
      }
    }
  }, [])

  const handleSelectRoute = (route: CalculatedRouteOption) => {
    setSelectedRouteId(route.id)

    // Save chosen route details & exact coordinates for LiveScreen cross-track tracking
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('sakhi_active_journey')
        const parsed = stored ? JSON.parse(stored) : {}
        parsed.selectedRouteId = route.id
        parsed.durationMinutes = route.durationMinutes
        parsed.distanceText = route.distanceText
        parsed.coordinates = route.coordinates
        localStorage.setItem('sakhi_active_journey', JSON.stringify(parsed))
      } catch (e) {
        console.warn('Could not save selected route', e)
      }
    }
  }

  const handleStartJourney = () => {
    // Ensure active route coordinates are stored
    const activeRoute = displayRoutes.find((r) => r.id === selectedRouteId) || displayRoutes[0]
    if (typeof window !== 'undefined' && activeRoute) {
      try {
        const stored = localStorage.getItem('sakhi_active_journey')
        const parsed = stored ? JSON.parse(stored) : {}
        parsed.selectedRouteId = activeRoute.id
        parsed.durationMinutes = activeRoute.durationMinutes
        parsed.distanceText = activeRoute.distanceText
        parsed.coordinates = activeRoute.coordinates
        localStorage.setItem('sakhi_active_journey', JSON.stringify(parsed))
      } catch (e) {
        console.warn('Could not persist journey on start', e)
      }
    }

    if (locationSharingEnabled && !isTracking) {
      startTracking()
    }
    go('live')
  }

  const displayRoutes = calculatedRoutes.length > 0 ? calculatedRoutes : DEFAULT_ROUTE_OPTIONS

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.25 }}
    >
      <Header title="Choose Safe Route" back={goBack} />
      <div className="content">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <small className="eyebrow flex items-center gap-1.5 text-[#00d9d9]">
              <Sparkles className="w-3.5 h-3.5" /> DYNAMIC AI ROUTE SAFETY ENGINE
            </small>
            <h1 className="text-3xl font-extrabold text-white mt-1">
              Which route feels
              <br />
              <em>safest for you?</em>
            </h1>
          </div>
          <div className="flex flex-col text-right text-xs font-mono bg-black/40 px-3 py-2 rounded-xl border border-white/10 self-start sm:self-auto">
            <span className="text-[#94a3b8]">
              From: <strong className="text-white">{origin.split(',')[0]}</strong>
            </span>
            <span className="text-[#00d9d9] font-bold">
              To: <strong className="text-white">{destination.split(',')[0]}</strong>
            </span>
          </div>
        </div>

        {/* Interactive Google Map with Instant Route Switching */}
        <Map
          location={location}
          status={status}
          error={error}
          isTracking={isTracking}
          onRequestPermission={startTracking}
          locationSharingEnabled={locationSharingEnabled}
          height="320px"
          showRoutes={true}
          selectedRouteId={selectedRouteId}
          showSafeZones={true}
          origin={origin}
          destination={destination}
          originCoords={originCoords}
          destinationCoords={destinationCoords}
          onRoutesCalculated={(routes) => {
            if (routes && routes.length > 0) {
              // Dynamically assess each route with the Safety Engine
              const assessed = routes.map((r) => {
                const dynamicAssessment = assessRouteSafety(r.coordinates)
                return {
                  ...r,
                  safetyScore: dynamicAssessment.overallScore,
                  lightingScore: dynamicAssessment.lightingScore,
                  cctvCoverage: dynamicAssessment.cctvDensityScore,
                }
              })
              setCalculatedRoutes(assessed)
            }
          }}
        />

        <div className="note flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-[#22c55e] flex-shrink-0" />
          <span>
            Click on any route option below to immediately view and compare its live pathway and safety metrics on the map.
          </span>
        </div>

        {/* Dynamic Route Option Cards */}
        <div className="space-y-3">
          {displayRoutes.map((r) => {
            const isSelected = r.id === selectedRouteId

            return (
              <Card
                key={r.id}
                className={`p-4 transition-all cursor-pointer ${
                  isSelected
                    ? r.id === 'route-fastest'
                      ? 'selected border-emerald-500/70 bg-emerald-950/40 shadow-xl shadow-emerald-500/10 -translate-y-0.5'
                      : r.id === 'route-alternate'
                      ? 'selected border-amber-500/70 bg-amber-950/40 shadow-xl shadow-amber-500/10 -translate-y-0.5'
                      : 'selected border-cyan-500/70 bg-[#0c1728]/95 shadow-xl shadow-cyan-500/10 -translate-y-0.5'
                    : 'hover:border-white/20 bg-[#0f172a]/70'
                }`}
                onClick={() => handleSelectRoute(r)}
              >
                <div className="route-top flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-3 h-3 rounded-full ${
                        r.id === 'route-recommended'
                          ? 'bg-[#00d9d9]'
                          : r.id === 'route-fastest'
                          ? 'bg-[#22c55e]'
                          : 'bg-[#f59e0b]'
                      }`}
                    />
                    <b className="text-base font-extrabold text-white">{r.name}</b>
                  </div>

                  <span
                    className={`text-xs font-extrabold font-mono px-2.5 py-0.5 rounded-full ${
                      r.safetyScore >= 90
                        ? 'bg-cyan-500/20 text-[#00d9d9] border border-cyan-500/30'
                        : r.safetyScore >= 80
                        ? 'bg-emerald-500/20 text-[#22c55e] border border-emerald-500/30'
                        : 'bg-amber-500/20 text-[#f59e0b] border border-amber-500/30'
                    }`}
                  >
                    Safety {r.safetyScore}/100
                  </span>
                </div>

                <div className="route-meta flex items-center gap-4 text-xs font-mono text-[#cbd5e1] mb-3">
                  <span className="flex items-center gap-1 font-bold text-white">
                    <Clock className="w-3.5 h-3.5 text-[#00d9d9]" /> {r.durationText}
                  </span>
                  <span className="flex items-center gap-1 font-bold text-white">
                    <MapPin className="w-3.5 h-3.5 text-[#00d9d9]" /> {r.distanceText}
                  </span>
                  <span className="text-[#94a3b8] truncate">{r.summary}</span>
                </div>

                {/* Safety Metrics Progress Bars */}
                <div className="space-y-2 pt-2 border-t border-white/5 text-xs font-sans">
                  <div>
                    <div className="flex items-center justify-between text-[11px] mb-1">
                      <span className="text-[#94a3b8] flex items-center gap-1">
                        <Zap className="w-3 h-3 text-amber-400" /> Street Lighting Rating
                      </span>
                      <strong className="text-white font-mono">{r.lightingScore}%</strong>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-black/50 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-amber-500 to-[#22c55e]"
                        style={{ width: `${r.lightingScore}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between text-[11px] mb-1">
                      <span className="text-[#94a3b8] flex items-center gap-1">
                        <Eye className="w-3 h-3 text-cyan-400" /> CCTV Surveillance Coverage
                      </span>
                      <strong className="text-white font-mono">{r.cctvCoverage}%</strong>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-black/50 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-[#3b82f6]"
                        style={{ width: `${r.cctvCoverage}%` }}
                      />
                    </div>
                  </div>
                </div>

                {r.policePresence && (
                  <div className="mt-3 flex items-center gap-1.5 text-[11px] text-[#22c55e] font-bold">
                    <ShieldCheck className="w-3.5 h-3.5" /> 24/7 Verified Police Patrol on this corridor
                  </div>
                )}
              </Card>
            )
          })}
        </div>

        <button className="primary mt-4 py-3.5 text-sm font-extrabold shadow-xl" onClick={handleStartJourney}>
          Start Safety Journey Now <ChevronRight className="w-4 h-4 ml-1 inline" />
        </button>
      </div>
    </motion.div>
  )
}
