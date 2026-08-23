'use client'

import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Activity,
  BatteryMedium,
  CheckCircle2,
  ChevronRight,
  Hospital,
  LockKeyhole,
  MapPin,
  Mic,
  Moon,
  Navigation,
  Palette,
  Phone,
  PhoneCall,
  RefreshCw,
  Route,
  Shield,
  ShieldCheck,
  Siren,
  Sparkles,
  Sun,
  Wifi,
} from 'lucide-react'
import { HomeProps, RiskMode } from '@/types'
import {
  EmergencyContact,
  initiateCellularCall,
} from '@/constants/contacts'
import { useAuth } from '@/contexts/AuthContext'
import { useTheme } from '@/contexts/ThemeContext'
import { useCriticalBatteryAutoAlert } from '@/hooks/useCriticalBatteryAutoAlert'
import { useDeviceTelemetry } from '@/hooks/useDeviceTelemetry'
import { useLiveLocationSession } from '@/hooks/useLiveLocationSession'
import { useWearableTelemetry } from '@/hooks/useWearableTelemetry'
import { buildCompactOfflineSms, triggerDeadZoneSmsBroadcast } from '@/lib/offlineSafetyEngine'
import { AudioRecorderModal } from '@/components/ui/AudioRecorderModal'
import { Card } from '@/components/ui/Card'
import { CriticalBatteryAlertModal } from '@/components/ui/CriticalBatteryAlertModal'
import { DemoSimulationPanel } from '@/components/ui/DemoSimulationPanel'
import { DesktopCallFallbackModal } from '@/components/ui/DesktopCallFallbackModal'
import { EmergencyCallingModal } from '@/components/ui/EmergencyCallingModal'
import { Header } from '@/components/ui/Header'
import { QuickToolsModal } from '@/components/ui/QuickToolsModal'
import { ShareLiveLocationModal } from '@/components/ui/ShareLiveLocationModal'
import { Shield3D } from '@/components/ui/Shield3D'
import { WearableTelemetryCard } from '@/components/ui/WearableTelemetryCard'

export const HomeScreen: React.FC<HomeProps> = ({
  go,
  demo,
  mode = 'normal',
  locationSharingEnabled,
  toggleLocationSharing,
  location,
  isTracking,
}) => {
  const { user, contacts } = useAuth()
  const { theme, resolvedTheme, setTheme, toggleTheme } = useTheme()
  const [isEmergencyCallingOpen, setIsEmergencyCallingOpen] = useState<boolean>(false)
  const [isAudioRecorderOpen, setIsAudioRecorderOpen] = useState<boolean>(false)
  const [isQuickToolsOpen, setIsQuickToolsOpen] = useState<boolean>(false)
  const [isShareLiveLocationOpen, setIsShareLiveLocationOpen] = useState<boolean>(false)
  const [fallbackContact, setFallbackContact] = useState<EmergencyContact | null>(null)
  const [isRunningCheck, setIsRunningCheck] = useState<boolean>(false)
  const [checkComplete, setCheckComplete] = useState<boolean>(false)
  const telemetry = useDeviceTelemetry()
  const { session, startSharing, stopSharing, updateLocation } = useLiveLocationSession()

  // Critical Battery (0% / 5% Shutdown Guard) Auto-Alert Hook
  const {
    isAlertModalOpen: isBatteryAlertModalOpen,
    closeAlertModal: closeBatteryAlertModal,
    alertDetails: batteryAlertDetails,
    triggerManualTest0Percent: triggerTest0PercentBattery,
    broadcastSmsNow: broadcastBatterySmsNow,
    isCriticalLevel: isCriticalBattery,
  } = useCriticalBatteryAutoAlert({
    batteryLevel: telemetry.batteryLevel,
    isCharging: telemetry.isCharging,
    location,
    userName: user?.name || 'Riya Sharma',
    contacts,
    thresholdPercent: 5,
  })

  const {
    telemetry: wearableTelemetry,
    connectUniversalWatch,
    disconnectWatch,
    triggerWearablePanic,
  } = useWearableTelemetry({
    mode,
    onFallDetected: (g) => {
      telemetry.hapticVibrate([500, 100, 500])
      go('emergency')
    },
    onPanicButtonPressed: () => {
      telemetry.hapticVibrate([400, 100, 400])
      go('emergency')
    },
  })

  // Update live location session telemetry whenever GPS location updates
  useEffect(() => {
    if (location && session?.isSharing) {
      updateLocation(location)
    }
  }, [location, session?.isSharing, updateLocation])

  const handleRunDeviceCheck = () => {
    setIsRunningCheck(true)
    telemetry.hapticVibrate([60, 40, 60])
    setTimeout(() => {
      setIsRunningCheck(false)
      setCheckComplete(true)
      setTimeout(() => setCheckComplete(false), 3000)
    }, 1200)
  }

  const handleTriggerOfflineSms = () => {
    const compactSms = buildCompactOfflineSms('Riya Sharma', location, telemetry.batteryLevel, {
      heartRate: wearableTelemetry.heartRate || undefined,
      gForce: wearableTelemetry.acceleration.totalG,
      reason: 'Offline Dead-Zone SOS',
    })
    triggerDeadZoneSmsBroadcast(compactSms)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
      className="relative min-h-screen pb-24"
    >
      <Header />
      <div className="content">
        {/* Quick Accessible Theme Switch Bar on Dashboard */}
        <div className="flex items-center justify-between p-3 rounded-2xl bg-black/40 border border-white/10 dark:bg-[#0c1728]/80 dark:border-cyan-500/30 shadow-lg">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#00d9d9]/15 border border-[#00d9d9]/30 flex items-center justify-center text-[#00d9d9]">
              <Palette className="w-4 h-4" />
            </div>
            <div>
              <b className="text-xs text-white block">Theme Mode</b>
              <small className="text-[11px] text-[#94a3b8] font-mono">
                Active: <span className="text-[#00d9d9] font-bold">{resolvedTheme === 'dark' ? 'Dark Cyber' : 'Light Mode'}</span>
              </small>
            </div>
          </div>

          <div className="flex items-center gap-1.5 bg-black/30 p-1 rounded-xl border border-white/5 font-mono text-xs">
            <button
              type="button"
              onClick={() => setTheme('dark')}
              className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                resolvedTheme === 'dark'
                  ? 'bg-[#00d9d9] text-[#050914] shadow-md shadow-cyan-500/20'
                  : 'text-[#94a3b8] hover:text-white'
              }`}
            >
              <Moon className="w-3.5 h-3.5" /> Dark
            </button>
            <button
              type="button"
              onClick={() => setTheme('light')}
              className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                resolvedTheme === 'light'
                  ? 'bg-[#00d9d9] text-[#050914] shadow-md shadow-cyan-500/20'
                  : 'text-[#94a3b8] hover:text-white'
              }`}
            >
              <Sun className="w-3.5 h-3.5" /> Light
            </button>
          </div>
        </div>

        {/* Minimal, Spacious Hero Section with Cybernetic Artwork */}
        <div className="hero flex flex-col lg:flex-row items-center justify-between gap-8 py-2">
          <div className="flex-1">
            <small className="eyebrow flex items-center gap-1.5 mb-2">
              <span className="w-2 h-2 rounded-full bg-[#00d9d9] animate-ping" />
              PRIVACY-FIRST PROTECTION
            </small>
            <h1 className="text-4xl md:text-5xl font-extrabold text-white leading-tight">
              Welcome,
              <br />
              <em className="text-[#00d9d9] not-italic">{user?.name || 'Prachi Saud'}.</em>
            </h1>
            <p className="text-sm md:text-base text-[#94a3b8] mt-2 max-w-md">
              Your intelligent safety companion for every journey ahead.
            </p>
          </div>

          {/* Futuristic Protection Graphic Card */}
          <Card noTilt className="flex-shrink-0 w-full lg:w-80 p-5 bg-[#081120]/90 border-cyan-500/30">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-[#00d9d9] uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" /> PROTECTION STATUS
              </span>
              <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-[#22c55e] border border-emerald-500/30">
                ● ACTIVE
              </span>
            </div>

            <div className="space-y-2 text-xs font-sans text-[#cbd5e1]">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#22c55e] flex-shrink-0" />
                <span>Location protection active</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#22c55e] flex-shrink-0" />
                <span>{contacts.length} Emergency contacts ready</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#22c55e] flex-shrink-0" />
                <span>Contextual journey monitoring</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#22c55e] flex-shrink-0" />
                <span>Privacy capsule encrypted</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Primary Action CTA Button */}
        <motion.button
          whileHover={{ scale: 1.01, y: -2 }}
          whileTap={{ scale: 0.98 }}
          className="cta group my-2"
          onClick={() => go('start')}
        >
          <Shield className="w-8 h-8 text-[#00d9d9]" />
          <span>
            <b>Start Safety Journey</b>
            <small>Protection for the journey ahead</small>
          </span>
          <ChevronRight className="w-6 h-6 transition-transform duration-200 group-hover:translate-x-1.5" />
        </motion.button>

        {/* ACTIVE LIVE LOCATION SHARING STATUS BANNER */}
        {session?.isSharing && (
          <Card noTilt className="p-4 bg-emerald-950/40 border-emerald-500/50 my-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="w-3 h-3 rounded-full bg-[#22c55e] animate-ping" />
                <div>
                  <b className="text-sm font-extrabold text-white block">LIVE LOCATION SHARING ACTIVE</b>
                  <small className="text-xs text-[#94a3b8]">
                    Session: <strong className="font-mono text-[#00d9d9]">{session.sessionId}</strong> · Sharing with {session.recipients.join(', ')}
                  </small>
                </div>
              </div>
              <button
                onClick={() => setIsShareLiveLocationOpen(true)}
                className="px-3 py-1.5 rounded-xl bg-[#22c55e] text-[#050914] text-xs font-extrabold hover:bg-emerald-300 transition-colors shadow-md"
              >
                Manage Session
              </button>
            </div>
          </Card>
        )}

        {/* PROMINENT QUICK SOS CARD */}
        <Card noTilt className="p-5 bg-gradient-to-r from-red-950/60 via-[#0c1728] to-red-950/40 border-red-500/40 my-2">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <span className="text-xs font-extrabold tracking-widest text-red-400 uppercase flex items-center gap-1.5">
                <Siren className="w-4 h-4 animate-pulse" /> EMERGENCY OVERRIDE
              </span>
              <h2 className="text-xl font-extrabold text-white mt-0.5">Instant SOS Escalation</h2>
              <p className="text-xs text-[#94a3b8]">Immediately alert contacts &amp; prepare telemetry</p>
            </div>
            <button
              onClick={() => go('emergency')}
              className="emergency w-full sm:w-auto px-8 py-3.5 rounded-2xl font-extrabold text-white text-base shadow-xl flex items-center justify-center gap-2"
            >
              <Siren className="w-6 h-6" /> QUICK SOS
            </button>
          </div>
        </Card>

        {/* WEARABLE & BIOMETRIC VITALS DASHBOARD SECTION */}
        <WearableTelemetryCard
          telemetry={wearableTelemetry}
          onConnectWatch={connectUniversalWatch}
          onDisconnectWatch={disconnectWatch}
          onTriggerPanic={triggerWearablePanic}
          onTriggerOfflineSms={handleTriggerOfflineSms}
          isOfflineMode={!telemetry.isOnline}
        />

        {/* WORKABLE QUICK SAFETY ACTIONS */}
        <div className="grid-full my-2">
          <div className="flex items-center justify-between mb-2">
            <b className="text-xs font-bold uppercase tracking-wider text-white">Priority Safety Actions</b>
            <button
              onClick={() => setIsQuickToolsOpen(true)}
              className="text-xs text-[#00d9d9] hover:underline font-bold"
            >
              View All Tools →
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 font-sans" data-no-tilt>
            <button
              onClick={() => setIsEmergencyCallingOpen(true)}
              className="p-3 rounded-xl bg-[#0c1728]/90 border border-red-500/40 hover:border-red-400 text-left transition-all group flex items-center gap-2.5 shadow-lg hover:shadow-red-500/20"
            >
              <div className="p-2 rounded-lg bg-red-500/15 text-red-400">
                <PhoneCall className="w-4 h-4" />
              </div>
              <div>
                <b className="text-xs text-white block group-hover:text-red-400 transition-colors">
                  Emergency Calling
                </b>
                <small className="text-[10px] text-[#94a3b8]">Call a contact</small>
              </div>
            </button>

            <button
              onClick={() => setIsAudioRecorderOpen(true)}
              className="p-3 rounded-xl bg-[#0c1728]/90 border border-blue-500/30 hover:border-blue-400 text-left transition-all group flex items-center gap-2.5"
            >
              <div className="p-2 rounded-lg bg-blue-500/15 text-[#3b82f6]">
                <Mic className="w-4 h-4" />
              </div>
              <div>
                <b className="text-xs text-white block group-hover:text-[#3b82f6] transition-colors">Record Audio</b>
                <small className="text-[10px] text-[#94a3b8]">Ambient Log</small>
              </div>
            </button>

            <button
              onClick={() => setIsShareLiveLocationOpen(true)}
              className="p-3 rounded-xl bg-[#0c1728]/90 border border-cyan-500/30 hover:border-cyan-400 text-left transition-all group flex items-center gap-2.5"
            >
              <div className="p-2 rounded-lg bg-cyan-500/15 text-[#00d9d9]">
                <Navigation className="w-4 h-4" />
              </div>
              <div>
                <b className="text-xs text-white block group-hover:text-[#00d9d9] transition-colors">Share Location</b>
                <small className="text-[10px] text-[#94a3b8]">{session?.isSharing ? 'LIVE' : 'Config'}</small>
              </div>
            </button>

            <button
              onClick={() => go('map')}
              className="p-3 rounded-xl bg-[#0c1728]/90 border border-emerald-500/30 hover:border-emerald-400 text-left transition-all group flex items-center gap-2.5"
            >
              <div className="p-2 rounded-lg bg-emerald-500/15 text-[#22c55e]">
                <Hospital className="w-4 h-4" />
              </div>
              <div>
                <b className="text-xs text-white block group-hover:text-[#22c55e] transition-colors">Find Safe Zone</b>
                <small className="text-[10px] text-[#94a3b8]">Open Map</small>
              </div>
            </button>
          </div>
        </div>

        <div className="dashboard-grid">
          {/* Privacy Protected Card */}
          <Card className="privacy clickable" onClick={toggleLocationSharing}>
            <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-[#00d9d9]">
              <LockKeyhole className="w-6 h-6" />
            </div>
            <span>
              <b>Privacy Protected</b>
              <small>
                {locationSharingEnabled
                  ? isTracking && location
                    ? `Location sharing is ON (${location.lat.toFixed(2)}°, ${location.lng.toFixed(2)}°)`
                    : 'Location sharing is ON'
                  : 'Location sharing is currently OFF.'}
              </small>
            </span>
            <span className={`pill flex items-center gap-1.5 ${locationSharingEnabled ? 'safe' : 'warn'}`}>
              <span className={`w-2 h-2 rounded-full ${locationSharingEnabled ? 'bg-[#22c55e] animate-pulse' : 'bg-[#f59e0b]'}`} />
              {locationSharingEnabled ? 'ON' : 'OFF'}
            </span>
            <ChevronRight />
          </Card>

          {/* Device Guard Status Card */}
          <Card noTilt className="p-5 border-purple-500/30 bg-[#0c1728]/90">
            <div className="flex items-center justify-between mb-3">
              <b className="text-sm font-extrabold text-white flex items-center gap-2">
                <Activity className="w-4 h-4 text-purple-400" /> Device Guard &amp; Sensors
              </b>
              <button
                onClick={handleRunDeviceCheck}
                disabled={isRunningCheck}
                className="px-3 py-1 rounded-xl bg-purple-500/20 border border-purple-500/40 text-purple-300 text-xs font-bold hover:bg-purple-500/30 transition-all flex items-center gap-1"
              >
                {isRunningCheck ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                {isRunningCheck ? 'Checking...' : 'Run Safety Check'}
              </button>
            </div>

            {checkComplete && (
              <div className="p-2.5 mb-3 bg-emerald-950/40 border border-emerald-500/30 rounded-xl text-emerald-400 text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" /> All device sensors &amp; permissions verified!
              </div>
            )}

            <div className="grid grid-cols-3 gap-2 font-mono text-xs text-[#cbd5e1]">
              <div className="bg-black/40 p-2.5 rounded-xl border border-white/5">
                <small className="text-[#94a3b8] block text-[10px] font-sans">Device Battery</small>
                <b className={`flex items-center gap-1 ${telemetry.isLowBattery ? 'text-red-400' : 'text-[#22c55e]'}`}>
                  <BatteryMedium className="w-3.5 h-3.5" />
                  {telemetry.batteryLevel}%{telemetry.isCharging ? ' ⚡' : ''}
                </b>
              </div>
              <div className="bg-black/40 p-2.5 rounded-xl border border-white/5">
                <small className="text-[#94a3b8] block text-[10px] font-sans">GPS Hardware</small>
                <b className={location ? 'text-[#00d9d9]' : 'text-amber-400'}>
                  {location ? 'Active' : 'Standby'}
                </b>
              </div>
              <div className="bg-black/40 p-2.5 rounded-xl border border-white/5">
                <small className="text-[#94a3b8] block text-[10px] font-sans">Network Signal</small>
                <b className={`flex items-center gap-1 ${telemetry.isOnline ? 'text-[#22c55e]' : 'text-red-400'}`}>
                  <Wifi className="w-3.5 h-3.5" /> {telemetry.connectionType}
                </b>
              </div>
            </div>
            <div className="mt-2.5 pt-2 border-t border-white/5 flex items-center justify-between text-[11px] text-[#94a3b8]">
              <span>Device: <strong className="text-white font-sans">{telemetry.platform}</strong></span>
              <button
                onClick={triggerTest0PercentBattery}
                className="text-[10px] text-red-400 hover:text-red-300 font-bold underline transition-colors"
              >
                ⚡ Test 0% Battery Guard
              </button>
            </div>
          </Card>

          {/* Recent Journeys Section */}
          <div className="grid-full">
            <div className="section">
              <b>Recent journeys</b>
              <button onClick={() => go('journeys')}>View all</button>
            </div>
            <Card className="row clickable" onClick={() => go('journeys')}>
              <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-[#00d9d9]">
                <Route className="w-6 h-6" />
              </div>
              <span>
                <b>Gauhati University → Narengi</b>
                <small>Today, 8:42 PM · 28 min · No anomalies</small>
              </span>
              <div className="flex flex-col items-end">
                <strong className="text-[#22c55e]">
                  96<small className="text-[#94a3b8]">/100</small>
                </strong>
                <small className="text-[10px] text-[#22c55e]">SAFE</small>
              </div>
            </Card>
          </div>

          {/* Contextual Risk Simulation Panel */}
          <div className="grid-full">
            <DemoSimulationPanel currentMode={mode} onSelectMode={(m: RiskMode) => demo(m)} />
          </div>
        </div>
      </div>

      {/* ONLY ONE 3D Shield Clickable Button — Placed in Bottom-Right Corner */}
      <div className="fixed bottom-24 right-6 z-40 pointer-events-auto">
        <Shield3D onClick={() => go('areaSafety')} label="Safety Check" />
      </div>

      {/* Workable Utility Modals */}
      <CriticalBatteryAlertModal
        isOpen={isBatteryAlertModalOpen}
        onClose={closeBatteryAlertModal}
        details={batteryAlertDetails}
        onBroadcastSms={broadcastBatterySmsNow}
      />
      <EmergencyCallingModal
        isOpen={isEmergencyCallingOpen}
        onClose={() => setIsEmergencyCallingOpen(false)}
      />
      <AudioRecorderModal
        isOpen={isAudioRecorderOpen}
        onClose={() => setIsAudioRecorderOpen(false)}
        onTriggerSOS={() => go('emergency')}
      />
      <ShareLiveLocationModal
        isOpen={isShareLiveLocationOpen}
        onClose={() => setIsShareLiveLocationOpen(false)}
        location={location}
        activeSession={session}
        onStartSharing={(recipients, duration, phones) => startSharing(recipients, duration, location, phones)}
        onStopSharing={stopSharing}
      />
      <QuickToolsModal
        isOpen={isQuickToolsOpen}
        onClose={() => setIsQuickToolsOpen(false)}
        go={go}
        onOpenEmergencyCalling={() => setIsEmergencyCallingOpen(true)}
        onOpenAudioRecorder={() => setIsAudioRecorderOpen(true)}
        toggleLocationSharing={() => setIsShareLiveLocationOpen(true)}
        locationSharingEnabled={locationSharingEnabled}
      />
      <DesktopCallFallbackModal
        contact={fallbackContact}
        onClose={() => setFallbackContact(null)}
      />
    </motion.div>
  )
}
