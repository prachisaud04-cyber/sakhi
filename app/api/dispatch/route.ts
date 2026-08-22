import { NextRequest, NextResponse } from 'next/server'
import { DispatchPayload, executeAutomatedDispatch } from '@/lib/notificationGateway'

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as DispatchPayload

    if (!body.sessionId || !body.recipients || body.recipients.length === 0) {
      return NextResponse.json(
        { error: 'sessionId and at least 1 recipient are required' },
        { status: 400 }
      )
    }

    const origin = req.nextUrl.origin || 'http://localhost:3000'
    const result = await executeAutomatedDispatch(body, origin)

    return NextResponse.json(result)
  } catch (err: unknown) {
    console.error('[API Dispatch Error]', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Dispatch processing failed' },
      { status: 500 }
    )
  }
}
