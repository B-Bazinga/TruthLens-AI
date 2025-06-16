
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useDataCache } from './useDataCache';

interface UserSettings {
  id?: string;
  ai_model_type: 'built-in' | 'transformers' | 'custom';
  custom_endpoint?: string;
  api_key?: string;
  transformer_model?: string;
}

export function useOptimizedUserSettings() {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const { getCached, setCache, invalidateCache } = useDataCache();

  const CACHE_KEY = `user_settings_${user?.id}`;

  const loadSettings = useCallback(async (useCache = true): Promise<UserSettings | null> => {
    if (!user) return null;

    // Try cache first
    if (useCache) {
      const cached = getCached<UserSettings>(CACHE_KEY);
      if (cached) {
        return cached;
      }
    }

    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('user_settings')
        .select('id, ai_model_type, custom_endpoint, api_key, transformer_model')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;

      const settings: UserSettings = data ? {
        id: data.id,
        ai_model_type: data.ai_model_type as 'built-in' | 'transformers' | 'custom',
        custom_endpoint: data.custom_endpoint || undefined,
        api_key: data.api_key || undefined,
        transformer_model: data.transformer_model || undefined
      } : {
        ai_model_type: 'built-in' as const,
        transformer_model: 'cardiffnlp/twitter-roberta-base-sentiment-latest'
      };

      // Cache the results
      setCache(CACHE_KEY, settings, 10 * 60 * 1000); // 10 minutes cache
      
      return settings;
    } catch (error) {
      console.error('Error loading settings:', error);
      toast({
        title: "Error",
        description: "Failed to load user settings.",
        variant: "destructive",
      });
      return null;
    } finally {
      setLoading(false);
    }
  }, [user, getCached, setCache, CACHE_KEY, toast]);

  const saveSettings = useCallback(async (settings: Omit<UserSettings, 'id'>): Promise<boolean> => {
    if (!user) return false;

    try {
      setSaving(true);

      const { data, error } = await supabase
        .from('user_settings')
        .upsert({
          user_id: user.id,
          ...settings
        }, {
          onConflict: 'user_id'
        })
        .select('id, ai_model_type, custom_endpoint, api_key, transformer_model')
        .single();

      if (error) throw error;

      // Update cache immediately with properly typed data
      const cachedSettings: UserSettings = {
        id: data.id,
        ai_model_type: data.ai_model_type as 'built-in' | 'transformers' | 'custom',
        custom_endpoint: data.custom_endpoint || undefined,
        api_key: data.api_key || undefined,
        transformer_model: data.transformer_model || undefined
      };
      
      setCache(CACHE_KEY, cachedSettings, 10 * 60 * 1000);

      toast({
        title: "Settings saved",
        description: "Your preferences have been updated successfully.",
      });

      return true;
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive",
      });
      return false;
    } finally {
      setSaving(false);
    }
  }, [user, setCache, CACHE_KEY, toast]);

  const clearSettingsCache = useCallback(() => {
    invalidateCache(CACHE_KEY);
  }, [invalidateCache, CACHE_KEY]);

  return {
    loadSettings,
    saveSettings,
    clearSettingsCache,
    loading,
    saving
  };
}
