'use client'

import React, { useCallback, useEffect, useState } from 'react'
import { Check as CheckIcon } from 'lucide-react'
import { RiskMode, Screen } from '@/types'
import { useGeolocation } from '@/hooks/useGeolocation'
import { Nav } from '@/components/ui/Nav'
import { RecipientLiveSessionModal } from '@/components/ui/RecipientLiveSessionModal'
import { AnalyticsScreen } from '@/components/screens/AnalyticsScreen'
import { AreaSafetyScreen } from '@/components/screens/AreaSafetyScreen'
import { CheckScreen } from '@/components/screens/CheckScreen'
import { ContactScreen } from '@/components/screens/ContactScreen'
import { EmergencyScreen } from '@/components/screens/EmergencyScreen'
import { HomeScreen } from '@/components/screens/HomeScreen'
import { JourneysScreen } from '@/components/screens/JourneysScreen'
import { LiveScreen } from '@/components/screens/LiveScreen'
import { MapScreen } from '@/components/screens/MapScreen'
import { PrivacyScreen } from '@/components/screens/PrivacyScreen'
import { ProfileScreen } from '@/components/screens/ProfileScreen'
import { RoutesScreen } from '@/components/screens/RoutesScreen'
import { StartScreen } from '@/components/screens/StartScreen'

const MAIN_TABS: Screen[] = ['home', 'journeys', 'analytics', 'map', 'profile']

const FALLBACK_PARENTS: Record<Screen, Screen> = {
  home: 'home',
  start: 'home',
  routes: 'start',
  live: 'routes',
  check: 'live',
  emergency: 'live',
  contact: 'emergency',
  map: 'home',
  journeys: 'home',
  analytics: 'home',
  areaSafety: 'home',
  profile: 'home',
  privacy: 'profile',
}

export default function Page() {
  const [screen, setScreen] = useState<Screen>('home')
  const [historyStack, setHistoryStack] = useState<Screen[]>(['home'])
  const [score, setScore] = useState<number>(92)
  const [mode, setMode] = useState<RiskMode>('normal')
  const [toast, setToast] = useState<string>('')
  const [locationSharingEnabled, setLocationSharingEnabled] = useState<boolean>(true)
  const [recipientToken, setRecipientToken] = useState<string | null>(null)

  const { location, status, error, isTracking, permissionState, startTracking, stopTracking } =
    useGeolocation()

  const note = (x: string) => {
    setToast(x)
    setTimeout(() => setToast(''), 2500)
  }

  // Detect #live-session token from URL
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash
      if (hash.includes('token=')) {
        const tokenVal = hash.split('token=')[1]
        setRecipientToken(tokenVal)
      }
    }
  }, [])

  // Forward Navigation Function
  const go = useCallback(
    (targetScreen: Screen) => {
      if (MAIN_TABS.includes(targetScreen)) {
        setHistoryStack([targetScreen])
      } else {
        setHistoryStack((prev) => [...prev, targetScreen])
      }

      setScreen(targetScreen)

      if (typeof window !== 'undefined') {
        window.history.pushState({ screen: targetScreen }, '', `#${targetScreen}`)
      }
    },
    []
  )

  // Back Navigation Function
  const goBack = useCallback(() => {
    setHistoryStack((prevStack) => {
      if (prevStack.length > 1) {
        const newStack = prevStack.slice(0, -1)
        const prevScreen = newStack[newStack.length - 1]
        setScreen(prevScreen)
        return newStack
      } else {
        const fallback = FALLBACK_PARENTS[screen] || 'home'
        setScreen(fallback)
        return [fallback]
      }
    })
  }, [screen])

  // Sync Browser Back Button (popstate)
  useEffect(() => {
    const handlePopState = (e: PopStateEvent) => {
      if (e.state && e.state.screen) {
        setScreen(e.state.screen)
      } else {
        goBack()
      }
    }

    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [goBack])

  const toggleLocationSharing = () => {
    if (locationSharingEnabled) {
      setLocationSharingEnabled(false)
      stopTracking()
      note('Location sharing disabled (Privacy Protected)')
    } else {
      setLocationSharingEnabled(true)
      startTracking()
      note('Location sharing enabled')
    }
  }

  const demo = (m: RiskMode) => {
    setMode(m)
    setScore(m === 'normal' ? 92 : m === 'suspicious' ? 67 : 91)
    if (locationSharingEnabled) {
      startTracking()
    }
    note('Demo scenario updated')
  }

  const renderPage = () => {
    switch (screen) {
      case 'home':
        return (
          <HomeScreen
            go={go}
            goBack={goBack}
            demo={demo}
            mode={mode}
            locationSharingEnabled={locationSharingEnabled}
            toggleLocationSharing={toggleLocationSharing}
            location={location}
            isTracking={isTracking}
          />
        )
      case 'start':
        return (
          <StartScreen
            go={go}
            goBack={goBack}
            startTracking={startTracking}
            locationSharingEnabled={locationSharingEnabled}
          />
        )
      case 'routes':
        return (
          <RoutesScreen
            go={go}
            goBack={goBack}
            location={location}
            status={status}
            error={error}
            isTracking={isTracking}
            startTracking={startTracking}
            locationSharingEnabled={locationSharingEnabled}
          />
        )
      case 'live':
        return (
          <LiveScreen
            go={go}
            goBack={goBack}
            score={score}
            mode={mode}
            location={location}
            status={status}
            error={error}
            isTracking={isTracking}
            startTracking={startTracking}
            stopTracking={stopTracking}
            locationSharingEnabled={locationSharingEnabled}
          />
        )
      case 'check':
        return <CheckScreen go={go} goBack={goBack} score={score} mode={mode} />
      case 'emergency':
        return <EmergencyScreen go={go} goBack={goBack} score={score} />
      case 'contact':
        return <ContactScreen go={go} goBack={goBack} score={score} location={location} />
      case 'map':
        return (
          <MapScreen
            go={go}
            goBack={goBack}
            location={location}
            status={status}
            error={error}
            isTracking={isTracking}
            startTracking={startTracking}
            stopTracking={stopTracking}
            locationSharingEnabled={locationSharingEnabled}
            toggleLocationSharing={toggleLocationSharing}
            permissionState={permissionState}
          />
        )
      case 'journeys':
        return <JourneysScreen go={go} goBack={goBack} />
      case 'analytics':
        return <AnalyticsScreen go={go} goBack={goBack} />
      case 'areaSafety':
        return (
          <AreaSafetyScreen
            go={go}
            goBack={goBack}
            mode={mode}
            location={location}
            status={status}
            isTracking={isTracking}
            locationSharingEnabled={locationSharingEnabled}
          />
        )
      case 'profile':
        return (
          <ProfileScreen
            go={go}
            goBack={goBack}
            locationSharingEnabled={locationSharingEnabled}
            toggleLocationSharing={toggleLocationSharing}
          />
        )
      case 'privacy':
        return <PrivacyScreen go={go} goBack={goBack} />
      default:
        return (
          <HomeScreen
            go={go}
            goBack={goBack}
            demo={demo}
            mode={mode}
            locationSharingEnabled={locationSharingEnabled}
            toggleLocationSharing={toggleLocationSharing}
            location={location}
            isTracking={isTracking}
          />
        )
    }
  }

  const showNav = MAIN_TABS.includes(screen)

  return (
    <main className="shell">
      {renderPage()}
      {showNav && <Nav go={go} screen={screen} />}
      {toast && (
        <div className="toast">
          <CheckIcon />
          {toast}
        </div>
      )}
      <RecipientLiveSessionModal
        token={recipientToken}
        onClose={() => setRecipientToken(null)}
      />
    </main>
  )
}
