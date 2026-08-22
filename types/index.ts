import React from 'react'

export type Screen =
  | 'home'
  | 'start'
  | 'routes'
  | 'live'
  | 'check'
  | 'emergency'
  | 'contact'
  | 'map'
  | 'journeys'
  | 'analytics'
  | 'areaSafety'
  | 'profile'
  | 'privacy'

export type RiskMode = 'normal' | 'suspicious' | 'critical'

export type Tone = 'safe' | 'warn' | 'danger'

export interface GPSLocation {
  lat: number
  lng: number
  accuracy: number
  heading?: number | null
  speed?: number | null
  timestamp: number
}

export type GeolocationStatus =
  | 'idle'
  | 'prompt'
  | 'requesting'
  | 'searching'
  | 'tracking'
  | 'denied'
  | 'unavailable'
  | 'timeout'

export interface CardProps {
  children: React.ReactNode
  className?: string
  onClick?: () => void
  noTilt?: boolean
}

export interface PillProps {
  children: React.ReactNode
  tone?: Tone
}

export interface RingProps {
  score: number
  tone?: Tone
}

export interface HeaderProps {
  title?: string
  back?: () => void
}

export interface CalculatedRouteOption {
  id: string
  name: string
  summary: string
  distanceText: string
  distanceMeters: number
  durationText: string
  durationMinutes: number
  tone: 'safe' | 'warn' | 'danger'
  safetyScore: number
  lightingScore: number
  cctvCoverage: number
  policePresence: boolean
  coordinates: { lat: number; lng: number }[]
}

export interface MapProps {
  danger?: boolean
  location?: GPSLocation | null
  status?: GeolocationStatus
  error?: string | null
  isTracking?: boolean
  onRequestPermission?: () => void
  locationSharingEnabled?: boolean
  height?: string
  className?: string
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

export interface NavProps {
  go: (s: Screen) => void
  screen: Screen
}

export interface HomeProps {
  go: (s: Screen) => void
  goBack?: () => void
  demo: (m: RiskMode) => void
  mode?: RiskMode
  locationSharingEnabled: boolean
  toggleLocationSharing: () => void
  location: GPSLocation | null
  isTracking: boolean
}

export interface StartProps {
  go: (s: Screen) => void
  goBack?: () => void
  startTracking: () => void
  locationSharingEnabled: boolean
  location?: GPSLocation | null
}

export interface RoutesProps {
  go: (s: Screen) => void
  goBack?: () => void
  location: GPSLocation | null
  status: GeolocationStatus
  error: string | null
  isTracking: boolean
  startTracking: () => void
  locationSharingEnabled: boolean
}

export interface LiveProps {
  go: (s: Screen) => void
  goBack?: () => void
  score: number
  mode: RiskMode
  location: GPSLocation | null
  status: GeolocationStatus
  error: string | null
  isTracking: boolean
  startTracking: () => void
  stopTracking: () => void
  locationSharingEnabled: boolean
}

export interface CheckProps {
  go: (s: Screen) => void
  goBack?: () => void
  score: number
  mode: RiskMode
  location?: GPSLocation | null
  sessionId?: string
}

export interface EmergencyProps {
  go: (s: Screen) => void
  goBack?: () => void
  score: number
  location?: GPSLocation | null
  sessionId?: string
}

export interface ContactProps {
  go: (s: Screen) => void
  goBack?: () => void
  score: number
  location: GPSLocation | null
}

export interface MapScreenProps {
  go?: (s: Screen) => void
  goBack?: () => void
  location: GPSLocation | null
  status: GeolocationStatus
  error: string | null
  isTracking: boolean
  startTracking: () => void
  stopTracking: () => void
  locationSharingEnabled: boolean
  toggleLocationSharing: () => void
  permissionState?: string
}

export interface ProfileProps {
  go: (s: Screen) => void
  goBack?: () => void
  locationSharingEnabled: boolean
  toggleLocationSharing: () => void
}

export interface AnalyticsProps {
  go: (s: Screen) => void
  goBack?: () => void
}

export interface AreaSafetyProps {
  go: (s: Screen) => void
  goBack: () => void
  mode: RiskMode
  location: GPSLocation | null
  status: GeolocationStatus
  isTracking: boolean
  locationSharingEnabled: boolean
}

export interface JourneysProps {
  go?: (s: Screen) => void
  goBack?: () => void
}

export interface PrivacyProps {
  go?: (s: Screen) => void
  goBack?: () => void
}
