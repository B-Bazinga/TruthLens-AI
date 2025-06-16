
import { Shield, Brain, Eye, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const Features = () => {
  const features = [
    {
      icon: Brain,
      title: "Advanced AI Analysis",
      description: "State-of-the-art transformer models trained on extensive fake news datasets for accurate detection."
    },
    {
      icon: Eye,
      title: "Transparent Reasoning",
      description: "Clear explanations for every prediction, helping you understand why content was flagged."
    },
    {
      icon: Shield,
      title: "High Accuracy",
      description: "Robust detection capabilities with confidence scoring to help you make informed decisions."
    },
    {
      icon: Users,
      title: "User Feedback Loop",
      description: "Continuous improvement through user feedback and model retraining on new data patterns."
    }
  ];

  return (
    <section id="features" className="space-y-8">
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold">Why Choose TruthLens?</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Our advanced AI system combines cutting-edge technology with transparent reasoning to help you identify misinformation
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {features.map((feature, index) => (
          <Card key={index} className="bg-card/50 backdrop-blur hover:bg-card/70 transition-colors duration-300">
            <CardHeader className="text-center">
              <feature.icon className="h-12 w-12 text-primary mx-auto mb-4" />
              <CardTitle className="text-lg">{feature.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {feature.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
};
