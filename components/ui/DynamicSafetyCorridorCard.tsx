'use client'

import React, { useState } from 'react'
import {
  Activity,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Clock,
  Eye,
  Hospital,
  Info,
  MapPin,
  Navigation,
  Phone,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Zap,
} from 'lucide-react'
import { DynamicRouteSafetyState } from '@/hooks/useDynamicRouteSafety'
import { Card } from './Card'

interface DynamicSafetyCorridorCardProps {
  safetyState: DynamicRouteSafetyState
  onCallPOI?: (phone: string) => void
}

export const DynamicSafetyCorridorCard: React.FC<DynamicSafetyCorridorCardProps> = ({
  safetyState,
  onCallPOI,
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(false)

  const {
    assessment,
    anomaly,
    crossTrackDeviationMeters,
    nearestSafePOI,
    distanceToNearestSafePOIKm,
    progressPercent,
    timeOfDayLabel,
    dynamicSafetyScore,
    activeSegment,
    isSafeCorridor,
  } = safetyState

  const isCritical = anomaly.hasAnomaly && anomaly.severity === 'critical'
  const isWarn = anomaly.hasAnomaly

  return (
    <Card
      noTilt
      className={`p-4 transition-all duration-300 ${
        isCritical
          ? 'bg-red-950/50 border-red-500/60 shadow-xl shadow-red-500/10'
          : isWarn
          ? 'bg-amber-950/40 border-amber-500/50'
          : 'bg-[#0c1728]/95 border-cyan-500/40'
      }`}
    >
      {/* Top Header Bar */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <span
            className={`w-3 h-3 rounded-full ${
              isCritical
                ? 'bg-red-500 animate-ping'
                : isWarn
                ? 'bg-amber-400 animate-pulse'
                : 'bg-[#22c55e] animate-pulse'
            }`}
          />
          <div>
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#00d9d9] flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-[#00d9d9]" /> DYNAMIC SAFETY ENGINE
            </span>
            <b className="text-sm font-extrabold text-white block">
              {isCritical
                ? 'CORRIDOR DEVIATION ALERT'
                : isWarn
                ? 'CAUTION: MOVEMENT ANOMALY'
                : 'LIVE SAFE CORRIDOR ACTIVE'}
            </b>
          </div>
        </div>

        {/* Dynamic Score Badge */}
        <div
          className={`px-3 py-1.5 rounded-xl border text-right font-mono ${
            dynamicSafetyScore >= 85
              ? 'bg-emerald-500/15 border-emerald-500/40 text-[#22c55e]'
              : dynamicSafetyScore >= 70
              ? 'bg-amber-500/15 border-amber-500/40 text-[#f59e0b]'
              : 'bg-red-500/15 border-red-500/40 text-[#ef4444]'
          }`}
        >
          <span className="text-[10px] block font-sans text-[#94a3b8]">Live Score</span>
          <b className="text-base font-extrabold">{dynamicSafetyScore}/100</b>
        </div>
      </div>

      {/* Cross-Track Deviation & Progress Bar */}
      <div className="space-y-2 mb-3 bg-black/40 p-3 rounded-xl border border-white/5 font-sans">
        <div className="flex items-center justify-between text-xs">
          <span className="text-[#94a3b8] flex items-center gap-1.5 font-mono">
            <Navigation className="w-3.5 h-3.5 text-[#00d9d9]" />
            Corridor Offset: <strong className="text-white">{crossTrackDeviationMeters}m</strong>
          </span>
          <span
            className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${
              crossTrackDeviationMeters > 180
                ? 'bg-red-500/20 text-red-300'
                : 'bg-emerald-500/20 text-emerald-300'
            }`}
          >
            {crossTrackDeviationMeters > 180 ? '⚠️ Off-Track' : '✓ Safe Corridor'}
          </span>
        </div>

        {/* Journey Progress */}
        <div>
          <div className="flex items-center justify-between text-[11px] text-[#94a3b8] mb-1 font-mono">
            <span>Journey Corridor Progress</span>
            <strong className="text-white">{progressPercent}%</strong>
          </div>
          <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#00d9d9] to-[#22c55e] transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Real-Time Nearest Safe Haven Card */}
      {nearestSafePOI && (
        <div className="p-2.5 rounded-xl bg-cyan-950/30 border border-cyan-500/30 flex items-center justify-between gap-3 mb-2 font-sans">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#00d9d9]/20 text-[#00d9d9] flex items-center justify-center flex-shrink-0">
              {nearestSafePOI.type === 'police' ? (
                <Shield className="w-4 h-4" />
              ) : (
                <Hospital className="w-4 h-4" />
              )}
            </div>
            <div>
              <small className="text-[10px] text-[#00d9d9] font-bold uppercase tracking-wider block">
                NEAREST SAFE HAVEN ({distanceToNearestSafePOIKm} KM AWAY)
              </small>
              <b className="text-xs text-white block truncate max-w-[180px] sm:max-w-[240px]">
                {nearestSafePOI.name}
              </b>
            </div>
          </div>

          <button
            onClick={() => onCallPOI && onCallPOI(nearestSafePOI.phone)}
            className="px-3 py-1.5 rounded-lg bg-[#00d9d9] hover:bg-cyan-300 text-[#050914] text-xs font-extrabold flex items-center gap-1 shadow-md transition-transform active:scale-95"
          >
            <Phone className="w-3 h-3" /> Call
          </button>
        </div>
      )}

      {/* Expandable Corridor Assessment Drawer */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full py-1.5 text-[11px] font-bold text-[#94a3b8] hover:text-white flex items-center justify-center gap-1 transition-colors"
      >
        {isExpanded ? 'Hide Detailed Safety Metrics' : 'View Detailed Safety Metrics'}
        {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
      </button>

      {isExpanded && (
        <div className="mt-3 pt-3 border-t border-white/10 space-y-2.5 text-xs font-sans">
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-black/30 p-2.5 rounded-xl border border-white/5">
              <span className="text-[#94a3b8] text-[10px] block flex items-center gap-1">
                <Zap className="w-3 h-3 text-amber-400" /> Street Lighting Index
              </span>
              <b className="text-white font-mono text-sm">{assessment.lightingScore}%</b>
            </div>

            <div className="bg-black/30 p-2.5 rounded-xl border border-white/5">
              <span className="text-[#94a3b8] text-[10px] block flex items-center gap-1">
                <Eye className="w-3 h-3 text-cyan-400" /> CCTV Surveillance
              </span>
              <b className="text-white font-mono text-sm">{assessment.cctvDensityScore}%</b>
            </div>
          </div>

          {/* Time of Day Multiplier */}
          <div className="p-2.5 rounded-xl bg-black/40 border border-white/5 text-[11px]">
            <span className="text-[#94a3b8] block">Context Multiplier:</span>
            <strong className="text-cyan-300 font-mono">{timeOfDayLabel}</strong>
          </div>

          {/* Key Safety Recommendations */}
          <div className="space-y-1">
            <small className="text-[10px] font-bold text-[#94a3b8] uppercase tracking-wider block">
              AI Safety Directives
            </small>
            {assessment.safetyRecommendations.map((rec, i) => (
              <div key={i} className="text-[11px] text-[#cbd5e1] flex items-start gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-[#22c55e] flex-shrink-0 mt-0.5" />
                <span>{rec}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  )
}
