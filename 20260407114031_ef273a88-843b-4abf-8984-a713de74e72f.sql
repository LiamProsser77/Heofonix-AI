
ALTER TABLE public.conversations ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.messages ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;

DROP POLICY IF EXISTS "Anyone can create conversations" ON public.conversations;
DROP POLICY IF EXISTS "Anyone can delete conversations" ON public.conversations;
DROP POLICY IF EXISTS "Anyone can read conversations" ON public.conversations;
DROP POLICY IF EXISTS "Anyone can update conversations" ON public.conversations;
DROP POLICY IF EXISTS "Anyone can create messages" ON public.messages;
DROP POLICY IF EXISTS "Anyone can read messages" ON public.messages;

CREATE POLICY "Users can read own conversations" ON public.conversations
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can create own conversations" ON public.conversations
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own conversations" ON public.conversations
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own conversations" ON public.conversations
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can read own messages" ON public.messages
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can create own messages" ON public.messages
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
