import { NextRequest, NextResponse } from 'next/server'
import { GOOGLE_MAPS_API_KEY } from '@/constants/mapData'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const input = searchParams.get('input') || ''
  const lat = searchParams.get('lat')
  const lng = searchParams.get('lng')

  if (!input || input.trim().length === 0) {
    return NextResponse.json({ predictions: [] })
  }

  const apiKey = GOOGLE_MAPS_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'Google Maps API key missing' }, { status: 500 })
  }

  try {
    const params = new URLSearchParams()
    params.append('input', input.trim())
    params.append('key', apiKey)
    params.append('components', 'country:in')
    params.append('language', 'en')

    if (lat && lng) {
      params.append('location', `${lat},${lng}`)
      params.append('radius', '40000') // 40km bias around user
    }

    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/autocomplete/json?${params.toString()}`
    )
    const data = await response.json()

    if (data.status === 'OK' || data.status === 'ZERO_RESULTS') {
      const predictions = (data.predictions || []).map((p: any) => ({
        placeId: p.place_id,
        mainText: p.structured_formatting?.main_text || p.description,
        secondaryText: p.structured_formatting?.secondary_text || '',
        fullText: p.description,
        types: p.types || [],
      }))
      return NextResponse.json({ success: true, predictions })
    }

    return NextResponse.json({ success: false, status: data.status, error_message: data.error_message, predictions: [] })
  } catch (err: unknown) {
    console.error('[Places Autocomplete API Error]', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Places lookup failed', predictions: [] },
      { status: 500 }
    )
  }
}
