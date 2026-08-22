'use client'

import React, { useState } from 'react'
import { ArrowLeft, Bell, LockKeyhole, ShieldCheck, User, Volume2 } from 'lucide-react'
import { HeaderProps } from '@/types'

export const Header: React.FC<HeaderProps> = ({ title, back }) => {
  const [showProfileMenu, setShowProfileMenu] = useState<boolean>(false)
  const [hasUnreadNotifs, setHasUnreadNotifs] = useState<boolean>(true)

  return (
    <header className="relative z-40">
      {back ? (
        <button className="icon" onClick={back} aria-label="Go back">
          <ArrowLeft />
        </button>
      ) : (
        <div className="brand cursor-pointer">
          <ShieldCheck />
          <b>
            SAKHI<small>SAFETY COMPANION</small>
          </b>
        </div>
      )}

      {title && <h2>{title}</h2>}

      <div className="flex items-center gap-3">
        {/* Notification Bell */}
        <button
          className="icon relative"
          onClick={() => setHasUnreadNotifs(false)}
          title="Notifications"
        >
          <Bell />
          {hasUnreadNotifs && (
            <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-[#00d9d9] animate-ping" />
          )}
        </button>

        {/* Profile Avatar Button */}
        <div className="relative">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="w-10 h-10 rounded-full bg-gradient-to-br from-[#00d9d9] to-[#3b82f6] border-2 border-[#050914] flex items-center justify-center font-extrabold text-[#050914] text-xs shadow-md hover:scale-105 transition-transform"
            title="Profile Menu"
          >
            RS
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-[#0c1728] border border-cyan-500/30 rounded-xl shadow-2xl p-2 z-50 text-xs font-sans">
              <div className="p-2 border-b border-white/10 mb-1">
                <b className="text-white block font-bold">Riya Sharma</b>
                <small className="text-[#00d9d9]">Privacy Protected</small>
              </div>
              <button
                onClick={() => setShowProfileMenu(false)}
                className="w-full text-left px-3 py-2 rounded-lg text-[#cbd5e1] hover:bg-white/10 hover:text-white flex items-center gap-2"
              >
                <User className="w-3.5 h-3.5 text-[#00d9d9]" /> Profile Settings
              </button>
              <button
                onClick={() => setShowProfileMenu(false)}
                className="w-full text-left px-3 py-2 rounded-lg text-[#cbd5e1] hover:bg-white/10 hover:text-white flex items-center gap-2"
              >
                <LockKeyhole className="w-3.5 h-3.5 text-[#00d9d9]" /> Safety Capsule
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
