'use client'

import React, { useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

export interface CardProps {
  children: React.ReactNode
  className?: string
  onClick?: () => void
  noTilt?: boolean
}

export const Card: React.FC<CardProps> = ({ children, className = '', onClick, noTilt = false }) => {
  const cardRef = useRef<HTMLDivElement>(null)
  const [rotateX, setRotateX] = useState(0)
  const [rotateY, setRotateY] = useState(0)

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (noTilt || !cardRef.current || window.innerWidth < 768) return

    // Check if target or parent has data-no-tilt attribute
    const target = e.target as HTMLElement
    if (target.closest('[data-no-tilt]')) {
      setRotateX(0)
      setRotateY(0)
      return
    }

    const rect = cardRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    // Normalize cursor position to [-1, 1]
    const percentX = (x / rect.width) * 2 - 1
    const percentY = (y / rect.height) * 2 - 1

    // Strictly map and clamp rotation to max ±3 degrees
    const rY = Math.max(-3, Math.min(3, percentX * 3))
    const rX = Math.max(-3, Math.min(3, -percentY * 3))

    setRotateX(rX)
    setRotateY(rY)
  }

  const handleMouseLeave = () => {
    setRotateX(0)
    setRotateY(0)
  }

  return (
    <motion.div
      ref={cardRef}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      animate={{
        rotateX,
        rotateY,
      }}
      transition={{
        type: 'spring',
        stiffness: 300,
        damping: 20,
      }}
      style={{
        transformStyle: 'preserve-3d',
        perspective: 1000,
      }}
      className={cn('card', onClick && 'clickable', className)}
    >
      <div style={{ transform: 'translateZ(10px)' }}>{children}</div>
    </motion.div>
  )
}
