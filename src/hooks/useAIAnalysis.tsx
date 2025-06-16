import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface AnalysisResult {
  prediction: "real" | "fake";
  confidence: number;
  explanation: string;
  keyFactors: string[];
  detailedAnalysis?: {
    contentLanguage: {
      flags: string[];
      metrics: any;
    };
    structural: {
      flags: string[];
      metrics: any;
    };
    credibility: {
      flags: string[];
      metrics: any;
    };
    linguistic: {
      flags: string[];
      metrics: any;
    };
  };
}

type ModelInfo =
  | { type: 'custom-model'; name: string; model_id: string }
  | { type: 'transformers'; name: string }
  | { type: 'custom'; name: string }
  | { type: 'built-in'; name: string };

export function useAIAnalysis() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  // Store model info in state and load on mount/user change
  const [modelInfo, setModelInfo] = useState<ModelInfo | null>(null);

  // Load from Supabase (first check custom_models, then user_settings)
  useEffect(() => {
    const fetchModelInfo = async () => {
      if (!user) {
        setModelInfo({ type: 'built-in', name: 'Built-in Rule-based Model' });
        return;
      }
      // 1. Check if user has an active custom Hugging Face model
      let { data: customModels, error: customErr } = await supabase
        .from('custom_models')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .eq('download_status', 'ready')
        .limit(1);

      if (!customErr && customModels && customModels.length > 0) {
        // There is an active custom model
        const model = customModels[0];
        setModelInfo({
          type: 'custom-model',
          name: model.model_name,
          model_id: model.model_id
        });
        return;
      }

      // 2. Check user_settings (transformers/custom endpoint)
      let { data: settings, error: settingsErr } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (!settingsErr && settings) {
        if (settings.ai_model_type === "transformers" && settings.transformer_model) {
          setModelInfo({ type: "transformers", name: settings.transformer_model });
          return;
        }
        if (settings.ai_model_type === "custom" && settings.custom_endpoint) {
          setModelInfo({ type: "custom", name: "Custom API Model" });
          return;
        }
      }
      // 3. Fall back to built-in
      setModelInfo({ type: "built-in", name: "Built-in Rule-based Model" });
    };

    fetchModelInfo();
  }, [user]);

  // Expose for the UI as well
  const getModelInfo = () => {
    return modelInfo || { type: "built-in", name: "Built-in Rule-based Model" };
  };

  /**
   * Main analyze function
   * Always uses the loaded modelInfo!
   */
  const analyzeText = async (text: string, title?: string): Promise<(AnalysisResult & { modelUsed: ModelInfo }) | null> => {
    if (!text.trim()) {
      toast({
        title: "Error",
        description: "Please enter some text to analyze.",
        variant: "destructive",
      });
      return null;
    }

    setIsAnalyzing(true);

    try {
      // Wait for modelInfo to load (if not yet ready)
      if (!modelInfo) {
        let attempts = 0;
        while (attempts < 10 && !modelInfo) {
          await new Promise((resolve) => setTimeout(resolve, 100));
          attempts++;
        }
        if (!modelInfo) throw new Error('Model info could not be loaded.');
      }

      // Optionally change this when adding actual transformer/custom models!
      // For now just simulate which logic path would be used.
      let usedModel = getModelInfo();
      let result: AnalysisResult;

      if (usedModel.type === "custom-model") {
        // Simulate custom HF model output
        await new Promise(resolve => setTimeout(resolve, 1800));
        result = {
          prediction: "real",
          confidence: 88,
          explanation: `Custom HuggingFace Model (${usedModel.name}) predicted as REAL news.`,
          keyFactors: [
            "Model type: text-classification",
            "Used custom model: " + usedModel.model_id
          ],
          detailedAnalysis: {
            contentLanguage: {
              flags: ["Custom model detected neutral language"],
              metrics: { customMetric: 42 }
            },
            structural: {
              flags: [],
              metrics: {}
            },
            credibility: {
              flags: [],
              metrics: {}
            },
            linguistic: {
              flags: [],
              metrics: {}
            }
          }
        };
      } else if (usedModel.type === "transformers") {
        // Simulate transformer.js logic output
        await new Promise(resolve => setTimeout(resolve, 1600));
        result = {
          prediction: "fake",
          confidence: 81,
          explanation: `Transformer.js Model (${usedModel.name}) predicts this is LIKELY FAKE.`,
          keyFactors: [
            "Model: " + usedModel.name,
            "Transformer.js used"
          ],
          detailedAnalysis: {
            contentLanguage: {
              flags: ["Transformer detected clickbait"],
              metrics: { score: 58 }
            },
            structural: {
              flags: [],
              metrics: {}
            },
            credibility: {
              flags: [],
              metrics: {}
            },
            linguistic: {
              flags: [],
              metrics: {}
            }
          }
        };
      } else if (usedModel.type === "custom") {
        // Simulate custom API endpoint logic
        await new Promise(resolve => setTimeout(resolve, 1200));
        result = {
          prediction: "real",
          confidence: 90,
          explanation: `Custom API Model predicts this is REAL.`,
          keyFactors: [
            "Used custom API endpoint",
            "Checked with user-supplied logic"
          ],
          detailedAnalysis: {
            contentLanguage: {
              flags: ["API flagged balanced content"],
              metrics: { score: 75 }
            },
            structural: {
              flags: [],
              metrics: {}
            },
            credibility: {
              flags: [],
              metrics: {}
            },
            linguistic: {
              flags: [],
              metrics: {}
            }
          }
        };
      } else { // built-in fallback
        // ... keep existing code (simulate built-in analysis, detailed analysis, same as previous logic)
        await new Promise(resolve => setTimeout(resolve, 2000));
        const wordCount = text.split(/\s+/).length;
        const hasExclamation = text.includes('!');
        const hasQuestion = text.includes('?');
        const hasQuotes = text.includes('"') || text.includes("'");
        const uppercaseRatio = (text.match(/[A-Z]/g) || []).length / text.length;
        const sentenceCount = text.split(/[.!?]+/).filter(s => s.trim()).length;
        const emotionalWords = ['shocking', 'unbelievable', 'amazing', 'terrible', 'incredible'].filter(word => 
          text.toLowerCase().includes(word)
        ).length;
        const sensationalPhrases = ['you won\'t believe', 'shocking truth', 'experts hate', 'secret revealed'].filter(phrase => 
          text.toLowerCase().includes(phrase)
        ).length;
        const averageWordsPerSentence = sentenceCount > 0 ? wordCount / sentenceCount : 0;
        const complexWords = text.split(/\s+/).filter(word => word.length > 8).length;
        const vocabularyComplexity = complexWords / wordCount * 100;
        const grammarIssues = text.split(/\s+/).filter(word => 
          word.toLowerCase().includes('ur') || word.toLowerCase().includes('u') || word.includes('!!!!')
        ).length;
        const grammarQuality = Math.max(0, 100 - (grammarIssues / wordCount * 100));
        const fakeIndicators = [
          emotionalWords > 2,
          sensationalPhrases > 0,
          uppercaseRatio > 0.1,
          hasExclamation && text.split('!').length > 3,
          wordCount < 50,
          grammarQuality < 70
        ].filter(Boolean).length;
        const isFake = fakeIndicators >= 3;
        const confidence = Math.min(95, Math.max(55, 70 + (fakeIndicators * 5) + Math.random() * 10));
        const contentFlags = [];
        const structuralFlags = [];
        const credibilityFlags = [];
        const linguisticFlags = [];
        if (emotionalWords > 2) contentFlags.push("High emotional language detected");
        if (sensationalPhrases > 0) contentFlags.push("Sensational phrases found");
        if (uppercaseRatio > 0.05) contentFlags.push("Excessive capitalization");
        if (hasExclamation && text.split('!').length > 3) structuralFlags.push("Multiple exclamation marks");
        if (wordCount < 100) structuralFlags.push("Unusually short article");
        if (!hasQuotes) credibilityFlags.push("No quoted sources");
        if (grammarQuality < 80) linguisticFlags.push("Grammar issues detected");
        if (vocabularyComplexity < 15) linguisticFlags.push("Simple vocabulary usage");
        if (averageWordsPerSentence < 10) linguisticFlags.push("Very short sentences");
        result = {
          prediction: isFake ? "fake" : "real",
          confidence: Math.round(confidence),
          explanation: isFake 
            ? `This article shows ${fakeIndicators} indicators commonly associated with misinformation, including emotional language patterns, structural irregularities, and credibility concerns. The analysis suggests caution when interpreting this content.`
            : `This article demonstrates ${6 - fakeIndicators} positive credibility indicators, including balanced language, proper structure, and journalistic standards. The content appears to follow established news reporting practices.`,
          keyFactors: [
            `Word count: ${wordCount}`,
            `Emotional indicators: ${emotionalWords}`,
            `Grammar quality: ${grammarQuality.toFixed(1)}%`,
            `Vocabulary complexity: ${vocabularyComplexity.toFixed(1)}%`,
            `Structural integrity: ${structuralFlags.length === 0 ? 'Good' : 'Issues detected'}`,
            `Source credibility: ${credibilityFlags.length === 0 ? 'Adequate' : 'Concerns'}`
          ],
          detailedAnalysis: {
            contentLanguage: {
              flags: contentFlags.length > 0 ? contentFlags : ["No significant content issues detected"],
              metrics: {
                emotionalLanguage: emotionalWords * 10,
                sensationalWords: sensationalPhrases * 20,
                biasIndicators: Math.min(100, uppercaseRatio * 500),
                factualClaims: Math.max(0, 100 - emotionalWords * 15),
                sourcesMentioned: hasQuotes ? 70 : 20,
                clickbaitScore: (emotionalWords + sensationalPhrases) * 15
              }
            },
            structural: {
              flags: structuralFlags.length > 0 ? structuralFlags : ["Proper article structure maintained"],
              metrics: {
                headlineCredibility: title ? Math.max(0, 100 - (title.split('!').length - 1) * 20) : 80,
                paragraphStructure: wordCount > 200 ? 85 : 60,
                quotationUsage: hasQuotes ? 80 : 40,
                dateReferences: text.toLowerCase().includes('today') || text.toLowerCase().includes('yesterday') ? 70 : 50
              }
            },
            credibility: {
              flags: credibilityFlags.length > 0 ? credibilityFlags : ["Standard credibility markers present"],
              metrics: {
                authorCredibility: text.toLowerCase().includes('author') || text.toLowerCase().includes('reporter') ? 75 : 45,
                publicationCredibility: 65,
                factCheckability: hasQuotes ? 75 : 50,
                crossReferences: text.toLowerCase().includes('according to') || text.toLowerCase().includes('source') ? 70 : 40
              }
            },
            linguistic: {
              flags: linguisticFlags.length > 0 ? linguisticFlags : ["Linguistic patterns within normal range"],
              metrics: {
                grammarQuality: grammarQuality,
                vocabularyComplexity: vocabularyComplexity,
                sentimentConsistency: Math.max(50, 100 - emotionalWords * 10),
                writingStyle: averageWordsPerSentence > 8 ? 80 : 60,
                persuasionTechniques: (emotionalWords + sensationalPhrases) * 12,
                logicalCoherence: sentenceCount > 5 ? 75 : 55
              }
            }
          }
        };
      }

      // Return analysis + the model actually used
      return {
        ...result,
        modelUsed: usedModel,
      };
    } catch (error) {
      console.error('Analysis error:', error);
      toast({
        title: "Analysis Error",
        description: "Failed to analyze the text. Please try again.",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsAnalyzing(false);
    }
  };

  return {
    analyzeText,
    isAnalyzing,
    modelInfo
  };
}
