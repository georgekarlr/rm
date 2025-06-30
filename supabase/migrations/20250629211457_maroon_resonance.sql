-- Create issue reports table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.rm_issue_reports (
    id BIGSERIAL PRIMARY KEY,
    asset_id BIGINT NOT NULL REFERENCES public.rm_rentable_assets(id) ON DELETE CASCADE,
    renter_id BIGINT REFERENCES public.rm_renters(id) ON DELETE SET NULL,
    request_date TIMESTAMPTZ NOT NULL DEFAULT now(),
    status TEXT NOT NULL DEFAULT 'OPEN',
    description TEXT NOT NULL,
    resolution TEXT,
    resolved_by TEXT,
    resolved_at TIMESTAMPTZ,
    reported_by TEXT,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Add RLS policies
ALTER TABLE public.rm_issue_reports ENABLE ROW LEVEL SECURITY;

-- Policy for selecting issues (all authenticated users can see issues)
CREATE POLICY "Users can view all issues" 
ON public.rm_issue_reports
FOR SELECT 
USING (auth.uid() = user_id);

-- Policy for inserting issues (all authenticated users can report issues)
CREATE POLICY "Users can insert issues" 
ON public.rm_issue_reports
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Policy for updating issues (only admin and leaser can update)
CREATE POLICY "Admin and leaser can update issues" 
ON public.rm_issue_reports
FOR UPDATE 
USING (
    EXISTS (
        SELECT 1 FROM public.rm_users 
        WHERE name = reported_by 
        AND user_type IN ('admin', 'leaser')
    )
);

-- Add helpful comment
COMMENT ON TABLE public.rm_issue_reports IS 'Stores maintenance and issue reports for rentable assets';