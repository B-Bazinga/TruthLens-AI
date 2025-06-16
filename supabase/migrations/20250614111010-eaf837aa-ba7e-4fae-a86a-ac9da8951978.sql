
-- Fix the confidence_score field precision in feedback table
ALTER TABLE public.feedback 
ALTER COLUMN confidence_score TYPE NUMERIC(5,2);

-- Fix the confidence_score field precision in feedback_training table
ALTER TABLE public.feedback_training 
ALTER COLUMN confidence_score TYPE NUMERIC(5,2);

-- Also fix other numeric fields that might have precision issues
ALTER TABLE public.feedback_training 
ALTER COLUMN training_weight TYPE NUMERIC(5,2),
ALTER COLUMN confidence_vs_rating TYPE NUMERIC(5,2);

-- Fix confidence_score in analysis_history table as well
ALTER TABLE public.analysis_history 
ALTER COLUMN confidence_score TYPE NUMERIC(5,2);
