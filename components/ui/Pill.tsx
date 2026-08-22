import React from 'react'
import { cn } from '@/lib/utils'
import { PillProps } from '@/types'

export const Pill: React.FC<PillProps> = ({ children, tone = 'safe' }) => (
  <span className={cn('pill', tone)}>
    <i />
    {children}
  </span>
)
