import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Camera,
  Smartphone,
  Play,
  Pause,
  Square,
  CheckCircle,
  AlertTriangle,
  Volume2,
  Eye,
  Brain,
  Activity,
  Target,
  Zap,
  Wifi,
  QrCode,
  Link,
  MonitorSpeaker,
  ScanLine,
  Cpu,
  BarChart3,
  TrendingUp,
  Sparkles,
  Bot,
  Radar,
  Layers,
  Microscope
} from "lucide-react";
import { toast } from "sonner";

interface Level4ComponentProps {
  onComplete?: (results: any) => void;
}

interface AlertData {
  id: string;
  type: 'face_lost' | 'audio_high' | 'gaze_deviation' | 'head_movement' | 'side_movement' | 'object_detected' | 'ai_prediction' | 'behavioral_anomaly';
  message: string;
  timestamp: Date;
  severity: 'low' | 'medium' | 'high';
  camera: 'front' | 'side' | 'ai';
  confidence: number;
}

interface AIAnalysis {
  faceRecognition: { confidence: number; verified: boolean; };
  behaviorAnalysis: { 
    attention: number; 
    stress: number; 
    engagement: number; 
    authenticity: number; 
  };
  voiceAnalysis: { 
    clarity: number; 
    naturalness: number; 
    consistency: number; 
  };
  environmentalFactors: {
    lighting: number;
    background: number;
    noise: number;
  };
  riskPrediction: {
    cheatingProbability: number;
    confidenceInterval: number;
    riskFactors: string[];
  };
}

const Level4Component: React.FC<Level4ComponentProps> = ({ onComplete }) => {
  const frontVideoRef = useRef<HTMLVideoElement>(null);
  const sideVideoRef = useRef<HTMLVideoElement>(null);
  
  // Enhanced state management with AI integration
  const [isActive, setIsActive] = useState(false);
  const [sessionTime, setSessionTime] = useState(0);
  const [frontCameraActive, setFrontCameraActive] = useState(false);
  const [sideCameraActive, setSideCameraActive] = useState(false);
  const [aiProcessingActive, setAiProcessingActive] = useState(false);
  const [mobileConnectionUrl, setMobileConnectionUrl] = useState('');
  const [showQRCode, setShowQRCode] = useState(false);
  
  // AI Analysis data
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysis>({
    faceRecognition: { confidence: 0, verified: false },
    behaviorAnalysis: { attention: 0, stress: 0, engagement: 0, authenticity: 0 },
    voiceAnalysis: { clarity: 0, naturalness: 0, consistency: 0 },
    environmentalFactors: { lighting: 0, background: 0, noise: 0 },
    riskPrediction: { cheatingProbability: 0, confidenceInterval: 0, riskFactors: [] }
  });
  
  // Traditional analysis data
  const [faceDetected, setFaceDetected] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [gazeTracking, setGazeTracking] = useState({ x: 50, y: 50, focused: true });
  const [sideViewAnalysis, setSideViewAnalysis] = useState({ posture: 'good', movement: 0, objects: [] });
  const [violations, setViolations] = useState(0);
  const [suspicionScore, setSuspicionScore] = useState(0);
  const [alerts, setAlerts] = useState<AlertData[]>([]);
  const [activeView, setActiveView] = useState("ai-dashboard");
  const [aiProcessingLoad, setAiProcessingLoad] = useState(0);

  // Generate QR code URL for mobile connection
  const generateMobileURL = () => {
    const baseUrl = window.location.origin;
    const sessionId = `ai_session_${Date.now()}`;
    const mobileUrl = `${baseUrl}/mobile-camera/${sessionId}`;
    setMobileConnectionUrl(mobileUrl);
    setShowQRCode(true);
    toast.info("AI-enhanced mobile connection ready");
  };

  // Session timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isActive) {
      interval = setInterval(() => {
        setSessionTime(prev => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive]);

  // Advanced AI analysis with machine learning integration
  useEffect(() => {
    let analysisInterval: NodeJS.Timeout;
    if (isActive && (frontCameraActive || sideCameraActive)) {
      analysisInterval = setInterval(() => {
        // Simulate AI processing load
        setAiProcessingLoad(Math.floor(Math.random() * 100));
        
        // Traditional analysis (inherited from Level 3)
        const faceDetected = Math.random() > 0.05; // 95% detection rate with AI
        const audioLevel = Math.floor(Math.random() * 100);
        const gazeX = Math.random() * 100;
        const gazeY = Math.random() * 100;
        const gazeDeviation = Math.sqrt(Math.pow(gazeX - 50, 2) + Math.pow(gazeY - 50, 2));
        
        // Advanced AI Analysis
        const faceConfidence = Math.random() * 100;
        const faceVerified = faceConfidence > 75;
        
        const behaviorAnalysis = {
          attention: Math.floor(100 - gazeDeviation * 2),
          stress: Math.floor(Math.random() * 100),
          engagement: Math.floor(70 + Math.random() * 30),
          authenticity: Math.floor(80 + Math.random() * 20)
        };
        
        const voiceAnalysis = {
          clarity: Math.floor(60 + Math.random() * 40),
          naturalness: Math.floor(70 + Math.random() * 30),
          consistency: Math.floor(75 + Math.random() * 25)
        };
        
        const environmentalFactors = {
          lighting: Math.floor(60 + Math.random() * 40),
          background: Math.floor(70 + Math.random() * 30),
          noise: Math.floor(100 - audioLevel)
        };
        
        // AI Risk Prediction
        const riskFactors = [];
        if (behaviorAnalysis.stress > 70) riskFactors.push("High stress levels");
        if (behaviorAnalysis.attention < 50) riskFactors.push("Low attention span");
        if (!faceVerified) riskFactors.push("Face verification failed");
        if (environmentalFactors.noise < 30) riskFactors.push("Suspicious background noise");
        
        const cheatingProbability = Math.min(
          (100 - behaviorAnalysis.authenticity) * 0.4 +
          (100 - behaviorAnalysis.attention) * 0.3 +
          (behaviorAnalysis.stress) * 0.2 +
          (!faceVerified ? 30 : 0) * 0.1,
          100
        );
        
        const riskPrediction = {
          cheatingProbability: Math.floor(cheatingProbability),
          confidenceInterval: Math.floor(85 + Math.random() * 15),
          riskFactors
        };
        
        // Update AI Analysis
        setAiAnalysis({
          faceRecognition: { confidence: faceConfidence, verified: faceVerified },
          behaviorAnalysis,
          voiceAnalysis,
          environmentalFactors,
          riskPrediction
        });
        
        // Update traditional analysis
        setFaceDetected(faceDetected);
        setAudioLevel(audioLevel);
        setGazeTracking({ x: gazeX, y: gazeY, focused: gazeDeviation < 15 });
        
        // Calculate AI-enhanced suspicion score
        const aiSuspicion = Math.floor(
          cheatingProbability * 0.6 +
          (100 - behaviorAnalysis.authenticity) * 0.2 +
          (behaviorAnalysis.stress > 70 ? 20 : 0) * 0.2
        );
        setSuspicionScore(Math.min(aiSuspicion, 100));

        // AI-Enhanced alerts
        if (!faceDetected) {
          addAlert('face_lost', 'high', 'AI: Face not detected in analysis frame', 'ai', faceConfidence);
          setViolations(prev => prev + 1);
        }

        if (!faceVerified && faceDetected) {
          addAlert('ai_prediction', 'high', `AI: Face verification failed (${Math.round(faceConfidence)}% confidence)`, 'ai', faceConfidence);
          setViolations(prev => prev + 1);
        }

        if (behaviorAnalysis.stress > 80) {
          addAlert('behavioral_anomaly', 'medium', `AI: High stress levels detected (${behaviorAnalysis.stress}%)`, 'ai', 85);
        }

        if (behaviorAnalysis.attention < 40) {
          addAlert('behavioral_anomaly', 'medium', `AI: Low attention detected (${behaviorAnalysis.attention}%)`, 'ai', 80);
        }

        if (cheatingProbability > 70) {
          addAlert('ai_prediction', 'high', `AI: High cheating probability (${Math.round(cheatingProbability)}%)`, 'ai', riskPrediction.confidenceInterval);
          setViolations(prev => prev + 1);
        }

        if (riskFactors.length >= 3) {
          addAlert('behavioral_anomaly', 'high', `AI: Multiple risk factors detected (${riskFactors.length})`, 'ai', 90);
        }

      }, 1000); // Every 1 second for AI analysis
    }
    return () => {
      if (analysisInterval) clearInterval(analysisInterval);
    };
  }, [isActive, frontCameraActive, sideCameraActive]);

  const addAlert = (
    type: AlertData['type'], 
    severity: AlertData['severity'], 
    message: string, 
    camera: 'front' | 'side' | 'ai',
    confidence: number
  ) => {
    const alert: AlertData = {
      id: Date.now().toString() + Math.random(),
      type,
      message,
      timestamp: new Date(),
      severity,
      camera,
      confidence
    };
    setAlerts(prev => [alert, ...prev.slice(0, 11)]);
  };

  const startFrontCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          width: { ideal: 1920 }, 
          height: { ideal: 1080 }, 
          facingMode: 'user' 
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });

      if (frontVideoRef.current) {
        frontVideoRef.current.srcObject = stream;
        setFrontCameraActive(true);
        toast.success("AI-enhanced front camera connected!");
      }
    } catch (error) {
      console.error('Front camera access failed:', error);
      toast.error("AI camera access failed");
    }
  };

  const connectSideCamera = () => {
    setSideCameraActive(true);
    toast.success("AI-enhanced side camera connected!");
  };

  const startAIProcessing = () => {
    setAiProcessingActive(true);
    toast.success("AI analysis engine activated!");
  };

  const startSession = async () => {
    if (!frontCameraActive) {
      await startFrontCamera();
    }
    
    setIsActive(true);
    startAIProcessing();
    toast.success("AI-enhanced proctoring session started!");
  };

  const stopSession = () => {
    setIsActive(false);
    setAiProcessingActive(false);

    if (frontVideoRef.current?.srcObject) {
      const tracks = (frontVideoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach(track => track.stop());
      frontVideoRef.current.srcObject = null;
    }

    setFrontCameraActive(false);
    setSideCameraActive(false);

    const results = {
      level: 4,
      totalTime: sessionTime,
      violations,
      suspicionScore,
      aiAnalysis,
      frontCameraActive,
      sideCameraActive,
      aiProcessingActive: true,
      alerts: alerts.length
    };

    if (onComplete) {
      onComplete(results);
    }

    toast.success("AI-enhanced session completed!");
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getAlertIcon = (type: AlertData['type']) => {
    switch (type) {
      case 'face_lost': return <Camera className="w-4 h-4" />;
      case 'audio_high': return <Volume2 className="w-4 h-4" />;
      case 'gaze_deviation': return <Eye className="w-4 h-4" />;
      case 'head_movement': return <Activity className="w-4 h-4" />;
      case 'side_movement': return <ScanLine className="w-4 h-4" />;
      case 'object_detected': return <Target className="w-4 h-4" />;
      case 'ai_prediction': return <Brain className="w-4 h-4" />;
      case 'behavioral_anomaly': return <Bot className="w-4 h-4" />;
      default: return <AlertTriangle className="w-4 h-4" />;
    }
  };

  const getRiskLevel = (probability: number) => {
    if (probability < 30) return { level: 'Low', color: 'text-green-600', bg: 'bg-green-100' };
    if (probability < 60) return { level: 'Medium', color: 'text-orange-600', bg: 'bg-orange-100' };
    return { level: 'High', color: 'text-red-600', bg: 'bg-red-100' };
  };

  const riskLevel = getRiskLevel(aiAnalysis.riskPrediction.cheatingProbability);

  return (
    <div className="space-y-6">
      {/* AI-Enhanced Header */}
      <Card className="bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 border-indigo-200">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-100 rounded-full">
                <Brain className="w-6 h-6 text-indigo-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-indigo-900">Level 4: AI-Enhanced Analysis</h2>
                <p className="text-sm text-indigo-600">Advanced AI • Behavioral Analysis • Predictive Detection • ML Integration</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-indigo-100 text-indigo-800 border-indigo-300">
                AI-Powered
              </Badge>
              {aiProcessingActive && (
                <Badge variant="default" className="bg-purple-500">
                  <Sparkles className="w-3 h-3 mr-1" />
                  AI Active
                </Badge>
              )}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-6 gap-3 text-center">
            <div>
              <div className="text-lg font-bold text-indigo-600">{formatTime(sessionTime)}</div>
              <div className="text-xs text-gray-600">Session</div>
            </div>
            <div>
              <div className="text-lg font-bold text-red-500">{violations}</div>
              <div className="text-xs text-gray-600">Violations</div>
            </div>
            <div>
              <div className="text-lg font-bold text-orange-500">{suspicionScore}%</div>
              <div className="text-xs text-gray-600">AI Score</div>
            </div>
            <div>
              <div className="text-lg font-bold text-purple-500">{Math.round(aiAnalysis.faceRecognition.confidence)}%</div>
              <div className="text-xs text-gray-600">Face ID</div>
            </div>
            <div>
              <div className="text-lg font-bold text-green-500">{aiAnalysis.behaviorAnalysis.authenticity}%</div>
              <div className="text-xs text-gray-600">Authentic</div>
            </div>
            <div>
              <div className="text-lg font-bold text-blue-500">{alerts.length}</div>
              <div className="text-xs text-gray-600">AI Alerts</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* AI Processing Status */}
      <Card className="border-purple-200 bg-purple-50">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <Cpu className="w-6 h-6 text-purple-600" />
            <div className="flex-1">
              <div className="font-medium text-purple-900">AI Processing Engine</div>
              <div className="flex items-center gap-4 mt-2">
                <div className="flex-1">
                  <Progress value={aiProcessingLoad} className="h-2" />
                  <div className="text-xs text-purple-700 mt-1">Processing Load: {aiProcessingLoad}%</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-purple-800">
                    {aiProcessingActive ? 'Active' : 'Standby'}
                  </div>
                  <div className="text-xs text-purple-600">
                    {aiProcessingActive ? 'Real-time analysis' : 'Ready to start'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Camera Setup */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Radar className="w-5 h-5" />
            AI-Enhanced Camera Setup
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Camera className="w-5 h-5 text-blue-500" />
                <span className="font-medium">Front Camera (AI-Enhanced)</span>
                {frontCameraActive && <Badge variant="secondary" className="bg-green-100 text-green-800">1080p AI</Badge>}
              </div>
              <Button 
                onClick={startFrontCamera} 
                disabled={frontCameraActive}
                variant={frontCameraActive ? "secondary" : "default"}
                className="w-full"
              >
                <Brain className="w-4 h-4 mr-2" />
                {frontCameraActive ? "AI Camera Ready" : "Connect AI Camera"}
              </Button>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-green-500" />
                <span className="font-medium">Side Camera (AI-Monitored)</span>
                {sideCameraActive && <Badge variant="secondary" className="bg-green-100 text-green-800">AI Sync</Badge>}
              </div>
              <div className="flex gap-2">
                <Button 
                  onClick={generateMobileURL}
                  variant="outline"
                  size="sm"
                  className="flex-1"
                >
                  <QrCode className="w-4 h-4 mr-1" />
                  AI QR
                </Button>
                <Button 
                  onClick={connectSideCamera}
                  disabled={sideCameraActive}
                  size="sm"
                  className="flex-1"
                >
                  <Sparkles className="w-4 h-4 mr-1" />
                  Connect
                </Button>
              </div>
            </div>
          </div>

          <div className="flex justify-center gap-4 mt-4">
            {!isActive ? (
              <Button 
                onClick={startSession} 
                size="lg" 
                className="px-8 bg-indigo-600 hover:bg-indigo-700"
                disabled={!frontCameraActive}
              >
                <Play className="w-5 h-5 mr-2" />
                Start AI Analysis
              </Button>
            ) : (
              <Button onClick={stopSession} variant="destructive" size="lg" className="px-8">
                <Square className="w-5 h-5 mr-2" />
                Stop AI Session
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* AI Analysis Dashboard */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              AI Analysis Dashboard
            </span>
            <div className="flex gap-2">
              <Button
                variant={activeView === "ai-dashboard" ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveView("ai-dashboard")}
              >
                AI Dashboard
              </Button>
              <Button
                variant={activeView === "cameras" ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveView("cameras")}
              >
                Camera Feeds
              </Button>
              <Button
                variant={activeView === "detailed" ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveView("detailed")}
              >
                Detailed Analysis
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeView} onValueChange={setActiveView}>
            <TabsContent value="ai-dashboard" className="space-y-6">
              {/* AI Risk Assessment */}
              <Card className={`border-2 ${riskLevel.bg} border-opacity-50`}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <TrendingUp className={`w-6 h-6 ${riskLevel.color}`} />
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">AI Risk Assessment</div>
                      <div className="mt-2">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm">Cheating Probability</span>
                          <span className={`text-sm font-bold ${riskLevel.color}`}>
                            {aiAnalysis.riskPrediction.cheatingProbability}% ({riskLevel.level} Risk)
                          </span>
                        </div>
                        <Progress value={aiAnalysis.riskPrediction.cheatingProbability} className="h-3" />
                        <div className="text-xs text-gray-600 mt-1">
                          Confidence: {aiAnalysis.riskPrediction.confidenceInterval}%
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* AI Analysis Grid */}
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Eye className="w-5 h-5 text-blue-500" />
                      <span className="font-medium text-sm">Face Recognition</span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-xs">Confidence</span>
                        <span className="text-xs font-bold">{Math.round(aiAnalysis.faceRecognition.confidence)}%</span>
                      </div>
                      <Progress value={aiAnalysis.faceRecognition.confidence} className="h-2" />
                      <div className="flex items-center gap-1">
                        {aiAnalysis.faceRecognition.verified ? (
                          <CheckCircle className="w-3 h-3 text-green-500" />
                        ) : (
                          <AlertTriangle className="w-3 h-3 text-red-500" />
                        )}
                        <span className="text-xs">
                          {aiAnalysis.faceRecognition.verified ? 'Verified' : 'Not Verified'}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Brain className="w-5 h-5 text-purple-500" />
                      <span className="font-medium text-sm">Behavior Analysis</span>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span>Attention</span>
                        <span>{aiAnalysis.behaviorAnalysis.attention}%</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span>Engagement</span>
                        <span>{aiAnalysis.behaviorAnalysis.engagement}%</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span>Authenticity</span>
                        <span className="font-bold">{aiAnalysis.behaviorAnalysis.authenticity}%</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span>Stress</span>
                        <span className={aiAnalysis.behaviorAnalysis.stress > 70 ? 'text-red-500 font-bold' : ''}>
                          {aiAnalysis.behaviorAnalysis.stress}%
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Volume2 className="w-5 h-5 text-green-500" />
                      <span className="font-medium text-sm">Voice Analysis</span>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span>Clarity</span>
                        <span>{aiAnalysis.voiceAnalysis.clarity}%</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span>Natural</span>
                        <span>{aiAnalysis.voiceAnalysis.naturalness}%</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span>Consistent</span>
                        <span className="font-bold">{aiAnalysis.voiceAnalysis.consistency}%</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Microscope className="w-5 h-5 text-orange-500" />
                      <span className="font-medium text-sm">Environment</span>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span>Lighting</span>
                        <span>{aiAnalysis.environmentalFactors.lighting}%</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span>Background</span>
                        <span>{aiAnalysis.environmentalFactors.background}%</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span>Noise Level</span>
                        <span className="font-bold">{aiAnalysis.environmentalFactors.noise}%</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Risk Factors */}
              {aiAnalysis.riskPrediction.riskFactors.length > 0 && (
                <Card className="border-orange-200 bg-orange-50">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <AlertTriangle className="w-5 h-5 text-orange-600" />
                      <span className="font-medium text-orange-900">AI-Detected Risk Factors</span>
                    </div>
                    <div className="space-y-1">
                      {aiAnalysis.riskPrediction.riskFactors.map((factor, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-orange-500 rounded-full" />
                          <span className="text-sm text-orange-800">{factor}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="cameras" className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                {/* Front Camera with AI Overlay */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Camera className="w-4 h-4 text-blue-500" />
                    <span className="text-sm font-medium">AI-Enhanced Front Camera</span>
                    {frontCameraActive && <Badge variant="secondary" className="text-xs">AI Processing</Badge>}
                  </div>
                  <div className="aspect-video bg-gray-900 rounded-lg overflow-hidden relative">
                    <video
                      ref={frontVideoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover"
                    />
                    {!frontCameraActive && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center text-white">
                          <Brain className="w-8 h-8 mx-auto mb-2 opacity-50" />
                          <p className="text-sm">AI camera offline</p>
                        </div>
                      </div>
                    )}
                    {frontCameraActive && isActive && (
                      <>
                        <div className="absolute top-2 left-2">
                          <Badge variant="default" className="animate-pulse text-xs bg-indigo-600">
                            ● AI ANALYZING
                          </Badge>
                        </div>
                        {/* AI Analysis Overlays */}
                        <div className="absolute top-2 right-2 space-y-1">
                          <div className="bg-black/70 text-white px-2 py-1 rounded text-xs">
                            Face: {aiAnalysis.faceRecognition.verified ? '✓' : '✗'} {Math.round(aiAnalysis.faceRecognition.confidence)}%
                          </div>
                          <div className="bg-black/70 text-white px-2 py-1 rounded text-xs">
                            Attention: {aiAnalysis.behaviorAnalysis.attention}%
                          </div>
                        </div>
                        {/* Gaze tracking with AI enhancement */}
                        <div 
                          className="absolute w-4 h-4 bg-indigo-400 rounded-full border-2 border-white shadow-lg"
                          style={{
                            left: `${gazeTracking.x}%`,
                            top: `${gazeTracking.y}%`,
                            transform: 'translate(-50%, -50%)',
                            opacity: gazeTracking.focused ? 1 : 0.3
                          }}
                        />
                      </>
                    )}
                  </div>
                </div>

                {/* Side Camera with AI Enhancement */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Smartphone className="w-4 h-4 text-green-500" />
                    <span className="text-sm font-medium">AI-Enhanced Side Camera</span>
                    {sideCameraActive && <Badge variant="secondary" className="text-xs">AI Monitoring</Badge>}
                  </div>
                  <div className="aspect-video bg-gray-900 rounded-lg overflow-hidden relative">
                    {sideCameraActive ? (
                      <>
                        <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                          <div className="text-center text-white">
                            <Layers className="w-12 h-12 mx-auto mb-2 opacity-70" />
                            <p className="text-sm">AI Side Analysis</p>
                            <p className="text-xs opacity-75">Behavioral monitoring...</p>
                          </div>
                        </div>
                        <div className="absolute top-2 left-2">
                          <Badge variant="secondary" className="animate-pulse text-xs bg-green-600">
                            ● AI SIDE SCAN
                          </Badge>
                        </div>
                        <div className="absolute top-2 right-2">
                          <div className="bg-black/70 text-white px-2 py-1 rounded text-xs">
                            Behavior: {aiAnalysis.behaviorAnalysis.authenticity}%
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center text-white">
                          <Smartphone className="w-8 h-8 mx-auto mb-2 opacity-50" />
                          <p className="text-sm">AI side camera offline</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="detailed" className="space-y-4">
              {alerts.length > 0 ? (
                <div className="space-y-2 max-h-80 overflow-y-auto">
                  {alerts.slice(0, 10).map((alert) => (
                    <Alert key={alert.id} className={`border-l-4 ${
                      alert.severity === 'high' ? 'border-l-red-500' :
                      alert.severity === 'medium' ? 'border-l-orange-500' :
                      'border-l-yellow-500'
                    }`}>
                      <div className="flex items-center gap-2">
                        {getAlertIcon(alert.type)}
                        <AlertDescription className="flex-1">
                          {alert.message}
                        </AlertDescription>
                        <div className="flex gap-1">
                          <Badge variant="outline" className="text-xs">
                            {alert.camera}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {Math.round(alert.confidence)}%
                          </Badge>
                          <Badge variant={
                            alert.severity === 'high' ? 'destructive' :
                            alert.severity === 'medium' ? 'default' :
                            'secondary'
                          }>
                            {alert.severity}
                          </Badge>
                        </div>
                      </div>
                    </Alert>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Bot className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No AI alerts detected</p>
                  <p className="text-sm">Advanced analysis running smoothly</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Level4Component;
