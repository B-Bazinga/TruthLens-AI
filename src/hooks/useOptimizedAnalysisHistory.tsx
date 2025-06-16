
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

interface AnalysisItem {
  id: string;
  title: string;
  article_text: string;
  prediction: string;
  confidence_score: number;
  explanation: string;
  key_factors: string[];
  created_at: string;
}

interface PaginatedResult {
  data: AnalysisItem[];
  totalCount: number;
  hasMore: boolean;
}

export function useOptimizedAnalysisHistory() {
  const [loading, setLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  // Optimized fetch with pagination and selective fields
  const fetchAnalysisHistory = useCallback(async (
    page = 0,
    limit = 20,
    searchTerm?: string
  ): Promise<PaginatedResult> => {
    if (!user) return { data: [], totalCount: 0, hasMore: false };

    try {
      setLoading(true);
      
      let query = supabase
        .from('analysis_history')
        .select(`
          id,
          title,
          article_text,
          prediction,
          confidence_score,
          explanation,
          key_factors,
          created_at
        `, { count: 'exact' })
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .range(page * limit, (page + 1) * limit - 1);

      // Add search filter if provided
      if (searchTerm) {
        query = query.or(`title.ilike.%${searchTerm}%,article_text.ilike.%${searchTerm}%`);
      }

      const { data, error, count } = await query;

      if (error) throw error;

      return {
        data: data || [],
        totalCount: count || 0,
        hasMore: (count || 0) > (page + 1) * limit
      };
    } catch (error) {
      console.error('Error fetching analysis history:', error);
      toast({
        title: "Error",
        description: "Failed to load analysis history.",
        variant: "destructive",
      });
      return { data: [], totalCount: 0, hasMore: false };
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  // Optimized save with minimal payload
  const saveAnalysis = useCallback(async (
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
      // Truncate article text if too long for better storage
      const truncatedText = articleText.length > 10000 
        ? articleText.substring(0, 10000) + '...' 
        : articleText;

      const { data, error } = await supabase
        .from('analysis_history')
        .insert({
          user_id: user.id,
          title: articleTitle || 'Untitled Article',
          article_text: truncatedText,
          prediction,
          confidence_score: Math.round(confidence * 100) / 100, // Round to 2 decimals
          explanation,
          key_factors: keyFactors,
        })
        .select('id, created_at')
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
  }, [user, toast]);

  // Batch delete for better performance
  const deleteAnalyses = useCallback(async (ids: string[]) => {
    if (!user || ids.length === 0) return false;

    try {
      const { error } = await supabase
        .from('analysis_history')
        .delete()
        .in('id', ids)
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: `${ids.length} analysis${ids.length > 1 ? 'es' : ''} deleted.`,
      });
      
      return true;
    } catch (error) {
      console.error('Error deleting analyses:', error);
      toast({
        title: "Error",
        description: "Failed to delete analyses.",
        variant: "destructive",
      });
      return false;
    }
  }, [user, toast]);

  return {
    fetchAnalysisHistory,
    saveAnalysis,
    deleteAnalyses,
    loading,
    isSaving
  };
}
