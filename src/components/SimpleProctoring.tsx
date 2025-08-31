import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Camera, Mic, Brain, AlertTriangle, CheckCircle, Settings, Play, Pause } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

const SimpleProctoring = ({ level = 1 }: { level?: number }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const [cameraActive, setCameraActive] = useState(false);
  const [audioActive, setAudioActive] = useState(false);
  const [faceDetected, setFaceDetected] = useState(false);
  const [suspicionScore, setSuspicionScore] = useState(0);
  const [violations, setViolations] = useState(0);
  const [sessionTime, setSessionTime] = useState(0);
  const [alerts, setAlerts] = useState<string[]>([]);
  const [audioLevel, setAudioLevel] = useState(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Session timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (cameraActive) {
      interval = setInterval(() => {
        setSessionTime(prev => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [cameraActive]);

  // Simulate real-time analysis
  useEffect(() => {
    let analysisInterval: NodeJS.Timeout;
    if (cameraActive) {
      analysisInterval = setInterval(() => {
        // Simulate AI analysis
        const newScore = Math.floor(Math.random() * 100);
        setSuspicionScore(newScore);
        setFaceDetected(Math.random() > 0.1);
        setAudioLevel(Math.floor(Math.random() * 100));
        
        // Add alerts for high suspicion
        if (newScore > 80) {
          setAlerts(prev => [...prev, `High suspicion detected: ${newScore}%`]);
          setViolations(prev => prev + 1);
        }
      }, 3000);
    }
    return () => {
      if (analysisInterval) clearInterval(analysisInterval);
    };
  }, [cameraActive]);

  const startCamera = async () => {
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
        setCameraActive(true);
        setAudioActive(true);
        setFaceDetected(true);
        toast.success("Camera and microphone started successfully!");
      }
    } catch (error) {
      console.error('Media access failed:', error);
      toast.error("Please allow camera and microphone access to continue");
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
    setAudioActive(false);
    setFaceDetected(false);
    toast.info("Proctoring session ended");
  };

  const analyzeFrame = async () => {
    if (!videoRef.current || !canvasRef.current) return;
    
    setIsAnalyzing(true);
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return;
    
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Simulate AI analysis
    setTimeout(() => {
      const analysisResult = {
        faceDetected: Math.random() > 0.1,
        suspicionScore: Math.floor(Math.random() * 100),
        emotion: ['focused', 'distracted', 'stressed', 'suspicious'][Math.floor(Math.random() * 4)],
        multiplePersons: Math.random() > 0.9
      };
      
      setSuspicionScore(analysisResult.suspicionScore);
      setFaceDetected(analysisResult.faceDetected);
      
      if (analysisResult.multiplePersons) {
        setAlerts(prev => [...prev, 'Multiple persons detected in frame']);
        setViolations(prev => prev + 1);
      }
      
      setIsAnalyzing(false);
      toast.success(`Analysis complete - ${analysisResult.emotion} detected`);
    }, 2000);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getAlertLevel = (score: number) => {
    if (score >= 80) return "critical";
    if (score >= 60) return "high";
    if (score >= 40) return "medium";
    return "low";
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Level {level} Proctoring</h1>
          <p className="text-muted-foreground">AI-powered exam monitoring system</p>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="outline" asChild>
            <Link to="/config">
              <Settings className="w-4 h-4 mr-2" />
              API Config
            </Link>
          </Button>
          <Badge variant={cameraActive ? "default" : "secondary"}>
            {cameraActive ? "Session Active" : "Session Inactive"}
          </Badge>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Camera Feed */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Camera className="w-5 h-5" />
                  Live Camera Feed
                </span>
                <div className="flex items-center gap-2">
                  {faceDetected && <CheckCircle className="w-4 h-4 text-green-500" />}
                  {isAnalyzing && (
                    <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                  )}
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Video Display */}
                <div className="aspect-video bg-black rounded-lg overflow-hidden relative">
                  {cameraActive ? (
                    <>
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className="w-full h-full object-cover"
                      />
                      {/* Face Detection Overlay */}
                      {faceDetected && (
                        <div className="absolute top-4 left-4 bg-green-500/80 text-white px-2 py-1 rounded text-sm">
                          Face Detected
                        </div>
                      )}
                      {/* Suspicion Score Overlay */}
                      <div className={`absolute top-4 right-4 px-2 py-1 rounded text-sm text-white ${
                        suspicionScore > 80 ? 'bg-red-500/80' :
                        suspicionScore > 60 ? 'bg-orange-500/80' :
                        suspicionScore > 40 ? 'bg-yellow-500/80' :
                        'bg-green-500/80'
                      }`}>
                        Suspicion: {suspicionScore}%
                      </div>
                    </>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white">
                      <div className="text-center">
                        <Camera className="w-16 h-16 mx-auto mb-4 opacity-50" />
                        <p className="text-lg mb-2">Camera Not Active</p>
                        <p className="text-sm opacity-75">Click "Start Proctoring" to begin</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Controls */}
                <div className="flex justify-center gap-4">
                  {!cameraActive ? (
                    <Button onClick={startCamera} size="lg" className="bg-green-600 hover:bg-green-700">
                      <Play className="w-4 h-4 mr-2" />
                      Start Proctoring
                    </Button>
                  ) : (
                    <>
                      <Button onClick={stopCamera} variant="destructive" size="lg">
                        <Pause className="w-4 h-4 mr-2" />
                        Stop Session
                      </Button>
                      <Button onClick={analyzeFrame} disabled={isAnalyzing}>
                        <Brain className="w-4 h-4 mr-2" />
                        {isAnalyzing ? 'Analyzing...' : 'AI Analysis'}
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Stats Panel */}
        <div className="space-y-6">
          {/* Session Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Session Statistics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between text-sm">
                  <span>Session Time</span>
                  <span className="font-mono">{formatTime(sessionTime)}</span>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Suspicion Level</span>
                  <span>{suspicionScore}%</span>
                </div>
                <Progress value={suspicionScore} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Audio Level</span>
                  <span>{audioLevel}%</span>
                </div>
                <Progress value={audioLevel} className="h-2" />
              </div>
              <div className="flex justify-between text-sm">
                <span>Violations</span>
                <Badge variant={violations > 0 ? "destructive" : "secondary"}>
                  {violations}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Status Indicators */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">System Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Camera className="w-4 h-4" />
                  Camera
                </span>
                <Badge variant={cameraActive ? "default" : "secondary"}>
                  {cameraActive ? "Active" : "Inactive"}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Mic className="w-4 h-4" />
                  Microphone
                </span>
                <Badge variant={audioActive ? "default" : "secondary"}>
                  {audioActive ? "Active" : "Inactive"}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Brain className="w-4 h-4" />
                  AI Analysis
                </span>
                <Badge variant={faceDetected ? "default" : "secondary"}>
                  {faceDetected ? "Face Detected" : "No Face"}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Recent Alerts */}
          {alerts.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-orange-500" />
                  Recent Alerts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {alerts.slice(-5).map((alert, index) => (
                    <Alert key={index} className="p-2">
                      <AlertDescription className="text-sm">
                        {alert}
                      </AlertDescription>
                    </Alert>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Hidden canvas for frame analysis */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </div>
  );
};

export default SimpleProctoring;



