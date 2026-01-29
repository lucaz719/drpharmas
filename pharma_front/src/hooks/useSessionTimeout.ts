import { useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

interface UseSessionTimeoutOptions {
  timeout?: number; // in milliseconds
  warningTime?: number; // in milliseconds
  onTimeout?: () => void;
  onWarning?: () => void;
}

export function useSessionTimeout({
  timeout = 30 * 60 * 1000, // 30 minutes default
  warningTime = 5 * 60 * 1000, // 5 minutes warning default
  onTimeout,
  onWarning
}: UseSessionTimeoutOptions = {}) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const timeoutRef = useRef<NodeJS.Timeout>();
  const warningRef = useRef<NodeJS.Timeout>();
  const lastActivityRef = useRef<number>(Date.now());

  const clearAuthData = useCallback(() => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('currentUser');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('selectedOrganization');
  }, []);

  const handleTimeout = useCallback(() => {
    clearAuthData();
    
    toast({
      title: "Session Expired",
      description: "Your session has expired due to inactivity. Please log in again.",
      variant: "destructive",
    });

    if (onTimeout) {
      onTimeout();
    } else {
      navigate('/login', { replace: true });
    }
  }, [clearAuthData, navigate, onTimeout, toast]);

  const handleWarning = useCallback(() => {
    toast({
      title: "Session Warning",
      description: `Your session will expire in ${Math.ceil(warningTime / 60000)} minutes due to inactivity.`,
      variant: "destructive",
    });

    if (onWarning) {
      onWarning();
    }
  }, [onWarning, toast, warningTime]);

  const resetTimer = useCallback(() => {
    const now = Date.now();
    lastActivityRef.current = now;

    // Clear existing timers
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    if (warningRef.current) {
      clearTimeout(warningRef.current);
    }

    // Set warning timer
    warningRef.current = setTimeout(() => {
      handleWarning();
    }, timeout - warningTime);

    // Set timeout timer
    timeoutRef.current = setTimeout(() => {
      handleTimeout();
    }, timeout);
  }, [timeout, warningTime, handleTimeout, handleWarning]);

  const extendSession = useCallback(() => {
    resetTimer();
    toast({
      title: "Session Extended",
      description: "Your session has been extended.",
    });
  }, [resetTimer, toast]);

  const getRemainingTime = useCallback(() => {
    const elapsed = Date.now() - lastActivityRef.current;
    return Math.max(0, timeout - elapsed);
  }, [timeout]);

  useEffect(() => {
    // Only start session timeout if user is logged in
    const currentUser = localStorage.getItem('currentUser');
    if (!currentUser) {
      return;
    }

    // Activity events to track
    const events = [
      'mousedown',
      'mousemove',
      'keypress',
      'scroll',
      'touchstart',
      'click'
    ];

    // Reset timer on activity
    const handleActivity = () => {
      resetTimer();
    };

    // Add event listeners
    events.forEach(event => {
      document.addEventListener(event, handleActivity, true);
    });

    // Start the timer
    resetTimer();

    // Cleanup
    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleActivity, true);
      });
      
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (warningRef.current) {
        clearTimeout(warningRef.current);
      }
    };
  }, [resetTimer]);

  return {
    extendSession,
    getRemainingTime,
    resetTimer
  };
}