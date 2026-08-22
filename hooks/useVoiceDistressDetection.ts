'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

export const DISTRESS_KEYWORDS = [
  'help',
  'help me',
  'bachao',
  'emergency',
  'save me',
  'sakhi help',
  'sakhi emergency',
  'police',
  'danger',
  'roko',
  'khodai roko',
]

export interface UseVoiceDistressDetectionProps {
  onDistressDetected?: (keyword: string, transcript: string) => void
  autoStart?: boolean
}

export interface VoiceDistressState {
  isListening: boolean
  isSupported: boolean
  lastTranscript: string
  detectedKeyword: string | null
  confidence: number
  startListening: () => void
  stopListening: () => void
  toggleListening: () => void
}

export function useVoiceDistressDetection({
  onDistressDetected,
  autoStart = false,
}: UseVoiceDistressDetectionProps = {}): VoiceDistressState {
  const [isListening, setIsListening] = useState<boolean>(false)
  const [isSupported, setIsSupported] = useState<boolean>(false)
  const [lastTranscript, setLastTranscript] = useState<string>('')
  const [detectedKeyword, setDetectedKeyword] = useState<string | null>(null)
  const [confidence, setConfidence] = useState<number>(0)

  const recognitionRef = useRef<any>(null)
  const isManuallyStoppedRef = useRef<boolean>(!autoStart)

  useEffect(() => {
    if (typeof window === 'undefined') return

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition

    if (SpeechRecognition) {
      setIsSupported(true)
      const recognition = new SpeechRecognition()
      recognition.continuous = true
      recognition.interimResults = true
      recognition.lang = 'en-IN' // Supports Indian English & common Hindi/Assamese phrases

      recognition.onresult = (event: any) => {
        let currentTranscript = ''
        let currentConfidence = 0.85

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const res = event.results[i]
          currentTranscript += res[0].transcript
          if (res[0].confidence) {
            currentConfidence = res[0].confidence
          }
        }

        const cleanTranscript = currentTranscript.trim().toLowerCase()
        setLastTranscript(cleanTranscript)
        setConfidence(currentConfidence)

        // Check for distress keywords
        for (const kw of DISTRESS_KEYWORDS) {
          if (cleanTranscript.includes(kw)) {
            setDetectedKeyword(kw)
            if (onDistressDetected) {
              onDistressDetected(kw, cleanTranscript)
            }
            break
          }
        }
      }

      recognition.onerror = (err: any) => {
        console.warn('[Voice Distress Detection Error]', err)
        if (err.error === 'not-allowed') {
          setIsListening(false)
        }
      }

      recognition.onend = () => {
        // Auto-restart continuous listening if not manually stopped
        if (!isManuallyStoppedRef.current && recognitionRef.current) {
          try {
            recognition.start()
            setIsListening(true)
          } catch {
            setIsListening(false)
          }
        } else {
          setIsListening(false)
        }
      }

      recognitionRef.current = recognition

      if (autoStart) {
        try {
          recognition.start()
          setIsListening(true)
          isManuallyStoppedRef.current = false
        } catch {
          // ignore
        }
      }
    } else {
      setIsSupported(false)
    }

    return () => {
      if (recognitionRef.current) {
        isManuallyStoppedRef.current = true
        try {
          recognitionRef.current.stop()
        } catch {
          // ignore
        }
      }
    }
  }, [autoStart, onDistressDetected])

  const startListening = useCallback(() => {
    if (!recognitionRef.current) return
    isManuallyStoppedRef.current = false
    try {
      recognitionRef.current.start()
      setIsListening(true)
    } catch {
      setIsListening(true)
    }
  }, [])

  const stopListening = useCallback(() => {
    if (!recognitionRef.current) return
    isManuallyStoppedRef.current = true
    try {
      recognitionRef.current.stop()
      setIsListening(false)
    } catch {
      setIsListening(false)
    }
  }, [])

  const toggleListening = useCallback(() => {
    if (isListening) {
      stopListening()
    } else {
      startListening()
    }
  }, [isListening, startListening, stopListening])

  return {
    isListening,
    isSupported,
    lastTranscript,
    detectedKeyword,
    confidence,
    startListening,
    stopListening,
    toggleListening,
  }
}
