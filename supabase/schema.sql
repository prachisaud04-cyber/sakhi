-- ==============================================================================
-- SAKHI (Women Safety Platform) - Supabase Database Schema
-- ==============================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ------------------------------------------------------------------------------
-- 2. Table: live_sessions (Real-time GPS Tracking & Multi-Device Synchronization)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.live_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id TEXT UNIQUE NOT NULL,
  user_name TEXT NOT NULL DEFAULT 'Riya Sharma',
  recipients JSONB NOT NULL DEFAULT '[]'::jsonb,
  recipient_phones JSONB DEFAULT '[]'::jsonb,
  location JSONB, -- { lat: float, lng: float, accuracy: float, heading: float, speed: float }
  risk_mode TEXT NOT NULL DEFAULT 'normal' CHECK (risk_mode IN ('normal', 'suspicious', 'critical')),
  battery_level INTEGER DEFAULT 74,
  emergency_triggered BOOLEAN NOT NULL DEFAULT FALSE,
  path_history JSONB NOT NULL DEFAULT '[]'::jsonb,
  duration_minutes INTEGER NOT NULL DEFAULT 30,
  is_sharing BOOLEAN NOT NULL DEFAULT TRUE,
  start_time BIGINT NOT NULL,
  expiration_time BIGINT,
  last_updated BIGINT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for high-performance session lookups
CREATE INDEX IF NOT EXISTS idx_live_sessions_session_id ON public.live_sessions (session_id);
CREATE INDEX IF NOT EXISTS idx_live_sessions_is_sharing ON public.live_sessions (is_sharing);

-- ------------------------------------------------------------------------------
-- 3. Table: safety_reports (Community Unsafe Area & Street Light Reporting)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.safety_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_name TEXT DEFAULT 'Anonymous User',
  reason TEXT NOT NULL, -- 'Poor street lighting', 'Harassment', 'Isolated / Deserted', etc.
  description TEXT,
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'investigating', 'resolved')),
  votes_count INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_safety_reports_coords ON public.safety_reports (lat, lng);

-- ------------------------------------------------------------------------------
-- 4. Table: emergency_contacts (User Trusted Emergency Guardians)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.emergency_contacts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL DEFAULT 'default_user',
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  normalized_phone TEXT NOT NULL,
  relationship TEXT DEFAULT 'Family',
  is_primary BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 5. Table: emergency_alerts (Critical SOS Incidents & Dispatch Logs)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.emergency_alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id TEXT REFERENCES public.live_sessions(session_id) ON DELETE SET NULL,
  user_name TEXT NOT NULL,
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  accuracy DOUBLE PRECISION DEFAULT 10,
  alert_type TEXT NOT NULL DEFAULT 'SOS_BUTTON_TRIGGERED',
  status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'ACKNOWLEDGED', 'RESOLVED')),
  dispatched_services JSONB DEFAULT '["112_POLICE", "PRIMARY_CONTACTS"]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 6. Row Level Security (RLS) Policies
-- ------------------------------------------------------------------------------
ALTER TABLE public.live_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.safety_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emergency_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emergency_alerts ENABLE ROW LEVEL SECURITY;

-- Allow public read & write access for active session tokens
CREATE POLICY "Allow public read of live sessions" 
  ON public.live_sessions FOR SELECT USING (true);

CREATE POLICY "Allow public insert/update of live sessions" 
  ON public.live_sessions FOR ALL USING (true);

-- Allow public safety reporting
CREATE POLICY "Allow public read/insert of safety reports" 
  ON public.safety_reports FOR ALL USING (true);

-- Allow public access to emergency contacts for demo/prototype
CREATE POLICY "Allow public read/write of emergency contacts" 
  ON public.emergency_contacts FOR ALL USING (true);

-- Allow public emergency alert logging
CREATE POLICY "Allow public read/insert of emergency alerts" 
  ON public.emergency_alerts FOR ALL USING (true);

-- ------------------------------------------------------------------------------
-- 7. Enable Supabase Realtime Replication on Live Sessions
-- ------------------------------------------------------------------------------
-- Run this in Supabase SQL editor to allow real-time WebSocket listening:
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'live_sessions'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.live_sessions;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'emergency_alerts'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.emergency_alerts;
  END IF;
END $$;
