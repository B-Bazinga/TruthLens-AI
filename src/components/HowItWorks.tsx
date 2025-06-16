
import { FileText, Brain, CheckCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const HowItWorks = () => {
  const steps = [
    {
      icon: FileText,
      title: "Input Article",
      description: "Paste or type the news article you want to verify into our analyzer.",
      step: "01"
    },
    {
      icon: Brain,
      title: "AI Analysis",
      description: "Our transformer-based model analyzes linguistic patterns, source credibility, and factual consistency.",
      step: "02"
    },
    {
      icon: CheckCircle,
      title: "Get Results",
      description: "Receive a clear verdict with confidence score and detailed explanation of the analysis.",
      step: "03"
    }
  ];

  return (
    <section id="how-it-works" className="space-y-8">
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold">How It Works</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Our three-step process makes fake news detection simple and transparent
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {steps.map((step, index) => (
          <div key={index} className="relative">
            <Card className="bg-card/50 backdrop-blur text-center">
              <CardHeader>
                <div className="relative">
                  <div className="absolute -top-4 -right-4 bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                    {step.step}
                  </div>
                  <step.icon className="h-12 w-12 text-primary mx-auto mb-4" />
                  <CardTitle className="text-xl">{step.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  {step.description}
                </p>
              </CardContent>
            </Card>
            
            {index < steps.length - 1 && (
              <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2 w-8 h-0.5 bg-primary/30" />
            )}
          </div>
        ))}
      </div>
    </section>
  );
};
