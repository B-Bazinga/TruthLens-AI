
-- Add missing RLS policies for better security and proper data access (only create if they don't exist)

-- RLS policies for feedback table
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'feedback' AND policyname = 'Users can view their own feedback') THEN
        CREATE POLICY "Users can view their own feedback" 
          ON public.feedback 
          FOR SELECT 
          USING (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'feedback' AND policyname = 'Users can create their own feedback') THEN
        CREATE POLICY "Users can create their own feedback" 
          ON public.feedback 
          FOR INSERT 
          WITH CHECK (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'feedback' AND policyname = 'Users can update their own feedback') THEN
        CREATE POLICY "Users can update their own feedback" 
          ON public.feedback 
          FOR UPDATE 
          USING (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'feedback' AND policyname = 'Users can delete their own feedback') THEN
        CREATE POLICY "Users can delete their own feedback" 
          ON public.feedback 
          FOR DELETE 
          USING (auth.uid() = user_id);
    END IF;
END $$;

-- RLS policies for custom_models table
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'custom_models' AND policyname = 'Users can view their own custom models') THEN
        CREATE POLICY "Users can view their own custom models" 
          ON public.custom_models 
          FOR SELECT 
          USING (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'custom_models' AND policyname = 'Users can create their own custom models') THEN
        CREATE POLICY "Users can create their own custom models" 
          ON public.custom_models 
          FOR INSERT 
          WITH CHECK (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'custom_models' AND policyname = 'Users can update their own custom models') THEN
        CREATE POLICY "Users can update their own custom models" 
          ON public.custom_models 
          FOR UPDATE 
          USING (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'custom_models' AND policyname = 'Users can delete their own custom models') THEN
        CREATE POLICY "Users can delete their own custom models" 
          ON public.custom_models 
          FOR DELETE 
          USING (auth.uid() = user_id);
    END IF;
END $$;

-- RLS policies for user_settings table
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_settings' AND policyname = 'Users can view their own settings') THEN
        CREATE POLICY "Users can view their own settings" 
          ON public.user_settings 
          FOR SELECT 
          USING (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_settings' AND policyname = 'Users can create their own settings') THEN
        CREATE POLICY "Users can create their own settings" 
          ON public.user_settings 
          FOR INSERT 
          WITH CHECK (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_settings' AND policyname = 'Users can update their own settings') THEN
        CREATE POLICY "Users can update their own settings" 
          ON public.user_settings 
          FOR UPDATE 
          USING (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_settings' AND policyname = 'Users can delete their own settings') THEN
        CREATE POLICY "Users can delete their own settings" 
          ON public.user_settings 
          FOR DELETE 
          USING (auth.uid() = user_id);
    END IF;
END $$;
