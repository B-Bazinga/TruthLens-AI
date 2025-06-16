
import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetTime: Date;
}

export function useOptimizedRateLimit() {
  const { user } = useAuth();

  const checkRateLimit = useCallback(async (
    endpoint: string, 
    maxRequests = 100, 
    windowMinutes = 60
  ): Promise<RateLimitResult> => {
    if (!user) {
      return { allowed: false, remaining: 0, resetTime: new Date() };
    }

    try {
      const windowStart = new Date();
      windowStart.setMinutes(windowStart.getMinutes() - windowMinutes);

      // Use the atomic database function for better performance and race condition prevention
      const { data: currentCount, error } = await supabase
        .rpc('check_and_increment_rate_limit' as any, {
          p_user_id: user.id,
          p_endpoint: endpoint,
          p_window_start: windowStart.toISOString(),
          p_max_requests: maxRequests
        });

      if (error) {
        console.error('Rate limit check failed:', error);
        // Fail open - allow request if rate limit check fails
        return { 
          allowed: true, 
          remaining: maxRequests - 1, 
          resetTime: new Date(Date.now() + windowMinutes * 60 * 1000)
        };
      }

      const remaining = Math.max(0, maxRequests - (currentCount || 0));
      const resetTime = new Date(Date.now() + windowMinutes * 60 * 1000);

      return {
        allowed: (currentCount || 0) <= maxRequests,
        remaining,
        resetTime
      };
    } catch (error) {
      console.error('Rate limit error:', error);
      // Fail open - allow request if there's an error
      return { 
        allowed: true, 
        remaining: maxRequests - 1, 
        resetTime: new Date(Date.now() + windowMinutes * 60 * 1000)
      };
    }
  }, [user]);

  return { checkRateLimit };
}
