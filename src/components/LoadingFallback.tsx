import { Card, CardContent } from '@/components/ui/card';
import { Loader2, Brain } from 'lucide-react';

interface LoadingFallbackProps {
  level?: number;
  message?: string;
}

const LoadingFallback: React.FC<LoadingFallbackProps> = ({ 
  level, 
  message = "Loading proctoring system..." 
}) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardContent className="p-8 text-center">
          <div className="mb-6">
            <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <Brain className="w-8 h-8 text-blue-600" />
            </div>
            {level && (
              <div className="text-2xl font-bold text-gray-900 mb-2">
                Level {level} Proctoring
              </div>
            )}
          </div>
          
          <div className="flex items-center justify-center gap-2 mb-4">
            <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
            <span className="text-gray-600">{message}</span>
          </div>
          
          <div className="text-sm text-gray-500">
            Please wait while we initialize the AI monitoring system...
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoadingFallback;
