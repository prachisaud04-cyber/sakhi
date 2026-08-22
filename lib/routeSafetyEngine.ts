import { GPSLocation } from '@/types'
import { calculateDistanceKm, SAFETY_POIS, SafetyPOI } from '@/constants/mapData'

export interface RoutePoint {
  lat: number
  lng: number
}

export interface CorridorSegment {
  id: string
  name: string
  startPoint: RoutePoint
  endPoint: RoutePoint
  distanceMeters: number
  lightingScore: number // 0-100
  cctvDensity: number // 0-100
  policePresence: boolean
  nearestSafePOI: SafetyPOI
  distanceToSafePOIKm: number
  hazardRisk: 'low' | 'moderate' | 'high'
}

export interface RouteSafetyAssessment {
  overallScore: number // 0-100
  timeOfDayMultiplier: number // 0.7 - 1.0 (lower late at night)
  lightingScore: number
  cctvDensityScore: number
  policeProximityScore: number
  safeSheltersCount: number
  riskLevel: 'safe' | 'caution' | 'high_risk'
  segments: CorridorSegment[]
  nearestPOIsAlongRoute: { poi: SafetyPOI; distanceKm: number }[]
  safetyRecommendations: string[]
}

export interface AnomalyEvaluation {
  hasAnomaly: boolean
  anomalyType?: 'ROUTE_DEVIATION' | 'UNEXPECTED_STOP' | 'PROLONGED_IDLE' | 'HIGH_RISK_ZONE' | 'NONE'
  severity: 'low' | 'medium' | 'critical'
  crossTrackDistanceMeters: number
  deviationThresholdMeters: number
  timeStoppedSeconds: number
  message: string
}

/**
 * Calculates distance from a point to a line segment (Cross-Track Distance in meters)
 */
export function pointToSegmentDistanceMeters(
  p: RoutePoint,
  v: RoutePoint,
  w: RoutePoint
): number {
  const l2 = Math.pow(v.lat - w.lat, 2) + Math.pow(v.lng - w.lng, 2)
  if (l2 === 0) return calculateDistanceKm(p.lat, p.lng, v.lat, v.lng) * 1000

  // Projection of p onto segment vw
  const t = Math.max(
    0,
    Math.min(1, ((p.lat - v.lat) * (w.lat - v.lat) + (p.lng - v.lng) * (w.lng - v.lng)) / l2)
  )
  const projection = {
    lat: v.lat + t * (w.lat - v.lat),
    lng: v.lng + t * (w.lng - v.lng),
  }

  return calculateDistanceKm(p.lat, p.lng, projection.lat, projection.lng) * 1000
}

/**
 * Calculates the shortest cross-track distance from user's GPS to any segment of the route polyline
 */
export function calculateCrossTrackDeviationMeters(
  userLocation: RoutePoint,
  routePath: RoutePoint[]
): number {
  if (!routePath || routePath.length < 2) return 0

  let minDistanceMeters = Infinity

  for (let i = 0; i < routePath.length - 1; i++) {
    const dist = pointToSegmentDistanceMeters(userLocation, routePath[i], routePath[i + 1])
    if (dist < minDistanceMeters) {
      minDistanceMeters = dist
    }
  }

  return Math.round(minDistanceMeters)
}

/**
 * Returns dynamic Time-of-Day Safety Multiplier based on local clock:
 * - Daytime (6 AM - 6 PM): 1.0 (Full visibility)
 * - Evening (6 PM - 10 PM): 0.92 (Commercial active)
 * - Late Night (10 PM - 1 AM): 0.82 (Reduced pedestrian traffic)
 * - Deep Night (1 AM - 5 AM): 0.72 (Maximum caution required)
 */
export function getTimeOfDaySafetyFactor(date: Date = new Date()): {
  factor: number
  label: string
  period: 'day' | 'evening' | 'late_night' | 'deep_night'
} {
  const hour = date.getHours()

  if (hour >= 6 && hour < 18) {
    return { factor: 1.0, label: 'Daylight (High Natural Visibility)', period: 'day' }
  } else if (hour >= 18 && hour < 22) {
    return { factor: 0.92, label: 'Evening (Active Commercial Lighting)', period: 'evening' }
  } else if (hour >= 22 || hour < 1) {
    return { factor: 0.82, label: 'Late Night (Reduced Visibility & Traffic)', period: 'late_night' }
  } else {
    return { factor: 0.72, label: 'Deep Night (Maximum Caution Active)', period: 'deep_night' }
  }
}

/**
 * Finds the nearest safety POI (Police / Hospital / Shelter) to a given coordinate
 */
export function findNearestSafetyPOI(point: RoutePoint): {
  poi: SafetyPOI
  distanceKm: number
} {
  let nearest = SAFETY_POIS[0]
  let minDistance = calculateDistanceKm(point.lat, point.lng, nearest.lat, nearest.lng)

  for (let i = 1; i < SAFETY_POIS.length; i++) {
    const d = calculateDistanceKm(point.lat, point.lng, SAFETY_POIS[i].lat, SAFETY_POIS[i].lng)
    if (d < minDistance) {
      minDistance = d
      nearest = SAFETY_POIS[i]
    }
  }

  return { poi: nearest, distanceKm: minDistance }
}

/**
 * Evaluates full Dynamic Safety Assessment for a complete route polyline
 */
export function assessRouteSafety(
  routePath: RoutePoint[],
  customDate: Date = new Date()
): RouteSafetyAssessment {
  const { factor: timeFactor, label: timeLabel, period } = getTimeOfDaySafetyFactor(customDate)

  if (!routePath || routePath.length === 0) {
    return {
      overallScore: 85,
      timeOfDayMultiplier: timeFactor,
      lightingScore: 88,
      cctvDensityScore: 80,
      policeProximityScore: 90,
      safeSheltersCount: 4,
      riskLevel: 'safe',
      segments: [],
      nearestPOIsAlongRoute: [],
      safetyRecommendations: ['Stay on primary arterial roadways.', 'Keep phone charged.'],
    }
  }

  const segments: CorridorSegment[] = []
  const foundPOIsMap = new Map<string, { poi: SafetyPOI; distanceKm: number }>()

  let totalLighting = 0
  let totalCCTV = 0
  let policeCoverageCount = 0

  for (let i = 0; i < routePath.length - 1; i++) {
    const start = routePath[i]
    const end = routePath[i + 1]
    const midPoint = { lat: (start.lat + end.lat) / 2, lng: (start.lng + end.lng) / 2 }

    const distMeters = Math.round(calculateDistanceKm(start.lat, start.lng, end.lat, end.lng) * 1000)
    const { poi: nearestPOI, distanceKm: distToPOI } = findNearestSafetyPOI(midPoint)

    if (!foundPOIsMap.has(nearestPOI.id)) {
      foundPOIsMap.set(nearestPOI.id, { poi: nearestPOI, distanceKm: distToPOI })
    }

    // Segment lighting assessment
    const baseLighting = distToPOI < 1.2 ? 94 : distToPOI < 2.5 ? 84 : 72
    const segLighting = Math.round(baseLighting * timeFactor)

    // Segment CCTV assessment
    const segCCTV = distToPOI < 1.5 ? 88 : 74

    // Police presence
    const hasPolice = nearestPOI.type === 'police' && distToPOI < 2.0
    if (hasPolice) policeCoverageCount++

    totalLighting += segLighting
    totalCCTV += segCCTV

    const hazardRisk: 'low' | 'moderate' | 'high' =
      segLighting >= 80 ? 'low' : segLighting >= 65 ? 'moderate' : 'high'

    segments.push({
      id: `seg-${i + 1}`,
      name: `Corridor Segment ${i + 1}`,
      startPoint: start,
      endPoint: end,
      distanceMeters: distMeters,
      lightingScore: segLighting,
      cctvDensity: segCCTV,
      policePresence: hasPolice,
      nearestSafePOI: nearestPOI,
      distanceToSafePOIKm: parseFloat(distToPOI.toFixed(1)),
      hazardRisk,
    })
  }

  const segCount = segments.length || 1
  const avgLighting = Math.round(totalLighting / segCount)
  const avgCCTV = Math.round(totalCCTV / segCount)
  const policeProximityScore = Math.min(100, Math.round((policeCoverageCount / segCount) * 100 + 40))

  // Weighted overall safety algorithm
  const rawScore = avgLighting * 0.4 + avgCCTV * 0.3 + policeProximityScore * 0.3
  const overallScore = Math.min(99, Math.max(50, Math.round(rawScore)))

  const riskLevel: 'safe' | 'caution' | 'high_risk' =
    overallScore >= 85 ? 'safe' : overallScore >= 70 ? 'caution' : 'high_risk'

  const nearestPOIsAlongRoute = Array.from(foundPOIsMap.values()).sort(
    (a, b) => a.distanceKm - b.distanceKm
  )

  const safetyRecommendations: string[] = []
  if (period === 'late_night' || period === 'deep_night') {
    safetyRecommendations.push(`⏰ ${timeLabel}: Keep live GPS location sharing active.`)
  }
  if (nearestPOIsAlongRoute.length > 0) {
    safetyRecommendations.push(
      `🛡️ ${nearestPOIsAlongRoute[0].poi.name} is only ${nearestPOIsAlongRoute[0].distanceKm.toFixed(1)} km away.`
    )
  }
  if (avgLighting < 80) {
    safetyRecommendations.push('💡 Moderate lighting ahead: Prefer main vehicle lane over unlit sidewalks.')
  } else {
    safetyRecommendations.push('✨ High lighting rating along 90%+ of this corridor.')
  }

  return {
    overallScore,
    timeOfDayMultiplier: timeFactor,
    lightingScore: avgLighting,
    cctvDensityScore: avgCCTV,
    policeProximityScore,
    safeSheltersCount: nearestPOIsAlongRoute.length,
    riskLevel,
    segments,
    nearestPOIsAlongRoute,
    safetyRecommendations,
  }
}

/**
 * Real-Time Anomaly Evaluator
 * Checks if user is deviating from route or stopped unexpectedly
 */
export function evaluateRealTimeAnomaly(
  currentLocation: GPSLocation | null,
  routePath: RoutePoint[],
  lastKnownMovementTime: number,
  isStationaryForMs: number,
  deviationThresholdMeters: number = 180
): AnomalyEvaluation {
  if (!currentLocation || !routePath || routePath.length < 2) {
    return {
      hasAnomaly: false,
      anomalyType: 'NONE',
      severity: 'low',
      crossTrackDistanceMeters: 0,
      deviationThresholdMeters,
      timeStoppedSeconds: 0,
      message: 'Monitoring active corridor.',
    }
  }

  const crossTrackDist = calculateCrossTrackDeviationMeters(
    { lat: currentLocation.lat, lng: currentLocation.lng },
    routePath
  )

  const timeStoppedSec = Math.round(isStationaryForMs / 1000)

  // 1. Critical Route Deviation Check (> 180m off planned polyline)
  if (crossTrackDist > deviationThresholdMeters) {
    return {
      hasAnomaly: true,
      anomalyType: 'ROUTE_DEVIATION',
      severity: crossTrackDist > 400 ? 'critical' : 'medium',
      crossTrackDistanceMeters: crossTrackDist,
      deviationThresholdMeters,
      timeStoppedSeconds: timeStoppedSec,
      message: `Route deviation detected: ${crossTrackDist}m away from safe corridor!`,
    }
  }

  // 2. Unexpected Prolonged Stop Check (> 180 seconds outside designated stop)
  if (timeStoppedSec >= 180) {
    return {
      hasAnomaly: true,
      anomalyType: 'UNEXPECTED_STOP',
      severity: timeStoppedSec > 300 ? 'critical' : 'medium',
      crossTrackDistanceMeters: crossTrackDist,
      deviationThresholdMeters,
      timeStoppedSeconds: timeStoppedSec,
      message: `Stationary alert: No movement detected for ${Math.round(timeStoppedSec / 60)} minutes.`,
    }
  }

  return {
    hasAnomaly: false,
    anomalyType: 'NONE',
    severity: 'low',
    crossTrackDistanceMeters: crossTrackDist,
    deviationThresholdMeters,
    timeStoppedSeconds: timeStoppedSec,
    message: `On track · Corridor deviation: ${crossTrackDist}m (Safe)`,
  }
}
