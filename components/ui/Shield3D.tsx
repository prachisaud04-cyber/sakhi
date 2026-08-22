'use client'

import React, { useEffect, useState } from 'react'
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { ShieldCheck } from 'lucide-react'

interface Shield3DProps {
  onClick?: () => void
  label?: string
  className?: string
}

export const Shield3D: React.FC<Shield3DProps> = ({
  onClick,
  label = 'Safety Check',
  className = '',
}) => {
  const [isReducedMotion, setIsReducedMotion] = useState(false)
  const [isHovered, setIsHovered] = useState<boolean>(false)

  // Mouse position motion values for normalized 3D tilt
  const x = useMotionValue(0)
  const y = useMotionValue(0)

  const mouseX = useSpring(x, { stiffness: 200, damping: 20 })
  const mouseY = useSpring(y, { stiffness: 200, damping: 20 })

  // Clamp rotation strictly to max ±6 degrees
  const rotateX = useTransform(mouseY, [-100, 100], [6, -6])
  const rotateY = useTransform(mouseX, [-100, 100], [-6, 6])

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setIsReducedMotion(mediaQuery.matches)

    const handleMouseMove = (e: MouseEvent) => {
      if (window.innerWidth < 768 || mediaQuery.matches) return
      const rect = document.body.getBoundingClientRect()
      const centerX = rect.width / 2
      const centerY = window.innerHeight / 2
      const deltaX = Math.max(-100, Math.min(100, e.clientX - centerX))
      const deltaY = Math.max(-100, Math.min(100, e.clientY - centerY))
      x.set(deltaX)
      y.set(deltaY)
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [x, y])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      if (onClick) onClick()
    }
  }

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={label}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`relative flex flex-col items-center justify-center cursor-pointer select-none outline-none group focus:ring-2 focus:ring-[#19d3c5] rounded-2xl ${className}`}
    >
      {/* Ambient Lighting Glow */}
      <motion.div
        className="absolute w-24 h-24 rounded-full blur-xl pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(25, 211, 197, 0.35) 0%, transparent 70%)',
        }}
        animate={
          isReducedMotion
            ? {}
            : {
                scale: [1, 1.15, 1],
                opacity: [0.6, 0.9, 0.6],
              }
        }
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Compact 3D Shield Button Frame */}
      <motion.div
        whileHover={{ scale: 1.06, y: -2 }}
        whileTap={{ scale: 0.95 }}
        className="relative w-16 h-16 rounded-2xl flex items-center justify-center border border-[#19d3c5]/40 shadow-xl backdrop-blur-md transition-colors duration-200 group-hover:border-[#19d3c5]"
        style={{
          rotateX: isReducedMotion ? 0 : rotateX,
          rotateY: isReducedMotion ? 0 : rotateY,
          transformStyle: 'preserve-3d',
          background:
            'linear-gradient(135deg, rgba(255, 255, 255, 0.18) 0%, rgba(25, 211, 197, 0.15) 50%, rgba(7, 11, 20, 0.92) 100%)',
          boxShadow:
            '0 10px 25px rgba(0, 0, 0, 0.5), inset 0 1px 1px rgba(255, 255, 255, 0.3), inset 0 -2px 8px rgba(25, 211, 197, 0.3)',
        }}
      >
        <ShieldCheck className="w-8 h-8 text-[#19d3c5] drop-shadow-md group-hover:scale-110 transition-transform duration-200" />
      </motion.div>

      {/* Small Label Underneath */}
      {label && (
        <span className="text-[10px] font-extrabold tracking-wider text-[#94a3b8] uppercase mt-1.5 group-hover:text-white transition-colors duration-200">
          {label}
        </span>
      )}
    </div>
  )
}
