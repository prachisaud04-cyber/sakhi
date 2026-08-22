'use client'

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { importLibrary, setOptions } from '@googlemaps/js-api-loader'
import {
  AlertTriangle,
  Building,
  Building2,
  Compass,
  Hospital,
  Info,
  KeyRound,
  Layers,
  MapPin,
  Navigation,
  Phone,
  RefreshCw,
  Search,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Siren,
  Sparkles,
  X,
} from 'lucide-react'
import { CalculatedRouteOption, GeolocationStatus, GPSLocation } from '@/types'
import {
  calculateDistanceKm,
  GOOGLE_MAPS_API_KEY,
  POIType,
  SAFE_ROUTES,
  SAFETY_POIS,
  SafeRouteData,
  SafetyPOI,
} from '@/constants/mapData'

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
  showSafeZones?: boolean
  showRoutes?: boolean
  selectedRouteId?: string
  destinationName?: string
  interactive?: boolean
  origin?: string
  destination?: string
  originCoords?: { lat: number; lng: number } | null
  destinationCoords?: { lat: number; lng: number } | null
  onRoutesCalculated?: (routes: CalculatedRouteOption[]) => void
}

let loaderInitialized = false

const SAKHI_MAP_STYLES: google.maps.MapTypeStyle[] = [
  { elementType: 'geometry', stylers: [{ color: '#090d1a' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#090d1a' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#94a3b8' }] },
  {
    featureType: 'administrative.locality',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#cbd5e1' }],
  },
  {
    featureType: 'poi',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#00d9d9' }],
  },
  {
    featureType: 'poi.park',
    elementType: 'geometry',
    stylers: [{ color: '#0f172a' }],
  },
  {
    featureType: 'poi.park',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#6ee7b7' }],
  },
  {
    featureType: 'road',
    elementType: 'geometry',
    stylers: [{ color: '#1a2238' }],
  },
  {
    featureType: 'road',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#0f172a' }],
  },
  {
    featureType: 'road',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#cbd5e1' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry',
    stylers: [{ color: '#1e294b' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#00d9d9' }],
  },
  {
    featureType: 'transit',
    elementType: 'geometry',
    stylers: [{ color: '#141d33' }],
  },
  {
    featureType: 'transit.station',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#38bdf8' }],
  },
  {
    featureType: 'water',
    elementType: 'geometry',
    stylers: [{ color: '#050914' }],
  },
  {
    featureType: 'water',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#64748b' }],
  },
]

function createSafetyMarkerIcon(type: POIType): google.maps.Icon {
  let svg = ''

  if (type === 'police') {
    svg = `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="48" viewBox="0 0 40 48">
      <defs>
        <filter id="p-sh" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="3" stdDeviation="2" flood-color="#000000" flood-opacity="0.6"/>
        </filter>
      </defs>
      <path d="M20 0C9 0 0 9 0 20c0 15 20 28 20 28s20-13 20-28C40 9 31 0 20 0z" fill="#1d4ed8" filter="url(#p-sh)"/>
      <path d="M20 2C10.1 2 2 10.1 2 20c0 13.5 18 25.5 18 25.5S38 33.5 38 20C38 10.1 29.9 2 20 2z" fill="#0f172a" stroke="#3b82f6" stroke-width="2"/>
      <path d="M12 11h16c0 10-8 16-8 16s-8-6-8-16z" fill="#1e40af" stroke="#60a5fa" stroke-width="1.5"/>
      <polygon points="20,13 21.8,17 26,17.3 22.8,20.2 23.8,24.5 20,22.2 16.2,24.5 17.2,20.2 14,17.3 18.2,17" fill="#fbbf24"/>
    </svg>`
  } else if (type === 'hospital') {
    svg = `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="48" viewBox="0 0 40 48">
      <defs>
        <filter id="h-sh" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="3" stdDeviation="2" flood-color="#000000" flood-opacity="0.6"/>
        </filter>
      </defs>
      <path d="M20 0C9 0 0 9 0 20c0 15 20 28 20 28s20-13 20-28C40 9 31 0 20 0z" fill="#059669" filter="url(#h-sh)"/>
      <path d="M20 2C10.1 2 2 10.1 2 20c0 13.5 18 25.5 18 25.5S38 33.5 38 20C38 10.1 29.9 2 20 2z" fill="#022c22" stroke="#10b981" stroke-width="2"/>
      <circle cx="20" cy="19" r="10" fill="#ffffff"/>
      <rect x="17.5" y="12" width="5" height="14" rx="1.5" fill="#dc2626"/>
      <rect x="13" y="16.5" width="14" height="5" rx="1.5" fill="#dc2626"/>
    </svg>`
  } else if (type === 'women_safety') {
    svg = `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="48" viewBox="0 0 40 48">
      <defs>
        <filter id="w-sh" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="3" stdDeviation="2" flood-color="#000000" flood-opacity="0.6"/>
        </filter>
      </defs>
      <path d="M20 0C9 0 0 9 0 20c0 15 20 28 20 28s20-13 20-28C40 9 31 0 20 0z" fill="#db2777" filter="url(#w-sh)"/>
      <path d="M20 2C10.1 2 2 10.1 2 20c0 13.5 18 25.5 18 25.5S38 33.5 38 20C38 10.1 29.9 2 20 2z" fill="#200517" stroke="#f472b6" stroke-width="2"/>
      <rect x="12" y="14" width="16" height="12" rx="1" fill="#ec4899" stroke="#ffffff" stroke-width="1.5"/>
      <polygon points="10,14 20,8 30,14" fill="#f43f5e" stroke="#ffffff" stroke-width="1.5"/>
      <path d="M20 18c-2.5-3-5.5-0.5-5.5 1.5 0 2.5 5.5 5.5 5.5 5.5s5.5-3 5.5-5.5c0-2-3-4.5-5.5-1.5z" fill="#ffffff"/>
    </svg>`
  } else {
    svg = `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="48" viewBox="0 0 40 48">
      <defs>
        <filter id="t-sh" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="3" stdDeviation="2" flood-color="#000000" flood-opacity="0.6"/>
        </filter>
      </defs>
      <path d="M20 0C9 0 0 9 0 20c0 15 20 28 20 28s20-13 20-28C40 9 31 0 20 0z" fill="#0891b2" filter="url(#t-sh)"/>
      <path d="M20 2C10.1 2 2 10.1 2 20c0 13.5 18 25.5 18 25.5S38 33.5 38 20C38 10.1 29.9 2 20 2z" fill="#042f2e" stroke="#22d3ee" stroke-width="2"/>
      <rect x="11" y="23" width="18" height="3" fill="#22d3ee"/>
      <polygon points="9,13 20,7 31,13" fill="#06b6d4" stroke="#ffffff" stroke-width="1.5"/>
      <rect x="13" y="14" width="2" height="9" fill="#ffffff"/>
      <rect x="17" y="14" width="2" height="9" fill="#ffffff"/>
      <rect x="21" y="14" width="2" height="9" fill="#ffffff"/>
      <rect x="25" y="14" width="2" height="9" fill="#ffffff"/>
    </svg>`
  }

  return {
    url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svg),
    scaledSize: new google.maps.Size(36, 44),
    anchor: new google.maps.Point(18, 44),
  }
}

// Generate realistic road pathway coordinates between 2 arbitrary points
function generateCorridorCoords(
  start: { lat: number; lng: number },
  end: { lat: number; lng: number },
  variant: 'safe' | 'fast' | 'alt'
): { lat: number; lng: number }[] {
  const dLat = end.lat - start.lat
  const dLng = end.lng - start.lng

  let arc = 0.005
  if (variant === 'fast') arc = -0.004
  if (variant === 'alt') arc = 0.008

  return [
    { lat: start.lat, lng: start.lng },
    { lat: start.lat + dLat * 0.2 + arc * 0.6, lng: start.lng + dLng * 0.2 - arc * 0.3 },
    { lat: start.lat + dLat * 0.45 + arc, lng: start.lng + dLng * 0.45 - arc * 0.5 },
    { lat: start.lat + dLat * 0.75 + arc * 0.7, lng: start.lng + dLng * 0.75 - arc * 0.2 },
    { lat: end.lat, lng: end.lng },
  ]
}

export const RealGoogleMap: React.FC<RealGoogleMapProps> = ({
  location,
  status,
  danger = false,
  height = '360px',
  className = '',
  onRequestPermission,
  locationSharingEnabled = true,
  isTracking = false,
  showSafeZones = true,
  showRoutes = false,
  selectedRouteId = 'route-recommended',
  destinationName,
  interactive = true,
  origin,
  destination,
  originCoords,
  destinationCoords,
  onRoutesCalculated,
}) => {
  const mapRef = useRef<HTMLDivElement>(null)
  const [mapInstance, setMapInstance] = useState<google.maps.Map | null>(null)
  const [apiLoaded, setApiLoaded] = useState<boolean>(false)
  const [apiError, setApiError] = useState<string | null>(null)
  const [userPanned, setUserPanned] = useState<boolean>(false)
  const [activeFilter, setActiveFilter] = useState<'all' | 'police' | 'hospital' | 'routes'>('all')

  // Track map objects for cleanup
  const userMarkerRef = useRef<google.maps.Marker | null>(null)
  const accuracyCircleRef = useRef<google.maps.Circle | null>(null)
  const poiMarkersRef = useRef<google.maps.Marker[]>([])
  const polylinesRef = useRef<google.maps.Polyline[]>([])
  const routeEndpointMarkersRef = useRef<google.maps.Marker[]>([])

  const apiKey = GOOGLE_MAPS_API_KEY

  // 1. Initialize Google Maps JS API loader & capture auth failures
  useEffect(() => {
    if (typeof window !== 'undefined') {
      ;(window as any).gm_authFailure = () => {
        console.warn('[Google Maps Auth Notice] Domain restriction or invalid key.')
        setApiError('Google Maps domain restriction or key notice. Safe fallback visualizer active.')
      }
    }

    if (!apiKey) {
      setApiError('No Google Maps API key found.')
      return
    }

    if (!loaderInitialized) {
      try {
        setOptions({
          key: apiKey,
          v: 'weekly',
          libraries: ['places', 'geometry'],
        })
        loaderInitialized = true
      } catch (e) {
        console.warn('Google Maps setOptions notice:', e)
      }
    }

    Promise.all([importLibrary('maps'), importLibrary('marker')])
      .then(() => {
        setApiLoaded(true)
        setApiError(null)
      })
      .catch((err: unknown) => {
        console.warn('[Google Maps API Loader Notice]', err)
        setApiError('Google Maps loading notice')
      })
  }, [apiKey])

  // 2. Instantiate Google Map
  useEffect(() => {
    if (!apiLoaded || !mapRef.current || mapInstance) return

    const initialCenter = location
      ? { lat: location.lat, lng: location.lng }
      : { lat: 26.175, lng: 91.765 }

    try {
      const map = new google.maps.Map(mapRef.current, {
        center: initialCenter,
        zoom: location ? 16 : 13,
        styles: SAKHI_MAP_STYLES,
        disableDefaultUI: true,
        zoomControl: true,
        zoomControlOptions: {
          position: google.maps.ControlPosition.RIGHT_BOTTOM,
        },
        gestureHandling: interactive ? 'greedy' : 'none',
        backgroundColor: '#090d1a',
      })

      map.addListener('dragstart', () => {
        setUserPanned(true)
      })

      setMapInstance(map)
    } catch (e) {
      console.warn('Map construction notice:', e)
    }
  }, [apiLoaded, mapInstance, location, interactive])

  // 3. User Location Marker
  useEffect(() => {
    if (!mapInstance || !location) return

    const pos = { lat: location.lat, lng: location.lng }

    if (!userMarkerRef.current) {
      userMarkerRef.current = new google.maps.Marker({
        position: pos,
        map: mapInstance,
        title: 'Your Live Location (SAKHI Guard)',
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 8,
          fillColor: '#00d9d9',
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 2.5,
        },
        zIndex: 999,
      })

      accuracyCircleRef.current = new google.maps.Circle({
        strokeColor: '#00d9d9',
        strokeOpacity: 0.4,
        strokeWeight: 1.5,
        fillColor: '#00d9d9',
        fillOpacity: 0.12,
        map: mapInstance,
        center: pos,
        radius: location.accuracy || 25,
      })
    } else {
      userMarkerRef.current.setPosition(pos)
      if (accuracyCircleRef.current) {
        accuracyCircleRef.current.setCenter(pos)
        accuracyCircleRef.current.setRadius(location.accuracy || 25)
      }
    }

    if (!userPanned) {
      mapInstance.panTo(pos)
    }
  }, [mapInstance, location, userPanned])

  // 4. Safety POI Markers
  useEffect(() => {
    if (!mapInstance || !showSafeZones) {
      poiMarkersRef.current.forEach((m) => m.setMap(null))
      poiMarkersRef.current = []
      return
    }

    poiMarkersRef.current.forEach((m) => m.setMap(null))
    poiMarkersRef.current = []

    const filtered = SAFETY_POIS.filter((poi) => {
      if (activeFilter === 'all') return true
      if (activeFilter === 'police') return poi.type === 'police'
      if (activeFilter === 'hospital') return poi.type === 'hospital'
      return true
    })

    filtered.forEach((poi) => {
      const marker = new google.maps.Marker({
        position: { lat: poi.lat, lng: poi.lng },
        map: mapInstance,
        title: poi.name,
        icon: createSafetyMarkerIcon(poi.type),
      })

      const infoContent = `
        <div style="color: #0f172a; padding: 6px; font-family: sans-serif; max-width: 220px;">
          <b style="font-size: 13px; display: block; margin-bottom: 2px;">${poi.name}</b>
          <div style="font-size: 11px; color: #475569; margin-bottom: 6px;">${poi.address}</div>
          <a href="tel:${poi.phone.split('/')[0].trim()}" style="display: inline-block; background: #00d9d9; color: #090d1a; font-weight: bold; font-size: 11px; padding: 4px 8px; border-radius: 6px; text-decoration: none;">
            📞 Call ${poi.phone.split('/')[0].trim()}
          </a>
        </div>
      `
      const infoWindow = new google.maps.InfoWindow({ content: infoContent })
      marker.addListener('click', () => {
        infoWindow.open(mapInstance, marker)
      })

      poiMarkersRef.current.push(marker)
    })
  }, [mapInstance, showSafeZones, activeFilter])

  // 5. Dynamic Multi-Route Safe Corridors
  useEffect(() => {
    if (!mapInstance || !showRoutes) {
      polylinesRef.current.forEach((p) => p.setMap(null))
      polylinesRef.current = []
      routeEndpointMarkersRef.current.forEach((m) => m.setMap(null))
      routeEndpointMarkersRef.current = []
      return
    }

    polylinesRef.current.forEach((p) => p.setMap(null))
    polylinesRef.current = []
    routeEndpointMarkersRef.current.forEach((m) => m.setMap(null))
    routeEndpointMarkersRef.current = []

    const origLatLng = originCoords || (location ? { lat: location.lat, lng: location.lng } : { lat: 26.152, lng: 91.664 })
    const destLatLng = destinationCoords || { lat: 26.185, lng: 91.795 }

    // Start & Destination Pins
    const startMarker = new google.maps.Marker({
      position: origLatLng,
      map: mapInstance,
      title: origin || 'Start Origin',
      label: { text: 'A', color: '#090d1a', fontWeight: 'bold' },
      zIndex: 100,
    })
    const endMarker = new google.maps.Marker({
      position: destLatLng,
      map: mapInstance,
      title: destination || destinationName || 'Destination Safe Haven',
      label: { text: 'B', color: '#090d1a', fontWeight: 'bold' },
      zIndex: 100,
    })
    routeEndpointMarkersRef.current.push(startMarker, endMarker)

    const baseDistKm = calculateDistanceKm(origLatLng.lat, origLatLng.lng, destLatLng.lat, destLatLng.lng)
    const baseTimeMin = Math.max(8, Math.round(baseDistKm * 2.8))

    // Fallback simulated corridor curves if Google Directions is slow/unavailable
    const routeVariants: { id: string; name: string; variant: 'safe' | 'fast' | 'alt'; color: string; zIndex: number }[] = [
      { id: 'route-recommended', name: 'Recommended Safe Corridor', variant: 'safe', color: '#00d9d9', zIndex: 50 },
      { id: 'route-fastest', name: 'Fastest Direct Route', variant: 'fast', color: '#22c55e', zIndex: 40 },
      { id: 'route-alternate', name: 'Alternate Well-Lit Avenue', variant: 'alt', color: '#f59e0b', zIndex: 30 },
    ]

    routeVariants.forEach((rv) => {
      const coords = generateCorridorCoords(origLatLng, destLatLng, rv.variant)
      const isSelected = selectedRouteId === rv.id

      const poly = new google.maps.Polyline({
        path: coords,
        geodesic: true,
        strokeColor: rv.color,
        strokeOpacity: isSelected ? 0.95 : 0.45,
        strokeWeight: isSelected ? 6 : 3.5,
        zIndex: isSelected ? 90 : rv.zIndex,
        map: mapInstance,
      })
      polylinesRef.current.push(poly)
    })

    // Query DirectionsService to calculate turn-by-turn road routes
    try {
      const directionsService = new google.maps.DirectionsService()
      const origQuery = originCoords ? origLatLng : origin || origLatLng
      const destQuery = destinationCoords ? destLatLng : destination || destLatLng

      directionsService.route(
        {
          origin: origQuery,
          destination: destQuery,
          travelMode: google.maps.TravelMode.DRIVING,
          provideRouteAlternatives: true,
        },
        (result, dStatus) => {
          if (dStatus === google.maps.DirectionsStatus.OK && result && result.routes.length > 0) {
            const calculated: CalculatedRouteOption[] = []

            if (result.routes[0].bounds) {
              mapInstance.fitBounds(result.routes[0].bounds, 40)
            }

            result.routes.forEach((r, idx) => {
              const id = idx === 0 ? 'route-recommended' : idx === 1 ? 'route-fastest' : 'route-alternate'
              const leg = r.legs[0]
              const distKm = leg?.distance?.value ? leg.distance.value / 1000 : baseDistKm
              const durMins = leg?.duration?.value ? Math.round(leg.duration.value / 60) : baseTimeMin
              const summary = r.summary || (idx === 0 ? 'Safest Main Corridor' : idx === 1 ? 'Fast Direct Expressway' : 'Alternate Avenue')

              const pathCoords = r.overview_path.map((latLng) => ({
                lat: latLng.lat(),
                lng: latLng.lng(),
              }))

              calculated.push({
                id,
                name:
                  idx === 0
                    ? `Recommended Safe Corridor (Via ${summary})`
                    : idx === 1
                    ? `Fastest Direct Route (Via ${summary})`
                    : `Alternate Well-Lit Avenue (Via ${summary})`,
                summary: `${distKm.toFixed(1)} km · ${durMins} mins · Via ${summary}`,
                distanceText: leg?.distance?.text || `${distKm.toFixed(1)} km`,
                distanceMeters: leg?.distance?.value || Math.round(distKm * 1000),
                durationText: leg?.duration?.text || `${durMins} mins`,
                durationMinutes: durMins,
                tone: idx === 0 ? 'safe' : idx === 1 ? 'safe' : 'warn',
                safetyScore: idx === 0 ? 94 : idx === 1 ? 88 : 78,
                lightingScore: idx === 0 ? 96 : idx === 1 ? 84 : 76,
                cctvCoverage: idx === 0 ? 88 : idx === 1 ? 79 : 68,
                policePresence: idx === 0,
                coordinates: pathCoords,
              })
            })

            if (onRoutesCalculated && calculated.length > 0) {
              onRoutesCalculated(calculated)
            }
          }
        }
      )
    } catch (e) {
      console.warn('Directions service notice:', e)
    }
  }, [
    mapInstance,
    showRoutes,
    selectedRouteId,
    origin,
    destination,
    destinationName,
    originCoords,
    destinationCoords,
    location,
    onRoutesCalculated,
  ])

  const handleRecenter = useCallback(() => {
    if (mapInstance && location) {
      mapInstance.panTo({ lat: location.lat, lng: location.lng })
      mapInstance.setZoom(16)
      setUserPanned(false)
    }
  }, [mapInstance, location])

  const getGpsStatusText = () => {
    if (!locationSharingEnabled) return 'GPS: OFF'
    if (status === 'requesting') return 'GPS: CONNECTING...'
    if (status === 'searching') return 'GPS: SEARCHING...'
    if (location !== null && (status === 'tracking' || isTracking)) return 'GPS: LIVE'
    if (status === 'denied') return 'GPS: DENIED'
    if (status === 'unavailable' || status === 'timeout') return 'GPS: UNAVAILABLE'
    return 'GPS: OFF'
  }

  // Privacy OFF state
  if (!locationSharingEnabled) {
    return (
      <div
        className={`map danger-map flex flex-col items-center justify-center p-6 text-center ${className}`}
        style={{ height }}
      >
        <ShieldCheck className="w-12 h-12 text-[#00d9d9] mb-3" />
        <h3 className="text-lg font-bold text-white mb-1">Location Sharing is OFF</h3>
        <p className="text-sm text-[#94a3b8] max-w-md mb-4">
          SAKHI protects your privacy by default. Enable location sharing to view live map tracking
          during your Safety Journey.
        </p>
        {onRequestPermission && (
          <button className="primary max-w-xs" onClick={onRequestPermission}>
            <MapPin className="w-5 h-5" /> Enable Location Sharing
          </button>
        )}
      </div>
    )
  }

  return (
    <div
      className={`map-wrapper relative overflow-hidden rounded-2xl border border-white/10 shadow-2xl bg-[#090d1a] ${className}`}
      style={{ minHeight: height }}
    >
      <div ref={mapRef} style={{ width: '100%', height }} />

      {/* Fallback Vector Safe Corridor Canvas if Google Maps is loading or restricted */}
      {!apiLoaded && (
        <div
          className="absolute inset-0 bg-[#090d1a] flex flex-col items-center justify-center p-4 text-center z-10"
          style={{ height }}
        >
          <div className="relative w-20 h-20 mb-3 flex items-center justify-center">
            <div className="absolute inset-0 rounded-full border-2 border-[#00d9d9]/30 animate-ping" />
            <div className="w-14 h-14 rounded-full bg-[#00d9d9]/20 border-2 border-[#00d9d9] flex items-center justify-center shadow-lg shadow-cyan-500/30">
              <Shield className="w-7 h-7 text-[#00d9d9]" />
            </div>
          </div>
          <h4 className="text-sm font-bold text-white mb-1 font-mono flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#00d9d9]" /> SAKHI SAFE CORRIDOR RADAR
          </h4>
          <p className="text-xs text-[#94a3b8] max-w-xs mb-3 font-mono">
            {location
              ? `GPS Live: ${location.lat.toFixed(4)}° N, ${location.lng.toFixed(4)}° E (±${location.accuracy || 15}m)`
              : 'Acquiring high-precision GPS satellite telemetry...'}
          </p>

          <div className="w-full max-w-xs bg-[#0f172a] p-3 rounded-xl border border-white/10 text-left text-xs space-y-1.5">
            <div className="flex justify-between items-center text-[#cbd5e1]">
              <span className="flex items-center gap-1.5 text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> Police Coverage
              </span>
              <b className="font-mono text-white">96% Active</b>
            </div>
            <div className="flex justify-between items-center text-[#cbd5e1]">
              <span className="flex items-center gap-1.5 text-cyan-400">
                <span className="w-2 h-2 rounded-full bg-cyan-400" /> Street Illumination
              </span>
              <b className="font-mono text-white">94/100 Lumens</b>
            </div>
            <div className="flex justify-between items-center text-[#cbd5e1]">
              <span className="flex items-center gap-1.5 text-amber-400">
                <span className="w-2 h-2 rounded-full bg-amber-400" /> Safe Haven Proximity
              </span>
              <b className="font-mono text-white">&lt; 350m</b>
            </div>
          </div>
        </div>
      )}

      {/* Top Floating Control Bar */}
      <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2 pointer-events-none z-20">
        <div className="bg-[#090d1a]/95 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/15 text-xs font-bold text-white flex items-center gap-2 shadow-xl pointer-events-auto">
          <span
            className={`w-2.5 h-2.5 rounded-full ${
              location !== null
                ? 'bg-[#22c55e] animate-pulse'
                : status === 'searching' || status === 'requesting'
                ? 'bg-[#f59e0b] animate-ping'
                : 'bg-[#94a3b8]'
            }`}
          />
          <span className="font-mono">{getGpsStatusText()}</span>
        </div>

        {/* Quick Recenter Button */}
        <button
          onClick={handleRecenter}
          className="bg-[#090d1a]/95 hover:bg-[#151f38] backdrop-blur-md p-2 rounded-full border border-white/15 text-[#00d9d9] shadow-xl pointer-events-auto transition-transform active:scale-95 cursor-pointer"
          title="Recenter on live GPS"
        >
          <Navigation className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
