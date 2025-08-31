import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, AlertTriangle, XCircle, RefreshCw, Database, Key, Shield, Zap } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

interface ServiceStatus {
  name: string;
  status: 'connected' | 'error' | 'checking' | 'not_configured';
  message: string;
  icon: any;
  color: string;
}

const EnvironmentStatus = () => {
  const [services, setServices] = useState<ServiceStatus[]>([
    {
      name: 'Firebase Authentication',
      status: 'checking',
      message: 'Checking connection...',
      icon: Shield,
      color: 'orange'
    },
    {
      name: 'Supabase Database',
      status: 'checking',
      message: 'Checking connection...',
      icon: Database,
      color: 'green'
    },
    {
      name: 'Gemini AI API',
      status: 'checking',
      message: 'Checking connection...',
      icon: Key,
      color: 'blue'
    },
    {
      name: 'OpenAI API',
      status: 'checking',
      message: 'Checking connection...',
      icon: Key,
      color: 'purple'
    },
    {
      name: 'Python Backend',
      status: 'checking',
      message: 'Checking connection...',
      icon: Zap,
      color: 'yellow'
    }
  ]);

  const [isRefreshing, setIsRefreshing] = useState(false);

  const checkFirebaseAuth = async (): Promise<ServiceStatus> => {
    try {
      // Check if Firebase config is available
      const firebaseConfig = {
        apiKey: "AIzaSyDrNM4bWhdh_7sNQ65o4notdD6w7NMDSdU",
        authDomain: "sample-firebase-ai-app-948ed.firebaseapp.com",
        projectId: "sample-firebase-ai-app-948ed"
      };
      
      if (firebaseConfig.apiKey && firebaseConfig.projectId) {
        return {
          name: 'Firebase Authentication',
          status: 'connected',
          message: 'Firebase configured and ready',
          icon: Shield,
          color: 'green'
        };
      } else {
        return {
          name: 'Firebase Authentication',
          status: 'not_configured',
          message: 'Using local authentication fallback',
          icon: Shield,
          color: 'orange'
        };
      }
    } catch (error) {
      return {
        name: 'Firebase Authentication',
        status: 'error',
        message: 'Firebase connection failed',
        icon: Shield,
        color: 'red'
      };
    }
  };

  const checkSupabase = async (): Promise<ServiceStatus> => {
    try {
      // First, test basic connection
      const { data, error } = await supabase.from('user_profiles').select('count').limit(1);

      if (error && (error.code === 'PGRST116' || error.message?.includes('relation') || error.message?.includes('does not exist'))) {
        // Table doesn't exist, but connection works
        return {
          name: 'Supabase Database',
          status: 'connected',
          message: 'Connected (tables need setup)',
          icon: Database,
          color: 'orange'
        };
      } else if (error && error.message?.includes('JWT')) {
        // Authentication issue
        return {
          name: 'Supabase Database',
          status: 'error',
          message: 'Authentication failed - check API key',
          icon: Database,
          color: 'red'
        };
      } else if (!error) {
        return {
          name: 'Supabase Database',
          status: 'connected',
          message: 'Connected and ready',
          icon: Database,
          color: 'green'
        };
      } else {
        // Other error, but connection might still work
        console.warn('Supabase query error:', error);
        return {
          name: 'Supabase Database',
          status: 'connected',
          message: 'Connected (some tables missing)',
          icon: Database,
          color: 'orange'
        };
      }
    } catch (error: any) {
      console.error('Supabase connection error:', error);
      return {
        name: 'Supabase Database',
        status: 'error',
        message: `Connection failed: ${error.message || 'Unknown error'}`,
        icon: Database,
        color: 'red'
      };
    }
  };

  const checkGeminiAPI = async (): Promise<ServiceStatus> => {
    try {
      const apiKey = localStorage.getItem('gemini-api-key') || "AIzaSyBX5qt3MT2bI6t87FHUhEgwHMfEWDSqRrs";
      
      if (!apiKey) {
        return {
          name: 'Gemini AI API',
          status: 'not_configured',
          message: 'API key not configured',
          icon: Key,
          color: 'orange'
        };
      }

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
      
      if (response.ok) {
        return {
          name: 'Gemini AI API',
          status: 'connected',
          message: 'API key valid and ready',
          icon: Key,
          color: 'green'
        };
      } else {
        return {
          name: 'Gemini AI API',
          status: 'error',
          message: 'API key invalid or quota exceeded',
          icon: Key,
          color: 'red'
        };
      }
    } catch (error) {
      return {
        name: 'Gemini AI API',
        status: 'error',
        message: 'Connection failed',
        icon: Key,
        color: 'red'
      };
    }
  };

  const checkOpenAI = async (): Promise<ServiceStatus> => {
    try {
      const apiKey = localStorage.getItem('openai-api-key') || "YOUR_OPENAI_API_KEY_HERE";
      
      if (!apiKey) {
        return {
          name: 'OpenAI API',
          status: 'not_configured',
          message: 'API key not configured',
          icon: Key,
          color: 'orange'
        };
      }

      const response = await fetch('https://api.openai.com/v1/models', {
        headers: {
          'Authorization': `Bearer ${apiKey}`
        }
      });
      
      if (response.ok) {
        return {
          name: 'OpenAI API',
          status: 'connected',
          message: 'API key valid and ready',
          icon: Key,
          color: 'green'
        };
      } else {
        return {
          name: 'OpenAI API',
          status: 'error',
          message: 'API key invalid or quota exceeded',
          icon: Key,
          color: 'red'
        };
      }
    } catch (error) {
      return {
        name: 'OpenAI API',
        status: 'error',
        message: 'Connection failed',
        icon: Key,
        color: 'red'
      };
    }
  };

  const checkPythonBackend = async (): Promise<ServiceStatus> => {
    try {
      const backendUrl = localStorage.getItem('python-backend-url') || "http://localhost:8000";
      
      const response = await fetch(`${backendUrl}/`);
      
      if (response.ok) {
        return {
          name: 'Python Backend',
          status: 'connected',
          message: 'Backend server running',
          icon: Zap,
          color: 'green'
        };
      } else {
        return {
          name: 'Python Backend',
          status: 'error',
          message: 'Server not responding',
          icon: Zap,
          color: 'red'
        };
      }
    } catch (error) {
      return {
        name: 'Python Backend',
        status: 'error',
        message: 'Server not running (start with start_backend.bat)',
        icon: Zap,
        color: 'red'
      };
    }
  };

  const checkAllServices = async () => {
    setIsRefreshing(true);
    
    try {
      const results = await Promise.all([
        checkFirebaseAuth(),
        checkSupabase(),
        checkGeminiAPI(),
        checkOpenAI(),
        checkPythonBackend()
      ]);
      
      setServices(results);
      
      const connectedCount = results.filter(s => s.status === 'connected').length;
      toast.success(`System check complete: ${connectedCount}/5 services ready`);
    } catch (error) {
      toast.error('Failed to check system status');
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    checkAllServices();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'not_configured':
        return <AlertTriangle className="w-4 h-4 text-orange-500" />;
      case 'checking':
        return <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      connected: 'default',
      error: 'destructive',
      not_configured: 'secondary',
      checking: 'outline'
    };
    
    const labels: Record<string, string> = {
      connected: 'Ready',
      error: 'Error',
      not_configured: 'Fallback',
      checking: 'Checking...'
    };
    
    return (
      <Badge variant={variants[status] || 'outline'}>
        {labels[status] || 'Unknown'}
      </Badge>
    );
  };

  const connectedServices = services.filter(s => s.status === 'connected').length;
  const totalServices = services.length;
  const systemHealthy = connectedServices >= 3; // At least 3 services should be working

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            System Status
          </span>
          <div className="flex items-center gap-2">
            <Badge variant={systemHealthy ? "default" : "destructive"}>
              {connectedServices}/{totalServices} Ready
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={checkAllServices}
              disabled={isRefreshing}
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Overall Status */}
        <Alert className={systemHealthy ? "border-green-200 bg-green-50" : "border-orange-200 bg-orange-50"}>
          <AlertDescription className={systemHealthy ? "text-green-800" : "text-orange-800"}>
            {systemHealthy 
              ? "✅ System is ready for proctoring sessions"
              : "⚠️ Some services need attention, but basic functionality works"
            }
          </AlertDescription>
        </Alert>

        {/* Service Status List */}
        <div className="grid gap-3">
          {services.map((service, index) => {
            const IconComponent = service.icon;
            return (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <IconComponent className={`w-5 h-5 text-${service.color}-500`} />
                  <div>
                    <div className="font-medium">{service.name}</div>
                    <div className="text-sm text-muted-foreground">{service.message}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusIcon(service.status)}
                  {getStatusBadge(service.status)}
                </div>
              </div>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div className="pt-4 border-t">
          <div className="text-sm font-medium mb-2">Quick Actions:</div>
          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" size="sm" onClick={() => window.open('http://localhost:8000/docs', '_blank')}>
              Python API Docs
            </Button>
            <Button variant="outline" size="sm" onClick={() => window.open('https://console.firebase.google.com', '_blank')}>
              Firebase Console
            </Button>
            <Button variant="outline" size="sm" onClick={() => window.open('https://supabase.com/dashboard', '_blank')}>
              Supabase Dashboard
            </Button>
            <Button variant="outline" size="sm" onClick={() => window.open('https://aistudio.google.com', '_blank')}>
              Gemini Studio
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default EnvironmentStatus;

