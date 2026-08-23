'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Bell, HeartHandshake, LockKeyhole, LogOut, Moon, Sun, User } from 'lucide-react'
import { HeaderProps } from '@/types'
import { useAuth } from '@/contexts/AuthContext'
import { useTheme } from '@/contexts/ThemeContext'
import { NotificationCenterModal } from '@/components/ui/NotificationCenterModal'

export const Header: React.FC<HeaderProps> = ({ title, back }) => {
  const { user, logout, openEmergencySetupModal } = useAuth()
  const { theme, resolvedTheme, toggleTheme, setTheme } = useTheme()
  const [showProfileMenu, setShowProfileMenu] = useState<boolean>(false)
  const [hasUnreadNotifs, setHasUnreadNotifs] = useState<boolean>(true)
  const [showNotifications, setShowNotifications] = useState<boolean>(false)

  const userInitials = user?.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'PS'

  return (
    <>
      <header className="relative z-40">
        {back ? (
          <button className="icon" onClick={back} aria-label="Go back">
            <ArrowLeft />
          </button>
        ) : (
          <div className="brand cursor-pointer">
            <img
              src="/sakhi-logo.png"
              alt="SAKHI Logo"
              className="w-10 h-10 object-contain"
            />
            <b>
              SAKHI<small>SAFETY COMPANION</small>
            </b>
          </div>
        )}

        {title && <h2>{title}</h2>}

        <div className="flex items-center gap-2 sm:gap-3">
          {/* Light / Dark Mode Toggle Button */}
          <button
            type="button"
            className="icon"
            onClick={toggleTheme}
            title={resolvedTheme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Cyber Mode'}
            aria-label="Toggle theme"
          >
            {resolvedTheme === 'dark' ? (
              <Sun className="w-5 h-5 text-amber-300 hover:rotate-45 transition-transform" />
            ) : (
              <Moon className="w-5 h-5 text-indigo-600 hover:-rotate-12 transition-transform" />
            )}
          </button>

          {/* Notification Bell Button */}
          <button
            className="icon relative"
            onClick={() => {
              setShowNotifications(true)
              setHasUnreadNotifs(false)
            }}
            title="Open Notifications"
            aria-label="Open Notifications"
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
              className="w-10 h-10 rounded-full bg-gradient-to-br from-[#00d9d9] to-[#3b82f6] border-2 border-[#050914] flex items-center justify-center font-extrabold text-[#050914] text-xs shadow-md hover:scale-105 transition-transform font-mono cursor-pointer"
              title="Profile Menu"
            >
              {userInitials}
            </button>

            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-[#0c1728] dark:bg-[#0c1728] light:bg-white border border-cyan-500/30 rounded-2xl shadow-2xl p-2.5 z-50 text-xs font-sans">
                <div className="p-2 border-b border-white/10 mb-1">
                  <b className="text-white block font-bold truncate">{user?.name || 'Prachi Saud'}</b>
                  <small className="text-[#00d9d9] font-mono block truncate">
                    {user?.phone || '+91 88227 17429'}
                  </small>
                  {user?.age && (
                    <small className="text-[#94a3b8] font-mono block">Age: {user.age} yrs</small>
                  )}
                </div>

                {/* Theme Selector inside Menu */}
                <div className="p-2 border-b border-white/10 mb-1">
                  <span className="text-[10px] text-[#94a3b8] font-mono uppercase tracking-wider block mb-1.5">
                    Theme Mode
                  </span>
                  <div className="grid grid-cols-2 gap-1 bg-black/30 p-1 rounded-xl">
                    <button
                      onClick={() => setTheme('dark')}
                      className={`py-1 rounded-lg font-bold flex items-center justify-center gap-1 transition-all ${
                        theme === 'dark' ? 'bg-[#00d9d9] text-[#050914]' : 'text-[#94a3b8] hover:text-white'
                      }`}
                    >
                      <Moon className="w-3 h-3" /> Dark
                    </button>
                    <button
                      onClick={() => setTheme('light')}
                      className={`py-1 rounded-lg font-bold flex items-center justify-center gap-1 transition-all ${
                        theme === 'light' ? 'bg-[#00d9d9] text-[#050914]' : 'text-[#94a3b8] hover:text-white'
                      }`}
                    >
                      <Sun className="w-3 h-3" /> Light
                    </button>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setShowProfileMenu(false)
                    openEmergencySetupModal()
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl text-[#cbd5e1] hover:bg-white/10 hover:text-white flex items-center gap-2 cursor-pointer transition-colors"
                >
                  <HeartHandshake className="w-3.5 h-3.5 text-[#00d9d9]" /> Emergency Contacts
                </button>
                <button
                  onClick={() => {
                    setShowProfileMenu(false)
                    if (confirm('Sign out of SAKHI profile?')) {
                      logout()
                    }
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl text-red-400 hover:bg-red-500/10 hover:text-red-300 flex items-center gap-2 cursor-pointer transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" /> Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Notification Center Modal */}
      <NotificationCenterModal
        isOpen={showNotifications}
        onClose={() => setShowNotifications(false)}
        onUnreadChange={(hasUnread) => setHasUnreadNotifs(hasUnread)}
      />
    </>
  )
}
