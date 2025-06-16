
import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { ProfileSettings } from '@/components/ProfileSettings';

export default function Profile() {
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
        <div className="max-w-4xl mx-auto">
          <div className="mb-8 animate-fade-in">
            <h1 className="text-3xl font-bold mb-2 gradient-text">Profile Settings</h1>
            <p className="text-muted-foreground leading-relaxed">
              Configure your AI analysis preferences and custom model endpoints for enhanced accuracy
            </p>
          </div>
          <div className="animate-scale-in">
            <ProfileSettings />
          </div>
        </div>
      </main>
    </div>
  );
}
