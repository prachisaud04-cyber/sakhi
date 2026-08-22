'use client'

import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Activity,
  AlertTriangle,
  BarChart2,
  CheckCircle2,
  ChevronRight,
  Clock,
  Compass,
  LockKeyhole,
  MapPin,
  Navigation,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Users,
} from 'lucide-react'
import { AreaSafetyProps, RiskMode } from '@/types'
import { Card } from '@/components/ui/Card'
import { Header } from '@/components/ui/Header'

export const AreaSafetyScreen: React.FC<AreaSafetyProps> = ({
  go,
  goBack,
  mode = 'normal',
  location,
  status,
  isTracking,
  locationSharingEnabled,
}) => {
  const [displayScore, setDisplayScore] = useState<number>(92)

  const getScoreMeta = (m: RiskMode) => {
    switch (m) {
      case 'normal':
        return {
          targetScore: 92,
          riskText: 'LOW RISK',
          riskLevel: 'Low',
          color: '#19d3c5',
          badgeClass: 'bg-emerald-500/15 border-emerald-500/30 text-[#22c55e]',
        }
      case 'suspicious':
        return {
          targetScore: 61,
          riskText: 'MODERATE RISK',
          riskLevel: 'Moderate',
          color: '#f59e0b',
          badgeClass: 'bg-amber-500/15 border-amber-500/30 text-[#f59e0b]',
        }
      case 'critical':
        return {
          targetScore: 24,
          riskText: 'HIGH RISK',
          riskLevel: 'High',
          color: '#ef4444',
          badgeClass: 'bg-red-500/15 border-red-500/30 text-[#ef4444]',
        }
    }
  }

  const { targetScore, riskText, riskLevel, color, badgeClass } = getScoreMeta(mode)

  // Smooth count-up animation for percentage score
  useEffect(() => {
    let startTimestamp: number | null = null
    const initialScore = displayScore
    const duration = 650

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp
      const progress = Math.min((timestamp - startTimestamp) / duration, 1)
      const current = Math.round(initialScore + (targetScore - initialScore) * progress)
      setDisplayScore(current)
      if (progress < 1) {
        window.requestAnimationFrame(step)
      }
    }

    const animationFrame = window.requestAnimationFrame(step)
    return () => window.cancelAnimationFrame(animationFrame)
  }, [targetScore])

  // Circular progress SVG calculations
  const strokeDasharray = 440
  const strokeDashoffset = strokeDasharray - (strokeDasharray * displayScore) / 100

  // 24-hour trend data for demo chart
  const trendPoints = [
    { time: '8 AM', score: 95 },
    { time: '12 PM', score: 94 },
    { time: '4 PM', score: mode === 'critical' ? 35 : mode === 'suspicious' ? 68 : 96 },
    { time: '8 PM', score: displayScore },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.25 }}
    >
      <Header title="AREA SAFETY" back={goBack} />
      <div className="content">
        <div className="flex flex-col gap-1">
          <small className="eyebrow flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-black/40 border border-white/10 text-[9px] text-[#94a3b8] font-mono">
              DEMO SCORE
            </span>
            SAFETY OVERVIEW FOR YOUR CURRENT AREA
          </small>
          <h1 className="text-3xl font-extrabold text-white">Current area telemetry</h1>
        </div>

        {/* Hero Score + Summary Grid (Desktop 2-Column, Mobile Stack) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column: Hero Circular Safety Score Visualization */}
          <Card noTilt className="p-6 flex flex-col items-center justify-center text-center relative overflow-hidden bg-[#0f172a]/90">
            <div className="relative w-48 h-48 flex items-center justify-center my-2">
              {/* Circular SVG Progress Ring */}
              <svg className="absolute inset-0 w-full h-full transform -rotate-90 pointer-events-none" viewBox="0 0 160 160">
                <circle cx="80" cy="80" r="70" stroke="rgba(255, 255, 255, 0.08)" strokeWidth="8" fill="none" />
                <motion.circle
                  cx="80"
                  cy="80"
                  r="70"
                  stroke={color}
                  strokeWidth="8"
                  strokeDasharray={strokeDasharray}
                  animate={{ strokeDashoffset }}
                  transition={{ duration: 0.7, ease: 'easeOut' }}
                  strokeLinecap="round"
                  fill="none"
                />
              </svg>
              <div className="flex flex-col items-center">
                <span className="text-5xl font-extrabold text-white font-mono tracking-tight">
                  {displayScore}%
                </span>
                <span className="text-xs font-black tracking-widest text-[#cbd5e1] uppercase mt-1">
                  AREA SAFETY
                </span>
              </div>
            </div>

            <span className={`text-xs font-extrabold px-3 py-1 rounded-full border uppercase tracking-wider mt-2 ${badgeClass}`}>
              ● {riskText}
            </span>
          </Card>

          {/* Right Column: Location & Summary Cards */}
          <div className="flex flex-col gap-4">
            {/* GPS Telemetry Card */}
            <Card noTilt className="p-5">
              <b className="text-sm font-bold text-white flex items-center gap-2 mb-2">
                <MapPin className="w-4 h-4 text-[#19d3c5]" /> Location &amp; Telemetry Status
              </b>
              <div className="space-y-1.5 text-xs text-[#cbd5e1] font-mono bg-black/30 p-3 rounded-xl border border-white/10">
                <div>
                  <span className="text-[#94a3b8] font-sans">Current location: </span>
                  <span className="text-white font-bold">
                    {location
                      ? `${location.lat.toFixed(4)}° N, ${location.lng.toFixed(4)}° E`
                      : 'Location unavailable'}
                  </span>
                </div>
                <div>
                  <span className="text-[#94a3b8] font-sans">GPS Signal: </span>
                  <span className={isTracking && location ? 'text-[#22c55e] font-bold' : 'text-amber-400 font-bold'}>
                    {isTracking && location ? 'GPS Active' : status === 'searching' ? 'Searching...' : 'Idle / Off'}
                  </span>
                </div>
                <div className="text-[11px] text-[#94a3b8] font-sans pt-1">Updated just now</div>
              </div>
            </Card>

            {/* 4 Summary Stat Metrics */}
            <div className="grid grid-cols-2 gap-3" data-no-tilt>
              <Card noTilt className="p-3.5 border-white/10">
                <small className="text-xs text-[#94a3b8] block">Safety Score</small>
                <b className="text-xl font-mono font-extrabold text-white mt-1">{displayScore}%</b>
              </Card>
              <Card noTilt className="p-3.5 border-white/10">
                <small className="text-xs text-[#94a3b8] block">Risk Level</small>
                <b className="text-xl font-bold mt-1" style={{ color }}>{riskLevel}</b>
              </Card>
              <Card noTilt className="p-3.5 border-white/10">
                <small className="text-xs text-[#94a3b8] block">GPS Status</small>
                <b className="text-xl font-bold text-white mt-1">{isTracking ? 'Active' : 'Idle'}</b>
              </Card>
              <Card noTilt className="p-3.5 border-white/10">
                <small className="text-xs text-[#94a3b8] block">Emergency Contacts</small>
                <b className="text-xl font-bold text-[#19d3c5] mt-1">2 Configured</b>
              </Card>
            </div>
          </div>
        </div>

        {/* Analytics Section: SAFETY TREND */}
        <Card noTilt className="p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <b className="text-lg font-extrabold text-white flex items-center gap-2">
                <BarChart2 className="w-5 h-5 text-[#19d3c5]" /> Safety Score Trend
              </b>
              <small className="text-[#94a3b8] text-xs">24-hour contextual evaluation trend</small>
            </div>
            <span className="px-2 py-0.5 rounded bg-black/40 border border-white/10 text-[9px] font-mono text-[#94a3b8]">
              DEMO ANALYTICS
            </span>
          </div>

          {/* Responsive Trend Visualizer */}
          <div data-no-tilt className="h-36 flex items-end justify-between gap-4 pt-6 pb-2 px-4 border-b border-white/10">
            {trendPoints.map((pt) => {
              const hPercent = Math.max(15, pt.score)
              return (
                <div key={pt.time} data-no-tilt className="flex-1 flex flex-col items-center gap-2 relative">
                  <span className="text-xs font-mono font-bold text-white">{pt.score}%</span>
                  <div
                    data-no-tilt
                    style={{ height: `${hPercent}%` }}
                    className="w-full max-w-[40px] rounded-t-lg bg-gradient-to-t from-[#0891b2] to-[#19d3c5] shadow-md shadow-cyan-500/20"
                  />
                  <span className="text-[11px] text-[#94a3b8] font-mono">{pt.time}</span>
                </div>
              )
            })}
          </div>
        </Card>

        {/* Risk Factors Checklist */}
        <Card noTilt className="p-5 space-y-2.5">
          <b className="text-base font-bold text-white block mb-1">Contextual Risk Factors</b>
          <div className="flex items-center gap-2 text-xs text-[#22c55e]">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>GPS location tracking available</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-[#22c55e]">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>Privacy-first location sharing enabled ({locationSharingEnabled ? 'ON' : 'OFF'})</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-[#22c55e]">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>2 Emergency contacts active &amp; ready for escalation</span>
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold" style={{ color }}>
            {mode === 'normal' ? (
              <>
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                <span>No critical demo alerts detected in current area</span>
              </>
            ) : mode === 'suspicious' ? (
              <>
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <span>Elevated demo risk simulated (unusual route activity)</span>
              </>
            ) : (
              <>
                <ShieldAlert className="w-4 h-4 flex-shrink-0" />
                <span>High demo risk simulated (priority safety actions active)</span>
              </>
            )}
          </div>
        </Card>

        {/* Quick Action Navigation Buttons (Using Existing Architecture) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button className="primary flex items-center justify-center gap-2" onClick={() => go('map')}>
            <Navigation className="w-4 h-4" /> Open Safety Map
          </button>
          <button className="secondary flex items-center justify-center gap-2" onClick={() => go('profile')}>
            <Users className="w-4 h-4 text-[#19d3c5]" /> Manage Contacts
          </button>
          <button className="secondary flex items-center justify-center gap-2" onClick={() => go('privacy')}>
            <LockKeyhole className="w-4 h-4 text-[#19d3c5]" /> Privacy Settings
          </button>
        </div>
      </div>
    </motion.div>
  )
}
