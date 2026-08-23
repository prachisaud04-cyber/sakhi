'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Activity,
  AlertTriangle,
  ArrowUpRight,
  BarChart2,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Clock,
  HeartPulse,
  Info,
  MapPin,
  Moon,
  Route,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Sun,
  TrendingUp,
  Zap,
} from 'lucide-react'
import { AnalyticsProps } from '@/types'
import { Card } from '@/components/ui/Card'
import { Header } from '@/components/ui/Header'

type Timeframe = '7d' | '30d' | '90d'
type MetricType = 'score' | 'vitals' | 'lighting'

interface DataPoint {
  label: string
  fullDate: string
  score: number
  trips: number
  avgHr: number
  lighting: number
  safeCorridor: string
  incidents: number
}

const DATA_7D: DataPoint[] = [
  { label: 'Mon', fullDate: 'Aug 18, 2026', score: 96, trips: 3, avgHr: 72, lighting: 98, safeCorridor: 'Jalukbari NH-27', incidents: 0 },
  { label: 'Tue', fullDate: 'Aug 19, 2026', score: 94, trips: 2, avgHr: 76, lighting: 92, safeCorridor: 'Panbazar High St', incidents: 0 },
  { label: 'Wed', fullDate: 'Aug 20, 2026', score: 98, trips: 4, avgHr: 70, lighting: 100, safeCorridor: 'GS Road Safe Corridor', incidents: 0 },
  { label: 'Thu', fullDate: 'Aug 21, 2026', score: 92, trips: 2, avgHr: 78, lighting: 90, safeCorridor: 'Ulubari Flyover Corridor', incidents: 0 },
  { label: 'Fri', fullDate: 'Aug 22, 2026', score: 97, trips: 5, avgHr: 74, lighting: 96, safeCorridor: 'Beltola Main Rd', incidents: 0 },
  { label: 'Sat', fullDate: 'Aug 23, 2026', score: 95, trips: 3, avgHr: 73, lighting: 95, safeCorridor: 'Zoo Road Transit Route', incidents: 0 },
  { label: 'Sun', fullDate: 'Aug 24, 2026', score: 99, trips: 2, avgHr: 68, lighting: 99, safeCorridor: 'Gauhati University Campus', incidents: 0 },
]

const DATA_30D: DataPoint[] = [
  { label: 'W1', fullDate: 'Week 1 (Aug 1 - 7)', score: 94, trips: 16, avgHr: 74, lighting: 95, safeCorridor: 'Jalukbari & Panbazar', incidents: 0 },
  { label: 'W2', fullDate: 'Week 2 (Aug 8 - 14)', score: 96, trips: 19, avgHr: 72, lighting: 97, safeCorridor: 'GS Road Corridors', incidents: 0 },
  { label: 'W3', fullDate: 'Week 3 (Aug 15 - 21)', score: 93, trips: 14, avgHr: 76, lighting: 92, safeCorridor: 'Zoo Road Transit', incidents: 0 },
  { label: 'W4', fullDate: 'Week 4 (Aug 22 - 28)', score: 98, trips: 18, avgHr: 71, lighting: 98, safeCorridor: 'All City Safe Zones', incidents: 0 },
]

const DATA_90D: DataPoint[] = [
  { label: 'Jun', fullDate: 'June 2026', score: 93, trips: 62, avgHr: 75, lighting: 94, safeCorridor: 'Guwahati Metro Zone', incidents: 0 },
  { label: 'Jul', fullDate: 'July 2026', score: 95, trips: 68, avgHr: 73, lighting: 96, safeCorridor: 'Guwahati Metro Zone', incidents: 0 },
  { label: 'Aug', fullDate: 'August 2026', score: 97, trips: 71, avgHr: 71, lighting: 98, safeCorridor: 'Smart City Safe Routes', incidents: 0 },
]

const HOURLY_HEATMAP = [
  { hour: '06 AM', score: 99, status: 'Optimal Daylight', safe: true },
  { hour: '09 AM', score: 98, status: 'High Police Patrol', safe: true },
  { hour: '12 PM', score: 97, status: 'Crowded Transit', safe: true },
  { hour: '03 PM', score: 96, status: 'Well Lit Corridor', safe: true },
  { hour: '06 PM', score: 95, status: 'Peak Commute Hour', safe: true },
  { hour: '09 PM', score: 92, status: 'Active Night Patrols', safe: true },
  { hour: '11 PM', score: 89, status: 'Caution Encouraged', safe: false },
]

export const AnalyticsScreen: React.FC<AnalyticsProps> = ({ go, goBack }) => {
  const [timeframe, setTimeframe] = useState<Timeframe>('7d')
  const [metric, setMetric] = useState<MetricType>('score')
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null)

  const activeData =
    timeframe === '7d' ? DATA_7D : timeframe === '30d' ? DATA_30D : DATA_90D

  const selectedPoint =
    hoveredIdx !== null && activeData[hoveredIdx]
      ? activeData[hoveredIdx]
      : activeData[activeData.length - 1]

  // Compute SVG Bézier Path
  const svgWidth = 600
  const svgHeight = 200
  const paddingX = 40
  const paddingY = 30

  const getMetricVal = (d: DataPoint) => {
    if (metric === 'score') return d.score
    if (metric === 'vitals') return d.avgHr
    return d.lighting
  }

  const minVal =
    metric === 'score' ? 80 : metric === 'vitals' ? 60 : 80
  const maxVal =
    metric === 'score' ? 100 : metric === 'vitals' ? 95 : 100

  const points = activeData.map((d, i) => {
    const val = getMetricVal(d)
    const x = paddingX + (i / (activeData.length - 1)) * (svgWidth - paddingX * 2)
    const normalizedY = (val - minVal) / (maxVal - minVal)
    const y = svgHeight - paddingY - normalizedY * (svgHeight - paddingY * 2)
    return { x, y, val, d, i }
  })

  // Build SVG path
  const pathD = points.reduce((acc, p, i, arr) => {
    if (i === 0) return `M ${p.x} ${p.y}`
    const prev = arr[i - 1]
    const cx = (prev.x + p.x) / 2
    return `${acc} C ${cx} ${prev.y}, ${cx} ${p.y}, ${p.x} ${p.y}`
  }, '')

  const areaD = `${pathD} L ${points[points.length - 1].x} ${svgHeight - paddingY} L ${points[0].x} ${svgHeight - paddingY} Z`

  const avgScore = Math.round(
    activeData.reduce((acc, d) => acc + d.score, 0) / activeData.length
  )
  const totalTrips = activeData.reduce((acc, d) => acc + d.trips, 0)

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.25 }}
      className="pb-24"
    >
      <Header title="Safety Analytics & Trends" back={goBack} />
      <div className="content">
        {/* Top Eyebrow & Title */}
        <div>
          <small className="eyebrow flex items-center gap-1.5 font-bold">
            <Sparkles className="w-3.5 h-3.5" /> INTELLIGENCE & TELEMETRY
          </small>
          <h1 className="text-3xl md:text-4xl font-extrabold text-white light:text-slate-900 tracking-tight mt-1">
            Safety Score Trend
            <br />
            <em>&amp; Route Analytics.</em>
          </h1>
          <p className="text-sm text-[#94a3b8] light:text-slate-700 mt-1 max-w-xl font-medium">
            Continuous AI telemetry analysis showing your safe transit corridor efficiency, vitals stability, and journey safety ratings.
          </p>
        </div>

        {/* 4 Summary Stat Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Card noTilt className="p-4 bg-[#0c1728]/90 light:bg-white border-cyan-500/20 light:border-slate-200">
            <small className="text-[#94a3b8] light:text-slate-600 text-xs font-mono block mb-1">
              AVERAGE SAFETY
            </small>
            <div className="flex items-baseline gap-1">
              <b className="text-2xl font-extrabold text-[#00d9d9] light:text-[#0284c7]">
                {avgScore}%
              </b>
              <span className="text-xs font-bold text-emerald-400 light:text-emerald-700">Optimal</span>
            </div>
            <span className="text-[11px] text-[#22c55e] light:text-emerald-700 flex items-center gap-1 mt-1 font-semibold">
              <TrendingUp className="w-3 h-3" /> +4% above benchmark
            </span>
          </Card>

          <Card noTilt className="p-4 bg-[#0c1728]/90 light:bg-white border-emerald-500/20 light:border-slate-200">
            <small className="text-[#94a3b8] light:text-slate-600 text-xs font-mono block mb-1">
              SAFE COMPLETION
            </small>
            <div className="flex items-baseline gap-1">
              <b className="text-2xl font-extrabold text-[#22c55e] light:text-emerald-700">
                100%
              </b>
            </div>
            <span className="text-[11px] text-[#94a3b8] light:text-slate-600 block mt-1 font-mono">
              0 Distress Escalations
            </span>
          </Card>

          <Card noTilt className="p-4 bg-[#0c1728]/90 light:bg-white border-blue-500/20 light:border-slate-200">
            <small className="text-[#94a3b8] light:text-slate-600 text-xs font-mono block mb-1">
              TOTAL JOURNEYS
            </small>
            <div className="flex items-baseline gap-1">
              <b className="text-2xl font-extrabold text-white light:text-slate-900">
                {totalTrips} Trips
              </b>
            </div>
            <span className="text-[11px] text-cyan-400 light:text-sky-700 block mt-1 font-mono">
              100% GPS Telemetry Logged
            </span>
          </Card>

          <Card noTilt className="p-4 bg-[#0c1728]/90 light:bg-white border-purple-500/20 light:border-slate-200">
            <small className="text-[#94a3b8] light:text-slate-600 text-xs font-mono block mb-1">
              VITALS STABILITY
            </small>
            <div className="flex items-baseline gap-1">
              <b className="text-2xl font-extrabold text-[#a855f7] light:text-purple-700">
                73 BPM
              </b>
              <span className="text-xs text-[#94a3b8] light:text-slate-600 font-mono">avg</span>
            </div>
            <span className="text-[11px] text-[#22c55e] light:text-emerald-700 block mt-1 font-mono">
              Normal Stress Range
            </span>
          </Card>
        </div>

        {/* MAIN INTERACTIVE GRAPH CARD */}
        <Card noTilt className="p-5 bg-[#081120]/95 light:bg-white border-cyan-500/30 light:border-slate-200 shadow-xl">
          {/* Graph Header Controls */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-4">
            <div>
              <b className="text-base sm:text-lg font-extrabold text-white light:text-slate-900 flex items-center gap-2">
                <BarChart2 className="w-5 h-5 text-[#00d9d9] light:text-[#0284c7]" />
                Interactive Safety Score Trend &amp; Telemetry Curve
              </b>
              <small className="text-xs text-[#94a3b8] light:text-slate-600 block">
                Hover or tap any data node to inspect journey details &amp; safe corridor logs
              </small>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Metric Type Selector */}
              <div className="flex items-center gap-1 bg-black/40 light:bg-slate-100 p-1 rounded-xl border border-white/10 light:border-slate-200 text-xs font-mono">
                <button
                  type="button"
                  onClick={() => setMetric('score')}
                  className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                    metric === 'score'
                      ? 'bg-[#00d9d9] text-[#050914] shadow-md shadow-cyan-500/20'
                      : 'text-[#94a3b8] light:text-slate-700 hover:text-white'
                  }`}
                >
                  Safety %
                </button>
                <button
                  type="button"
                  onClick={() => setMetric('vitals')}
                  className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                    metric === 'vitals'
                      ? 'bg-[#00d9d9] text-[#050914] shadow-md shadow-cyan-500/20'
                      : 'text-[#94a3b8] light:text-slate-700 hover:text-white'
                  }`}
                >
                  Pulse (BPM)
                </button>
                <button
                  type="button"
                  onClick={() => setMetric('lighting')}
                  className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                    metric === 'lighting'
                      ? 'bg-[#00d9d9] text-[#050914] shadow-md shadow-cyan-500/20'
                      : 'text-[#94a3b8] light:text-slate-700 hover:text-white'
                  }`}
                >
                  Lighting %
                </button>
              </div>

              {/* Timeframe Selector */}
              <div className="flex items-center gap-1 bg-black/40 light:bg-slate-100 p-1 rounded-xl border border-white/10 light:border-slate-200 text-xs font-mono">
                {(['7d', '30d', '90d'] as const).map((tf) => (
                  <button
                    key={tf}
                    type="button"
                    onClick={() => {
                      setTimeframe(tf)
                      setHoveredIdx(null)
                    }}
                    className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                      timeframe === tf
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'text-[#94a3b8] light:text-slate-700 hover:text-white'
                    }`}
                  >
                    {tf === '7d' ? '7 Days' : tf === '30d' ? '30 Days' : '90 Days'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Active Node Detail Callout Bar */}
          <div className="p-3 mb-4 rounded-xl bg-cyan-950/30 light:bg-sky-50 border border-cyan-500/30 light:border-sky-200 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[#00d9d9]/20 light:bg-sky-200 flex items-center justify-center text-[#00d9d9] light:text-[#0284c7]">
                <Calendar className="w-4 h-4" />
              </div>
              <div>
                <b className="text-white light:text-slate-900 block font-bold">{selectedPoint.fullDate}</b>
                <span className="text-[#94a3b8] light:text-slate-600 font-mono">
                  Primary Corridor: <strong className="text-cyan-300 light:text-sky-800">{selectedPoint.safeCorridor}</strong>
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 font-mono">
              <div className="text-right">
                <span className="text-[10px] text-[#94a3b8] light:text-slate-600 block">SAFETY RATING</span>
                <b className="text-sm text-[#00d9d9] light:text-[#0284c7] font-extrabold">{selectedPoint.score}%</b>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-[#94a3b8] light:text-slate-600 block">AVG PULSE</span>
                <b className="text-sm text-purple-400 light:text-purple-700 font-extrabold">{selectedPoint.avgHr} BPM</b>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-[#94a3b8] light:text-slate-600 block">TRIPS</span>
                <b className="text-sm text-emerald-400 light:text-emerald-700 font-extrabold">{selectedPoint.trips}</b>
              </div>
            </div>
          </div>

          {/* SVG Line Graph Container */}
          <div className="relative w-full overflow-hidden rounded-2xl bg-black/40 light:bg-slate-50 border border-white/5 light:border-slate-200 p-2 sm:p-4">
            <svg
              viewBox={`0 0 ${svgWidth} ${svgHeight}`}
              className="w-full h-48 sm:h-64 overflow-visible"
            >
              <defs>
                <linearGradient id="scoreAreaGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#00d9d9" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#00d9d9" stopOpacity="0.0" />
                </linearGradient>
                <linearGradient id="scoreLineGradient" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#3b82f6" />
                  <stop offset="50%" stopColor="#00d9d9" />
                  <stop offset="100%" stopColor="#22c55e" />
                </linearGradient>
              </defs>

              {/* Horizontal Reference Grid Lines */}
              {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
                const y = paddingY + ratio * (svgHeight - paddingY * 2)
                const valLabel = Math.round(maxVal - ratio * (maxVal - minVal))
                return (
                  <g key={ratio}>
                    <line
                      x1={paddingX}
                      y1={y}
                      x2={svgWidth - paddingX}
                      y2={y}
                      stroke="currentColor"
                      className="text-white/10 light:text-slate-300"
                      strokeDasharray="4 4"
                      strokeWidth="1"
                    />
                    <text
                      x={paddingX - 8}
                      y={y + 4}
                      textAnchor="end"
                      className="text-[10px] fill-[#64748b] light:fill-slate-500 font-mono"
                    >
                      {valLabel}
                      {metric === 'score' || metric === 'lighting' ? '%' : ''}
                    </text>
                  </g>
                )
              })}

              {/* Area Fill */}
              <motion.path
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8 }}
                d={areaD}
                fill="url(#scoreAreaGradient)"
              />

              {/* Main Curve Line */}
              <motion.path
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1, ease: 'easeInOut' }}
                d={pathD}
                fill="none"
                stroke="url(#scoreLineGradient)"
                strokeWidth="3.5"
                strokeLinecap="round"
              />

              {/* Interactive Nodes */}
              {points.map((p) => {
                const isSelected = hoveredIdx === p.i || (hoveredIdx === null && p.i === points.length - 1)
                return (
                  <g
                    key={p.i}
                    className="cursor-pointer"
                    onMouseEnter={() => setHoveredIdx(p.i)}
                    onClick={() => setHoveredIdx(p.i)}
                  >
                    {/* Node Hover Guide Line */}
                    {isSelected && (
                      <line
                        x1={p.x}
                        y1={paddingY}
                        x2={p.x}
                        y2={svgHeight - paddingY}
                        stroke="#00d9d9"
                        strokeWidth="1.5"
                        strokeDasharray="3 3"
                        className="light:stroke-[#0284c7]"
                      />
                    )}

                    {/* Outer Glow Halo */}
                    <circle
                      cx={p.x}
                      y={p.y}
                      r={isSelected ? 10 : 5}
                      fill={isSelected ? '#00d9d9' : '#3b82f6'}
                      fillOpacity={isSelected ? 0.3 : 0.15}
                      className="transition-all duration-200"
                    />

                    {/* Core Point Circle */}
                    <circle
                      cx={p.x}
                      y={p.y}
                      r={isSelected ? 6 : 4}
                      fill={isSelected ? '#00d9d9' : '#050914'}
                      stroke={isSelected ? '#ffffff' : '#00d9d9'}
                      strokeWidth="2.5"
                      className="light:fill-white light:stroke-[#0284c7] transition-all duration-200"
                    />

                    {/* X-Axis Label */}
                    <text
                      x={p.x}
                      y={svgHeight - 8}
                      textAnchor="middle"
                      className={`text-[11px] font-mono font-bold transition-colors ${
                        isSelected
                          ? 'fill-[#00d9d9] light:fill-[#0284c7]'
                          : 'fill-[#94a3b8] light:fill-slate-600'
                      }`}
                    >
                      {p.d.label}
                    </text>
                  </g>
                )
              })}
            </svg>
          </div>
        </Card>

        {/* 24-HOUR TRANSIT RISK HEATMAP */}
        <Card noTilt className="p-5 bg-[#081120]/95 light:bg-white border-cyan-500/30 light:border-slate-200 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <b className="text-base font-extrabold text-white light:text-slate-900 flex items-center gap-2">
                <Clock className="w-5 h-5 text-[#3b82f6] light:text-[#0284c7]" />
                24-Hour Corridor Transit Risk Heatmap
              </b>
              <small className="text-xs text-[#94a3b8] light:text-slate-600 block">
                Calculated security scores across daytime and nighttime transit windows
              </small>
            </div>
            <span className="text-[10px] font-mono bg-emerald-500/15 light:bg-emerald-100 text-[#22c55e] light:text-emerald-800 px-2.5 py-1 rounded-full border border-emerald-500/30 light:border-emerald-300 font-bold">
              ● REAL-TIME RADAR SYNCED
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5 font-sans">
            {HOURLY_HEATMAP.map((h) => (
              <div
                key={h.hour}
                className={`p-3 rounded-2xl border transition-all ${
                  h.score >= 95
                    ? 'bg-emerald-950/20 light:bg-emerald-50 border-emerald-500/30 light:border-emerald-200'
                    : 'bg-amber-950/20 light:bg-amber-50 border-amber-500/30 light:border-amber-200'
                }`}
              >
                <div className="flex items-center justify-between text-xs mb-1.5 font-mono">
                  <span className="font-bold text-white light:text-slate-900">{h.hour}</span>
                  <span
                    className={`font-extrabold ${
                      h.score >= 95
                        ? 'text-[#22c55e] light:text-emerald-700'
                        : 'text-amber-400 light:text-amber-700'
                    }`}
                  >
                    {h.score}%
                  </span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-black/40 light:bg-slate-200 overflow-hidden mb-2">
                  <div
                    className={`h-full rounded-full ${
                      h.score >= 95 ? 'bg-[#22c55e]' : 'bg-amber-400'
                    }`}
                    style={{ width: `${h.score}%` }}
                  />
                </div>
                <small className="text-[10px] text-[#94a3b8] light:text-slate-600 block truncate">
                  {h.status}
                </small>
              </div>
            ))}
          </div>
        </Card>

        {/* 2-Column: Safe Corridor Benchmarks & Safety Capsule Logs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Safe Corridor Benchmark Breakdown */}
          <Card noTilt className="p-5 bg-[#081120]/95 light:bg-white border-cyan-500/30 light:border-slate-200">
            <b className="text-base font-extrabold text-white light:text-slate-900 flex items-center gap-2 mb-1">
              <Route className="w-5 h-5 text-[#00d9d9] light:text-[#0284c7]" />
              Safe Transit Corridor Scores
            </b>
            <small className="text-xs text-[#94a3b8] light:text-slate-600 block mb-4">
              AI verified route corridors with high lighting &amp; CCTV coverage
            </small>

            <div className="space-y-3 font-sans text-xs">
              <div className="p-3 rounded-xl bg-black/40 light:bg-slate-50 border border-white/5 light:border-slate-200 flex items-center justify-between">
                <div>
                  <b className="text-white light:text-slate-900 block font-bold">Jalukbari NH-27 Express Safe Lane</b>
                  <small className="text-[#94a3b8] light:text-slate-600 font-mono">100% Street Lighting · Police Outposts</small>
                </div>
                <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 light:bg-emerald-100 text-[#22c55e] light:text-emerald-800 font-mono font-bold">
                  98/100
                </span>
              </div>

              <div className="p-3 rounded-xl bg-black/40 light:bg-slate-50 border border-white/5 light:border-slate-200 flex items-center justify-between">
                <div>
                  <b className="text-white light:text-slate-900 block font-bold">GS Road Commercial Transit Corridor</b>
                  <small className="text-[#94a3b8] light:text-slate-600 font-mono">96% CCTV Coverage · High Footfall</small>
                </div>
                <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 light:bg-emerald-100 text-[#22c55e] light:text-emerald-800 font-mono font-bold">
                  96/100
                </span>
              </div>

              <div className="p-3 rounded-xl bg-black/40 light:bg-slate-50 border border-white/5 light:border-slate-200 flex items-center justify-between">
                <div>
                  <b className="text-white light:text-slate-900 block font-bold">Panbazar Riverside Boulevard</b>
                  <small className="text-[#94a3b8] light:text-slate-600 font-mono">Smart Poles · Automated SOS Terminals</small>
                </div>
                <span className="px-2.5 py-1 rounded-lg bg-cyan-500/20 light:bg-sky-100 text-[#00d9d9] light:text-sky-800 font-mono font-bold">
                  94/100
                </span>
              </div>
            </div>
          </Card>

          {/* Hardware & Autonomous Vitals Telemetry Check */}
          <Card noTilt className="p-5 bg-[#081120]/95 light:bg-white border-cyan-500/30 light:border-slate-200">
            <b className="text-base font-extrabold text-white light:text-slate-900 flex items-center gap-2 mb-1">
              <HeartPulse className="w-5 h-5 text-[#ec4899] light:text-pink-600" />
              Autonomous Telemetry Diagnostics
            </b>
            <small className="text-xs text-[#94a3b8] light:text-slate-600 block mb-4">
              Real-time hardware sensors &amp; smartwatch vital parameters
            </small>

            <div className="space-y-3 font-sans text-xs">
              <div className="p-3 rounded-xl bg-black/40 light:bg-slate-50 border border-white/5 light:border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Activity className="w-4 h-4 text-[#00d9d9] light:text-[#0284c7]" />
                  <div>
                    <b className="text-white light:text-slate-900 block">Pulse Rate Anomaly Guard</b>
                    <small className="text-[#94a3b8] light:text-slate-600">Threshold: Auto-check at &gt;115 BPM</small>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded bg-emerald-500/20 light:bg-emerald-100 text-[#22c55e] light:text-emerald-800 font-mono font-bold text-[11px]">
                  NORMAL
                </span>
              </div>

              <div className="p-3 rounded-xl bg-black/40 light:bg-slate-50 border border-white/5 light:border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-[#22c55e] light:text-emerald-600" />
                  <div>
                    <b className="text-white light:text-slate-900 block">Fall &amp; Collision G-Force Detector</b>
                    <small className="text-[#94a3b8] light:text-slate-600">3-Axis BLE Smartwatch Accelerometer</small>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded bg-emerald-500/20 light:bg-emerald-100 text-[#22c55e] light:text-emerald-800 font-mono font-bold text-[11px]">
                  ACTIVE
                </span>
              </div>

              <div className="p-3 rounded-xl bg-black/40 light:bg-slate-50 border border-white/5 light:border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Zap className="w-4 h-4 text-amber-400 light:text-amber-600" />
                  <div>
                    <b className="text-white light:text-slate-900 block">Critical 0% Battery Auto-Dispatcher</b>
                    <small className="text-[#94a3b8] light:text-slate-600">Pre-shutdown emergency SMS broadcast</small>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded bg-emerald-500/20 light:bg-emerald-100 text-[#22c55e] light:text-emerald-800 font-mono font-bold text-[11px]">
                  READY
                </span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </motion.div>
  )
}
