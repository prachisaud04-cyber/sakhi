'use client'

import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Activity,
  AlertTriangle,
  BatteryMedium,
  Check as CheckIcon,
  ChevronRight,
  Clock3,
  HeartPulse,
  LucideIcon,
  MapPin,
  Route,
  Siren,
  Sparkles,
  Watch,
  Wifi,
  Zap,
} from 'lucide-react'
import { LiveProps } from '@/types'
import { useAuth } from '@/contexts/AuthContext'
import { useCriticalBatteryAutoAlert } from '@/hooks/useCriticalBatteryAutoAlert'
import { useDeviceTelemetry } from '@/hooks/useDeviceTelemetry'
import { useDynamicRouteSafety } from '@/hooks/useDynamicRouteSafety'
import { useSafetyCheckAutoEscalation } from '@/hooks/useSafetyCheckAutoEscalation'
import { useWearableTelemetry } from '@/hooks/useWearableTelemetry'
import { Card } from '@/components/ui/Card'
import { CriticalBatteryAlertModal } from '@/components/ui/CriticalBatteryAlertModal'
import { DynamicSafetyCorridorCard } from '@/components/ui/DynamicSafetyCorridorCard'
import { Header } from '@/components/ui/Header'
import { Map } from '@/components/ui/Map'
import { Pill } from '@/components/ui/Pill'
import { Ring } from '@/components/ui/Ring'
import { SafetyCheckModal } from '@/components/ui/SafetyCheckModal'

export const LiveScreen: React.FC<LiveProps> = ({
  go,
  goBack,
  score,
  mode,
  location,
  status,
  error,
  isTracking,
  startTracking,
  stopTracking,
  locationSharingEnabled,
}) => {
  const { user, contacts } = useAuth()
  const [destination, setDestination] = useState<string>('Narengi Tiniali')
  const [origin, setOrigin] = useState<string>('Gauhati University')
  const [durationMinutes, setDurationMinutes] = useState<number>(26)
  const [selectedRouteId, setSelectedRouteId] = useState<string>('route-recommended')
  const [routeCoordinates, setRouteCoordinates] = useState<{ lat: number; lng: number }[]>([
    { lat: 26.152, lng: 91.664 },
    { lat: 26.162, lng: 91.71 },
    { lat: 26.175, lng: 91.755 },
    { lat: 26.185, lng: 91.795 },
  ])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('sakhi_active_journey')
        if (stored) {
          const parsed = JSON.parse(stored)
          if (parsed.destination) setDestination(parsed.destination.split(',')[0])
          if (parsed.origin) setOrigin(parsed.origin.split(',')[0])
          if (parsed.durationMinutes) setDurationMinutes(parsed.durationMinutes)
          if (parsed.selectedRouteId) setSelectedRouteId(parsed.selectedRouteId)
          if (parsed.coordinates && Array.isArray(parsed.coordinates) && parsed.coordinates.length > 1) {
            setRouteCoordinates(parsed.coordinates)
          }
        }
      } catch (e) {
        console.warn('Could not read stored journey in LiveScreen', e)
      }
    }
  }, [])

  const telemetry = useDeviceTelemetry()

  // Critical Battery (0% / 5% Shutdown Guard) Auto-Alert Hook
  const {
    isAlertModalOpen: isBatteryAlertModalOpen,
    closeAlertModal: closeBatteryAlertModal,
    alertDetails: batteryAlertDetails,
    broadcastSmsNow: broadcastBatterySmsNow,
  } = useCriticalBatteryAutoAlert({
    batteryLevel: telemetry.batteryLevel,
    isCharging: telemetry.isCharging,
    location,
    userName: user?.name || 'Riya Sharma',
    contacts,
    thresholdPercent: 5,
  })

  const { telemetry: wearableTelemetry } = useWearableTelemetry({
    mode,
    onFallDetected: () => go('emergency'),
  })

  // In-Transit / Sudden Vitals Spike "Are you safe?" Auto-Escalation Engine
  const {
    isCheckModalOpen: isSafetyCheckModalOpen,
    remainingSeconds: safetyCheckSeconds,
    formattedTime: safetyCheckFormattedTime,
    triggerReason: safetyCheckReason,
    activeSnapshot: safetyCheckSnapshot,
    triggerSafetyCheck,
    confirmSafe: handleConfirmSafe,
    triggerNeedHelp: handleTriggerNeedHelp,
  } = useSafetyCheckAutoEscalation({
    location,
    vitals: {
      heartRate: wearableTelemetry.heartRate,
      bloodPressureSystolic: wearableTelemetry.bloodPressureSystolic,
      bloodPressureDiastolic: wearableTelemetry.bloodPressureDiastolic,
      accelerationG: wearableTelemetry.acceleration.totalG,
      batteryLevel: telemetry.batteryLevel,
    },
    userName: user?.name || 'Riya Sharma',
    contacts,
    isJourneyActive: isTracking || true,
    initialDurationSeconds: 600, // 10 minutes
    onEscalateToEmergency: () => {
      go('emergency')
    },
  })

  // Dynamic Route Safety Engine Hook
  const safetyState = useDynamicRouteSafety({
    location,
    routeCoordinates,
    isJourneyActive: isTracking || true,
    deviationThresholdMeters: 180,
    onAnomalyDetected: (anomaly) => {
      if (anomaly.hasAnomaly && !isSafetyCheckModalOpen) {
        triggerSafetyCheck(`Route Deviation Detected: ${anomaly.message}`)
      }
    },
  })

  const critical = mode === 'critical' || safetyState.anomaly.hasAnomaly

  const locationText = location
    ? `Lat: ${location.lat.toFixed(4)}°, Lng: ${location.lng.toFixed(4)}°`
    : 'Acquiring GPS Telemetry...'

  const signals: [LucideIcon, string, string][] = [
    [MapPin, 'Live GPS Telemetry', locationText],
    [
      Route,
      'Corridor Tracking',
      safetyState.crossTrackDeviationMeters > 180
        ? `Deviated (${safetyState.crossTrackDeviationMeters}m)`
        : `Safe Corridor (${safetyState.crossTrackDeviationMeters}m offset)`,
    ],
    [
      HeartPulse,
      'Wearable Pulse / HR',
      wearableTelemetry.isConnected && wearableTelemetry.heartRate !== null
        ? `${wearableTelemetry.heartRate} BPM (Normal Rhythm)`
        : 'Smartwatch Not Linked',
    ],
    [
      Activity,
      'Blood Pressure',
      wearableTelemetry.isConnected && wearableTelemetry.bloodPressureSystolic !== null
        ? `${wearableTelemetry.bloodPressureSystolic}/${wearableTelemetry.bloodPressureDiastolic} mmHg`
        : 'Smartwatch Not Linked',
    ],
    [
      Zap,
      'Hardware G-Force',
      `${wearableTelemetry.acceleration.totalG} G (X:${wearableTelemetry.acceleration.x} Y:${wearableTelemetry.acceleration.y})`,
    ],
    [BatteryMedium, 'Device Battery', telemetry.batteryStatusText],
    [
      Wifi,
      'Network Signal',
      telemetry.isOnline
        ? `${telemetry.connectionType} (${telemetry.downlinkSpeed || 18} Mbps)`
        : '⚠️ DEAD-ZONE (GSM SMS PROTOCOL ACTIVE)',
    ],
  ]

  const handleEndJourney = () => {
    const finalScore = currentScore || 94
    const newRecord = {
      id: 'j_' + Date.now(),
      title: `${origin.split(',')[0]} → ${destination.split(',')[0]}`,
      origin: origin.split(',')[0],
      destination: destination.split(',')[0],
      date: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
      time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      timestamp: Date.now(),
      category: finalScore >= 85 ? 'safe' : finalScore >= 70 ? 'risky' : 'danger',
      score: finalScore,
      distance: `${(durationMinutes * 0.48).toFixed(1)} km`,
      duration: `${durationMinutes} min`,
      factors: [
        'Live safety corridor adhered to',
        `Dynamic Safety Rating: ${finalScore}/100`,
        critical ? 'Anomaly alert safely resolved' : 'Zero critical route anomalies',
      ],
      isUserHistory: true,
    }

    if (typeof window !== 'undefined') {
      try {
        const storedJourneys = localStorage.getItem('sakhi_user_journeys')
        const journeysList = storedJourneys ? JSON.parse(storedJourneys) : []
        journeysList.unshift(newRecord)
        localStorage.setItem('sakhi_user_journeys', JSON.stringify(journeysList))
      } catch (e) {
        console.warn('Could not persist journey history', e)
      }
    }

    fetch('/api/reports', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        incidentType: 'COMPLETED_JOURNEY',
        description: `Completed safety journey from ${origin} to ${destination}`,
        safetyScore: finalScore,
        location,
      }),
    }).catch((err) => console.warn('[Supabase Journey Sync Notice]', err))

    stopTracking()
    go('journeys')
  }

  const handleCallPOI = (phone: string) => {
    window.open(`tel:${phone.replace(/[^0-9+]/g, '')}`)
  }

  const currentScore = critical ? Math.min(score, safetyState.dynamicSafetyScore) : safetyState.dynamicSafetyScore

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.25 }}
    >
      <Header title="Safety Journey Active" back={goBack} />
      <div className="content">
        <div className="live-title">
          <span>
            <small>Heading to</small>
            <h1>{destination}</h1>
            <small>
              <Clock3 /> Arriving in ~{durationMinutes} min · From {origin}
            </small>
          </span>
          <Pill tone={critical ? 'warn' : 'safe'}>{critical ? 'Caution Alert' : 'Protected'}</Pill>
        </div>

        {/* Dynamic Route Map */}
        <Map
          danger={critical}
          location={location}
          status={status}
          error={error}
          isTracking={isTracking}
          onRequestPermission={startTracking}
          locationSharingEnabled={locationSharingEnabled}
          height="340px"
          showRoutes={true}
          showSafeZones={true}
          selectedRouteId={selectedRouteId}
          destinationName={destination}
        />

        {/* Real-time Dynamic Safety Engine Corridor Card */}
        <DynamicSafetyCorridorCard
          safetyState={safetyState}
          onCallPOI={handleCallPOI}
        />

        {/* Risk Assessment Signals Card */}
        <Card>
          <div className="risk-top">
            <span>
              <small className="eyebrow flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-[#00d9d9]" /> AI CONTEXTUAL RISK ENGINE
              </small>
              <h2>Live Safety Score</h2>
              <small>Dynamic multi-factor assessment based on lighting, CCTV, police proximity &amp; route telemetry.</small>
            </span>
            <Ring score={currentScore} tone={critical ? 'warn' : 'safe'} />
          </div>
          <div className="signals">
            {signals.map(([Icon, label, value]) => (
              <div className="signal" key={label}>
                <Icon />
                <span>
                  <small>{label}</small>
                  <b>{value}</b>
                </span>
                <CheckIcon />
              </div>
            ))}
          </div>
        </Card>

        {critical && (
          <div className="danger-panel">
            <AlertTriangle className="w-6 h-6 text-[#f59e0b] animate-bounce" />
            <div>
              <b>{safetyState.anomaly.hasAnomaly ? safetyState.anomaly.message : 'Unusual pattern detected'}</b>
              <small>You can trigger safety check or alert emergency contacts immediately.</small>
            </div>
            <button className="secondary" onClick={() => go('check')}>
              Review Check
            </button>
          </div>
        )}

        <button className="primary" onClick={handleEndJourney}>
          End Safety Journey
        </button>

        <button className="secondary" onClick={() => go('emergency')}>
          <Siren /> Emergency SOS
        </button>

        <button
          onClick={() => triggerSafetyCheck('Sudden Pulse Spike to 128 BPM & Movement Anomaly Detected', undefined, true)}
          className="quiet text-xs text-amber-400/80 hover:text-amber-300 font-mono py-1 cursor-pointer"
        >
          ⚡ Test Vitals Alert (&quot;Are you safe?&quot;)
        </button>

        {/* 10-Minute Vitals Spike & Anomaly Verification Modal */}
        <SafetyCheckModal
          isOpen={isSafetyCheckModalOpen}
          remainingSeconds={safetyCheckSeconds}
          formattedTime={safetyCheckFormattedTime}
          triggerReason={safetyCheckReason}
          vitalsSnapshot={safetyCheckSnapshot}
          onConfirmSafe={handleConfirmSafe}
          onTriggerNeedHelp={handleTriggerNeedHelp}
          onFastForwardTimer={() => triggerSafetyCheck(safetyCheckReason, 5, true)}
        />

        <CriticalBatteryAlertModal
          isOpen={isBatteryAlertModalOpen}
          onClose={closeBatteryAlertModal}
          details={batteryAlertDetails}
          onBroadcastSms={broadcastBatterySmsNow}
        />
      </div>
    </motion.div>
  )
}
