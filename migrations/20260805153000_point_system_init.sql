-- 1. Add points column to public.users
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS points INT DEFAULT 0 NOT NULL;

-- 2. Create point_transactions table
CREATE TABLE IF NOT EXISTS public.point_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  amount INT NOT NULL,
  action_type TEXT NOT NULL,
  reference_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_point_transactions_user_id ON public.point_transactions(user_id);

-- 3. Create user_completed_tasks table
CREATE TABLE IF NOT EXISTS public.user_completed_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  task_key TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  CONSTRAINT unique_user_task_key UNIQUE (user_id, task_key)
);

CREATE INDEX IF NOT EXISTS idx_user_completed_tasks_user ON public.user_completed_tasks(user_id, task_key);

-- 4. Enable RLS
ALTER TABLE public.point_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_completed_tasks ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies
CREATE POLICY select_own_transactions ON public.point_transactions 
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY select_own_completed_tasks ON public.user_completed_tasks 
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
