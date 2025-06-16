import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, AlertTriangle, CheckCircle, FileText, Brain, BarChart3, Search, Edit3, Building } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useAIAnalysis } from "@/hooks/useAIAnalysis";
import { useAnalysisHistory } from "@/hooks/useAnalysisHistory";
import { FeedbackSystem } from "./FeedbackSystem";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const NewsAnalyzer = () => {
  const [articleText, setArticleText] = useState("");
  const [articleTitle, setArticleTitle] = useState("");
  const [analysisResult, setAnalysisResult] = useState<{
    prediction: "real" | "fake";
    confidence: number;
    explanation: string;
    keyFactors: string[];
    detailedAnalysis?: {
      contentLanguage: any;
      structural: any;
      credibility: any;
      linguistic: any;
    };
    modelUsed?: {
      type: string;
      name: string;
    };
  } | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();
  const { analyzeText, isAnalyzing } = useAIAnalysis();
  const { saveAnalysis, isSaving } = useAnalysisHistory();

  const handleAnalyze = async () => {
    if (!user) {
      toast({
        title: "Please sign in",
        description: "You need to be signed in to use the analyzer.",
        variant: "destructive",
      });
      return;
    }

    const result = await analyzeText(articleText, articleTitle);
    if (result) {
      setAnalysisResult(result);
      
      // Save analysis to history
      await saveAnalysis(
        articleText,
        articleTitle,
        result.prediction,
        result.confidence,
        result.explanation,
        result.keyFactors
      );

      toast({
        title: "Analysis complete",
        description: `Article classified as ${result.prediction} with ${result.confidence}% confidence.`,
      });
    }
  };

  const renderDetailedSection = (title: string, icon: any, data: any, color: string) => {
    if (!data || (!data.flags || data.flags.length === 0)) {
      return (
        <Card className="bg-card/50 backdrop-blur">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              {icon}
              {title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-sm">No specific indicators found in this category.</p>
          </CardContent>
        </Card>
      );
    }

    return (
      <Card className="bg-card/50 backdrop-blur">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            {icon}
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {data.flags.map((flag: string, index: number) => (
              <Badge 
                key={index} 
                variant="outline" 
                className={`justify-start py-2 text-xs ${color}`}
              >
                {flag}
              </Badge>
            ))}
          </div>
          {data.metrics && Object.keys(data.metrics).length > 0 && (
            <div className="pt-2 border-t border-border">
              <p className="text-sm text-muted-foreground mb-2">Metrics:</p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {Object.entries(data.metrics).map(([key, value]: [string, any]) => (
                  <div key={key} className="flex justify-between">
                    <span className="capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}:</span>
                    <span className="font-medium">{typeof value === 'number' ? value.toFixed(2) : String(value)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <section id="analyzer" className="space-y-8">
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold">Analyze News Article</h2>
        <p className="text-muted-foreground">
          Paste your news article below and let our comprehensive AI analyze its credibility across multiple dimensions
        </p>
        {!user && (
          <p className="text-sm text-orange-600 bg-orange-50 dark:bg-orange-950/20 dark:text-orange-400 p-3 rounded-lg">
            Please sign in to use the analyzer and save your analysis history.
          </p>
        )}
      </div>
      
      <Card className="bg-card/50 backdrop-blur border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Article Input
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="article-title">Article Title (Optional)</Label>
            <Input
              id="article-title"
              placeholder="Enter the article title..."
              value={articleTitle}
              onChange={(e) => setArticleTitle(e.target.value)}
              className="bg-background border-input text-foreground"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="article-text">Article Text</Label>
            <Textarea
              id="article-text"
              placeholder="Paste the news article text here..."
              value={articleText}
              onChange={(e) => setArticleText(e.target.value)}
              className="min-h-[200px] resize-none bg-background border-input text-foreground"
            />
          </div>
          
          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">
              {articleText.length} characters
            </p>
            <Button 
              onClick={handleAnalyze} 
              disabled={isAnalyzing || isSaving || !articleText.trim() || !user}
              className="min-w-[120px] bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-600 dark:hover:bg-blue-700 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isAnalyzing || isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin text-white" />
                  {isAnalyzing ? "Analyzing..." : "Saving..."}
                </>
              ) : (
                <>
                  <Brain className="mr-2 h-4 w-4 text-white" />
                  Analyze
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {analysisResult && (
        <>
          <Card className="bg-card/50 backdrop-blur border-2 border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {analysisResult.prediction === "real" ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                )}
                Analysis Results
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center space-x-3 mb-2">
                <span className="font-medium text-sm">Model used:</span>
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-muted/60 dark:bg-muted text-xs font-mono border border-border">
                  {analysisResult.modelUsed?.name || "Built-in Rule-based Model"}
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h3 className="font-semibold">Prediction</h3>
                  <Badge 
                    variant={analysisResult.prediction === "real" ? "default" : "destructive"}
                    className="text-lg px-4 py-2"
                  >
                    {analysisResult.prediction === "real" ? "Likely Real" : "Likely Fake"}
                  </Badge>
                </div>
                
                <div className="space-y-3">
                  <h3 className="font-semibold">Confidence Score</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Confidence</span>
                      <span>{analysisResult.confidence}%</span>
                    </div>
                    <Progress value={analysisResult.confidence} className="h-3" />
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                <h3 className="font-semibold">AI Explanation</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {analysisResult.explanation}
                </p>
              </div>
              
              <div className="space-y-3">
                <h3 className="font-semibold">Key Analysis Factors</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {analysisResult.keyFactors.map((factor, index) => (
                    <Badge key={index} variant="outline" className="justify-center py-2">
                      {factor}
                    </Badge>
                  ))}
                </div>
              </div>

              {analysisResult.detailedAnalysis && (
                <div className="space-y-3">
                  <h3 className="font-semibold">Detailed Analysis</h3>
                  <Tabs defaultValue="content" className="w-full">
                    <TabsList className="grid w-full grid-cols-4">
                      <TabsTrigger value="content">Content</TabsTrigger>
                      <TabsTrigger value="structure">Structure</TabsTrigger>
                      <TabsTrigger value="credibility">Credibility</TabsTrigger>
                      <TabsTrigger value="linguistic">Linguistic</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="content" className="space-y-4">
                      {renderDetailedSection(
                        "Content & Language Analysis",
                        <BarChart3 className="h-4 w-4" />,
                        analysisResult.detailedAnalysis.contentLanguage,
                        "border-red-200 text-red-700 dark:border-red-800 dark:text-red-300"
                      )}
                    </TabsContent>
                    
                    <TabsContent value="structure" className="space-y-4">
                      {renderDetailedSection(
                        "Structural Analysis",
                        <Building className="h-4 w-4" />,
                        analysisResult.detailedAnalysis.structural,
                        "border-blue-200 text-blue-700 dark:border-blue-800 dark:text-blue-300"
                      )}
                    </TabsContent>
                    
                    <TabsContent value="credibility" className="space-y-4">
                      {renderDetailedSection(
                        "Credibility & Sources",
                        <Search className="h-4 w-4" />,
                        analysisResult.detailedAnalysis.credibility,
                        "border-green-200 text-green-700 dark:border-green-800 dark:text-green-300"
                      )}
                    </TabsContent>
                    
                    <TabsContent value="linguistic" className="space-y-4">
                      {renderDetailedSection(
                        "Linguistic Analysis",
                        <Edit3 className="h-4 w-4" />,
                        analysisResult.detailedAnalysis.linguistic,
                        "border-purple-200 text-purple-700 dark:border-purple-800 dark:text-purple-300"
                      )}
                    </TabsContent>
                  </Tabs>
                </div>
              )}
            </CardContent>
          </Card>

          <FeedbackSystem
            articleText={articleText}
            modelPrediction={analysisResult.prediction}
            confidenceScore={analysisResult.confidence}
            modelUsedType={analysisResult.modelUsed?.type}
            modelUsedName={analysisResult.modelUsed?.name}
            onFeedbackSubmitted={(feedback) => {
              console.log('Feedback submitted for model improvement:', feedback);
              toast({
                title: "Feedback Received",
                description: "Thank you! Your feedback will help improve our AI model's accuracy.",
              });
            }}
          />
        </>
      )}
    </section>
  );
};
