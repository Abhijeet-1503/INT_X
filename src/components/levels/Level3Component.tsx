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
  ScanLine
} from "lucide-react";
import { toast } from "sonner";

interface Level3ComponentProps {
  onComplete?: (results: any) => void;
}

interface AlertData {
  id: string;
  type: 'face_lost' | 'audio_high' | 'gaze_deviation' | 'head_movement' | 'side_movement' | 'object_detected';
  message: string;
  timestamp: Date;
  severity: 'low' | 'medium' | 'high';
  camera: 'front' | 'side';
}

// Helper function to generate a cryptographically secure random session ID
function generateSecureSessionId(length = 32) {
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  if (window.crypto && window.crypto.getRandomValues) {
    const values = new Uint32Array(length);
    window.crypto.getRandomValues(values);
    for (let i = 0; i < length; i++) {
      result += charset[values[i] % charset.length];
    }
  } else {
    // Fallback to Math.random() if crypto is not available (very rare in modern browsers)
    for (let i = 0; i < length; i++) {
      result += charset[Math.floor(Math.random() * charset.length)];
    }
  }
  return 'session_' + result;
}

const Level3Component: React.FC<Level3ComponentProps> = ({ onComplete }) => {
  const frontVideoRef = useRef<HTMLVideoElement>(null);
  const sideVideoRef = useRef<HTMLVideoElement>(null);
  
  // Enhanced state management with dual camera
  const [isActive, setIsActive] = useState(false);
  const [sessionTime, setSessionTime] = useState(0);
  const [frontCameraActive, setFrontCameraActive] = useState(false);
  const [sideCameraActive, setSideCameraActive] = useState(false);
  const [mobileConnectionUrl, setMobileConnectionUrl] = useState('');
  const [showQRCode, setShowQRCode] = useState(false);
  const [sideCameraAuthToken, setSideCameraAuthToken] = useState<string | null>(null);
  const [sideCameraAuthInput, setSideCameraAuthInput] = useState('');
  
  // Analysis data
  const [faceDetected, setFaceDetected] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [gazeTracking, setGazeTracking] = useState({ x: 50, y: 50, focused: true });
  const [sideViewAnalysis, setSideViewAnalysis] = useState({ posture: 'good', movement: 0, objects: [] });
  const [environmentScan, setEnvironmentScan] = useState({ suspicious: false, people: 0, devices: 0 });
  const [violations, setViolations] = useState(0);
  const [suspicionScore, setSuspicionScore] = useState(0);

  // Generate QR code URL for mobile connection
  const generateMobileURL = () => {
    const baseUrl = window.location.origin;
    const sessionId = generateSecureSessionId();
    const mobileUrl = `${baseUrl}/mobile-camera/${sessionId}`;
    setMobileConnectionUrl(mobileUrl);
    setShowQRCode(true);
    toast.info("QR code generated for mobile camera connection");
    window.crypto.getRandomValues(array);
    const authToken = Array.from(array, dec => dec.toString(36)).join('');
    setSideCameraAuthToken(authToken);
    const mobileUrl = `${baseUrl}/mobile-camera/${sessionId}?authToken=${authToken}`;
    setMobileConnectionUrl(mobileUrl);
    setShowQRCode(true);
    toast.info("QR code generated for mobile camera connection");
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

  // Dual camera analysis
  useEffect(() => {
    let analysisInterval: NodeJS.Timeout;
    if (isActive && (frontCameraActive || sideCameraActive)) {
      analysisInterval = setInterval(() => {
        // Front camera analysis
        const faceDetected = Math.random() > 0.08; // 92% detection rate
        const audioLevel = Math.floor(Math.random() * 100);
        const gazeX = Math.random() * 100;
        const gazeY = Math.random() * 100;
        const gazeDeviation = Math.sqrt(Math.pow(gazeX - 50, 2) + Math.pow(gazeY - 50, 2));
        
        // Side camera analysis
        const sideMovement = Math.floor(Math.random() * 100);
        const posture = sideMovement > 60 ? 'poor' : sideMovement > 30 ? 'fair' : 'good';
        const suspiciousObjects = Math.random() > 0.9;
        const peopleDetected = Math.random() > 0.95 ? Math.floor(Math.random() * 3) : 0;
        
        // Environment scanning
        const environmentSuspicious = suspiciousObjects || peopleDetected > 0;
        
        setFaceDetected(faceDetected);
        setAudioLevel(audioLevel);
        setGazeTracking({ x: gazeX, y: gazeY, focused: gazeDeviation < 20 });
        setSideViewAnalysis({ 
          posture, 
          movement: sideMovement, 
          objects: suspiciousObjects ? ['phone', 'paper'] : [] 
        });
        setEnvironmentScan({ 
          suspicious: environmentSuspicious, 
          people: peopleDetected, 
          devices: suspiciousObjects ? 1 : 0 
        });

        // Calculate suspicion score from both cameras
        const frontSuspicion = (!faceDetected ? 30 : 0) + (gazeDeviation > 30 ? 20 : 0);
        const sideSuspicion = (sideMovement > 60 ? 25 : 0) + (suspiciousObjects ? 35 : 0) + (peopleDetected * 20);
        const totalSuspicion = Math.min(frontSuspicion + sideSuspicion, 100);
        setSuspicionScore(totalSuspicion);

        // Enhanced alerts from both cameras
        if (!faceDetected) {
          addAlert('face_lost', 'high', 'Face not detected in front camera', 'front');
          setViolations(prev => prev + 1);
        }

        if (gazeDeviation > 35) {
          addAlert('gaze_deviation', 'medium', 'Looking away from screen', 'front');
        }

        if (sideMovement > 70) {
          addAlert('side_movement', 'medium', 'Excessive movement detected in side view', 'side');
        }

        if (suspiciousObjects) {
          addAlert('object_detected', 'high', 'Suspicious objects detected in environment', 'side');
          setViolations(prev => prev + 1);
        }

        if (peopleDetected > 0) {
          addAlert('object_detected', 'high', `${peopleDetected} additional person(s) detected`, 'side');
          setViolations(prev => prev + 1);
        }
      }, 1500); // Every 1.5 seconds for environment scanning
    }
    return () => {
      if (analysisInterval) clearInterval(analysisInterval);
    };
  }, [isActive, frontCameraActive, sideCameraActive]);

  const addAlert = (type: AlertData['type'], severity: AlertData['severity'], message: string, camera: 'front' | 'side') => {
    const alert: AlertData = {
      id: Date.now().toString() + Math.random(),
      type,
      message,
      timestamp: new Date(),
      severity,
      camera
    };
    setAlerts(prev => [alert, ...prev.slice(0, 11)]);
  };

  const startFrontCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          width: { ideal: 1280 }, 
          height: { ideal: 720 }, 
          facingMode: 'user' 
        },
        audio: true
      });

      if (frontVideoRef.current) {
        frontVideoRef.current.srcObject = stream;
        setFrontCameraActive(true);
        toast.success("Front camera connected!");
      }
    } catch (error) {
      console.error('Front camera access failed:', error);
      toast.error("Front camera access failed");
    }
  };

  // Secure side camera connection: require correct auth token
  const connectSideCamera = () => {
    if (!sideCameraAuthToken) {
      toast.error("No authentication token generated. Please generate QR code first.");
      return;
    }
    if (sideCameraAuthInput.trim() !== sideCameraAuthToken) {
      toast.error("Invalid authentication token. Please scan the QR code and enter the correct token.");
      return;
    }
    setSideCameraActive(true);
    toast.success("Side camera connected via mobile device!");
  };

  const startSession = async () => {
    if (!frontCameraActive) {
      await startFrontCamera();
    }
    
    setIsActive(true);
    toast.success("Dual-camera monitoring session started!");
  };

  const stopSession = () => {
    setIsActive(false);

    if (frontVideoRef.current?.srcObject) {
      const tracks = (frontVideoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach(track => track.stop());
      frontVideoRef.current.srcObject = null;
    }

    setFrontCameraActive(false);
    setSideCameraActive(false);

    const results = {
      level: 3,
      totalTime: sessionTime,
      violations,
      suspicionScore,
      frontCameraActive,
      sideCameraActive,
      environmentScanned: true,
      alerts: alerts.length
    };

    if (onComplete) {
      onComplete(results);
    }

    toast.success("Dual-camera session completed!");
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
      default: return <AlertTriangle className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Enhanced Header for Level 3 */}
      <Card className="bg-gradient-to-r from-green-50 to-teal-50 border-green-200">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-full">
                <MonitorSpeaker className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-green-900">Level 3: Environment Scanning</h2>
                <p className="text-sm text-green-600">Dual Camera Setup • Front POV + Side POV • Environment Analysis</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
                Dual Camera
              </Badge>
              {isActive && (
                <Badge variant="default" className="bg-green-500">
                  Scanning
                </Badge>
              )}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-5 gap-3 text-center">
            <div>
              <div className="text-xl font-bold text-green-600">{formatTime(sessionTime)}</div>
              <div className="text-xs text-gray-600">Session</div>
            </div>
            <div>
              <div className="text-xl font-bold text-red-500">{violations}</div>
              <div className="text-xs text-gray-600">Violations</div>
            </div>
            <div>
              <div className="text-xl font-bold text-orange-500">{suspicionScore}%</div>
              <div className="text-xs text-gray-600">Suspicion</div>
            </div>
            <div>
              <div className="text-xl font-bold text-blue-500">{environmentScan.people}</div>
              <div className="text-xs text-gray-600">People</div>
            </div>
            <div>
              <div className="text-xl font-bold text-purple-500">{alerts.length}</div>
              <div className="text-xs text-gray-600">Alerts</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Camera Setup Panel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera className="w-5 h-5" />
            Dual Camera Setup
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Camera className="w-5 h-5 text-blue-500" />
                <span className="font-medium">Front Camera (Laptop)</span>
                {frontCameraActive && <Badge variant="secondary" className="bg-green-100 text-green-800">Connected</Badge>}
              </div>
              <Button 
                onClick={startFrontCamera} 
                disabled={frontCameraActive}
                variant={frontCameraActive ? "secondary" : "default"}
                className="w-full"
              >
                {frontCameraActive ? "Front Camera Ready" : "Connect Front Camera"}
              </Button>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-green-500" />
                <span className="font-medium">Side Camera (Mobile)</span>
                {sideCameraActive && <Badge variant="secondary" className="bg-green-100 text-green-800">Connected</Badge>}
              </div>
              <div className="flex gap-2">
                <Button 
                  onClick={generateMobileURL}
                  variant="outline"
                  size="sm"
                  className="flex-1"
                >
                  <QrCode className="w-4 h-4 mr-1" />
                  Generate QR
                </Button>
                <Button 
                  onClick={connectSideCamera}
                  disabled={sideCameraActive}
                  size="sm"
                  className="flex-1"
                >
                  <Link className="w-4 h-4 mr-1" />
                  Connect
                </Button>
              </div>
              {/* Auth token input for side camera connection */}
              {!sideCameraActive && sideCameraAuthToken && (
                <div className="mt-2">
                  <Label htmlFor="side-auth-token" className="text-xs">Enter Auth Token from QR Code</Label>
                  <Input
                    id="side-auth-token"
                    type="text"
                    value={sideCameraAuthInput}
                    onChange={e => setSideCameraAuthInput(e.target.value)}
                    className="text-xs mt-1"
                    autoComplete="off"
                  />
                </div>
              )}
            </div>
          </div>

          {showQRCode && (
            <div className="p-4 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
              <div className="text-center">
                <div className="w-32 h-32 bg-black mx-auto mb-2 rounded flex items-center justify-center">
                  <QrCode className="w-16 h-16 text-white" />
                </div>
                <p className="text-sm text-gray-600 mb-2">Scan with mobile device</p>
                <Input 
                  value={mobileConnectionUrl} 
                  readOnly 
                  className="text-xs text-center"
                />
                <div className="mt-2 text-xs text-gray-500 break-all">
                  <span className="font-semibold">Auth Token:</span> {sideCameraAuthToken}
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-center gap-4 mt-4">
            {!isActive ? (
              <Button 
                onClick={startSession} 
                size="lg" 
                className="px-8 bg-green-600 hover:bg-green-700"
                disabled={!frontCameraActive}
              >
                <Play className="w-5 h-5 mr-2" />
                Start Environment Scanning
              </Button>
            ) : (
              <Button onClick={stopSession} variant="destructive" size="lg" className="px-8">
                <Square className="w-5 h-5 mr-2" />
                Stop Scanning
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Dual Camera View */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Camera Feeds</span>
            <div className="flex gap-2">
              <Button
                variant={activeView === "dual" ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveView("dual")}
              >
                Dual View
              </Button>
              <Button
                variant={activeView === "front" ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveView("front")}
              >
                Front Only
              </Button>
              <Button
                variant={activeView === "side" ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveView("side")}
              >
                Side Only
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className={`grid gap-4 ${activeView === "dual" ? "md:grid-cols-2" : "grid-cols-1"}`}>
            {/* Front Camera Feed */}
            {(activeView === "dual" || activeView === "front") && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Camera className="w-4 h-4 text-blue-500" />
                  <span className="text-sm font-medium">Front Camera (Primary)</span>
                  {frontCameraActive && <Badge variant="secondary" className="text-xs">Live</Badge>}
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
                        <Camera className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">Front camera offline</p>
                      </div>
                    </div>
                  )}
                  {frontCameraActive && isActive && (
                    <>
                      <div className="absolute top-2 left-2">
                        <Badge variant="destructive" className="animate-pulse text-xs">
                          ● FRONT LIVE
                        </Badge>
                      </div>
                      {/* Gaze indicator */}
                      <div 
                        className="absolute w-3 h-3 bg-blue-400 rounded-full border border-white shadow-lg"
                        style={{
                          left: `${gazeTracking.x}%`,
                          top: `${gazeTracking.y}%`,
                          transform: 'translate(-50%, -50%)',
                          opacity: gazeTracking.focused ? 1 : 0.5
                        }}
                      />
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Side Camera Feed */}
            {(activeView === "dual" || activeView === "side") && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-green-500" />
                  <span className="text-sm font-medium">Side Camera (Mobile)</span>
                  {sideCameraActive && <Badge variant="secondary" className="text-xs">Connected</Badge>}
                </div>
                <div className="aspect-video bg-gray-900 rounded-lg overflow-hidden relative">
                  {sideCameraActive ? (
                    <>
                      <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                        <div className="text-center text-white">
                          <Smartphone className="w-12 h-12 mx-auto mb-2 opacity-70" />
                          <p className="text-sm">Side View Active</p>
                          <p className="text-xs opacity-75">Environment scanning...</p>
                        </div>
                      </div>
                      <div className="absolute top-2 left-2">
                        <Badge variant="secondary" className="animate-pulse text-xs bg-green-600">
                          ● SIDE SCANNING
                        </Badge>
                      </div>
                      {/* Environment indicators */}
                      {environmentScan.suspicious && (
                        <div className="absolute top-2 right-2">
                          <Badge variant="destructive" className="text-xs">
                            Suspicious Activity
                          </Badge>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center text-white">
                        <Smartphone className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">Side camera not connected</p>
                        <p className="text-xs opacity-75">Use QR code to connect mobile</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Environment Analysis Dashboard */}
      <Card>
        <CardHeader>
          <CardTitle>Environment Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="overview">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="front">Front Analysis</TabsTrigger>
              <TabsTrigger value="side">Side Analysis</TabsTrigger>
              <TabsTrigger value="alerts">Alerts</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <div className="grid md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <Eye className="w-6 h-6 text-blue-500" />
                      <div>
                        <div className="font-medium">Gaze Status</div>
                        <div className="text-sm text-gray-600">
                          {gazeTracking.focused ? 'Focused on screen' : 'Looking away'}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <Activity className="w-6 h-6 text-green-500" />
                      <div>
                        <div className="font-medium">Posture</div>
                        <div className="text-sm text-gray-600 capitalize">
                          {sideViewAnalysis.posture} posture
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <Target className="w-6 h-6 text-orange-500" />
                      <div>
                        <div className="font-medium">Environment</div>
                        <div className="text-sm text-gray-600">
                          {environmentScan.suspicious ? 'Suspicious activity' : 'Clear environment'}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="front" className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <CheckCircle className={`w-6 h-6 ${faceDetected ? 'text-green-500' : 'text-red-500'}`} />
                      <div>
                        <div className="font-medium">Face Detection</div>
                        <div className="text-sm text-gray-600">
                          {faceDetected ? 'Face detected' : 'No face detected'}
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
                        <div className="font-medium">Audio Level</div>
                        <Progress value={audioLevel} className="h-2 mt-1" />
                        <div className="text-xs text-gray-600 mt-1">{audioLevel}%</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="side" className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <ScanLine className="w-6 h-6 text-purple-500" />
                      <div className="flex-1">
                        <div className="font-medium">Movement Analysis</div>
                        <Progress value={sideViewAnalysis.movement} className="h-2 mt-1" />
                        <div className="text-xs text-gray-600 mt-1">
                          {sideViewAnalysis.movement}% activity level
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <Wifi className="w-6 h-6 text-green-500" />
                      <div>
                        <div className="font-medium">Objects Detected</div>
                        <div className="text-sm text-gray-600">
                          {sideViewAnalysis.objects.length > 0 ? 
                            sideViewAnalysis.objects.join(', ') : 
                            'No suspicious objects'
                          }
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
                  {alerts.slice(0, 8).map((alert) => (
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
                  <Target className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No alerts detected</p>
                  <p className="text-sm">Environment scanning is clear</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Suspicion Score with Environment Context */}
      <Card className="border-orange-200 bg-orange-50">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <Zap className="w-6 h-6 text-orange-500" />
            <div className="flex-1">
              <div className="font-medium text-orange-900">Environmental Suspicion Score</div>
              <Progress value={suspicionScore} className="h-3 mt-1" />
              <div className="text-sm text-orange-700 mt-1 flex justify-between">
                <span>{suspicionScore}% overall risk</span>
                <span className="text-xs">
                  Front: {Math.round(suspicionScore * 0.6)}% • Side: {Math.round(suspicionScore * 0.4)}%
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Level3Component;
