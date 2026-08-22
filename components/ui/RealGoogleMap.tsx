'use client'

import React, { useEffect, useRef, useState } from 'react'
import { importLibrary, setOptions } from '@googlemaps/js-api-loader'
import {
  AlertTriangle,
  Compass,
  KeyRound,
  MapPin,
  Navigation,
  RefreshCw,
  ShieldCheck,
} from 'lucide-react'
import { GeolocationStatus, GPSLocation } from '@/types'

interface RealGoogleMapProps {
  location: GPSLocation | null
  status: GeolocationStatus
  error: string | null
  isTracking: boolean
  danger?: boolean
  height?: string
  className?: string
  onRequestPermission?: () => void
  locationSharingEnabled?: boolean
}

let loaderOptionsSet = false

const SAKHI_MAP_STYLES = [
  { elementType: 'geometry', stylers: [{ color: '#13182e' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#13182e' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#94a3b8' }] },
  {
    featureType: 'administrative.locality',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#cbd5e1' }],
  },
  {
    featureType: 'poi',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#a78bfa' }],
  },
  {
    featureType: 'poi.park',
    elementType: 'geometry',
    stylers: [{ color: '#1a223e' }],
  },
  {
    featureType: 'road',
    elementType: 'geometry',
    stylers: [{ color: '#232b4b' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry',
    stylers: [{ color: '#4338ca' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#e0e7ff' }],
  },
  {
    featureType: 'water',
    elementType: 'geometry',
    stylers: [{ color: '#090e1f' }],
  },
]

export const RealGoogleMap: React.FC<RealGoogleMapProps> = ({
  location,
  status,
  danger = false,
  height = '320px',
  className = '',
  onRequestPermission,
  locationSharingEnabled = true,
  isTracking = false,
}) => {
  const mapRef = useRef<HTMLDivElement>(null)
  const [mapInstance, setMapInstance] = useState<google.maps.Map | null>(null)
  const [markerInstance, setMarkerInstance] = useState<google.maps.Marker | null>(null)
  const [circleInstance, setCircleInstance] = useState<google.maps.Circle | null>(null)
  const [apiLoaded, setApiLoaded] = useState<boolean>(false)
  const [userPanned, setUserPanned] = useState<boolean>(false)

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''

  // Load Google Maps JS API using functional setOptions + importLibrary
  useEffect(() => {
    if (!apiKey) return

    if (!loaderOptionsSet) {
      setOptions({
        key: apiKey,
        v: 'weekly',
      })
      loaderOptionsSet = true
    }

    Promise.all([importLibrary('maps'), importLibrary('marker')])
      .then(() => {
        setApiLoaded(true)
      })
      .catch((err: unknown) => {
        console.error('Failed to load Google Maps API:', err)
      })
  }, [apiKey])

  // Initialize Map instance
  useEffect(() => {
    if (!apiLoaded || !mapRef.current || mapInstance) return

    const initialCenter = location
      ? { lat: location.lat, lng: location.lng }
      : { lat: 12.9716, lng: 77.5946 }

    const map = new google.maps.Map(mapRef.current, {
      center: initialCenter,
      zoom: location ? 17 : 13,
      styles: SAKHI_MAP_STYLES,
      disableDefaultUI: true,
      zoomControl: true,
      gestureHandling: 'greedy',
    })

    // Detect user manual panning
    map.addListener('dragstart', () => setUserPanned(true))

    setMapInstance(map)
  }, [apiLoaded, mapRef, mapInstance, location])

  // Update Marker & Accuracy Circle ONLY when valid location exists
  useEffect(() => {
    if (!mapInstance || !location) return

    const pos = { lat: location.lat, lng: location.lng }

    // Center map if user has not manually panned away
    if (!userPanned) {
      mapInstance.panTo(pos)
      if (mapInstance.getZoom()! < 15) {
        mapInstance.setZoom(17)
      }
    }

    // Update or create Marker
    if (!markerInstance) {
      const marker = new google.maps.Marker({
        position: pos,
        map: mapInstance,
        title: 'Your Live Location',
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 10,
          fillColor: danger ? '#ef4444' : '#6366f1',
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 3,
        },
      })
      setMarkerInstance(marker)
    } else {
      markerInstance.setPosition(pos)
      if (danger) {
        markerInstance.setIcon({
          path: google.maps.SymbolPath.CIRCLE,
          scale: 10,
          fillColor: '#ef4444',
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 3,
        })
      }
    }

    // Update or create Accuracy Circle
    if (location.accuracy) {
      if (!circleInstance) {
        const circle = new google.maps.Circle({
          map: mapInstance,
          center: pos,
          radius: location.accuracy,
          fillColor: danger ? '#ef4444' : '#6366f1',
          fillOpacity: 0.15,
          strokeColor: danger ? '#ef4444' : '#818cf8',
          strokeOpacity: 0.4,
          strokeWeight: 1,
        })
        setCircleInstance(circle)
      } else {
        circleInstance.setCenter(pos)
        circleInstance.setRadius(location.accuracy)
      }
    }
  }, [mapInstance, location, danger, userPanned, markerInstance, circleInstance])

  const handleRecenter = () => {
    if (mapInstance && location) {
      mapInstance.panTo({ lat: location.lat, lng: location.lng })
      mapInstance.setZoom(17)
      setUserPanned(false)
    }
  }

  // Format GPS Status text strictly according to rules
  const getGpsStatusText = () => {
    if (!locationSharingEnabled) return 'GPS: OFF'
    if (status === 'requesting') return 'GPS: CONNECTING...'
    if (status === 'searching') return 'GPS: SEARCHING...'
    if (location !== null && (status === 'tracking' || isTracking)) return 'GPS: LIVE'
    if (status === 'denied') return 'GPS: DENIED'
    if (status === 'unavailable' || status === 'timeout') return 'GPS: UNAVAILABLE'
    return 'GPS: OFF'
  }

  // Handle Privacy OFF state
  if (!locationSharingEnabled) {
    return (
      <div
        className={`map danger-map flex flex-col items-center justify-center p-6 text-center ${className}`}
        style={{ height }}
      >
        <ShieldCheck className="w-12 h-12 text-[#a78bfa] mb-3" />
        <h3 className="text-lg font-bold text-white mb-1">Location Sharing is OFF</h3>
        <p className="text-sm text-[#94a3b8] max-w-md mb-4">
          SAKHI protects your privacy by default. Enable location sharing to view live map tracking during your Safety Journey.
        </p>
        {onRequestPermission && (
          <button className="primary max-w-xs" onClick={onRequestPermission}>
            <MapPin className="w-5 h-5" /> Enable Location Sharing
          </button>
        )}
      </div>
    )
  }

  // Handle Missing API Key State
  if (!apiKey) {
    return (
      <div
        className={`map flex flex-col items-center justify-center p-6 text-center ${className}`}
        style={{ height }}
      >
        <KeyRound className="w-12 h-12 text-[#fbbf24] mb-3" />
        <h3 className="text-lg font-bold text-white mb-1">Google Maps API Key Required</h3>
        <p className="text-sm text-[#94a3b8] max-w-md mb-3">
          To display real Google Maps, add your key to <code className="bg-black/40 px-2 py-1 rounded text-[#a78bfa]">.env.local</code>:
        </p>
        <pre className="bg-[#0f172a] text-[#4ade80] text-xs p-3 rounded-lg border border-white/10 font-mono mb-4 text-left max-w-md overflow-x-auto">
          NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_key_here
        </pre>
        {onRequestPermission && (
          <button className="secondary max-w-xs text-xs" onClick={onRequestPermission}>
            <Compass className="w-4 h-4" /> Start GPS Tracking
          </button>
        )}
      </div>
    )
  }

  // Handle Permission Denied State (Code 1)
  if (status === 'denied') {
    return (
      <div
        className={`map danger-map flex flex-col items-center justify-center p-6 text-center ${className}`}
        style={{ height }}
      >
        <AlertTriangle className="w-12 h-12 text-[#f87171] mb-3" />
        <h3 className="text-lg font-bold text-white mb-1">Location Access Blocked</h3>
        <p className="text-sm text-[#94a3b8] max-w-md mb-4">
          Location permission was denied. Please allow location access in your browser settings (address bar lock icon) to use SAKHI live safety tracking.
        </p>
        {onRequestPermission && (
          <button className="primary max-w-xs" onClick={onRequestPermission}>
            <RefreshCw className="w-5 h-5" /> Grant Location Access
          </button>
        )}
      </div>
    )
  }

  const gpsStatusText = getGpsStatusText()

  return (
    <div className={`map-wrapper relative overflow-hidden rounded-2xl border border-white/10 shadow-2xl ${className}`}>
      <div ref={mapRef} style={{ width: '100%', height }} />

      {/* Floating Status Bar */}
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none">
        <div className="bg-[#0f1529]/90 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/15 text-xs font-bold text-white flex items-center gap-2 shadow-lg pointer-events-auto">
          <span
            className={`w-2.5 h-2.5 rounded-full ${
              location !== null
                ? 'bg-[#4ade80] animate-pulse'
                : status === 'searching' || status === 'requesting'
                ? 'bg-[#fbbf24] animate-ping'
                : 'bg-[#94a3b8]'
            }`}
          />
          {gpsStatusText}
        </div>

        {location ? (
          <button
            onClick={handleRecenter}
            className="bg-[#0f1529]/90 hover:bg-[#1e2746] backdrop-blur-md p-2 rounded-full border border-white/15 text-[#a78bfa] shadow-lg pointer-events-auto transition-transform active:scale-95"
            title="Recenter map on your location"
          >
            <Navigation className="w-5 h-5" />
          </button>
        ) : (
          onRequestPermission && (
            <button
              onClick={onRequestPermission}
              className="bg-[#6366f1] hover:bg-[#4f46e5] text-white text-xs font-bold px-3 py-1.5 rounded-full border border-white/20 shadow-lg pointer-events-auto transition-transform active:scale-95 flex items-center gap-1.5"
            >
              <Compass className="w-3.5 h-3.5" /> {status === 'searching' ? 'Try Again' : 'Start GPS Tracking'}
            </button>
          )
        )}
      </div>

      {/* Non-blocking Searching Banner */}
      {status === 'searching' && !location && (
        <div className="absolute top-16 left-4 right-4 bg-[#fbbf24]/20 border border-[#fbbf24]/40 backdrop-blur-md px-4 py-2.5 rounded-xl text-xs text-[#fbbf24] font-semibold flex items-center justify-between pointer-events-auto shadow-lg">
          <span>Searching for your location... Check device Location Services if taking too long.</span>
          {onRequestPermission && (
            <button onClick={onRequestPermission} className="underline hover:text-white font-bold ml-2">
              Try Again
            </button>
          )}
        </div>
      )}

      {/* Floating Coordinates & Accuracy Badge */}
      {location && (
        <div className="absolute bottom-4 left-4 right-4 bg-[#0f1529]/90 backdrop-blur-md px-3.5 py-2 rounded-xl border border-white/15 text-xs text-[#94a3b8] flex items-center justify-between shadow-lg pointer-events-auto">
          <div className="flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-[#818cf8]" />
            <span className="font-mono text-white">
              {location.lat.toFixed(5)}° N, {location.lng.toFixed(5)}° E
            </span>
          </div>
          <span>±{Math.round(location.accuracy)}m accuracy</span>
        </div>
      )}
    </div>
  )
}
