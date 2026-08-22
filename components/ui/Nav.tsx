'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { BarChart3, Home as HomeIcon, MapPin, Route, Users, LucideIcon } from 'lucide-react'
import { NavProps, Screen } from '@/types'

const navItems: [Screen, LucideIcon, string][] = [
  ['home', HomeIcon, 'Home'],
  ['journeys', Route, 'Journeys'],
  ['analytics', BarChart3, 'Analytics'],
  ['map', MapPin, 'Safety map'],
  ['profile', Users, 'Profile'],
]

export const Nav: React.FC<NavProps> = ({ go, screen }) => (
  <nav>
    {navItems.map(([s, Icon, label]) => {
      const isActive = screen === s
      return (
        <button
          className={`relative ${isActive ? 'active' : ''}`}
          onClick={() => go(s)}
          key={s}
        >
          {isActive && (
            <motion.div
              layoutId="activeNavTab"
              className="absolute inset-0 rounded-2xl bg-gradient-to-r from-[#19d3c5]/30 to-[#0891b2]/40 border border-cyan-400/40 shadow-lg shadow-cyan-500/20"
              transition={{ type: 'spring', stiffness: 380, damping: 30 }}
            />
          )}
          <span className="relative z-10 flex flex-col items-center gap-1">
            <Icon className={`transition-transform duration-200 ${isActive ? 'scale-110 text-[#19d3c5]' : ''}`} />
            <small>{label}</small>
          </span>
        </button>
      )
    })}
  </nav>
)
