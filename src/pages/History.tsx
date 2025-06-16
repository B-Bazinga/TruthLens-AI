
import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { AnalysisHistory } from '@/components/AnalysisHistory';

export default function History() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse">
          <div className="text-lg text-muted-foreground">Loading...</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8 animate-fade-in">
            <h1 className="text-3xl font-bold mb-2 gradient-text">Analysis History</h1>
            <p className="text-muted-foreground leading-relaxed">
              View and manage your previous article analyses. Keep track of your fact-checking journey.
            </p>
          </div>
          <div className="animate-scale-in">
            <AnalysisHistory />
          </div>
        </div>
      </main>
    </div>
  );
}
