
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useFeedbackTraining } from './useFeedbackTraining';

interface FeedbackData {
  articleText: string;
  modelPrediction: string;
  confidenceScore: number;
  userRating: number;
  userFeedback?: string;
}

export function useOptimizedFeedback() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const { processFeedbackForTraining } = useFeedbackTraining();

  const submitFeedback = useCallback(async (feedbackData: FeedbackData) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to submit feedback.",
        variant: "destructive",
      });
      return null;
    }

    setIsSubmitting(true);

    try {
      // Batch operations using a transaction-like approach
      const feedbackPayload = {
        user_id: user.id,
        article_text: feedbackData.articleText.length > 5000 
          ? feedbackData.articleText.substring(0, 5000) + '...' 
          : feedbackData.articleText,
        model_prediction: feedbackData.modelPrediction,
        confidence_score: Math.round(feedbackData.confidenceScore * 100) / 100,
        user_rating: feedbackData.userRating,
        user_feedback: feedbackData.userFeedback,
      };

      // Insert feedback with minimal return data
      const { data: feedback, error: feedbackError } = await supabase
        .from('feedback')
        .insert(feedbackPayload)
        .select('id')
        .single();

      if (feedbackError) throw feedbackError;

      // Process for training asynchronously (don't await to improve UX)
      processFeedbackForTraining(
        {
          user_id: user.id,
          article_text: feedbackPayload.article_text,
          model_prediction: feedbackPayload.model_prediction,
          confidence_score: feedbackPayload.confidence_score,
          user_rating: feedbackPayload.user_rating,
          user_feedback: feedbackPayload.user_feedback,
          timestamp: new Date().toISOString(),
        },
        feedback.id
      ).catch(error => console.error('Training processing error:', error));

      toast({
        title: "Feedback Submitted",
        description: "Thank you for your feedback! It helps improve our AI model.",
      });

      return feedback;
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast({
        title: "Submission Failed",
        description: "There was an error submitting your feedback. Please try again.",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsSubmitting(false);
    }
  }, [user, toast, processFeedbackForTraining]);

  // Get feedback statistics with aggregation
  const getFeedbackStats = useCallback(async () => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('feedback')
        .select('user_rating, confidence_score, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(100); // Limit for performance

      if (error) throw error;

      if (!data || data.length === 0) {
        return { totalFeedback: 0, avgRating: 0, avgConfidence: 0 };
      }

      const stats = {
        totalFeedback: data.length,
        avgRating: data.reduce((sum, item) => sum + (item.user_rating || 0), 0) / data.length,
        avgConfidence: data.reduce((sum, item) => sum + (item.confidence_score || 0), 0) / data.length,
      };

      return stats;
    } catch (error) {
      console.error('Error fetching feedback stats:', error);
      return null;
    }
  }, [user]);

  return {
    submitFeedback,
    getFeedbackStats,
    isSubmitting
  };
}
