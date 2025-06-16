import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Star, ThumbsUp, ThumbsDown } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useFeedbackTraining } from '@/hooks/useFeedbackTraining';

interface FeedbackSystemProps {
  articleText: string;
  modelPrediction: string;
  confidenceScore: number;
  modelUsedType?: string;
  modelUsedName?: string;
  onFeedbackSubmitted: (feedback: any) => void;
}

export function FeedbackSystem({
  articleText,
  modelPrediction,
  confidenceScore,
  modelUsedType,
  modelUsedName,
  onFeedbackSubmitted
}: {
  articleText: string;
  modelPrediction: string;
  confidenceScore: number;
  modelUsedType?: string;
  modelUsedName?: string;
  onFeedbackSubmitted: (feedback: any) => void;
}) {
  const [rating, setRating] = useState<number>(0);
  const [feedback, setFeedback] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const { toast } = useToast();
  const { processFeedbackForTraining } = useFeedbackTraining();

  const submitFeedback = async () => {
    if (rating === 0) {
      toast({
        title: "Please provide a rating",
        description: "Select a star rating before submitting feedback.",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);

    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError) {
        console.error('Auth error:', userError);
        throw new Error('Authentication failed');
      }
      
      if (!user) {
        toast({
          title: "Please sign in",
          description: "You need to be signed in to submit feedback.",
          variant: "destructive",
        });
        return;
      }

      const feedbackData = {
        user_id: user.id,
        article_text: articleText,
        model_prediction: modelPrediction,
        confidence_score: Math.round(confidenceScore * 100) / 100, // Ensure proper precision
        user_rating: rating,
        user_feedback: feedback.trim() || null
      };

      console.log('Submitting feedback data:', feedbackData);

      const { data: feedbackRecord, error } = await supabase
        .from('feedback')
        .insert([feedbackData])
        .select()
        .single();

      if (error) {
        console.error('Database error:', error);
        throw error;
      }

      console.log('Feedback record created:', feedbackRecord);

      // Process feedback for model training
      try {
        await processFeedbackForTraining({
          ...feedbackData,
          timestamp: new Date().toISOString()
        }, feedbackRecord.id);
        
        console.log('Feedback processed for training successfully');
      } catch (trainingError) {
        console.error('Training processing error:', trainingError);
        // Don't fail the entire feedback submission if training processing fails
      }

      setSubmitted(true);
      
      // Call the callback
      if (onFeedbackSubmitted) {
        onFeedbackSubmitted({
          ...feedbackData,
          timestamp: new Date().toISOString()
        });
      }

      toast({
        title: "Thank you!",
        description: "Your feedback has been submitted successfully and will help improve our AI model.",
      });
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast({
        title: "Error",
        description: "Failed to submit feedback. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <Card className="bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-800">
        <CardContent className="pt-6">
          <div className="text-center">
            <ThumbsUp className="h-12 w-12 text-green-600 dark:text-green-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-green-800 dark:text-green-200">Feedback Submitted!</h3>
            <p className="text-green-600 dark:text-green-400 mt-2">Thank you for helping us improve our AI model.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="mt-8 space-y-4">
      {/* Show which model was used */}
      <div className="flex items-center space-x-2">
        <span className="font-semibold text-xs">Model Used:</span>
        <span className="px-2 py-1 text-xs rounded border bg-muted/40 dark:bg-background/60">{modelUsedName}</span>
      </div>
      <Card className="mt-6 bg-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5" />
            Rate This Analysis
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground mb-3">
              How accurate do you think this prediction is?
            </p>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  className="transition-colors hover:scale-110"
                >
                  <Star
                    className={`h-8 w-8 ${
                      star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300 dark:text-gray-600'
                    }`}
                  />
                </button>
              ))}
              <span className="ml-2 text-sm text-muted-foreground">
                {rating > 0 && (
                  rating === 1 ? 'Very Poor' :
                  rating === 2 ? 'Poor' :
                  rating === 3 ? 'Average' :
                  rating === 4 ? 'Good' : 'Excellent'
                )}
              </span>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">
              Additional Comments (Optional)
            </label>
            <Textarea
              placeholder="Tell us what you think about this analysis..."
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              className="min-h-[100px] bg-background border-input text-foreground"
            />
          </div>

          <Button 
            onClick={submitFeedback} 
            disabled={submitting || rating === 0}
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {submitting ? 'Submitting...' : 'Submit Feedback'}
          </Button>

          <p className="text-xs text-muted-foreground text-center">
            Your feedback helps us improve our AI model and provide better predictions.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
