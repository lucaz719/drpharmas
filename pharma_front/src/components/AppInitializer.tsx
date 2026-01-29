import { useEffect } from 'react';
import { useAppStore } from '@/store/appStore';
import { useMockDataInitializer } from '@/hooks/useMockDataInitializer';
import { LoadingOverlay } from '@/components/ui/loading';

interface AppInitializerProps {
  children: React.ReactNode;
}

export function AppInitializer({ children }: AppInitializerProps) {
  const { isLoading } = useAppStore();
  const { initializeMockData, hasData } = useMockDataInitializer();

  useEffect(() => {
    if (!hasData) {
      initializeMockData();
    }
  }, [hasData, initializeMockData]);

  return (
    <LoadingOverlay 
      isLoading={isLoading} 
      text="Initializing application..."
    >
      {children}
    </LoadingOverlay>
  );
}