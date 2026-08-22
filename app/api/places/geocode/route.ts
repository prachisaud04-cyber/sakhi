import { NextRequest, NextResponse } from 'next/server'
import { GOOGLE_MAPS_API_KEY } from '@/constants/mapData'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const lat = searchParams.get('lat')
  const lng = searchParams.get('lng')

  if (!lat || !lng) {
    return NextResponse.json({ error: 'lat and lng are required' }, { status: 400 })
  }

  const apiKey = GOOGLE_MAPS_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'Google Maps API key missing' }, { status: 500 })
  }

  try {
    const params = new URLSearchParams()
    params.append('latlng', `${lat},${lng}`)
    params.append('key', apiKey)
    params.append('language', 'en')

    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?${params.toString()}`
    )
    const data = await response.json()

    if (data.status === 'OK' && data.results && data.results.length > 0) {
      const top = data.results[0]
      const name = top.address_components?.[0]?.long_name || top.formatted_address.split(',')[0]
      return NextResponse.json({
        success: true,
        formattedAddress: top.formatted_address,
        name,
        placeId: top.place_id,
        lat: Number(lat),
        lng: Number(lng),
      })
    }

    return NextResponse.json({ success: false, status: data.status })
  } catch (err: unknown) {
    console.error('[Geocode API Error]', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Geocoding failed' },
      { status: 500 }
    )
  }
}
