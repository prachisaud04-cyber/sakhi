'use client'

import React, { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import {
  AlertCircle,
  CheckCircle2,
  Mic,
  MicOff,
  Pause,
  Play,
  Radio,
  ShieldAlert,
  ShieldCheck,
  Siren,
  Sparkles,
  Square,
  Volume2,
  X,
} from 'lucide-react'
import { DISTRESS_KEYWORDS, useVoiceDistressDetection } from '@/hooks/useVoiceDistressDetection'

interface AudioRecorderModalProps {
  isOpen: boolean
  onClose: () => void
  onTriggerSOS?: () => void
}

interface AudioRecording {
  id: string
  url: string
  date: string
  duration: number
}

export const AudioRecorderModal: React.FC<AudioRecorderModalProps> = ({
  isOpen,
  onClose,
  onTriggerSOS,
}) => {
  const [activeTab, setActiveTab] = useState<'voice_sos' | 'ambient_record'>('voice_sos')
  const [isRecording, setIsRecording] = useState<boolean>(false)
  const [isPaused, setIsPaused] = useState<boolean>(false)
  const [recordingTime, setRecordingTime] = useState<number>(0)
  const [recordings, setRecordings] = useState<AudioRecording[]>([])
  const [permissionError, setPermissionError] = useState<string | null>(null)
  const [sosTriggeredNotice, setSosTriggeredNotice] = useState<string | null>(null)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  // Voice SOS Keyword Detection Hook
  const {
    isListening,
    isSupported: isSpeechSupported,
    lastTranscript,
    detectedKeyword,
    startListening,
    stopListening,
    toggleListening,
  } = useVoiceDistressDetection({
    autoStart: false,
    onDistressDetected: (keyword) => {
      setSosTriggeredNotice(`🚨 Distress Keyword Detected: "${keyword.toUpperCase()}"!`)
      if (onTriggerSOS) {
        setTimeout(() => {
          onTriggerSOS()
        }, 1000)
      }
    },
  })

  // Start voice listening when Voice SOS tab is open and modal opens
  useEffect(() => {
    if (isOpen && activeTab === 'voice_sos' && isSpeechSupported && !isListening) {
      startListening()
    }
  }, [isOpen, activeTab, isSpeechSupported])

  // Clear state when modal closes
  const handleClose = () => {
    stopRecording()
    stopListening()
    onClose()
  }

  // Recording duration timer
  useEffect(() => {
    if (isRecording && !isPaused) {
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1)
      }, 1000)
    } else {
      if (timerRef.current) clearInterval(timerRef.current)
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [isRecording, isPaused])

  if (!isOpen) return null

  const startRecording = async () => {
    setPermissionError(null)
    audioChunksRef.current = []

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
        const audioUrl = URL.createObjectURL(audioBlob)
        const newRec: AudioRecording = {
          id: Date.now().toString(),
          url: audioUrl,
          date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          duration: recordingTime,
        }
        setRecordings((prev) => [newRec, ...prev])
        stream.getTracks().forEach((track) => track.stop())
      }

      mediaRecorderRef.current = mediaRecorder
      mediaRecorder.start()
      setIsRecording(true)
      setIsPaused(false)
      setRecordingTime(0)
    } catch (err: unknown) {
      console.error('[Microphone Permission Error]', err)
      setPermissionError('Microphone permission was denied. Please enable microphone access.')
    }
  }

  const pauseRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      if (isPaused) {
        mediaRecorderRef.current.resume()
        setIsPaused(false)
      } else {
        mediaRecorderRef.current.pause()
        setIsPaused(true)
      }
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      setIsPaused(false)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="w-full max-w-md bg-[#0c1728] border border-cyan-500/30 rounded-3xl p-6 shadow-2xl relative text-left"
      >
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-white/5 hover:bg-white/10 text-[#94a3b8] hover:text-white transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-[#00d9d9]">
            <Radio className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-white flex items-center gap-1.5">
              Voice Guard &amp; Audio Capsule
            </h3>
            <p className="text-xs text-[#94a3b8]">
              Hands-free voice SOS triggers &amp; encrypted audio evidence
            </p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center p-1 rounded-xl bg-black/50 border border-white/10 mb-4 text-xs font-bold font-sans">
          <button
            onClick={() => {
              setActiveTab('voice_sos')
              startListening()
            }}
            className={`flex-1 py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'voice_sos'
                ? 'bg-[#00d9d9] text-[#050914] shadow-md'
                : 'text-[#94a3b8] hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" /> Hands-Free Voice SOS
          </button>
          <button
            onClick={() => setActiveTab('ambient_record')}
            className={`flex-1 py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'ambient_record'
                ? 'bg-[#00d9d9] text-[#050914] shadow-md'
                : 'text-[#94a3b8] hover:text-white'
            }`}
          >
            <Mic className="w-3.5 h-3.5" /> Ambient Evidence
          </button>
        </div>

        {permissionError && (
          <div className="mb-4 p-3 bg-red-950/40 border border-red-500/40 rounded-xl text-red-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
            <span>{permissionError}</span>
          </div>
        )}

        {sosTriggeredNotice && (
          <div className="mb-4 p-3 bg-red-950/60 border-2 border-red-500 rounded-xl text-red-200 text-xs font-bold flex items-center gap-2 animate-bounce">
            <Siren className="w-5 h-5 text-red-400 flex-shrink-0 animate-spin" />
            <span>{sosTriggeredNotice}</span>
          </div>
        )}

        {/* TAB 1: HANDS-FREE VOICE SOS KEYWORD DETECTION */}
        {activeTab === 'voice_sos' && (
          <div className="space-y-4 font-sans">
            <div className="p-4 rounded-2xl bg-black/40 border border-white/10 text-center flex flex-col items-center justify-center gap-3">
              <motion.button
                onClick={toggleListening}
                animate={isListening ? { scale: [1, 1.08, 1] } : { scale: 1 }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className={`w-20 h-20 rounded-full flex items-center justify-center border-2 transition-colors ${
                  isListening
                    ? 'bg-emerald-500/20 border-emerald-500 text-[#22c55e] shadow-xl shadow-emerald-500/20'
                    : 'bg-white/5 border-white/20 text-[#94a3b8]'
                }`}
              >
                {isListening ? <Mic className="w-10 h-10" /> : <MicOff className="w-10 h-10" />}
              </motion.button>

              <div>
                <span className="text-xs font-mono font-bold block text-white">
                  {isListening ? '● LISTENING FOR DISTRESS KEYWORDS' : 'VOICE DETECTION PAUSED'}
                </span>
                <small className="text-[11px] text-[#94a3b8]">
                  {isListening
                    ? 'Say "Help", "Bachao", or "Emergency" to instantly activate SOS'
                    : 'Click microphone to arm hands-free trigger'}
                </small>
              </div>

              {/* Live Speech Wave/Transcript */}
              {isListening && (
                <div className="w-full p-2.5 rounded-xl bg-[#090d1a] border border-cyan-500/30 text-xs font-mono text-cyan-300 min-h-[38px] flex items-center justify-center text-center">
                  {lastTranscript ? (
                    <span>&quot;{lastTranscript}&quot;</span>
                  ) : (
                    <span className="text-slate-500 italic">Listening for speech...</span>
                  )}
                </div>
              )}
            </div>

            {/* Keyword Triggers Badge List */}
            <div className="space-y-1.5">
              <small className="text-[10px] font-bold text-[#94a3b8] uppercase tracking-wider block">
                Recognized Distress Keywords
              </small>
              <div className="flex flex-wrap gap-1.5">
                {DISTRESS_KEYWORDS.slice(0, 7).map((kw) => (
                  <span
                    key={kw}
                    className={`text-[11px] font-mono px-2 py-0.5 rounded-md border ${
                      detectedKeyword === kw
                        ? 'bg-red-500/30 border-red-500 text-red-300 font-bold animate-pulse'
                        : 'bg-white/5 border-white/10 text-slate-300'
                    }`}
                  >
                    &quot;{kw}&quot;
                  </span>
                ))}
              </div>
            </div>

            <button
              onClick={() => {
                setSosTriggeredNotice('🚨 Simulated Voice Trigger: "BACHAO"!')
                if (onTriggerSOS) setTimeout(() => onTriggerSOS(), 800)
              }}
              className="w-full p-2.5 rounded-xl bg-red-950/40 hover:bg-red-900/40 border border-red-500/40 text-red-300 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
            >
              <Siren className="w-3.5 h-3.5" /> Test Voice SOS Trigger
            </button>
          </div>
        )}

        {/* TAB 2: AMBIENT AUDIO EVIDENCE RECORDER */}
        {activeTab === 'ambient_record' && (
          <div className="space-y-4 font-sans">
            <div className="flex flex-col items-center justify-center py-4 bg-black/40 rounded-2xl border border-white/5 gap-3">
              {isRecording ? (
                <motion.div
                  animate={isPaused ? { scale: 1 } : { scale: [1, 1.1, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                  className={`w-16 h-16 rounded-full flex items-center justify-center border-2 ${
                    isPaused
                      ? 'bg-amber-500/20 border-amber-500 text-amber-400'
                      : 'bg-red-500/20 border-red-500 text-red-500 shadow-lg shadow-red-500/30'
                  }`}
                >
                  <Mic className="w-8 h-8" />
                </motion.div>
              ) : (
                <div className="w-16 h-16 rounded-full bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-[#00d9d9]">
                  <Mic className="w-8 h-8" />
                </div>
              )}

              <div className="text-2xl font-extrabold font-mono text-white">
                {formatTime(recordingTime)}
              </div>
              <span className="text-[10px] font-bold tracking-widest text-[#94a3b8] uppercase">
                {isRecording
                  ? isPaused
                    ? 'RECORDING PAUSED'
                    : 'RECORDING AMBIENT EVIDENCE'
                  : 'READY TO RECORD EVIDENCE'}
              </span>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center gap-3">
              {!isRecording ? (
                <button
                  onClick={startRecording}
                  className="primary px-6 py-2.5 text-sm font-bold flex items-center gap-2"
                >
                  <Mic className="w-4 h-4" /> Start Audio Record
                </button>
              ) : (
                <>
                  <button
                    onClick={pauseRecording}
                    className="secondary px-4 py-2 text-xs font-bold flex items-center gap-1.5"
                  >
                    {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                    {isPaused ? 'Resume' : 'Pause'}
                  </button>

                  <button
                    onClick={stopRecording}
                    className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md"
                  >
                    <Square className="w-4 h-4 fill-current" /> Save &amp; Stop
                  </button>
                </>
              )}
            </div>

            {/* Saved Audio Clips */}
            {recordings.length > 0 && (
              <div className="space-y-2 pt-3 border-t border-white/10 max-h-36 overflow-y-auto pr-1">
                <small className="text-[10px] font-bold text-[#00d9d9] uppercase block font-mono">
                  Saved Evidence Clips ({recordings.length})
                </small>
                {recordings.map((rec) => (
                  <div
                    key={rec.id}
                    className="p-2.5 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <Volume2 className="w-4 h-4 text-[#00d9d9]" />
                      <div>
                        <b className="text-xs text-white block">Clip {rec.date}</b>
                        <small className="text-[10px] text-[#94a3b8] font-mono">
                          Duration: {formatTime(rec.duration)}
                        </small>
                      </div>
                    </div>
                    <audio src={rec.url} controls className="h-7 w-32" />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </motion.div>
    </div>
  )
}
