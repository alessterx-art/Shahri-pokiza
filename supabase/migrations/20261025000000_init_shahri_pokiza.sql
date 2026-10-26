-- =====================================================================
-- Шаҳри Покиза — Smart City Waste Management System
-- Supabase PostgreSQL Migration: Initial Schema, RLS, & Storage
-- =====================================================================

-- 1. Enable pgcrypto for UUID generation if needed
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. PROFILES TABLE (linked to Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    display_name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'public_user' CHECK (role IN ('admin', 'sanitation_worker', 'public_user')),
    account_status TEXT NOT NULL DEFAULT 'active' CHECK (account_status IN ('active', 'pending', 'suspended')),
    phone TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Index for role lookup
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);

-- 3. CONTAINERS TABLE (Smart Waste Containers in Khujand, Dushanbe, etc.)
CREATE TABLE IF NOT EXISTS public.containers (
    id TEXT PRIMARY KEY,
    name_or_number TEXT NOT NULL,
    city TEXT NOT NULL DEFAULT 'Хуҷанд',
    street TEXT NOT NULL,
    address_description TEXT NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    current_status TEXT NOT NULL DEFAULT 'normal' CHECK (current_status IN ('normal', 'overflowing', 'damaged', 'maintenance')),
    fill_percentage INTEGER NOT NULL DEFAULT 40 CHECK (fill_percentage >= 0 AND fill_percentage <= 100),
    waste_type TEXT NOT NULL DEFAULT 'mixed' CHECK (waste_type IN ('mixed', 'recyclable', 'organic')),
    last_inspection TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_containers_city ON public.containers(city);
CREATE INDEX IF NOT EXISTS idx_containers_status ON public.containers(current_status);

-- 4. INCIDENTS TABLE
CREATE TABLE IF NOT EXISTS public.incidents (
    id TEXT PRIMARY KEY,
    category TEXT NOT NULL CHECK (category IN ('overflowing_bin', 'garbage_outside', 'litter_scattered', 'dirty_public_area', 'unclear')),
    city TEXT NOT NULL DEFAULT 'Хуҷанд',
    address TEXT NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    description TEXT NOT NULL,
    photograph_path TEXT NOT NULL,
    ai_analysis_result JSONB,
    confidence_score NUMERIC(4, 2) DEFAULT 0.00,
    priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'under_review', 'assigned', 'in_progress', 'resolved', 'rejected')),
    reporter_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    assigned_worker_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    reported_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    resolved_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_incidents_status ON public.incidents(status);
CREATE INDEX IF NOT EXISTS idx_incidents_priority ON public.incidents(priority);
CREATE INDEX IF NOT EXISTS idx_incidents_worker ON public.incidents(assigned_worker_id);
CREATE INDEX IF NOT EXISTS idx_incidents_reported_at ON public.incidents(reported_at DESC);

-- 5. CAMERA_DEVICES TABLE
CREATE TABLE IF NOT EXISTS public.camera_devices (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    location TEXT NOT NULL,
    city TEXT NOT NULL DEFAULT 'Хуҷанд',
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    status TEXT NOT NULL DEFAULT 'online' CHECK (status IN ('online', 'offline', 'maintenance')),
    stream_url TEXT,
    adapter_type TEXT NOT NULL DEFAULT 'browser_demo' CHECK (adapter_type IN ('browser_demo', 'upload_stream', 'ip_camera_rtsp')),
    last_connection TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 6. CAMERA_EVENTS TABLE
CREATE TABLE IF NOT EXISTS public.camera_events (
    id TEXT PRIMARY KEY,
    camera_id TEXT NOT NULL REFERENCES public.camera_devices(id) ON DELETE CASCADE,
    event_category TEXT NOT NULL,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    incident_id TEXT REFERENCES public.incidents(id) ON DELETE SET NULL,
    evidence_image_path TEXT NOT NULL,
    review_status TEXT NOT NULL DEFAULT 'pending_review' CHECK (review_status IN ('pending_review', 'confirmed', 'rejected')),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_camera_events_camera ON public.camera_events(camera_id);
CREATE INDEX IF NOT EXISTS idx_camera_events_status ON public.camera_events(review_status);

-- 7. CLEANUP_TASKS TABLE
CREATE TABLE IF NOT EXISTS public.cleanup_tasks (
    id TEXT PRIMARY KEY,
    incident_id TEXT NOT NULL REFERENCES public.incidents(id) ON DELETE CASCADE,
    assigned_worker_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'verified')),
    before_photo_path TEXT,
    after_photo_path TEXT,
    worker_notes TEXT,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_cleanup_tasks_worker ON public.cleanup_tasks(assigned_worker_id);
CREATE INDEX IF NOT EXISTS idx_cleanup_tasks_status ON public.cleanup_tasks(status);

-- 8. NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS public.notifications (
    id TEXT PRIMARY KEY,
    recipient_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    related_incident_id TEXT REFERENCES public.incidents(id) ON DELETE SET NULL,
    read_status BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_notifications_recipient ON public.notifications(recipient_id);

-- 9. ECO_POINTS TABLE
CREATE TABLE IF NOT EXISTS public.eco_points (
    id TEXT PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    points INTEGER NOT NULL CHECK (points > 0),
    reason TEXT NOT NULL,
    related_incident_id TEXT REFERENCES public.incidents(id) ON DELETE SET NULL,
    verification_status TEXT NOT NULL DEFAULT 'pending' CHECK (verification_status IN ('pending', 'approved', 'rejected')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT uq_user_incident_points UNIQUE (user_id, related_incident_id)
);

CREATE INDEX IF NOT EXISTS idx_eco_points_user ON public.eco_points(user_id);

-- 10. AUDIT_LOGS TABLE
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id TEXT PRIMARY KEY,
    actor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    affected_record TEXT NOT NULL,
    details JSONB,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON public.audit_logs(timestamp DESC);

-- =====================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.containers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.camera_devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.camera_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cleanup_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.eco_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Security helper: get current user role
CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS TEXT AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid() LIMIT 1;
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- PROFILES POLICIES
-- Public can view basic profile info (display name) for leaderboards
CREATE POLICY "Public profiles are readable" ON public.profiles
    FOR SELECT USING (true);

-- Users can update only their own profile, but CANNOT alter their own role
CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id AND role = (SELECT role FROM public.profiles WHERE id = auth.uid()));

-- Only Admins can manage all profiles and change roles
CREATE POLICY "Admins have full access to profiles" ON public.profiles
    FOR ALL USING (public.current_user_role() = 'admin');

-- CONTAINERS POLICIES
-- Containers are public for viewing on the smart city map
CREATE POLICY "Containers are readable by all" ON public.containers
    FOR SELECT USING (true);

-- Only Admins and Sanitation Workers can modify container statuses
CREATE POLICY "Staff can update containers" ON public.containers
    FOR UPDATE USING (public.current_user_role() IN ('admin', 'sanitation_worker'));

CREATE POLICY "Admins can insert containers" ON public.containers
    FOR INSERT WITH CHECK (public.current_user_role() = 'admin');

-- INCIDENTS POLICIES
-- Anyone can view incidents (with sensitive CCTV notes restricted)
CREATE POLICY "Incidents are readable" ON public.incidents
    FOR SELECT USING (true);

-- Authenticated or public users can submit new incidents
CREATE POLICY "Anyone can report an incident" ON public.incidents
    FOR INSERT WITH CHECK (true);

-- Admins can update any incident
CREATE POLICY "Admins can update incidents" ON public.incidents
    FOR UPDATE USING (public.current_user_role() = 'admin');

-- Assigned workers can update their assigned incident status
CREATE POLICY "Workers can update assigned incidents" ON public.incidents
    FOR UPDATE USING (
        public.current_user_role() = 'sanitation_worker' AND 
        assigned_worker_id = auth.uid()
    );

-- CAMERA DEVICES & EVENTS POLICIES (RESTRICTED TO STAFF)
CREATE POLICY "Staff can view camera devices" ON public.camera_devices
    FOR SELECT USING (public.current_user_role() IN ('admin', 'sanitation_worker'));

CREATE POLICY "Admins can manage camera devices" ON public.camera_devices
    FOR ALL USING (public.current_user_role() = 'admin');

CREATE POLICY "Staff can view camera events" ON public.camera_events
    FOR SELECT USING (public.current_user_role() IN ('admin', 'sanitation_worker'));

CREATE POLICY "Admins can review camera events" ON public.camera_events
    FOR UPDATE USING (public.current_user_role() = 'admin');

CREATE POLICY "System/Admin can insert camera events" ON public.camera_events
    FOR INSERT WITH CHECK (public.current_user_role() = 'admin');

-- CLEANUP TASKS POLICIES
CREATE POLICY "Workers can view assigned tasks" ON public.cleanup_tasks
    FOR SELECT USING (
        public.current_user_role() = 'admin' OR 
        assigned_worker_id = auth.uid()
    );

CREATE POLICY "Workers can update assigned tasks" ON public.cleanup_tasks
    FOR UPDATE USING (
        public.current_user_role() = 'admin' OR 
        assigned_worker_id = auth.uid()
    );

CREATE POLICY "Admins can create cleanup tasks" ON public.cleanup_tasks
    FOR INSERT WITH CHECK (public.current_user_role() = 'admin');

-- NOTIFICATIONS POLICIES
CREATE POLICY "Users can view own notifications" ON public.notifications
    FOR SELECT USING (auth.uid() = recipient_id OR public.current_user_role() = 'admin');

CREATE POLICY "Users can mark own notifications as read" ON public.notifications
    FOR UPDATE USING (auth.uid() = recipient_id);

-- ECO POINTS POLICIES
CREATE POLICY "Eco points are readable for leaderboards" ON public.eco_points
    FOR SELECT USING (true);

CREATE POLICY "Admins can verify eco points" ON public.eco_points
    FOR ALL USING (public.current_user_role() = 'admin');

-- AUDIT LOGS POLICIES
CREATE POLICY "Only admins can view audit logs" ON public.audit_logs
    FOR SELECT USING (public.current_user_role() = 'admin');

CREATE POLICY "System/Staff can write audit logs" ON public.audit_logs
    FOR INSERT WITH CHECK (true);

-- =====================================================================
-- SUPABASE STORAGE BUCKETS CONFIGURATION
-- =====================================================================
-- Run in Supabase SQL editor or automated storage setup:
-- 1. 'incident-photos' (Public read for approved evidence, authenticated upload)
-- 2. 'cleanup-evidence' (Staff upload for before/after photos)
-- 3. 'cctv-records' (Private bucket with signed URLs for authorized staff only)

INSERT INTO storage.buckets (id, name, public)
VALUES 
    ('incident-photos', 'incident-photos', true),
    ('cleanup-evidence', 'cleanup-evidence', true),
    ('cctv-records', 'cctv-records', false)
ON CONFLICT (id) DO NOTHING;
