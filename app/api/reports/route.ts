import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServerClient, isSupabaseServerConfigured } from '@/lib/supabaseServer'

interface SafetyReportItem {
  id: string
  userName: string
  reason: string
  description?: string
  lat: number
  lng: number
  status: 'pending' | 'investigating' | 'resolved'
  createdAt: string
}

// Fallback in-memory reports store
declare global {
  // eslint-disable-next-line no-var
  var __SAKHI_REPORTS__: SafetyReportItem[] | undefined
}

const memoryReports: SafetyReportItem[] =
  globalThis.__SAKHI_REPORTS__ ?? (globalThis.__SAKHI_REPORTS__ = [])

export async function GET() {
  if (isSupabaseServerConfigured()) {
    const supabase = getSupabaseServerClient()
    if (supabase) {
      const { data, error } = await supabase
        .from('safety_reports')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50)

      if (!error && data) {
        return NextResponse.json({ success: true, reports: data })
      }
    }
  }

  return NextResponse.json({ success: true, reports: memoryReports })
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { reason, description, lat, lng, userName = 'Anonymous User' } = body

    if (!reason || lat === undefined || lng === undefined) {
      return NextResponse.json(
        { error: 'Missing required report fields (reason, lat, lng)' },
        { status: 400 }
      )
    }

    const newReport: SafetyReportItem = {
      id: `rep-${Date.now()}`,
      userName,
      reason,
      description: description || '',
      lat: Number(lat),
      lng: Number(lng),
      status: 'pending',
      createdAt: new Date().toISOString(),
    }

    // Persist to Supabase if configured
    if (isSupabaseServerConfigured()) {
      const supabase = getSupabaseServerClient()
      if (supabase) {
        const { data, error } = await supabase
          .from('safety_reports')
          .insert({
            user_name: userName,
            reason,
            description: description || '',
            lat: Number(lat),
            lng: Number(lng),
            status: 'pending',
          })
          .select()
          .single()

        if (!error && data) {
          return NextResponse.json({ success: true, report: data })
        }
      }
    }

    // Fallback to memory
    memoryReports.unshift(newReport)
    return NextResponse.json({ success: true, report: newReport })
  } catch (err) {
    console.error('[API Reports Error]', err)
    return NextResponse.json({ error: 'Failed to process report' }, { status: 500 })
  }
}
