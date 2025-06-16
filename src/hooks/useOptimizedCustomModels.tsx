
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useDataCache } from './useDataCache';

interface CustomModel {
  id: string;
  model_name: string;
  model_id: string;
  model_type: string;
  description?: string;
  is_active: boolean;
  download_status: 'pending' | 'downloading' | 'ready' | 'error';
  error_message?: string;
  created_at: string;
}

export function useOptimizedCustomModels() {
  const [models, setModels] = useState<CustomModel[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const { getCached, setCache, invalidateCache } = useDataCache();

  const CACHE_KEY = `custom_models_${user?.id}`;

  const loadModels = useCallback(async (useCache = true) => {
    if (!user) return;

    // Try cache first
    if (useCache) {
      const cached = getCached<CustomModel[]>(CACHE_KEY);
      if (cached) {
        setModels(cached);
        return;
      }
    }

    try {
      setLoading(true);
      
      // Select only necessary fields for list view
      const { data, error } = await supabase
        .from('custom_models')
        .select(`
          id,
          model_name,
          model_id,
          model_type,
          is_active,
          download_status,
          created_at
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const typedModels = (data || []).map(model => ({
        ...model,
        download_status: model.download_status as CustomModel['download_status']
      }));
      
      setModels(typedModels);
      
      // Cache the results
      setCache(CACHE_KEY, typedModels, 2 * 60 * 1000); // 2 minutes cache
      
    } catch (error) {
      console.error('Error loading models:', error);
      toast({
        title: "Error",
        description: "Failed to load custom models.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [user, getCached, setCache, CACHE_KEY, toast]);

  const addModel = useCallback(async (modelData: {
    model_name: string;
    model_id: string;
    model_type: string;
    description?: string;
  }) => {
    if (!user) return;

    try {
      setLoading(true);
      
      // Check for duplicates before inserting
      const { data: existing } = await supabase
        .from('custom_models')
        .select('id')
        .eq('user_id', user.id)
        .eq('model_id', modelData.model_id)
        .maybeSingle();

      if (existing) {
        toast({
          title: "Model Already Exists",
          description: "This model is already in your collection.",
          variant: "destructive",
        });
        return null;
      }

      const { data, error } = await supabase
        .from('custom_models')
        .insert({
          ...modelData,
          user_id: user.id,
          download_status: 'pending'
        })
        .select('id, model_name, model_id, model_type, is_active, download_status, created_at')
        .single();

      if (error) throw error;

      const typedModel = {
        ...data,
        download_status: data.download_status as CustomModel['download_status']
      };

      setModels(prev => [typedModel, ...prev]);
      
      // Invalidate cache
      invalidateCache(CACHE_KEY);
      
      toast({
        title: "Model Added",
        description: `${modelData.model_name} has been added to your custom models.`,
      });

      // Simulate download process
      setTimeout(() => updateModelStatus(data.id, 'downloading'), 1000);
      setTimeout(() => updateModelStatus(data.id, 'ready'), 3000);

      return typedModel;
    } catch (error) {
      console.error('Error adding model:', error);
      toast({
        title: "Error",
        description: "Failed to add custom model.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  }, [user, toast, invalidateCache, CACHE_KEY]);

  const updateModelStatus = useCallback(async (
    modelId: string, 
    status: CustomModel['download_status'], 
    errorMessage?: string
  ) => {
    try {
      const { error } = await supabase
        .from('custom_models')
        .update({ 
          download_status: status,
          error_message: errorMessage,
          updated_at: new Date().toISOString()
        })
        .eq('id', modelId);

      if (error) throw error;

      setModels(prev => prev.map(model => 
        model.id === modelId 
          ? { ...model, download_status: status, error_message: errorMessage }
          : model
      ));
      
      // Invalidate cache on status change
      invalidateCache(CACHE_KEY);
    } catch (error) {
      console.error('Error updating model status:', error);
    }
  }, [invalidateCache, CACHE_KEY]);

  const toggleModelActive = useCallback(async (modelId: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('custom_models')
        .update({ 
          is_active: isActive,
          updated_at: new Date().toISOString()
        })
        .eq('id', modelId);

      if (error) throw error;

      setModels(prev => prev.map(model => 
        model.id === modelId 
          ? { ...model, is_active: isActive }
          : model
      ));

      invalidateCache(CACHE_KEY);

      toast({
        title: isActive ? "Model Activated" : "Model Deactivated",
        description: `Model has been ${isActive ? 'activated' : 'deactivated'}.`,
      });
    } catch (error) {
      console.error('Error toggling model status:', error);
      toast({
        title: "Error",
        description: "Failed to update model status.",
        variant: "destructive",
      });
    }
  }, [toast, invalidateCache, CACHE_KEY]);

  const deleteModel = useCallback(async (modelId: string) => {
    try {
      const { error } = await supabase
        .from('custom_models')
        .delete()
        .eq('id', modelId);

      if (error) throw error;

      setModels(prev => prev.filter(model => model.id !== modelId));
      invalidateCache(CACHE_KEY);
      
      toast({
        title: "Model Deleted",
        description: "Custom model has been removed.",
      });
    } catch (error) {
      console.error('Error deleting model:', error);
      toast({
        title: "Error",
        description: "Failed to delete model.",
        variant: "destructive",
      });
    }
  }, [toast, invalidateCache, CACHE_KEY]);

  useEffect(() => {
    loadModels();
  }, [user]);

  return {
    models,
    loading,
    addModel,
    toggleModelActive,
    deleteModel,
    loadModels,
    updateModelStatus
  };
}
