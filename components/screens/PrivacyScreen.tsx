'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { LockKeyhole, ShieldCheck } from 'lucide-react'
import { PrivacyProps } from '@/types'
import { Card } from '@/components/ui/Card'
import { Header } from '@/components/ui/Header'

const steps = [
  'Journey starts',
  'Temporary encrypted safety information',
  'Private by default',
  'Emergency detected',
  'Selected information shared',
  'Journey completed',
]

export const PrivacyScreen: React.FC<PrivacyProps> = ({ goBack }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -10 }}
    transition={{ duration: 0.25 }}
  >
    <Header title="Safety Capsule" back={goBack} />
    <div className="content center">
      <LockKeyhole />
      <small className="eyebrow">PRIVATE BY DESIGN</small>
      <h1>
        Protection when
        <br />
        <em>you need it.</em>
      </h1>
      <p>Privacy when you don&apos;t.</p>
      <Card>
        {steps.map((x) => (
          <div className="step" key={x}>
            <ShieldCheck />
            <b>
              {x}
              <small>Context is held securely, only for this journey.</small>
            </b>
          </div>
        ))}
      </Card>
    </div>
  </motion.div>
)
