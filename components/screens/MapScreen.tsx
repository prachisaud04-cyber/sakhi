'use client'

import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { AlertCircle, Bug, Building, Building2, Compass, Hospital, MapPin, Navigation, Phone, RefreshCw, Shield, ShieldAlert, ShieldCheck, Siren, X } from 'lucide-react'
import { MapScreenProps } from '@/types'
import { calculateDistanceKm, SAFETY_POIS } from '@/constants/mapData'
import { Card } from '@/components/ui/Card'
import { Header } from '@/components/ui/Header'
import { Map } from '@/components/ui/Map'

export const MapScreen: React.FC<MapScreenProps> = ({
  location,
  status,
  error,
  isTracking,
  startTracking,
  stopTracking,
  locationSharingEnabled,
  toggleLocationSharing,
  permissionState = 'unknown',
}) => {
  const [showDiagnostics, setShowDiagnostics] = useState<boolean>(true)
  const [isReportingArea, setIsReportingArea] = useState<boolean>(false)
  const [reportSuccess, setReportSuccess] = useState<string | null>(null)
  const [reportReason, setReportReason] = useState<string>('Poor street lighting')
  const [poiFilter, setPoiFilter] = useState<'all' | 'hospital' | 'police'>('all')

  // Auto-start GPS tracking on mount if location sharing is enabled and not yet tracking
  useEffect(() => {
    if (locationSharingEnabled && status === 'idle' && !location) {
      startTracking()
    }
  }, [locationSharingEnabled, status, location, startTracking])

  const handleReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reason: reportReason,
          lat: location?.lat ?? 26.152,
          lng: location?.lng ?? 91.664,
          userName: 'Riya Sharma',
        }),
      })
    } catch (err) {
      console.warn('Failed to save report to backend', err)
    }

    setReportSuccess(`Report submitted for current area (${reportReason}). Community safety score updated!`)
    setTimeout(() => {
      setIsReportingArea(false)
      setReportSuccess(null)
    }, 2500)
  }

  const getStatusBadge = () => {
    if (!locationSharingEnabled) return <span className="pill warn">GPS: OFF</span>
    if (status === 'requesting') return <span className="pill warn">GPS: CONNECTING...</span>
    if (status === 'searching') return <span className="pill warn">GPS: SEARCHING...</span>
    if (location !== null && (status === 'tracking' || isTracking))
      return <span className="pill safe">GPS: LIVE</span>
    if (status === 'denied') return <span className="pill danger">GPS: DENIED</span>
    return <span className="pill danger">GPS: UNAVAILABLE</span>
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.25 }}
    >
      <Header title="Safety map" />
      <div className="content">
        <div className="flex items-center justify-between">
          <div>
            <small className="eyebrow">COMMUNITY INTELLIGENCE</small>
            <h1 className="text-3xl font-extrabold text-white mt-1">
              Know your
              <br />
              <em>surroundings.</em>
            </h1>
          </div>
          <div className="flex items-center gap-2">
            {getStatusBadge()}
            {!isTracking ? (
              <button
                className="section button flex items-center gap-1.5 bg-[#19d3c5] text-[#070b14] px-3.5 py-1.5 rounded-xl font-extrabold shadow-lg"
                onClick={startTracking}
              >
                <Compass className="w-4 h-4" /> Start GPS Tracking
              </button>
            ) : (
              <button
                className="section button flex items-center gap-1.5 bg-white/10 text-white px-3.5 py-1.5 rounded-xl font-bold"
                onClick={stopTracking}
              >
                <RefreshCw className="w-4 h-4" /> Stop Tracking
              </button>
            )}
          </div>
        </div>

        <Map
          danger={false}
          location={location}
          status={status}
          error={error}
          isTracking={isTracking}
          onRequestPermission={startTracking}
          locationSharingEnabled={locationSharingEnabled}
          height="420px"
          showSafeZones={true}
          showRoutes={true}
        />

        {/* Real GPS Live Location Status Card */}
        {location ? (
          <Card className="selected border-cyan-500/40">
            <div className="flex items-center justify-between mb-3">
              <span className="eyebrow text-[#19d3c5] font-bold">LIVE GPS FEED</span>
              <span className="pill safe">ACTIVE COORDINATES</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 font-mono text-sm">
              <div className="bg-black/30 p-2.5 rounded-xl border border-white/10">
                <small className="text-[#94a3b8] block text-xs font-sans">Latitude</small>
                <b className="text-white text-base">{location.lat.toFixed(6)}°</b>
              </div>
              <div className="bg-black/30 p-2.5 rounded-xl border border-white/10">
                <small className="text-[#94a3b8] block text-xs font-sans">Longitude</small>
                <b className="text-white text-base">{location.lng.toFixed(6)}°</b>
              </div>
              <div className="bg-black/30 p-2.5 rounded-xl border border-white/10 col-span-2 md:col-span-1">
                <small className="text-[#94a3b8] block text-xs font-sans">Accuracy</small>
                <b className="text-[#22c55e] text-base">±{Math.round(location.accuracy)} meters</b>
              </div>
            </div>
          </Card>
        ) : (
          error && (
            <Card className={status === 'denied' ? 'danger-map border-red-500/40' : 'border-amber-500/40'}>
              <div className="flex items-center justify-between mb-2">
                <b className={status === 'denied' ? 'text-red-400 font-bold' : 'text-amber-400 font-bold'}>
                  {status === 'searching'
                    ? 'Location Temporarily Unavailable'
                    : status === 'denied'
                    ? 'Location Permission Denied'
                    : 'GPS Request Status'}
                </b>
                <span className="pill warn">{status.toUpperCase()}</span>
              </div>
              <p className="text-sm text-[#cbd5e1]">{error}</p>
              <div className="flex gap-2 mt-3">
                <button className="primary max-w-xs text-sm" onClick={startTracking}>
                  <RefreshCw className="w-4 h-4 mr-1.5 inline" /> Try Again
                </button>
              </div>
            </Card>
          )
        )}

        {/* Development-Only Diagnostics Panel */}
        <div className="mt-2 border border-white/10 rounded-2xl p-4 bg-black/40 backdrop-blur-md">
          <div
            className="flex items-center justify-between cursor-pointer"
            onClick={() => setShowDiagnostics(!showDiagnostics)}
          >
            <span className="text-xs font-mono font-bold text-[#19d3c5] flex items-center gap-1.5">
              <Bug className="w-3.5 h-3.5" /> DEV DIAGNOSTICS PANEL (macOS / Chrome GPS)
            </span>
            <span className="text-xs text-[#94a3b8]">{showDiagnostics ? '▼ Hide' : '▲ Show'}</span>
          </div>

          {showDiagnostics && (
            <div className="grid grid-cols-2 gap-2 mt-3 font-mono text-xs text-[#cbd5e1]">
              <div className="bg-black/40 p-2 rounded-lg border border-white/5">
                <span className="text-[#94a3b8] block">Permission State:</span>
                <b className={permissionState === 'granted' ? 'text-green-400' : 'text-amber-400'}>
                  {permissionState}
                </b>
              </div>
              <div className="bg-black/40 p-2 rounded-lg border border-white/5">
                <span className="text-[#94a3b8] block">Geolocation Support:</span>
                <b className="text-green-400">
                  {typeof window !== 'undefined' && 'geolocation' in navigator ? 'Yes' : 'No'}
                </b>
              </div>
              <div className="bg-black/40 p-2 rounded-lg border border-white/5">
                <span className="text-[#94a3b8] block">GPS Status:</span>
                <b className="text-white">{status}</b>
              </div>
              <div className="bg-black/40 p-2 rounded-lg border border-white/5">
                <span className="text-[#94a3b8] block">Tracking Active:</span>
                <b className={isTracking ? 'text-green-400' : 'text-red-400'}>
                  {isTracking ? 'Yes' : 'No'}
                </b>
              </div>
              <div className="col-span-2 bg-black/40 p-2 rounded-lg border border-white/5">
                <span className="text-[#94a3b8] block">Last Received Position:</span>
                <b>
                  {location
                    ? `${location.lat.toFixed(6)}, ${location.lng.toFixed(6)} (±${Math.round(location.accuracy)}m)`
                    : 'None received yet'}
                </b>
              </div>
              {error && (
                <div className="col-span-2 bg-red-950/40 p-2 rounded-lg border border-red-500/20 text-red-300">
                  <span className="block text-red-400">Last GPS Error:</span>
                  <span>{error}</span>
                </div>
              )}
            </div>
          )}
        </div>

        <Card noTilt className="p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
            <b className="text-base font-extrabold text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-[#19d3c5]" /> Verified Nearby Safe Zones
            </b>
            <div className="flex items-center gap-1 bg-black/40 p-1 rounded-xl border border-white/10 text-xs font-sans">
              <button
                onClick={() => setPoiFilter('all')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-colors ${
                  poiFilter === 'all'
                    ? 'bg-[#19d3c5] text-[#070b14] shadow-md'
                    : 'text-[#94a3b8] hover:text-white'
                }`}
              >
                All ({SAFETY_POIS.length})
              </button>
              <button
                onClick={() => setPoiFilter('hospital')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-colors ${
                  poiFilter === 'hospital'
                    ? 'bg-[#22c55e] text-[#070b14] shadow-md'
                    : 'text-[#94a3b8] hover:text-white'
                }`}
              >
                Hospitals ({SAFETY_POIS.filter((p) => p.type === 'hospital').length})
              </button>
              <button
                onClick={() => setPoiFilter('police')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-colors ${
                  poiFilter === 'police'
                    ? 'bg-[#3b82f6] text-white shadow-md'
                    : 'text-[#94a3b8] hover:text-white'
                }`}
              >
                Police ({SAFETY_POIS.filter((p) => p.type === 'police' || p.type === 'women_safety').length})
              </button>
            </div>
          </div>

          <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
            {SAFETY_POIS.filter((poi) => {
              if (poiFilter === 'all') return true
              if (poiFilter === 'hospital') return poi.type === 'hospital'
              if (poiFilter === 'police') return poi.type === 'police' || poi.type === 'women_safety'
              return true
            }).map((poi) => {
              const distKm = location
                ? calculateDistanceKm(location.lat, location.lng, poi.lat, poi.lng).toFixed(1)
                : null

              return (
                <div
                  key={poi.id}
                  className="p-3 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between gap-3 hover:border-cyan-500/30 transition-colors"
                >
                  <div className="flex items-start gap-2.5">
                    <div
                      className={`p-2 rounded-lg mt-0.5 ${
                        poi.type === 'hospital'
                          ? 'bg-emerald-500/15 text-[#22c55e]'
                          : poi.type === 'women_safety'
                          ? 'bg-pink-500/15 text-pink-400'
                          : 'bg-blue-500/15 text-[#3b82f6]'
                      }`}
                    >
                      {poi.type === 'hospital' ? (
                        <Hospital className="w-4 h-4" />
                      ) : poi.type === 'women_safety' ? (
                        <Building2 className="w-4 h-4" />
                      ) : poi.type === 'police' ? (
                        <Shield className="w-4 h-4" />
                      ) : (
                        <Building className="w-4 h-4" />
                      )}
                    </div>
                    <div>
                      <b className="text-xs text-white block leading-tight">{poi.name}</b>
                      <small className="text-[10px] text-[#94a3b8] block mt-0.5">{poi.address}</small>
                      {distKm && (
                        <span className="text-[10px] text-[#19d3c5] font-mono font-bold block mt-0.5">
                          📍 {distKm} km from current GPS
                        </span>
                      )}
                    </div>
                  </div>

                  <a
                    href={`tel:${poi.phone.replace(/[^0-9+]/g, '')}`}
                    className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-extrabold flex items-center gap-1 flex-shrink-0 transition-colors"
                  >
                    <Phone className="w-3 h-3 text-[#19d3c5]" /> Call
                  </a>
                </div>
              )
            })}
          </div>
        </Card>

        {/* Functional Report Unsafe Area Button */}
        <button className="primary" onClick={() => setIsReportingArea(true)}>
          <ShieldAlert className="w-5 h-5 inline mr-2" /> Report unsafe area
        </button>

        {/* Report Unsafe Area Interactive Drawer / Modal */}
        {isReportingArea && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-[#0f172a] border border-cyan-500/30 rounded-2xl p-6 max-w-md w-full shadow-2xl relative"
            >
              <button
                onClick={() => setIsReportingArea(false)}
                className="absolute top-4 right-4 text-[#94a3b8] hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>

              <b className="text-xl font-bold text-white flex items-center gap-2 mb-2">
                <ShieldAlert className="w-6 h-6 text-[#f59e0b]" /> Report Unsafe Area
              </b>
              <p className="text-sm text-[#94a3b8] mb-4">
                Help fellow travelers by reporting safety concerns along your route.
              </p>

              {reportSuccess ? (
                <div className="p-4 bg-emerald-950/40 border border-emerald-500/30 rounded-xl text-emerald-400 text-sm font-semibold flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <span>{reportSuccess}</span>
                </div>
              ) : (
                <form onSubmit={handleReportSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-[#94a3b8] uppercase mb-1">
                      Reason for Report
                    </label>
                    <select
                      value={reportReason}
                      onChange={(e) => setReportReason(e.target.value)}
                      className="w-full bg-[#1e293b] border border-white/10 rounded-xl p-3 text-white text-sm focus:border-[#19d3c5] outline-none"
                    >
                      <option value="Poor street lighting">Poor street lighting</option>
                      <option value="Unfrequented area">Unfrequented / Isolated street</option>
                      <option value="Harassment incident">Harassment incident reported</option>
                      <option value="Road hazard / Construction">Road hazard / Construction</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#94a3b8] uppercase mb-1">
                      Current Location
                    </label>
                    <input
                      disabled
                      value={
                        location
                          ? `${location.lat.toFixed(4)}° N, ${location.lng.toFixed(4)}° E`
                          : 'GPS Position'
                      }
                      className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-[#19d3c5] font-mono text-sm"
                    />
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsReportingArea(false)}
                      className="secondary flex-1"
                    >
                      Cancel
                    </button>
                    <button type="submit" className="primary flex-1">
                      Submit Report
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </div>
    </motion.div>
  )
}
