'use client'

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { importLibrary, setOptions } from '@googlemaps/js-api-loader'
import {
  Building,
  Building2,
  Check,
  Coffee,
  Compass,
  GraduationCap,
  Home,
  Hospital,
  Loader2,
  Map as MapIcon,
  MapPin,
  Navigation,
  Search,
  Shield,
  ShoppingBag,
  Sparkles,
  Train,
  X,
} from 'lucide-react'
import { GPSLocation } from '@/types'
import { SAFETY_POIS } from '@/constants/mapData'
import { JALUKBARI_AND_GUWAHATI_DIRECTORY } from '@/constants/jalukbariData'
import { MapLocationPickerModal } from '@/components/ui/MapLocationPickerModal'

export interface PlaceSelection {
  name: string
  address: string
  lat?: number
  lng?: number
  placeId?: string
}

interface PlaceAutocompleteInputProps {
  label: string
  value: string
  onChange: (value: string, selection?: PlaceSelection) => void
  placeholder?: string
  icon?: React.ReactNode
  userLocation?: GPSLocation | null
  showGpsButton?: boolean
  onUseCurrentGps?: () => void
  className?: string
}

interface SuggestionItem {
  placeId: string
  mainText: string
  secondaryText: string
  fullText: string
  types?: string[]
  category?: string
  isSafetyPOI?: boolean
  lat?: number
  lng?: number
}

let loaderInitialized = false

function getPlaceTypeIcon(types: string[] = [], category?: string) {
  if (category === 'cafe' || types.some((t) => t.includes('cafe') || t.includes('restaurant') || t.includes('food'))) {
    return <Coffee className="w-3.5 h-3.5 text-amber-400" />
  }
  if (category === 'housing' || types.some((t) => t.includes('residential') || t.includes('housing') || t.includes('sublocality'))) {
    return <Home className="w-3.5 h-3.5 text-cyan-400" />
  }
  if (category === 'mall' || types.some((t) => t.includes('shopping') || t.includes('store') || t.includes('mall'))) {
    return <ShoppingBag className="w-3.5 h-3.5 text-pink-400" />
  }
  if (category === 'hospital' || types.some((t) => t.includes('hospital') || t.includes('health') || t.includes('doctor'))) {
    return <Hospital className="w-3.5 h-3.5 text-emerald-400" />
  }
  if (category === 'campus' || types.some((t) => t.includes('university') || t.includes('school'))) {
    return <GraduationCap className="w-3.5 h-3.5 text-purple-400" />
  }
  if (category === 'police' || types.some((t) => t.includes('police'))) {
    return <Shield className="w-3.5 h-3.5 text-blue-400" />
  }
  if (category === 'transit' || types.some((t) => t.includes('transit') || t.includes('station') || t.includes('bus'))) {
    return <Train className="w-3.5 h-3.5 text-blue-300" />
  }
  return <MapPin className="w-3.5 h-3.5 text-[#00d9d9]" />
}

export const PlaceAutocompleteInput: React.FC<PlaceAutocompleteInputProps> = ({
  label,
  value,
  onChange,
  placeholder = 'Search Jalukbari cafes, housing societies, malls, or address...',
  icon,
  userLocation,
  showGpsButton = false,
  onUseCurrentGps,
  className = '',
}) => {
  const [inputValue, setInputValue] = useState<string>(value)
  const [isOpen, setIsOpen] = useState<boolean>(false)
  const [suggestions, setSuggestions] = useState<SuggestionItem[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [isGpsLoading, setIsGpsLoading] = useState<boolean>(false)
  const [selectedIndex, setSelectedIndex] = useState<number>(-1)
  const [isMapPickerOpen, setIsMapPickerOpen] = useState<boolean>(false)

  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const autocompleteServiceRef = useRef<google.maps.places.AutocompleteService | null>(null)
  const placesServiceRef = useRef<google.maps.places.PlacesService | null>(null)
  const geocoderRef = useRef<google.maps.Geocoder | null>(null)
  const dummyDivRef = useRef<HTMLDivElement | null>(null)
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null)

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''

  // Sync external value changes
  useEffect(() => {
    setInputValue(value)
  }, [value])

  // Initialize Client Google Maps Places Service
  useEffect(() => {
    if (!apiKey) return

    if (!loaderInitialized) {
      try {
        setOptions({
          key: apiKey,
          v: 'weekly',
          libraries: ['places', 'geometry'],
        })
        loaderInitialized = true
      } catch (e) {
        console.warn('Google Maps setOptions notice:', e)
      }
    }

    importLibrary('places')
      .then(() => {
        autocompleteServiceRef.current = new google.maps.places.AutocompleteService()
        geocoderRef.current = new google.maps.Geocoder()
        if (!dummyDivRef.current && typeof document !== 'undefined') {
          const div = document.createElement('div')
          dummyDivRef.current = div
          placesServiceRef.current = new google.maps.places.PlacesService(div)
        }
      })
      .catch((err) => console.warn('[Google Places Init Error]', err))
  }, [apiKey])

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleOutsideClick)
    return () => document.removeEventListener('mousedown', handleOutsideClick)
  }, [])

  // Search logic: combines Google Places Autocomplete API + Jalukbari Directory + Safety POIs
  const fetchPlaces = useCallback(
    (query: string) => {
      const lower = query.toLowerCase().trim()

      if (!lower) {
        // Show prominent Jalukbari and Guwahati spots on initial focus
        setSuggestions(JALUKBARI_AND_GUWAHATI_DIRECTORY.slice(0, 10))
        setIsLoading(false)
        return
      }

      setIsLoading(true)

      // 1. Direct match on local Jalukbari & Guwahati Directory
      const matchingDirectory: SuggestionItem[] = JALUKBARI_AND_GUWAHATI_DIRECTORY.filter(
        (item) =>
          item.mainText.toLowerCase().includes(lower) ||
          item.secondaryText.toLowerCase().includes(lower) ||
          item.fullText.toLowerCase().includes(lower) ||
          item.types.some((t) => t.toLowerCase().includes(lower))
      )

      const matchingPOIs: SuggestionItem[] = SAFETY_POIS.filter(
        (p) =>
          p.name.toLowerCase().includes(lower) ||
          p.address.toLowerCase().includes(lower)
      ).map((p) => ({
        placeId: p.id,
        mainText: p.name,
        secondaryText: p.address,
        fullText: `${p.name}, ${p.address}`,
        category: p.type,
        isSafetyPOI: true,
        lat: p.lat,
        lng: p.lng,
      }))

      // 2. Query Google Places Autocomplete API in parallel
      if (autocompleteServiceRef.current) {
        try {
          const biasLat = userLocation?.lat || 26.152 // Jalukbari bias
          const biasLng = userLocation?.lng || 91.664

          autocompleteServiceRef.current.getPlacePredictions(
            {
              input: query,
              componentRestrictions: { country: 'in' },
              locationBias: new google.maps.LatLng(biasLat, biasLng),
            },
            (predictions, status) => {
              setIsLoading(false)
              let googleItems: SuggestionItem[] = []

              if (status === google.maps.places.PlacesServiceStatus.OK && predictions) {
                googleItems = predictions.map((p) => ({
                  placeId: p.place_id,
                  mainText: p.structured_formatting.main_text,
                  secondaryText: p.structured_formatting.secondary_text || '',
                  fullText: p.description,
                  types: p.types || [],
                }))
              }

              // Merge local directory matches first, then Google Places items
              const combined = [...matchingDirectory, ...matchingPOIs, ...googleItems]
              // De-duplicate by mainText
              const seen = new Set<string>()
              const unique = combined.filter((item) => {
                const k = item.mainText.toLowerCase()
                if (seen.has(k)) return false
                seen.add(k)
                return true
              })

              setSuggestions(unique.length > 0 ? unique : JALUKBARI_AND_GUWAHATI_DIRECTORY.slice(0, 8))
            }
          )
          return
        } catch (e) {
          console.warn('[Autocomplete Fetch Warning]', e)
        }
      }

      // If Google Maps SDK still loading, use local directory immediately
      const merged = [...matchingDirectory, ...matchingPOIs]
      setSuggestions(merged.length > 0 ? merged : JALUKBARI_AND_GUWAHATI_DIRECTORY.slice(0, 8))
      setIsLoading(false)
    },
    [userLocation]
  )

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setInputValue(val)
    onChange(val)
    setIsOpen(true)
    setSelectedIndex(-1)

    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current)
    debounceTimerRef.current = setTimeout(() => {
      fetchPlaces(val)
    }, 120)
  }

  const handleInputFocus = () => {
    setIsOpen(true)
    fetchPlaces(inputValue)
  }

  const handleSelectSuggestion = (item: SuggestionItem) => {
    setInputValue(item.fullText)
    setIsOpen(false)

    // Pre-computed coords
    if (item.lat && item.lng) {
      onChange(item.fullText, {
        name: item.mainText,
        address: item.secondaryText,
        lat: item.lat,
        lng: item.lng,
        placeId: item.placeId,
      })
      return
    }

    // Lookup precise geometry details from Google PlacesService
    if (placesServiceRef.current && item.placeId && !item.placeId.startsWith('jaluk-')) {
      try {
        placesServiceRef.current.getDetails(
          {
            placeId: item.placeId,
            fields: ['geometry', 'formatted_address', 'name'],
          },
          (place, status) => {
            if (
              status === google.maps.places.PlacesServiceStatus.OK &&
              place &&
              place.geometry?.location
            ) {
              onChange(item.fullText, {
                name: place.name || item.mainText,
                address: place.formatted_address || item.secondaryText,
                lat: place.geometry.location.lat(),
                lng: place.geometry.location.lng(),
                placeId: item.placeId,
              })
            } else {
              onChange(item.fullText, {
                name: item.mainText,
                address: item.secondaryText,
                placeId: item.placeId,
              })
            }
          }
        )
        return
      } catch (e) {
        console.warn('Place details lookup warning:', e)
      }
    }

    onChange(item.fullText, {
      name: item.mainText,
      address: item.secondaryText,
      placeId: item.placeId,
    })
  }

  // Direct Live GPS Trigger with reverse geocoding
  const handleDirectGps = () => {
    setIsGpsLoading(true)

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude
          const lng = pos.coords.longitude

          // Reverse geocode
          if (geocoderRef.current) {
            geocoderRef.current.geocode({ location: { lat, lng } }, (results, status) => {
              setIsGpsLoading(false)
              if (status === google.maps.GeocoderStatus.OK && results && results.length > 0) {
                const top = results[0]
                const name = top.address_components?.[0]?.long_name || 'Live Location'
                const full = top.formatted_address || `Jalukbari, Guwahati (${lat.toFixed(4)}°, ${lng.toFixed(4)}°)`
                setInputValue(full)
                onChange(full, {
                  name,
                  address: full,
                  lat,
                  lng,
                })
              } else {
                const fallback = `Jalukbari, Guwahati (${lat.toFixed(4)}°, ${lng.toFixed(4)}°)`
                setInputValue(fallback)
                onChange(fallback, {
                  name: 'Live GPS Location',
                  address: fallback,
                  lat,
                  lng,
                })
              }
            })
          } else {
            setIsGpsLoading(false)
            const fallback = `Current Location (${lat.toFixed(4)}°, ${lng.toFixed(4)}°)`
            setInputValue(fallback)
            onChange(fallback, {
              name: 'Live GPS Location',
              address: fallback,
              lat,
              lng,
            })
          }

          if (onUseCurrentGps) onUseCurrentGps()
        },
        (err) => {
          console.warn('Direct GPS error:', err)
          setIsGpsLoading(false)
          // Fallback to Jalukbari default
          const jalukbariDefault = 'Gauhati University, Jalukbari, Guwahati'
          setInputValue(jalukbariDefault)
          onChange(jalukbariDefault, {
            name: 'Gauhati University',
            address: 'Jalukbari, Guwahati 781014',
            lat: 26.152,
            lng: 91.664,
          })
          if (onUseCurrentGps) onUseCurrentGps()
        },
        { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
      )
    } else {
      setIsGpsLoading(false)
      if (onUseCurrentGps) onUseCurrentGps()
    }
  }

  const handleClear = () => {
    setInputValue('')
    onChange('')
    setIsOpen(false)
    if (inputRef.current) inputRef.current.focus()
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen || suggestions.length === 0) return

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : 0))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : suggestions.length - 1))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
        handleSelectSuggestion(suggestions[selectedIndex])
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false)
    }
  }

  const handleMapPickerConfirm = (data: {
    name: string
    address: string
    lat: number
    lng: number
  }) => {
    const text = `${data.name}, ${data.address}`
    setInputValue(text)
    onChange(text, {
      name: data.name,
      address: data.address,
      lat: data.lat,
      lng: data.lng,
    })
  }

  return (
    <div ref={containerRef} className={`relative font-sans space-y-1.5 ${className}`}>
      {/* Top Label & Quick Actions */}
      <div className="flex items-center justify-between">
        <label className="text-xs font-extrabold text-white flex items-center gap-1.5 uppercase tracking-wide">
          {icon || <MapPin className="w-3.5 h-3.5 text-[#00d9d9]" />} {label}
        </label>

        <div className="flex items-center gap-2">
          {showGpsButton && (
            <button
              type="button"
              onClick={handleDirectGps}
              disabled={isGpsLoading}
              className="text-[11px] font-bold text-[#00d9d9] hover:underline flex items-center gap-1 cursor-pointer bg-cyan-950/40 px-2 py-0.5 rounded-lg border border-cyan-500/30"
              title="Get exact GPS coordinates"
            >
              {isGpsLoading ? (
                <Loader2 className="w-3 h-3 animate-spin text-[#00d9d9]" />
              ) : (
                <Compass className="w-3 h-3 text-[#00d9d9]" />
              )}
              {isGpsLoading ? 'Locating...' : 'Live GPS'}
            </button>
          )}

          <button
            type="button"
            onClick={() => setIsMapPickerOpen(true)}
            className="text-[11px] font-bold text-[#22c55e] hover:underline flex items-center gap-1 cursor-pointer bg-emerald-950/40 px-2 py-0.5 rounded-lg border border-emerald-500/30"
            title="Pick exact building, cafe or society on Google Map"
          >
            <MapIcon className="w-3 h-3 text-[#22c55e]" /> Pick on Map
          </button>
        </div>
      </div>

      {/* Input Field */}
      <div className="relative flex items-center">
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full bg-[#0c1728] border border-cyan-500/30 rounded-xl py-3 pl-3 pr-10 text-white text-xs font-sans outline-none focus:border-[#00d9d9] focus:ring-1 focus:ring-[#00d9d9]/40 transition-all shadow-inner placeholder:text-[#64748b]"
        />

        <div className="absolute right-3 flex items-center gap-1.5 text-[#94a3b8]">
          {isLoading && <Loader2 className="w-4 h-4 animate-spin text-[#00d9d9]" />}
          {inputValue && !isLoading && (
            <button
              type="button"
              onClick={handleClear}
              className="text-[#94a3b8] hover:text-white transition-colors"
              title="Clear input"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Real-Time Predictions Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-[#0c1728]/98 backdrop-blur-xl border border-cyan-500/40 rounded-2xl p-2 shadow-2xl max-h-72 overflow-y-auto text-xs animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="flex items-center justify-between px-2 py-1 border-b border-white/5 mb-1 text-[10px] font-mono text-[#94a3b8]">
            <span className="flex items-center gap-1 text-[#00d9d9]">
              <Sparkles className="w-3 h-3" /> JALUKBARI &amp; GUWAHATI PLACES
            </span>
            <button
              type="button"
              onClick={() => {
                setIsOpen(false)
                setIsMapPickerOpen(true)
              }}
              className="text-[#22c55e] hover:underline font-bold"
            >
              🗺️ Pick Point on Map ↗
            </button>
          </div>

          <div className="space-y-1">
            {suggestions.map((item, index) => {
              const isSelected = selectedIndex === index

              return (
                <div
                  key={`${item.placeId}-${index}`}
                  onClick={() => handleSelectSuggestion(item)}
                  className={`p-2.5 rounded-xl cursor-pointer transition-all flex items-start gap-2.5 ${
                    isSelected
                      ? 'bg-cyan-950/70 border border-cyan-500/50 text-white shadow-md'
                      : 'hover:bg-white/5 border border-transparent text-[#cbd5e1]'
                  }`}
                >
                  <div className="w-7 h-7 rounded-lg bg-black/40 border border-white/10 flex items-center justify-center flex-shrink-0 mt-0.5 shadow-inner">
                    {getPlaceTypeIcon(item.types, item.category)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <b className="text-xs text-white block leading-tight truncate">
                      {item.mainText}
                    </b>
                    {item.secondaryText && (
                      <small className="text-[10px] text-[#94a3b8] block truncate mt-0.5">
                        {item.secondaryText}
                      </small>
                    )}
                  </div>

                  {item.isSafetyPOI && (
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/15 text-[#22c55e] border border-emerald-500/30 font-bold flex-shrink-0">
                      SAFE SPOT
                    </span>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Interactive Map Location Picker Modal */}
      <MapLocationPickerModal
        isOpen={isMapPickerOpen}
        onClose={() => setIsMapPickerOpen(false)}
        title={`Pinpoint on Map: ${label}`}
        initialLocation={userLocation}
        onSelectLocation={handleMapPickerConfirm}
      />
    </div>
  )
}
