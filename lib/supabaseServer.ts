import { createClient, SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

let serverClient: SupabaseClient | null = null

export function isSupabaseServerConfigured(): boolean {
  return Boolean(supabaseUrl && supabaseKey && supabaseUrl !== 'your_supabase_project_url')
}

export function getSupabaseServerClient(): SupabaseClient | null {
  if (!isSupabaseServerConfigured()) {
    return null
  }

  if (!serverClient) {
    serverClient = createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: false,
      },
    })
  }

  return serverClient
}
