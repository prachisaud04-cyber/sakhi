'use client'

import React, { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Activity,
  AlertOctagon,
  AlertTriangle,
  Bluetooth,
  Check,
  ChevronRight,
  Flame,
  Heart,
  HeartPulse,
  Plus,
  Radio,
  RefreshCw,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Thermometer,
  Unlink,
  Watch,
  WifiOff,
  X,
  Zap,
} from 'lucide-react'
import {
  POPULAR_SMARTWATCH_BRANDS,
  SmartwatchBrand,
  WearableTelemetryData,
} from '@/hooks/useWearableTelemetry'
import { Card } from './Card'

interface WearableTelemetryCardProps {
  telemetry: WearableTelemetryData
  onConnectWatch?: (brand: SmartwatchBrand, modelName: string) => void
  onDisconnectWatch?: () => void
  onTriggerPanic?: () => void
  onTriggerOfflineSms?: () => void
  isOfflineMode?: boolean
}

export const WearableTelemetryCard: React.FC<WearableTelemetryCardProps> = ({
  telemetry,
  onConnectWatch,
  onDisconnectWatch,
  onTriggerPanic,
  onTriggerOfflineSms,
  isOfflineMode = false,
}) => {
  const [activeTab, setActiveTab] = useState<'vitals' | 'motion' | 'deadzone'>('vitals')
  const [isPairModalOpen, setIsPairModalOpen] = useState<boolean>(false)
  const [selectedBrand, setSelectedBrand] = useState<SmartwatchBrand>('Noise')
  const [customModel, setCustomModel] = useState<string>('')
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  // Animated ECG Wave Canvas (Only animates when connected)
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationId: number
    let x = 0
    const height = canvas.height
    const width = canvas.width
    const midY = height / 2

    // Clear background
    ctx.fillStyle = '#081120'
    ctx.fillRect(0, 0, width, height)

    const drawEcg = () => {
      ctx.fillStyle = 'rgba(8, 17, 32, 0.08)'
      ctx.fillRect(0, 0, width, height)

      if (!telemetry.isConnected || !telemetry.heartRate) {
        // Flatline / Standby line when disconnected
        ctx.strokeStyle = '#334155'
        ctx.lineWidth = 1.5
        ctx.beginPath()
        ctx.moveTo(0, midY)
        ctx.lineTo(width, midY)
        ctx.stroke()
        return
      }

      ctx.strokeStyle = telemetry.heartRate > 110 ? '#ef4444' : '#00d9d9'
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(x, midY)

      const phase = (x % 60) / 60

      let y = midY
      if (phase > 0.4 && phase < 0.45) y = midY - 6
      else if (phase >= 0.45 && phase < 0.48) y = midY + 4
      else if (phase >= 0.48 && phase < 0.52) y = midY - (telemetry.heartRate > 110 ? 22 : 16)
      else if (phase >= 0.52 && phase < 0.56) y = midY + 8
      else if (phase >= 0.62 && phase < 0.7) y = midY - 8

      ctx.lineTo(x + 2, y)
      ctx.stroke()

      x = (x + 2) % width
      animationId = requestAnimationFrame(drawEcg)
    }

    animationId = requestAnimationFrame(drawEcg)
    return () => cancelAnimationFrame(animationId)
  }, [telemetry.isConnected, telemetry.heartRate])

  const isTachycardia = (telemetry.heartRate || 0) > 110
  const isHighBP = (telemetry.bloodPressureSystolic || 0) > 135
  const isHighG = telemetry.acceleration.totalG > 2.5

  const handlePairSubmit = (brand: SmartwatchBrand, model: string) => {
    if (onConnectWatch) {
      onConnectWatch(brand, model || `${brand} Smartwatch`)
    }
    setIsPairModalOpen(false)
  }

  return (
    <Card noTilt className="p-4 border-cyan-500/30 bg-[#081120]/95 relative overflow-hidden font-sans my-2">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-[#00d9d9]">
            <Watch className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <b className="text-sm font-extrabold text-white">
                {telemetry.isConnected ? telemetry.deviceName : 'Smartwatch / Fitness Band'}
              </b>
              <span
                className={`text-[9px] font-extrabold font-mono px-2 py-0.5 rounded-full ${
                  telemetry.isConnected
                    ? 'bg-emerald-500/20 text-[#22c55e] border border-emerald-500/30'
                    : 'bg-slate-800 text-slate-400 border border-white/10'
                }`}
              >
                {telemetry.isConnected ? '● CONNECTED' : 'NOT CONNECTED'}
              </span>
            </div>
            <small className="text-[11px] text-[#94a3b8] flex items-center gap-1.5 font-mono">
              <Bluetooth className="w-3 h-3 text-blue-400" />
              {telemetry.isConnected
                ? `${telemetry.brand} BLE Active · Battery: ${telemetry.batteryLevel}%`
                : 'Universal BLE Scanner · Any Brand Supported'}
            </small>
          </div>
        </div>

        {/* Tab Toggle */}
        <div className="flex items-center p-1 rounded-xl bg-black/50 border border-white/10 text-[11px] font-bold">
          <button
            onClick={() => setActiveTab('vitals')}
            className={`px-2.5 py-1 rounded-lg transition-all ${
              activeTab === 'vitals' ? 'bg-[#00d9d9] text-[#050914]' : 'text-[#94a3b8]'
            }`}
          >
            Vitals
          </button>
          <button
            onClick={() => setActiveTab('motion')}
            className={`px-2.5 py-1 rounded-lg transition-all ${
              activeTab === 'motion' ? 'bg-[#00d9d9] text-[#050914]' : 'text-[#94a3b8]'
            }`}
          >
            Motion
          </button>
          <button
            onClick={() => setActiveTab('deadzone')}
            className={`px-2.5 py-1 rounded-lg transition-all ${
              activeTab === 'deadzone' ? 'bg-amber-500 text-black' : 'text-amber-400'
            }`}
          >
            Offline SOS
          </button>
        </div>
      </div>

      {/* TAB 1: BIOMETRIC VITALS (PULSE, BP, SPO2, TEMP) */}
      {activeTab === 'vitals' && (
        <div className="space-y-3">
          {/* Animated ECG Pulse Visualizer */}
          <div className="relative rounded-2xl overflow-hidden border border-cyan-500/20 bg-[#081120] p-2.5">
            <div className="flex items-center justify-between mb-1 text-[11px] font-mono">
              <span className="text-[#94a3b8] flex items-center gap-1">
                <HeartPulse className="w-3.5 h-3.5 text-red-400" /> LIVE ECG WAVE
              </span>
              <span className={telemetry.isConnected ? (isTachycardia ? 'text-red-400 font-bold animate-pulse' : 'text-[#00d9d9]') : 'text-slate-500'}>
                {telemetry.isConnected
                  ? isTachycardia
                    ? '⚠️ ELEVATED DISTRESS PULSE'
                    : 'LIVE SINUS RHYTHM'
                  : 'STANDBY · WATCH NOT CONNECTED'}
              </span>
            </div>
            <canvas ref={canvasRef} width={340} height={50} className="w-full h-12 rounded-lg" />
          </div>

          {/* Vitals Metric Cards Grid (NO FALSE READINGS WHEN DISCONNECTED) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-xs">
            {/* Heart Rate / Pulse */}
            <div className="p-3 rounded-2xl bg-black/40 border border-white/5 flex flex-col justify-between">
              <span className="text-[#94a3b8] text-[10px] block font-sans flex items-center gap-1">
                <Heart className={`w-3.5 h-3.5 text-red-400 ${telemetry.isConnected ? 'fill-current animate-pulse' : ''}`} />
                Pulse Rate
              </span>
              <div className="my-1">
                <b className={`text-xl font-extrabold ${telemetry.isConnected ? (isTachycardia ? 'text-red-400' : 'text-white') : 'text-slate-500'}`}>
                  {telemetry.isConnected && telemetry.heartRate !== null ? telemetry.heartRate : '--'}
                </b>
                <small className="text-[10px] text-[#94a3b8] ml-1">BPM</small>
              </div>
              <span className="text-[9px] text-[#94a3b8] font-sans">
                {telemetry.isConnected ? 'Resting: 64 bpm' : 'No watch linked'}
              </span>
            </div>

            {/* Blood Pressure */}
            <div className="p-3 rounded-2xl bg-black/40 border border-white/5 flex flex-col justify-between">
              <span className="text-[#94a3b8] text-[10px] block font-sans flex items-center gap-1">
                <Activity className="w-3.5 h-3.5 text-[#00d9d9]" /> Blood Pressure
              </span>
              <div className="my-1">
                <b className={`text-lg font-extrabold ${telemetry.isConnected ? (isHighBP ? 'text-amber-400' : 'text-white') : 'text-slate-500'}`}>
                  {telemetry.isConnected && telemetry.bloodPressureSystolic !== null
                    ? `${telemetry.bloodPressureSystolic}/${telemetry.bloodPressureDiastolic}`
                    : '-- / --'}
                </b>
                <small className="text-[10px] text-[#94a3b8] ml-1">mmHg</small>
              </div>
              <span className="text-[9px] text-[#22c55e] font-sans">
                {telemetry.isConnected ? (isHighBP ? 'Elevated BP' : 'Optimal Band') : 'Connect watch'}
              </span>
            </div>

            {/* Blood Oxygen */}
            <div className="p-3 rounded-2xl bg-black/40 border border-white/5 flex flex-col justify-between">
              <span className="text-[#94a3b8] text-[10px] block font-sans flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 text-cyan-400" /> Oxygen (SpO2)
              </span>
              <div className="my-1">
                <b className={`text-xl font-extrabold ${telemetry.isConnected ? 'text-white' : 'text-slate-500'}`}>
                  {telemetry.isConnected && telemetry.bloodOxygenSpO2 !== null ? `${telemetry.bloodOxygenSpO2}%` : '-- %'}
                </b>
              </div>
              <span className="text-[9px] text-[#22c55e] font-sans">
                {telemetry.isConnected ? 'Normal 98%' : 'Standby'}
              </span>
            </div>

            {/* Skin Temperature */}
            <div className="p-3 rounded-2xl bg-black/40 border border-white/5 flex flex-col justify-between">
              <span className="text-[#94a3b8] text-[10px] block font-sans flex items-center gap-1">
                <Thermometer className="w-3.5 h-3.5 text-amber-400" /> Temperature
              </span>
              <div className="my-1">
                <b className={`text-xl font-extrabold ${telemetry.isConnected ? 'text-white' : 'text-slate-500'}`}>
                  {telemetry.isConnected && telemetry.skinTempCelsius !== null ? `${telemetry.skinTempCelsius}°C` : '-- °C'}
                </b>
              </div>
              <span className="text-[9px] text-[#94a3b8] font-sans">
                {telemetry.isConnected ? 'Comfort Zone' : 'Standby'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: 3-AXIS ACCELERATION & G-FORCE MOTION */}
      {activeTab === 'motion' && (
        <div className="space-y-3 font-mono">
          <div className="p-3 rounded-2xl bg-black/40 border border-white/5">
            <div className="flex items-center justify-between mb-2 text-xs">
              <span className="text-[#94a3b8] font-sans flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-400" /> Hardware G-Force &amp; Motion
              </span>
              <b className={`text-base ${isHighG ? 'text-red-400 animate-pulse' : 'text-[#00d9d9]'}`}>
                {telemetry.acceleration.totalG} G
              </b>
            </div>

            {/* 3-Axis Readout */}
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="bg-[#0f172a] p-2 rounded-xl border border-white/5">
                <span className="text-[#94a3b8] text-[10px] block">X-Axis (Lateral)</span>
                <b className="text-white">{telemetry.acceleration.x} G</b>
              </div>
              <div className="bg-[#0f172a] p-2 rounded-xl border border-white/5">
                <span className="text-[#94a3b8] text-[10px] block">Y-Axis (Vertical)</span>
                <b className="text-white">{telemetry.acceleration.y} G</b>
              </div>
              <div className="bg-[#0f172a] p-2 rounded-xl border border-white/5">
                <span className="text-[#94a3b8] text-[10px] block">Z-Axis (Depth)</span>
                <b className="text-white">{telemetry.acceleration.z} G</b>
              </div>
            </div>
          </div>

          {telemetry.isFallDetected && (
            <div className="p-3 bg-red-950/60 border border-red-500/60 rounded-2xl flex items-center justify-between text-xs text-red-200">
              <div className="flex items-center gap-2">
                <AlertOctagon className="w-5 h-5 text-red-400 animate-spin flex-shrink-0" />
                <span>Impact Detected ({telemetry.acceleration.totalG}G)! Triggering Fall Protocol.</span>
              </div>
              <button
                onClick={onTriggerPanic}
                className="px-3 py-1 bg-red-600 hover:bg-red-500 text-white font-extrabold rounded-lg text-xs"
              >
                Send SOS
              </button>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: DEAD-ZONE NO-NETWORK OFFLINE PROTOCOL */}
      {activeTab === 'deadzone' && (
        <div className="space-y-3 font-sans">
          <div className="p-3.5 rounded-2xl bg-amber-950/30 border border-amber-500/40 text-xs">
            <div className="flex items-center gap-2 mb-1.5">
              <WifiOff className="w-4 h-4 text-amber-400 flex-shrink-0" />
              <b className="text-white text-xs">Dead-Zone GSM Protocol Active</b>
            </div>
            <p className="text-[#cbd5e1] text-[11px] leading-relaxed mb-3">
              In tunnels, remote highway stretches, or zero-data zones, SAKHI uses local hardware sensors (GPS + Accelerometer) and transmits compact SMS distress packets directly through GSM towers without requiring internet.
            </p>

            <button
              onClick={onTriggerOfflineSms}
              className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg transition-transform active:scale-95"
            >
              <Smartphone className="w-4 h-4" /> 1-Tap Offline GSM SMS Broadcast
            </button>
          </div>
        </div>
      )}

      {/* Bottom Action Footer */}
      <div className="mt-3 pt-2.5 border-t border-white/5 flex items-center justify-between text-xs">
        {!telemetry.isConnected ? (
          <button
            onClick={() => setIsPairModalOpen(true)}
            className="px-3.5 py-1.5 rounded-xl bg-[#00d9d9] hover:bg-cyan-300 text-[#050914] font-extrabold text-xs flex items-center gap-1.5 shadow-md transition-transform active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" /> Connect Any Smartwatch / Band
          </button>
        ) : (
          <button
            onClick={onDisconnectWatch}
            className="text-slate-400 hover:text-red-400 font-bold text-[11px] flex items-center gap-1 transition-colors"
          >
            <Unlink className="w-3 h-3" /> Disconnect Watch
          </button>
        )}

        <button
          onClick={onTriggerPanic}
          disabled={!telemetry.isConnected}
          className="px-3 py-1 rounded-xl bg-red-950/60 hover:bg-red-900 border border-red-500/40 text-red-300 font-extrabold text-[11px] flex items-center gap-1 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <AlertTriangle className="w-3 h-3 text-red-400" /> Wearable Panic SOS
        </button>
      </div>

      {/* UNIVERSAL MULTI-BRAND SMARTWATCH PAIRING MODAL */}
      {isPairModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            className="w-full max-w-md bg-[#0c1728] border border-cyan-500/30 rounded-3xl p-6 shadow-2xl relative text-left"
          >
            {/* Close Button */}
            <button
              onClick={() => setIsPairModalOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-full bg-white/5 hover:bg-white/10 text-[#94a3b8] hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-[#00d9d9]">
                <Bluetooth className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-white">Connect Smartwatch / Band</h3>
                <p className="text-xs text-[#94a3b8]">Universal BLE support for all Indian &amp; Global brands</p>
              </div>
            </div>

            {/* Select Brand Grid */}
            <div className="space-y-2 mb-4">
              <small className="text-[10px] font-bold text-[#00d9d9] uppercase tracking-wider block">
                Select Your Watch Brand
              </small>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto pr-1 font-sans">
                {POPULAR_SMARTWATCH_BRANDS.map((item) => (
                  <button
                    key={item.brand}
                    onClick={() => {
                      setSelectedBrand(item.brand)
                      setCustomModel(item.example)
                    }}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      selectedBrand === item.brand
                        ? 'bg-cyan-950/60 border-cyan-500 text-white shadow-md'
                        : 'bg-black/40 border-white/5 text-[#cbd5e1] hover:border-white/20'
                    }`}
                  >
                    <b className="text-xs block text-white">{item.brand}</b>
                    <small className="text-[10px] text-[#94a3b8] block truncate">{item.example}</small>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Model Name Input */}
            <div className="mb-4">
              <label className="text-[11px] font-bold text-[#94a3b8] block mb-1">
                Model Name (Optional):
              </label>
              <input
                type="text"
                value={customModel}
                onChange={(e) => setCustomModel(e.target.value)}
                placeholder="e.g. Noise ColorFit Pulse 2 / Apple Watch Series 9"
                className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/15 text-white text-xs font-sans focus:outline-none focus:border-[#00d9d9]"
              />
            </div>

            {/* Pair Action Buttons */}
            <div className="space-y-2">
              <button
                onClick={() => handlePairSubmit(selectedBrand, customModel)}
                className="primary w-full py-3 text-xs font-extrabold flex items-center justify-center gap-2 shadow-xl"
              >
                <Check className="w-4 h-4" /> Link {selectedBrand} &amp; Start Live Vitals
              </button>

              <button
                onClick={() => setIsPairModalOpen(false)}
                className="secondary w-full py-2.5 text-xs font-bold"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </Card>
  )
}
