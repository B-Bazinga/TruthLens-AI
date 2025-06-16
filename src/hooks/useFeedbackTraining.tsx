
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface FeedbackData {
  user_id: string;
  article_text: string;
  model_prediction: string;
  confidence_score: number;
  user_rating: number;
  user_feedback?: string;
  timestamp: string;
}

export function useFeedbackTraining() {
  const [isTraining, setIsTraining] = useState(false);
  const { toast } = useToast();

  const processFeedbackForTraining = async (feedback: FeedbackData, feedbackId: string) => {
    try {
      setIsTraining(true);
      
      console.log('Processing feedback for training:', feedback);
      
      // Calculate enhanced training insights
      const trainingWeight = calculateTrainingWeight(feedback);
      const textFeatures = extractTextFeatures(feedback.article_text);
      const predictionAccuracy = feedback.user_rating >= 4 ? 'good' : 'needs_improvement';
      const confidenceVsRating = Math.round((feedback.confidence_score / 20 - feedback.user_rating) * 100) / 100;
      
      // Store comprehensive training data
      const trainingData = {
        user_id: feedback.user_id,
        feedback_id: feedbackId,
        article_text: feedback.article_text,
        model_prediction: feedback.model_prediction,
        user_rating: feedback.user_rating,
        user_feedback: feedback.user_feedback,
        confidence_score: Math.round(feedback.confidence_score * 100) / 100,
        training_weight: Math.round(trainingWeight * 100) / 100,
        text_features: textFeatures,
        prediction_accuracy: predictionAccuracy,
        confidence_vs_rating: confidenceVsRating,
        processed_for_training: false,
        model_type: 'built-in'
      };

      console.log('Training data to insert:', trainingData);

      const { data, error } = await supabase
        .from('feedback_training')
        .insert([trainingData])
        .select()
        .single();

      if (error) {
        console.error('Error storing training data:', error);
        throw error;
      }

      console.log('Training data stored successfully:', data);
      
      // Enhanced training insights for model improvement
      const trainingInsights = analyzeTrainingPattern(feedback, textFeatures);
      console.log('Training insights generated:', trainingInsights);
      
      toast({
        title: "Feedback Processed",
        description: "Your feedback has been analyzed and will be used to improve the model's accuracy.",
      });

      return data;
    } catch (error) {
      console.error('Error processing feedback for training:', error);
      toast({
        title: "Processing Error",
        description: "Feedback saved but training processing encountered an issue.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsTraining(false);
    }
  };

  const calculateTrainingWeight = (feedback: FeedbackData): number => {
    // Enhanced weight calculation for better training
    const ratingScore = feedback.user_rating / 5;
    const confidenceScore = feedback.confidence_score / 100;
    
    // High confidence with accurate user rating = higher weight
    // Low confidence with accurate user feedback = higher weight
    const confidenceAccuracy = Math.abs(confidenceScore - ratingScore);
    const baseWeight = Math.max(0.1, 2 - confidenceAccuracy);
    
    // Boost weight for detailed feedback
    const feedbackBonus = feedback.user_feedback && feedback.user_feedback.length > 20 ? 0.5 : 0;
    
    // Boost weight for extreme ratings (very good or very bad predictions)
    const extremeRatingBonus = (feedback.user_rating === 1 || feedback.user_rating === 5) ? 0.3 : 0;
    
    return Math.min(3.0, baseWeight + feedbackBonus + extremeRatingBonus);
  };

  const extractTextFeatures = (text: string) => {
    const words = text.split(/\s+/);
    const sentences = text.split(/[.!?]+/).filter(s => s.trim());
    
    return {
      word_count: words.length,
      sentence_count: sentences.length,
      avg_word_length: words.reduce((sum, word) => sum + word.length, 0) / words.length,
      avg_sentence_length: words.length / sentences.length,
      exclamation_count: (text.match(/!/g) || []).length,
      question_count: (text.match(/\?/g) || []).length,
      uppercase_ratio: (text.match(/[A-Z]/g) || []).length / text.length,
      has_quotes: text.includes('"') || text.includes("'"),
      numeric_count: (text.match(/\d/g) || []).length,
      emotional_words: countEmotionalWords(text),
      sensational_phrases: countSensationalPhrases(text),
      readability_score: calculateReadabilityScore(text),
      complexity_score: calculateComplexityScore(words)
    };
  };

  const countEmotionalWords = (text: string): number => {
    const emotionalWords = [
      'shocking', 'unbelievable', 'amazing', 'terrible', 'incredible', 
      'devastating', 'outrageous', 'fantastic', 'horrible', 'wonderful',
      'disgusting', 'brilliant', 'awful', 'spectacular', 'dreadful'
    ];
    return emotionalWords.filter(word => text.toLowerCase().includes(word)).length;
  };

  const countSensationalPhrases = (text: string): number => {
    const sensationalPhrases = [
      'you won\'t believe', 'shocking truth', 'experts hate', 'secret revealed',
      'doctors don\'t want', 'this will change', 'never seen before', 'mind-blowing'
    ];
    return sensationalPhrases.filter(phrase => text.toLowerCase().includes(phrase)).length;
  };

  const calculateReadabilityScore = (text: string): number => {
    // Simplified readability calculation
    const words = text.split(/\s+/).length;
    const sentences = text.split(/[.!?]+/).filter(s => s.trim()).length;
    const avgWordsPerSentence = words / sentences;
    
    // Higher score = more readable (simpler)
    return Math.max(0, 100 - (avgWordsPerSentence - 15) * 2);
  };

  const calculateComplexityScore = (words: string[]): number => {
    const complexWords = words.filter(word => word.length > 8).length;
    return (complexWords / words.length) * 100;
  };

  const analyzeTrainingPattern = (feedback: FeedbackData, features: any) => {
    return {
      pattern_type: feedback.user_rating >= 4 ? 'positive_example' : 'negative_example',
      confidence_accuracy: Math.abs(feedback.confidence_score / 20 - feedback.user_rating),
      text_complexity: features.complexity_score,
      emotional_intensity: features.emotional_words + features.sensational_phrases,
      structural_quality: features.avg_sentence_length > 10 && features.avg_sentence_length < 25,
      training_priority: feedback.user_rating === 1 || feedback.user_rating === 5 ? 'high' : 'medium'
    };
  };

  const getTrainingData = async () => {
    try {
      const { data, error } = await supabase
        .from('feedback_training')
        .select('*')
        .eq('processed_for_training', false)
        .order('training_weight', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching training data:', error);
      return [];
    }
  };

  const markAsProcessed = async (trainingId: string) => {
    try {
      const { error } = await supabase
        .from('feedback_training')
        .update({ processed_for_training: true })
        .eq('id', trainingId);

      if (error) throw error;
    } catch (error) {
      console.error('Error marking training data as processed:', error);
    }
  };

  const getTrainingInsights = async () => {
    try {
      const { data, error } = await supabase
        .from('feedback_training')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;

      // Generate insights from training data
      const insights = {
        total_feedback: data.length,
        avg_rating: data.reduce((sum, item) => sum + item.user_rating, 0) / data.length,
        accuracy_trends: data.filter(item => item.prediction_accuracy === 'good').length / data.length * 100,
        high_confidence_accuracy: data.filter(item => 
          item.confidence_score > 80 && item.user_rating >= 4
        ).length / data.length * 100
      };

      return insights;
    } catch (error) {
      console.error('Error generating training insights:', error);
      return null;
    }
  };

  return {
    processFeedbackForTraining,
    getTrainingData,
    markAsProcessed,
    getTrainingInsights,
    isTraining
  };
}
