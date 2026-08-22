'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { GPSLocation } from '@/types'
import {
  AnomalyEvaluation,
  assessRouteSafety,
  CorridorSegment,
  evaluateRealTimeAnomaly,
  findNearestSafetyPOI,
  getTimeOfDaySafetyFactor,
  RoutePoint,
  RouteSafetyAssessment,
} from '@/lib/routeSafetyEngine'
import { SafetyPOI } from '@/constants/mapData'

export interface UseDynamicRouteSafetyProps {
  location: GPSLocation | null
  routeCoordinates: RoutePoint[]
  isJourneyActive: boolean
  onAnomalyDetected?: (anomaly: AnomalyEvaluation) => void
  deviationThresholdMeters?: number
}

export interface DynamicRouteSafetyState {
  assessment: RouteSafetyAssessment
  anomaly: AnomalyEvaluation
  crossTrackDeviationMeters: number
  nearestSafePOI: SafetyPOI | null
  distanceToNearestSafePOIKm: number | null
  progressPercent: number
  timeOfDayLabel: string
  dynamicSafetyScore: number
  activeSegment: CorridorSegment | null
  isSafeCorridor: boolean
}

export function useDynamicRouteSafety({
  location,
  routeCoordinates,
  isJourneyActive,
  onAnomalyDetected,
  deviationThresholdMeters = 180,
}: UseDynamicRouteSafetyProps): DynamicRouteSafetyState {
  const lastLocationRef = useRef<GPSLocation | null>(null)
  const lastMovementTimestampRef = useRef<number>(Date.now())
  const stationaryDurationMsRef = useRef<number>(0)

  // 1. Initial and dynamic Route Assessment
  const assessment = useMemo(() => {
    return assessRouteSafety(routeCoordinates)
  }, [routeCoordinates])

  // 2. Track movement vs stationary state
  useEffect(() => {
    if (!location || !isJourneyActive) return

    const now = Date.now()
    if (!lastLocationRef.current) {
      lastLocationRef.current = location
      lastMovementTimestampRef.current = now
      stationaryDurationMsRef.current = 0
      return
    }

    const prev = lastLocationRef.current
    const distChange =
      Math.abs(prev.lat - location.lat) + Math.abs(prev.lng - location.lng)

    // Moved > ~10 meters
    if (distChange > 0.0001) {
      lastMovementTimestampRef.current = now
      stationaryDurationMsRef.current = 0
      lastLocationRef.current = location
    } else {
      stationaryDurationMsRef.current = now - lastMovementTimestampRef.current
    }
  }, [location, isJourneyActive])

  // 3. Real-Time Anomaly Detection
  const anomaly = useMemo(() => {
    if (!isJourneyActive || !location || routeCoordinates.length < 2) {
      return {
        hasAnomaly: false,
        anomalyType: 'NONE' as const,
        severity: 'low' as const,
        crossTrackDistanceMeters: 0,
        deviationThresholdMeters,
        timeStoppedSeconds: 0,
        message: 'Active monitoring ready.',
      }
    }

    const evaluation = evaluateRealTimeAnomaly(
      location,
      routeCoordinates,
      lastMovementTimestampRef.current,
      stationaryDurationMsRef.current,
      deviationThresholdMeters
    )

    if (evaluation.hasAnomaly && onAnomalyDetected) {
      onAnomalyDetected(evaluation)
    }

    return evaluation
  }, [location, routeCoordinates, isJourneyActive, deviationThresholdMeters, onAnomalyDetected])

  // 4. Nearest Safe Haven to User's Current GPS
  const nearestPOIInfo = useMemo(() => {
    if (!location) return null
    return findNearestSafetyPOI({ lat: location.lat, lng: location.lng })
  }, [location])

  // 5. Active Corridor Segment & Journey Progress
  const { activeSegment, progressPercent } = useMemo(() => {
    if (!location || routeCoordinates.length < 2 || assessment.segments.length === 0) {
      return { activeSegment: null, progressPercent: 0 }
    }

    const start = routeCoordinates[0]
    const end = routeCoordinates[routeCoordinates.length - 1]

    const totalLat = end.lat - start.lat
    const totalLng = end.lng - start.lng
    const currentLat = location.lat - start.lat
    const currentLng = location.lng - start.lng

    const dot = currentLat * totalLat + currentLng * totalLng
    const mag = totalLat * totalLat + totalLng * totalLng
    const rawProgress = mag > 0 ? (dot / mag) * 100 : 0
    const progress = Math.min(100, Math.max(0, Math.round(rawProgress)))

    // Find closest segment
    let closestSeg = assessment.segments[0]
    let minDist = Infinity

    assessment.segments.forEach((seg) => {
      const mid = {
        lat: (seg.startPoint.lat + seg.endPoint.lat) / 2,
        lng: (seg.startPoint.lng + seg.endPoint.lng) / 2,
      }
      const d =
        Math.pow(location.lat - mid.lat, 2) + Math.pow(location.lng - mid.lng, 2)
      if (d < minDist) {
        minDist = d
        closestSeg = seg
      }
    })

    return { activeSegment: closestSeg, progressPercent: progress }
  }, [location, routeCoordinates, assessment.segments])

  const timeFactor = getTimeOfDaySafetyFactor()

  // Real-time dynamic safety score:
  // Starts with route overall score, reduced if anomaly exists or if in lower-lit segment
  let dynamicSafetyScore = assessment.overallScore
  if (anomaly.hasAnomaly) {
    dynamicSafetyScore = Math.max(40, dynamicSafetyScore - (anomaly.severity === 'critical' ? 35 : 20))
  }

  return {
    assessment,
    anomaly,
    crossTrackDeviationMeters: anomaly.crossTrackDistanceMeters,
    nearestSafePOI: nearestPOIInfo ? nearestPOIInfo.poi : null,
    distanceToNearestSafePOIKm: nearestPOIInfo ? parseFloat(nearestPOIInfo.distanceKm.toFixed(1)) : null,
    progressPercent,
    timeOfDayLabel: timeFactor.label,
    dynamicSafetyScore,
    activeSegment,
    isSafeCorridor: !anomaly.hasAnomaly && dynamicSafetyScore >= 80,
  }
}
