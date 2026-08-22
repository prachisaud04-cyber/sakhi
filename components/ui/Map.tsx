import React from 'react'
import { MapProps } from '@/types'
import { RealGoogleMap } from './RealGoogleMap'

export const Map: React.FC<MapProps> = ({
  danger = false,
  location = null,
  status = 'idle',
  error = null,
  isTracking = false,
  onRequestPermission,
  locationSharingEnabled = true,
  height = '300px',
  className = '',
}) => {
  return (
    <RealGoogleMap
      danger={danger}
      location={location}
      status={status}
      error={error}
      isTracking={isTracking}
      onRequestPermission={onRequestPermission}
      locationSharingEnabled={locationSharingEnabled}
      height={height}
      className={className}
    />
  )
}
