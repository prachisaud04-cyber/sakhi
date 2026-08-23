'use client'

import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Activity,
  AlertTriangle,
  BarChart2,
  Calendar,
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
  TrendingUp,
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
  const [hoveredPoint, setHoveredPoint] = useState<number | null>(null)

  const getScoreMeta = (m: RiskMode) => {
    switch (m) {
      case 'normal':
        return {
          targetScore: 92,
          riskText: 'LOW RISK (OPTIMAL)',
          riskLevel: 'Low',
          color: '#00d9d9',
          badgeClass: 'bg-emerald-500/15 light:bg-emerald-100 border-emerald-500/30 light:border-emerald-300 text-[#22c55e] light:text-emerald-800 font-bold',
        }
      case 'suspicious':
        return {
          targetScore: 61,
          riskText: 'MODERATE RISK (CAUTION)',
          riskLevel: 'Moderate',
          color: '#f59e0b',
          badgeClass: 'bg-amber-500/15 light:bg-amber-100 border-amber-500/30 light:border-amber-300 text-[#f59e0b] light:text-amber-800 font-bold',
        }
      case 'critical':
        return {
          targetScore: 24,
          riskText: 'HIGH RISK (DISTRESS ALERT)',
          riskLevel: 'High',
          color: '#ef4444',
          badgeClass: 'bg-red-500/15 light:bg-red-100 border-red-500/30 light:border-red-300 text-[#ef4444] light:text-red-800 font-bold',
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

  // 24-hour trend data for area score graph
  const trendPoints = [
    { time: '6 AM', label: 'Morning Corridor', score: 98, lighting: '100% Daylight' },
    { time: '10 AM', label: 'Transit Peak', score: 95, lighting: '98% High Footfall' },
    { time: '2 PM', label: 'Afternoon Route', score: 96, lighting: '96% Normal Flow' },
    { time: '6 PM', label: 'Evening Commute', score: mode === 'critical' ? 45 : mode === 'suspicious' ? 68 : 94, lighting: '95% Street Lighting' },
    { time: '9 PM', label: 'Night Highway', score: mode === 'critical' ? 28 : mode === 'suspicious' ? 62 : 91, lighting: '92% Patrol Active' },
    { time: 'NOW', label: 'Live Location Check', score: displayScore, lighting: 'AI Monitored' },
  ]

  // Graph dimensions
  const svgWidth = 500
  const svgHeight = 160
  const padX = 35
  const padY = 25
  const minVal = 20
  const maxVal = 100

  const graphPoints = trendPoints.map((pt, i) => {
    const x = padX + (i / (trendPoints.length - 1)) * (svgWidth - padX * 2)
    const normY = (pt.score - minVal) / (maxVal - minVal)
    const y = svgHeight - padY - normY * (svgHeight - padY * 2)
    return { x, y, pt, i }
  })

  const pathD = graphPoints.reduce((acc, p, i, arr) => {
    if (i === 0) return `M ${p.x} ${p.y}`
    const prev = arr[i - 1]
    const cx = (prev.x + p.x) / 2
    return `${acc} C ${cx} ${prev.y}, ${cx} ${p.y}, ${p.x} ${p.y}`
  }, '')

  const areaD = `${pathD} L ${graphPoints[graphPoints.length - 1].x} ${svgHeight - padY} L ${graphPoints[0].x} ${svgHeight - padY} Z`

  const activePoint =
    hoveredPoint !== null ? trendPoints[hoveredPoint] : trendPoints[trendPoints.length - 1]

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.25 }}
      className="pb-24"
    >
      <Header title="Area Safety & Telemetry" back={goBack} />
      <div className="content">
        <div className="flex flex-col gap-1">
          <small className="eyebrow flex items-center gap-2 font-bold">
            <span className="px-2 py-0.5 rounded bg-black/40 light:bg-slate-100 border border-white/10 light:border-slate-200 text-[10px] text-[#00d9d9] light:text-[#0284c7] font-mono">
              LIVE RADAR
            </span>
            AREA SAFETY OVERVIEW
          </small>
          <h1 className="text-3xl md:text-4xl font-extrabold text-white light:text-slate-900 tracking-tight">
            Current Area Telemetry
          </h1>
          <p className="text-sm text-[#94a3b8] light:text-slate-700 font-medium">
            Autonomous threat detection based on GPS coordinates, police stations, lighting density, and historical safety index.
          </p>
        </div>

        {/* Hero Score + Summary Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column: Hero Circular Safety Score Visualization */}
          <Card noTilt className="p-6 flex flex-col items-center justify-center text-center relative overflow-hidden bg-[#0c1728]/95 light:bg-white border-cyan-500/30 light:border-slate-200 shadow-xl">
            <div className="relative w-48 h-48 flex items-center justify-center my-2">
              {/* Circular SVG Progress Ring */}
              <svg className="absolute inset-0 w-full h-full transform -rotate-90 pointer-events-none" viewBox="0 0 160 160">
                <circle cx="80" cy="80" r="70" stroke="currentColor" className="text-white/10 light:text-slate-200" strokeWidth="8" fill="none" />
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
                <span className="text-5xl font-extrabold text-white light:text-slate-900 font-mono tracking-tight">
                  {displayScore}%
                </span>
                <span className="text-xs font-black tracking-widest text-[#94a3b8] light:text-slate-600 uppercase mt-1">
                  AREA SAFETY
                </span>
              </div>
            </div>

            <span className={`text-xs font-extrabold px-3.5 py-1.5 rounded-full border uppercase tracking-wider mt-2 ${badgeClass}`}>
              ● {riskText}
            </span>
          </Card>

          {/* Right Column: Location & Summary Cards */}
          <div className="flex flex-col gap-3">
            {/* GPS Telemetry Card */}
            <Card noTilt className="p-4 bg-[#0c1728]/95 light:bg-white border-cyan-500/30 light:border-slate-200 shadow-md">
              <b className="text-sm font-bold text-white light:text-slate-900 flex items-center gap-2 mb-2">
                <MapPin className="w-4 h-4 text-[#00d9d9] light:text-[#0284c7]" /> Location &amp; Telemetry Status
              </b>
              <div className="space-y-1 text-xs font-mono text-[#cbd5e1] light:text-slate-700">
                <div className="flex justify-between">
                  <span className="text-[#94a3b8] light:text-slate-600 font-sans">Current Coordinates:</span>
                  <b className="text-white light:text-slate-900">
                    {location ? `${location.lat.toFixed(4)}°N, ${location.lng.toFixed(4)}°E` : '26.1520°N, 91.6640°E'}
                  </b>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#94a3b8] light:text-slate-600 font-sans">Safe Corridor:</span>
                  <span className="text-[#00d9d9] light:text-[#0284c7] font-bold">Jalukbari NH-27 Zone</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#94a3b8] light:text-slate-600 font-sans">Nearest Safe Haven:</span>
                  <span className="text-emerald-400 light:text-emerald-700 font-bold">Jalukbari Police Outpost (380m)</span>
                </div>
              </div>
            </Card>

            <div className="grid grid-cols-2 gap-3">
              <Card noTilt className="p-3.5 bg-[#0c1728]/95 light:bg-white border-white/10 light:border-slate-200 shadow-md">
                <small className="text-xs text-[#94a3b8] light:text-slate-600 block font-sans">GPS Tracking</small>
                <b className="text-xl font-bold text-white light:text-slate-900 mt-1 block font-mono">{isTracking ? 'Active' : 'Standby'}</b>
              </Card>
              <Card noTilt className="p-3.5 bg-[#0c1728]/95 light:bg-white border-white/10 light:border-slate-200 shadow-md">
                <small className="text-xs text-[#94a3b8] light:text-slate-600 block font-sans">Emergency Protocol</small>
                <b className="text-xl font-bold text-[#00d9d9] light:text-[#0284c7] mt-1 block font-mono">Ready</b>
              </Card>
            </div>
          </div>
        </div>

        {/* 24-HOUR SAFETY SCORE TREND GRAPH */}
        <Card noTilt className="p-5 bg-[#081120]/95 light:bg-white border-cyan-500/30 light:border-slate-200 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
            <div>
              <b className="text-base font-extrabold text-white light:text-slate-900 flex items-center gap-2">
                <BarChart2 className="w-5 h-5 text-[#00d9d9] light:text-[#0284c7]" />
                24-Hour Safety Score Trend Curve
              </b>
              <small className="text-xs text-[#94a3b8] light:text-slate-600 block">
                Continuous AI telemetry score over time throughout your corridor
              </small>
            </div>
            <button
              onClick={() => go('analytics')}
              className="px-3 py-1 rounded-xl bg-cyan-500/15 light:bg-sky-100 border border-cyan-500/30 light:border-sky-300 text-[#00d9d9] light:text-sky-800 text-xs font-bold font-mono hover:bg-cyan-500/25 flex items-center gap-1 cursor-pointer"
            >
              View Full Analytics <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Active Node Detail Callout */}
          <div className="p-2.5 mb-3 rounded-xl bg-cyan-950/30 light:bg-sky-50 border border-cyan-500/20 light:border-sky-200 flex items-center justify-between text-xs font-mono">
            <span className="text-white light:text-slate-900 font-bold">
              {activePoint.time} · {activePoint.label}
            </span>
            <div className="flex items-center gap-3">
              <span className="text-[#94a3b8] light:text-slate-600 font-sans">{activePoint.lighting}</span>
              <strong className="text-sm text-[#00d9d9] light:text-[#0284c7] font-extrabold">
                {activePoint.score}%
              </strong>
            </div>
          </div>

          {/* SVG Line Graph */}
          <div className="relative w-full rounded-2xl bg-black/40 light:bg-slate-50 border border-white/5 light:border-slate-200 p-2 sm:p-4">
            <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-36 sm:h-44 overflow-visible">
              <defs>
                <linearGradient id="areaTrendGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#00d9d9" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#00d9d9" stopOpacity="0.0" />
                </linearGradient>
                <linearGradient id="lineTrendGrad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#3b82f6" />
                  <stop offset="50%" stopColor="#00d9d9" />
                  <stop offset="100%" stopColor="#22c55e" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              {[0, 0.5, 1].map((ratio) => {
                const y = padY + ratio * (svgHeight - padY * 2)
                const valLabel = Math.round(maxVal - ratio * (maxVal - minVal))
                return (
                  <g key={ratio}>
                    <line
                      x1={padX}
                      y1={y}
                      x2={svgWidth - padX}
                      y2={y}
                      stroke="currentColor"
                      className="text-white/10 light:text-slate-300"
                      strokeDasharray="4 4"
                      strokeWidth="1"
                    />
                    <text x={padX - 6} y={y + 4} textAnchor="end" className="text-[10px] fill-[#64748b] font-mono">
                      {valLabel}%
                    </text>
                  </g>
                )
              })}

              <path d={areaD} fill="url(#areaTrendGrad)" />
              <path d={pathD} fill="none" stroke="url(#lineTrendGrad)" strokeWidth="3" strokeLinecap="round" />

              {graphPoints.map((p) => {
                const isSelected = hoveredPoint === p.i || (hoveredPoint === null && p.i === graphPoints.length - 1)
                return (
                  <g
                    key={p.i}
                    className="cursor-pointer"
                    onMouseEnter={() => setHoveredPoint(p.i)}
                    onClick={() => setHoveredPoint(p.i)}
                  >
                    {isSelected && (
                      <line
                        x1={p.x}
                        y1={padY}
                        x2={p.x}
                        y2={svgHeight - padY}
                        stroke="#00d9d9"
                        strokeWidth="1.5"
                        strokeDasharray="3 3"
                        className="light:stroke-[#0284c7]"
                      />
                    )}
                    <circle
                      cx={p.x}
                      y={p.y}
                      r={isSelected ? 8 : 4}
                      fill={isSelected ? '#00d9d9' : '#050914'}
                      stroke={isSelected ? '#ffffff' : '#00d9d9'}
                      strokeWidth="2"
                      className="light:fill-white light:stroke-[#0284c7]"
                    />
                    <text
                      x={p.x}
                      y={svgHeight - 6}
                      textAnchor="middle"
                      className={`text-[11px] font-mono font-bold ${
                        isSelected ? 'fill-[#00d9d9] light:fill-[#0284c7]' : 'fill-[#94a3b8] light:fill-slate-600'
                      }`}
                    >
                      {p.pt.time}
                    </text>
                  </g>
                )
              })}
            </svg>
          </div>
        </Card>

        {/* Risk Factors Checklist */}
        <Card noTilt className="p-5 space-y-2.5 bg-[#0c1728]/95 light:bg-white border-cyan-500/30 light:border-slate-200">
          <b className="text-base font-bold text-white light:text-slate-900 block mb-1">Contextual Risk Factors &amp; Protections</b>
          <div className="flex items-center gap-2 text-xs text-[#22c55e] light:text-emerald-700 font-semibold">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>High-accuracy GPS location telemetry stream active</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-[#22c55e] light:text-emerald-700 font-semibold">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>Privacy-first location sharing enabled ({locationSharingEnabled ? 'ON' : 'OFF'})</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-[#22c55e] light:text-emerald-700 font-semibold">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>Emergency guardians active &amp; ready for instant SMS dispatch</span>
          </div>
        </Card>
      </div>
    </motion.div>
  )
}
