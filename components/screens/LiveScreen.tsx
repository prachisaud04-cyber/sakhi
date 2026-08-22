'use client'

import React from 'react'
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
  Wifi,
} from 'lucide-react'
import { LiveProps } from '@/types'
import { Card } from '@/components/ui/Card'
import { Header } from '@/components/ui/Header'
import { Map } from '@/components/ui/Map'
import { Pill } from '@/components/ui/Pill'
import { Ring } from '@/components/ui/Ring'

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
  const critical = mode === 'critical'

  const locationText = location
    ? `Lat: ${location.lat.toFixed(3)}°, Lng: ${location.lng.toFixed(3)}°`
    : critical
    ? 'Higher-risk area'
    : 'On planned route'

  const signals: [LucideIcon, string, string][] = [
    [MapPin, 'Location', locationText],
    [Route, 'Route behaviour', critical ? 'Deviation detected' : 'Following route'],
    [Activity, 'Movement', critical ? 'Unexpected stop' : 'Moving normally'],
    [HeartPulse, 'Health data', 'Not connected'],
    [BatteryMedium, 'Device status', '74% battery'],
    [Wifi, 'Network', isTracking ? 'GPS Active' : 'Strong'],
  ]

  const handleEndJourney = () => {
    stopTracking()
    go('home')
  }

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
            <h1>Narengi</h1>
            <small>
              <Clock3 /> Arriving in 18 min
            </small>
          </span>
          <Pill tone={critical ? 'warn' : 'safe'}>{critical ? 'Attention' : 'Protected'}</Pill>
        </div>

        <Map
          danger={critical}
          location={location}
          status={status}
          error={error}
          isTracking={isTracking}
          onRequestPermission={startTracking}
          locationSharingEnabled={locationSharingEnabled}
          height="320px"
        />

        <Card>
          <div className="risk-top">
            <span>
              <small className="eyebrow">CONTEXTUAL AI RISK ENGINE</small>
              <h2>Current Safety Score</h2>
              <small>This score represents current journey risk based on multiple signals.</small>
            </span>
            <Ring score={score} tone={critical ? 'warn' : 'safe'} />
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
          <button className="warning" onClick={() => go('check')}>
            <AlertTriangle /> Review potential anomaly <ChevronRight />
          </button>
        )}

        <button className="emergency" onClick={() => go('emergency')}>
          <Siren />
          <b>
            EMERGENCY<small>Press and hold to activate emergency mode</small>
          </b>
        </button>

        <button className="quiet" onClick={handleEndJourney}>
          End Safety Journey
        </button>
      </div>
    </motion.div>
  )
}
