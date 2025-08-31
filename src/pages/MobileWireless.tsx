import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Camera,
  Smartphone,
  Wifi,
  CheckCircle,
  AlertTriangle,
  Signal,
  Battery,
  Volume2,
  Eye,
  Settings,
  Maximize,
  RotateCcw,
  FlashlightIcon as Flashlight,
  Grid3x3,
  Focus,
  Zap
} from "lucide-react";
import { toast } from "sonner";
import { useParams } from "react-router-dom";

const MobileWireless = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const [isConnected, setIsConnected] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [deviceInfo, setDeviceInfo] = useState({
    battery: 85,
    signal: 92,
    orientation: 'portrait' as 'portrait' | 'landscape',
    resolution: '1080p',
    fps: 30
  });
  const [cameraSettings, setCameraSettings] = useState({
    facingMode: 'environment' as 'user' | 'environment',
    flashlight: false,
    grid: true,
    focus: 'auto' as 'auto' | 'manual',
    quality: 'high' as 'low' | 'medium' | 'high'
  });
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected' | 'error'>('connecting');

  // Initialize mobile camera connection
  useEffect(() => {
    const initializeMobileCamera = async () => {
      try {
        // Get device information
        const userAgent = navigator.userAgent;
        const platform = navigator.platform;
        const screenSize = `${window.screen.width}x${window.screen.height}`;
        
        setDeviceInfo(prev => ({
          ...prev,
          battery: Math.floor(80 + Math.random() * 20),
          signal: Math.floor(85 + Math.random() * 15)
        }));
        
        // Request camera access
        const constraints: MediaStreamConstraints = {
          video: {
            facingMode: cameraSettings.facingMode,
            width: { ideal: 1920, min: 1280 },
            height: { ideal: 1080, min: 720 },
            frameRate: { ideal: 30, min: 15 }
          },
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true
          }
        };
        
        const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
        setStream(mediaStream);
        
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
        
        setConnectionStatus('connected');
        setIsConnected(true);
        toast.success('Mobile camera connected wirelessly!');
        
        // Simulate WebRTC connection to main session
        setTimeout(() => {
          toast.success('Connected to Level 4 session!');
          
          // Send connection confirmation to parent window if opened from QR scan
          if (window.opener) {
            window.opener.postMessage({
              type: 'mobile_connected',
              sessionId,
              deviceInfo: {
                userAgent,
                platform,
                screenSize
              }
            }, '*');
          }
        }, 1000);
        
      } catch (error) {
        console.error('Failed to initialize mobile camera:', error);
        setConnectionStatus('error');
        toast.error('Failed to access mobile camera');
      }
    };
    
    initializeMobileCamera();
    
    // Cleanup on unmount
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [cameraSettings.facingMode]);

  // Handle orientation change
  useEffect(() => {
    const handleOrientationChange = () => {
      const orientation = window.innerHeight > window.innerWidth ? 'portrait' : 'landscape';
      setDeviceInfo(prev => ({ ...prev, orientation }));
    };
    
    window.addEventListener('resize', handleOrientationChange);
    window.addEventListener('orientationchange', handleOrientationChange);
    
    return () => {
      window.removeEventListener('resize', handleOrientationChange);
      window.removeEventListener('orientationchange', handleOrientationChange);
    };
  }, []);

  // Update device status periodically
  useEffect(() => {
    const interval = setInterval(() => {
      setDeviceInfo(prev => ({
        ...prev,
        battery: Math.max(prev.battery - Math.random() * 2, 20),
        signal: Math.floor(80 + Math.random() * 20)
      }));
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);

  const switchCamera = () => {
    setCameraSettings(prev => ({
      ...prev,
      facingMode: prev.facingMode === 'user' ? 'environment' : 'user'
    }));
  };

  const toggleFlashlight = () => {
    setCameraSettings(prev => ({ ...prev, flashlight: !prev.flashlight }));
    // In a real implementation, this would control the device flashlight
    toast.info(`Flashlight ${cameraSettings.flashlight ? 'disabled' : 'enabled'}`);
  };

  const toggleGrid = () => {
    setCameraSettings(prev => ({ ...prev, grid: !prev.grid }));
  };

  const adjustQuality = () => {
    const qualities = ['low', 'medium', 'high'] as const;
    const currentIndex = qualities.indexOf(cameraSettings.quality);
    const nextQuality = qualities[(currentIndex + 1) % qualities.length];
    setCameraSettings(prev => ({ ...prev, quality: nextQuality }));
    toast.info(`Quality set to ${nextQuality}`);
  };

  const getBatteryColor = (level: number) => {
    if (level > 50) return 'text-green-500';
    if (level > 20) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getSignalColor = (strength: number) => {
    if (strength > 80) return 'text-green-500';
    if (strength > 60) return 'text-yellow-500';
    return 'text-red-500';
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Status Bar */}
      <div className="flex justify-between items-center p-2 bg-black/50 text-sm">
        <div className="flex items-center gap-2">
          <Signal className={`w-4 h-4 ${getSignalColor(deviceInfo.signal)}`} />
          <span>{deviceInfo.signal}%</span>
          <Wifi className="w-4 h-4 text-blue-400" />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs">SmartProctor-X Level 4</span>
        </div>
        <div className="flex items-center gap-2">
          <Battery className={`w-4 h-4 ${getBatteryColor(deviceInfo.battery)}`} />
          <span>{Math.round(deviceInfo.battery)}%</span>
        </div>
      </div>

      {/* Main Camera View */}
      <div className="relative flex-1">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-screen object-cover"
        />
        
        {/* Grid Overlay */}
        {cameraSettings.grid && (
          <div className="absolute inset-0 pointer-events-none">
            <div className="w-full h-full grid grid-cols-3 grid-rows-3 gap-0">
              {Array.from({ length: 9 }).map((_, i) => (
                <div key={i} className="border border-white/20" />
              ))}
            </div>
          </div>
        )}
        
        {/* Connection Status */}
        <div className="absolute top-4 left-4">
          <Badge 
            variant="default" 
            className={
              connectionStatus === 'connected' ? 'bg-green-500' :
              connectionStatus === 'connecting' ? 'bg-yellow-500' :
              connectionStatus === 'error' ? 'bg-red-500' :
              'bg-gray-500'
            }
          >
            {connectionStatus === 'connected' && <CheckCircle className="w-3 h-3 mr-1" />}
            {connectionStatus === 'error' && <AlertTriangle className="w-3 h-3 mr-1" />}
            {connectionStatus.toUpperCase()}
          </Badge>
        </div>
        
        {/* Session Info */}
        <div className="absolute top-4 right-4 text-right">
          <div className="bg-black/70 px-2 py-1 rounded text-xs">
            Session: {sessionId?.slice(-8)}
          </div>
          <div className="bg-black/70 px-2 py-1 rounded text-xs mt-1">
            {deviceInfo.resolution} @ {deviceInfo.fps}fps
          </div>
        </div>
        
        {/* Camera Settings */}
        <div className="absolute bottom-20 left-4">
          <div className="flex flex-col gap-2">
            <Badge variant="outline" className="text-xs">
              {cameraSettings.facingMode === 'user' ? 'Front' : 'Back'} Camera
            </Badge>
            <Badge variant="outline" className="text-xs">
              Quality: {cameraSettings.quality.toUpperCase()}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {deviceInfo.orientation.toUpperCase()}
            </Badge>
          </div>
        </div>
        
        {/* AI Analysis Indicators */}
        <div className="absolute bottom-20 right-4">
          <div className="flex flex-col gap-2">
            <div className="bg-black/70 px-2 py-1 rounded text-xs flex items-center gap-1">
              <Eye className="w-3 h-3 text-blue-400" />
              Face: {Math.floor(85 + Math.random() * 15)}%
            </div>
            <div className="bg-black/70 px-2 py-1 rounded text-xs flex items-center gap-1">
              <Volume2 className="w-3 h-3 text-green-400" />
              Audio: Active
            </div>
            <div className="bg-black/70 px-2 py-1 rounded text-xs flex items-center gap-1">
              <Zap className="w-3 h-3 text-purple-400" />
              AI: Processing
            </div>
          </div>
        </div>
      </div>

      {/* Control Panel */}
      <div className="absolute bottom-0 left-0 right-0 bg-black/80 p-4">
        <div className="flex justify-center items-center gap-4">
          {/* Camera Switch */}
          <Button
            onClick={switchCamera}
            variant="outline"
            size="sm"
            className="bg-black/50 border-white/30 text-white hover:bg-white/20"
          >
            <RotateCcw className="w-4 h-4" />
          </Button>
          
          {/* Grid Toggle */}
          <Button
            onClick={toggleGrid}
            variant={cameraSettings.grid ? "default" : "outline"}
            size="sm"
            className="bg-black/50 border-white/30 text-white hover:bg-white/20"
          >
            <Grid3x3 className="w-4 h-4" />
          </Button>
          
          {/* Main Recording Indicator */}
          <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center animate-pulse">
            <div className="w-8 h-8 bg-white rounded-full" />
          </div>
          
          {/* Flashlight Toggle */}
          <Button
            onClick={toggleFlashlight}
            variant={cameraSettings.flashlight ? "default" : "outline"}
            size="sm"
            className="bg-black/50 border-white/30 text-white hover:bg-white/20"
          >
            <Flashlight className="w-4 h-4" />
          </Button>
          
          {/* Quality Adjustment */}
          <Button
            onClick={adjustQuality}
            variant="outline"
            size="sm"
            className="bg-black/50 border-white/30 text-white hover:bg-white/20"
          >
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Connection Alert */}
      {connectionStatus === 'error' && (
        <div className="absolute top-1/2 left-4 right-4 transform -translate-y-1/2">
          <Alert className="bg-red-900/90 border-red-500">
            <AlertTriangle className="w-4 h-4" />
            <AlertDescription className="text-white">
              Failed to connect to Level 4 session. Please check your connection and try again.
            </AlertDescription>
          </Alert>
        </div>
      )}
      
      {/* Instructions */}
      {connectionStatus === 'connected' && (
        <div className="absolute top-16 left-4 right-4">
          <Card className="bg-black/70 border-white/20">
            <CardContent className="p-3">
              <div className="text-white text-sm text-center">
                <p className="font-medium mb-1">Mobile Camera Active</p>
                <p className="text-xs text-gray-300">
                  Your mobile device is now streaming to Level 4 AI analysis.
                  Keep the camera stable and ensure good lighting.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default MobileWireless;
