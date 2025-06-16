
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Trash2, FileText, Calendar } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AnalysisHistoryItem {
  id: string;
  title: string;
  article_text: string;
  prediction: string;
  confidence_score: number;
  explanation: string;
  key_factors: string[];
  created_at: string;
}

export function AnalysisHistory() {
  const [history, setHistory] = useState<AnalysisHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<AnalysisHistoryItem | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const { data, error } = await supabase
        .from('analysis_history')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setHistory(data || []);
    } catch (error) {
      console.error('Error fetching history:', error);
      toast({
        title: "Error loading history",
        description: "Failed to load analysis history.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteItem = async (id: string) => {
    try {
      const { error } = await supabase
        .from('analysis_history')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setHistory(prev => prev.filter(item => item.id !== id));
      if (selectedItem?.id === id) {
        setSelectedItem(null);
      }

      toast({
        title: "Deleted",
        description: "Analysis deleted successfully.",
      });
    } catch (error) {
      console.error('Error deleting item:', error);
      toast({
        title: "Error",
        description: "Failed to delete analysis.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center p-8">Loading history...</div>;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
      {/* History List */}
      <div className="lg:col-span-1">
        <Card className="h-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Analysis History
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[500px]">
              {history.length === 0 ? (
                <div className="p-4 text-center text-muted-foreground">
                  No analysis history yet. Start analyzing articles to see them here.
                </div>
              ) : (
                <div className="space-y-2 p-4">
                  {history.map((item) => (
                    <div
                      key={item.id}
                      className={`group p-3 rounded-lg border cursor-pointer transition-colors ${
                        selectedItem?.id === item.id ? 'bg-primary/10 border-primary' : 'hover:bg-muted/50'
                      }`}
                      onClick={() => setSelectedItem(item)}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm truncate">{item.title}</h4>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant={item.prediction === 'real' ? 'default' : 'destructive'} className="text-xs">
                              {item.prediction}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {item.confidence_score}%
                            </span>
                          </div>
                          <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            {new Date(item.created_at).toLocaleDateString()}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 opacity-0 group-hover:opacity-100 hover:bg-destructive/10 hover:text-destructive transition-all duration-200"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteItem(item.id);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Detail View */}
      <div className="lg:col-span-2">
        <Card className="h-full">
          <CardHeader>
            <CardTitle>
              {selectedItem ? selectedItem.title : 'Select an analysis to view details'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedItem ? (
              <ScrollArea className="h-[500px]">
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h3 className="font-semibold mb-2">Prediction</h3>
                      <Badge variant={selectedItem.prediction === 'real' ? 'default' : 'destructive'} className="text-lg px-4 py-2">
                        {selectedItem.prediction === 'real' ? 'Likely Real' : 'Likely Fake'}
                      </Badge>
                    </div>
                    <div>
                      <h3 className="font-semibold mb-2">Confidence Score</h3>
                      <div className="text-2xl font-bold">{selectedItem.confidence_score}%</div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2">Article Text</h3>
                    <div className="bg-muted/50 p-4 rounded-lg max-h-40 overflow-y-auto">
                      <p className="text-sm whitespace-pre-wrap">{selectedItem.article_text}</p>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2">AI Explanation</h3>
                    <p className="text-muted-foreground">{selectedItem.explanation}</p>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2">Key Analysis Factors</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {selectedItem.key_factors?.map((factor, index) => (
                        <Badge key={index} variant="outline" className="justify-center py-2">
                          {factor}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      Analyzed on {new Date(selectedItem.created_at).toLocaleString()}
                    </div>
                  </div>
                </div>
              </ScrollArea>
            ) : (
              <div className="flex items-center justify-center h-[500px] text-muted-foreground">
                Select an analysis from the history to view details
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
