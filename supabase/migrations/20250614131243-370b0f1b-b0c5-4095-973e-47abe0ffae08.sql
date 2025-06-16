
-- Add indexes for foreign key constraints to improve query performance

-- Index for analysis_history.user_id foreign key
CREATE INDEX IF NOT EXISTS idx_analysis_history_user_id ON public.analysis_history(user_id);

-- Index for feedback.user_id foreign key  
CREATE INDEX IF NOT EXISTS idx_feedback_user_id ON public.feedback(user_id);

-- Index for feedback_training.feedback_id foreign key
CREATE INDEX IF NOT EXISTS idx_feedback_training_feedback_id ON public.feedback_training(feedback_id);

-- Index for feedback_training.user_id foreign key (also a foreign key)
CREATE INDEX IF NOT EXISTS idx_feedback_training_user_id ON public.feedback_training(user_id);
