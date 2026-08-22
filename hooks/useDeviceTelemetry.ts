'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

export interface DeviceTelemetry {
  batteryLevel: number // 0-100%
  isCharging: boolean
  batterySupported: boolean
  isOnline: boolean
  connectionType: string // '4G', '5G', 'WiFi', '3G', 'Offline'
  downlinkSpeed?: number // Mbps
  networkLatency?: number // ms
  isLowBattery: boolean // batteryLevel < 20%
  batteryHealth: 'optimal' | 'good' | 'low' | 'critical'
  batteryStatusText: string
  deviceMemoryGb?: number
  cpuCores?: number
  platform: string
  isMobile: boolean
  screenOrientation: string
  hapticVibrate: (pattern?: number | number[]) => boolean
  playEmergencySiren: () => () => void
}

export function useDeviceTelemetry(): DeviceTelemetry {
  const [batteryLevel, setBatteryLevel] = useState<number>(82)
  const [isCharging, setIsCharging] = useState<boolean>(false)
  const [batterySupported, setBatterySupported] = useState<boolean>(false)
  const [isOnline, setIsOnline] = useState<boolean>(true)
  const [connectionType, setConnectionType] = useState<string>('4G')
  const [downlinkSpeed, setDownlinkSpeed] = useState<number | undefined>(undefined)
  const [networkLatency, setNetworkLatency] = useState<number | undefined>(undefined)
  const [deviceMemoryGb, setDeviceMemoryGb] = useState<number | undefined>(undefined)
  const [cpuCores, setCpuCores] = useState<number | undefined>(undefined)
  const [platform, setPlatform] = useState<string>('Unknown Device')
  const [isMobile, setIsMobile] = useState<boolean>(false)
  const [screenOrientation, setScreenOrientation] = useState<string>('portrait')

  const audioCtxRef = useRef<AudioContext | null>(null)

  // 1. BATTERY STATUS API
  useEffect(() => {
    if (typeof window === 'undefined') return

    // Fallback battery simulation if unsupported
    let isSubscribed = true

    if ('getBattery' in navigator) {
      ;(navigator as any)
        .getBattery()
        .then((battery: any) => {
          if (!isSubscribed) return
          setBatterySupported(true)

          const updateBattery = () => {
            const level = Math.round(battery.level * 100)
            setBatteryLevel(level)
            setIsCharging(battery.charging)
          }

          updateBattery()

          battery.addEventListener('levelchange', updateBattery)
          battery.addEventListener('chargingchange', updateBattery)

          return () => {
            battery.removeEventListener('levelchange', updateBattery)
            battery.removeEventListener('chargingchange', updateBattery)
          }
        })
        .catch((err: unknown) => {
          console.warn('[Battery API Notice]', err)
          setBatterySupported(false)
        })
    } else {
      setBatterySupported(false)
    }

    return () => {
      isSubscribed = false
    }
  }, [])

  // 2. NETWORK TELEMETRY API
  useEffect(() => {
    if (typeof window === 'undefined') return

    const updateOnlineStatus = () => {
      setIsOnline(navigator.onLine)
      if (!navigator.onLine) {
        setConnectionType('Offline')
      }
    }

    updateOnlineStatus()
    window.addEventListener('online', updateOnlineStatus)
    window.addEventListener('offline', updateOnlineStatus)

    // Network Information API
    const conn = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection
    if (conn) {
      const updateNetworkInfo = () => {
        if (conn.effectiveType) {
          setConnectionType(conn.effectiveType.toUpperCase())
        }
        if (conn.downlink) {
          setDownlinkSpeed(conn.downlink)
        }
        if (conn.rtt) {
          setNetworkLatency(conn.rtt)
        }
      }

      updateNetworkInfo()
      conn.addEventListener('change', updateNetworkInfo)

      return () => {
        conn.removeEventListener('change', updateNetworkInfo)
        window.removeEventListener('online', updateOnlineStatus)
        window.removeEventListener('offline', updateOnlineStatus)
      }
    }

    return () => {
      window.removeEventListener('online', updateOnlineStatus)
      window.removeEventListener('offline', updateOnlineStatus)
    }
  }, [])

  // 3. HARDWARE & DEVICE TELEMETRY
  useEffect(() => {
    if (typeof window === 'undefined') return

    // Device Memory
    if ('deviceMemory' in navigator) {
      setDeviceMemoryGb((navigator as any).deviceMemory)
    }

    // Hardware Concurrency (CPU cores)
    if ('hardwareConcurrency' in navigator) {
      setCpuCores(navigator.hardwareConcurrency)
    }

    // User Agent / Platform Detection
    const ua = navigator.userAgent
    const mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i
    const isMob = mobileRegex.test(ua)
    setIsMobile(isMob)

    if (/iPhone|iPad|iPod/i.test(ua)) setPlatform('iOS Apple Device')
    else if (/Android/i.test(ua)) setPlatform('Android Mobile Device')
    else if (/Windows/i.test(ua)) setPlatform('Windows PC')
    else if (/Macintosh|Mac OS X/i.test(ua)) setPlatform('Mac OS Device')
    else if (/Linux/i.test(ua)) setPlatform('Linux Device')
    else setPlatform(isMob ? 'Mobile Device' : 'Desktop Device')

    // Screen Orientation
    const updateOrientation = () => {
      if (window.screen && window.screen.orientation) {
        setScreenOrientation(window.screen.orientation.type.includes('portrait') ? 'portrait' : 'landscape')
      }
    }
    updateOrientation()
    window.addEventListener('resize', updateOrientation)

    return () => window.removeEventListener('resize', updateOrientation)
  }, [])

  // 4. HAPTIC VIBRATION HELPER
  const hapticVibrate = useCallback((pattern: number | number[] = [100, 50, 100]): boolean => {
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      try {
        return navigator.vibrate(pattern)
      } catch (err) {
        console.warn('Vibration API error:', err)
      }
    }
    return false
  }, [])

  // 5. PUBLIC FOLDER POLICE SIREN SOUND EFFECT
  const playEmergencySiren = useCallback((): (() => void) => {
    if (typeof window === 'undefined') return () => {}

    try {
      const audio = new Audio('/11325622-police-siren-sound-effect-240674.mp3')
      audio.loop = true
      audio.volume = 1.0

      const playPromise = audio.play()
      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          console.warn('[Police Siren Audio Autoplay Notice]:', err)
        })
      }

      // Return stop function to halt siren and reset time
      return () => {
        try {
          audio.pause()
          audio.currentTime = 0
        } catch {
          // ignore
        }
      }
    } catch (e) {
      console.warn('Audio Siren unavailable:', e)
      return () => {}
    }
  }, [])

  const isLowBattery = batteryLevel < 20
  const batteryHealth: 'optimal' | 'good' | 'low' | 'critical' =
    batteryLevel > 60
      ? 'optimal'
      : batteryLevel > 30
      ? 'good'
      : batteryLevel > 15
      ? 'low'
      : 'critical'

  const batteryStatusText = `${batteryLevel}%${isCharging ? ' (Charging ⚡)' : ''}`

  return {
    batteryLevel,
    isCharging,
    batterySupported,
    isOnline,
    connectionType,
    downlinkSpeed,
    networkLatency,
    isLowBattery,
    batteryHealth,
    batteryStatusText,
    deviceMemoryGb,
    cpuCores,
    platform,
    isMobile,
    screenOrientation,
    hapticVibrate,
    playEmergencySiren,
  }
}
