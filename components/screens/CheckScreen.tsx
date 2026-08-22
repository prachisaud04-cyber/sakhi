import React from 'react'
import Image from 'next/image'
import { AlertTriangle, ArrowLeft, Check as CheckIcon, Siren } from 'lucide-react'
import { CheckProps } from '@/types'
import { Card } from '@/components/ui/Card'
import { Pill } from '@/components/ui/Pill'

export const CheckScreen: React.FC<CheckProps> = ({ go, goBack, score, mode }) => (
  <div className="focused">
    <div className="top">
      <div className="brand">
        <Image src="/sakhi-logo.png" alt="SAKHI" width={64} height={40} className="h-10 w-16 object-contain" />
        <b>SAKHI</b>
      </div>
      <button className="icon" onClick={goBack} aria-label="Go back">
        <ArrowLeft />
      </button>
    </div>
    <div className="check">
      <AlertTriangle />
      <Pill tone="warn">Potential risk detected</Pill>
      <h1>
        Are you
        <br />
        <em>okay?</em>
      </h1>
      <p>We noticed unusual activity during your journey.</p>
      <Card>
        <b>Detected signals</b>
        <p>
          Route deviation · Unexpected stop · Higher-risk area
          {mode === 'critical' ? ' · Unusual movement' : ''}
        </p>
        <strong>Potential risk · {score}/100</strong>
      </Card>
      <button className="primary" onClick={() => go('live')}>
        <CheckIcon />
        I&apos;m Safe
      </button>
      <button className="secondary" onClick={() => go('emergency')}>
        <Siren />I Need Help
      </button>
      <button className="quiet" onClick={() => go('emergency')}>
        Can&apos;t respond
      </button>
    </div>
  </div>
)
