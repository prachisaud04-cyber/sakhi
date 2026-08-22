import { NextRequest } from 'next/server'
import { getSession, subscribeToSession } from '@/lib/sessionStore'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const token = searchParams.get('token') || searchParams.get('sessionId')

  if (!token) {
    return new Response('Session token is required', { status: 400 })
  }

  const cleanToken = token.trim()

  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder()

      // Send initial session payload immediately if available
      const initial = getSession(cleanToken)
      if (initial) {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(initial)}\n\n`))
      }

      // Subscribe to real-time push events from the broadcaster
      const unsubscribe = subscribeToSession(cleanToken, (sessionData) => {
        try {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(sessionData)}\n\n`))
        } catch (err) {
          console.warn('[SSE Stream Enqueue Error]', err)
        }
      })

      // Send heartbeat ping every 15 seconds to prevent client timeout
      const pingInterval = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(`: ping\n\n`))
        } catch {
          clearInterval(pingInterval)
        }
      }, 15000)

      req.signal.addEventListener('abort', () => {
        clearInterval(pingInterval)
        unsubscribe()
        try {
          controller.close()
        } catch {}
      })
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
    },
  })
}
