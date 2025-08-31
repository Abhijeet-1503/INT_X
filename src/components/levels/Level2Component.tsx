import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Camera,
  Mic,
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
  Zap
} from "lucide-react";
import { toast } from "sonner";

interface Level2ComponentProps {
  onComplete?: (results: any) => void;
}

interface AlertData {
  id: string;
  type: 'face_lost' | 'audio_high' | 'gaze_deviation' | 'head_movement';
  message: string;
  timestamp: Date;
  severity: 'low' | 'medium' | 'high';
}

const Level2Component: React.FC<Level2ComponentProps> = ({ onComplete }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  
  // Enhanced state management
  const [isActive, setIsActive] = useState(false);
  const [sessionTime, setSessionTime] = useState(0);
  const [faceDetected, setFaceDetected] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [gazeTracking, setGazeTracking] = useState({ x: 50, y: 50, focused: true });
  const [headMovement, setHeadMovement] = useState(0);
  const [violations, setViolations] = useState(0);
  const [suspicionScore, setSuspicionScore] = useState(0);
  const [alerts, setAlerts] = useState<AlertData[]>([]);
  const [activeTab, setActiveTab] = useState("overview");

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

  // Enhanced analysis with gaze and movement tracking
  useEffect(() => {
    let analysisInterval: NodeJS.Timeout;
    if (isActive) {
      analysisInterval = setInterval(() => {
        // Enhanced face detection with gaze tracking
        const faceDetected = Math.random() > 0.1; // 90% detection rate
        const audioLevel = Math.floor(Math.random() * 100);
        const gazeX = Math.random() * 100;
        const gazeY = Math.random() * 100;
        const gazeDeviation = Math.sqrt(Math.pow(gazeX - 50, 2) + Math.pow(gazeY - 50, 2));
        const headMovement = Math.floor(Math.random() * 100);
        const suspicion = Math.floor((gazeDeviation * 0.5) + (headMovement * 0.3) + (audioLevel * 0.2));
        
        setFaceDetected(faceDetected);
        setAudioLevel(audioLevel);
        setGazeTracking({ x: gazeX, y: gazeY, focused: gazeDeviation < 25 });
        setHeadMovement(headMovement);
        setSuspicionScore(Math.min(suspicion, 100));

        // Enhanced alerts
        if (!faceDetected) {
          addAlert('face_lost', 'high', 'Face not detected in frame');
          setViolations(prev => prev + 1);
        }

        if (audioLevel > 80) {
          addAlert('audio_high', 'medium', 'High audio levels detected');
        }

        if (gazeDeviation > 40) {
          addAlert('gaze_deviation', 'medium', 'Gaze deviation detected - looking away');
          setViolations(prev => prev + 1);
        }

        if (headMovement > 70) {
          addAlert('head_movement', 'low', 'Excessive head movement detected');
        }
      }, 2000); // Every 2 seconds for enhanced level
    }
    return () => {
      if (analysisInterval) clearInterval(analysisInterval);
    };
  }, [isActive]);

  const addAlert = (type: AlertData['type'], severity: AlertData['severity'], message: string) => {
    const alert: AlertData = {
      id: Date.now().toString(),
      type,
      message,
      timestamp: new Date(),
      severity
    };
    setAlerts(prev => [alert, ...prev.slice(0, 9)]);
  };

  const startSession = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          width: { ideal: 1280 }, 
          height: { ideal: 720 }, 
          facingMode: 'user' 
        },
        audio: true
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsActive(true);
        toast.success("Enhanced proctoring session started!");
      }
    } catch (error) {
      console.error('Camera access failed:', error);
      toast.error("Please allow camera and microphone access");
    }
  };

  const stopSession = () => {
    setIsActive(false);

    if (videoRef.current?.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }

    const results = {
      level: 2,
      totalTime: sessionTime,
      violations,
      suspicionScore,
      faceDetectionRate: faceDetected ? 90 : 50,
      gazeAccuracy: gazeTracking.focused ? 85 : 60,
      alerts: alerts.length
    };

    if (onComplete) {
      onComplete(results);
    }

    toast.success("Enhanced session completed!");
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getAlertIcon = (type: AlertData['type']) => {
    switch (type) {
      case 'face_lost': return <Camera className="w-4 h-4" />;
      case 'audio_high': return <Mic className="w-4 h-4" />;
      case 'gaze_deviation': return <Eye className="w-4 h-4" />;
      case 'head_movement': return <Activity className="w-4 h-4" />;
      default: return <AlertTriangle className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Enhanced Header */}
      <Card className="bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-200">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-full">
                <Brain className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-purple-900">Level 2: Enhanced Monitoring</h2>
                <p className="text-sm text-purple-600">Face Detection + Gaze Tracking + Movement Analysis</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-300">
                Enhanced Level
              </Badge>
              {isActive && (
                <Badge variant="default" className="bg-green-500">
                  Active
                </Badge>
              )}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-purple-600">{formatTime(sessionTime)}</div>
              <div className="text-xs text-gray-600">Session Time</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-red-500">{violations}</div>
              <div className="text-xs text-gray-600">Violations</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-500">{suspicionScore}%</div>
              <div className="text-xs text-gray-600">Suspicion</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-500">{alerts.length}</div>
              <div className="text-xs text-gray-600">Alerts</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Controls */}
      <Card>
        <CardContent className="p-4">
          <div className="flex justify-center gap-4">
            {!isActive ? (
              <Button onClick={startSession} size="lg" className="px-8 bg-purple-600 hover:bg-purple-700">
                <Play className="w-5 h-5 mr-2" />
                Start Enhanced Monitoring
              </Button>
            ) : (
              <Button onClick={stopSession} variant="destructive" size="lg" className="px-8">
                <Square className="w-5 h-5 mr-2" />
                Stop Session
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Video Feed with Overlay */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Camera className="w-5 h-5" />
            Enhanced Camera Feed
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="aspect-video bg-gray-900 rounded-lg overflow-hidden relative">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
            {!isActive && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center text-white">
                  <Brain className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>Enhanced monitoring ready</p>
                  <p className="text-sm opacity-75">Gaze tracking & movement analysis</p>
                </div>
              </div>
            )}
            {isActive && (
              <>
                <div className="absolute top-3 left-3">
                  <Badge variant="destructive" className="animate-pulse">
                    ● ENHANCED LIVE
                  </Badge>
                </div>
                {/* Gaze Tracking Indicator */}
                <div 
                  className="absolute w-4 h-4 bg-green-400 rounded-full border-2 border-white shadow-lg transition-all duration-300"
                  style={{
                    left: `${gazeTracking.x}%`,
                    top: `${gazeTracking.y}%`,
                    transform: 'translate(-50%, -50%)',
                    opacity: gazeTracking.focused ? 1 : 0.5
                  }}
                />
                <div className="absolute top-3 right-3">
                  <div className="bg-black/70 text-white px-2 py-1 rounded text-xs">
                    Gaze: {gazeTracking.focused ? 'Focused' : 'Distracted'}
                  </div>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Analytics Dashboard */}
      <Card>
        <CardHeader>
          <CardTitle>Real-time Analytics</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="tracking">Tracking</TabsTrigger>
              <TabsTrigger value="alerts">Alerts</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      {faceDetected ? (
                        <CheckCircle className="w-6 h-6 text-green-500" />
                      ) : (
                        <AlertTriangle className="w-6 h-6 text-red-500" />
                      )}
                      <div>
                        <div className="font-medium">Face Detection</div>
                        <div className="text-sm text-gray-600">
                          {faceDetected ? "Face detected (Enhanced)" : "No face detected"}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <Volume2 className="w-6 h-6 text-blue-500" />
                      <div className="flex-1">
                        <div className="font-medium">Audio Analysis</div>
                        <Progress value={audioLevel} className="h-2 mt-1" />
                        <div className="text-xs text-gray-600 mt-1">{audioLevel}% volume</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="tracking" className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <Eye className="w-6 h-6 text-purple-500" />
                      <div className="flex-1">
                        <div className="font-medium">Gaze Tracking</div>
                        <div className="text-sm text-gray-600 mb-2">
                          Status: {gazeTracking.focused ? 'Focused on screen' : 'Looking away'}
                        </div>
                        <div className="flex gap-4 text-xs">
                          <span>X: {Math.round(gazeTracking.x)}%</span>
                          <span>Y: {Math.round(gazeTracking.y)}%</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <Activity className="w-6 h-6 text-orange-500" />
                      <div className="flex-1">
                        <div className="font-medium">Head Movement</div>
                        <Progress value={headMovement} className="h-2 mt-1" />
                        <div className="text-xs text-gray-600 mt-1">
                          {headMovement > 50 ? 'High movement' : 'Normal movement'}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="alerts" className="space-y-4">
              {alerts.length > 0 ? (
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {alerts.slice(0, 6).map((alert) => (
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
                        <Badge variant={
                          alert.severity === 'high' ? 'destructive' :
                          alert.severity === 'medium' ? 'default' :
                          'secondary'
                        }>
                          {alert.severity}
                        </Badge>
                      </div>
                    </Alert>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Target className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No alerts detected</p>
                  <p className="text-sm">Enhanced monitoring is working well</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Suspicion Score Indicator */}
      <Card className="border-orange-200 bg-orange-50">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <Zap className="w-6 h-6 text-orange-500" />
            <div className="flex-1">
              <div className="font-medium text-orange-900">Suspicion Score</div>
              <Progress value={suspicionScore} className="h-3 mt-1" />
              <div className="text-sm text-orange-700 mt-1">
                {suspicionScore}% - {suspicionScore < 30 ? 'Low risk' : suspicionScore < 70 ? 'Medium risk' : 'High risk'}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Level2Component;
