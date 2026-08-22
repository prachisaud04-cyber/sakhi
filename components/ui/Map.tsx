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
  showSafeZones = true,
  showRoutes = false,
  selectedRouteId,
  destinationName,
  interactive = true,
  origin,
  destination,
  originCoords,
  destinationCoords,
  onRoutesCalculated,
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
      showSafeZones={showSafeZones}
      showRoutes={showRoutes}
      selectedRouteId={selectedRouteId}
      destinationName={destinationName}
      interactive={interactive}
      origin={origin}
      destination={destination}
      originCoords={originCoords}
      destinationCoords={destinationCoords}
      onRoutesCalculated={onRoutesCalculated}
    />
  )
}
