import React from 'react'
import { cn } from '@/lib/utils'
import { RingProps } from '@/types'

export const Ring: React.FC<RingProps> = ({ score, tone = 'safe' }) => (
  <div className={cn('ring', tone)} style={{ '--score': `${score * 3.6}deg` } as React.CSSProperties}>
    <b>
      {score}
      <small>/100</small>
    </b>
  </div>
)
