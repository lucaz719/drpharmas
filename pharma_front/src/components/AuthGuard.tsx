import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { authAPI, subscriptionAPI } from '@/services/api';
import { useToast } from '@/hooks/use-toast';
import { LoadingOverlay } from '@/components/ui/loading';

interface AuthGuardProps {
  children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  const validateAuth = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const currentUser = localStorage.getItem('currentUser');

      // If no token or user data, not authenticated
      if (!token || !currentUser) {
        setIsAuthenticated(false);
        setIsLoading(false);
        return;
      }

      const user = JSON.parse(currentUser);
      
      // Skip subscription validation for now
      // TODO: Fix subscription API and re-enable validation

      // If we have both token and user data, assume authenticated
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Auth validation error:', error);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  const clearAuthData = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('currentUser');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('selectedOrganization');
  };

  useEffect(() => {
    // Skip auth check for login page
    if (location.pathname === '/login') {
      setIsAuthenticated(false);
      setIsLoading(false);
      return;
    }

    validateAuth();
  }, [location.pathname]);

  useEffect(() => {
    if (isAuthenticated === false && location.pathname !== '/login') {
      navigate('/login', { replace: true });
    }
  }, [isAuthenticated, location.pathname, navigate]);

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <LoadingOverlay 
        isLoading={true} 
        text="Verifying authentication..."
      >
        <div className="min-h-screen" />
      </LoadingOverlay>
    );
  }

  // If on login page, always show children
  if (location.pathname === '/login') {
    return <>{children}</>;
  }

  // If authenticated, show children
  if (isAuthenticated) {
    return <>{children}</>;
  }

  // If not authenticated and not on login page, show nothing (will redirect)
  return null;
}