import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Camera, Mic, User, Shield, AlertTriangle, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { usePythonIntegration } from "@/services/pythonIntegration";

const Level1Proctoring = () => {
  const { user } = useAuth();
  const { startSession, analyzeFrame, endSession, on, off } = usePythonIntegration();
  
  const [cameraActive, setCameraActive] = useState(false);
  const [micActive, setMicActive] = useState(false);
  const [faceDetected, setFaceDetected] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [verificationStatus, setVerificationStatus] = useState<'pending' | 'verified' | 'failed'>('pending');
  const [alerts, setAlerts] = useState<any[]>([]);
  const [suspicionLevel, setSuspicionLevel] = useState(0);
  const [faceInBox, setFaceInBox] = useState(true);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number>();
  const analysisIntervalRef = useRef<NodeJS.Timeout>();

  const initializeSession = useCallback(async () => {
    if (!user) return;

    try {
      const sessionData = {
        studentId: user.id,
        examId: 'demo-exam-001', // In a real app, this would come from props or URL
        level: 1 as const,
        status: 'active' as const,
        suspicionLevel: 0,
        alerts: [],
        metadata: {
          browserInfo: {
            userAgent: navigator.userAgent,
            screenResolution: `${screen.width}x${screen.height}`,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
          },
          deviceInfo: {
            cameraAvailable: !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia),
            microphoneAvailable: !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia),
            screenShareAvailable: !!navigator.mediaDevices?.getDisplayMedia
          }
        }
      };

      const id = await createSession(sessionData);
      setSessionId(id);
    } catch (error) {
      console.error('Failed to initialize session:', error);
      toast.error("Failed to start proctoring session. Please refresh and try again.");
    }
  }, [user]);

  const updateSessionStatus = useCallback(async (updates: Partial<ProctoringSession>) => {
    if (sessionId) {
      try {
        await updateSession(sessionId, updates);
      } catch (error) {
        console.error('Failed to update session:', error);
      }
    }
  }, [sessionId]);

  // Initialize session when component mounts
  useEffect(() => {
    if (user) {
      initializeSession();
    }
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [user, initializeSession]);

  // Update suspicion level in database when it changes
  useEffect(() => {
    if (sessionId && suspicionLevel > 0) {
      updateSessionStatus({ suspicionLevel });
    }
  }, [suspicionLevel, sessionId, updateSessionStatus]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: 640, height: 480 },
        audio: false 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setCameraActive(true);
        
        // Start face detection simulation and monitoring
        setTimeout(() => {
          setFaceDetected(true);
          setVerificationStatus('verified');
          startFaceTracking();
        }, 2000);

        // Update session status
        await updateSessionStatus({ status: 'active' });
      }
    } catch (error) {
      console.error('Camera access failed:', error);
      toast.error("Camera access denied. Please allow camera permissions in your browser settings.");
      addAlert('Camera access denied. Please allow camera permissions.', 'face_not_detected', 'critical');
    }
  };

  const startFaceTracking = () => {
    const trackFace = () => {
      // Simulate face tracking - randomly determine if face is in box
      const inBox = Math.random() > 0.3; // 70% chance face is in box
      setFaceInBox(inBox);
      
      if (!inBox) {
        setSuspicionLevel(prev => Math.min(100, prev + 5));
        if (suspicionLevel > 50) {
          addAlert('Student moved out of detection area. Suspicion level increasing.', 'face_not_detected', 'medium');
        }
      } else {
        setSuspicionLevel(prev => Math.max(0, prev - 2));
      }
      
      if (cameraActive) {
        animationFrameRef.current = requestAnimationFrame(trackFace);
      }
    };
    
    trackFace();
  };

  const startMicrophone = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      audioContextRef.current = new AudioContext();
      analyserRef.current = audioContextRef.current.createAnalyser();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      
      source.connect(analyserRef.current);
      analyserRef.current.fftSize = 256;
      
      setMicActive(true);
      monitorAudio();
    } catch (error) {
      console.error('Microphone access failed:', error);
      toast.error("Microphone access denied. Please allow microphone permissions in your browser settings.");
      addAlert('Microphone access denied. Please allow microphone permissions.', 'audio_anomaly', 'critical');
    }
  };

  const monitorAudio = () => {
    if (!analyserRef.current) return;
    
    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    
    const updateAudioLevel = () => {
      if (analyserRef.current) {
        analyserRef.current.getByteFrequencyData(dataArray);
        const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
        setAudioLevel(Math.round((average / 255) * 100));
        
        // Detect potential external voices (simplified simulation)
        if (average > 50) {
          addAlert('External audio detected. Please ensure you are alone.', 'external_voice', 'high');
        }
        
        requestAnimationFrame(updateAudioLevel);
      }
    };
    
    updateAudioLevel();
  };

  const addAlert = async (message: string, type: AlertType['type'] = 'face_not_detected', severity: AlertType['severity'] = 'low') => {
    if (!sessionId) return;

    try {
      await createAlert({
        sessionId,
        type,
        severity,
        message,
        metadata: {
          suspicionLevel,
          cameraActive,
          micActive,
          faceDetected,
          audioLevel
        }
      });
    } catch (error) {
      console.error('Failed to create alert:', error);
    }
  };

  const stopAll = async () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }
    
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    
    setCameraActive(false);
    setMicActive(false);
    setFaceDetected(false);
    setVerificationStatus('pending');
    setAudioLevel(0);
    setSuspicionLevel(0);
    setFaceInBox(true);

    // Update session status in database
    if (sessionId) {
      await updateSessionStatus({
        status: 'completed',
        suspicionLevel: 0,
        endTime: new Date()
      });
    }
  };

  const getStatusColor = () => {
    switch (verificationStatus) {
      case 'verified': return 'text-green-500';
      case 'failed': return 'text-red-500';
      default: return 'text-yellow-500';
    }
  };

  const getStatusIcon = () => {
    switch (verificationStatus) {
      case 'verified': return <CheckCircle className="w-4 h-4" />;
      case 'failed': return <AlertTriangle className="w-4 h-4" />;
      default: return <Shield className="w-4 h-4" />;
    }
  };

  const getSuspicionColor = () => {
    if (suspicionLevel < 30) return 'text-green-500';
    if (suspicionLevel < 70) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getSuspicionBgColor = () => {
    if (suspicionLevel < 30) return 'bg-green-500';
    if (suspicionLevel < 70) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="text-center mb-8">
        <Badge className="mb-4 bg-primary/10 text-primary border-primary/20" variant="outline">
          Level 1 - Baseline Monitoring
        </Badge>
        <h1 className="text-3xl font-bold mb-2">SmartProctor-X Level 1</h1>
        <p className="text-muted-foreground">
          Camera-based face verification and basic audio monitoring
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Camera Feed */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Camera className="w-5 h-5" />
              Camera Feed & Face Verification
            </CardTitle>
            <CardDescription>
              Verify student identity and monitor face presence
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative bg-muted rounded-lg aspect-video flex items-center justify-center overflow-hidden">
              {cameraActive ? (
                <>
                  <video 
                    ref={videoRef} 
                    autoPlay 
                    muted 
                    playsInline
                    className="w-full h-full object-cover rounded-lg"
                  />
                  
                  {/* Face Detection Box */}
                  {faceDetected && (
                    <div className={`absolute inset-4 border-2 rounded-lg pointer-events-none transition-colors duration-300 ${
                      faceInBox ? 'border-green-400' : 'border-red-400'
                    }`}>
                      <Badge className={`absolute -top-6 left-0 ${
                        faceInBox ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                      }`}>
                        {faceInBox ? 'Face Detected' : 'Face Out of Range'}
                      </Badge>
                    </div>
                  )}
                  
                  {/* Suspicion Meter Overlay */}
                  <div className="absolute top-4 right-4 bg-black/70 p-3 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className={`w-4 h-4 ${getSuspicionColor()}`} />
                      <span className="text-white text-sm font-medium">Suspicion</span>
                    </div>
                    <div className="w-24 bg-gray-700 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-300 ${getSuspicionBgColor()}`}
                        style={{ width: `${suspicionLevel}%` }}
                      ></div>
                    </div>
                    <span className={`text-xs ${getSuspicionColor()}`}>{suspicionLevel}%</span>
                  </div>
                </>
              ) : (
                <div className="text-center">
                  <Camera className="w-12 h-12 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Camera not active</p>
                </div>
              )}
            </div>
            
            <div className="flex items-center justify-between">
              <div className={`flex items-center gap-2 ${getStatusColor()}`}>
                {getStatusIcon()}
                <span className="font-medium">
                  {verificationStatus === 'verified' ? 'Identity Verified' : 
                   verificationStatus === 'failed' ? 'Verification Failed' : 
                   'Pending Verification'}
                </span>
              </div>
              
              <Button 
                onClick={cameraActive ? stopAll : startCamera}
                variant={cameraActive ? "destructive" : "default"}
              >
                {cameraActive ? 'Stop Camera' : 'Start Camera'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Audio Monitor */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mic className="w-5 h-5" />
              Audio Monitoring
            </CardTitle>
            <CardDescription>
              Detect external voices and audio anomalies
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Audio Level</span>
                <span className="text-sm text-muted-foreground">{audioLevel}%</span>
              </div>
              <Progress value={audioLevel} className="h-2" />
            </div>
            
            <div className="p-4 bg-muted rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <User className="w-4 h-4" />
                <span className="font-medium">Status</span>
              </div>
              <p className="text-sm text-muted-foreground">
                {micActive ? 
                  `Monitoring active - Audio level: ${audioLevel > 30 ? 'High' : audioLevel > 10 ? 'Normal' : 'Low'}` :
                  'Audio monitoring not active'
                }
              </p>
            </div>
            
            <Button 
              onClick={micActive ? stopAll : startMicrophone}
              variant={micActive ? "destructive" : "default"}
              className="w-full"
            >
              {micActive ? 'Stop Monitoring' : 'Start Audio Monitoring'}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Alerts Panel */}
      {alerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-orange-500" />
              Security Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {alerts.map((alert, index) => (
                <Alert key={alert.id || index} className="border-orange-200">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>{alert.message}</AlertDescription>
                </Alert>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* System Status */}
      <Card>
        <CardHeader>
          <CardTitle>Level 1 System Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${cameraActive ? 'bg-green-500' : 'bg-gray-300'}`}></div>
              <span className="text-sm">Camera Active</span>
            </div>
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${micActive ? 'bg-green-500' : 'bg-gray-300'}`}></div>
              <span className="text-sm">Audio Monitoring</span>
            </div>
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${faceDetected ? 'bg-green-500' : 'bg-gray-300'}`}></div>
              <span className="text-sm">Face Detection</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Level1Proctoring;
