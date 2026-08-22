'use client'

import React, { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import {
  AlertTriangle,
  ArrowUpDown,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Clock,
  Compass,
  Filter,
  Info,
  LockKeyhole,
  MapPin,
  Navigation,
  Route,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  X,
} from 'lucide-react'
import { JourneysProps } from '@/types'
import { Card } from '@/components/ui/Card'
import { Header } from '@/components/ui/Header'

export type SafetyCategory = 'safe' | 'risky' | 'danger'

export interface JourneyItem {
  id: string
  title: string
  origin: string
  destination: string
  date: string
  time: string
  timestamp: number
  category: SafetyCategory
  score: number
  distance: string
  duration: string
  factors: string[]
  isUserHistory?: boolean
}

const USER_RECENT_JOURNEYS: JourneyItem[] = [
  {
    id: 'u1',
    title: 'Gauhati University → Narengi',
    origin: 'Gauhati University',
    destination: 'Narengi',
    date: '22 Aug 2026',
    time: '8:42 PM',
    timestamp: 1787413320000,
    category: 'safe',
    score: 96,
    distance: '16 km',
    duration: '28 min',
    factors: ['Planned route followed', 'High street lighting density', 'Zero anomalies detected'],
    isUserHistory: true,
  },
]

const ASSAM_SAMPLE_JOURNEYS: JourneyItem[] = [
  // 🟢 SAFE
  {
    id: 'a1',
    title: 'Guwahati → Shillong',
    origin: 'Guwahati',
    destination: 'Shillong',
    date: '20 Aug 2026',
    time: '8:30 AM',
    timestamp: 1787204400000,
    category: 'safe',
    score: 96,
    distance: '100 km',
    duration: '3h 10m',
    factors: ['NH-44 Four-Lane Highway', 'Frequent police check posts', 'High cellular coverage'],
  },
  {
    id: 'a2',
    title: 'Guwahati → Kamakhya Temple',
    origin: 'Guwahati',
    destination: 'Kamakhya Temple',
    date: '19 Aug 2026',
    time: '9:15 AM',
    timestamp: 1787120100000,
    category: 'safe',
    score: 94,
    distance: '8 km',
    duration: '25 min',
    factors: ['High pilgrim security presence', 'CCTV monitored corridor', 'Short urban trip'],
  },
  {
    id: 'a3',
    title: 'Guwahati → Pobitora Wildlife Sanctuary',
    origin: 'Guwahati',
    destination: 'Pobitora Wildlife Sanctuary',
    date: '18 Aug 2026',
    time: '7:00 AM',
    timestamp: 1787025600000,
    category: 'safe',
    score: 95,
    distance: '48 km',
    duration: '1h 45m',
    factors: ['Daylight tourist route', 'Forest department patrol', 'Good road condition'],
  },
  {
    id: 'a4',
    title: 'Jorhat → Majuli',
    origin: 'Jorhat',
    destination: 'Majuli',
    date: '18 Aug 2026',
    time: '8:30 AM',
    timestamp: 1787031000000,
    category: 'safe',
    score: 92,
    distance: '42 km',
    duration: '2h 30m',
    factors: ['Official ferry transit', 'Daylight travel window', 'Community safety support'],
  },
  {
    id: 'a5',
    title: 'Tezpur → Kaziranga',
    origin: 'Tezpur',
    destination: 'Kaziranga',
    date: '17 Aug 2026',
    time: '10:00 AM',
    timestamp: 1786948800000,
    category: 'safe',
    score: 93,
    distance: '65 km',
    duration: '1h 40m',
    factors: ['National Highway corridor', 'High tourist vehicle density', 'Active highway patrol'],
  },
  {
    id: 'a6',
    title: 'Dibrugarh → Tinsukia',
    origin: 'Dibrugarh',
    destination: 'Tinsukia',
    date: '16 Aug 2026',
    time: '11:20 AM',
    timestamp: 1786867200000,
    category: 'safe',
    score: 95,
    distance: '48 km',
    duration: '1h 15m',
    factors: ['Commercial arterial road', 'Low crime index area', 'Frequent emergency response points'],
  },

  // 🟡 RISKY / MODERATE
  {
    id: 'a7',
    title: 'Guwahati → Sonapur',
    origin: 'Guwahati',
    destination: 'Sonapur',
    date: '16 Aug 2026',
    time: '7:45 PM',
    timestamp: 1786897500000,
    category: 'risky',
    score: 61,
    distance: '30 km',
    duration: '1h 05m',
    factors: ['Heavy evening highway traffic', 'Uneven street lighting', 'Higher speed differential'],
  },
  {
    id: 'a8',
    title: 'Guwahati → Hajo',
    origin: 'Guwahati',
    destination: 'Hajo',
    date: '15 Aug 2026',
    time: '8:15 PM',
    timestamp: 1786812900000,
    category: 'risky',
    score: 68,
    distance: '35 km',
    duration: '1h 10m',
    factors: ['Limited street lighting after dark', 'Narrow rural road sections', 'Moderate phone signal drop'],
  },
  {
    id: 'a9',
    title: 'Guwahati → Chandrapur',
    origin: 'Guwahati',
    destination: 'Chandrapur',
    date: '14 Aug 2026',
    time: '9:00 PM',
    timestamp: 1786729200000,
    category: 'risky',
    score: 64,
    distance: '28 km',
    duration: '55 min',
    factors: ['Isolated riverbank stretch', 'Unlit forest patches', 'Low pedestrian density'],
  },
  {
    id: 'a10',
    title: 'Jorhat → Sivasagar',
    origin: 'Jorhat',
    destination: 'Sivasagar',
    date: '13 Aug 2026',
    time: '8:45 PM',
    timestamp: 1786644300000,
    category: 'risky',
    score: 67,
    distance: '58 km',
    duration: '1h 35m',
    factors: ['Limited late-night service stations', 'Intermittent highway lighting', 'Fog-prone river crossings'],
  },
  {
    id: 'a11',
    title: 'Silchar → Hailakandi',
    origin: 'Silchar',
    destination: 'Hailakandi',
    date: '12 Aug 2026',
    time: '6:30 PM',
    timestamp: 1786557000000,
    category: 'risky',
    score: 63,
    distance: '45 km',
    duration: '1h 50m',
    factors: ['Narrow hilly terrain roads', 'Limited roadside assistance', 'Monsoon road wear'],
  },
  {
    id: 'a12',
    title: 'Tezpur → Biswanath Chariali',
    origin: 'Tezpur',
    destination: 'Biswanath Chariali',
    date: '11 Aug 2026',
    time: '7:50 PM',
    timestamp: 1786475400000,
    category: 'risky',
    score: 65,
    distance: '75 km',
    duration: '2h 10m',
    factors: ['Long unlit stretches', 'Sparse night commercial traffic', 'Intermittent cellular coverage'],
  },

  // 🔴 DANGER / HIGH RISK (Sample / Demo Scenarios)
  {
    id: 'a13',
    title: 'Guwahati → Deepor Beel Night Bypass (Demo)',
    origin: 'Guwahati',
    destination: 'Deepor Beel Night Bypass',
    date: '10 Aug 2026',
    time: '11:15 PM',
    timestamp: 1786401300000,
    category: 'danger',
    score: 32,
    distance: '18 km',
    duration: '40 min',
    factors: [
      'Sample Demo Scenario: Isolated wetland bypass route',
      'Zero street lighting & severe visibility drop',
      'No nearby emergency service points',
    ],
  },
  {
    id: 'a14',
    title: 'Tezpur → Burachapori Forest Stretch (Demo)',
    origin: 'Tezpur',
    destination: 'Burachapori Forest Stretch',
    date: '08 Aug 2026',
    time: '11:45 PM',
    timestamp: 1786230300000,
    category: 'danger',
    score: 28,
    distance: '52 km',
    duration: '1h 40m',
    factors: [
      'Sample Demo Scenario: Remote forest border road',
      'Complete cellular coverage blackout patch',
      'Extreme distance to medical or police support',
    ],
  },
]

export const JourneysScreen: React.FC<JourneysProps> = ({ go, goBack }) => {
  const [filterCategory, setFilterCategory] = useState<SafetyCategory | 'all'>('all')
  const [sortBy, setSortBy] = useState<'recent' | 'oldest'>('recent')
  const [selectedJourney, setSelectedJourney] = useState<JourneyItem | null>(null)

  // Filter & Sort User History
  const filteredUserJourneys = useMemo(() => {
    return USER_RECENT_JOURNEYS.filter(
      (j) => filterCategory === 'all' || j.category === filterCategory
    ).sort((a, b) => (sortBy === 'recent' ? b.timestamp - a.timestamp : a.timestamp - b.timestamp))
  }, [filterCategory, sortBy])

  // Filter & Sort Sample Assam Journeys
  const filteredSampleJourneys = useMemo(() => {
    return ASSAM_SAMPLE_JOURNEYS.filter(
      (j) => filterCategory === 'all' || j.category === filterCategory
    ).sort((a, b) => (sortBy === 'recent' ? b.timestamp - a.timestamp : a.timestamp - b.timestamp))
  }, [filterCategory, sortBy])

  const getCategoryBadge = (cat: SafetyCategory) => {
    switch (cat) {
      case 'safe':
        return (
          <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-[#22c55e]/15 border border-[#22c55e]/30 text-[#22c55e] flex items-center gap-1">
            <ShieldCheck className="w-3 h-3" /> Safe Journey
          </span>
        )
      case 'risky':
        return (
          <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-[#f59e0b]/15 border border-[#f59e0b]/30 text-[#f59e0b] flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" /> Moderate Risk
          </span>
        )
      case 'danger':
        return (
          <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-[#ef4444]/15 border border-[#ef4444]/30 text-[#ef4444] flex items-center gap-1">
            <ShieldAlert className="w-3 h-3" /> High Risk (Demo)
          </span>
        )
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-[#22c55e]'
    if (score >= 55) return 'text-[#f59e0b]'
    return 'text-[#ef4444]'
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.25 }}
    >
      <Header title="Journey history" back={goBack} />
      <div className="content">
        {/* Title Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <small className="eyebrow text-[#19d3c5]">ASSAM TRAVEL SAFETY LOG</small>
            <h1 className="text-3xl font-extrabold text-white mt-1">
              Every arrival
              <br />
              <em>matters.</em>
            </h1>
          </div>
          <button
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-[#19d3c5] text-xs font-bold self-start sm:self-auto hover:bg-cyan-500/20 transition-all"
            onClick={() => go && go('privacy')}
          >
            <LockKeyhole className="w-4 h-4" /> Safety Capsule
          </button>
        </div>

        {/* Filter Chips & Sort Selector Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-[#0f172a]/90 rounded-2xl border border-white/10 shadow-lg" data-no-tilt>
          {/* Category Filters */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 font-sans">
            <span className="text-xs text-[#94a3b8] font-bold mr-1 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5 text-[#19d3c5]" /> Filter:
            </span>
            {(['all', 'safe', 'risky', 'danger'] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => setFilterCategory(cat)}
                className={`px-3 py-1 rounded-xl text-xs font-bold capitalize transition-all whitespace-nowrap ${
                  filterCategory === cat
                    ? cat === 'safe'
                      ? 'bg-[#22c55e] text-[#070b14] shadow-md'
                      : cat === 'risky'
                      ? 'bg-[#f59e0b] text-[#070b14] shadow-md'
                      : cat === 'danger'
                      ? 'bg-[#ef4444] text-white shadow-md'
                      : 'bg-[#19d3c5] text-[#070b14] shadow-md'
                    : 'bg-white/5 border border-white/10 text-[#94a3b8] hover:text-white'
                }`}
              >
                {cat === 'all' ? 'All' : cat === 'safe' ? '🟢 Safe' : cat === 'risky' ? '🟡 Risky' : '🔴 Danger'}
              </button>
            ))}
          </div>

          {/* Sort Control */}
          <div className="flex items-center gap-2 self-end sm:self-auto">
            <span className="text-xs text-[#94a3b8] font-bold flex items-center gap-1 font-sans">
              <ArrowUpDown className="w-3.5 h-3.5 text-[#19d3c5]" /> Sort:
            </span>
            <div className="flex bg-black/40 p-1 rounded-xl border border-white/10">
              {(['recent', 'oldest'] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setSortBy(s)}
                  className={`px-2.5 py-0.5 text-xs font-bold rounded-lg capitalize transition-colors ${
                    sortBy === s ? 'bg-white/20 text-white shadow-sm' : 'text-[#94a3b8] hover:text-white'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* SECTION 1: YOUR RECENT JOURNEYS */}
        <div className="space-y-3">
          <div className="flex items-center justify-between border-b border-white/10 pb-2">
            <b className="text-sm font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
              <Shield className="w-4 h-4 text-[#19d3c5]" /> Your Recent Journeys
            </b>
            <span className="text-xs text-[#94a3b8] font-mono">{filteredUserJourneys.length} Record</span>
          </div>

          {filteredUserJourneys.length === 0 ? (
            <div className="p-6 rounded-2xl bg-black/40 border border-white/5 text-center text-xs text-[#94a3b8]">
              No personal journeys match the selected filter.
            </div>
          ) : (
            filteredUserJourneys.map((j) => (
              <div
                key={j.id}
                data-no-tilt
                className="p-4 rounded-2xl bg-[#0f172a]/90 border border-cyan-500/30 hover:border-cyan-400/60 shadow-xl transition-all relative overflow-hidden group"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                  <div>
                    <b className="text-lg font-extrabold text-white block">{j.title}</b>
                    <small className="text-xs text-[#94a3b8] flex items-center gap-2 mt-0.5 font-sans">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-[#19d3c5]" /> {j.date}
                      </span>
                      <span>·</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-[#94a3b8]" /> {j.time}
                      </span>
                    </small>
                  </div>
                  {getCategoryBadge(j.category)}
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-white/10">
                  <div className="flex items-center gap-2 font-mono text-xs text-[#cbd5e1]">
                    <span className="px-2.5 py-1 rounded-lg bg-black/40 border border-white/10">
                      {j.distance}
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-black/40 border border-white/10">
                      {j.duration}
                    </span>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex items-baseline gap-1">
                      <span className={`text-xl font-extrabold font-mono ${getScoreColor(j.score)}`}>
                        {j.score}
                      </span>
                      <span className="text-xs text-[#94a3b8] font-mono">/100</span>
                    </div>

                    <button
                      onClick={() => setSelectedJourney(j)}
                      className="px-3 py-1.5 rounded-xl bg-[#19d3c5] text-[#070b14] text-xs font-extrabold hover:bg-cyan-300 transition-colors flex items-center gap-1 shadow-md"
                    >
                      View Journey <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* SECTION 2: SAMPLE ASSAM JOURNEYS */}
        <div className="space-y-3 pt-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-white/10 pb-2">
            <div>
              <b className="text-sm font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#19d3c5]" /> Sample Assam Travel History
              </b>
              <small className="text-[11px] text-[#94a3b8] block">
                Demonstration scenarios across Assam routes &amp; risk profiles
              </small>
            </div>
            <span className="text-xs text-[#94a3b8] font-mono">{filteredSampleJourneys.length} Samples</span>
          </div>

          {filteredSampleJourneys.length === 0 ? (
            <div className="p-6 rounded-2xl bg-black/40 border border-white/5 text-center text-xs text-[#94a3b8]">
              No sample Assam journeys match the selected filter.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3" data-no-tilt>
              {filteredSampleJourneys.map((j) => (
                <div
                  key={j.id}
                  data-no-tilt
                  className="p-4 rounded-2xl bg-[#0f172a]/70 border border-white/10 hover:border-white/20 shadow-lg transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <b className="text-base font-extrabold text-white leading-snug">{j.title}</b>
                      {getCategoryBadge(j.category)}
                    </div>
                    <small className="text-xs text-[#94a3b8] flex items-center gap-2 mb-3 font-sans">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-[#19d3c5]" /> {j.date}
                      </span>
                      <span>·</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-[#94a3b8]" /> {j.time}
                      </span>
                    </small>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-white/10 font-mono text-xs">
                    <div className="flex items-center gap-1.5 text-[#cbd5e1]">
                      <span className="px-2 py-0.5 rounded bg-black/40 border border-white/10">
                        {j.distance}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-black/40 border border-white/10">
                        {j.duration}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className={`text-base font-extrabold ${getScoreColor(j.score)}`}>
                        {j.score}
                        <small className="text-[10px] text-[#94a3b8]">/100</small>
                      </span>

                      <button
                        onClick={() => setSelectedJourney(j)}
                        className="px-2.5 py-1 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-colors flex items-center gap-0.5"
                      >
                        View <ChevronRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Journey Details Modal */}
        {selectedJourney && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-[#0f172a] border border-cyan-500/30 rounded-2xl p-6 max-w-lg w-full shadow-2xl relative"
            >
              <button
                onClick={() => setSelectedJourney(null)}
                className="absolute top-4 right-4 text-[#94a3b8] hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-2 mb-2">
                <span className="eyebrow text-[#19d3c5] font-bold">JOURNEY SAFETY PROFILE</span>
                {selectedJourney.isUserHistory && (
                  <span className="text-[9px] font-extrabold px-2 py-0.5 rounded bg-[#19d3c5]/20 text-[#19d3c5] border border-[#19d3c5]/30">
                    USER RECORD
                  </span>
                )}
              </div>

              <h2 className="text-2xl font-extrabold text-white mb-1">{selectedJourney.title}</h2>

              <div className="flex items-center gap-3 text-xs text-[#94a3b8] mb-4 font-sans">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-[#19d3c5]" /> {selectedJourney.date}
                </span>
                <span>·</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-[#94a3b8]" /> {selectedJourney.time}
                </span>
              </div>

              {/* Status & Telemetry Header */}
              <div className="grid grid-cols-3 gap-2 bg-black/40 p-3.5 rounded-xl border border-white/10 mb-4 font-mono text-center">
                <div>
                  <small className="text-[10px] text-[#94a3b8] block font-sans uppercase">Distance</small>
                  <b className="text-sm text-white">{selectedJourney.distance}</b>
                </div>
                <div>
                  <small className="text-[10px] text-[#94a3b8] block font-sans uppercase">Duration</small>
                  <b className="text-sm text-white">{selectedJourney.duration}</b>
                </div>
                <div>
                  <small className="text-[10px] text-[#94a3b8] block font-sans uppercase">Safety Index</small>
                  <b className={`text-sm ${getScoreColor(selectedJourney.score)}`}>
                    {selectedJourney.score}/100
                  </b>
                </div>
              </div>

              {/* Safety Factors Overview */}
              <div className="space-y-2 mb-6">
                <b className="text-xs font-bold text-white uppercase tracking-wider block mb-2">
                  Contextual Risk &amp; Safety Factors
                </b>
                {selectedJourney.factors.map((f, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs text-[#cbd5e1] bg-black/30 p-2.5 rounded-xl border border-white/5">
                    {selectedJourney.category === 'safe' ? (
                      <CheckCircle2 className="w-4 h-4 text-[#22c55e] flex-shrink-0 mt-0.5" />
                    ) : selectedJourney.category === 'risky' ? (
                      <AlertTriangle className="w-4 h-4 text-[#f59e0b] flex-shrink-0 mt-0.5" />
                    ) : (
                      <ShieldAlert className="w-4 h-4 text-[#ef4444] flex-shrink-0 mt-0.5" />
                    )}
                    <span>{f}</span>
                  </div>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  className="secondary flex-1 text-xs font-bold py-2.5"
                  onClick={() => setSelectedJourney(null)}
                >
                  Close
                </button>
                <button
                  className="primary flex-1 text-xs font-bold py-2.5 flex items-center justify-center gap-1.5"
                  onClick={() => {
                    setSelectedJourney(null)
                    if (go) go('map')
                  }}
                >
                  <Navigation className="w-4 h-4" /> Open in Safety Map
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </motion.div>
  )
}
