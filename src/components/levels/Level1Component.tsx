import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Camera,
  Mic,
  Play,
  Square,
  CheckCircle,
  AlertTriangle,
  Volume2
} from "lucide-react";
import { toast } from "sonner";
import LoadingFallback from "../LoadingFallback";

interface Level1ComponentProps {
  onComplete?: (results: any) => void;
}

const Level1Component: React.FC<Level1ComponentProps> = ({ onComplete }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  
  // Basic state management
  const [isLoading, setIsLoading] = useState(true);
  const [isActive, setIsActive] = useState(false);
  const [sessionTime, setSessionTime] = useState(0);
  const [faceDetected, setFaceDetected] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [violations, setViolations] = useState(0);
  const [alerts, setAlerts] = useState<string[]>([]);
  
  // Initialize component
  useEffect(() => {
    const initializeComponent = async () => {
      try {
        // Simulate initialization
        await new Promise(resolve => setTimeout(resolve, 1000));
        setIsLoading(false);
      } catch (error) {
        console.error('Level1Component initialization failed:', error);
        setIsLoading(false);
      }
    };
    
    initializeComponent();
  }, []);

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

  // Basic analysis simulation
  useEffect(() => {
    let analysisInterval: NodeJS.Timeout;
    if (isActive) {
      analysisInterval = setInterval(() => {
        // Simple face detection simulation
        const faceDetected = Math.random() > 0.15; // 85% face detection rate
        const audioLevel = Math.floor(Math.random() * 100);
        
        setFaceDetected(faceDetected);
        setAudioLevel(audioLevel);

        // Basic alerts
        if (!faceDetected) {
          setAlerts(prev => [`Face not detected - ${new Date().toLocaleTimeString()}`, ...prev.slice(0, 4)]);
          setViolations(prev => prev + 1);
        }

        if (audioLevel > 85) {
          setAlerts(prev => [`High audio detected - ${new Date().toLocaleTimeString()}`, ...prev.slice(0, 4)]);
        }
      }, 3000); // Every 3 seconds for basic level
    }
    return () => {
      if (analysisInterval) clearInterval(analysisInterval);
    };
  }, [isActive]);

  const startSession = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: 'user' },
        audio: true
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsActive(true);
        toast.success("Basic proctoring session started!");
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
      level: 1,
      totalTime: sessionTime,
      violations,
      faceDetectionRate: faceDetected ? 85 : 45,
      audioQuality: audioLevel,
      alerts: alerts.length
    };

    if (onComplete) {
      onComplete(results);
    }

    toast.success("Session completed!");
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Show loading state
  if (isLoading) {
    return <LoadingFallback level={1} message="Initializing basic proctoring..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-full">
                <Camera className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-blue-900">Level 1: Basic Monitoring</h2>
                <p className="text-sm text-blue-600">Face Detection & Audio Monitoring</p>
              </div>
            </div>
            <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300">
              Basic Level
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600">{formatTime(sessionTime)}</div>
              <div className="text-xs text-gray-600">Session Time</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-red-500">{violations}</div>
              <div className="text-xs text-gray-600">Violations</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-500">{alerts.length}</div>
              <div className="text-xs text-gray-600">Alerts</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Simple Controls */}
      <Card>
        <CardContent className="p-4">
          <div className="flex justify-center gap-4">
            {!isActive ? (
              <Button onClick={startSession} size="lg" className="px-8">
                <Play className="w-5 h-5 mr-2" />
                Start Monitoring
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

      {/* Video Feed - Simple Layout */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Camera Feed</CardTitle>
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
                  <Camera className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>Click "Start Monitoring" to begin</p>
                </div>
              </div>
            )}
            {isActive && (
              <div className="absolute top-3 left-3">
                <Badge variant="destructive" className="animate-pulse">
                  ● LIVE
                </Badge>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Basic Status Indicators */}
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
                  {faceDetected ? "Face detected in frame" : "No face detected"}
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

      {/* Simple Alerts */}
      {alerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <AlertTriangle className="w-5 h-5 text-orange-500" />
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
  );
};

export default Level1Component;
