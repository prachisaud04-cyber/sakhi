'use client'

import React, { useEffect, useRef, useState } from 'react'
import { importLibrary, setOptions } from '@googlemaps/js-api-loader'
import { motion } from 'framer-motion'
import {
  Check,
  Compass,
  Loader2,
  MapPin,
  Navigation,
  Search,
  Sparkles,
  X,
} from 'lucide-react'
import { GPSLocation } from '@/types'
import { GOOGLE_MAPS_API_KEY } from '@/constants/mapData'

interface MapLocationPickerModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  initialLocation?: GPSLocation | null
  onSelectLocation: (data: { name: string; address: string; lat: number; lng: number }) => void
}

let loaderInitialized = false

const PICKER_MAP_STYLES: google.maps.MapTypeStyle[] = [
  { elementType: 'geometry', stylers: [{ color: '#090d1a' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#090d1a' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#cbd5e1' }] },
  { featureType: 'poi', elementType: 'labels.text.fill', stylers: [{ color: '#00d9d9' }] },
  { featureType: 'poi.park', elementType: 'geometry', stylers: [{ color: '#0f172a' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#1a2238' }] },
  { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#1e294b' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#050914' }] },
]

export const MapLocationPickerModal: React.FC<MapLocationPickerModalProps> = ({
  isOpen,
  onClose,
  title,
  initialLocation,
  onSelectLocation,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<google.maps.Map | null>(null)
  const markerRef = useRef<google.maps.Marker | null>(null)
  const geocoderRef = useRef<google.maps.Geocoder | null>(null)

  const [currentCoords, setCurrentCoords] = useState<{ lat: number; lng: number }>({
    lat: initialLocation?.lat || 26.152,
    lng: initialLocation?.lng || 91.664,
  })
  const [selectedPlaceName, setSelectedPlaceName] = useState<string>('Selected Location')
  const [selectedAddress, setSelectedAddress] = useState<string>('Locating on map...')
  const [isGeocoding, setIsGeocoding] = useState<boolean>(false)

  const apiKey = GOOGLE_MAPS_API_KEY

  // Browser Client Reverse Geocode
  const reverseGeocode = (lat: number, lng: number) => {
    setIsGeocoding(true)

    if (geocoderRef.current) {
      geocoderRef.current.geocode(
        { location: { lat, lng } },
        (results, status) => {
          setIsGeocoding(false)
          if (status === google.maps.GeocoderStatus.OK && results && results.length > 0) {
            const top = results[0]
            const name = top.address_components?.[0]?.long_name || top.formatted_address.split(',')[0]
            setSelectedPlaceName(name || 'Selected Map Location')
            setSelectedAddress(top.formatted_address || `${lat.toFixed(5)}°, ${lng.toFixed(5)}°`)
          } else {
            setSelectedPlaceName('Custom Map Point')
            setSelectedAddress(`${lat.toFixed(5)}° N, ${lng.toFixed(5)}° E`)
          }
        }
      )
      return
    }

    setIsGeocoding(false)
    setSelectedPlaceName('Custom Map Point')
    setSelectedAddress(`${lat.toFixed(5)}° N, ${lng.toFixed(5)}° E`)
  }

  // Initialize Map
  useEffect(() => {
    if (!isOpen || !apiKey || !mapContainerRef.current) return

    if (!loaderInitialized) {
      try {
        setOptions({
          key: apiKey,
          v: 'weekly',
          libraries: ['places', 'geometry'],
        })
        loaderInitialized = true
      } catch (e) {
        console.warn('Map loader setOptions notice:', e)
      }
    }

    Promise.all([importLibrary('maps'), importLibrary('marker'), importLibrary('geocoding')]).then(() => {
      if (!mapContainerRef.current) return

      geocoderRef.current = new google.maps.Geocoder()

      const center = {
        lat: initialLocation?.lat || 26.152,
        lng: initialLocation?.lng || 91.664,
      }

      const map = new google.maps.Map(mapContainerRef.current, {
        center,
        zoom: 16,
        styles: PICKER_MAP_STYLES,
        disableDefaultUI: true,
        zoomControl: true,
        gestureHandling: 'greedy',
      })

      mapInstanceRef.current = map

      const marker = new google.maps.Marker({
        position: center,
        map,
        draggable: true,
        title: 'Drag to pinpoint exact location',
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 11,
          fillColor: '#00d9d9',
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 3,
        },
      })
      markerRef.current = marker

      // Geocode initial position
      reverseGeocode(center.lat, center.lng)

      // Listen to map click to reposition marker
      map.addListener('click', (e: google.maps.MapMouseEvent) => {
        if (e.latLng) {
          const lat = e.latLng.lat()
          const lng = e.latLng.lng()
          marker.setPosition({ lat, lng })
          setCurrentCoords({ lat, lng })
          reverseGeocode(lat, lng)
        }
      })

      // Listen to marker drag end
      marker.addListener('dragend', (e: google.maps.MapMouseEvent) => {
        if (e.latLng) {
          const lat = e.latLng.lat()
          const lng = e.latLng.lng()
          setCurrentCoords({ lat, lng })
          reverseGeocode(lat, lng)
        }
      })
    })

    return () => {
      if (markerRef.current) markerRef.current.setMap(null)
    }
  }, [isOpen, apiKey, initialLocation])

  const handleRecenterGps = () => {
    if (initialLocation && mapInstanceRef.current && markerRef.current) {
      const pos = { lat: initialLocation.lat, lng: initialLocation.lng }
      mapInstanceRef.current.panTo(pos)
      mapInstanceRef.current.setZoom(17)
      markerRef.current.setPosition(pos)
      setCurrentCoords(pos)
      reverseGeocode(pos.lat, pos.lng)
    }
  }

  const handleConfirm = () => {
    onSelectLocation({
      name: selectedPlaceName,
      address: selectedAddress,
      lat: currentCoords.lat,
      lng: currentCoords.lng,
    })
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-[#0f172a] border border-cyan-500/40 rounded-2xl max-w-xl w-full shadow-2xl overflow-hidden flex flex-col h-[80vh] relative font-sans"
      >
        {/* Top Header */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between bg-[#090d1a]">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-[#00d9d9]" />
            <b className="text-sm font-extrabold text-white">{title}</b>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#94a3b8] hover:text-white hover:bg-white/10"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Map Container */}
        <div className="relative flex-1">
          <div ref={mapContainerRef} className="w-full h-full" />

          {/* Recenter Button */}
          <button
            type="button"
            onClick={handleRecenterGps}
            className="absolute top-3 right-3 bg-[#090d1a]/95 hover:bg-[#151f38] backdrop-blur-md p-2.5 rounded-full border border-white/20 text-[#00d9d9] shadow-xl z-20"
            title="Recenter on live GPS"
          >
            <Navigation className="w-4 h-4" />
          </button>

          {/* Hint Overlay */}
          <div className="absolute top-3 left-3 bg-[#090d1a]/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 text-[11px] text-[#cbd5e1] font-sans shadow-lg z-20 pointer-events-none">
            💡 Click or drag the pin to any housing society, cafe, or building
          </div>
        </div>

        {/* Bottom Details Drawer */}
        <div className="p-4 border-t border-white/10 bg-[#090d1a] space-y-3">
          <div className="flex items-start gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-[#00d9d9] flex items-center justify-center flex-shrink-0 mt-0.5">
              {isGeocoding ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <MapPin className="w-4 h-4" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <b className="text-sm font-bold text-white block truncate leading-tight">
                {selectedPlaceName}
              </b>
              <small className="text-xs text-[#94a3b8] block truncate mt-0.5">
                {selectedAddress}
              </small>
            </div>
          </div>

          <div className="flex gap-2">
            <button onClick={onClose} className="secondary flex-1 py-2.5 text-xs font-bold">
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              className="primary flex-1 py-2.5 text-xs font-extrabold flex items-center justify-center gap-1.5 shadow-lg"
            >
              <Check className="w-4 h-4" /> Confirm Location
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
