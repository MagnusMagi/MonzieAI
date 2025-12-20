
-- Create user_usage table
CREATE TABLE IF NOT EXISTS public.user_usage (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  count INTEGER DEFAULT 0 NOT NULL,
  period_start TIMESTAMPTZ DEFAULT now() NOT NULL,
  period_end TIMESTAMPTZ,
  plan_id TEXT,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_user_usage_user_id ON public.user_usage(user_id);

-- Enable RLS
ALTER TABLE public.user_usage ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Users can read their own usage
CREATE POLICY "Users can read own usage"
  ON public.user_usage
  FOR SELECT
  USING (auth.uid() = user_id);

-- Service role can do everything (for edge functions if needed, though we might use direct DB access or RPC)
-- Ideally, only the server-side logic (Edge Functions) should update this, but for now, we'll allow the authenticated user to read.
-- Updates should ideally happen via RPC function to ensure integrity, or RLS that allows update if user_id matches (but be careful of client-side manipulation).
-- For this implementation, we will trust the client logic because the `ImageGenerationService` runs on client but we can secure this later with an Edge Function if needed.
-- However, since `ImageGenerationService` is client-side, we need to allow INSERT/UPDATE for the user on their own row.

CREATE POLICY "Users can insert own usage"
  ON public.user_usage
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own usage"
  ON public.user_usage
  FOR UPDATE
  USING (auth.uid() = user_id);
