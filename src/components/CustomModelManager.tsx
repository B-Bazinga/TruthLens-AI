
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Download, Trash2, ExternalLink } from 'lucide-react';
import { useCustomModels } from '@/hooks/useCustomModels';

export function CustomModelManager() {
  const { models, loading, addModel, toggleModelActive, deleteModel } = useCustomModels();
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    model_name: '',
    model_id: '',
    model_type: 'text-classification',
    description: ''
  });

  const handleAddModel = async () => {
    if (!formData.model_name || !formData.model_id) return;

    try {
      await addModel(formData);
      setFormData({
        model_name: '',
        model_id: '',
        model_type: 'text-classification',
        description: ''
      });
      setShowAddForm(false);
    } catch (error) {
      // Error handled in hook
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ready': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'downloading': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'error': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Custom Hugging Face Models
            <Button
              onClick={() => setShowAddForm(!showAddForm)}
              size="sm"
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Model
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {showAddForm && (
            <Card className="bg-muted/50">
              <CardContent className="pt-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="model-name">Model Name</Label>
                    <Input
                      id="model-name"
                      placeholder="My Custom Model"
                      value={formData.model_name}
                      onChange={(e) => setFormData({...formData, model_name: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="model-id">Hugging Face Model ID</Label>
                    <Input
                      id="model-id"
                      placeholder="username/model-name"
                      value={formData.model_id}
                      onChange={(e) => setFormData({...formData, model_id: e.target.value})}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="model-type">Model Type</Label>
                  <Select 
                    value={formData.model_type} 
                    onValueChange={(value) => setFormData({...formData, model_type: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="text-classification">Text Classification</SelectItem>
                      <SelectItem value="sentiment-analysis">Sentiment Analysis</SelectItem>
                      <SelectItem value="token-classification">Token Classification</SelectItem>
                      <SelectItem value="question-answering">Question Answering</SelectItem>
                      <SelectItem value="text-generation">Text Generation</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description (Optional)</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe what this model does..."
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleAddModel} disabled={loading}>
                    {loading ? 'Adding...' : 'Add Model'}
                  </Button>
                  <Button variant="outline" onClick={() => setShowAddForm(false)}>
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {models.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Download className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No custom models added yet.</p>
              <p className="text-sm">Add Hugging Face models to enhance your analysis capabilities.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {models.map((model) => (
                <Card key={model.id} className="bg-card/50">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold">{model.model_name}</h3>
                          <Badge className={getStatusColor(model.download_status)}>
                            {model.download_status}
                          </Badge>
                          {model.is_active && (
                            <Badge variant="outline" className="bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                              Active
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-1">
                          <span className="font-medium">Model ID:</span> {model.model_id}
                        </p>
                        <p className="text-sm text-muted-foreground mb-1">
                          <span className="font-medium">Type:</span> {model.model_type}
                        </p>
                        {model.description && (
                          <p className="text-sm text-muted-foreground">{model.description}</p>
                        )}
                        {model.error_message && (
                          <p className="text-sm text-red-600 dark:text-red-400 mt-2">
                            Error: {model.error_message}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={model.is_active}
                            onCheckedChange={(checked) => toggleModelActive(model.id, checked)}
                            disabled={model.download_status !== 'ready'}
                          />
                          <Label className="text-sm">Active</Label>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(`https://huggingface.co/${model.model_id}`, '_blank')}
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deleteModel(model.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
