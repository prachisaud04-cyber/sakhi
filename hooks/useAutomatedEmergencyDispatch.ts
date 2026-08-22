'use client'

import { useCallback, useState } from 'react'
import { GPSLocation } from '@/types'
import { DeliveryReceipt, DispatchPayload, DispatchResult } from '@/lib/notificationGateway'

export interface UseDispatchState {
  isDispatching: boolean
  lastResult: DispatchResult | null
  receipts: DeliveryReceipt[]
  error: string | null
}

export function useAutomatedEmergencyDispatch() {
  const [state, setState] = useState<UseDispatchState>({
    isDispatching: false,
    lastResult: null,
    receipts: [],
    error: null,
  })

  const dispatchAlert = useCallback(async (payload: DispatchPayload): Promise<DispatchResult | null> => {
    setState((prev) => ({ ...prev, isDispatching: true, error: null }))

    try {
      const res = await fetch('/api/dispatch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const errJson = await res.json()
        throw new Error(errJson.error || 'Dispatch request failed')
      }

      const result = (await res.json()) as DispatchResult
      setState({
        isDispatching: false,
        lastResult: result,
        receipts: result.receipts,
        error: null,
      })

      return result
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : 'Failed to dispatch automated alerts'
      setState((prev) => ({ ...prev, isDispatching: false, error: errMsg }))
      return null
    }
  }, [])

  // Offline / Native Cellular SMS fallback trigger
  const triggerNativeSmsBroadcast = useCallback(
    (phoneNumbers: string[], message: string) => {
      if (typeof window === 'undefined') return
      const cleanPhones = phoneNumbers.map((p) => p.replace(/[^0-9+]/g, '')).join(',')
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
      const separator = isIOS ? '&' : '?'
      const smsUri = `sms:${cleanPhones}${separator}body=${encodeURIComponent(message)}`
      window.location.href = smsUri
    },
    []
  )

  // Direct WhatsApp Launch fallback
  const triggerDirectWhatsApp = useCallback((phone: string, message: string) => {
    if (typeof window === 'undefined') return
    const cleanPhone = phone.replace(/[^0-9]/g, '')
    const url = `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(message)}`
    window.open(url, '_blank')
  }, [])

  return {
    isDispatching: state.isDispatching,
    lastResult: state.lastResult,
    receipts: state.receipts,
    error: state.error,
    dispatchAlert,
    triggerNativeSmsBroadcast,
    triggerDirectWhatsApp,
  }
}
