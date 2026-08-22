'use client'

import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  Info,
  Pause,
  Play,
  RefreshCw,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
} from 'lucide-react'
import { RiskMode } from '@/types'

interface DemoSimulationPanelProps {
  currentMode?: RiskMode
  onSelectMode: (mode: RiskMode) => void
}

export const DemoSimulationPanel: React.FC<DemoSimulationPanelProps> = ({
  currentMode = 'normal',
  onSelectMode,
}) => {
  const [selectedScenario, setSelectedScenario] = useState<RiskMode>(currentMode)
  const [isAutoRunning, setIsAutoRunning] = useState<boolean>(false)

  // Keep internal state in sync with prop if changed externally
  useEffect(() => {
    setSelectedScenario(currentMode)
  }, [currentMode])

  // Auto Simulation Player
  useEffect(() => {
    let timer: NodeJS.Timeout
    if (isAutoRunning) {
      timer = setInterval(() => {
        setSelectedScenario((prev) => {
          const nextMode: RiskMode =
            prev === 'normal' ? 'suspicious' : prev === 'suspicious' ? 'critical' : 'normal'
          onSelectMode(nextMode)
          return nextMode
        })
      }, 3500)
    }
    return () => clearInterval(timer)
  }, [isAutoRunning, onSelectMode])

  const handleSelect = (mode: RiskMode) => {
    setIsAutoRunning(false)
    setSelectedScenario(mode)
    onSelectMode(mode)
  }

  const handleReset = () => {
    setIsAutoRunning(false)
    setSelectedScenario('normal')
    onSelectMode('normal')
  }

  const toggleAutoRun = () => {
    setIsAutoRunning(!isAutoRunning)
  }

  // Risk Meter Gauge percentage
  const getRiskMeterPosition = () => {
    switch (selectedScenario) {
      case 'normal':
        return '15%'
      case 'suspicious':
        return '50%'
      case 'critical':
        return '88%'
    }
  }

  // Accent color mapping
  const getAccentColor = () => {
    switch (selectedScenario) {
      case 'normal':
        return '#22c55e'
      case 'suspicious':
        return '#f59e0b'
      case 'critical':
        return '#ef4444'
    }
  }

  return (
    <div
      data-no-tilt
      className="bg-[#0f172a]/90 border border-white/10 rounded-2xl p-6 shadow-2xl backdrop-blur-xl relative overflow-hidden"
    >
      {/* Simulation Header Badge & Disclaimer */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-4 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-[#19d3c5]/15 border border-[#19d3c5]/30 text-[10px] font-extrabold text-[#19d3c5] uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#19d3c5] animate-pulse" />
              SIMULATION MODE
            </span>
            <span className="text-xs text-[#94a3b8] font-mono">SAFE TESTBED</span>
          </div>
          <h3 className="text-xl font-extrabold text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#19d3c5]" /> Contextual Risk Simulation
          </h3>
          <p className="text-xs text-[#94a3b8] mt-0.5">
            Simulate safety scenarios to preview SAKHI contextual risk detection.
          </p>
        </div>

        {/* Auto Run & Reset Controls */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={toggleAutoRun}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 ${
              isAutoRunning
                ? 'bg-amber-500/20 border-amber-500/40 text-amber-400'
                : 'bg-white/5 border-white/10 text-white hover:bg-white/10'
            }`}
            title="Auto-cycle through all 3 risk scenarios"
          >
            {isAutoRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            {isAutoRunning ? 'Pause Demo' : 'Run Simulation'}
          </button>
          <button
            onClick={handleReset}
            className="px-3 py-1.5 rounded-xl text-xs font-bold bg-white/5 hover:bg-white/10 border border-white/10 text-[#94a3b8] hover:text-white transition-all flex items-center gap-1"
            title="Reset simulation back to normal"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Reset
          </button>
        </div>
      </div>

      {/* Disclaimer Banner */}
      <div className="bg-black/40 border border-white/5 rounded-xl p-2.5 mb-5 flex items-center gap-2 text-xs text-[#94a3b8]">
        <Info className="w-4 h-4 text-[#19d3c5] flex-shrink-0" />
        <span>
          <strong>Safe Simulation:</strong> These scenarios are simulated and do not trigger real emergency calls, SMS alerts, or location tracking.
        </span>
      </div>

      {/* Three Interactive Scenario Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6" data-no-tilt>
        {/* NORMAL CARD */}
        <button
          type="button"
          aria-pressed={selectedScenario === 'normal'}
          onClick={() => handleSelect('normal')}
          className={`p-4 rounded-xl border text-left transition-all duration-200 focus:ring-2 focus:ring-[#22c55e] outline-none relative overflow-hidden ${
            selectedScenario === 'normal'
              ? 'border-[#22c55e] bg-gradient-to-br from-[#0b2119] to-[#123b2a] shadow-lg shadow-emerald-500/20 -translate-y-0.5'
              : 'border-white/10 bg-[#070b14]/60 hover:bg-[#111827] opacity-80 hover:opacity-100'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="w-7 h-7 rounded-lg bg-[#22c55e]/20 border border-[#22c55e]/30 flex items-center justify-center text-[#22c55e]">
              <ShieldCheck className="w-4 h-4" />
            </span>
            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-[#22c55e]/15 text-[#22c55e] border border-[#22c55e]/30">
              ● LOW RISK
            </span>
          </div>
          <b className="text-base font-extrabold text-white block">NORMAL</b>
          <small className="text-xs text-[#94a3b8] block mt-1 leading-snug">
            Low risk environment. Calm &amp; safe conditions detected.
          </small>
        </button>

        {/* SUSPICIOUS CARD */}
        <button
          type="button"
          aria-pressed={selectedScenario === 'suspicious'}
          onClick={() => handleSelect('suspicious')}
          className={`p-4 rounded-xl border text-left transition-all duration-200 focus:ring-2 focus:ring-[#f59e0b] outline-none relative overflow-hidden ${
            selectedScenario === 'suspicious'
              ? 'border-[#f59e0b] bg-gradient-to-br from-[#261b08] to-[#3b2508] shadow-lg shadow-amber-500/20 -translate-y-0.5'
              : 'border-white/10 bg-[#070b14]/60 hover:bg-[#111827] opacity-80 hover:opacity-100'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="w-7 h-7 rounded-lg bg-[#f59e0b]/20 border border-[#f59e0b]/30 flex items-center justify-center text-[#f59e0b]">
              <AlertTriangle className="w-4 h-4" />
            </span>
            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-[#f59e0b]/15 text-[#f59e0b] border border-[#f59e0b]/30">
              ● ELEVATED RISK
            </span>
          </div>
          <b className="text-base font-extrabold text-white block">SUSPICIOUS</b>
          <small className="text-xs text-[#94a3b8] block mt-1 leading-snug">
            Unusual route deviation or unexpected stop simulated.
          </small>
        </button>

        {/* CRITICAL CARD */}
        <button
          type="button"
          aria-pressed={selectedScenario === 'critical'}
          onClick={() => handleSelect('critical')}
          className={`p-4 rounded-xl border text-left transition-all duration-200 focus:ring-2 focus:ring-[#ef4444] outline-none relative overflow-hidden ${
            selectedScenario === 'critical'
              ? 'border-[#ef4444] bg-gradient-to-br from-[#260b10] to-[#3b0b16] shadow-lg shadow-red-500/20 -translate-y-0.5'
              : 'border-white/10 bg-[#070b14]/60 hover:bg-[#111827] opacity-80 hover:opacity-100'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="w-7 h-7 rounded-lg bg-[#ef4444]/20 border border-[#ef4444]/30 flex items-center justify-center text-[#ef4444]">
              <ShieldAlert className="w-4 h-4" />
            </span>
            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-[#ef4444]/15 text-[#ef4444] border border-[#ef4444]/30">
              ● HIGH RISK
            </span>
          </div>
          <b className="text-base font-extrabold text-white block">CRITICAL</b>
          <small className="text-xs text-[#94a3b8] block mt-1 leading-snug">
            High-risk situation. Simulated emergency escalation.
          </small>
        </button>
      </div>

      {/* Dynamic Risk Gauge Slider */}
      <div className="mb-6 p-4 rounded-xl bg-black/40 border border-white/5" data-no-tilt>
        <div className="flex justify-between text-[11px] font-extrabold tracking-wider text-[#94a3b8] mb-2 font-mono uppercase">
          <span className={selectedScenario === 'normal' ? 'text-[#22c55e]' : ''}>LOW RISK</span>
          <span className={selectedScenario === 'suspicious' ? 'text-[#f59e0b]' : ''}>ELEVATED RISK</span>
          <span className={selectedScenario === 'critical' ? 'text-[#ef4444]' : ''}>HIGH RISK</span>
        </div>
        <div className="relative w-full h-3 bg-white/10 rounded-full overflow-hidden">
          {/* Background Gradient Track */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#22c55e] via-[#f59e0b] to-[#ef4444] opacity-30" />
          {/* Animated Indicator Pin */}
          <motion.div
            animate={{ left: getRiskMeterPosition() }}
            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
            style={{ backgroundColor: getAccentColor() }}
            className="absolute top-0 bottom-0 w-5 rounded-full -ml-2.5 shadow-lg border-2 border-white"
          />
        </div>
      </div>

      {/* Contextual Response Panel */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4" data-no-tilt>
        {/* Left: System Assessment */}
        <div className="p-4 rounded-xl bg-black/40 border border-white/10">
          <small className="text-[10px] font-bold tracking-widest text-[#19d3c5] uppercase block mb-1">
            SIMULATED AI RESPONSE
          </small>
          <b className="text-base font-bold text-white block mb-1">
            {selectedScenario === 'normal'
              ? 'Low Risk Environment'
              : selectedScenario === 'suspicious'
              ? 'Elevated Risk Detected'
              : 'Simulated High-Risk Scenario'}
          </b>
          <p className="text-xs text-[#cbd5e1] leading-relaxed mb-3">
            {selectedScenario === 'normal'
              ? 'Your environment appears calm and safe. Continue your journey normally.'
              : selectedScenario === 'suspicious'
              ? 'SAKHI detected a simulated change in route behavior or contextual anomaly.'
              : 'This is a simulated high-risk scenario. SAKHI displays priority safety actions.'}
          </p>
          <div className="space-y-1.5 border-t border-white/10 pt-2.5">
            <small className="text-[10px] font-bold text-[#94a3b8] uppercase block">Recommended Actions:</small>
            {selectedScenario === 'normal' ? (
              <p className="text-xs text-[#22c55e] font-medium flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" /> Stay aware of your surroundings normally.
              </p>
            ) : selectedScenario === 'suspicious' ? (
              <div className="space-y-1 text-xs text-[#f59e0b]">
                <div className="flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" /> Stay alert &amp; check route lighting
                </div>
                <div className="flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" /> Share live location with emergency contact
                </div>
              </div>
            ) : (
              <div className="space-y-1 text-xs text-[#ef4444]">
                <div className="flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5 flex-shrink-0" /> Move towards a safe, well-lit public area
                </div>
                <div className="flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5 flex-shrink-0" /> Use emergency escalation if in real danger
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right: Simulation Timeline Log */}
        <div className="p-4 rounded-xl bg-black/40 border border-white/10 flex flex-col justify-between">
          <div>
            <small className="text-[10px] font-bold tracking-widest text-[#94a3b8] uppercase block mb-2 font-mono">
              SIMULATION LOG TIMELINE
            </small>
            <div className="space-y-2 font-mono text-xs">
              <div className="flex items-center gap-2 text-[#22c55e]">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>[00:00] Environment safety check OK</span>
              </div>
              {selectedScenario === 'normal' && (
                <>
                  <div className="flex items-center gap-2 text-[#22c55e]">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>[00:02] Route trajectory verified</span>
                  </div>
                  <div className="flex items-center gap-2 text-[#22c55e]">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>[00:05] Contextual risk score: 95/100</span>
                  </div>
                </>
              )}
              {selectedScenario === 'suspicious' && (
                <>
                  <div className="flex items-center gap-2 text-[#f59e0b]">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>[00:02] Simulated route anomaly</span>
                  </div>
                  <div className="flex items-center gap-2 text-[#f59e0b]">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>[00:05] Awareness recommendation generated</span>
                  </div>
                </>
              )}
              {selectedScenario === 'critical' && (
                <>
                  <div className="flex items-center gap-2 text-[#ef4444]">
                    <ShieldAlert className="w-3.5 h-3.5" />
                    <span>[00:02] Simulated high-risk incident</span>
                  </div>
                  <div className="flex items-center gap-2 text-[#ef4444]">
                    <ShieldAlert className="w-3.5 h-3.5" />
                    <span>[00:05] Escalation options displayed</span>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="mt-4 pt-2 border-t border-white/10 text-[11px] text-[#94a3b8] flex items-center justify-between font-mono">
            <span>Status: Active Simulation</span>
            <span className="text-[#19d3c5]">100% Client-Side Safe</span>
          </div>
        </div>
      </div>
    </div>
  )
}
