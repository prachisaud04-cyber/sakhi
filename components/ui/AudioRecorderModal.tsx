'use client'

import React, { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { AlertCircle, Mic, MicOff, Pause, Play, Square, Volume2, X } from 'lucide-react'

interface AudioRecorderModalProps {
  isOpen: boolean
  onClose: () => void
}

interface AudioRecording {
  id: string
  url: string
  date: string
  duration: number
}

export const AudioRecorderModal: React.FC<AudioRecorderModalProps> = ({ isOpen, onClose }) => {
  const [isRecording, setIsRecording] = useState<boolean>(false)
  const [isPaused, setIsPaused] = useState<boolean>(false)
  const [recordingTime, setRecordingTime] = useState<number>(0)
  const [recordings, setRecordings] = useState<AudioRecording[]>([])
  const [permissionError, setPermissionError] = useState<string | null>(null)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  // Clear state when modal closes
  const handleClose = () => {
    stopRecording()
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
        // Stop all stream tracks to release microphone
        stream.getTracks().forEach((track) => track.stop())
      }

      mediaRecorderRef.current = mediaRecorder
      mediaRecorder.start()
      setIsRecording(true)
      setIsPaused(false)
      setRecordingTime(0)
    } catch (err: unknown) {
      console.error('[Audio Recording Error]', err)
      setPermissionError('Microphone permission denied or audio recording is unsupported on this device.')
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

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60)
    const s = secs % 60
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-[#0f172a] border border-cyan-500/30 rounded-2xl p-6 max-w-md w-full shadow-2xl relative"
      >
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-[#94a3b8] hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        <b className="text-xl font-bold text-white flex items-center gap-2 mb-1">
          <Mic className="w-6 h-6 text-[#19d3c5]" /> Safety Audio Recorder
        </b>
        <p className="text-xs text-[#94a3b8] mb-4">
          Record background ambient audio securely on your device during potential safety concerns.
        </p>

        {permissionError && (
          <div className="p-3 bg-red-950/40 border border-red-500/30 rounded-xl text-red-300 text-xs font-semibold flex items-center gap-2 mb-4">
            <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
            <span>{permissionError}</span>
          </div>
        )}

        {/* Recording Canvas / Pulse */}
        <div className="p-6 bg-black/40 border border-white/10 rounded-xl flex flex-col items-center justify-center space-y-3 mb-4">
          {isRecording ? (
            <motion.div
              animate={isPaused ? {} : { scale: [1, 1.2, 1] }}
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
            <div className="w-16 h-16 rounded-full bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-[#19d3c5]">
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
                : 'RECORDING AMBIENT AUDIO'
              : 'READY TO RECORD'}
          </span>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-3 mb-6">
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

        {/* Saved Audio Clips List */}
        {recordings.length > 0 && (
          <div className="space-y-2 pt-3 border-t border-white/10 max-h-36 overflow-y-auto pr-1">
            <small className="text-[10px] font-bold text-[#19d3c5] uppercase block font-mono">
              Saved Safety Clips ({recordings.length})
            </small>
            {recordings.map((rec) => (
              <div
                key={rec.id}
                className="p-2.5 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <Volume2 className="w-4 h-4 text-[#19d3c5]" />
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
      </motion.div>
    </div>
  )
}
