import { useCallback, useEffect, useRef, useState } from 'react'
import { GeolocationStatus, GPSLocation } from '@/types'

export interface UseGeolocationOptions {
  enableHighAccuracy?: boolean
  timeout?: number
  maximumAge?: number
}

export function useGeolocation(options: UseGeolocationOptions = {}) {
  const [location, setLocation] = useState<GPSLocation | null>(null)
  const [status, setStatus] = useState<GeolocationStatus>('idle')
  const [error, setError] = useState<string | null>(null)
  const [errorCode, setErrorCode] = useState<number | null>(null)
  const [isTracking, setIsTracking] = useState<boolean>(false)
  const [permissionState, setPermissionState] = useState<string>('unknown')

  const watchIdRef = useRef<number | null>(null)

  const { enableHighAccuracy = true, timeout = 10000, maximumAge = 0 } = options

  // Query Permissions API on mount if supported
  useEffect(() => {
    if (typeof window !== 'undefined' && navigator.permissions && navigator.permissions.query) {
      navigator.permissions
        .query({ name: 'geolocation' })
        .then((statusObj) => {
          setPermissionState(statusObj.state)
          statusObj.onchange = () => {
            setPermissionState(statusObj.state)
          }
        })
        .catch(() => {
          setPermissionState('unknown')
        })
    }
  }, [])

  const stopTracking = useCallback(() => {
    if (watchIdRef.current !== null && typeof window !== 'undefined' && navigator.geolocation) {
      console.log('[GPS] Stopping tracking, clearing watch ID:', watchIdRef.current)
      navigator.geolocation.clearWatch(watchIdRef.current)
      watchIdRef.current = null
    }
    setIsTracking(false)
    setStatus('idle')
    setError(null)
    setErrorCode(null)
  }, [])

  const startTracking = useCallback(() => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      console.error('[GPS Error] Geolocation services are not supported by this browser.')
      setStatus('unavailable')
      setError("Geolocation is not supported by your browser or current context.")
      setErrorCode(2)
      return
    }

    // Clear any active watcher first
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current)
      watchIdRef.current = null
    }

    console.log('[GPS] Starting live location request...')
    setStatus('requesting')
    setError(null)
    setErrorCode(null)
    setIsTracking(true)

    const handleSuccess = (position: GeolocationPosition) => {
      const coords: GPSLocation = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
        accuracy: position.coords.accuracy,
        heading: position.coords.heading,
        speed: position.coords.speed,
        timestamp: position.timestamp,
      }

      console.log('[GPS Position Received]', coords.lat, coords.lng, 'Accuracy:', coords.accuracy, 'm')

      setLocation(coords)
      setStatus('tracking')
      setError(null)
      setErrorCode(null)
    }

    const handleError = (err: GeolocationPositionError, isHighAccuracyAttempt = true) => {
      console.warn('[GPS Position Warning/Error]', err.code, err.message)
      setErrorCode(err.code)

      switch (err.code) {
        case err.PERMISSION_DENIED: // Code 1
          setIsTracking(false)
          setStatus('denied')
          setError('Location permission denied. Please enable location access in browser settings to use SAKHI.')
          break

        case err.POSITION_UNAVAILABLE: // Code 2
        case err.TIMEOUT: // Code 3
          // Fallback to lower accuracy if high accuracy failed on desktop/laptop
          if (isHighAccuracyAttempt) {
            console.log('[GPS Fallback] High accuracy failed, retrying with network/coarse location...')
            setStatus('searching')
            navigator.geolocation.getCurrentPosition(
              (pos) => handleSuccess(pos),
              (fallbackErr) => handleError(fallbackErr, false),
              {
                enableHighAccuracy: false,
                timeout: 15000,
                maximumAge: 0,
              }
            )
          } else {
            setStatus(err.code === err.TIMEOUT ? 'timeout' : 'unavailable')
            setError(
              err.code === err.TIMEOUT
                ? 'Location request timed out. Click Refresh Location to try again.'
                : "GPS/location unavailable. Please check your device location services."
            )
          }
          break

        default:
          setStatus('unavailable')
          setError(err.message || 'An unknown location error occurred.')
          break
      }
    }

    // Step 1: Request initial position with high accuracy
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        handleSuccess(pos)

        // Step 2: Start continuous watcher for live updates
        if (watchIdRef.current === null) {
          const id = navigator.geolocation.watchPosition(
            handleSuccess,
            (e) => handleError(e, false),
            {
              enableHighAccuracy,
              timeout,
              maximumAge,
            }
          )
          watchIdRef.current = id
          console.log('[GPS Watcher Started] Watch ID:', id)
        }
      },
      (err) => {
        handleError(err, true)

        // If not permission denied, start continuous watcher as fallback
        if (watchIdRef.current === null && err.code !== err.PERMISSION_DENIED) {
          const id = navigator.geolocation.watchPosition(
            handleSuccess,
            (e) => handleError(e, false),
            {
              enableHighAccuracy: false,
              timeout: 15000,
              maximumAge: 0,
            }
          )
          watchIdRef.current = id
          console.log('[GPS Fallback Watcher Started] Watch ID:', id)
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    )
  }, [enableHighAccuracy, timeout, maximumAge])

  const refreshLocation = useCallback(() => {
    startTracking()
  }, [startTracking])

  // Cleanup watcher on unmount
  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null && typeof window !== 'undefined' && navigator.geolocation) {
        console.log('[GPS Cleanup] Clearing watch ID:', watchIdRef.current)
        navigator.geolocation.clearWatch(watchIdRef.current)
      }
    }
  }, [])

  return {
    location,
    status,
    error,
    errorCode,
    isTracking,
    permissionState,
    startTracking,
    stopTracking,
    refreshLocation,
  }
}
