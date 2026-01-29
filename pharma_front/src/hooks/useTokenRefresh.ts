import { useEffect, useRef } from 'react';
import { authAPI } from '@/services/api';
import { useToast } from '@/hooks/use-toast';

interface UseTokenRefreshOptions {
  refreshInterval?: number; // in milliseconds
  enabled?: boolean;
}

export function useTokenRefresh({
  refreshInterval = 15 * 60 * 1000, // 15 minutes default
  enabled = true
}: UseTokenRefreshOptions = {}) {
  const { toast } = useToast();
  const intervalRef = useRef<NodeJS.Timeout>();

  const refreshToken = async () => {
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      if (!refreshToken) {
        console.log('No refresh token available');
        return;
      }

      const response = await authAPI.refreshToken(refreshToken);
      
      if (response.success && response.data) {
        // Update tokens
        localStorage.setItem('access_token', response.data.access);
        if (response.data.refresh) {
          localStorage.setItem('refresh_token', response.data.refresh);
        }
        console.log('Token refreshed successfully');
      } else {
        console.log('Token refresh failed:', response.message);
        // Don't show error toast for failed refresh, let AuthGuard handle it
      }
    } catch (error) {
      console.error('Token refresh error:', error);
      // Don't show error toast for network errors during refresh
    }
  };

  useEffect(() => {
    if (!enabled) {
      return;
    }

    // Only start token refresh if user is logged in
    const currentUser = localStorage.getItem('currentUser');
    const accessToken = localStorage.getItem('access_token');
    
    if (!currentUser || !accessToken) {
      return;
    }

    // Start periodic token refresh
    intervalRef.current = setInterval(() => {
      refreshToken();
    }, refreshInterval);

    // Cleanup
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [refreshInterval, enabled]);

  // Manual refresh function
  const manualRefresh = async () => {
    await refreshToken();
  };

  return {
    refreshToken: manualRefresh
  };
}