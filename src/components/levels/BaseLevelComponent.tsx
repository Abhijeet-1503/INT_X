import React, { useState, useEffect } from 'react';
import LoadingFallback from '../LoadingFallback';
import { toast } from 'sonner';

interface BaseLevelProps {
  level: number;
  onComplete?: (results: any) => void;
  children: React.ReactNode;
  loadingMessage?: string;
}

const BaseLevelComponent: React.FC<BaseLevelProps> = ({ 
  level, 
  onComplete, 
  children, 
  loadingMessage 
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initializeComponent = async () => {
      try {
        // Simulate initialization with progressive delay for higher levels
        const delay = 500 + (level * 200);
        await new Promise(resolve => setTimeout(resolve, delay));
        setIsLoading(false);
      } catch (error) {
        console.error(`Level ${level} initialization failed:`, error);
        setError(`Failed to initialize Level ${level} proctoring`);
        setIsLoading(false);
      }
    };

    initializeComponent();
  }, [level]);

  if (isLoading) {
    return (
      <LoadingFallback 
        level={level} 
        message={loadingMessage || `Initializing Level ${level} proctoring...`} 
      />
    );
  }

  if (error) {
    toast.error(error);
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center p-4">
        <div className="text-center">
          <h2 className="text-xl font-bold text-red-900 mb-2">Initialization Failed</h2>
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default BaseLevelComponent;
