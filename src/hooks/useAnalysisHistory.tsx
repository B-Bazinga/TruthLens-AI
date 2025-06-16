
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

export function useAnalysisHistory() {
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const saveAnalysis = async (
    articleText: string,
    articleTitle: string,
    prediction: string,
    confidence: number,
    explanation: string,
    keyFactors: string[]
  ) => {
    if (!user) {
      console.error('User not authenticated');
      return null;
    }

    setIsSaving(true);

    try {
      const { data, error } = await supabase
        .from('analysis_history')
        .insert([
          {
            user_id: user.id,
            title: articleTitle || 'Untitled Article',
            article_text: articleText,
            prediction,
            confidence_score: confidence,
            explanation,
            key_factors: keyFactors,
          }
        ])
        .select()
        .single();

      if (error) throw error;

      console.log('Analysis saved to history:', data);
      return data;
    } catch (error) {
      console.error('Error saving analysis:', error);
      toast({
        title: "Error",
        description: "Failed to save analysis to history.",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsSaving(false);
    }
  };

  return {
    saveAnalysis,
    isSaving
  };
}
