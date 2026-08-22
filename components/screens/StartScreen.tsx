'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Check as CheckIcon, ChevronRight, HeartPulse, LockKeyhole, Shield, ShieldCheck } from 'lucide-react'
import { StartProps } from '@/types'
import { Card } from '@/components/ui/Card'
import { Header } from '@/components/ui/Header'

export const StartScreen: React.FC<StartProps> = ({ go, goBack, startTracking, locationSharingEnabled }) => {
  const handleContinue = () => {
    if (locationSharingEnabled) {
      startTracking()
    }
    go('routes')
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.25 }}
    >
      <Header title="Start a journey" back={goBack} />
      <div className="content">
        <div className="intro">
          <Shield />
          <h1>
            Travel with
            <br />
            <em>confidence.</em>
          </h1>
          <p>Tell SAKHI where you&apos;re going. We&apos;ll quietly watch for contextual anomalies along the way.</p>
        </div>
        <label>
          Where are you going
          <input defaultValue="Narengi, Bengaluru" />
        </label>
        <label>
          Expected arrival
          <input defaultValue="Today, 9:10 PM" />
        </label>
        <div className="field">Emergency contact</div>
        <Card className="row">
          <span className="avatar">AR</span>
          <span>
            <b>Ananya Rao</b>
            <small>Sister · Selected</small>
          </span>
          <CheckIcon />
        </Card>
        <div className="field">Protection level</div>
        <Card className="row selected">
          <ShieldCheck />
          <span>
            <b>Balanced</b>
            <small>Smart contextual monitoring</small>
          </span>
          <CheckIcon />
        </Card>
        <Card className="privacy">
          <HeartPulse />
          <span>
            <b>Optional health data</b>
            <small>SAKHI works without a smartwatch.</small>
          </span>
          <button className="toggle">
            <i />
          </button>
        </Card>
        <div className="note">
          <LockKeyhole />
          Location is monitored only during this Safety Journey.
        </div>
        <button className="primary" onClick={handleContinue}>
          Continue to route safety <ChevronRight />
        </button>
      </div>
    </motion.div>
  )
}
