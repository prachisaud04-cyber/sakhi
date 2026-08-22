'use client'

import React, { useEffect, useState } from 'react'
import {
  AlertTriangle,
  ArrowLeft,
  Check as CheckIcon,
  Clock,
  ShieldCheck,
  Siren,
  Smartphone,
} from 'lucide-react'
import { CheckProps } from '@/types'
import { useDeviceTelemetry } from '@/hooks/useDeviceTelemetry'
import { Card } from '@/components/ui/Card'
import { Pill } from '@/components/ui/Pill'

export const CheckScreen: React.FC<CheckProps> = ({ go, goBack, score, mode }) => {
  const [secondsRemaining, setSecondsRemaining] = useState<number>(15)
  const telemetry = useDeviceTelemetry()

  // Hardware Haptic Warning Vibration on mount
  useEffect(() => {
    telemetry.hapticVibrate([200, 100, 200])
  }, [telemetry])

  // 15-second countdown timer for auto-escalation
  useEffect(() => {
    if (secondsRemaining <= 0) {
      telemetry.hapticVibrate([500, 100, 500])
      go('emergency')
      return
    }

    const timer = setInterval(() => {
      setSecondsRemaining((prev) => prev - 1)
      if (secondsRemaining <= 3) {
        telemetry.hapticVibrate(80)
      }
    }, 1000)

    return () => clearInterval(timer)
  }, [secondsRemaining, go, telemetry])

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
        <AlertTriangle className="animate-bounce text-amber-400" />
        <Pill tone="warn">Potential risk detected</Pill>
        <h1>
          Are you
          <br />
          <em>okay?</em>
        </h1>
        <p>We noticed unusual route deviations or sudden stop during your journey.</p>

        {/* Auto-escalation countdown ring */}
        <div className="w-full p-4 rounded-2xl bg-amber-950/40 border border-amber-500/40 flex items-center justify-between text-left">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full border-2 border-amber-400 flex items-center justify-center font-mono font-extrabold text-amber-300 text-sm animate-pulse">
              {secondsRemaining}s
            </div>
            <div>
              <b className="text-xs text-white block">Auto-Escalation Timer</b>
              <small className="text-[11px] text-amber-200 block">
                Alerting emergency contacts in {secondsRemaining}s if no response
              </small>
            </div>
          </div>
          <Clock className="w-4 h-4 text-amber-400 animate-spin" />
        </div>

        <Card>
          <b>Detected telemetry signals</b>
          <p>
            Route deviation · Stationary stop · Device: {telemetry.platform} · Battery: {telemetry.batteryStatusText}
            {mode === 'critical' ? ' · Rapid deceleration anomaly' : ''}
          </p>
          <strong>Potential risk · {score}/100</strong>
        </Card>

        <button className="primary" onClick={() => go('live')}>
          <CheckIcon />
          I&apos;m Safe (Cancel Alert)
        </button>

        <button className="secondary" onClick={() => go('emergency')}>
          <Siren /> I Need Help (Instant SOS)
        </button>

        <button className="quiet" onClick={() => go('emergency')}>
          Can&apos;t respond (Auto-Escalate Now)
        </button>
      </div>
    </div>
  )
}
