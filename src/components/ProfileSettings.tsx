import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { CustomModelManager } from './CustomModelManager';

interface UserSettings {
  ai_model_type: 'built-in' | 'transformers' | 'custom';
  custom_endpoint?: string;
  api_key?: string;
  transformer_model?: string;
}

export function ProfileSettings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [settings, setSettings] = useState<UserSettings>({
    ai_model_type: 'built-in',
    transformer_model: 'cardiffnlp/twitter-roberta-base-sentiment-latest'
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadSettings();
  }, [user]);

  const loadSettings = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Error loading settings:', error);
        return;
      }

      if (data) {
        setSettings({
          ai_model_type: (data.ai_model_type || 'built-in') as 'built-in' | 'transformers' | 'custom',
          custom_endpoint: data.custom_endpoint || '',
          api_key: data.api_key || '',
          transformer_model: data.transformer_model || 'cardiffnlp/twitter-roberta-base-sentiment-latest'
        });
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const saveSettings = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const settingsData = {
        user_id: user.id,
        ai_model_type: settings.ai_model_type,
        custom_endpoint: settings.ai_model_type === 'custom' ? settings.custom_endpoint : null,
        api_key: settings.ai_model_type === 'custom' ? settings.api_key : null,
        transformer_model: settings.ai_model_type === 'transformers' ? settings.transformer_model : null,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('user_settings')
        .upsert(settingsData, {
          onConflict: 'user_id'
        });

      if (error) {
        console.error('Save error:', error);
        throw error;
      }

      toast({
        title: "Settings saved",
        description: "Your AI model preferences have been updated.",
      });
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="models" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="models">AI Models</TabsTrigger>
          <TabsTrigger value="custom">Custom Models</TabsTrigger>
        </TabsList>
        
        <TabsContent value="models" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>AI Model Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="model-type">AI Model Type</Label>
                <Select 
                  value={settings.ai_model_type} 
                  onValueChange={(value: 'built-in' | 'transformers' | 'custom') => 
                    setSettings({...settings, ai_model_type: value})
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select model type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="built-in">Built-in Rule-based Analysis</SelectItem>
                    <SelectItem value="transformers">Transformer.js Models</SelectItem>
                    <SelectItem value="custom">Custom API Endpoint</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {settings.ai_model_type === 'transformers' && (
                <div className="space-y-2">
                  <Label htmlFor="transformer-model">Transformer Model</Label>
                  <Select 
                    value={settings.transformer_model} 
                    onValueChange={(value) => setSettings({...settings, transformer_model: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select transformer model" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cardiffnlp/twitter-roberta-base-sentiment-latest">
                        Twitter RoBERTa Sentiment (General)
                      </SelectItem>
                      <SelectItem value="unitary/toxic-bert">
                        Toxic BERT (Content Safety)
                      </SelectItem>
                      <SelectItem value="martin-ha/toxic-comment-model">
                        Toxic Comment Detector
                      </SelectItem>
                      <SelectItem value="Hello-SimpleAI/chatgpt-detector-roberta">
                        ChatGPT Content Detector
                      </SelectItem>
                      <SelectItem value="roberta-base-openai-detector">
                        OpenAI Content Detector
                      </SelectItem>
                      <SelectItem value="andreas122001/roberta-mixed-detector">
                        Mixed AI Content Detector
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-muted-foreground">
                    Transformer.js models run locally in your browser for better privacy. AI-generated content detectors help identify artificially created text.
                  </p>
                </div>
              )}

              {settings.ai_model_type === 'custom' && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="endpoint">Custom API Endpoint</Label>
                    <Input
                      id="endpoint"
                      type="url"
                      placeholder="https://api.example.com/analyze"
                      value={settings.custom_endpoint || ''}
                      onChange={(e) => setSettings({...settings, custom_endpoint: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="api-key">API Key (Optional)</Label>
                    <Input
                      id="api-key"
                      type="password"
                      placeholder="Your API key"
                      value={settings.api_key || ''}
                      onChange={(e) => setSettings({...settings, api_key: e.target.value})}
                    />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Your custom endpoint should accept POST requests with JSON containing a "text" field
                    and return JSON with "prediction" (real/fake), "confidence" (0-1), and "explanation" fields.
                  </p>
                </div>
              )}

              <Button onClick={saveSettings} disabled={loading}>
                {loading ? 'Saving...' : 'Save Settings'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="custom" className="space-y-6">
          <CustomModelManager />
        </TabsContent>
      </Tabs>
    </div>
  );
}
