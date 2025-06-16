
-- Create a table for storing feedback training data
CREATE TABLE public.feedback_training (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  feedback_id UUID REFERENCES public.feedback(id) NOT NULL,
  article_text TEXT NOT NULL,
  model_prediction TEXT NOT NULL,
  user_rating INTEGER NOT NULL CHECK (user_rating >= 1 AND user_rating <= 5),
  user_feedback TEXT,
  confidence_score NUMERIC,
  training_weight NUMERIC DEFAULT 1.0,
  text_features JSONB,
  prediction_accuracy TEXT CHECK (prediction_accuracy IN ('good', 'needs_improvement')),
  confidence_vs_rating NUMERIC,
  processed_for_training BOOLEAN DEFAULT FALSE,
  model_type TEXT DEFAULT 'built-in',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add Row Level Security
ALTER TABLE public.feedback_training ENABLE ROW LEVEL SECURITY;

-- Create policies for feedback_training
CREATE POLICY "Users can view their own training data" 
  ON public.feedback_training 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own training data" 
  ON public.feedback_training 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own training data" 
  ON public.feedback_training 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Create a table for storing custom Hugging Face models
CREATE TABLE public.custom_models (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  model_name TEXT NOT NULL,
  model_id TEXT NOT NULL, -- Hugging Face model ID
  model_type TEXT NOT NULL, -- e.g., 'text-classification', 'sentiment-analysis'
  description TEXT,
  is_active BOOLEAN DEFAULT FALSE,
  download_status TEXT DEFAULT 'pending' CHECK (download_status IN ('pending', 'downloading', 'ready', 'error')),
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, model_id)
);

-- Add Row Level Security for custom_models
ALTER TABLE public.custom_models ENABLE ROW LEVEL SECURITY;

-- Create policies for custom_models
CREATE POLICY "Users can view their own models" 
  ON public.custom_models 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own models" 
  ON public.custom_models 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own models" 
  ON public.custom_models 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own models" 
  ON public.custom_models 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Create index for better performance
CREATE INDEX idx_feedback_training_user_id ON public.feedback_training(user_id);
CREATE INDEX idx_feedback_training_processed ON public.feedback_training(processed_for_training);
CREATE INDEX idx_custom_models_user_id ON public.custom_models(user_id);
CREATE INDEX idx_custom_models_status ON public.custom_models(download_status);
