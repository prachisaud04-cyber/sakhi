'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { ChevronRight, Hospital, ShieldCheck } from 'lucide-react'
import { RoutesProps, Tone } from '@/types'
import { Card } from '@/components/ui/Card'
import { Header } from '@/components/ui/Header'
import { Map } from '@/components/ui/Map'

interface RouteOption {
  title: string
  score: number
  time: string
  desc: string
  tone: Tone
}

const routesData: RouteOption[] = [
  {
    title: 'Recommended route',
    score: 92,
    time: '26 min',
    desc: 'Well-lit · High activity · Lower incident density',
    tone: 'safe',
  },
  {
    title: 'Fastest route',
    score: 61,
    time: '22 min',
    desc: 'Low activity · Poor lighting section',
    tone: 'warn',
  },
  {
    title: 'Quiet streets',
    score: 78,
    time: '31 min',
    desc: 'Moderate lighting · Lower incident density',
    tone: 'safe',
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
}) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -10 }}
    transition={{ duration: 0.25 }}
  >
    <Header title="Choose your route" back={goBack} />
    <div className="content">
      <small className="eyebrow">SAFETY ANALYSIS COMPLETE</small>
      <h1>
        Which way feels
        <br />
        <em>right for you?</em>
      </h1>
      <Map
        location={location}
        status={status}
        error={error}
        isTracking={isTracking}
        onRequestPermission={startTracking}
        locationSharingEnabled={locationSharingEnabled}
        height="280px"
      />
      <div className="note">
        <ShieldCheck />
        SAKHI prioritizes safety, not just speed.
      </div>
      {routesData.map((r, i) => (
        <Card key={r.title} className={i === 0 ? 'selected' : ''} onClick={() => go('live')}>
          <div className="route-top">
            <span>
              <b>{r.title}</b>
              <strong>{r.time}</strong>
            </span>
            <span className={r.tone}>
              <b>{r.score}</b>
              <small>/100</small>
            </span>
          </div>
          <p>{r.desc}</p>
          <small>
            <Hospital /> 3 emergency services <ChevronRight />
          </small>
        </Card>
      ))}
    </div>
  </motion.div>
)
