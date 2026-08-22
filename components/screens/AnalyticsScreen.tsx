'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { BarChart2, Clock, ShieldCheck, TrendingUp } from 'lucide-react'
import { AnalyticsProps } from '@/types'
import { Card } from '@/components/ui/Card'
import { Header } from '@/components/ui/Header'

export const AnalyticsScreen: React.FC<AnalyticsProps> = ({ go, goBack }) => {
  const [timeframe, setTimeframe] = useState<'7d' | '30d' | '90d'>('7d')
  const [hoveredBar, setHoveredBar] = useState<number | null>(null)

  const activityDataMap = {
    '7d': [
      { label: 'Mon', count: 3, score: 96 },
      { label: 'Tue', count: 2, score: 94 },
      { label: 'Wed', count: 4, score: 98 },
      { label: 'Thu', count: 1, score: 91 },
      { label: 'Fri', count: 5, score: 95 },
      { label: 'Sat', count: 3, score: 92 },
      { label: 'Sun', count: 2, score: 97 },
    ],
    '30d': [
      { label: 'Week 1', count: 14, score: 95 },
      { label: 'Week 2', count: 18, score: 93 },
      { label: 'Week 3', count: 12, score: 97 },
      { label: 'Week 4', count: 16, score: 96 },
    ],
    '90d': [
      { label: 'Month 1', count: 52, score: 94 },
      { label: 'Month 2', count: 61, score: 96 },
      { label: 'Month 3', count: 48, score: 95 },
    ],
  }

  const activeData = activityDataMap[timeframe]
  const maxCount = Math.max(...activeData.map((d) => d.count), 1)

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.25 }}
    >
      <Header title="Safety Analytics" back={goBack} />
      <div className="content">
        <div>
          <small className="eyebrow">INTELLIGENCE & METRICS</small>
          <h1 className="text-3xl font-extrabold text-white mt-1">
            Journey safety
            <br />
            <em>insights.</em>
          </h1>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Card noTilt className="p-4 border-cyan-500/20 bg-cyan-950/20">
            <small className="text-[#94a3b8] text-xs block mb-1">Total Journeys</small>
            <b className="text-2xl font-extrabold text-white">28</b>
            <span className="text-[11px] text-[#22c55e] flex items-center gap-1 mt-1 font-semibold">
              <TrendingUp className="w-3 h-3" /> +12% this month
            </span>
          </Card>

          <Card noTilt className="p-4 border-emerald-500/20 bg-emerald-950/20">
            <small className="text-[#94a3b8] text-xs block mb-1">Safe Completion Rate</small>
            <b className="text-2xl font-extrabold text-[#22c55e]">100%</b>
            <span className="text-[11px] text-[#94a3b8] block mt-1">0 Anomalies Escalated</span>
          </Card>

          <Card noTilt className="p-4 border-blue-500/20 bg-blue-950/20">
            <small className="text-[#94a3b8] text-xs block mb-1">Avg Duration</small>
            <b className="text-2xl font-extrabold text-white">26m</b>
            <span className="text-[11px] text-[#94a3b8] block mt-1">±3m vs optimal route</span>
          </Card>

          <Card noTilt className="p-4 border-cyan-500/20 bg-cyan-950/20">
            <small className="text-[#94a3b8] text-xs block mb-1">Avg Safety Score</small>
            <b className="text-2xl font-extrabold text-[#19d3c5]">95/100</b>
            <span className="text-[11px] text-[#19d3c5] block mt-1">Optimal security index</span>
          </Card>
        </div>

        {/* Chart 1: Journey Activity */}
        <Card noTilt className="p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
            <div>
              <b className="text-lg font-extrabold text-white flex items-center gap-2">
                <BarChart2 className="w-5 h-5 text-[#19d3c5]" /> Journey Activity & Frequency
              </b>
              <small className="text-[#94a3b8] text-xs">Number of monitored trips per period</small>
            </div>
            <div className="flex items-center gap-1.5 bg-black/40 p-1 rounded-xl border border-white/10 self-start sm:self-auto">
              {(['7d', '30d', '90d'] as const).map((tf) => (
                <button
                  key={tf}
                  onClick={() => setTimeframe(tf)}
                  className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors ${
                    timeframe === tf
                      ? 'bg-[#19d3c5] text-[#070b14] shadow-md'
                      : 'text-[#94a3b8] hover:text-white'
                  }`}
                >
                  {tf === '7d' ? '7 Days' : tf === '30d' ? '30 Days' : '90 Days'}
                </button>
              ))}
            </div>
          </div>

          <div data-no-tilt className="h-44 flex items-end justify-between gap-2 pt-6 pb-2 px-2 border-b border-white/10">
            {activeData.map((d, idx) => {
              const heightPercent = Math.max(15, (d.count / maxCount) * 100)
              const isHovered = hoveredBar === idx
              return (
                <div
                  key={d.label}
                  data-no-tilt
                  onMouseEnter={() => setHoveredBar(idx)}
                  onMouseLeave={() => setHoveredBar(null)}
                  className="flex-1 flex flex-col items-center gap-2 relative group cursor-pointer"
                >
                  {isHovered && (
                    <div className="absolute -top-10 bg-[#070b14] border border-[#19d3c5] text-xs font-mono text-white px-2.5 py-1 rounded-lg shadow-xl z-20 whitespace-nowrap pointer-events-none">
                      {d.count} journeys (Score: {d.score})
                    </div>
                  )}
                  <div
                    data-no-tilt
                    style={{ height: `${heightPercent}%` }}
                    className={`w-full rounded-t-lg transition-all duration-300 ${
                      isHovered
                        ? 'bg-gradient-to-t from-[#0891b2] to-[#19d3c5] shadow-lg shadow-cyan-500/40'
                        : 'bg-gradient-to-t from-[#0f172a] to-[#0891b2]/70'
                    }`}
                  />
                  <span className="text-[11px] font-semibold text-[#94a3b8] font-mono">{d.label}</span>
                </div>
              )
            })}
          </div>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Chart 2: Safety Score Index */}
          <Card noTilt className="p-5">
            <b className="text-lg font-extrabold text-white flex items-center gap-2 mb-1">
              <ShieldCheck className="w-5 h-5 text-[#22c55e]" /> Safety Score Index
            </b>
            <small className="text-[#94a3b8] text-xs block mb-4">Historical risk evaluation score</small>

            <div data-no-tilt className="flex items-center justify-center gap-6 py-4">
              <div className="relative w-32 h-32 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-white/10"
                    strokeWidth="3.5"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className="text-[#19d3c5]"
                    strokeDasharray="95, 100"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <div className="absolute flex flex-col items-center">
                  <span className="text-2xl font-extrabold text-white font-mono">95</span>
                  <span className="text-[10px] text-[#94a3b8] font-bold">EXCELLENT</span>
                </div>
              </div>

              <div className="flex flex-col gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-[#19d3c5]" />
                  <span className="text-white font-semibold">Safe Trips (95%)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-[#f59e0b]" />
                  <span className="text-[#94a3b8]">Minor Deviations (5%)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-[#ef4444]" />
                  <span className="text-[#94a3b8]">Critical Alerts (0%)</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Chart 3: Journey Duration Breakdown */}
          <Card noTilt className="p-5">
            <b className="text-lg font-extrabold text-white flex items-center gap-2 mb-1">
              <Clock className="w-5 h-5 text-[#3b82f6]" /> Travel Duration Breakdown
            </b>
            <small className="text-[#94a3b8] text-xs block mb-4">Duration grouping of completed journeys</small>

            <div data-no-tilt className="space-y-3 pt-2">
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-white">Under 15 mins</span>
                  <span className="text-[#19d3c5]">10 journeys (36%)</span>
                </div>
                <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                  <div className="h-full bg-[#19d3c5] rounded-full" style={{ width: '36%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-white">15 - 30 mins</span>
                  <span className="text-[#3b82f6]">14 journeys (50%)</span>
                </div>
                <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                  <div className="h-full bg-[#3b82f6] rounded-full" style={{ width: '50%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-white">30+ mins</span>
                  <span className="text-[#f59e0b]">4 journeys (14%)</span>
                </div>
                <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                  <div className="h-full bg-[#f59e0b] rounded-full" style={{ width: '14%' }} />
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </motion.div>
  )
}
