-- 1. Create public.users table
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  avatar TEXT,
  bio TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 2. Create public.templates table
CREATE TABLE IF NOT EXISTS public.templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  thumbnail_url TEXT NOT NULL,
  active_week INT,
  usage_count INT DEFAULT 0 NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 3. Create public.launches table
CREATE TABLE IF NOT EXISTS public.launches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  meme_image_url TEXT NOT NULL,
  caption VARCHAR(100) NOT NULL,
  product_name TEXT NOT NULL,
  product_url TEXT NOT NULL,
  pricing TEXT NOT NULL CHECK (pricing IN ('free', 'paid', 'freemium')),
  category TEXT NOT NULL,
  template_id UUID REFERENCES public.templates(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 4. Create public.launch_screenshots table
CREATE TABLE IF NOT EXISTS public.launch_screenshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  launch_id UUID NOT NULL REFERENCES public.launches(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  "order" INT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 5. Create public.reactions table
CREATE TABLE IF NOT EXISTS public.reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  launch_id UUID NOT NULL REFERENCES public.launches(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  emoji_type TEXT NOT NULL CHECK (emoji_type IN ('😂', '🔥', '🤔')),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  CONSTRAINT unique_reaction_user_launch_emoji UNIQUE (launch_id, user_id, emoji_type)
);

-- 6. Create public.remixes table
CREATE TABLE IF NOT EXISTS public.remixes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  original_launch_id UUID NOT NULL REFERENCES public.launches(id) ON DELETE CASCADE,
  remix_launch_id UUID NOT NULL REFERENCES public.launches(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  CONSTRAINT unique_remix_original_remix UNIQUE (original_launch_id, remix_launch_id)
);

-- 7. Create public.comments table
CREATE TABLE IF NOT EXISTS public.comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  launch_id UUID NOT NULL REFERENCES public.launches(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 8. Enable Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.launches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.launch_screenshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.remixes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

-- 9. Row Level Security Policies

-- public.users Policies
CREATE POLICY select_users ON public.users FOR SELECT USING (true);
CREATE POLICY update_users ON public.users FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- public.templates Policies
CREATE POLICY select_templates ON public.templates FOR SELECT USING (true);

-- public.launches Policies
CREATE POLICY select_launches ON public.launches FOR SELECT USING (true);
CREATE POLICY insert_launches ON public.launches FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY update_launches ON public.launches FOR UPDATE TO authenticated USING (auth.uid() = user_id AND created_at > now() - interval '24 hours') WITH CHECK (auth.uid() = user_id);

-- public.launch_screenshots Policies
CREATE POLICY select_screenshots ON public.launch_screenshots FOR SELECT USING (true);
CREATE POLICY insert_screenshots ON public.launch_screenshots FOR INSERT TO authenticated WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.launches
    WHERE launches.id = launch_screenshots.launch_id
    AND launches.user_id = auth.uid()
  )
);
CREATE POLICY update_screenshots ON public.launch_screenshots FOR UPDATE TO authenticated USING (
  EXISTS (
    SELECT 1 FROM public.launches
    WHERE launches.id = launch_screenshots.launch_id
    AND launches.user_id = auth.uid()
  )
);
CREATE POLICY delete_screenshots ON public.launch_screenshots FOR DELETE TO authenticated USING (
  EXISTS (
    SELECT 1 FROM public.launches
    WHERE launches.id = launch_screenshots.launch_id
    AND launches.user_id = auth.uid()
  )
);

-- public.reactions Policies
CREATE POLICY select_reactions ON public.reactions FOR SELECT USING (true);
CREATE POLICY insert_reactions ON public.reactions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY delete_reactions ON public.reactions FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- public.remixes Policies
CREATE POLICY select_remixes ON public.remixes FOR SELECT USING (true);
CREATE POLICY insert_remixes ON public.remixes FOR INSERT TO authenticated WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.launches
    WHERE launches.id = remixes.remix_launch_id
    AND launches.user_id = auth.uid()
  )
);
CREATE POLICY delete_remixes ON public.remixes FOR DELETE TO authenticated USING (
  EXISTS (
    SELECT 1 FROM public.launches
    WHERE launches.id = remixes.remix_launch_id
    AND launches.user_id = auth.uid()
  )
);

-- public.comments Policies
CREATE POLICY select_comments ON public.comments FOR SELECT USING (true);
CREATE POLICY insert_comments ON public.comments FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY update_comments ON public.comments FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY delete_comments ON public.comments FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- 10. Triggers for auto-populating public.users when auth.users is created

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, name, avatar, bio)
  VALUES (
    new.id,
    COALESCE(
      new.profile->>'name',
      new.profile->>'full_name',
      new.metadata->>'name',
      new.metadata->>'full_name',
      split_part(new.email, '@', 1)
    ),
    COALESCE(
      new.profile->>'avatar_url',
      new.profile->>'picture',
      new.profile->>'avatar',
      new.metadata->>'avatar_url',
      new.metadata->>'picture',
      new.metadata->>'avatar',
      ''
    ),
    ''
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Seed initial templates
INSERT INTO public.templates (name, thumbnail_url, active_week, usage_count) VALUES
('Drake Hotline Bling', 'https://fw47aqh3.ap-southeast.insforge.app/api/storage/buckets/templates/objects/drake.jpg', 29, 0),
('Distracted Boyfriend', 'https://fw47aqh3.ap-southeast.insforge.app/api/storage/buckets/templates/objects/boyfriend.jpg', 29, 0),
('Two Buttons', 'https://fw47aqh3.ap-southeast.insforge.app/api/storage/buckets/templates/objects/buttons.jpg', 29, 0)
ON CONFLICT DO NOTHING;
