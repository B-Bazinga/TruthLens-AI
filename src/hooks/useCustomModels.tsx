
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

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

export function useCustomModels() {
  const [models, setModels] = useState<CustomModel[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const loadModels = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('custom_models')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Type assertion to ensure download_status matches our interface
      const typedModels = (data || []).map(model => ({
        ...model,
        download_status: model.download_status as 'pending' | 'downloading' | 'ready' | 'error'
      }));
      
      setModels(typedModels);
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
  };

  const addModel = async (modelData: {
    model_name: string;
    model_id: string;
    model_type: string;
    description?: string;
  }) => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('custom_models')
        .insert([{
          ...modelData,
          user_id: user.id,
          download_status: 'pending'
        }])
        .select()
        .single();

      if (error) throw error;

      // Type assertion for the new model
      const typedModel = {
        ...data,
        download_status: data.download_status as 'pending' | 'downloading' | 'ready' | 'error'
      };

      setModels(prev => [typedModel, ...prev]);
      
      toast({
        title: "Model Added",
        description: `${modelData.model_name} has been added to your custom models.`,
      });

      // Start download process (simulate for now)
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
  };

  const updateModelStatus = async (modelId: string, status: CustomModel['download_status'], errorMessage?: string) => {
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
    } catch (error) {
      console.error('Error updating model status:', error);
    }
  };

  const toggleModelActive = async (modelId: string, isActive: boolean) => {
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
  };

  const deleteModel = async (modelId: string) => {
    try {
      const { error } = await supabase
        .from('custom_models')
        .delete()
        .eq('id', modelId);

      if (error) throw error;

      setModels(prev => prev.filter(model => model.id !== modelId));
      
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
  };

  useEffect(() => {
    loadModels();
  }, [user]);

  return {
    models,
    loading,
    addModel,
    toggleModelActive,
    deleteModel,
    loadModels
  };
}
