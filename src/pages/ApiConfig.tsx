import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, Key, Shield, CheckCircle, AlertTriangle, Database } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import EnvironmentStatus from "@/components/EnvironmentStatus";
import { runDatabaseSetup } from "@/lib/databaseSetup";

const ApiConfig = () => {
  const [geminiKey, setGeminiKey] = useState("");
  const [openaiKey, setOpenaiKey] = useState("");
  const [pythonBackendUrl, setPythonBackendUrl] = useState("http://localhost:8000");
  const [testResults, setTestResults] = useState<{[key: string]: 'success' | 'error' | 'testing' | null}>({
    gemini: null,
    openai: null,
    python: null
  });

  // Load saved API keys from localStorage or use defaults
  useEffect(() => {
    const savedGemini = localStorage.getItem('gemini-api-key') || "YOUR_GEMINI_API_KEY_HERE";
    const savedOpenai = localStorage.getItem('openai-api-key') || "YOUR_OPENAI_API_KEY_HERE";
    const savedPython = localStorage.getItem('python-backend-url') || "http://localhost:8000";
    
    setGeminiKey(savedGemini);
    setOpenaiKey(savedOpenai);
    setPythonBackendUrl(savedPython);
    
    // Auto-save the defaults if not already saved
    if (!localStorage.getItem('gemini-api-key')) {
      localStorage.setItem('gemini-api-key', savedGemini);
    }
    if (!localStorage.getItem('openai-api-key')) {
      localStorage.setItem('openai-api-key', savedOpenai);
    }
  }, []);

  const saveApiKey = (type: string, value: string) => {
    localStorage.setItem(`${type}-api-key`, value);
    toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} API key saved`);
  };

  const savePythonUrl = (url: string) => {
    localStorage.setItem('python-backend-url', url);
    toast.success('Python backend URL saved');
  };

  const testGeminiConnection = async () => {
    if (!geminiKey) {
      toast.error('Please enter Gemini API key first');
      return;
    }

    setTestResults(prev => ({ ...prev, gemini: 'testing' }));

    try {
      // Test Gemini API connection
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${geminiKey}`);
      
      if (response.ok) {
        setTestResults(prev => ({ ...prev, gemini: 'success' }));
        toast.success('Gemini API connection successful');
      } else {
        throw new Error('API key invalid');
      }
    } catch (error) {
      setTestResults(prev => ({ ...prev, gemini: 'error' }));
      toast.error('Gemini API connection failed');
    }
  };

  const testOpenAIConnection = async () => {
    if (!openaiKey) {
      toast.error('Please enter OpenAI API key first');
      return;
    }

    setTestResults(prev => ({ ...prev, openai: 'testing' }));

    try {
      const response = await fetch('https://api.openai.com/v1/models', {
        headers: {
          'Authorization': `Bearer ${openaiKey}`
        }
      });
      
      if (response.ok) {
        setTestResults(prev => ({ ...prev, openai: 'success' }));
        toast.success('OpenAI API connection successful');
      } else {
        throw new Error('API key invalid');
      }
    } catch (error) {
      setTestResults(prev => ({ ...prev, openai: 'error' }));
      toast.error('OpenAI API connection failed');
    }
  };

  const testPythonConnection = async () => {
    setTestResults(prev => ({ ...prev, python: 'testing' }));

    try {
      const response = await fetch(`${pythonBackendUrl}/`);
      
      if (response.ok) {
        setTestResults(prev => ({ ...prev, python: 'success' }));
        toast.success('Python backend connection successful');
      } else {
        throw new Error('Backend not accessible');
      }
    } catch (error) {
      setTestResults(prev => ({ ...prev, python: 'error' }));
      toast.error('Python backend connection failed');
    }
  };

  const getStatusIcon = (status: string | null) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'testing':
        return <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />;
      default:
        return <Key className="w-4 h-4 text-gray-400" />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-12 px-6 max-w-4xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/dashboard">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">API Configuration</h1>
            <p className="text-muted-foreground">Configure your API keys and backend connections</p>
          </div>
        </div>

        {/* System Status */}
        <EnvironmentStatus />

        {/* Configuration Tabs */}
        <Tabs defaultValue="ai-apis" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="ai-apis">AI APIs</TabsTrigger>
            <TabsTrigger value="database">Database</TabsTrigger>
            <TabsTrigger value="backend">Backend</TabsTrigger>
          </TabsList>

          {/* AI APIs Tab */}
          <TabsContent value="ai-apis" className="space-y-6">
            {/* Gemini API */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-blue-500" />
                    Google Gemini API
                  </span>
                  {getStatusIcon(testResults.gemini)}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="gemini-key">API Key</Label>
                  <Input
                    id="gemini-key"
                    type="password"
                    placeholder="Enter your Gemini API key"
                    value={geminiKey}
                    onChange={(e) => setGeminiKey(e.target.value)}
                  />
                </div>
                <div className="flex gap-2">
                  <Button 
                    onClick={() => saveApiKey('gemini', geminiKey)}
                    disabled={!geminiKey}
                  >
                    Save Key
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={testGeminiConnection}
                    disabled={!geminiKey || testResults.gemini === 'testing'}
                  >
                    Test Connection
                  </Button>
                </div>
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Get your free Gemini API key from{' '}
                    <a 
                      href="https://aistudio.google.com/app/apikey" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:underline"
                    >
                      Google AI Studio
                    </a>
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>

            {/* OpenAI API */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-green-500" />
                    OpenAI API
                  </span>
                  {getStatusIcon(testResults.openai)}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="openai-key">API Key</Label>
                  <Input
                    id="openai-key"
                    type="password"
                    placeholder="Enter your OpenAI API key"
                    value={openaiKey}
                    onChange={(e) => setOpenaiKey(e.target.value)}
                  />
                </div>
                <div className="flex gap-2">
                  <Button 
                    onClick={() => saveApiKey('openai', openaiKey)}
                    disabled={!openaiKey}
                  >
                    Save Key
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={testOpenAIConnection}
                    disabled={!openaiKey || testResults.openai === 'testing'}
                  >
                    Test Connection
                  </Button>
                </div>
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Get your OpenAI API key from{' '}
                    <a
                      href="https://platform.openai.com/api-keys"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:underline"
                    >
                      OpenAI Platform
                    </a>
                  </AlertDescription>
                </Alert>

                {/* Supabase Database Setup Instructions */}
                <Alert className="mt-4">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Database Setup:</strong> If Supabase shows connection issues, run the SQL script in your{' '}
                    <a
                      href="https://supabase.com/dashboard/project/bywjdldrqfcxwsuwobxt/sql"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:underline"
                    >
                      Supabase SQL Editor
                    </a>
                    {' '}using the supabase_setup.sql file.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Database Tab */}
          <TabsContent value="database" className="space-y-6">
            {/* Supabase Database */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="w-5 h-5 text-green-500" />
                  Supabase Database
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Project URL</Label>
                  <Input
                    value="https://bywjdldrqfcxwsuwobxt.supabase.co"
                    readOnly
                    className="bg-muted"
                  />
                </div>
                <div className="space-y-2">
                  <Label>API Key Status</Label>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-sm text-green-600">Configured</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={async () => {
                      toast.info('Running database setup checks...');
                      try {
                        await runDatabaseSetup();
                        toast.success('Database setup completed!');
                      } catch (error) {
                        toast.error('Database setup failed');
                        console.error('Database setup error:', error);
                      }
                    }}
                  >
                    Run Database Setup
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      const blob = new Blob([`
-- SmartProctor-X Supabase Database Setup
-- Copy and paste this into your Supabase SQL Editor

CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  role TEXT CHECK (role IN ('student', 'proctor', 'admin')) NOT NULL DEFAULT 'student',
  display_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_login TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS proctor_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  level INTEGER CHECK (level >= 1 AND level <= 5) NOT NULL DEFAULT 1,
  start_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  end_time TIMESTAMP WITH TIME ZONE,
  status TEXT CHECK (status IN ('active', 'completed', 'terminated')) NOT NULL DEFAULT 'active',
  suspicion_score INTEGER CHECK (suspicion_score >= 0 AND suspicion_score <= 100) DEFAULT 0,
  violations INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS violations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID REFERENCES proctor_sessions(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  severity TEXT CHECK (severity IN ('low', 'medium', 'high', 'critical')) NOT NULL DEFAULT 'low',
  message TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  screenshot_url TEXT,
  metadata JSONB DEFAULT '{}'
);

-- Enable Row Level Security
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE proctor_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE violations ENABLE ROW LEVEL SECURITY;

-- Create basic policies (you may need to adjust these)
CREATE POLICY "Users can view their own profile" ON user_profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Anyone can create a profile" ON user_profiles FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can view their own sessions" ON proctor_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own sessions" ON proctor_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view violations from their sessions" ON violations FOR SELECT USING (EXISTS (SELECT 1 FROM proctor_sessions WHERE proctor_sessions.id = violations.session_id AND proctor_sessions.user_id = auth.uid()));

-- Insert sample data
INSERT INTO user_profiles (email, role, display_name) VALUES
  ('admin@smartproctor.com', 'admin', 'System Administrator'),
  ('proctor@smartproctor.com', 'proctor', 'Senior Proctor'),
  ('demo@smartproctor.com', 'student', 'Demo User')
ON CONFLICT (email) DO NOTHING;
                      `], { type: 'text/plain' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = 'supabase_setup.sql';
                      document.body.appendChild(a);
                      a.click();
                      document.body.removeChild(a);
                      URL.revokeObjectURL(url);
                      toast.success('SQL setup file downloaded!');
                    }}
                  >
                    Download SQL Script
                  </Button>
                </div>
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Database Setup Required:</strong> Run the SQL script in your{' '}
                    <a
                      href="https://supabase.com/dashboard/project/bywjdldrqfcxwsuwobxt/sql"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:underline"
                    >
                      Supabase SQL Editor
                    </a>
                    {' '}to create the necessary tables and policies.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Backend Tab */}
          <TabsContent value="backend" className="space-y-6">
            {/* Python Backend */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-yellow-500" />
                    Python Backend (diya.py)
                  </span>
                  {getStatusIcon(testResults.python)}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="python-url">Backend URL</Label>
                  <Input
                    id="python-url"
                    placeholder="http://localhost:8000"
                    value={pythonBackendUrl}
                    onChange={(e) => setPythonBackendUrl(e.target.value)}
                  />
                </div>
                <div className="flex gap-2">
                  <Button 
                    onClick={() => savePythonUrl(pythonBackendUrl)}
                    disabled={!pythonBackendUrl}
                  >
                    Save URL
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={testPythonConnection}
                    disabled={!pythonBackendUrl || testResults.python === 'testing'}
                  >
                    Test Connection
                  </Button>
                </div>
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Make sure your Python backend is running. Start it with:{' '}
                    <code className="bg-muted px-1 rounded">python api_server.py</code>
                  </AlertDescription>
                </Alert>

                {/* Python Backend Setup Instructions */}
                <div className="mt-4 p-4 bg-muted rounded-lg">
                  <h4 className="font-semibold mb-2">Python Backend Setup:</h4>
                  <ol className="text-sm space-y-1 list-decimal list-inside">
                    <li>Navigate to <code>O:\VS Code\Intellify\diya.py\</code></li>
                    <li>Install dependencies: <code>pip install fastapi uvicorn</code></li>
                    <li>Run the server: <code>python api_server.py</code></li>
                    <li>Backend will be available at <code>http://localhost:8000</code></li>
                  </ol>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Quick Actions */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <Button
                variant="outline"
                onClick={() => {
                  localStorage.clear();
                  setGeminiKey('');
                  setOpenaiKey('');
                  setPythonBackendUrl('http://localhost:8000');
                  setTestResults({ gemini: null, openai: null, python: null });
                  toast.success('All configurations cleared');
                }}
              >
                Clear All Config
              </Button>
              <Button asChild>
                <Link to="/start">
                  Start Proctoring Session
                </Link>
              </Button>
            </div>

            <div className="mt-6 pt-6 border-t">
              <h4 className="font-medium mb-4">External Resources</h4>
              <div className="grid grid-cols-2 gap-4">
                <Button variant="outline" size="sm" asChild>
                  <a href="https://supabase.com/dashboard/project/bywjdldrqfcxwsuwobxt/sql" target="_blank" rel="noopener noreferrer">
                    Supabase SQL Editor
                  </a>
                </Button>
                <Button variant="outline" size="sm" asChild>
                  <a href="https://console.firebase.google.com" target="_blank" rel="noopener noreferrer">
                    Firebase Console
                  </a>
                </Button>
                <Button variant="outline" size="sm" asChild>
                  <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer">
                    Gemini Studio
                  </a>
                </Button>
                <Button variant="outline" size="sm" asChild>
                  <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer">
                    OpenAI Platform
                  </a>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ApiConfig;


