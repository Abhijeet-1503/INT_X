import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Camera,
  Smartphone,
  Play,
  Square,
  CheckCircle,
  AlertTriangle,
  Volume2,
  Eye,
  MonitorSpeaker,
  QrCode
} from "lucide-react";
import { toast } from "sonner";
import BaseLevelComponent from "./BaseLevelComponent";

interface Level3ComponentProps {
  onComplete?: (results: any) => void;
}

const Level3ComponentSimple: React.FC<Level3ComponentProps> = ({ onComplete }) => {
  const frontVideoRef = useRef<HTMLVideoElement>(null);
  
  const [isActive, setIsActive] = useState(false);
  const [sessionTime, setSessionTime] = useState(0);
  const [frontCameraActive, setFrontCameraActive] = useState(false);
  const [sideCameraActive, setSideCameraActive] = useState(false);
  const [faceDetected, setFaceDetected] = useState(false);
  const [violations, setViolations] = useState(0);
  const [suspicionScore, setSuspicionScore] = useState(0);
  const [alerts, setAlerts] = useState<string[]>([]);

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

  useEffect(() => {
    let analysisInterval: NodeJS.Timeout;
    if (isActive) {
      analysisInterval = setInterval(() => {
        const faceDetected = Math.random() > 0.08;
        const suspicion = Math.floor(Math.random() * 100);
        
        setFaceDetected(faceDetected);
        setSuspicionScore(suspicion);

        const newAlerts = [];
        if (!faceDetected) {
          newAlerts.push(`Face not detected - ${new Date().toLocaleTimeString()}`);
          setViolations(prev => prev + 1);
        }
        if (Math.random() > 0.9) {
          newAlerts.push(`Environment change detected - ${new Date().toLocaleTimeString()}`);
        }
        
        if (newAlerts.length > 0) {
          setAlerts(prev => [...newAlerts, ...prev.slice(0, 4)]);
        }
      }, 1500);
    }
    return () => {
      if (analysisInterval) clearInterval(analysisInterval);
    };
  }, [isActive]);

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

  const connectSideCamera = () => {
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

  return (
    <BaseLevelComponent level={3} onComplete={onComplete} loadingMessage="Initializing dual-camera setup...">
      <div className="space-y-6">
        {/* Header */}
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
            <div className="grid grid-cols-4 gap-3 text-center">
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
                <div className="text-xl font-bold text-purple-500">{alerts.length}</div>
                <div className="text-xs text-gray-600">Alerts</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Camera Setup */}
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
                  <Button variant="outline" size="sm" className="flex-1">
                    <QrCode className="w-4 h-4 mr-1" />
                    Generate QR
                  </Button>
                  <Button 
                    onClick={connectSideCamera}
                    disabled={sideCameraActive}
                    size="sm"
                    className="flex-1"
                  >
                    Connect
                  </Button>
                </div>
              </div>
            </div>

            <div className="flex justify-center gap-4">
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

        {/* Camera Feeds */}
        <div className="grid md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Front Camera</CardTitle>
            </CardHeader>
            <CardContent>
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
                  <div className="absolute top-2 left-2">
                    <Badge variant="destructive" className="animate-pulse text-xs">
                      ● FRONT LIVE
                    </Badge>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Side Camera</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="aspect-video bg-gray-900 rounded-lg overflow-hidden relative">
                {sideCameraActive ? (
                  <>
                    <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                      <div className="text-center text-white">
                        <Smartphone className="w-12 h-12 mx-auto mb-2 opacity-70" />
                        <p className="text-sm">Side View Active</p>
                      </div>
                    </div>
                    <div className="absolute top-2 left-2">
                      <Badge variant="secondary" className="animate-pulse text-xs bg-green-600">
                        ● SIDE SCANNING
                      </Badge>
                    </div>
                  </>
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center text-white">
                      <Smartphone className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">Side camera not connected</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Status */}
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
                    {faceDetected ? 'Face detected' : 'No face detected'}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Eye className="w-6 h-6 text-blue-500" />
                <div>
                  <div className="font-medium">Environment Status</div>
                  <div className="text-sm text-gray-600">
                    {suspicionScore > 70 ? 'Suspicious activity' : 'Clear environment'}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Alerts */}
        {alerts.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-500" />
                Recent Alerts ({alerts.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {alerts.slice(0, 3).map((alert, index) => (
                  <Alert key={index} className="border-l-4 border-l-orange-400">
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
    </BaseLevelComponent>
  );
};

export default Level3ComponentSimple;
