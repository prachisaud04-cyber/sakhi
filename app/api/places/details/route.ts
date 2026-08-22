import { NextRequest, NextResponse } from 'next/server'
import { GOOGLE_MAPS_API_KEY } from '@/constants/mapData'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const placeId = searchParams.get('placeId') || searchParams.get('place_id')

  if (!placeId) {
    return NextResponse.json({ error: 'placeId is required' }, { status: 400 })
  }

  const apiKey = GOOGLE_MAPS_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'Google Maps API key missing' }, { status: 500 })
  }

  try {
    const params = new URLSearchParams()
    params.append('place_id', placeId.trim())
    params.append('key', apiKey)
    params.append('fields', 'name,formatted_address,geometry,types,vicinity')

    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/details/json?${params.toString()}`
    )
    const data = await response.json()

    if (data.status === 'OK' && data.result) {
      const res = data.result
      return NextResponse.json({
        success: true,
        place: {
          name: res.name,
          address: res.formatted_address || res.vicinity || '',
          lat: res.geometry?.location?.lat,
          lng: res.geometry?.location?.lng,
          types: res.types || [],
          placeId,
        },
      })
    }

    return NextResponse.json({ success: false, status: data.status, error_message: data.error_message })
  } catch (err: unknown) {
    console.error('[Place Details API Error]', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Place details lookup failed' },
      { status: 500 }
    )
  }
}
