-- ==============================================================================
-- FUN EVENT UAE — SUPABASE DATABASE SCHEMA
-- Project: https://hqmtdbxyoocasjngnkdk.supabase.co
-- 
-- Optimized for Free Tier Quota Preservation:
-- 1. Tight VARCHAR limits prevent table text bloat.
-- 2. Check constraints reject oversized payloads and giant base64 payloads.
-- 3. Indexes on created_at and page ensure minimal CPU and fast indexed scans.
-- ==============================================================================

-- 1. EVENT ENQUIRIES TABLE
CREATE TABLE IF NOT EXISTS public.enquiries (
    id TEXT PRIMARY KEY,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    name VARCHAR(100) NOT NULL,
    email VARCHAR(160) NOT NULL,
    phone VARCHAR(40),
    occasion VARCHAR(100) NOT NULL,
    date VARCHAR(50),
    venue VARCHAR(180),
    message VARCHAR(2000) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'new',
    
    -- Storage protection constraints
    CONSTRAINT check_message_len CHECK (char_length(message) <= 2000),
    CONSTRAINT check_name_len CHECK (char_length(name) <= 100),
    CONSTRAINT check_email_len CHECK (char_length(email) <= 160)
);

-- Index for ordering in Admin Dashboard (fast & low compute)
CREATE INDEX IF NOT EXISTS idx_enquiries_created_at ON public.enquiries (created_at DESC);


-- 2. VISUAL EDITOR CONTENT OVERRIDES TABLE
CREATE TABLE IF NOT EXISTS public.content_overrides (
    id TEXT PRIMARY KEY, -- format: page::selector
    page VARCHAR(100) NOT NULL,
    selector VARCHAR(255) NOT NULL,
    html TEXT,
    attrs JSONB DEFAULT '{}'::jsonb,
    style JSONB DEFAULT '{}'::jsonb,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),

    -- Storage protection: max 50KB per override, reject mega base64 dumps
    CONSTRAINT check_html_size CHECK (html IS NULL OR char_length(html) <= 50000)
);

CREATE INDEX IF NOT EXISTS idx_content_overrides_page ON public.content_overrides (page);


-- 3. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.enquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_overrides ENABLE ROW LEVEL SECURITY;

-- Enquiries: Allow website visitors to insert leads
DROP POLICY IF EXISTS "Allow public insert enquiries" ON public.enquiries;
CREATE POLICY "Allow public insert enquiries"
ON public.enquiries
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Enquiries: Allow reading enquiries (for Admin view)
DROP POLICY IF EXISTS "Allow anon read enquiries" ON public.enquiries;
CREATE POLICY "Allow anon read enquiries"
ON public.enquiries
FOR SELECT
TO anon, authenticated
USING (true);

-- Enquiries: Allow updating enquiry status (e.g. mark as read)
DROP POLICY IF EXISTS "Allow anon update enquiries" ON public.enquiries;
CREATE POLICY "Allow anon update enquiries"
ON public.enquiries
FOR UPDATE
TO anon, authenticated
USING (true)
WITH CHECK (true);

-- Content Overrides: Allow visitors to read page customizations
DROP POLICY IF EXISTS "Allow public read content_overrides" ON public.content_overrides;
CREATE POLICY "Allow public read content_overrides"
ON public.content_overrides
FOR SELECT
TO anon, authenticated
USING (true);

-- Content Overrides: Allow upserting and deleting (from visual admin)
DROP POLICY IF EXISTS "Allow anon write content_overrides" ON public.content_overrides;
CREATE POLICY "Allow anon write content_overrides"
ON public.content_overrides
FOR ALL
TO anon, authenticated
USING (true)
WITH CHECK (true);
