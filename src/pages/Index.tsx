
import { NewsAnalyzer } from "@/components/NewsAnalyzer";
import { Header } from "@/components/Header";
import { HowItWorks } from "@/components/HowItWorks";
import { Features } from "@/components/Features";

const Index = () => {
  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-16">
          <section className="text-center space-y-6 animate-fade-in">
            <h1 className="text-4xl md:text-6xl font-bold gradient-text">
              TruthLens AI
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Advanced AI-powered fake news detection with transparent reasoning and confidence scoring
            </p>
            <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>Real-time analysis • AI-powered • Transparent results</span>
            </div>
          </section>
          
          <section id="analyzer" className="animate-scale-in">
            <NewsAnalyzer />
          </section>
          
          <section id="features" className="animate-fade-in">
            <Features />
          </section>
          
          <section id="how-it-works" className="animate-fade-in">
            <HowItWorks />
          </section>
        </div>
      </main>
      
      <footer className="border-t border-border bg-background/95 backdrop-blur mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-muted-foreground">
            <p>&copy; 2024 TruthLens AI. Powered by advanced machine learning.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
