'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {
  AlertCircle,
  ArrowRight,
  Eye,
  EyeOff,
  HeartPulse,
  KeyRound,
  Lock,
  Phone,
  Shield,
  ShieldCheck,
  Sparkles,
  User,
  Zap,
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { Screen } from '@/types'

interface AuthScreenProps {
  onSuccess?: () => void
  go?: (s: Screen) => void
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onSuccess, go }) => {
  const { login, register, loginDemo } = useAuth()

  const [activeTab, setActiveTab] = useState<'register' | 'login'>('register')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [age, setAge] = useState<string>('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState<boolean>(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)
    setIsSubmitting(true)

    try {
      if (activeTab === 'register') {
        const parsedAge = parseInt(age, 10)
        if (!name.trim()) {
          setErrorMessage('Please enter your full name')
          setIsSubmitting(false)
          return
        }
        if (!phone.trim()) {
          setErrorMessage('Please enter your 10-digit mobile number')
          setIsSubmitting(false)
          return
        }
        if (isNaN(parsedAge) || parsedAge < 12 || parsedAge > 120) {
          setErrorMessage('Please enter a valid age (minimum 12 years)')
          setIsSubmitting(false)
          return
        }
        if (!password || password.length < 4) {
          setErrorMessage('Password must be at least 4 characters')
          setIsSubmitting(false)
          return
        }

        const res = await register(name, phone, parsedAge, password)
        if (res.success) {
          if (onSuccess) onSuccess()
          if (go) go('home')
        } else {
          setErrorMessage(res.error || 'Failed to create account')
        }
      } else {
        if (!phone.trim() || !password) {
          setErrorMessage('Please enter your phone number and password')
          setIsSubmitting(false)
          return
        }

        const res = await login(phone, password)
        if (res.success) {
          if (onSuccess) onSuccess()
          if (go) go('home')
        } else {
          setErrorMessage(res.error || 'Invalid phone or password')
        }
      }
    } catch (err) {
      setErrorMessage('An unexpected error occurred. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleQuickDemo = async () => {
    setIsSubmitting(true)
    await loginDemo()
    setIsSubmitting(false)
    if (onSuccess) onSuccess()
    if (go) go('home')
  }

  return (
    <div className="min-h-screen w-full flex flex-col justify-center items-center p-4 sm:p-6 bg-[#050914] text-white font-sans relative overflow-hidden">
      {/* Ambient background glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[350px] h-[350px] rounded-full bg-[#00d9d9]/10 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[350px] h-[350px] rounded-full bg-[#3b82f6]/10 blur-[100px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-[#090d1a]/90 backdrop-blur-xl border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl relative z-10"
      >
        {/* SAKHI Logo & Title */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#00d9d9]/20 to-[#3b82f6]/20 border border-[#00d9d9]/40 mb-3 shadow-lg shadow-cyan-500/10">
            <Shield className="w-7 h-7 text-[#00d9d9]" />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-white flex items-center justify-center gap-2">
            SAKHI <span className="text-xs px-2 py-0.5 rounded-full bg-[#00d9d9]/20 text-[#00d9d9] font-mono border border-[#00d9d9]/30">V2.4</span>
          </h1>
          <p className="text-xs text-[#94a3b8] mt-1 font-mono">
            Autonomous Women Safety & Route Security Platform
          </p>
        </div>

        {/* Tab Toggle (Register vs Login) */}
        <div className="grid grid-cols-2 p-1 bg-black/40 rounded-2xl border border-white/10 mb-6 font-mono text-xs">
          <button
            type="button"
            onClick={() => {
              setActiveTab('register')
              setErrorMessage(null)
            }}
            className={`py-2.5 rounded-xl font-bold transition-all ${
              activeTab === 'register'
                ? 'bg-[#00d9d9] text-[#050914] shadow-md shadow-cyan-500/20'
                : 'text-[#94a3b8] hover:text-white'
            }`}
          >
            Create Account
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('login')
              setErrorMessage(null)
            }}
            className={`py-2.5 rounded-xl font-bold transition-all ${
              activeTab === 'login'
                ? 'bg-[#00d9d9] text-[#050914] shadow-md shadow-cyan-500/20'
                : 'text-[#94a3b8] hover:text-white'
            }`}
          >
            Sign In
          </button>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="mb-4 p-3 rounded-xl bg-red-950/60 border border-red-500/50 text-red-300 text-xs flex items-center gap-2 font-mono">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Form Fields */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {activeTab === 'register' && (
            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-[#94a3b8] mb-1">
                Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-[#64748b] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Riya Sharma"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#0f172a] border border-white/10 focus:border-[#00d9d9] rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-[#475569] outline-none transition-colors"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-[11px] font-mono uppercase tracking-wider text-[#94a3b8] mb-1">
              Mobile Phone Number
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-[#64748b] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="tel"
                required
                placeholder="10-digit mobile number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-[#0f172a] border border-white/10 focus:border-[#00d9d9] rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-[#475569] outline-none transition-colors font-mono"
              />
            </div>
          </div>

          {activeTab === 'register' && (
            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-[#94a3b8] mb-1">
                Age
              </label>
              <div className="relative">
                <Sparkles className="w-4 h-4 text-[#64748b] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="number"
                  min="12"
                  max="115"
                  required
                  placeholder="Your age in years (e.g. 21)"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  className="w-full bg-[#0f172a] border border-white/10 focus:border-[#00d9d9] rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-[#475569] outline-none transition-colors font-mono"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-[11px] font-mono uppercase tracking-wider text-[#94a3b8] mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#64748b] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="Secure password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#0f172a] border border-white/10 focus:border-[#00d9d9] rounded-xl pl-10 pr-10 py-2.5 text-sm text-white placeholder-[#475569] outline-none transition-colors font-mono"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748b] hover:text-[#94a3b8]"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full mt-2 py-3 rounded-xl bg-[#00d9d9] hover:bg-[#00f0f0] text-[#050914] font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 transition-all cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? (
              <span className="animate-pulse">Connecting to SAKHI...</span>
            ) : activeTab === 'register' ? (
              <>
                Create Account & Set Contacts <ArrowRight className="w-4 h-4" />
              </>
            ) : (
              <>
                Sign In to SAKHI <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Quick Demo Login Option */}
        <div className="mt-5 pt-4 border-t border-white/10 text-center">
          <p className="text-xs text-[#64748b] mb-2 font-mono">Exploring the platform?</p>
          <button
            type="button"
            onClick={handleQuickDemo}
            className="w-full py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-[#00d9d9] flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <Zap className="w-3.5 h-3.5 text-amber-400" /> 1-Tap Quick Demo (Riya Sharma)
          </button>
        </div>
      </motion.div>
    </div>
  )
}
