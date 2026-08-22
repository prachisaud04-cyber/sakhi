import { NextRequest, NextResponse } from 'next/server'
import { deleteSession, getSession, LiveSharingSessionData, saveSession } from '@/lib/sessionStore'
import { getSupabaseServerClient, isSupabaseServerConfigured } from '@/lib/supabaseServer'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const token = searchParams.get('token') || searchParams.get('sessionId')

  if (!token) {
    return NextResponse.json({ error: 'Session token is required' }, { status: 400 })
  }

  const cleanToken = token.trim()

  // 1. Check in-memory store first
  let session = getSession(cleanToken)

  // 2. If not found in memory, check Supabase
  if (!session && isSupabaseServerConfigured()) {
    const supabase = getSupabaseServerClient()
    if (supabase) {
      const { data, error } = await supabase
        .from('live_sessions')
        .select('*')
        .eq('session_id', cleanToken)
        .single()

      if (!error && data) {
        session = {
          sessionId: data.session_id,
          userName: data.user_name,
          recipients: data.recipients || [],
          recipientPhones: data.recipient_phones || [],
          location: data.location,
          riskMode: data.risk_mode,
          batteryLevel: data.battery_level,
          emergencyTriggered: data.emergency_triggered,
          pathHistory: data.path_history || [],
          durationMinutes: data.duration_minutes,
          isSharing: data.is_sharing,
          startTime: Number(data.start_time),
          expirationTime: data.expiration_time ? Number(data.expiration_time) : null,
          lastUpdated: Number(data.last_updated),
        }
        // Cache back into memory store
        saveSession(session)
      }
    }
  }

  if (!session) {
    return NextResponse.json(
      { error: 'Session not found or expired', isSharing: false },
      { status: 404 }
    )
  }

  return NextResponse.json({ success: true, session })
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { sessionId } = body

    if (!sessionId) {
      return NextResponse.json({ error: 'sessionId is required' }, { status: 400 })
    }

    // 1. Update in-memory store & trigger local SSE subscribers
    const session = saveSession(body)

    // 2. Persist to Supabase if configured
    if (isSupabaseServerConfigured()) {
      const supabase = getSupabaseServerClient()
      if (supabase) {
        supabase
          .from('live_sessions')
          .upsert(
            {
              session_id: session.sessionId,
              user_name: session.userName,
              recipients: session.recipients,
              recipient_phones: session.recipientPhones,
              location: session.location,
              risk_mode: session.riskMode,
              battery_level: session.batteryLevel,
              emergency_triggered: session.emergencyTriggered,
              path_history: session.pathHistory,
              duration_minutes: session.durationMinutes,
              is_sharing: session.isSharing,
              start_time: session.startTime,
              expiration_time: session.expirationTime,
              last_updated: session.lastUpdated,
              updated_at: new Date().toISOString(),
            },
            { onConflict: 'session_id' }
          )
          .then(({ error }) => {
            if (error) console.warn('[Supabase Sync Warning]', error.message)
          })
      }
    }

    return NextResponse.json({ success: true, session })
  } catch (err: unknown) {
    console.error('[API Session POST Error]', err)
    return NextResponse.json({ error: 'Invalid request payload' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const token = searchParams.get('token') || searchParams.get('sessionId')

  if (!token) {
    return NextResponse.json({ error: 'Session token is required' }, { status: 400 })
  }

  const cleanToken = token.trim()
  const deleted = deleteSession(cleanToken)

  // Update Supabase is_sharing = false
  if (isSupabaseServerConfigured()) {
    const supabase = getSupabaseServerClient()
    if (supabase) {
      await supabase
        .from('live_sessions')
        .update({ is_sharing: false, last_updated: Date.now() })
        .eq('session_id', cleanToken)
    }
  }

  return NextResponse.json({ success: deleted })
}
