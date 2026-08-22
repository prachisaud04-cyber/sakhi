import React from 'react'
import { ArrowLeft, Clock3, MapPin, Navigation, Phone, ShieldCheck } from 'lucide-react'
import { ContactProps } from '@/types'
import { Card } from '@/components/ui/Card'
import { Map } from '@/components/ui/Map'
import { Pill } from '@/components/ui/Pill'
import { Ring } from '@/components/ui/Ring'

export const ContactScreen: React.FC<ContactProps> = ({ goBack, score, location }) => (
  <div className="focused">
    <div className="top">
      <div className="brand">
        <ShieldCheck />
        <b>SAKHI</b>
      </div>
      <button className="icon" onClick={goBack} aria-label="Go back">
        <ArrowLeft />
      </button>
    </div>
    <div className="check">
      <small className="eyebrow danger-text">SAKHI EMERGENCY ALERT</small>
      <Pill tone="danger">Potential Emergency Detected</Pill>
      <h1>Riya needs help</h1>
      <p>An emergency protocol was activated during her Safety Journey.</p>
      <Map danger location={location} height="260px" />
      <Card>
        <small>SHARED SAFETY INFORMATION</small>
        <div className="summary">
          <Ring score={score} tone="danger" />
          <b>
            Potential emergency<small>No response after safety check</small>
          </b>
        </div>
        <p>
          <MapPin /> Narengi, Bengaluru
        </p>
        <p>
          <Clock3 /> Last confirmed safe · 8:47 PM
        </p>
      </Card>
      <button className="primary">
        <Phone />
        Call Riya
      </button>
      <button className="secondary">
        <Navigation />
        View live location
      </button>
    </div>
  </div>
)
